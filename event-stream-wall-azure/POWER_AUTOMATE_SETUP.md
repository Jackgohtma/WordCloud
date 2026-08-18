# Microsoft Forms → Power Automate → Azure setup

## Expected Microsoft Forms data

- Responder name captured by Microsoft Forms.
- Question 4: `What would you wish to see in the future Tribe exhibitions?`
- Question 5: `Share your AI wish list for your day to day operations.`
- Question 6: `Please share your feedback or comments about the event`

## Create the flow

1. Create an **Automated cloud flow**.
2. Add the Microsoft Forms trigger **When a new response is submitted**.
3. Select the event Form.
4. Add **Get response details** and select the same Form.
5. Add the **HTTP** action.

Configure the HTTP action:

| Setting | Value |
|---|---|
| Method | `POST` |
| URI | `https://YOUR-STATIC-APP.azurestaticapps.net/api/forms-ingest` |
| Header `Content-Type` | `application/json` |
| Header `x-forms-intake-secret` | Same value as Azure `FORMS_INTAKE_SECRET` |

Use this JSON body and replace each placeholder with the matching dynamic
content from Forms:

```json
{
  "responseId": "<Microsoft Forms Response Id>",
  "name": "<Responder name>",
  "futureExhibitionWish": "<Answer to question 4>",
  "aiWish": "<Answer to question 5>",
  "feedback": "<Answer to question 6>"
}
```

The response ID prevents a retried flow from creating a duplicate row.

## Add failure monitoring

1. Add a condition after the HTTP action.
2. Treat status codes `200` and `201` as successful.
3. For any other status, notify the event owner by the approved channel.
4. Keep the flow run history long enough to troubleshoot the event.

## Test cases

Run these tests before the event:

1. A normal response returns `201` and appears on screen.
2. Re-running the same response returns `200` with `duplicate: true`.
3. An incorrect intake secret returns `401`.
4. Missing any required answer returns `400`.
5. Capitalisation and punctuation variants of the same AI wish group together.

Do not put the intake secret in Microsoft Forms, the static frontend or a QR
code. It belongs only in Power Automate and Azure application settings.
