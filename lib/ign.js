export const IGN_RE = /^[A-Za-z0-9_ ]{3,16}$/;
export const validIgn = (s) => typeof s === "string" && IGN_RE.test(s.trim());
// FORMAT CHECK ONLY. Replace with a real server-side lookup later.
export async function verifyIgnWithServer(_ign) { return { verified: false }; }
