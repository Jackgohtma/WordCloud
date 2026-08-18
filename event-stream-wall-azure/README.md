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
TV screen polls /api/live every two seconds
```

- `frontend/` — static TV screen and password-protected reporting interface.
- `api/` — JavaScript Azure Functions using the v4 programming model.
- Azure Table Storage — durable response storage.
- `/api/forms-ingest` — secret-protected Microsoft Forms intake.
- `/api/live` — public read-only word cloud and event comment feed.
- `/api/report` — access-code-protected full report.
- `/report.html` — private report and Excel download.

The future-exhibition answer is stored only for reporting. AI wishes feed the
word cloud. Event feedback feeds the right-side live comment panel.

Start with [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md), then configure the
flow using [POWER_AUTOMATE_SETUP.md](POWER_AUTOMATE_SETUP.md).
