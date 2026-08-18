import { createHash, randomUUID } from "node:crypto";
import { TableClient } from "@azure/data-tables";

const tableName = process.env.AZURE_TABLE_NAME || "TribeResponses";
const partitionKey = process.env.EVENT_PARTITION_KEY || "TMA-TRIBE-2026";
let clientPromise;

function escapeOData(value) {
  return value.replaceAll("'", "''");
}

export function normalizeWish(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

export async function getTableClient() {
  clientPromise ??= (async () => {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) throw new Error("AZURE_STORAGE_CONNECTION_STRING is not configured.");
    const client = TableClient.fromConnectionString(connectionString, tableName);
    await client.createTable();
    return client;
  })();
  return clientPromise;
}

function rowKeyFor(sourceId) {
  if (sourceId) return `source-${createHash("sha256").update(sourceId).digest("hex")}`;
  return `${Date.now().toString().padStart(13, "0")}-${randomUUID()}`;
}

export async function saveResponse(response) {
  const client = await getTableClient();
  const entity = {
    partitionKey,
    rowKey: rowKeyFor(response.sourceId),
    sourceId: response.sourceId || "",
    name: response.name,
    futureExhibitionWish: response.futureExhibitionWish,
    aiWish: response.aiWish,
    aiWishKey: normalizeWish(response.aiWish),
    feedback: response.feedback,
    submittedAt: response.submittedAt
  };
  try {
    await client.createEntity(entity);
    return { duplicate: false };
  } catch (error) {
    if (error?.statusCode === 409) return { duplicate: true };
    throw error;
  }
}

export async function listResponses() {
  const client = await getTableClient();
  const rows = [];
  const entities = client.listEntities({
    queryOptions: { filter: `PartitionKey eq '${escapeOData(partitionKey)}'` }
  });
  for await (const entity of entities) {
    rows.push({
      id: entity.rowKey,
      name: entity.name || "",
      futureExhibitionWish: entity.futureExhibitionWish || "",
      aiWish: entity.aiWish || "",
      aiWishKey: entity.aiWishKey || normalizeWish(entity.aiWish || ""),
      feedback: entity.feedback || "",
      submittedAt: entity.submittedAt || entity.timestamp?.toISOString?.() || ""
    });
  }
  return rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
