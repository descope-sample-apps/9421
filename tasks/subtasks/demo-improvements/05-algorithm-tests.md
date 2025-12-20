# 05. Implement Algorithm Verification Test Suite

**meta:**
```yaml
id: demo-improvements-05
feature: demo-improvements
priority: P1 (High)
depends_on: [demo-improvements-04]
tags: [testing, algorithms, cryptography, phase-2]
```

## Objective

Create comprehensive test suite covering all 6 supported signature algorithms (ECDSA P-256/P-384, EdDSA, RSA-PSS, RSA-v1.5, HMAC) with real cryptographic key generation and signature verification.

## Deliverables

- **test/algorithms.spec.ts** - Algorithm-specific verification tests
- Test coverage for all 6 algorithms in algorithmMap
- Real key generation using Node.js crypto
- Signature generation and verification test cases
- Positive and negative test cases per algorithm

## Steps

1. **Create test file structure**
   ```typescript
   // test/algorithms.spec.ts
   import { describe, it, expect, beforeAll } from 'vitest';
   import worker from '../src/index';
   // Helper imports for crypto operations
   ```

2. **Create test helper functions**
   - `generateKeyPair(algorithm)` - Generate keys for each algorithm
   - `signRequest(request, privateKey, algorithm)` - Create RFC 9421 signature
   - `createTestRequest(method, url, headers, body?)` - Build Request objects
   - `extractPemPublicKey(keyPair)` - Export public key in PEM format

3. **Implement ECDSA P-256 tests**
   ```typescript
   describe('ECDSA P-256 SHA-256', () => {
     let keyPair, publicKeyPem;
     
     beforeAll(() => {
       // Generate test keys
     });
     
     it('should verify valid ECDSA P-256 signature', async () => {
       // Arrange: Create signed request
       // Act: Call worker.fetch()
       // Assert: verified: true
     });
     
     it('should reject invalid ECDSA P-256 signature', async () => {
       // Arrange: Create request with wrong signature
       // Act: Call worker.fetch()
       // Assert: verified: false, error message present
     });
   });
   ```

4. **Implement ECDSA P-384 tests** (similar structure)
   - Generate P-384 keys
   - Test valid signature verification
   - Test invalid signature rejection

5. **Implement EdDSA (Ed25519) tests**
   - Generate Ed25519 keys
   - Test valid signature verification
   - Test signature format compatibility
   - Test invalid signature rejection

6. **Implement RSA-PSS SHA-512 tests**
   - Generate 2048-bit RSA keys
   - Test PSS padding mode
   - Test valid signature verification
   - Test invalid signature rejection

7. **Implement RSA-v1.5 SHA-256 tests**
   - Generate 2048-bit RSA keys
   - Test PKCS#1 v1.5 padding mode
   - Test valid signature verification
   - Test invalid signature rejection

8. **Implement HMAC-SHA256 tests**
   - Generate shared secret
   - Test symmetric signature verification
   - Note different flow (shared secret vs public key)
   - Test invalid HMAC rejection

9. **Add cross-algorithm tests**
   - Test that ECDSA P-256 signature fails with P-384 key
   - Test that RSA-PSS signature fails with RSA-v1.5 verification
   - Test algorithm mismatch detection

10. **Add PEM format tests**
    - Test normalized PEM (with newlines)
    - Test single-line PEM (header may strip newlines)
    - Test malformed PEM rejection

## Tests

**Test Execution:**
```bash
# Run algorithm tests only
pnpm vitest run test/algorithms.spec.ts

# Run with coverage
pnpm vitest run --coverage test/algorithms.spec.ts

# Watch mode during development
pnpm vitest test/algorithms.spec.ts
```

**Coverage Goals:**
- [ ] All 6 algorithms have ≥2 test cases each
- [ ] Positive (valid signature) test for each algorithm
- [ ] Negative (invalid signature) test for each algorithm
- [ ] PEM format handling tested
- [ ] Algorithm mismatch cases tested

## Acceptance Criteria

- [ ] Test file test/algorithms.spec.ts exists
- [ ] All 6 algorithms have test coverage:
  - ✅ ecdsa-p256-sha256 (≥2 tests)
  - ✅ ecdsa-p384-sha384 (≥2 tests)
  - ✅ ed25519 (≥2 tests)
  - ✅ rsa-pss-sha512 (≥2 tests)
  - ✅ rsa-v1_5-sha256 (≥2 tests)
  - ✅ hmac-sha256 (≥2 tests)
