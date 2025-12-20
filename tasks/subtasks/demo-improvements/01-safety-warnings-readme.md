# 01. Create Comprehensive README with Demo-Only Warnings

**meta:**
```yaml
id: demo-improvements-01
feature: demo-improvements
priority: P0 (Critical)
depends_on: []
tags: [documentation, safety, phase-1]
```

## Objective

Create a comprehensive README.md that clearly establishes this as a DEMO/TESTING tool with prominent safety warnings, preventing production misuse while providing excellent educational value.

## Deliverables

- **README.md** with complete structure:
  - Prominent "⚠️ DEMO ONLY" warning banner at top
  - Clear purpose statement (educational/testing tool)
  - Use case examples (when to use, when NOT to use)
  - Quick start guide with curl examples
  - Algorithm support matrix
  - Production deployment warnings
  - Security considerations section
  - Example code for all supported algorithms
  - Contribution guidelines
  - Links to RFC 9421 specification

## Steps

1. **Create warning banner** (top of README)
   - Use clear emoji/formatting (⚠️, 🚨, or similar)
   - Bold, large text stating "DEMO ONLY - NOT FOR PRODUCTION"
   - Brief explanation of risks (no rate limiting, key management, audit logging)

2. **Purpose & Use Cases section**
   - Primary purpose: Testing RFC 9421 implementations
   - Valid use cases: Development, testing, learning, debugging
   - Invalid use cases: Production APIs, sensitive data, public endpoints

3. **Quick Start Guide**
   - Installation/deployment steps
   - Basic usage with curl example (ECDSA P-256)
   - Expected response format
   - Link to more examples below

4. **Algorithm Support Matrix**
   - Table with columns: Algorithm, Status, Key Generation Command
   - Include all 6 algorithms from algorithmMap:
     - ✅ ecdsa-p256-sha256
     - ✅ ecdsa-p384-sha384
     - ✅ ed25519
     - ✅ rsa-pss-sha512
     - ✅ rsa-v1_5-sha256
     - ✅ hmac-sha256
   - Note HMAC requires shared secret (different flow)

5. **Complete Example Code section**
   - For each algorithm, provide:
     - Key generation commands (copy from src/index.ts error response)
     - Complete curl example with signature generation
     - Expected success response
   - Consider using collapsible sections for readability

6. **Production Warnings section**
   - List missing features for production:
     - ❌ No rate limiting
     - ❌ No key management/rotation
     - ❌ No audit logging
     - ❌ No request validation beyond signature
     - ❌ No DDoS protection
   - Guidance on what's needed for production use

7. **Security Considerations**
   - Public key exposure (x-public-key-pem header)
   - Key reuse risks
   - Algorithm selection guidance
   - Link to RFC 9421 security considerations section

8. **Contributing & Resources**
   - How to report issues
   - How to contribute improvements
   - Link to RFC 9421: https://www.rfc-editor.org/rfc/rfc9421.html
   - Link to http-message-sig library

## Tests

**Manual Validation:**
- [ ] README renders correctly on GitHub
- [ ] Warning banner is immediately visible (no scrolling)
- [ ] All curl examples can be copy-pasted and work
- [ ] Links to RFC 9421 are accurate
- [ ] Algorithm table matches src/index.ts implementation

**Content Checklist:**
- [ ] "DEMO ONLY" appears in first 3 lines
- [ ] At least 3 production warnings listed
- [ ] All 6 algorithms documented
- [ ] At least 2 complete curl examples
- [ ] Security considerations section present

## Acceptance Criteria

- [ ] Warning banner appears above fold (first ~10 lines)
- [ ] Production risks section lists minimum 5 missing features
- [ ] Quick start example works without modification
- [ ] Algorithm matrix includes all algorithms from algorithmMap
- [ ] Security considerations reference RFC 9421 Section 7+
- [ ] README is 200-400 lines (comprehensive but not overwhelming)
- [ ] All external links are valid (RFC, npm package)
- [ ] Markdown formatting passes linter (if configured)

## Validation

**Commands to verify:**
```bash
# Check README exists and has content
wc -l README.md  # Should be 200-400 lines

# Verify warning appears early
head -n 10 README.md | grep -i "demo only"  # Should match

# Check algorithm coverage
grep -c "ecdsa-p256-sha256\|ecdsa-p384-sha384\|ed25519\|rsa-pss-sha512\|rsa-v1_5-sha256\|hmac-sha256" README.md  # Should be ≥6

# Validate links (optional - requires markdown-link-check)
npx markdown-link-check README.md
```

**Manual Review:**
1. Open README.md in GitHub preview
2. Verify warning banner is prominent
3. Test one curl example end-to-end
4. Click all external links to verify they work

## Notes

**Template Structure Suggestion:**
```markdown
# ⚠️ RFC 9421 HTTP Message Signatures — DEMO TOOL

> **WARNING: FOR TESTING/DEVELOPMENT ONLY**
> This is a demonstration tool...

## Purpose
## Quick Start
## Supported Algorithms
## Usage Examples
  ### ECDSA P-256
  ### ECDSA P-384
  ### Ed25519
  ### RSA-PSS SHA-512
  ### RSA v1.5 SHA-256
  ### HMAC SHA-256
## Production Deployment Warnings
## Security Considerations
## Development
## Resources
## License
```

**Style Guidelines:**
- Use emoji sparingly (⚠️ for warnings, ✅/❌ for status)
- Keep curl examples under 80 chars per line where possible
- Use code blocks with language hints (```bash, ```json)
- Bold important warnings using **text**

**References:**
- RFC 9421: https://www.rfc-editor.org/rfc/rfc9421.html
- http-message-sig: https://www.npmjs.com/package/http-message-sig
- Existing error messages in src/index.ts (lines 18-43) contain key generation examples

**Estimated Time:** 1.5-2 hours
