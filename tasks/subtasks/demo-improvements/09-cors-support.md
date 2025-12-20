# 09. Add CORS Support for Browser-Based Testing

**meta:**
```yaml
id: demo-improvements-09
feature: demo-improvements
priority: P2 (Medium)
depends_on: [demo-improvements-01]
tags: [cors, browser, developer-experience, phase-3]
```

## Objective

Add CORS (Cross-Origin Resource Sharing) headers to enable browser-based testing tools, allowing developers to test RFC 9421 signatures directly from web applications and interactive demos.

## Deliverables

- **src/index.ts** modified to include CORS headers
- Support for preflight OPTIONS requests
- Configurable allowed origins (demo: allow all)
- Updated README with CORS usage examples

## Steps

1. **Add CORS headers to all responses**
   - Access-Control-Allow-Origin: * (demo allows all)
   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   - Access-Control-Allow-Headers: Content-Type, Signature, Signature-Input, x-public-key-pem
   - Access-Control-Max-Age: 86400 (24 hours)

2. **Create helper function for CORS headers**
   ```typescript
   /**
    * Returns CORS headers for demo/testing purposes.
    * 
    * ⚠️ DEMO ONLY: Allows all origins (*). Production should:
    * - Whitelist specific origins
    * - Use conditional CORS based on request origin
    * - Implement stricter security policies
    * 
    * @returns {HeadersInit} CORS headers to add to responses
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS MDN CORS Documentation}
    */
   function getCorsHeaders(): HeadersInit {
     return {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type, Signature, Signature-Input, x-public-key-pem',
       'Access-Control-Max-Age': '86400',
     };
   }
   ```

3. **Handle OPTIONS preflight requests**
   - Detect OPTIONS method
   - Return 204 No Content with CORS headers
   - Return early (no signature verification)
   ```typescript
   if (request.method === 'OPTIONS') {
     return new Response(null, {
       status: 204,
       headers: getCorsHeaders(),
     });
   }
   ```

4. **Add CORS headers to success response** (200)
   - Spread CORS headers into existing response
   ```typescript
   return Response.json(
     { verified: true, /* ... */ },
     { 
       status: 200,
       headers: getCorsHeaders(),
     }
   );
   ```

5. **Add CORS headers to error responses** (400)
   - Missing header response
   - Verification failure response
   - Ensure consistent CORS across all responses

6. **Add CORS security note to README**
   - Explain that * allows all origins (demo only)
   - Document production CORS best practices
   - Show example of whitelisting origins

7. **Add browser testing example to README**
   - JavaScript fetch() example from browser console
   - Note that CORS enables cross-origin testing
   - Link to browser security considerations

8. **Test CORS with browser**
   - Test preflight OPTIONS request
   - Test actual POST request from browser console
   - Verify headers are present in response

## Tests

**Manual Browser Testing:**
```javascript
// Test in browser console (after deploying worker)
fetch('https://your-worker.workers.dev/', {
  method: 'POST',
  headers: {
    'x-public-key-pem': '-----BEGIN PUBLIC KEY-----...',
    'Signature': 'sig1=:...:',
    'Signature-Input': 'sig1=();alg="ecdsa-p256-sha256"'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Should succeed without CORS error
```

**Automated Tests:**
```typescript
// Add to test/error-handling.spec.ts or new test/cors.spec.ts
describe('CORS Support', () => {
  it('should handle OPTIONS preflight request', async () => {
    const request = new Request('http://example.com/test', {
      method: 'OPTIONS',
    });
    
    const response = await worker.fetch(request, {} as any, {} as any);
    
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Signature');
  });
  
  it('should include CORS headers in success response', async () => {
    // Create valid signed request
    const response = await worker.fetch(request, {} as any, {} as any);
    
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
  
  it('should include CORS headers in error response', async () => {
    const request = new Request('http://example.com/test');
    const response = await worker.fetch(request, {} as any, {} as any);
    
    expect(response.status).toBe(400);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
```

## Acceptance Criteria

- [ ] getCorsHeaders() helper function exists with JSDoc
- [ ] OPTIONS requests return 204 with CORS headers
- [ ] All 200 responses include CORS headers
- [ ] All 400 responses include CORS headers
- [ ] Access-Control-Allow-Origin is set to '*' (demo)
- [ ] Access-Control-Allow-Methods includes POST, GET, OPTIONS
- [ ] Access-Control-Allow-Headers includes Signature, Signature-Input, x-public-key-pem
- [ ] README documents CORS support and browser testing
- [ ] README includes production CORS security warning
- [ ] Tests verify CORS headers on all response types
- [ ] Browser testing example works (manual verification)

## Validation

**Commands:**
```bash
# Test OPTIONS request locally
curl -X OPTIONS http://localhost:8787/ -i | grep -i "access-control"
# Should show CORS headers

# Test POST with CORS headers
curl -X POST http://localhost:8787/ -i | grep -i "access-control"
# Should show CORS headers

# Run CORS tests
pnpm vitest run test/cors.spec.ts  # Should pass

# Deploy and test from browser
pnpm deploy
# Then test in browser console
```