- [ ] Each algorithm has valid signature verification test
- [ ] Each algorithm has invalid signature rejection test
- [ ] PEM normalization is tested (single-line vs multi-line)
- [ ] All tests pass: `pnpm test:run`
- [ ] Code coverage for src/index.ts algorithms section ≥90%
- [ ] Tests use real cryptographic operations (not mocked)
- [ ] Test names clearly describe what is being tested

## Validation

**Commands:**
```bash
# Run tests
pnpm test:run test/algorithms.spec.ts  # Should pass all tests

# Check coverage
pnpm test:coverage  # Should show ≥90% for algorithm verification logic

# Verify test count
pnpm vitest run test/algorithms.spec.ts --reporter=verbose | grep -c "✓"  # Should be ≥14 (2 per algo + extras)

# Check test execution time (should be reasonable)
pnpm vitest run test/algorithms.spec.ts --reporter=verbose  # Should complete <5 seconds
```

**Manual Validation:**
1. Review test output for clear descriptions
2. Verify each algorithm is tested independently
3. Check that error messages are descriptive
4. Ensure no flaky tests (run multiple times)
5. Confirm real crypto operations are used

## Notes

**Test Structure Template:**
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { generateKeyPairSync, createSign, randomBytes } from 'node:crypto';
import { sign as signMessage } from 'http-message-sig';
import worker from '../src/index';

describe('RFC 9421 Algorithm Verification', () => {
  
  describe('ECDSA P-256 SHA-256', () => {
    let publicKeyPem: string;
    let privateKey: any;
    
    beforeAll(() => {
      const { publicKey, privateKey: privKey } = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      publicKeyPem = publicKey;
      privateKey = privKey;
    });
    
    it('should verify valid ECDSA P-256 signature', async () => {
      // Arrange: Create request with valid signature
      const request = new Request('http://example.com/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-public-key-pem': publicKeyPem,
        },
        body: JSON.stringify({ test: 'data' }),
      });
      
      // Sign the request using http-message-sig library
      // (Implementation details depend on library API)
      
      // Act: Verify signature
      const response = await worker.fetch(request, {} as any, {} as any);
      const result = await response.json();
      
      // Assert: Signature should be valid
      expect(response.status).toBe(200);
      expect(result.verified).toBe(true);
    });
    
    it('should reject invalid ECDSA P-256 signature', async () => {
      // Similar structure but with corrupted signature
    });
  });
  
  // Repeat for other algorithms...
});
```

**Key Generation Reference:**
```typescript
// ECDSA P-256
generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

// ECDSA P-384
generateKeyPairSync('ec', { namedCurve: 'secp384r1' });

// Ed25519
generateKeyPairSync('ed25519');

// RSA (for both PSS and v1.5)
generateKeyPairSync('rsa', { modulusLength: 2048 });

// HMAC (shared secret)
randomBytes(32); // 256-bit secret
```

**Signature Generation Notes:**
- Use http-message-sig library's `sign()` function
- Ensure signature base matches RFC 9421 format
- Include required headers: @method, @target-uri, content-type
- Test both GET (no body) and POST (with body) requests

**Common Pitfalls:**
1. **PEM format issues:** Ensure newlines are preserved or normalized
2. **Signature base mismatch:** Component order matters in RFC 9421
3. **Algorithm parameter:** Must match in Signature-Input header
4. **Key type mismatch:** Using wrong key type for algorithm
5. **Async issues:** Remember to await all crypto operations

**Testing Best Practices:**
- **Arrange-Act-Assert pattern:** Clear test structure
- **Descriptive names:** "should verify valid X signature" not "test X"
- **Independent tests:** Each test can run in isolation
- **Real crypto:** No mocking of crypto operations (test actual security)
- **Edge cases:** Test boundary conditions, not just happy path

**References:**
- http-message-sig: https://www.npmjs.com/package/http-message-sig
- Node.js crypto: https://nodejs.org/api/crypto.html
- RFC 9421: https://www.rfc-editor.org/rfc/rfc9421.html
  - Section 2.5: Signature Base
  - Section 3.1: Signature Algorithms
  - Appendix B: Test Cases
- Vitest API: https://vitest.dev/api/

**Estimated Time:** 2-3 hours
