# 08. Add Comprehensive JSDoc with RFC 9421 References

**meta:**
```yaml
id: demo-improvements-08
feature: demo-improvements
priority: P2 (Medium)
depends_on: [demo-improvements-01]
tags: [documentation, jsdoc, developer-experience, phase-3]
```

## Objective

Enhance existing JSDoc comments (added in task 02) with comprehensive RFC 9421 references, type annotations, and detailed parameter documentation to create excellent inline documentation for educational purposes.

## Deliverables

- **src/index.ts** with enhanced JSDoc:
  - Complete type annotations
  - RFC 9421 section references for all relevant code
  - @example blocks with realistic usage
  - @link tags to specification sections
  - Clear @throws documentation
  - Educational notes for learners

## Steps

1. **Review existing JSDoc** (from task 02)
   - Identify areas needing enhancement
   - Check for missing @param/@returns
   - Verify RFC references are accurate

2. **Enhance algorithmMap JSDoc**
   ```typescript
   /**
    * Algorithm mapping from RFC 9421 identifiers to Node.js crypto hash algorithms.
    * 
    * Maps signature algorithm names defined in RFC 9421 Appendix A to the
    * corresponding hash algorithm names used by Node.js crypto.verify().
    * 
    * @constant
    * @type {Record<Algorithm, string | null>}
    * 
    * Special case: Ed25519 uses null (algorithm auto-detected by key type)
    * 
    * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html#appendix-A RFC 9421 Appendix A - Algorithm Registry}
    * @see {@link https://nodejs.org/api/crypto.html#cryptoverifyhash-publickey-signature Node.js crypto.verify()}
    */
   ```

3. **Enhance main fetch handler JSDoc**
   - Add detailed @param descriptions with types
   - Add comprehensive @returns documentation
   - Add @throws for all error cases
   - Add realistic @example with full request/response
   - Reference RFC 9421 Section 2 (HTTP Message Signatures)

4. **Enhance verify callback JSDoc**
   - Document data parameter format (signature base per RFC 9421 Section 2.5)
   - Document signature parameter encoding (base64 to Uint8Array)
   - Document params object structure
   - Add @throws for each error type
   - Reference RFC 9421 Section 3.2 (Verifying a Signature)

5. **Add JSDoc to PEM normalization section**
   ```typescript
   /**
    * Normalize PEM format to handle headers that may strip newlines.
    * 
    * HTTP headers may remove newlines from PEM-encoded keys, resulting in
    * a single-line string. This normalizer ensures proper formatting:
    * - Adds newlines after BEGIN/END markers
    * - Splits base64 body into 64-character lines
    * 
    * @see {@link https://www.rfc-editor.org/rfc/rfc7468.html RFC 7468 - PEM Format}
    */
   ```

6. **Add JSDoc to algorithm validation section**
   ```typescript
   /**
    * Validate algorithm parameter from Signature-Input header.
    * 
    * The 'alg' parameter is required per RFC 9421 Section 2.3 and must
    * match one of the registered algorithms in Appendix A.
    * 
    * @throws {Error} If algorithm is missing or unsupported
    * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html#section-2.3 RFC 9421 Section 2.3}
    */
   ```

7. **Add JSDoc to error response sections**
   - Document missing header response structure
   - Document verification failure response structure
   - Note educational value of detailed errors (vs production)

8. **Add inline documentation for error helper object**
   - Document keyGenerationCommands structure
   - Reference where these commands come from
   - Note that this is demo-friendly (production would differ)

9. **Add type annotations where missing**
   - Ensure all parameters have type information
   - Add return type annotations
   - Use TypeScript utility types where appropriate

10. **Add educational notes**
    - Add comments explaining WHY certain approaches are used
    - Note differences from production implementation
    - Link to relevant RFC sections for learning

## Tests

**Documentation Quality Checks:**
```bash
# Count JSDoc blocks
grep -c "^/\*\*" src/index.ts  # Should be ≥8

# Count RFC references
grep -c "@see.*rfc9421\|RFC 9421" src/index.ts  # Should be ≥10

# Check for @example blocks
grep -c "@example" src/index.ts  # Should be ≥2

# Verify TypeScript compilation (types should help)
pnpm cf-typegen  # Should succeed
```

**Manual Review:**
- [ ] All functions have complete JSDoc
- [ ] All @param have type and description
- [ ] All @returns have type and description
- [ ] All @throws cases documented
- [ ] RFC references are accurate (spot check 3-5)
- [ ] @example blocks are realistic and helpful
- [ ] Educational notes explain concepts clearly

## Acceptance Criteria

- [ ] algorithmMap has comprehensive JSDoc with RFC reference
- [ ] Main fetch handler has ≥15 lines of JSDoc including @example
- [ ] Verify callback has complete @param/@throws documentation
- [ ] PEM normalization has explanatory comment
- [ ] Algorithm validation has RFC section reference
- [ ] Minimum 10 RFC 9421 references across all JSDoc
- [ ] At least 2 @example blocks with realistic code
- [ ] All error cases have @throws documentation
- [ ] Educational notes explain demo vs production differences
- [ ] TypeScript types are complete (no implicit any)
- [ ] JSDoc follows consistent style (tense, format, length)

## Validation

**Commands:**
```bash
# Check JSDoc coverage
npx jsdoc2md src/index.ts 2>/dev/null | wc -l  # Should generate docs (if jsdoc2md installed)

# Count documentation elements
grep -c "@param\|@returns\|@throws\|@see\|@example" src/index.ts  # Should be ≥25

# Verify RFC links (requires connectivity)
grep -o "https://www.rfc-editor.org[^)]*" src/index.ts | while read url; do 
  curl -sI "$url" | grep -q "200 OK" && echo "✓ $url" || echo "✗ $url"
done

# Check TypeScript types
pnpm cf-typegen && echo "✓ Types valid"  # Should succeed

# Verify line count growth (quality docs add lines)
wc -l src/index.ts  # Expect ~180-220 lines (was ~150 after task 02)
```

