# Bring an Orgvue position snapshot across

Orgvue supports CSV export. Its [data integration sheet](https://www.orgvue.com/content/uploads/sites/2/2025/05/Orgvue_Data-Sheets_Data_Integration_A4_RGB_v1.pdf) describes CSV, connector and API transfers. Its [worksheet help article](https://support.orgvue.com/hc/en-us/articles/24598208554525-Updating-property-values-by-paste-merging-data-from-a-spreadsheet) describes exporting worksheet data through Data, Export as CSV, Current slide.

Use an authorised operator account. Export the complete positions worksheet, with filters removed and every required property visible. Confirm that all reporting parents are included. Orgvue properties are configurable. There is no universal vendor column layout: map your actual headers before importing. The included fixture is synthetic, not a customer export or a certified Orgvue integration.

## The mapping contract

| Local field | Meaning | Example mapped header |
|---|---|---|
| code | Stable unique position identifier | id |
| parent_code | Reporting parent position identifier, blank for roots | parentId |
| title | Position title, not person name | Title |
| department | Cost or operating department | Department |
| fte | Capacity fraction, greater than zero and at most one, up to three decimals | FTE |
| annual_rate | Annual full-time budget rate, unformatted decimal, up to two decimals | AnnualRate |
| currency | Three uppercase currency letters | Currency |
| occupancy | filled or vacant | Occupancy |

Use fixtures/orgvue-map.json as the header map. All eight columns must exist; parent cells may be blank. A combined cost for a part-time role is not a full-time rate: reconcile the definition before importing. Convert percentages, currency symbols or local-language occupancy values in a reviewed copy first. This importer rejects those values rather than guessing. Split a multi-person aggregate into actual position records before import.

## One command imports a mapped export

After npm install and npm run migrate, create a dated destination:

```bash
npm run org -- create --code=JUNE --name="June position snapshot" --owner="Finance lead" --purpose="Quarterly capacity review" --source-as-of=2026-06-30 --review-on=2026-10-30 --retention-review-on=2027-06-30 --actor="Your name"
npm run org -- import orgvue --scenario=JUNE --file=imports/orgvue.csv --map=fixtures/orgvue-map.json --actor="Your name" --dry-run
npm run org -- import orgvue --scenario=JUNE --file=imports/orgvue.csv --map=fixtures/orgvue-map.json --actor="Your name"
npm run org -- costs --scenario=JUNE
npm run org -- layers --scenario=JUNE
```

Replace the example dates and map with the actual dates and headings. An old source date remains old until you verify newer source evidence. The test run uses a transaction and rolls back every record. A successful import is atomic. Identical file and mapping repeats are no-ops. Changed exports require a new empty draft scenario. No record is silently replaced. Only the eight mapped fields are retained, with a file-and-map digest and import count in the history.

Reconcile position count, total FTE and annual cost in each currency with the source. Confirm parent links, vacancies, omitted filters and the full-time rate definition. Do this before changing an option or marking a review complete.

## What carries across

Positions, hierarchy, department, FTE, budget rate, currency and occupancy. A cloned option keeps an immutable JSON baseline of those imported positions, so later corrections to the source scenario do not change the comparison.

People datasets, employee histories, skills, activity modelling, permissions, Orgvue packs, layouts, saved formulas, links between datasets and approvals are not migrated by this importer. No live connector or writeback is included. Enterprise DNA scopes additional mapping and migration before work starts. A review in this workspace is separate from an Orgvue approval.

## Export and custody

```bash
npm run org -- export --scenario=JUNE --file=exports/june.csv
npm run org -- export --scenario=JUNE --file=exports/june.json
```

CSV carries the eight position fields and can be imported into another empty scenario without a map. JSON also carries scenario metadata, frozen baseline, actions, events and import records. It is a readable archive, not an automated restore format. Neither export overwrites an existing file. CSV cells retain their text; treat exports as untrusted text when opening them in spreadsheet software.
