import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
export const metadata = { robots: { index: false } };
export default async function Admin() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");
  return <main id="main" className="wrap"><h1>Admin</h1><p>Signed in as {admin.email}. Editors for products, categories, patrons, orders, users and settings plug in here.</p></main>;
}
