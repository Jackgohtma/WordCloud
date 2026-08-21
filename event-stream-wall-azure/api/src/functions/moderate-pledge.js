import { app } from "@azure/functions";
import { updatePledgeModeration } from "../lib/storage.js";

app.http("moderate-pledge", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "moderate-pledge",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const id = typeof body.id === "string" ? body.id.trim() : "";
      const action = typeof body.action === "string" ? body.action.trim().toLowerCase() : "";
      if (!id || !["pin", "unpin", "delete"].includes(action)) {
        return { status: 400, jsonBody: { error: "A valid pledge and action are required." } };
      }
      await updatePledgeModeration(id, action);
      return { status: 200, jsonBody: { ok: true } };
    } catch (error) {
      context.error("Pledge moderation failed", error);
      const status = error?.statusCode === 404 ? 404 : 500;
      return { status, jsonBody: { error: status === 404 ? "Pledge not found." : "Unable to update the pledge." } };
    }
  }
});

