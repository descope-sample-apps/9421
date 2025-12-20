# 06. Implement Error Handling and Edge Case Tests

**meta:**
```yaml
id: demo-improvements-06
feature: demo-improvements
priority: P1 (High)
depends_on: [demo-improvements-04]
tags: [testing, error-handling, edge-cases, phase-2]
```

## Objective

Create comprehensive test suite covering error handling, edge cases, PEM format variations, malformed requests, and security boundaries to ensure robust error messages and graceful failure modes.

## Deliverables

- **test/error-handling.spec.ts** - Error cases and edge conditions
- **test/pem-formats.spec.ts** - PEM format variations
- Tests for all error paths in src/index.ts
- Security boundary tests
- Clear error message validation

## Steps

1. **Create test/error-handling.spec.ts**
   - Missing header tests
   - Invalid algorithm tests
   - Malformed signature tests
   - Invalid request structure tests

2. **Test missing x-public-key-pem header**
   ```typescript
   it('should return 400 with helpful error when x-public-key-pem missing', async () => {
     const request = new Request('http://example.com/test', {
       headers: {
         'Signature': 'sig1=:...:',
         'Signature-Input': 'sig1=();alg="ecdsa-p256-sha256"',
       },
     });
     
     const response = await worker.fetch(request, {} as any, {} as any);
     const result = await response.json();
     
     expect(response.status).toBe(400);
     expect(result.error).toContain('Missing x-public-key-pem header');
     expect(result.keyGenerationCommands).toBeDefined(); // Helpful examples
   });
   ```

3. **Test invalid/malformed PEM keys**
   - Empty PEM string
   - Missing BEGIN/END markers
   - Invalid base64 in PEM body
   - Wrong key type (private key instead of public)
   - Truncated PEM data

4. **Test unsupported/missing algorithms**
   ```typescript
   it('should reject unsupported algorithm', async () => {
     // Test with alg="rsa-sha1" (not in algorithmMap)
     // Expect error: "Unsupported or missing algorithm"
   });
   
   it('should reject missing algorithm parameter', async () => {
     // Test with Signature-Input without alg parameter
     // Expect error message
   });
   ```

5. **Test signature verification failures**
   - Wrong signature bytes (corrupted)
   - Signature from different key
   - Signature for different data
   - Empty signature
   - Signature with wrong length

6. **Test Signature header edge cases**
   - Missing Signature header
   - Missing Signature-Input header
   - Malformed Signature header format
   - Multiple signatures (if supported or should error)
   - Empty signature value

7. **Create test/pem-formats.spec.ts**
   - Single-line PEM (no newlines)
   - Multi-line PEM (standard format)
   - PEM with extra whitespace
   - PEM with Windows line endings (\r\n)
   - PEM with mixed line endings

8. **Test PEM normalization logic** (lines 51-56 in src/index.ts)
   ```typescript
   it('should handle single-line PEM format', async () => {
     // Create PEM without newlines: "-----BEGIN PUBLIC KEY-----MHYw...-----END PUBLIC KEY-----"
     // Should normalize and verify successfully
   });
   
   it('should handle standard multi-line PEM format', async () => {
     // Standard PEM with proper line breaks
     // Should verify without modification
   });
   ```

9. **Test security boundaries**
   - Very large PEM keys (DoS attempt)
   - Very large signature values
   - Deeply nested or malformed signature parameters
   - Unusual but valid algorithm combinations

10. **Test error message quality**
    - Verify error messages are descriptive
    - Check that debugging info is included (Signature, Signature-Input echoed back)
    - Ensure no sensitive data leaks in errors
    - Validate JSON structure of error responses

11. **Test HTTP method variations**
    - GET requests (no body)
    - POST requests (with body)
    - PUT, DELETE, PATCH methods
    - HEAD requests
    - OPTIONS requests

12. **Add regression tests**
    - Test known bugs if any were fixed
    - Test edge cases discovered during development
    - Add comments explaining why each test exists

## Tests

**Test Execution:**
```bash
# Run error handling tests
pnpm vitest run test/error-handling.spec.ts

# Run PEM format tests
pnpm vitest run test/pem-formats.spec.ts

# Run all tests with coverage
pnpm test:coverage

# Check error path coverage specifically
pnpm test:coverage --reporter=verbose | grep -A5 "error"
```

**Coverage Goals:**
- [ ] All error paths in src/index.ts are tested
- [ ] PEM normalization logic (lines 51-56) fully covered
- [ ] Algorithm validation (lines 64-66) fully covered
- [ ] Error response formatting (lines 86-96) tested
- [ ] Missing header path (lines 17-43) tested

## Acceptance Criteria

