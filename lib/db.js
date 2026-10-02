import "server-only";
import { MongoClient } from "mongodb";
export async function db() {
  const { MONGODB_URI, MONGODB_DB } = process.env;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  global._mongo ??= new MongoClient(MONGODB_URI).connect();
  return (await global._mongo).db(MONGODB_DB || "mcpe_store");
}
export async function ensureIndexes() {
  const d = await db();
  await d.collection("users").createIndex({ email: 1 }, { unique: true });
  await d.collection("products").createIndex({ category: 1, order: 1 });
  await d.collection("orders").createIndex({ userId: 1, createdAt: -1 });
}
