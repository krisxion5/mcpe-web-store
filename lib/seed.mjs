const P = (id, name, category, realm, description, price, badge = "") => ({ id, name, category, realm, description, price, badge, available: true });
export const REALMS = ["survival", "lifesteal", "duels", "oneblock"];
export const SEED = [
  P("vip", "VIP", "Ranks", "survival", "Colored chat, /kit vip and 2 extra homes.", 4.99, "Popular"),
  P("mvp", "MVP", "Ranks", "survival", "Everything in VIP plus lobby /fly and a cosmetic trail.", 9.99),
  P("legend", "Legend", "Ranks", "survival", "Top survival rank: priority queue, all kits, custom tag.", 19.99, "Limited"),
  P("ls-warrior", "Warrior", "Ranks", "lifesteal", "Extra heart cap and a warrior kit every 3 days.", 7.99, "New"),
  P("ls-reaper", "Reaper", "Ranks", "lifesteal", "Heart-steal particles and revive discount.", 14.99),
  P("duel-elite", "Elite", "Ranks", "duels", "Custom kill messages and 3 saved kit layouts.", 6.99),
  P("ob-miner", "Miner", "Ranks", "oneblock", "Faster block regen and a starter island kit.", 5.99),
  P("ob-architect", "Architect", "Ranks", "oneblock", "Bigger island border and 2 bonus phases.", 11.99, "Popular"),
  P("builder", "Builder", "Grades", "survival", "Extra build tools on creative plots.", 6.99, "New"),
  P("crate-common", "Common Crate x5", "Crates", "survival", "Five keys. Resources, tools and a rare cosmetic chance.", 2.99),
  P("crate-mythic", "Mythic Crate x3", "Crates", "survival", "Three keys with boosted rare drops.", 7.99, "Popular"),
  P("crate-heart", "Heart Crate x3", "Crates", "lifesteal", "Chance at bonus hearts and revive tokens.", 4.99),
  P("crate-block", "Phase Crate x3", "Crates", "oneblock", "Skip-phase tokens and rare blocks.", 3.99),
  P("sub-monthly", "Supporter Monthly", "Subscriptions", "all", "Renews monthly. Cancel anytime.", 3.99),
  P("sub-plus", "Supporter+ Monthly", "Subscriptions", "all", "Supporter perks plus 300 gems every month.", 8.99, "Limited"),
  P("gems500", "500 Gems", "Gems", "all", "Spend in the in-game shop.", 4.99),
  P("gems1200", "1200 Gems", "Gems", "all", "Best value starter bundle.", 9.99),
  P("gems3000", "3000 Gems", "Gems", "all", "Bulk bundle with a bonus 10%.", 22.99, "Popular"),
].map((p, i) => ({ ...p, order: i + 1 }));
export const PATRONS_SEED = [
  { name: "Demo Patron A", tier: "Legend", display: true, joined: "2026-01-12" },
  { name: "Demo Patron B", tier: "MVP", display: true, joined: "2026-03-02" },
  { name: "Demo Patron C", tier: "VIP", display: true, joined: "2026-05-20" },
];
