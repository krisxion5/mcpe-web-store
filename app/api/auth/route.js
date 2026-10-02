import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
const hits = new Map(); // per-instance; use Upstash/Vercel KV for global limits
const limited = (ip) => { const n = Date.now(), r = (hits.get(ip) || []).filter((t) => n - t < 60000); r.push(n); hits.set(ip, r); return r.length > 10; };
const json = (b, s = 200) => Response.json(b, { status: s });
export async function POST(req) {
  try { return await handle(req); } catch (e) { console.error(e); return json({ error: "Server error. Check MONGODB_URI and AUTH_SECRET." }, 500); }
}
async function handle(req) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return json({ error: "Bad origin" }, 403);
  if (limited(req.headers.get("x-forwarded-for") || "x")) return json({ error: "Too many attempts. Wait a minute." }, 429);
  const { mode, email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string" || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 100)
    return json({ error: "Enter a valid email and a password of 8+ characters." }, 400);
  const users = (await db()).collection("users"), e = email.toLowerCase();
  if (mode === "register") {
    if (await users.findOne({ email: e })) return json({ error: "That email is already registered." }, 409);
    const r = await users.insertOne({ email: e, passwordHash: await bcrypt.hash(password, 12), role: "USER", ign: null, createdAt: new Date() });
    await setSession(r.insertedId);
    return json({ ok: true });
  }
  const u = await users.findOne({ email: e });
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return json({ error: "Email or password is incorrect." }, 401);
  await setSession(u._id);
  return json({ ok: true });
}
