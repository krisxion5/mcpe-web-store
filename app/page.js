import { getProducts, getPatrons } from "@/lib/products";
import Store from "@/components/Store";
export const revalidate = 60;
export default async function Home() {
  const [products, patrons] = await Promise.all([getProducts(), getPatrons()]);
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
  const hire = process.env.NEXT_PUBLIC_HIRE_LINK || `mailto:${email}?subject=Store%20project`;
  return <Store products={products} patrons={patrons} email={email} hire={hire} />;
}
