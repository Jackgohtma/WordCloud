# Microsoft Forms to live wall

Create an automated cloud flow in Power Automate:

1. Trigger: **Microsoft Forms — When a new response is submitted**.
2. Action: **Microsoft Forms — Get response details**.
3. Action: **HTTP**, method `POST`, URI `https://YOUR-STATIC-WEB-APP.azurestaticapps.net/api/forms-ingest`.
4. Add header `Content-Type` with value `application/json`.
5. Add header `x-forms-intake-secret` with the same value as the Azure `FORMS_INTAKE_SECRET` application setting.
6. Use this JSON body and insert the corresponding dynamic Forms values:

```json
{
  "responseId": "RESPONSE_ID",
  "name": "RESPONDER_NAME",
  "futureExhibitionWish": "ANSWER_TO_FUTURE_EXHIBITIONS",
  "aiWish": "ANSWER_TO_AI_WISH_LIST",
  "feedback": "ANSWER_TO_HOW_WILL_YOU_TURN_DATA_AND_AI_INTO_ACTION"
}
```

Field mapping:

- `futureExhibitionWish`: **What would you wish to see in future Tribe exhibitions?** This is stored only in the administrator report.
- `aiWish`: **Share your AI wish list for your day-to-day operations.** This feeds the word cloud.
- `feedback`: **How will YOU turn Data & AI into Action?** This feeds the right-side pledge panel.

Save the flow, submit one test response, and confirm the HTTP action returns status `201` (or `200` if Power Automate resends the same response ID).
