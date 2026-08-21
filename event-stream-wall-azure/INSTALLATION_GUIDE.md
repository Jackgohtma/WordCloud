# Azure Static Web Apps installation guide

## Before you begin

You need an Azure subscription, a GitHub account, and this complete project folder in a GitHub repository. Upload the contents of this folder to the repository root — `frontend`, `api`, `deployment`, and the root configuration files should all appear together.

## 1. Create Azure Storage

1. In the Azure portal, create a Storage account.
2. Open the Storage account, then **Access keys**.
3. Copy one connection string and keep it private. The application creates the `TribeResponses` table automatically on first use.

## 2. Create the Static Web App

1. In the Azure portal, create a **Static Web App**.
2. Connect the GitHub repository and choose the `main` branch.
3. Use these build settings:
   - App location: `frontend`
   - API location: `api`
   - Output location: leave blank
4. Finish creation and allow the GitHub Actions deployment to complete.

If Azure's generated workflow does not detect the application correctly, compare it with `deployment/github-actions-template.yml`.

## 3. Add application settings

In the Static Web App, open **Configuration** and add:

- `AZURE_STORAGE_CONNECTION_STRING`: the Storage connection string
- `AZURE_TABLE_NAME`: `TribeResponses`
- `EVENT_PARTITION_KEY`: `TMA-TRIBE-2026`
- `FORMS_INTAKE_SECRET`: a long, random secret used only by Power Automate

Save the settings, then redeploy or restart the Static Web App.

## 4. Connect Microsoft Forms

Follow `POWER_AUTOMATE_SETUP.md`. Power Automate sends each completed response to `/api/forms-ingest`.

## 5. Verify the app

1. Open the Static Web App URL.
2. Select **Manual entry** and submit a test response.
3. Confirm the AI wish appears in the left word cloud and the action pledge appears at the bottom of the right panel.
4. Hover over a pledge, open the three-dot menu, and test **Pin**.
5. Open `/report.html` and verify the row can be exported to Excel.

The TV performs a silent background check every 10 seconds. The page should not visibly flash or reload; only new or changed content animates.

The report, manual entry, PIN, and DELETE functions do not require an access code. Anyone who can reach these URLs or API endpoints can use them, so restrict access at the network or Azure level if the Static Web App is not limited to event administrators.
