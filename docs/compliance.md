# Record checks and their limits

Checked 23 October 2026. This is a position-planning workspace for a trusted operator. It does not select people for hiring, dismissal, promotion or pay changes. It does not run payroll. A planning approval records a review of a scenario, not authority to change an employment agreement.

| Rule | Source | Implemented check |
|---|---|---|
| Check accuracy before using or disclosing personal information | [NZ Privacy Act, principle 8](https://www.privacy.org.nz/privacy-principles/8/) | Source date, review date and evidence are recorded. A snapshot older than the internal 90-day interval creates an accuracy finding. |
| Keep personal information only while needed for a lawful purpose | [NZ Privacy Act, principle 9](https://www.privacy.org.nz/privacy-principles/9/) | Purpose and retention-review date are required. An overdue review blocks scenario submission. There is no automatic deletion. |
| Quality of personal information for covered Australian entities | [OAIC, APP 10](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-10-app-10-quality-of-personal-information) | The same dated evidence helps an operator review accuracy and relevance. Applicability, including employee-record exceptions, needs assessment for the actual business. |
| Sound planning assumptions | Internal control, not a statutory rule | Reject orphan parents, cycles, duplicate position codes, invalid FTE, invalid money and unknown occupancy. Keep currencies separate. |
| Independent scenario review | Internal control, not a statutory rule | Close every action, resolve overdue review findings, submit, then record approval under a different actor name. Lock submitted and approved scenarios. Reopening requires a reason. |

The 90-day interval is our configurable internal review threshold. Neither privacy source prescribes it. Passing these checks is not legal certification. Date fields and evidence do not prove that records are true, or that every legal obligation has been met.

The model stores positions and budget rates, not employee names, protected characteristics, performance scores or candidate records. A role title or note can still identify a person. Keep those records restricted. Only mapped position fields are imported; unused CSV columns are not retained.

Actor names are operator assertions, not authenticated signatures. Events retain before-and-after data, but a database owner can change them. This is not a tamper-proof audit or a multi-user permission system. Use one dedicated database and a restricted owner connection. PostgreSQL public roles have no access by default. Backups, disk encryption, access reviews and an approved retention procedure are deployment responsibilities.

Read-only HTML and drafts may contain confidential planning data. They are local files with restrictive file permissions where supported, not a sharing portal. Review recipients before sharing. No command sends a message, applies a workforce change or writes back to Orgvue.
