// Explicit Azure Functions v4 entry point. The Functions host loads this file
// from package.json, which registers every HTTP endpoint below.
import "./functions/forms-ingest.js";
import "./functions/live.js";
import "./functions/report.js";
