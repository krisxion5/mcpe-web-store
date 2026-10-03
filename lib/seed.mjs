const P = (id, name, category, description, price, badge = "") => ({ id, name, category, description, price, badge, available: true });
export const SEED = [
  P("vip", "VIP", "Ranks", "Colored chat, /kit vip and 2 extra homes.", 4.99, "Popular"),
  P("mvp", "MVP", "Ranks", "Everything in VIP plus lobby /fly and a trail.", 9.99),
  P("legend", "Legend", "Ranks", "Top rank: priority queue, all kits, custom tag.", 19.99, "Limited"),
  P("builder", "Builder", "Grades", "Extra build tools on creative plots.", 6.99, "New"),
  P("miner", "Miner", "Grades", "Auto-smelt pickaxe and a mining kit.", 5.99),
  P("crate-common", "Common Crate x5", "Crates", "Five keys with solid everyday drops.", 2.99),
  P("crate-mythic", "Mythic Crate x3", "Crates", "Three keys with boosted rare drops.", 7.99, "Popular"),
  P("sub-monthly", "Supporter Monthly", "Subscriptions", "Renews monthly. Cancel anytime.", 3.99),
  P("sub-plus", "Supporter+ Monthly", "Subscriptions", "Supporter perks plus 300 tokens every month.", 8.99, "Limited"),
  P("tok-100", "100 Tokens", "Tokens", "Starter pack for the token shop.", 1.99),
  P("tok-500", "500 Tokens", "Tokens", "Enough for a few crates and cosmetics.", 4.99),
  P("tok-1200", "1200 Tokens", "Tokens", "Includes a 10% bonus.", 9.99, "Popular"),
  P("tok-3000", "3000 Tokens", "Tokens", "Best value. Includes a 20% bonus.", 22.99, "New"),
].map((p, i) => ({ ...p, order: i + 1 }));
export const PATRONS_SEED = [
  { name: "Demo Patron A", tier: "Legend", display: true, joined: "2026-01-12" },
  { name: "Demo Patron B", tier: "MVP", display: true, joined: "2026-03-02" },
  { name: "Demo Patron C", tier: "VIP", display: true, joined: "2026-05-20" },
];
