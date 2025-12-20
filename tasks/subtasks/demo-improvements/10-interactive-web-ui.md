# 10. Create Simple Web UI for Interactive Testing

**meta:**
```yaml
id: demo-improvements-10
feature: demo-improvements
priority: P2 (Medium)
depends_on: [demo-improvements-01, demo-improvements-09]
tags: [ui, browser, interactive, developer-experience, phase-3, optional]
```

## Objective

Create a simple, single-page web UI that allows developers to interactively test RFC 9421 signature verification without needing curl or programming, making the demo more accessible and educational.

## Deliverables

- **public/index.html** - Single-page web UI
- Interactive form for signature testing
- Algorithm selection dropdown
- Key generation helpers
- Real-time verification results
- Updated README linking to web UI
- Cloudflare Workers configuration to serve static files

## Steps

1. **Create public directory**
   ```bash
   mkdir -p public
   ```

2. **Create public/index.html**
   - Simple, clean HTML/CSS (no frameworks)
   - Mobile-responsive design
   - Clear "DEMO ONLY" warning at top
   - Algorithm selector
   - Text areas for inputs
   - Results display area

3. **Add form fields**
   - Algorithm dropdown (all 6 algorithms)
   - Public key PEM textarea
   - Request URL input
   - Request method dropdown (GET, POST, PUT, DELETE)
   - Request headers textarea (JSON)
   - Request body textarea (optional, for POST/PUT)
   - Signature textarea (output from signing tool)
   - Signature-Input textarea

4. **Add key generation helper**
   - Display OpenSSL commands for selected algorithm
   - Copy-to-clipboard button
   - Link to online key generation tools (optional)

5. **Add signature generation helper**
   - Note that signatures must be generated externally
   - Link to http-message-sig library documentation
   - Show example curl command for signing

6. **Add verification button and logic**
   ```javascript
   async function verifySignature() {
     const response = await fetch('/verify', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'x-public-key-pem': publicKeyPem,
         'Signature': signature,
         'Signature-Input': signatureInput,
       }
     });
     
     const result = await response.json();
     displayResult(result);
   }
   ```

7. **Add results display**
   - Success: Green checkmark + verified data
   - Failure: Red X + error message
   - Display full request/response for debugging

8. **Update src/index.ts to serve static files**
   - Add route handling for root path
   - Serve public/index.html for GET /
   - Keep /verify or main path for POST signature verification
   
   ```typescript
   export default {
     async fetch(request, env, ctx): Promise<Response> {
       const url = new URL(request.url);
       
       // Serve web UI on root
       if (url.pathname === '/' && request.method === 'GET') {
         return new Response(indexHTML, {
           headers: {
             'Content-Type': 'text/html',
             ...getCorsHeaders(),
           },
         });
       }
       
       // Handle CORS preflight
       if (request.method === 'OPTIONS') {
         // ... existing CORS handling
       }
       
       // Signature verification (existing logic)
       // ...
     }
   };
   ```

9. **Embed HTML in worker or use asset binding**
   - Option A: Inline HTML as string constant
   - Option B: Use Cloudflare Workers Assets (if available)
   - For simplicity, inline small HTML file

10. **Add styling**
    - Clean, modern CSS
    - Responsive design (works on mobile)
    - Clear visual hierarchy
    - Syntax highlighting for code blocks (optional)

11. **Add example pre-fills**
    - "Load Example" button
    - Pre-fill form with working example
    - Helps users understand expected format

12. **Update README**
    - Add "Interactive Web UI" section
    - Link to deployed UI
    - Screenshot or GIF (optional)
    - Explain UI usage

## Tests

**Manual Testing:**
1. Start dev server: `pnpm dev`
2. Navigate to http://localhost:8787/
3. Verify UI loads correctly
4. Test form submission with valid data
5. Test form submission with invalid data
6. Verify error messages are clear
7. Test on mobile device/viewport

**Browser Compatibility:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

