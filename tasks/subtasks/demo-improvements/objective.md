# Demo Improvements — RFC 9421 Educational Tool

**Objective:** Transform RFC 9421 demo from working implementation to production-ready educational tool with comprehensive safety warnings, documentation, and test coverage

**Status legend:** [ ] todo, [~] in-progress, [x] done

## Tasks

### Phase 1: Safety & Documentation (Critical — Est: 3-4 hours)
- [ ] 01 — Create comprehensive README with demo-only warnings → `01-safety-warnings-readme.md`
- [ ] 02 — Add JSDoc safety warnings to code → `02-code-safety-comments.md`
- [ ] 03 — Update package.json with safety description → `03-package-safety-note.md`

### Phase 2: Reliability (High Priority — Est: 4-6 hours)
- [ ] 04 — Create vitest configuration for Cloudflare Worker → `04-vitest-configuration.md`
- [ ] 05 — Implement algorithm verification test suite → `05-algorithm-tests.md`
- [ ] 06 — Implement error handling and edge case tests → `06-error-handling-tests.md`
- [ ] 07 — Set up GitHub Actions CI workflow → `07-github-actions-ci.md`

### Phase 3: Developer Experience (Medium Priority — Est: 2-3 hours)
- [ ] 08 — Add comprehensive JSDoc with RFC 9421 references → `08-jsdoc-documentation.md`
- [ ] 09 — Add CORS support for browser-based testing → `09-cors-support.md`
- [ ] 10 — Create simple web UI for interactive testing → `10-interactive-web-ui.md`

## Dependencies

**Phase 1 (Foundation):**
- 02 depends on 01 (code comments reference README safety section)
- 03 depends on 01 (package description aligns with README messaging)

**Phase 2 (Testing Infrastructure):**
- 05 depends on 04 (tests require vitest config)
- 06 depends on 04 (tests require vitest config)
- 07 depends on 04, 05, 06 (CI runs test suite)

**Phase 3 (Enhanced UX):**
- 08 depends on 01 (JSDoc references README for detailed docs)
- 09 depends on 01 (CORS implementation documented in README)
- 10 depends on 01, 09 (UI documented in README, requires CORS)

## Exit Criteria

**The feature is complete when:**
- README.md contains prominent "DEMO ONLY" warnings with production safety guidelines
- All exported functions have JSDoc comments with safety warnings and RFC 9421 references
- package.json description clearly indicates demo/testing purpose
- Test suite achieves >90% code coverage across all algorithms and error paths
- CI pipeline runs successfully on pull requests and main branch
- CORS headers enable browser-based testing tools
- Web UI provides interactive testing without requiring curl/postman
- All documentation cross-references are accurate and up-to-date

## Notes

**Priority Rationale:**
- **Phase 1 Critical:** Safety warnings prevent production misuse — highest risk mitigation
- **Phase 2 High:** Tests ensure reliability for educational use and prevent regressions
- **Phase 3 Medium:** UX improvements enhance learning experience but don't affect core safety

**Estimation Basis:**
- Simple documentation tasks: 30-60 min each
- Test suite development: 2-3 hours (multiple algorithms + edge cases)
- Configuration setup: 30-45 min each
- Web UI: 1-2 hours (simple HTML/JS interface)

**Success Metrics:**
- Zero production deployment incidents (safety warnings effective)
- Test coverage >90%
- Positive developer feedback on documentation clarity
- CI pipeline <5 min execution time
