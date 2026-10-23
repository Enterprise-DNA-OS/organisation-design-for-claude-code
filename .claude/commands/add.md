---
description: "Add for organisation design planning"
---

# add

Read CLAUDE.md and the current records first. Use the operator supplied actor, dates, scope and evidence. Never fabricate approval or source checks.

```bash
npm run org -- add --scenario=OPTION-B --code=P07 --title="Service coordinator" --department=Delivery --parent=P02 --fte=0.5 --rate=80000 --currency=NZD --occupancy=vacant --reason="Model capacity" --actor="Operator"
```

Replace example values with the request.  Use --json for structured output. An ambiguous identifier lists candidates and exits 1. 
