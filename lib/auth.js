import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { db } from "./db";
const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(s);
};
export async function setSession(id) {
  const t = await new SignJWT({}).setSubject(String(id)).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  (await cookies()).set("sid", t, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 604800 });
}
export async function getUser() {
  const t = (await cookies()).get("sid")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return await (await db()).collection("users").findOne({ _id: new ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
  } catch { return null; }
}
// Role is read from the database, never from the token or client.
export async function requireAdmin() {
  const u = await getUser();
  return u?.role === "ADMIN" ? u : null;
}