- [ ] test/error-handling.spec.ts exists with ≥10 test cases
- [ ] test/pem-formats.spec.ts exists with ≥5 test cases
- [ ] All error paths in src/index.ts have test coverage
- [ ] Missing x-public-key-pem header is tested
- [ ] Invalid PEM formats are tested (≥3 variations)
- [ ] Unsupported algorithms are tested
- [ ] Signature verification failures are tested
- [ ] Error messages include helpful debugging information
- [ ] All edge case tests pass: `pnpm test:run`
- [ ] Combined with algorithm tests, coverage ≥90%
- [ ] No flaky tests (run 3x, all pass each time)
- [ ] Test execution time <10 seconds total

## Validation

**Commands:**
```bash
# Run all error tests
pnpm vitest run test/error-handling.spec.ts test/pem-formats.spec.ts

# Check error path coverage
pnpm test:coverage --reporter=json | jq '.coverage.functions.pct'  # Should be ≥90

# Count test cases
pnpm vitest run --reporter=verbose | grep -c "✓"  # Should be ≥20 total

# Verify no flaky tests
for i in {1..3}; do pnpm test:run || exit 1; done  # Should pass all 3 times

# Check test execution speed
time pnpm test:run  # Should complete in <10 seconds
```

**Manual Validation:**
1. Review error test coverage report
2. Verify each error message is tested
3. Check that PEM normalization tests cover code paths
4. Ensure edge cases are realistic (not just contrived)
5. Confirm error responses include useful debugging info

## Notes

**Error Handling Test Template:**
```typescript
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Error Handling', () => {
  
  describe('Missing Headers', () => {
    it('should return 400 when x-public-key-pem is missing', async () => {
      const request = new Request('http://example.com/test');
      const response = await worker.fetch(request, {} as any, {} as any);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Missing x-public-key-pem header');
      expect(result.message).toContain('Please provide the public key');
      expect(result.keyGenerationCommands).toBeDefined();
    });
    
    it('should return error when Signature header is missing', async () => {
      // http-message-sig library will throw error
      // Verify appropriate error response
    });
  });
  
  describe('Invalid PEM Formats', () => {
    it('should reject empty PEM string', async () => {
      const request = new Request('http://example.com/test', {
        headers: { 'x-public-key-pem': '' },
      });
      const response = await worker.fetch(request, {} as any, {} as any);
      
      expect(response.status).toBe(400);
      expect(result.error).toContain('Failed to parse public key');
    });
    
    it('should reject PEM without BEGIN marker', async () => {
      const invalidPem = 'MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE...';
      // Test and expect parsing error
    });
  });
  
  describe('Algorithm Validation', () => {
    it('should reject unsupported algorithm', async () => {
      // Create request with alg="rsa-sha1" (not in algorithmMap)
      // Expect: "Unsupported or missing algorithm: rsa-sha1"
    });
  });
  
  describe('Signature Verification Failures', () => {
    it('should reject signature with wrong bytes', async () => {
      // Create valid request but corrupt signature bytes
      // Expect: "Invalid signature"
    });
  });
});
```

**PEM Format Test Template:**
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import worker from '../src/index';

describe('PEM Format Handling', () => {
  let publicKeyPem: string;
  
  beforeAll(() => {
    const { publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    publicKeyPem = publicKey;
  });
  
  it('should accept standard multi-line PEM format', async () => {
    // Use publicKeyPem as-is (has newlines)
    // Should verify successfully
  });
  
  it('should normalize single-line PEM format', async () => {
    // Remove all newlines from publicKeyPem
    const singleLinePem = publicKeyPem.replace(/\n/g, ' ');
    // Should still verify successfully after normalization
  });
  
  it('should handle PEM with Windows line endings', async () => {
    const windowsPem = publicKeyPem.replace(/\n/g, '\r\n');
    // Should verify successfully
  });
  
  it('should handle PEM with extra whitespace', async () => {
    const spacedPem = publicKeyPem.replace(/\n/g, '\n  ');
    // Test normalization handles this
  });
});
```

**Error Scenarios to Test:**

1. **Missing Headers:**
   - No x-public-key-pem
   - No Signature
   - No Signature-Input

2. **Invalid PEM:**
   - Empty string
   - Missing markers
   - Invalid base64
   - Wrong key type
   - Truncated

3. **Algorithm Issues:**
   - Unsupported algorithm
   - Missing algorithm
   - Algorithm mismatch

4. **Signature Issues:**
   - Corrupted bytes
   - Wrong length
   - Wrong key
   - Wrong data

5. **Format Issues:**
   - Malformed headers
   - Invalid base64
   - Unexpected structure

**Testing Best Practices:**
- **Test one thing:** Each test should focus on one error condition
- **Descriptive names:** "should reject empty PEM" not "test PEM"
- **Expect specific errors:** Match error message text
- **Realistic scenarios:** Test errors developers actually encounter
- **Fast execution:** Mock sparingly, use real crypto operations

**References:**
- Vitest Error Testing: https://vitest.dev/api/expect.html#tothrowerror
- RFC 9421 Error Handling: https://www.rfc-editor.org/rfc/rfc9421.html#section-3.2
- PEM Format: https://www.rfc-editor.org/rfc/rfc7468.html
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

**Estimated Time:** 2-3 hours
