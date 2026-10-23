---
description: "Import for organisation design planning"
---

# import

Read CLAUDE.md and the current records first. Use the operator supplied actor, dates, scope and evidence. Never fabricate approval or source checks.

```bash
npm run org -- import orgvue --scenario=NEW --file=imports/orgvue.csv --map=fixtures/orgvue-map.json --actor="Operator" --dry-run
```

Replace example values with the request. Read docs/replace-orgvue.md. Start with the dry run, reconcile counts and currency totals, then remove --dry-run for the requested import. Use --json for structured output. An ambiguous identifier lists candidates and exits 1. 
