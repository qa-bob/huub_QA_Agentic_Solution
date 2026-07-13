---
name: Test failure / bug
about: A test is failing or the framework is misbehaving
title: "[bug] "
labels: bug
---

## What failed
<!-- Test name / file, or framework behavior -->

## Command & environment
- Command: <!-- e.g. npm run test:functional -->
- Project: <!-- chromium-desktop / mobile-chrome / tablet -->
- Local or CI:
- Node version:

## Expected vs. actual

## Error output / trace
```
<!-- paste the failing output; attach the trace or screenshot from test-results/ -->
```

## Is it the site or the test?
- [ ] The live site changed (test correctly caught a regression)
- [ ] The test/selector is brittle or wrong
- [ ] Flaky (passes on retry)
- [ ] Not sure
