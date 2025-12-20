# 07. Set Up GitHub Actions CI Workflow

**meta:**
```yaml
id: demo-improvements-07
feature: demo-improvements
priority: P1 (High)
depends_on: [demo-improvements-04, demo-improvements-05, demo-improvements-06]
tags: [ci, automation, github-actions, phase-2]
```

## Objective

Create GitHub Actions workflow that automatically runs tests on pull requests and main branch pushes, ensuring code quality and preventing regressions.

## Deliverables

- **.github/workflows/ci.yml** - CI workflow configuration
- Automated test execution on PR and push
- Test coverage reporting
- TypeScript type checking
- Fast feedback (<5 minutes)

## Steps

1. **Create .github/workflows directory**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create ci.yml workflow file**
   - Trigger on pull_request and push to main
   - Use Node.js 20.x (matches Cloudflare Workers runtime)
   - Install pnpm
   - Run tests with coverage
   - Run TypeScript type checking
   - Optional: Upload coverage reports

3. **Configure workflow triggers**
   ```yaml
   on:
     pull_request:
       branches: [main]
     push:
       branches: [main]
   ```

4. **Set up Node.js and pnpm**
   - Use actions/setup-node for Node.js
   - Use pnpm/action-setup for pnpm
   - Cache pnpm store for faster builds

5. **Add test execution step**
   - Run `pnpm install --frozen-lockfile`
   - Run `pnpm test:run` (non-watch mode)
   - Run `pnpm test:coverage`

6. **Add type checking step**
   - Run `pnpm cf-typegen`
   - Run `pnpm tsc --noEmit` (if separate from cf-typegen)

7. **Add optional coverage reporting**
   - Use codecov/codecov-action or similar
   - Upload coverage reports
   - Display coverage in PR comments

8. **Add workflow status badge to README** (optional)
   - Add badge showing CI status
   - Place near top of README

9. **Test the workflow**
   - Create test PR to verify workflow runs
   - Check that all steps pass
   - Verify timing is acceptable (<5 min)

10. **Add workflow permissions** (if needed)
    - Set minimal permissions for security
    - Add write permissions only if needed for coverage comments

## Tests

**Local Workflow Validation:**
```bash
# Install act (local GitHub Actions runner) - optional
brew install act  # macOS
# or: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Test workflow locally (if act installed)
act pull_request

# Manually verify workflow steps work
pnpm install --frozen-lockfile  # Should succeed
pnpm test:run  # Should pass all tests
pnpm cf-typegen  # Should succeed
```

**GitHub Validation:**
- [ ] Create test branch
- [ ] Push to trigger workflow
- [ ] Verify workflow appears in Actions tab
- [ ] Check all jobs complete successfully
- [ ] Verify timing is <5 minutes

## Acceptance Criteria

- [ ] .github/workflows/ci.yml exists
- [ ] Workflow triggers on pull_request to main
- [ ] Workflow triggers on push to main
- [ ] Uses Node.js 20.x (LTS, matches Workers)
- [ ] Uses pnpm for package management
- [ ] Runs `pnpm test:run` successfully
- [ ] Runs `pnpm test:coverage` successfully
- [ ] Runs TypeScript type checking
- [ ] Workflow completes in <5 minutes
- [ ] All steps use latest stable action versions
- [ ] Workflow has descriptive name and job names
- [ ] Dependencies are cached for performance

## Validation

**Commands:**
```bash
# Check workflow file exists
ls -la .github/workflows/ci.yml  # Should exist

# Validate workflow syntax (requires GitHub CLI)
gh workflow view ci.yml  # Should show workflow details

# Check workflow runs (requires GitHub CLI)
gh run list --workflow=ci.yml  # Should show recent runs

# Validate YAML syntax locally
yamllint .github/workflows/ci.yml  # Should pass (if yamllint installed)
```

**GitHub UI Validation:**
1. Go to repository → Actions tab
2. Verify CI workflow appears
3. Create test PR
4. Check that workflow runs automatically
5. Verify all steps pass
6. Check timing is acceptable

**Manual Testing:**
1. Create feature branch
2. Make trivial change (e.g., README typo fix)
3. Push and create PR
4. Verify CI runs and passes
5. Intentionally break a test
6. Verify CI fails appropriately

## Notes

**Example ci.yml:**
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    name: Test & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test:run
      
      - name: Run tests with coverage
        run: pnpm test:coverage
      
      - name: Type check
        run: pnpm cf-typegen
      
      # Optional: Upload coverage
      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        if: success()
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false
```

**Enhanced ci.yml with Multiple Jobs:**
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    name: Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:run
  
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm cf-typegen
  
  coverage:
    name: Coverage
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      
      - uses: codecov/codecov-action@v4
        if: success()
```

**Workflow Best Practices:**

1. **Fast Feedback:**
   - Run tests in parallel if possible
   - Cache dependencies
   - Use frozen-lockfile for consistency

2. **Security:**
   - Set minimal permissions
   - Use pinned action versions (@v4, not @latest)
   - Don't expose secrets in logs

3. **Reliability:**
   - Use stable Node.js LTS (20.x)
   - Use frozen-lockfile to prevent dependency drift
   - Retry flaky steps if needed

4. **Maintainability:**
   - Clear job and step names
   - Comments explaining non-obvious steps
   - Logical job separation (test/typecheck/coverage)

**Optional Enhancements:**
- **Matrix testing:** Test on multiple Node.js versions
- **Lint job:** Run ESLint/Prettier checks
- **Deploy preview:** Deploy to Cloudflare Workers preview on PR
- **Coverage comments:** Post coverage changes on PR

**README Badge (optional):**
```markdown
[![CI](https://github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci.yml)
```

**Common Issues:**

1. **pnpm not found:**
   - Solution: Use pnpm/action-setup before setup-node

2. **Cache misses:**
   - Solution: Ensure cache: 'pnpm' is set in setup-node

3. **Frozen lockfile errors:**
   - Solution: Commit pnpm-lock.yaml to repository

4. **Permission errors:**
   - Solution: Add permissions block if needed

**References:**
- GitHub Actions: https://docs.github.com/en/actions
- actions/checkout: https://github.com/actions/checkout
- actions/setup-node: https://github.com/actions/setup-node
- pnpm/action-setup: https://github.com/pnpm/action-setup
- codecov/codecov-action: https://github.com/codecov/codecov-action
- GitHub Actions Workflow Syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

**Estimated Time:** 30-45 minutes