**UI Functionality:**
- [ ] Algorithm dropdown populates correctly
- [ ] Key generation commands update based on selection
- [ ] Form validation prevents empty submissions
- [ ] Results display correctly for success/failure
- [ ] Copy-to-clipboard works (if implemented)
- [ ] Mobile responsive (test at 375px width)

## Acceptance Criteria

- [ ] public/index.html exists with complete UI
- [ ] GET / returns HTML with CORS headers
- [ ] POST to worker still performs signature verification
- [ ] UI has prominent "DEMO ONLY" warning
- [ ] All 6 algorithms selectable in dropdown
- [ ] Key generation commands shown for selected algorithm
- [ ] Form submits to worker and displays results
- [ ] Success responses show green/positive indicator
- [ ] Error responses show red/negative indicator with message
- [ ] UI is mobile-responsive (≥375px width)
- [ ] UI works without external dependencies (no CDN)
- [ ] README documents web UI with link/screenshot
- [ ] Code is clean and commented

## Validation

**Commands:**
```bash
# Start dev server
pnpm dev

# Open browser to test
open http://localhost:8787/

# Check HTML size (should be reasonable)
wc -c public/index.html  # Should be <50KB for inline version

# Deploy and test
pnpm deploy
# Visit deployed URL in browser
```

**Manual Validation Checklist:**
1. [ ] UI loads without errors
2. [ ] Warning banner is visible
3. [ ] All form fields are present
4. [ ] Algorithm dropdown works
5. [ ] Key commands update on algorithm change
6. [ ] Submit button triggers verification
7. [ ] Results display correctly
8. [ ] Mobile layout is usable
9. [ ] No console errors
10. [ ] CORS headers present (check DevTools)

## Notes

