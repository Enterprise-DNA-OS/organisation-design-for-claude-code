# Organisation Design for Claude Code: operating instructions

Read README.md and docs/replace-orgvue.md before using real data. This is a trusted-operator workspace for position structures and planning assumptions. The seed is fictional. Put the operator supplied business identity in brand.json.

## Work from evidence

Read records with the CLI first. Never invent a position, source date, approval, forecast certainty or cost saving. Use the named scenario. Keep currencies separate and distinguish full-time annual rates from FTE-adjusted costs. Compare against the frozen baseline, not a later source version.

## One route per recurring job

| Request | Recipe |
|---|---|
| actions | /actions |
| activity | /activity |
| add | /add |
| add action | /add-action |
| approve | /approve |
| attention | /attention |
| change | /change |
| changes | /changes |
| clone | /clone |
| close action | /close-action |
| compare | /compare |
| compliance | /compliance |
| costs | /costs |
| create | /create |
| customise | /customise |
| departments | /departments |
| docs | /docs |
| draft action | /draft-action |
| draft review | /draft-review |
| export | /export |
| help | /help |
| import | /import |
| layers | /layers |
| list | /list |
| log | /log |
| new view | /new-view |
| positions | /positions |
| reopen | /reopen |
| review | /review |
| show | /show |
| spans | /spans |
| submit | /submit |
| vacancies | /vacancies |
| view | /view |
| weekly review | /weekly-review |

## Boundaries

All writes identify the actor and use the existing CLI. Source dates and review evidence come from the operator. Do not submit or approve unless the operator asked to record that actual review. The different-name rule is an internal control, not authentication. No sends, live HR connections, payroll or employment changes. Never rank people or infer which employees should leave. Drafts stay in drafts/. Reopening requires a reason and leaves history.

Use a dedicated database with restricted operator access. The event history is not tamper-proof. Read docs/compliance.md for legal sources and limits. Never seed a working business database.

## Files and checks

scripts/org.mjs is the domain CLI. scripts/lib/db.mjs selects PGlite or PostgreSQL. Add forward migrations under supabase/migrations. views.json and documents.json use the shared read-only HTML renderer. All coding agents use .claude/commands. Run npm test after changes and demonstrate the requested behaviour. Use --json for machine output.

Built and run for you through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=orgvue
