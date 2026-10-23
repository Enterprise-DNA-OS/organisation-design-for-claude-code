---
description: "Clone for organisation design planning"
---

# clone

Read CLAUDE.md and the current records first. Use the operator supplied actor, dates, scope and evidence. Never fabricate approval or source checks.

```bash
npm run org -- clone --scenario=CURRENT --code=OPTION-B --name="New option" --owner="Finance lead" --purpose="Test a capacity assumption" --review-on=YYYY-MM-DD --retention-review-on=YYYY-MM-DD --actor="Operator"
```

Replace example values with the request.  Use --json for structured output. An ambiguous identifier lists candidates and exits 1. 
