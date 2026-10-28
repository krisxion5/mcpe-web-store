import "./globals.css";
import { Bodoni_Moda, Jost } from "next/font/google";
// Luxury pairing: high-contrast Bodoni Moda (display) + Jost (Futura-style labels/body).
// Variable names are kept (--font-galada / --font-inter) so existing CSS picks them up.
const display = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-galada", display: "swap" });
const sans = Jost({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000")),
  title: "EnderMC Store", description: "Ranks, crates, cosmetics and tokens for EnderMC, a Minecraft Bedrock server. Demo store.",
  openGraph: { title: "EnderMC Store", description: "Official demo store for EnderMC, a Minecraft Bedrock server.", type: "website" },
};
export const viewport = { themeColor: "#0a0a0a" };
export default function Root({ children }) {
  return (<html lang="en" data-theme="dark" className={`${display.variable} ${sans.variable}`}><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>);
}
