# 02. Add JSDoc Safety Warnings to Code

**meta:**
```yaml
id: demo-improvements-02
feature: demo-improvements
priority: P0 (Critical)
depends_on: [demo-improvements-01]
tags: [documentation, safety, code-comments, phase-1]
```

## Objective

Add JSDoc comments to all functions and key sections in src/index.ts that prominently warn developers this is demo-only code, preventing copy-paste into production while improving code documentation.

## Deliverables

- **src/index.ts** with comprehensive JSDoc comments:
  - File-level warning comment at top
  - JSDoc for default export handler
  - JSDoc for verification callback
  - Inline comments for critical sections (PEM normalization, algorithm validation)
  - References to README.md safety section
  - References to RFC 9421 relevant sections

## Steps

1. **Add file-level warning comment** (lines 1-10)
   - Multi-line comment before imports
   - Clear "DEMO ONLY" warning
   - Reference to README.md for production guidance
   - Brief explanation of what this tool does

2. **Add JSDoc to main fetch handler** (before line 13)
   - @description explaining this is RFC 9421 verification endpoint
   - @warning about demo-only nature
   - @param {Request} request - Incoming HTTP request with Signature headers
   - @param {Env} env - Cloudflare Worker environment (unused in demo)
   - @param {ExecutionContext} ctx - Cloudflare Worker context (unused in demo)
   - @returns {Promise<Response>} JSON response with verification result
   - @see Reference to README.md and RFC 9421
   - @example Basic usage with curl (one-liner or reference README)

3. **Add JSDoc to verify callback function** (before line 47)
   - @description Signature verification callback per RFC 9421
   - @param {string} data - Signature base (RFC 9421 Section 2.5)
   - @param {Uint8Array} signature - Raw signature bytes
   - @param {Parameters} params - Signature parameters including algorithm
   - @throws {Error} Various error types with descriptions
   - @see RFC 9421 Section 3.2 (Signature Verification)

4. **Add inline comments for PEM normalization** (around lines 50-56)
   - Explain why normalization is needed (headers may strip newlines)
   - Reference common issues (base64 without line breaks)
   - Note that production code should validate PEM format more strictly

5. **Add inline comment for algorithm validation** (around lines 64-66)
   - Explain algorithmMap lookup
   - Note that adding algorithms requires updating the map
   - Reference RFC 9421 Section 3.1 for algorithm registry

6. **Add comment to algorithmMap** (before line 4)
   - Explain mapping from RFC algorithm names to Node.js crypto names
   - Note special case for Ed25519 (null = auto-detect)
   - Reference RFC 9421 Appendix A (Algorithm Registry)

7. **Update error message comments** (lines 18-43, 86-96)
   - Brief JSDoc or inline comments explaining error response structure
   - Note that detailed errors are helpful for debugging (demo purpose)
   - Production code should be more cautious about error details

## Tests

**Manual Code Review:**
- [ ] All exported functions have JSDoc
- [ ] All JSDoc blocks include @warning or note about demo nature
- [ ] At least 3 references to RFC 9421 sections
- [ ] File-level warning visible without scrolling
- [ ] TypeScript compilation still works (pnpm run cf-typegen)

**Linting:**
```bash
# If using ESLint with JSDoc plugin
npx eslint src/index.ts

# TypeScript compilation should still pass
pnpm run cf-typegen
```

## Acceptance Criteria

- [ ] File-level warning comment exists in first 15 lines
- [ ] Main fetch handler has complete JSDoc with @warning tag
- [ ] Verify callback has complete JSDoc with @param/@throws
- [ ] At least 3 inline comments explain critical sections
- [ ] Minimum 5 references to RFC 9421 sections across all comments
- [ ] All JSDoc references README.md safety section (e.g., "See README.md#production-warnings")
- [ ] No TypeScript compilation errors introduced
- [ ] Comments are concise (≤3 lines each for inline, ≤15 lines for function JSDoc)

## Validation

**Commands:**
```bash
# Verify JSDoc coverage
grep -c "@description\|@param\|@returns\|@throws\|@warning\|@see" src/index.ts  # Should be ≥10

# Check RFC 9421 references
grep -c "RFC 9421\|rfc9421\|Section" src/index.ts  # Should be ≥5

# Check README references
grep -c "README" src/index.ts  # Should be ≥2

# Ensure TypeScript still compiles
pnpm run cf-typegen  # Should succeed

# Check file size growth (should be reasonable)
wc -l src/index.ts  # Expect ~150-180 lines (was 100)
```

**Manual Review:**
1. Read file top-to-bottom
2. Verify warning is immediately visible
3. Check that all complex sections have explanatory comments
4. Verify RFC section references are accurate
5. Ensure comments don't just restate code (add value)

## Notes

**JSDoc Template for Main Handler:**
```typescript
/**
 * RFC 9421 HTTP Message Signatures Verification Endpoint
 * 
 * ⚠️ **DEMO ONLY** - This is a testing/development tool.
 * See README.md#production-warnings for production requirements.
 * 
 * Verifies HTTP message signatures according to RFC 9421 using public keys
 * provided via the x-public-key-pem header. Supports multiple signature
 * algorithms (ECDSA, EdDSA, RSA-PSS, HMAC).
 * 
 * @param {Request} request - HTTP request with Signature and Signature-Input headers
 * @param {Env} env - Cloudflare Worker environment bindings
 * @param {ExecutionContext} ctx - Cloudflare Worker execution context
 * @returns {Promise<Response>} JSON response with verification result
 * 
 * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html RFC 9421}
 * @see README.md for usage examples
 * 
 * @example
 * // See README.md for complete curl examples with signature generation
 */
```

**JSDoc Template for Verify Callback:**
```typescript
/**
 * Signature verification callback implementing RFC 9421 verification logic.
 * 
 * Parses the provided PEM public key, validates the algorithm, and verifies
 * the signature against the signature base using Node.js crypto.
 * 
 * @param {string} data - Signature base string (RFC 9421 Section 2.5)
 * @param {Uint8Array} signature - Raw signature bytes from Signature header
 * @param {Parameters} params - Signature parameters from Signature-Input header
 * 
 * @throws {Error} If public key parsing fails (invalid PEM format)
 * @throws {Error} If algorithm is unsupported or missing
 * @throws {Error} If signature verification fails
 * 
 * @see {@link https://www.rfc-editor.org/rfc/rfc9421.html#section-3.2 RFC 9421 Section 3.2}
 */
```

**Style Guidelines:**
- Use `/** */` for JSDoc (not `//` or `/* */`)
- Keep @param descriptions under 80 chars
- Use {@link URL text} for external references
- Use @warning or NOTE: for safety warnings
- Don't over-comment obvious code

**References:**
- JSDoc Specification: https://jsdoc.app/
- RFC 9421: https://www.rfc-editor.org/rfc/rfc9421.html
  - Section 2.5: Signature Base
  - Section 3.1: Signature Algorithms
  - Section 3.2: Signature Verification
  - Appendix A: Algorithm Registry
- TypeScript JSDoc Support: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

**Dependency Note:**
This task depends on task 01 (README) because JSDoc comments reference README.md sections. Complete the README first to ensure accurate cross-references.

**Estimated Time:** 45-60 minutes
