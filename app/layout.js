import "./globals.css";
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000")),
  title: "MCPE Web Store", description: "Ranks, grades, subscriptions and gems for our Bedrock server. Demo store.",
  openGraph: { title: "MCPE Web Store", description: "Official demo store for a Minecraft Bedrock server.", type: "website" },
};
export const viewport = { themeColor: "#0a0a0a" };
export default function Root({ children }) {
  return (<html lang="en" data-theme="dark"><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>);
}
