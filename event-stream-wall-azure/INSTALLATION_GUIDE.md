# Azure installation guide

This guide deploys the site to Azure Static Web Apps with managed Azure
Functions and stores submissions in Azure Table Storage. No secrets belong in
the frontend or Git repository.

## 1. Prerequisites

- An Azure subscription.
- A GitHub repository that can contain this package.
- Node.js 18 or later for local testing.
- Permission to create a storage account and Static Web App.
- Power Automate access. The standard HTTP action may require a premium licence
  in your tenant.

## 2. Create Azure Table Storage

1. In the Azure portal, create or select a resource group.
2. Create a **Storage account** in the preferred region. Recommended settings:
   - Performance: Standard
   - Redundancy: LRS for an event prototype, or your organisation's required tier
   - Secure transfer required: Enabled
   - Minimum TLS version: 1.2
   - Public blob access: Disabled
3. Open the storage account, select **Storage browser → Tables → Add table**.
4. Create a table named `TribeResponses`.
5. Open **Access keys** and copy one complete connection string. Treat it as a
   secret; do not commit it to GitHub.

The API also attempts to create the table automatically, but creating it here
confirms permissions and naming before the event.

## 3. Put the package in GitHub

1. Create a new private GitHub repository or an empty folder in an approved
   existing repository.
2. Copy the contents of `event-stream-wall-azure` into the repository root.
3. Commit and push to the `main` branch.

Keep `api/local.settings.json` untracked. It is already included in `.gitignore`.

## 4. Create the Azure Static Web App

1. In the Azure portal, select **Create a resource → Static Web App**.
2. Choose the same resource group and an appropriate region.
3. Select the desired hosting plan.
4. Under deployment details, select **GitHub**, then choose the repository and
   `main` branch.
5. Use **Custom** build settings:
   - App location: `frontend`
   - API location: `api`
   - Output location: leave blank
6. Create the resource. Azure adds a GitHub Actions workflow and starts the
   first deployment.

Azure exposes the Functions endpoints under the same site's `/api` path, so the
browser never needs a separate API hostname or CORS configuration.

## 5. Add production environment variables

Open the Static Web App in Azure, then select **Settings → Environment
variables**. Add these values to the production environment:

| Name | Value |
|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | Full Table Storage connection string |
| `AZURE_TABLE_NAME` | `TribeResponses` |
| `EVENT_PARTITION_KEY` | `TMA-TRIBE-2026` |
| `FORMS_INTAKE_SECRET` | A long random secret used only by Power Automate |
| `REPORT_ACCESS_CODE` | A different strong code for the private report |

Apply the changes. Never place these values in `frontend`, GitHub source files,
screenshots or the TV browser.

To generate suitable values on macOS or Linux:

```sh
openssl rand -hex 32
```

Run it twice and use different values for the intake secret and report code.

## 6. Configure Microsoft Forms and Power Automate

Follow [POWER_AUTOMATE_SETUP.md](POWER_AUTOMATE_SETUP.md). The flow sends all
three answers and the Forms-captured name to:

```text
https://YOUR-STATIC-APP.azurestaticapps.net/api/forms-ingest
```

## 7. Verify the deployment

1. Submit one Microsoft Forms response.
2. Confirm the Power Automate HTTP action returns `201`.
3. Open the Static Web App URL and confirm:
   - Question 5 appears in the AI Wishlist.
   - Question 6 appears in the right-side comments.
   - Question 4 does not appear publicly.
4. Open `/report.html`, enter `REPORT_ACCESS_CODE`, and verify all fields.
5. Select **Download Excel** and confirm the workbook contains the response.
6. Submit the same AI wish again. Its vote count and font size should increase
   within approximately two seconds.

## 8. Prepare the 55-inch TV

1. Open the production URL in Edge or Chrome.
2. Set browser zoom to 100%.
3. Enter full-screen mode.
4. Disable display sleep, screen savers and automatic browser translation.
5. Confirm only the right comment panel scrolls; the word cloud remains fixed.
6. Use a wired connection where possible and test reconnection before the event.

## 9. Open the private report

Use this URL from an organiser's computer, not the public TV:

```text
https://YOUR-STATIC-APP.azurestaticapps.net/report.html
```

The report page is public HTML, but the API returns no data without the correct
report access code. Rotate the code after the event or whenever it is shared
outside the reporting team.

## 10. Local Azure-style testing

1. Install dependencies:

```sh
npm install
npm run install:api
```

2. Install and start Azurite, or use the Azurite VS Code extension:

```sh
npx azurite --silent --location .azurite
```

3. Copy `api/local.settings.json.example` to `api/local.settings.json` and
   replace both example secrets.
4. In a second terminal, start the Static Web Apps emulator:

```sh
npm start
```

5. Open `http://localhost:4280/`.

To send a local test submission:

```sh
curl -X POST http://localhost:4280/api/forms-ingest \
  -H "Content-Type: application/json" \
  -H "x-forms-intake-secret: YOUR_LOCAL_SECRET" \
  -d '{"responseId":"local-001","name":"Test User","futureExhibitionWish":"More practical showcases","aiWish":"Report automation","feedback":"Useful event"}'
```

## 11. Operational and security checklist

- Keep the storage connection string and both access secrets only in Azure app
  settings and approved password storage.
- Use separate production and test Static Web Apps or different
  `EVENT_PARTITION_KEY` values.
- Do not display `/report.html` on the event TV.
- Rotate secrets after staff changes or accidental disclosure.
- Review Azure Table Storage retention requirements after the event.
- Export the final Excel report before deleting any table data.
- Monitor GitHub Actions and Azure Function errors before and during the event.

## Official references

- [Add an API to Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/add-api)
- [Configure Static Web Apps application settings](https://learn.microsoft.com/azure/static-web-apps/application-settings)
- [Static Web Apps configuration](https://learn.microsoft.com/azure/static-web-apps/configuration)
- [Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli)
- [Azure Tables JavaScript client](https://learn.microsoft.com/javascript/api/@azure/data-tables/tableclient)
