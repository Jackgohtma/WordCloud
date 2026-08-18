import { app } from "@azure/functions";
import { hasIntakeAccess } from "../lib/security.js";
import { saveResponse } from "../lib/storage.js";

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

app.http("forms-ingest", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "forms-ingest",
  handler: async (request, context) => {
    if (!hasIntakeAccess(request)) {
      return { status: 401, jsonBody: { error: "Invalid Forms intake secret." } };
    }

    try {
      const body = await request.json();
      const response = {
        sourceId: cleanText(body.responseId, 160),
        name: cleanText(body.name, 80),
        futureExhibitionWish: cleanText(body.futureExhibitionWish, 240),
        aiWish: cleanText(body.aiWish, 500),
        feedback: cleanText(body.feedback, 500),
        submittedAt: new Date().toISOString()
      };
      if (!response.name || !response.futureExhibitionWish || !response.aiWish || !response.feedback) {
        return { status: 400, jsonBody: { error: "Name and all three Microsoft Forms answers are required." } };
      }
      const result = await saveResponse(response);
      return { status: result.duplicate ? 200 : 201, jsonBody: { ok: true, duplicate: result.duplicate } };
    } catch (error) {
      context.error("Forms intake failed", error);
      return { status: 500, jsonBody: { error: "Unable to save the response." } };
    }
  }
});
