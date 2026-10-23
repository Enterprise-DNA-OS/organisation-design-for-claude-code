# Verification on 23 October 2026

- Linux, Node 22.23.1, PGlite: npm test passed all 31 CLI commands and 89 checks.
- Linux, PostgreSQL 18.4 in an isolated disposable local server: npm test passed all 31 CLI commands and 90 checks. The extra assertion verifies an empty test database.
- npm install completed with no reported vulnerabilities. npm run demo, npm run docs and npm run view completed.
- The arithmetic regression includes a half-cent case: a full-time annual rate of 2.01 at half capacity rounds to 1.01 in both the database report and frozen-baseline comparison.
- Brand lint passed the six prose documents. The source scan found no author placeholders, em dashes or banned voice terms.
- The Orgvue comparison page passed the Command Centre gate. Its isolated Astro build passed. Headless Chromium found no page errors, all three ownership paths, three real demo tables, six attributed booking links and no horizontal overflow at 390 or 320 pixels. The built page carried noindex,nofollow.
- Desktop, mobile and scenario-pack screenshots were captured and inspected during the run.

The manual GitHub workflow was dispatched at commit 9b52820. GitHub refused to start all five jobs because recent account payments had failed or the spending limit needed attention. No test step ran there. Windows and the workflow's PostgreSQL 17 matrix remain unverified. The local PostgreSQL 18.4 check ran successfully after the rounding fix. The workflow stays manual as required by the shared template.

The import fixture is synthetic. An actual customer Orgvue export and a customer deployment were not available in this run. The included header mapping contract and reconciliation steps describe that boundary.
