import { app } from "@azure/functions";
import { saveResponse } from "../lib/storage.js";

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

app.http("manual-entry", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manual-entry",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const response = {
        sourceId: "",
        name: cleanText(body.name, 80),
        futureExhibitionWish: cleanText(body.futureExhibitionWish, 240),
        aiWish: cleanText(body.aiWish, 500),
        feedback: cleanText(body.feedback, 500),
        submittedAt: new Date().toISOString()
      };
      if (!response.name || !response.futureExhibitionWish || !response.aiWish || !response.feedback) {
        return { status: 400, jsonBody: { error: "Name and all three answers are required." } };
      }
      await saveResponse(response);
      return { status: 201, jsonBody: { ok: true } };
    } catch (error) {
      context.error("Manual entry failed", error);
      return { status: 500, jsonBody: { error: "Unable to save the response." } };
    }
  }
});

