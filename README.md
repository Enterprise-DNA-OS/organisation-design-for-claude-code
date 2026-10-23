# Organisation Design for Claude Code

Compare position structures, capacity and annual budget costs in a database you own. Keep the source snapshot, the option and the review evidence together.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free under MIT. Install and run the demo. | Your position fields, cost rules, Orgvue exports and review documents. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=orgvue) · [Instead of Orgvue](https://enterprisedna.co/omni/instead-of/orgvue?utm_source=github&utm_medium=readme&utm_campaign=orgvue)

## Start with a working review

Node 20 or later:

```bash
git clone https://github.com/Enterprise-DNA-OS/organisation-design-for-claude-code.git
cd organisation-design-for-claude-code
npm install
npm run demo
npm run org -- compare --scenario=OPTION-A
npm run docs
npm run view
```

Open this folder with Claude Code, Codex, OpenCode or Cursor. AGENTS.md and CLAUDE.md use the same recipes. PGlite runs locally without a database service. DATABASE_URL selects PostgreSQL and DATA_DIR selects another local directory. Use a trusted owner connection to a dedicated database. Never seed a real business database.

The fictional Kauri example includes two currencies, part-time positions, a vacant role, an overdue review and a shared-services option. Costs are full-time annual budget rates multiplied by FTE, rounded to cents per position. Currencies never mix. They are annual planning estimates, not payroll, remuneration recommendations or realised savings.

## The weekly jobs

List position structures, inspect reporting spans and layers, compare options, check overdue evidence, close review actions and prepare a scenario pack. Every write names an actor. Imported snapshots are atomic and duplicate-safe. A cloned option keeps a frozen baseline. Submitted or approved scenarios are locked until reopened with a reason. Approval requires another actor name, current review dates and no open actions. Actor names are not authenticated signatures.

This is a trusted-operator planning workspace. It does not rank employees, select candidates, choose redundancies or carry out employment changes. [Record controls and their limits](docs/compliance.md).

## Ten questions this build answers

These are tested questions, not claims that Orgvue cannot answer them.

1. What annual cost does each currency carry? Run costs.
2. Which departments hold vacant capacity? Run departments.
3. Which planned positions are vacant? Run vacancies.
4. How many direct reports does each manager position have? Run spans.
5. How many reporting layers sit above each position? Run layers.
6. What annual cost changes against the frozen baseline? Run compare.
7. Which position assumptions changed? Run changes.
8. Which source snapshots need an accuracy or retention review? Run compliance.
9. Which review actions are late, and who owns them? Run attention and actions.
10. Who changed an assumption and what was there before? Run activity.

## Bring your position snapshot

Export a complete positions worksheet from Orgvue. Map your actual property headers, create a dated empty scenario, then import it in one command:

```bash
npm run org -- import orgvue --scenario=JUNE --file=imports/orgvue.csv --map=fixtures/orgvue-map.json --actor="Your name"
```

[Setup, export steps, dry run, mapping and reconciliation](docs/replace-orgvue.md). Orgvue properties vary by organisation. The fixture demonstrates the importer contract; it is not a real vendor export. The importer carries positions and assumptions, not people records, visual packs, permissions or live connections. Revised snapshots get a new scenario instead of overwriting history.

## Documents and read-only views

Change brand.json for your name, colours and logo. npm run docs creates a scenario review pack and a planning decision record for each scenario. npm run view creates the week review and structure dashboards. Open the local HTML and print to PDF after review. Imports, exports, drafts and generated output are excluded from version control.

## Your first hour: ten things to ask for

1. Put our business name on the review pack.
2. Check our export headings before importing.
3. Reconcile capacity and costs in each currency.
4. Show positions whose reporting parent is missing.
5. Clone our current structure into an option.
6. Move one position to a different department.
7. Model a part-time position at half capacity.
8. Record who must review a cost assumption.
9. Prepare the review pack with its source dates.
10. Add our internal position-grade field.

/customise writes a forward migration and tests the requested change. /new-view adds a read-only report through the shared renderer. [What a screen adds](docs/why-no-front-end.md).

## Verification and price context

npm test uses a temporary database, applies migrations and seed twice, exercises every CLI command, and checks hierarchy errors, currencies, frozen baselines, import rollback, duplicate imports, approval locks, drafts and HTML escaping. The manual CI workflow covers Node 20 and 22 on Windows and Linux plus PostgreSQL 17. The workflow definition alone is not evidence of a passing run. TEST_DATABASE_URL must name an empty disposable database.

Orgvue's subscription is privately quoted. A historical public-sector contract establishes the annual-bill selection evidence, but it is not a current tariff or an NZ/AU customer invoice. [Research and six scores](docs/research.md).

## Built and run for you

Enterprise DNA maps your agreed history, builds your planning rules and paperwork, and adds an authorised web view or other connections when agreed. Omni by Enterprise DNA runs it for one setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=orgvue).

MIT. Not affiliated with Orgvue or Anthropic. Hosting and coding-agent usage have their own costs.
