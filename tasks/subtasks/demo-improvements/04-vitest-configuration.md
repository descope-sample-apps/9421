# 04. Create Vitest Configuration for Cloudflare Worker

**meta:**
```yaml
id: demo-improvements-04
feature: demo-improvements
priority: P1 (High)
depends_on: []
tags: [testing, infrastructure, configuration, phase-2]
```

## Objective

Create a properly configured vitest setup that works with Cloudflare Workers runtime, enabling comprehensive testing of the RFC 9421 verification logic with proper module resolution and Node.js crypto compatibility.

## Deliverables

- **vitest.config.mts** (already exists, needs proper configuration)
- **package.json** updated with vitest and test dependencies
- **Test environment** configured for Cloudflare Workers + Node.js crypto

## Steps

1. **Review existing vitest.config.mts**
   - Check current configuration
   - Identify what needs to be added/modified
   - Note: File exists but may be minimal or empty

2. **Install required dependencies**
   ```bash
   pnpm add -D vitest @cloudflare/workers-types
   pnpm add -D @vitest/ui  # Optional but recommended for test UI
   ```

3. **Configure vitest.config.mts** with Cloudflare Workers support
   - Set test environment to 'node' (Workers use Node.js compat mode)
   - Configure module resolution for TypeScript
   - Set up coverage reporting
   - Configure test file patterns
   - Add aliases if needed for imports

4. **Update package.json scripts**
   - Verify "test": "vitest" exists
   - Add "test:ui": "vitest --ui" for visual test runner
   - Add "test:coverage": "vitest --coverage" for coverage reports
   - Add "test:run": "vitest run" for CI (single run, no watch)

5. **Install coverage provider** (optional but recommended)
   ```bash
   pnpm add -D @vitest/coverage-v8
   ```

6. **Create test helper/setup file if needed**
   - May need global test setup for Workers environment
   - Create test/setup.ts if necessary
   - Configure in vitest.config.mts

7. **Verify Node.js crypto compatibility**
   - Ensure 'node:crypto' imports work in test environment
   - Test that createPublicKey and verify functions are available
   - May need to configure conditions/resolve options

## Tests

**Configuration Validation:**
```bash
# Verify vitest can load config
pnpm vitest --version  # Should show vitest version

# Try running with no tests (should not error on config)
pnpm vitest run --reporter=verbose  # Should succeed (even with 0 tests)

# Check TypeScript compilation of config
pnpm tsc --noEmit vitest.config.mts  # Should succeed
```

**Manual Checks:**
- [ ] vitest.config.mts has valid TypeScript syntax
- [ ] Configuration exports default defineConfig()
- [ ] Test environment is set to 'node'
- [ ] Coverage provider is configured
- [ ] Test file patterns include test/**/*.spec.ts

## Acceptance Criteria

- [ ] vitest.config.mts exists and exports valid configuration
- [ ] Test environment set to 'node' (for Node.js crypto support)
- [ ] Coverage reporting configured with v8 provider
- [ ] Test file patterns: `test/**/*.{test,spec}.ts`
- [ ] TypeScript paths/aliases configured if needed
- [ ] package.json has test, test:ui, test:coverage, test:run scripts
- [ ] All required dependencies installed (@vitest/*, vitest)
- [ ] Configuration passes vitest --run with 0 tests
- [ ] Node.js crypto modules are resolvable in test environment

## Validation

**Commands:**
```bash
# Install dependencies
pnpm install  # Should succeed

# Verify vitest is installed
pnpm exec vitest --version  # Should show version

# Validate config file syntax
pnpm tsc --noEmit vitest.config.mts  # Should succeed

# Test that vitest can start (will show 0 tests)
pnpm test:run  # Should succeed with "No test files found"

# Verify coverage setup (if installed)
pnpm test:coverage  # Should succeed or show coverage provider error if not installed

# Check that scripts are defined
npm pkg get scripts.test scripts.test:ui scripts.test:coverage scripts.test:run
```

**Expected Output:**
- `pnpm test:run` should complete without errors (even with 0 tests)
- No module resolution errors
- No TypeScript compilation errors

## Notes

**Example vitest.config.mts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use Node.js environment for Cloudflare Workers with node:crypto
    environment: 'node',
    
    // Test file patterns
    include: ['test/**/*.{test,spec}.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'worker-configuration.d.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
    
    // Globals (optional - enables describe/it without imports)
    globals: true,
  },
  
  // Resolve TypeScript paths if needed
  resolve: {
    alias: {
      // Add any path aliases here if needed
    },
  },
});
```

**package.json scripts addition:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

**Dependencies to add:**
```json
{
  "devDependencies": {
    "@types/node": "^24",  // Already exists
    "@cloudflare/workers-types": "^4.0.0",
    "vitest": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "wrangler": "^4.56.0"  // Already exists
  }
}
```

**Common Issues & Solutions:**

1. **Node.js crypto not available:**
   - Solution: Set `environment: 'node'` in vitest config
   - Ensure imports use 'node:crypto' prefix

2. **TypeScript module resolution:**
   - Solution: Match tsconfig.json module resolution in vitest config
   - Use `resolve.alias` if needed

3. **Coverage thresholds too strict initially:**
   - Start with lower thresholds (70-80%)
   - Increase after test suite is complete

4. **Workers types conflicting:**
   - Solution: Ensure @cloudflare/workers-types matches wrangler version
   - May need to configure types in test/tsconfig.json

**Testing Strategy Notes:**
- Focus on unit tests for verification logic
- Mock Cloudflare Workers Request/Response if needed
- Use actual Node.js crypto for cryptographic operations
- Consider integration tests for end-to-end flow

**References:**
- Vitest Config: https://vitest.dev/config/
- Cloudflare Workers Testing: https://developers.cloudflare.com/workers/testing/
- Node.js Crypto: https://nodejs.org/api/crypto.html
- Coverage Options: https://vitest.dev/config/#coverage

**Estimated Time:** 30-45 minutes
