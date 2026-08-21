import { app } from "@azure/functions";
import { listResponses } from "../lib/storage.js";

app.http("live", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "live",
  handler: async (_request, context) => {
    try {
      const rows = await listResponses();
      const groups = new Map();
      for (const row of [...rows].reverse()) {
        if (!row.aiWishKey) continue;
        const existing = groups.get(row.aiWishKey);
        if (existing) existing.count += 1;
        else groups.set(row.aiWishKey, { key: row.aiWishKey, phrase: row.aiWish, count: 1 });
      }
      const phrases = [...groups.values()]
        .sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase))
        .slice(0, 70);
      const visiblePledges = rows.filter((row) => row.feedback && !row.pledgeDeleted);
      const messages = visiblePledges
        .slice(0, 120)
        .map((row) => ({ id: row.id, name: row.name, message: row.feedback, pinned: row.pledgePinned, createdAt: row.submittedAt }));
      return {
        status: 200,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          phrases,
          messages,
          stats: {
            wishlistCount: rows.filter((row) => row.aiWish).length,
            pledgeCount: rows.filter((row) => row.feedback).length
          },
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      context.error("Live feed failed", error);
      return { status: 500, jsonBody: { error: "Unable to load the live wall." } };
    }
  }
});
