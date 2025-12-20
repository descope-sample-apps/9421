# HTTP Message Signatures (RFC 9421) Demo & Testing Tool

<div align="center">

## ⚠️ **DEMO/TESTING ONLY - NOT FOR PRODUCTION USE** ⚠️

**This tool accepts public keys from client headers, which is DANGEROUS in production environments.**

**Use this ONLY for:**
- 🧪 Testing HTTP signature implementations
- 📚 Learning RFC 9421 concepts
- 🔍 Debugging signature generation
- 🛠️ Local development and CI/CD testing

**DO NOT use this for:**
- ❌ Production authentication
- ❌ Real API security
- ❌ Sensitive data protection
- ❌ Multi-tenant systems

**Why?** Accepting client-provided public keys defeats the purpose of authentication. In production, the server must control and verify key ownership. [See Production Alternatives](#production-alternatives) for secure implementations.

</div>

---

## Table of Contents

- [What is This?](#what-is-this)
- [Quick Start](#quick-start)
- [Supported Algorithms](#supported-algorithms)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Production Alternatives](#production-alternatives)
- [Development](#development)
- [Resources](#resources)

---

## What is This?

This is a **demo Cloudflare Worker** that verifies HTTP Message Signatures according to [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html). It helps developers:

- ✅ Test their HTTP signature generation code
- ✅ Learn how RFC 9421 signatures work
- ✅ Debug signature verification issues
- ✅ Validate different algorithm implementations

### How It Works

1. You create an HTTP request with a `Signature` and `Signature-Input` header (per RFC 9421)
2. You include your public key in the `x-public-key-pem` header
3. The worker verifies the signature and returns detailed results
4. You get immediate feedback on whether your implementation is correct

### Why This Design is Insecure for Production

**The Security Flaw:**
```
Client → Server: "Here's my request, my signature, AND my public key"
Server: "Your signature matches your public key ✓"
```

This only proves the client can sign with their private key. It **does NOT prove identity** because:
- Anyone can generate a key pair
- Anyone can send their own public key
- There's no trust anchor or key registration

**Production systems need:**
- Server-side key storage (database, KV store, secrets manager)
- Key ownership verification (registration, CA certificates)
- Identity binding (keys linked to authenticated users/services)

---

## Quick Start

### Prerequisites

- `curl` or similar HTTP client
- `openssl` for key generation
- A tool to create HTTP signatures (or use examples below)

### 1. Generate Test Keys

Choose an algorithm and generate a key pair:

**ECDSA P-256 (recommended for testing):**
```bash
# Generate private key
openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem

# Extract public key
openssl ec -in private-key.pem -pubout -out public-key.pem

# View public key (you'll send this in x-public-key-pem header)
cat public-key.pem
```

**ECDSA P-384:**
```bash
openssl ecparam -name secp384r1 -genkey -noout -out private-key.pem
openssl ec -in private-key.pem -pubout -out public-key.pem
```

**Ed25519:**
```bash
openssl genpkey -algorithm ed25519 -out private-key.pem
openssl pkey -in private-key.pem -pubout -out public-key.pem
```

**RSA PSS (2048-bit):**
```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private-key.pem
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

**RSA v1.5 (2048-bit):**
```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private-key.pem
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

**HMAC SHA-256:**
```bash
# Generate a random secret (32 bytes for SHA-256)
openssl rand -base64 32 > hmac-secret.txt
```

### 2. Create a Signed Request

Use a library like [`http-message-signatures`](https://github.com/christianjeller/http-message-sig) to sign your request.

**Example with Node.js:**

```javascript
import { sign } from 'http-message-sig';
import { createPrivateKey } from 'crypto';
import { readFileSync } from 'fs';

// Load your private key
const privateKey = createPrivateKey(readFileSync('private-key.pem'));

// Create a request
const request = new Request('https://your-worker.workers.dev/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-public-key-pem': readFileSync('public-key.pem', 'utf8')
  },
  body: JSON.stringify({ test: 'data' })
});

// Sign the request
await sign(request, {
  privateKey,
  algorithm: 'ecdsa-p256-sha256',
  keyId: 'test-key-1',
  components: ['@method', '@path', '@authority', 'content-type']
});

// Send the signed request
const response = await fetch(request);
const result = await response.json();
console.log(result);
```

### 3. Send Request to Verifier

**Example with curl (manual signature - for illustration):**

```bash
curl -X POST https://your-worker.workers.dev/ \
  -H "Content-Type: application/json" \
  -H "x-public-key-pem: $(cat public-key.pem | tr -d '\n')" \
  -H 'Signature-Input: sig1=("@method" "@path" "@authority" "content-type");created=1618884473;keyid="test-key-1";alg="ecdsa-p256-sha256"' \
  -H 'Signature: sig1=:MEUCIQDzE...:' \
  -d '{"test": "data"}'
```

### 4. Interpret Results

**Success Response (200):**
```json
{
  "verified": true,
  "Signature": "sig1=:MEUCIQDzE...:=",
  "Signature-Input": "sig1=(\"@method\" \"@path\" \"@authority\" \"content-type\");created=1618884473;keyid=\"test-key-1\";alg=\"ecdsa-p256-sha256\"",
  "pemKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
}
```

**Failure Response (400):**
```json
{
  "verified": false,
  "error": "Invalid signature",
  "Signature": "sig1=:MEUCIQDzE...:=",
  "Signature-Input": "sig1=(\"@method\" \"@path\" \"@authority\" \"content-type\");created=1618884473;keyid=\"test-key-1\";alg=\"ecdsa-p256-sha256\"",
  "pemKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
}
```

---

## Supported Algorithms

| Algorithm | RFC 9421 Name | Hash Algorithm | Key Type | Key Size |
|-----------|---------------|----------------|----------|----------|
| **ECDSA P-256** | `ecdsa-p256-sha256` | SHA-256 | Elliptic Curve | 256-bit |
| **ECDSA P-384** | `ecdsa-p384-sha384` | SHA-384 | Elliptic Curve | 384-bit |
| **Ed25519** | `ed25519` | N/A (built-in) | Edwards Curve | 256-bit |
| **RSA PSS** | `rsa-pss-sha512` | SHA-512 | RSA | 2048+ bit |
| **RSA v1.5** | `rsa-v1_5-sha256` | SHA-256 | RSA | 2048+ bit |
| **HMAC** | `hmac-sha256` | SHA-256 | Symmetric | 256+ bit |

### Algorithm Notes

- **ECDSA**: Recommended for most use cases. Fast, small signatures, modern.
- **Ed25519**: Fastest signature verification. No hash algorithm needed (uses built-in SHA-512).
- **RSA PSS**: More secure than RSA v1.5. Use SHA-512 for better security.
- **RSA v1.5**: Legacy algorithm. Use PSS instead for new implementations.
- **HMAC**: Symmetric key algorithm. Both client and server share the same secret.

### Key Generation Quick Reference

See [Quick Start](#1-generate-test-keys) for detailed commands.

---

## API Reference

### Endpoint

```
POST/GET/PUT/DELETE/PATCH https://your-worker.workers.dev/*
```

All HTTP methods are supported. The worker verifies signatures on any request.

### Required Headers

#### `x-public-key-pem`

**⚠️ DEMO-ONLY HEADER - Never use in production!**

The public key in PEM format. Can be provided in two formats:

**Format 1: Multi-line (standard PEM):**
```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----
```

**Format 2: Single-line (URL-safe):**
```
-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE... -----END PUBLIC KEY-----
```

The worker automatically normalizes both formats.

#### `Signature`

RFC 9421 signature header. Format:
```
Signature: <label>=:<base64-signature>:
```

Example:
```
Signature: sig1=:MEUCIQDzE+123abc...:=
```

#### `Signature-Input`

RFC 9421 signature input header describing what was signed. Format:
```
Signature-Input: <label>=(<components>);<parameters>
```

Example:
```
Signature-Input: sig1=("@method" "@path" "@authority" "content-type");created=1618884473;keyid="test-key-1";alg="ecdsa-p256-sha256"
```

**Required parameters:**
- `alg`: Algorithm name (must match [Supported Algorithms](#supported-algorithms))

**Optional parameters:**
- `keyid`: Key identifier (for your reference)
- `created`: Unix timestamp when signature was created
- `expires`: Unix timestamp when signature expires

### Response Schema

#### Success Response (HTTP 200)

```typescript
{
  verified: true,
  Signature: string,        // Echo of your Signature header
  "Signature-Input": string, // Echo of your Signature-Input header
  pemKey: string            // Echo of your public key (for debugging)
}
```

#### Error Response (HTTP 400)

```typescript
{
  verified: false,
  error: string,            // Description of what went wrong
  Signature?: string,       // Echo of your Signature header (if provided)
  "Signature-Input"?: string, // Echo of your Signature-Input header (if provided)
  pemKey?: string           // Echo of your public key (if provided)
}
```

### Example Request/Response

**Request:**
```http
POST / HTTP/1.1
Host: your-worker.workers.dev
Content-Type: application/json
x-public-key-pem: -----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEXYS... -----END PUBLIC KEY-----
Signature-Input: sig1=("@method" "@path" "@authority" "content-type");created=1618884473;keyid="test-key-1";alg="ecdsa-p256-sha256"
Signature: sig1=:MEUCIQDzE+hJKPwXcZKm...:=

{"test": "data"}
```

**Response (Success):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "verified": true,
  "Signature": "sig1=:MEUCIQDzE+hJKPwXcZKm...:=",
  "Signature-Input": "sig1=(\"@method\" \"@path\" \"@authority\" \"content-type\");created=1618884473;keyid=\"test-key-1\";alg=\"ecdsa-p256-sha256\"",
  "pemKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEXYS...\n-----END PUBLIC KEY-----"
}
```

**Response (Missing Public Key):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Missing x-public-key-pem header",
  "message": "Please provide the public key in PEM format via the x-public-key-pem header",
  "example": "x-public-key-pem: -----BEGIN PUBLIC KEY----- MHYwEAYH... -----END PUBLIC KEY-----",
  "keyGenerationCommands": {
    "ecdsa-p256-sha256": [
      "openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem",
      "openssl ec -in private-key.pem -pubout -out public-key.pem"
    ],
    ...
  }
}
```

---

## Troubleshooting

### Error: "Missing x-public-key-pem header"

**Cause:** You didn't include the public key header.

**Solution:** Add the `x-public-key-pem` header with your public key in PEM format:

```bash
curl -H "x-public-key-pem: $(cat public-key.pem | tr -d '\n')" ...
```

### Error: "Failed to parse public key"

**Cause:** The PEM format is invalid or corrupted.

**Common Issues:**
- Missing `-----BEGIN PUBLIC KEY-----` or `-----END PUBLIC KEY-----` markers
- Extra whitespace or special characters
- Wrong key type (private key instead of public key)
- Encoding issues (not UTF-8)

**Solution:**
1. Verify your public key file:
   ```bash
   cat public-key.pem
   openssl pkey -pubin -in public-key.pem -text -noout
   ```

2. Ensure you're sending the **public** key, not the private key:
   ```bash
   # Should start with "-----BEGIN PUBLIC KEY-----"
   head -1 public-key.pem
   ```

3. Try regenerating the key pair

### Error: "Unsupported or missing algorithm"

**Cause:** The `alg` parameter in `Signature-Input` is missing or not supported.

**Solution:** Ensure your `Signature-Input` header includes a supported algorithm:

```
Signature-Input: sig1=(...);alg="ecdsa-p256-sha256"
```

Supported algorithms: `ecdsa-p256-sha256`, `ecdsa-p384-sha384`, `ed25519`, `rsa-pss-sha512`, `rsa-v1_5-sha256`, `hmac-sha256`

### Error: "Invalid signature"

**Cause:** The signature doesn't match the request content.

**Common Issues:**

1. **Wrong components signed:** The components in `Signature-Input` don't match what was actually signed
   ```
   # If you signed: @method, @path, content-type
   # Your Signature-Input must list exactly: "@method" "@path" "content-type"
   ```

2. **Request changed after signing:** Headers or body modified after signature generation

3. **Algorithm mismatch:** Using different algorithm for signing vs. verification

4. **Key mismatch:** Signing with different private key than the public key provided

5. **Timestamp issues:** Signature expired or created in the future

**Debugging Steps:**

1. **Verify key pair matches:**
   ```bash
   # Create test signature with private key
   echo "test" | openssl dgst -sha256 -sign private-key.pem | base64
   
   # Verify with public key
   echo "test" | openssl dgst -sha256 -verify public-key.pem -signature <(echo "..." | base64 -d)
   ```

2. **Check signature generation:** Enable debug logging in your signing library

3. **Verify components:** Ensure signature components match exactly (case-sensitive)

4. **Test with minimal request:** Start with just `@method` and `@path`, then add more components

### Error: "Missing Signature or Signature-Input headers"

**Cause:** Your request is missing required RFC 9421 headers.

**Solution:** Ensure your request includes both headers:

```http
Signature-Input: sig1=("@method" "@path");alg="ecdsa-p256-sha256"
Signature: sig1=:base64-encoded-signature:
```

Use a signing library like `http-message-sig` instead of creating these manually.

### Public Key Format Issues

The worker accepts PEM keys in multiple formats:

**✅ Valid Formats:**

```
# Standard multi-line
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----

# Single-line (base64 concatenated)
-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE... -----END PUBLIC KEY-----

# URL-encoded line breaks
-----BEGIN PUBLIC KEY-----%0AMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...%0A-----END PUBLIC KEY-----
```

**❌ Invalid Formats:**

```
# Missing markers
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...

# Private key (wrong type)
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----

# EC PRIVATE KEY format
-----BEGIN EC PRIVATE KEY-----
...
-----END EC PRIVATE KEY-----
```

### Still Having Issues?

1. **Check the response:** The error message includes your signature headers for debugging
2. **Test with a working example:** Use a known-good signing library
3. **Verify RFC 9421 compliance:** Review the [RFC 9421 specification](https://www.rfc-editor.org/rfc/rfc9421.html)
4. **Check server logs:** If deployed to Cloudflare, check the Workers logs for detailed errors

---

## Production Alternatives

### ⚠️ Why You Can't Use This in Production

This demo tool is **fundamentally insecure** for production because:

1. **No Identity Verification:** Accepting client public keys means anyone can claim any identity
2. **No Key Management:** No registration, rotation, or revocation
3. **Information Disclosure:** Echoing keys and signatures helps attackers
4. **No Rate Limiting:** Vulnerable to abuse
5. **No Audit Trail:** No logging of who signed what

### Adapting This for Production

To make this production-ready, you need to fundamentally change the architecture:

#### 1. **Server-Side Key Storage**

Instead of accepting keys from clients, store them server-side:

**Option A: Cloudflare KV (for small key sets)**
```typescript
// Store keys during registration
await env.KEYS.put(`user:${userId}:public-key`, pemKey);

// Retrieve during verification
const userId = params.keyid; // From Signature-Input header
const pemKey = await env.KEYS.get(`user:${userId}:public-key`);
```

**Option B: Cloudflare D1 (for larger key sets with metadata)**
```typescript
// Query during verification
const result = await env.DB.prepare(
  'SELECT public_key FROM keys WHERE key_id = ? AND active = 1'
).bind(params.keyid).first();
```

**Option C: Environment Variables (for service-to-service)**
```typescript
// In wrangler.toml
[vars]
SERVICE_A_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----..."

// In worker
const pemKey = env.SERVICE_A_PUBLIC_KEY;
```

#### 2. **Key Registration Flow**

```typescript
// POST /register-key
async function registerKey(request: Request, env: Env) {
  // Authenticate the user first!
  const userId = await authenticateUser(request);
  
  const { publicKey, keyId } = await request.json();
  
  // Validate the public key
  try {
    createPublicKey(publicKey);
  } catch (err) {
    return Response.json({ error: 'Invalid public key' }, { status: 400 });
  }
  
  // Store in KV/D1
  await env.KEYS.put(`user:${userId}:key:${keyId}`, publicKey, {
    metadata: { createdAt: Date.now(), userId }
  });
  
  return Response.json({ success: true, keyId });
}
```

#### 3. **Verification with Key Lookup**

```typescript
async function verifyRequest(request: Request, env: Env) {
  await verify(request, async (data, signature, params) => {
    // Look up the key server-side
    const pemKey = await env.KEYS.get(`user:${params.keyid}:public-key`);
    
    if (!pemKey) {
      throw new Error('Unknown key ID');
    }
    
    // Verify ownership (key belongs to authenticated user)
    // Verify not revoked
    // Verify not expired
    
    const publicKey = createPublicKey(pemKey);
    const hashAlgorithm = algorithmMap[params.alg];
    
    const isValid = cryptoVerify(
      hashAlgorithm,
      Buffer.from(data),
      publicKey,
      signature
    );
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
  });
  
  // Don't echo sensitive data in response
  return Response.json({ verified: true });
}
```

#### 4. **Additional Security Measures**

```typescript
// Rate limiting (Cloudflare Workers example)
const rateLimiter = new RateLimit({
  maxRequests: 10,
  windowMs: 60000
});

// Timestamp validation
if (params.created) {
  const age = Date.now() / 1000 - params.created;
  if (age > 300) { // 5 minutes
    throw new Error('Signature too old');
  }
}

// Nonce to prevent replay attacks
const nonceUsed = await env.NONCES.get(params.nonce);
if (nonceUsed) {
  throw new Error('Nonce already used');
}
await env.NONCES.put(params.nonce, '1', { expirationTtl: 300 });

// Audit logging
await logVerification({
  keyId: params.keyid,
  timestamp: Date.now(),
  success: true,
  ip: request.headers.get('CF-Connecting-IP')
});
```

### Production-Ready Alternatives

Instead of adapting this demo, consider these production solutions:

1. **[Cloudflare Access](https://www.cloudflare.com/products/zero-trust/access/)** - Zero Trust authentication
2. **[OAuth 2.0](https://oauth.net/2/)** - Industry-standard authorization
3. **[JWT with RS256](https://jwt.io/)** - Signed JSON Web Tokens
4. **[mTLS](https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/)** - Mutual TLS certificate authentication
5. **[API Gateways](https://developers.cloudflare.com/api-shield/)** - Managed API authentication

### When to Use HTTP Message Signatures in Production

HTTP Message Signatures (RFC 9421) are appropriate for:

- ✅ **Service-to-service authentication** with pre-registered keys
- ✅ **Webhook verification** where sender identity is known
- ✅ **API request signing** with server-side key management
- ✅ **Government/financial systems** requiring non-repudiation

Always with:
- Server-side key storage and validation
- Proper key lifecycle management
- Audit logging and monitoring
- Rate limiting and abuse prevention

---

## Development

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start local dev server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The worker will be available at `http://localhost:8787`

3. **Test locally:**
   ```bash
   # Generate test keys
   openssl ecparam -name prime256v1 -genkey -noout -out test-private.pem
   openssl ec -in test-private.pem -pubout -out test-public.pem
   
   # Use your signing library to test against localhost:8787
   ```

### Deployment

1. **Configure Wrangler:**
   
   Edit `wrangler.jsonc` to set your worker name:
   ```jsonc
   {
     "name": "your-worker-name",
     "main": "src/index.ts",
     "compatibility_date": "2025-12-19"
   }
   ```

2. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   # or
   pnpm deploy
   ```

3. **Test deployment:**
   ```bash
   curl https://your-worker-name.workers.dev/
   ```

### Testing

```bash
npm test
# or
pnpm test
```

### Project Structure

```
.
├── src/
│   └── index.ts          # Main worker code
├── wrangler.jsonc        # Cloudflare Workers configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

### Environment

- **Runtime:** Cloudflare Workers (V8 isolate)
- **Node.js Compatibility:** `nodejs_compat_v2` flag enabled
- **TypeScript:** Fully typed with `@types/node`

---

## Resources

### RFC 9421 Specification

- **[RFC 9421: HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421.html)** - Official specification
- **[RFC Editor](https://www.rfc-editor.org/)** - All RFCs

### Libraries

- **[http-message-sig](https://github.com/christianjeller/http-message-sig)** - Library used by this worker
- **[node:crypto](https://nodejs.org/api/crypto.html)** - Node.js cryptography APIs

### Cloudflare Workers

- **[Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)** - Official documentation
- **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)** - Workers CLI tool
- **[Workers Examples](https://developers.cloudflare.com/workers/examples/)** - Example workers

### Cryptography

- **[OpenSSL Documentation](https://www.openssl.org/docs/)** - OpenSSL reference
- **[Key Management Best Practices](https://www.cloudflare.com/learning/ssl/what-is-a-cryptographic-key/)** - Key security guide

### Learning Resources

- **[HTTP Message Signatures Explained](https://httpsig.org/)** - Tutorial and examples
- **[Digital Signatures 101](https://www.cloudflare.com/learning/ssl/what-is-a-digital-signature/)** - Cryptography basics

---

## License

See [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Remember:** This is a **DEMO TOOL** for learning and testing.

**Never use this pattern in production without implementing proper server-side key management!**

For production use cases, see [Production Alternatives](#production-alternatives).

</div>