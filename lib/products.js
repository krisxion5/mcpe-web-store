import "server-only";
import { db } from "./db";
import { SEED, PATRONS_SEED } from "./seed.mjs";
async function list(col, seed, filter = {}) {
  try {
    const rows = await (await db()).collection(col).find(filter, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return rows.length ? rows : seed;
  } catch { return seed; }
}
export const getProducts = () => list("products", SEED, { available: true });
export const getPatrons = () => list("patrons", PATRONS_SEED, { display: true });