**Manual Validation:**
1. Read through src/index.ts top to bottom
2. Verify JSDoc appears above each significant section
3. Check that RFC references are specific (include section numbers)
4. Test @example blocks in isolation (copy-paste-verify)
5. Ensure educational tone is maintained
6. Verify no JSDoc typos or broken formatting

## Notes

**Enhanced algorithmMap JSDoc:**
```typescript
/**
 * RFC 9421 signature algorithm to Node.js crypto hash algorithm mapping.
 * 
 * Maps the signature algorithm identifiers defined in RFC 9421 Appendix A
 * to the corresponding hash algorithm names expected by Node.js crypto.verify().
 * 
 * Supported algorithms:
 * - ecdsa-p256-sha256: ECDSA with curve P-256 and SHA-256 hash
 * - ecdsa-p384-sha384: ECDSA with curve P-384 and SHA-384 hash
 * - ed25519: EdDSA with curve Ed25519 (hash built into algorithm)
 * - rsa-pss-sha512: RSA-PSS with SHA-512 hash
 * - rsa-v1_5-sha256: RSA PKCS#1 v1.5 with SHA-256 hash
 * - hmac-sha256: HMAC with SHA-256 hash
 * 
 * @constant
 * @type {Record<Algorithm, string | null>}
 * 
 * @remarks
 * Ed25519 maps to `null` because crypto.verify() auto-detects the hash
 * algorithm from the key type for Ed25519 signatures.
 * 
 * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html#appendix-A RFC 9421 Appendix A - HTTP Signature Algorithms}
 * @see {@link https://nodejs.org/api/crypto.html#cryptoverifyhash-publickey-signature Node.js crypto.verify()}
 */
const algorithmMap: Record<Algorithm, string | null> = { /* ... */ };
```

**Enhanced Main Handler JSDoc:**
```typescript
/**
 * RFC 9421 HTTP Message Signatures verification endpoint.
 * 
 * ⚠️ **DEMO/TESTING ONLY** - Not suitable for production use.
 * See README.md#production-warnings for production requirements.
 * 
 * Verifies HTTP message signatures according to RFC 9421 using public keys
 * provided via the x-public-key-pem header. Supports multiple signature
 * algorithms including ECDSA, EdDSA, RSA-PSS, RSA-v1.5, and HMAC.
 * 
 * The endpoint expects:
 * 1. `Signature` header containing the signature bytes (RFC 9421 Section 4.1)
 * 2. `Signature-Input` header with signature metadata (RFC 9421 Section 4.1)
 * 3. `x-public-key-pem` header with the public key in PEM format
 * 
 * @param {Request} request - Incoming HTTP request with signature headers
 * @param {Env} env - Cloudflare Worker environment bindings (unused in demo)
 * @param {ExecutionContext} ctx - Worker execution context (unused in demo)
 * 
 * @returns {Promise<Response>} JSON response indicating verification result
 *   - Success (200): `{ verified: true, Signature, Signature-Input, pemKey }`
 *   - Failure (400): `{ verified: false, error, Signature, Signature-Input, pemKey }`
 * 
 * @throws Never throws - all errors caught and returned as 400 responses
 * 
 * @example
 * // Using curl with ECDSA P-256 signature
 * // (See README.md for complete examples)
 * 
 * const response = await fetch('https://worker.example.com/', {
 *   method: 'POST',
 *   headers: {
 *     'x-public-key-pem': '-----BEGIN PUBLIC KEY-----\nMHYw...\n-----END PUBLIC KEY-----',
 *     'Signature': 'sig1=:d8hN...:',
 *     'Signature-Input': 'sig1=();created=1618884475;alg="ecdsa-p256-sha256"'
 *   }
 * });
 * 
 * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html RFC 9421 - HTTP Message Signatures}
 * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html#section-3.2 RFC 9421 Section 3.2 - Verifying a Signature}
 * @see README.md for usage examples and production warnings
 */
export default {
  async fetch(request, env, ctx): Promise<Response> { /* ... */ }
}
```

**JSDoc Style Guidelines:**
- **First line:** One-line summary (≤80 chars)
- **Blank line:** Separate summary from details
- **Details:** 2-4 paragraphs explaining context and usage
- **@param:** Type + clear description (what it is, what it contains)
- **@returns:** Type + description of success/failure cases
- **@throws:** List all error types and when they occur
- **@example:** Realistic, runnable code (or reference README)
- **@see:** Links to RFC sections, related docs, external resources
- **@remarks:** Additional notes, caveats, production differences

**Educational Notes to Add:**
```typescript
// EDUCATIONAL NOTE: In production, you would:
// 1. Store public keys in a secure key management system (KMS)
// 2. Implement key rotation and versioning
// 3. Add rate limiting to prevent abuse
// 4. Log all verification attempts for audit
// 5. Validate additional request properties (origin, timestamp, etc.)
// This demo omits these for simplicity.
```

**RFC 9421 Section Reference Guide:**
- **Section 2:** HTTP Message Signatures (overall specification)
- **Section 2.3:** Signature Parameters
- **Section 2.5:** Creating the Signature Base
- **Section 3.1:** Signature Algorithms
- **Section 3.2:** Verifying a Signature
- **Section 4.1:** Signature and Signature-Input HTTP Headers
- **Appendix A:** HTTP Signature Algorithms Registry
- **Appendix B:** Test Cases

**Dependencies:**
This task depends on task 01 (README) because JSDoc should reference README sections for detailed examples and production warnings.

**Estimated Time:** 1-1.5 hours
