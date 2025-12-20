# 03. Update package.json with Safety Description

**meta:**
```yaml
id: demo-improvements-03
feature: demo-improvements
priority: P0 (Critical)
depends_on: [demo-improvements-01]
tags: [documentation, safety, metadata, phase-1]
```

## Objective

Update package.json with clear description, keywords, and metadata that signal this is a demo/testing tool, making the purpose immediately obvious to anyone discovering the package.

## Deliverables

- **package.json** with updated fields:
  - `description`: Clear statement of demo/testing purpose
  - `keywords`: Relevant search terms including "demo", "testing", "rfc9421"
  - `author`: (if appropriate)
  - `repository`: GitHub repository URL
  - `bugs`: Issue tracker URL
  - `homepage`: README or documentation URL
  - `license`: Confirmed (already "LICENSE" field exists)

## Steps

1. **Add description field**
   - Clear, concise statement (≤80 chars preferred)
   - Include "demo", "testing", or "development" keyword
   - Mention RFC 9421
   - Example: "Demo tool for testing RFC 9421 HTTP Message Signatures — NOT for production use"

2. **Add keywords array**
   - Include relevant terms for npm/GitHub search:
     - "rfc9421", "http-message-signatures", "http-signatures"
     - "demo", "testing", "development"
     - "cloudflare-worker", "workers"
     - "cryptography", "signature-verification"
     - "ecdsa", "eddsa", "rsa", "hmac"
   - Keep to 8-12 keywords (most relevant)

3. **Add repository field**
   ```json
   "repository": {
     "type": "git",
     "url": "git+https://github.com/{owner}/{repo}.git"
   }
   ```
   - Replace {owner}/{repo} with actual GitHub path
   - Or use short form: "repository": "github:{owner}/{repo}"

4. **Add bugs field**
   ```json
   "bugs": {
     "url": "https://github.com/{owner}/{repo}/issues"
   }
   ```

5. **Add homepage field**
   - Link to GitHub README or docs
   - Example: "https://github.com/{owner}/{repo}#readme"

6. **Review existing fields**
   - Confirm "private": true is appropriate (prevents accidental npm publish)
   - Verify license field matches LICENSE file content
   - Check that scripts are up to date

7. **Consider adding optional fields** (if appropriate)
   - "author": "Your Name <email@example.com>"
   - "contributors": [] (if applicable)
   - "engines": {"node": ">=18.0.0"} (for Cloudflare Workers compatibility)

## Tests

**Validation Commands:**
```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"  # Should succeed

# Check for required fields
jq '.description, .keywords, .repository' package.json  # Should all return values

# Verify description contains safety warning
jq -r '.description' package.json | grep -i "demo\|testing\|development"  # Should match
```

**Manual Review:**
- [ ] Description is clear and includes demo/testing warning
- [ ] Keywords are relevant and include "demo"
- [ ] Repository URL is correct
- [ ] Bugs URL is correct
- [ ] Homepage URL is correct
- [ ] JSON is valid and properly formatted

## Acceptance Criteria

- [ ] `description` field exists and contains "demo", "testing", or "development"
- [ ] `description` mentions RFC 9421 or HTTP Message Signatures
- [ ] `keywords` array has 8-12 relevant terms including "demo" and "rfc9421"
- [ ] `repository` field points to correct GitHub repository
- [ ] `bugs` field points to GitHub issues
- [ ] `homepage` field points to README or documentation
- [ ] `private: true` is set (prevents accidental npm publish)
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] Package name remains "9421" (or update if needed)

## Validation

**Commands:**
```bash
# Validate package.json
npm pkg fix  # Auto-formats and validates

# Check specific fields
npm pkg get description  # Should show demo warning
npm pkg get keywords  # Should show array with "demo"
npm pkg get repository.url  # Should show GitHub URL

# Verify no syntax errors
pnpm install --frozen-lockfile  # Should succeed without changes

# Check field count (should have ~10-12 fields)
jq 'keys | length' package.json  # Should be 10-15
```

**Manual Verification:**
1. Open package.json in editor
2. Verify description is prominent and clear
3. Check that all URLs are accessible
4. Ensure keywords make sense for discovery
5. Confirm private:true prevents publish

## Notes

**Example Complete package.json:**
```json
{
  "name": "9421",
  "version": "0.0.0",
  "description": "RFC 9421 HTTP Message Signatures demo tool for testing/development — NOT for production",
  "private": true,
  "keywords": [
    "rfc9421",
    "http-message-signatures",
    "demo",
    "testing",
    "cloudflare-worker",
    "signature-verification",
    "ecdsa",
    "eddsa",
    "rsa-pss",
    "hmac"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/owner/9421.git"
  },
  "bugs": {
    "url": "https://github.com/owner/9421/issues"
  },
  "homepage": "https://github.com/owner/9421#readme",
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev",
    "start": "wrangler dev",
    "test": "vitest",
    "cf-typegen": "wrangler types"
  },
  "devDependencies": {
    "@types/node": "^24",
    "wrangler": "^4.56.0"
  },
  "dependencies": {
    "http-message-sig": "^0.1.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Field Priorities:**
- **Required:** description, keywords, repository, private
- **Recommended:** bugs, homepage, engines
- **Optional:** author, contributors, license (if not in LICENSE file)

**Description Best Practices:**
- Start with what it does: "RFC 9421 HTTP Message Signatures demo tool"
- Add context: "for testing/development"
- Include warning: "NOT for production"
- Keep under 80 characters if possible
- Don't use emoji (save for README)

**Keyword Strategy:**
- Include RFC number: "rfc9421"
- Include common search terms: "http-message-signatures", "http-signatures"
- Include purpose: "demo", "testing", "development"
- Include platform: "cloudflare-worker", "workers"
- Include algorithms: "ecdsa", "eddsa", "rsa", "hmac"
- Include functionality: "signature-verification", "cryptography"

**Dependencies:**
This task depends on task 01 (README) to ensure description and keywords align with README messaging and purpose statement.

**Estimated Time:** 15-30 minutes
