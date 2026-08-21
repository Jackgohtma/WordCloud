# TMA Tribe 2026 — Azure live wall

Production-oriented Azure version of the approved 55-inch TV experience.

## Architecture

```text
Microsoft Forms
      ↓
Power Automate (secure HTTP POST)
      ↓
Azure Static Web Apps managed API (Azure Functions)
      ↓
Azure Table Storage
      ↓
TV screen checks /api/live every 10 seconds and updates only changed items
```

- `frontend/` — static TV screen and administrator reporting interface.
- `api/` — JavaScript Azure Functions using the v4 programming model.
- Azure Table Storage — durable response storage.
- `/api/forms-ingest` — secret-protected Microsoft Forms intake.
- `/api/live` — public read-only word cloud and event comment feed.
- `/api/manual-entry` — manual response entry.
- `/api/moderate-pledge` — pin, unpin, and hide controls.
- `/api/report` — full reporting data.
- `/report.html` — administrator report and Excel download.

The future-exhibition answer is stored only for reporting. AI wishes feed the
word cloud. The Data & AI action pledge feeds the right-side panel. Pledges hidden
from the TV remain in the administrator report; deletion does not remove the survey row.

Localhost automatically loads 30 demonstration responses. These sample rows are
browser-only and are never written to Azure Table Storage.

Start with [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md), then configure the
flow using [POWER_AUTOMATE_SETUP.md](POWER_AUTOMATE_SETUP.md).
