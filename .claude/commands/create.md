---
description: "Create for organisation design planning"
---

# create

Read CLAUDE.md and the current records first. Use the operator supplied actor, dates, scope and evidence. Never fabricate approval or source checks.

```bash
npm run org -- create --code=NEW --name="New snapshot" --owner="Finance lead" --purpose="Quarterly planning" --source-as-of=YYYY-MM-DD --review-on=YYYY-MM-DD --retention-review-on=YYYY-MM-DD --actor="Operator"
```

Replace example values with the request.  Use --json for structured output. An ambiguous identifier lists candidates and exits 1. 
