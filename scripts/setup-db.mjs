import { MongoClient } from "mongodb";
import { SEED, PATRONS_SEED } from "../lib/seed.mjs";
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Set MONGODB_URI first."); process.exit(1); }
const reset = process.argv.includes("--reset"); // wipes products + patrons, then reseeds
const c = await new MongoClient(uri).connect();
const d = c.db(process.env.MONGODB_DB || "mcpe_store");
await d.collection("users").createIndex({ email: 1 }, { unique: true });
await d.collection("products").createIndex({ id: 1 }, { unique: true });
await d.collection("products").createIndex({ category: 1, order: 1 });
await d.collection("orders").createIndex({ userId: 1, createdAt: -1 });
if (reset) { await d.collection("products").deleteMany({}); await d.collection("patrons").deleteMany({}); }
if (!(await d.collection("products").countDocuments())) await d.collection("products").insertMany(SEED.map((p) => ({ ...p })));
if (!(await d.collection("patrons").countDocuments())) await d.collection("patrons").insertMany(PATRONS_SEED.map((p) => ({ ...p })));
console.log("Database ready.");
await c.close();