**Minimal HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RFC 9421 HTTP Message Signatures - Demo Tool</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .warning {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .warning h2 { color: #856404; margin-bottom: 10px; }
    label { display: block; margin: 15px 0 5px; font-weight: 600; }
    select, textarea, input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
    }
    textarea { min-height: 100px; resize: vertical; }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 15px;
    }
    button:hover { background: #0056b3; }
    .result {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
    }
    .success { background: #d4edda; border: 1px solid #c3e6cb; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="warning">
    <h2>⚠️ DEMO/TESTING TOOL ONLY</h2>
    <p>This is an educational tool for testing RFC 9421 HTTP Message Signatures. 
       <strong>NOT suitable for production use.</strong></p>
  </div>

  <h1>RFC 9421 Signature Verification</h1>

  <form id="verifyForm">
    <label for="algorithm">Algorithm</label>
    <select id="algorithm" required>
      <option value="ecdsa-p256-sha256">ECDSA P-256 SHA-256</option>
      <option value="ecdsa-p384-sha384">ECDSA P-384 SHA-384</option>
      <option value="ed25519">Ed25519</option>
      <option value="rsa-pss-sha512">RSA-PSS SHA-512</option>
      <option value="rsa-v1_5-sha256">RSA v1.5 SHA-256</option>
      <option value="hmac-sha256">HMAC SHA-256</option>
    </select>

    <div id="keyGenHelp" style="margin: 10px 0; padding: 10px; background: #e7f3ff; border-radius: 4px;">
      <strong>Key Generation:</strong>
      <pre id="keyGenCommands"></pre>
    </div>

    <label for="publicKey">Public Key (PEM)</label>
    <textarea id="publicKey" placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----" required></textarea>

    <label for="signature">Signature Header</label>
    <textarea id="signature" placeholder="sig1=:base64-encoded-signature:" required></textarea>

    <label for="signatureInput">Signature-Input Header</label>
    <textarea id="signatureInput" placeholder='sig1=();created=1234567890;alg="ecdsa-p256-sha256"' required></textarea>

    <button type="submit">Verify Signature</button>
  </form>

  <div id="result"></div>

  <script>
    const keyGenMap = {
      'ecdsa-p256-sha256': `openssl ecparam -name prime256v1 -genkey -noout -out private.pem
openssl ec -in private.pem -pubout -out public.pem`,
      'ecdsa-p384-sha384': `openssl ecparam -name secp384r1 -genkey -noout -out private.pem
openssl ec -in private.pem -pubout -out public.pem`,
      'ed25519': `openssl genpkey -algorithm ed25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem`,
      'rsa-pss-sha512': `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem`,
      'rsa-v1_5-sha256': `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem`,
      'hmac-sha256': `# Generate 256-bit secret
openssl rand -hex 32 > secret.txt`,
    };

    // Update key generation commands on algorithm change
    document.getElementById('algorithm').addEventListener('change', (e) => {
      document.getElementById('keyGenCommands').textContent = keyGenMap[e.target.value];
    });
    
    // Initialize
    document.getElementById('keyGenCommands').textContent = keyGenMap['ecdsa-p256-sha256'];

    // Handle form submission
    document.getElementById('verifyForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const publicKey = document.getElementById('publicKey').value;
      const signature = document.getElementById('signature').value;
      const signatureInput = document.getElementById('signatureInput').value;

      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '<p>Verifying...</p>';

      try {
        const response = await fetch(window.location.origin, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-key-pem': publicKey,
            'Signature': signature,
            'Signature-Input': signatureInput,
          }
        });

        const result = await response.json();
        
        if (result.verified) {
          resultDiv.className = 'result success';
          resultDiv.innerHTML = `
            <h3>✅ Signature Verified</h3>
            <pre>${JSON.stringify(result, null, 2)}</pre>
          `;
        } else {
          resultDiv.className = 'result error';
          resultDiv.innerHTML = `
            <h3>❌ Verification Failed</h3>
            <p><strong>Error:</strong> ${result.error}</p>
            <pre>${JSON.stringify(result, null, 2)}</pre>
          `;
        }
      } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
          <h3>❌ Request Failed</h3>
          <p>${error.message}</p>
        `;
      }
    });
  </script>
</body>
</html>
```

**Embedding HTML in Worker:**
```typescript
// At top of src/index.ts
const indexHTML = `<!DOCTYPE html>...`; // Inline HTML above

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    
    // Serve UI on GET /
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(indexHTML, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          ...getCorsHeaders(),
        },
      });
    }
    
    // Rest of existing signature verification logic...
  }
};
```

**Alternative: External HTML File (requires asset binding):**
```typescript
// wrangler.jsonc - add assets configuration
{
  "assets": {
    "directory": "./public"
  }
}

// Then HTML served automatically by Workers
```

**README Addition:**
```markdown
## Interactive Web UI

Visit the deployed worker URL in your browser for an interactive testing interface:

[https://your-worker.workers.dev/](https://your-worker.workers.dev/)

The web UI provides:
- Algorithm selection
- Key generation commands
- Interactive signature verification
- Real-time results display
- Copy-paste testing (no coding required)

Perfect for:
- Quick signature testing
- Learning RFC 9421
- Debugging signature issues
- Demonstrating to others
```

**Optional Enhancements:**
1. **Load Example button** - Pre-fill with working example
2. **Copy to clipboard** - For key generation commands
3. **Signature base display** - Show computed signature base
4. **Request preview** - Show what will be sent
5. **Dark mode toggle** - For accessibility
6. **Local storage** - Save form state
7. **Multiple signatures** - Test batch verification

**Accessibility Considerations:**
- Use semantic HTML (`<label>`, `<button>`, etc.)
- Ensure sufficient color contrast
- Add ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly

**Performance:**
- Inline HTML should be <50KB
- No external dependencies (offline-capable)
- Minimal JavaScript (vanilla, no frameworks)
- Fast load time (<500ms)

**Dependencies:**
- Task 01 (README): Documents web UI usage
- Task 09 (CORS): Enables browser-based requests

**Estimated Time:** 1.5-2 hours
