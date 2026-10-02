import { notFound } from "next/navigation";
const D = "This is demo placeholder text, not legal advice. Replace it with your own before launch.";
const P = {
  terms: ["Terms & Conditions", [["Demo notice", "MCPE Web Store is a demo project. No payments are processed and no items are delivered. " + D], ["Using the store", "You must provide an in-game name you own. Orders in a live store would be tied to that name, so check it before you buy."], ["Purchases", "A live store would list its payment provider, refund terms and delivery rules here. None apply to this demo."], ["Conduct", "Rule-breaking can lead to removal of ranks or access in a live store. See the Rules page."], ["Affiliation", "Not affiliated with or endorsed by Mojang AB or Microsoft."]]],
  privacy: ["Privacy Policy", [["Demo notice", D], ["What this demo stores in your browser", "Your in-game name, platform, theme, currency and cookie choice, using local storage. Your session ID is kept in memory only."], ["If you create an account", "Your email and a salted password hash are saved in the site's database. Passwords are never stored in plain text."], ["Not used", "No analytics, advertising or tracking runs in this demo."], ["Contact", "Use the support email in the footer."]]],
  rules: ["Rules", [["Demo notice", D], ["Respect", "No harassment, hate speech or spam."], ["Fair play", "No cheating, exploits or unfair client mods."], ["Purchases", "Chargebacks in a live store would lead to a ban. Not applicable to this demo."]]],
};
export async function generateMetadata({ params }) { const { slug } = await params; return { title: P[slug]?.[0] }; }
export default async function Legal({ params }) {
  const { slug } = await params; const p = P[slug]; if (!p) notFound();
  return <main id="main" className="wrap prose"><a href="/">Back to store</a><h1>{p[0]}</h1>{p[1].map(([h, t]) => <section key={h}><h2>{h}</h2><p>{t}</p></section>)}<p className="note">Last updated: demo build.</p></main>;
}