**Manual Validation:**
1. Start local dev server: `pnpm dev`
2. Open browser console on any webpage
3. Run fetch() test (see browser testing example)
4. Verify no CORS errors
5. Check Network tab for CORS headers

**Browser Console Test:**
```javascript
// Replace URL with your deployed worker
fetch('http://localhost:8787/', {
  method: 'OPTIONS'
})
.then(r => {
  console.log('Status:', r.status);
  console.log('CORS headers:');
  console.log('  Allow-Origin:', r.headers.get('Access-Control-Allow-Origin'));
  console.log('  Allow-Methods:', r.headers.get('Access-Control-Allow-Methods'));
  console.log('  Allow-Headers:', r.headers.get('Access-Control-Allow-Headers'));
})
.catch(console.error);

// Expected output:
// Status: 204
// CORS headers:
//   Allow-Origin: *
//   Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
//   Allow-Headers: Content-Type, Signature, Signature-Input, x-public-key-pem
```

## Notes

**Implementation Example:**
```typescript
/**
 * Returns CORS headers for cross-origin browser testing.
 * 
 * ⚠️ DEMO ONLY: Uses wildcard (*) to allow all origins.
 * 
 * Production should:
 * - Whitelist specific origins: `Access-Control-Allow-Origin: https://app.example.com`
 * - Dynamically validate request origin
 * - Use credentials flag carefully
 * - Limit exposed headers
 * 
 * @returns {HeadersInit} CORS headers for Response
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS MDN CORS}
 * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html RFC 9421} (no CORS requirements, this is for demo UX)
 */
function getCorsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Signature, Signature-Input, x-public-key-pem',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    const pemKey = request.headers.get('x-public-key-pem');

    if (!pemKey) {
      return Response.json(
        { error: '...' },
        { 
          status: 400,
          headers: getCorsHeaders(), // Add CORS
        }
      );
    }

    try {
      await verify(request, async (data, signature, params) => {
        // ... verification logic
      });

      return Response.json(
        { verified: true, /* ... */ },
        { 
          status: 200,
          headers: getCorsHeaders(), // Add CORS
        }
      );
    } catch (error) {
      return Response.json(
        { verified: false, /* ... */ },
        { 
          status: 400,
          headers: getCorsHeaders(), // Add CORS
        }
      );
    }
  },
};
```

**README Addition (Browser Testing Section):**
```markdown
## Browser Testing

This demo supports CORS to enable browser-based testing:

```javascript
// Test from any browser console
fetch('https://your-worker.workers.dev/', {
  method: 'POST',
  headers: {
    'x-public-key-pem': 'your-pem-key',
    'Signature': 'sig1=:...:',
    'Signature-Input': 'sig1=();alg="ecdsa-p256-sha256"'
  }
})
.then(r => r.json())
.then(console.log);
```

⚠️ **DEMO ONLY:** This uses `Access-Control-Allow-Origin: *` to allow testing from any origin. Production should whitelist specific origins.
```

**Production CORS Best Practices (for README):**
```markdown
### Production CORS Configuration

For production, implement stricter CORS:

```typescript
// Example: Whitelist specific origins
const allowedOrigins = ['https://app.example.com', 'https://admin.example.com'];

function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin');
  const allowOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type, Signature, Signature-Input',
    'Access-Control-Max-Age': '3600',
  };
}
```
```

**CORS Header Descriptions:**
- **Access-Control-Allow-Origin:** Which origins can access the resource
  - `*` = all origins (demo only)
  - `https://example.com` = specific origin (production)
- **Access-Control-Allow-Methods:** Which HTTP methods are allowed
- **Access-Control-Allow-Headers:** Which request headers are allowed
- **Access-Control-Max-Age:** How long to cache preflight response (seconds)

**Security Considerations:**
1. **Wildcard origin (*) risks:**
   - Allows any website to call your API
   - Cannot be used with credentials
   - Appropriate for public testing endpoints only

2. **Production recommendations:**
   - Whitelist specific origins
   - Validate Origin header
   - Use environment variables for allowed origins
   - Consider Access-Control-Allow-Credentials carefully

3. **Headers to expose (if needed):**
   - Use Access-Control-Expose-Headers for custom response headers
   - Not needed for this demo (all data in JSON body)

**Testing Tools:**
- Browser DevTools Network tab (shows CORS headers)
- curl with `-i` flag (shows all headers)
- Postman/Insomnia (can simulate CORS)
- Online CORS testers

**References:**
- MDN CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- CORS Spec: https://fetch.spec.whatwg.org/#http-cors-protocol
- Cloudflare CORS Guide: https://developers.cloudflare.com/workers/examples/cors-header-proxy/

**Dependencies:**
This task depends on task 01 (README) to document CORS usage and browser testing examples.

**Estimated Time:** 30-45 minutes
