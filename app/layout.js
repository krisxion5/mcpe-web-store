import "./globals.css";
import { Cormorant_Garamond, Inter, Manrope } from "next/font/google";
// Elegant display serif. Variable name kept as --font-galada so existing CSS picks it up.
const galada = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-galada", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000")),
  title: "EnderMC Store", description: "Ranks, crates, cosmetics and tokens for EnderMC, a Minecraft Bedrock server. Demo store.",
  openGraph: { title: "EnderMC Store", description: "Official demo store for EnderMC, a Minecraft Bedrock server.", type: "website" },
};
export const viewport = { themeColor: "#0a0a0a" };
export default function Root({ children }) {
  return (<html lang="en" data-theme="dark" className={`${galada.variable} ${inter.variable} ${manrope.variable}`}><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>);
}
