import { app } from "@azure/functions";
import { hasReportAccess } from "../lib/security.js";
import { listResponses } from "../lib/storage.js";

app.http("report", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "report",
  handler: async (request, context) => {
    if (!hasReportAccess(request)) {
      return { status: 401, headers: { "Cache-Control": "no-store" }, jsonBody: { error: "Invalid report access code." } };
    }
    try {
      const rows = await listResponses();
      return { status: 200, headers: { "Cache-Control": "no-store" }, jsonBody: { rows } };
    } catch (error) {
      context.error("Report failed", error);
      return { status: 500, jsonBody: { error: "Unable to load the report." } };
    }
  }
});
