"use client";
import { memo, useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import Music from "./Music";
import { sfx } from "../lib/sfx";
const IGN_RE = /^[A-Za-z0-9_ ]{3,16}$/;
const CATS = ["Ranks", "Grades", "Crates", "Subscriptions", "Tokens"];
// Regional STORE prices (priced for each market, not live FX). r = multiplier on the USD base, s = rounding step, c = charm offset.
const CUR = {
  INR: { r: 40, s: 10, c: 1, l: "en-IN" }, PKR: { r: 120, s: 10, c: 1, l: "en-PK" }, BDT: { r: 60, s: 10, c: 1, l: "en-BD" },
  PHP: { r: 40, s: 5, c: 1, l: "en-PH" }, IDR: { r: 12000, s: 1000, c: 0, l: "id-ID" }, USD: { r: 1, l: "en-US" },
  EUR: { r: 0.92, l: "en-IE" }, GBP: { r: 0.79, l: "en-GB" }, CAD: { r: 1.37, l: "en-CA" }, AUD: { r: 1.5, l: "en-AU" }, AED: { r: 3.67, l: "en-AE" },
};
const FAQ = [
  ["What is MCPE Web Store?", "A demo storefront for a Minecraft Bedrock server. Nothing here is real: no payments, no delivery."],
  ["How do I purchase something?", "Add items to your cart, open it, re-enter your gamertag and place the demo order."],
  ["What are Tokens?", "Tokens are the in-game currency for the token shop. Packs bigger than 500 include bonus tokens."],
  ["Why do I need my IGN?", "So an order is tied to the right account. This demo checks the format only, not that the account exists."],
  ["Can I change my IGN?", "Yes. Use the IGN button at any time."],
];
const wrap = (s) => ({ get: (k) => { try { return s().getItem(k); } catch { return null; } }, set: (k, v) => { try { s().setItem(k, v); } catch {} } });
const store = wrap(() => localStorage), sess = wrap(() => sessionStorage);
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function Count({ to }) {
  const r = useRef();
  useEffect(() => { const t0 = performance.now(); let f; const step = (t) => { const k = Math.min((t - t0) / 1200, 1); if (r.current) r.current.textContent = Math.round(to * (1 - (1 - k) ** 3)).toLocaleString("en-US"); if (k < 1) f = requestAnimationFrame(step); }; f = requestAnimationFrame(step); return () => cancelAnimationFrame(f); }, [to]);
  return <span ref={r}>0</span>;
}
function fly(el) {
  const cb = document.querySelector(".cart");
  if (!el || !cb || calm()) return;
  const a = el.getBoundingClientRect(), b = cb.getBoundingClientRect(), d = document.createElement("i");
  d.className = "fly"; d.style.cssText = `left:${a.left + a.width / 2}px;top:${a.top + a.height / 2}px`; document.body.appendChild(d);
  const dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height / 2 - a.top - a.height / 2;
  d.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.3)`, opacity: 0.4 }], { duration: 600, easing: "cubic-bezier(.5,0,.8,.5)" }).onfinish = () => d.remove();
}
function burst() {
  if (calm()) return;
  for (let k = 0; k < 22; k++) {
    const d = document.createElement("i"); d.className = "conf"; d.style.background = k % 2 ? "var(--acc)" : "var(--acc2)"; document.body.appendChild(d);
    const a = Math.random() * 6.28, r = 90 + Math.random() * 160;
    d.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r + 80}px) rotate(${Math.random() * 540}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => d.remove();
  }
}
const S = { fill: "color-mix(in srgb, var(--acc2) 62%, #000)" };
const ICONS = {
  Ranks: <><path d="M6 48 L10 18 L23 31 L32 12 L41 31 L54 18 L58 48 Z" fill="var(--acc)" /><path d="M32 12 L41 31 L58 48 L32 48 Z" fill="var(--acc2)" /><rect x="6" y="48" width="52" height="7" style={S} /></>,
  Grades: <><path d="M32 6 L54 14 V32 C54 44 44 54 32 58 C20 54 10 44 10 32 V14 Z" fill="var(--acc)" /><path d="M32 6 L54 14 V32 C54 44 44 54 32 58 Z" fill="var(--acc2)" /><path d="M32 20 L36 29 L46 30 L38.5 36.5 L41 46 L32 41 L23 46 L25.5 36.5 L18 30 L28 29 Z" fill="var(--ink)" /></>,
  Crates: <><path d="M32 6 L56 18 L32 30 L8 18 Z" fill="var(--acc)" /><path d="M8 18 L32 30 V58 L8 46 Z" fill="var(--acc2)" /><path d="M56 18 L32 30 V58 L56 46 Z" style={S} /></>,
  Subscriptions: <><path d="M32 10 A22 22 0 1 1 10 32" fill="none" stroke="var(--acc)" strokeWidth="9" strokeLinecap="round" /><path d="M0 26 L22 26 L11 44 Z" fill="var(--acc2)" /><circle cx="32" cy="32" r="5" fill="var(--acc)" /></>,
  Tokens: <>{[40, 28, 16].map((y) => <g key={y}><ellipse cx="32" cy={y + 8} rx="22" ry="9" style={S} /><rect x="10" y={y} width="44" height="8" fill="var(--acc2)" /><ellipse cx="32" cy={y} rx="22" ry="9" fill="var(--acc)" /></g>)}</>,
};
function Ico({ c }) { return <svg className="ico" viewBox="0 0 64 64" aria-hidden="true">{ICONS[c] || ICONS.Crates}</svg>; }
const Card = memo(function Card({ p, i, price, inCart, add }) {
  return (<li className="card" style={{ "--n": i < 8 ? i : 0 }}><div className="top"><Ico c={p.category} /><span className="tag">{p.category}</span></div>
    <div><h3>{p.name}{p.badge && <span className="badge">{p.badge}</span>}</h3><p>{p.description}</p></div>
    <div className="buy"><b>{price}</b><button className="btn" disabled={!p.available} onClick={(e) => add(p, e.currentTarget)}>{inCart ? "In cart" : "Add to cart"}</button></div></li>);
});

export default function Store({ products, patrons, email, hire }) {
  const [ign, setIgn] = useState(null), [ignOpen, setIgnOpen] = useState(false), [ignVal, setIgnVal] = useState(""), [err, setErr] = useState("");
  const [cat, setCat] = useState("All"), [q, setQ] = useState(""), [cur, setCur] = useState("INR");
  const [cart, setCart] = useState([]), [cartOpen, setCartOpen] = useState(false), [step, setStep] = useState(null), [confirm, setConfirm] = useState(""), [cErr, setCErr] = useState(""), [placing, setPlacing] = useState(false);
  const [toasts, setToasts] = useState([]), [theme, setTheme] = useState("dark"), [menu, setMenu] = useState(false), [consent, setConsent] = useState("done"), [top, setTop] = useState(false);
  const [auth, setAuth] = useState(null), [form, setForm] = useState({ email: "", password: "" }), [show, setShow] = useState(false), [user, setUser] = useState(null);
  const [active, setActive] = useState(""), [sc2, setSc2] = useState(false), [sort, setSort] = useState("feat");
  const searchRef = useRef();
  const dq = useDeferredValue(q);
  const toast = (msg, type = "ok") => { if (type === "err") sfx("err"); const id = Math.random(); setToasts((t) => [...t.slice(-3), { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500); };
  const conv = (n) => { const m = CUR[cur]; return m.s ? Math.max(m.s - m.c, Math.round((n * m.r) / m.s) * m.s - m.c) : Math.max(0.99, Math.ceil(n * m.r) - 0.01); };
  const fmtV = (v) => new Intl.NumberFormat(CUR[cur].l, { style: "currency", currency: cur, minimumFractionDigits: CUR[cur].s ? 0 : 2, maximumFractionDigits: CUR[cur].s ? 0 : 2 }).format(v);
  const fmt = (n) => fmtV(conv(n));
  const saveCart = (c) => { setCart(c); store.set("cart", JSON.stringify(c)); };
  const loadUser = () => fetch("/api/auth").then((r) => r.json()).then((u) => setUser(u.email ? u : null)).catch(() => {});

  useEffect(() => {
    const s = store.get("ign"); if (s) { setIgn(s); setIgnVal(s); }
    { const sv = store.get("cur2"); setCur(CUR[sv] ? sv : "INR"); };
    try { const c = JSON.parse(store.get("cart") || "[]"); if (Array.isArray(c)) setCart(c.filter((x) => typeof x === "string")); } catch {}
    if (!sess.get("ignSeen")) setIgnOpen(true);
    const t = store.get("theme") || "dark"; setTheme(t); document.documentElement.dataset.theme = t;
    setConsent(store.get("consent") || "pending"); loadUser();
    const sc = () => { setTop(scrollY > 600); setSc2(scrollY > 20); }; addEventListener("scroll", sc, { passive: true });
    const k = (e) => { if (e.key === "Escape") { setStep(null); setAuth(null); setMenu(false); setCartOpen(false); if (store.get("ign")) setIgnOpen(false); return; } if (e.target.matches("input,textarea,select")) return; if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); } if (e.key === "c") setCartOpen(true); if (e.key === "?") toast("Shortcuts: / search, C cart, Esc close"); };
    addEventListener("keydown", k);
    const seen = new WeakMap(); // double-click guard
    const g = (e) => { const b = e.target.closest?.("button,.btn"); if (!b) return; const n = Date.now(); if (n - (seen.get(b) || 0) < 700) { e.preventDefault(); e.stopPropagation(); toast("Slow down! One click at a time.", "err"); return; } seen.set(b, n); };
    document.addEventListener("click", g, true);
    const clk = (e) => { if (e.target.closest?.("button,.btn,a,summary,select")) sfx(e.defaultPrevented ? "err" : "click"); };
    document.addEventListener("click", clk, true);
    let lastH = 0, lastEl = null;
    const hv = (e) => { const b = e.target.closest?.("button,.btn,.card,.cat,a"); if (b && b !== lastEl) { lastEl = b; const n = performance.now(); if (n - lastH > 90) { lastH = n; sfx("hover"); } } else if (!b) lastEl = null; };
    if (matchMedia("(hover:hover)").matches) document.addEventListener("pointerover", hv, { passive: true });
    return () => { removeEventListener("scroll", sc); removeEventListener("keydown", k); document.removeEventListener("click", g, true); document.removeEventListener("click", clk, true); document.removeEventListener("pointerover", hv); };
  }, []);
  useEffect(() => { // 3D card tilt: transform-only, one card at a time, hover devices only
    if (!matchMedia("(hover:hover)").matches || calm()) return;
    let raf = 0, cur = null, ev = null;
    const rest = (c) => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); };
    const move = (e) => {
      const c = e.target.closest?.(".card"); if (cur && cur !== c) rest(cur); cur = c; ev = e; if (!c || raf) return;
      raf = requestAnimationFrame(() => { raf = 0; if (!cur) return; const r = cur.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5; cur.style.setProperty("--ry", (x * 10).toFixed(2) + "deg"); cur.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg"); });
    };
    document.addEventListener("pointermove", move, { passive: true }); return () => document.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => { if (cartOpen || ignOpen || step || auth) sfx("open"); }, [cartOpen, ignOpen, step, auth]);
  useEffect(() => { const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" }); document.querySelectorAll("main section[id]").forEach((e) => io.observe(e)); return () => io.disconnect(); }, []);
  useEffect(() => { // neon cursor ring (one element, transform only)
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches || calm()) return;
    const d = document.querySelector(".cursor"); if (!d) return; let x = 0, y = 0, raf = 0;
    const mv = (e) => { x = e.clientX; y = e.clientY; d.classList.toggle("big", !!e.target.closest?.("button,a,.card,.cat,select,input,summary")); if (!raf) raf = requestAnimationFrame(() => { raf = 0; d.style.transform = `translate3d(${x}px,${y}px,0)`; d.classList.add("show"); }); };
    document.addEventListener("pointermove", mv, { passive: true }); return () => document.removeEventListener("pointermove", mv);
  }, []);
  useEffect(() => { // pause off-screen looping animations
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.toggleAttribute("data-off", !e.isIntersecting)), { rootMargin: "100px" });
    document.querySelectorAll(".ticker,.bigtype,.coinwrap").forEach((e) => io.observe(e)); return () => io.disconnect();
  }, []);
  useEffect(() => { // scroll progress fallback; modern browsers do this in CSS off the main thread
    if (CSS.supports("animation-timeline: scroll()")) return;
    const bar = document.querySelector(".progress"); let raf = 0;
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const h = document.documentElement.scrollHeight - innerHeight; if (bar) bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; }); };
    addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const els = [...document.querySelectorAll("main > section:not(.hero)")]; els.forEach((e) => e.classList.add("rv"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 });
    els.forEach((e) => io.observe(e)); return () => io.disconnect();
  }, []);
  useEffect(() => { const lock = menu || ignOpen || cartOpen || step || auth; document.body.style.overflow = lock ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menu, ignOpen, cartOpen, step, auth]);

  const flip = () => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); store.set("theme", t); document.documentElement.dataset.theme = t; };
  const saveIgn = () => { const v = ignVal.trim(); if (!IGN_RE.test(v)) return setErr("Bedrock gamertags: 3 to 16 letters, numbers, spaces or underscores."); store.set("ign", v); sess.set("ignSeen", "1"); setIgn(v); setIgnOpen(false); setErr(""); toast(`Welcome, ${v}!`); };
  const add = (p, el) => { if (cart.includes(p.id)) return toast(`${p.name} is already in your cart`, "err"); saveCart([...cart, p.id]); fly(el); sfx("add"); toast(`${p.name} added to cart`); };
  const addRef = useRef(); addRef.current = add;
  const onAdd = useCallback((p, el) => addRef.current(p, el), []);
  const items = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean), total = items.reduce((a, p) => a + p.price, 0);
  const totalV = items.reduce((a, p) => a + conv(p.price), 0);
  const openCheckout = () => { if (!ign) return setIgnOpen(true); setCartOpen(false); setConfirm(""); setCErr(""); setStep("check"); };
  const place = () => {
    if (confirm.trim().toLowerCase() !== ign.toLowerCase()) return setCErr(`That doesn't match your saved IGN (${ign}). Checkout blocked.`);
    setPlacing(true); setTimeout(() => { setPlacing(false); setStep("demo"); saveCart([]); burst(); sfx("ok"); toast("This is a demo project. Hire me to build the full version."); }, 900);
  };
  const submitAuth = async (e) => { e.preventDefault(); const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: auth, ...form }) }); const d = await r.json().catch(() => ({})); if (r.ok) { toast(auth === "register" ? "Account created" : "Signed in"); setAuth(null); loadUser(); } else toast(d.error || "Something went wrong.", "err"); };
  const logout = async () => { await fetch("/api/auth", { method: "DELETE" }).catch(() => {}); setUser(null); toast("Logged out"); };
  const list0 = products.filter((p) => (cat === "All" || p.category === cat) && (p.name + p.description).toLowerCase().includes(dq.toLowerCase()));
  const list = sort === "feat" ? list0 : [...list0].sort((a, b) => (sort === "lo" ? a.price - b.price : b.price - a.price));
  const featured = products.filter((p) => p.badge === "Popular").slice(0, 3);
  const W = (t, d) => <span style={{ "--d": d }}>{t} </span>;
  const ctl = (<><select aria-label="Currency" value={cur} onChange={(e) => { setCur(e.target.value); store.set("cur2", e.target.value); }}>{Object.keys(CUR).map((c) => <option key={c}>{c}</option>)}</select>
    <button className="ghost" onClick={() => setIgnOpen(true)}>{ign || "Set IGN"}</button>
    <button className="ghost" aria-label="Toggle theme" onClick={flip}>{theme === "dark" ? "Light" : "Dark"}</button>
    {user?.role === "ADMIN" && <a className="ghost" href="/admin">Admin</a>}
    {user ? <button className="ghost" onClick={logout}>Log out</button> : <button className="ghost" onClick={() => setAuth("login")}>Login</button>}</>);

  return (<>
    <div className="progress" aria-hidden="true" /><div className="curtain" aria-hidden="true" /><div className="cursor" aria-hidden="true"><i /></div>
    <div className="demo-bar">DEMO PROJECT: nothing here is real. <a href={hire}>Hire me to build the full version</a></div>
    <header className={"head" + (sc2 ? " s" : "")}><div className="wrap bar">
      <a className="logo" href="#main">MCPE<span>Store</span></a>
      <nav className={menu ? "open" : ""} aria-label="Main" onClick={(e) => e.target.closest("a") && setMenu(false)}>{[["join", "Join"], ["store", "Store"], ["patrons", "Patrons"], ["about", "About"], ["faq", "FAQ"]].map(([id, t]) => <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{t}</a>)}<div className="mt">{ctl}</div></nav>
      <div className="tools"><Music /><div className="dt">{ctl}</div>
        <button className="ghost cart" aria-label={`Cart, ${cart.length} items`} onClick={() => setCartOpen(true)}>Cart<i key={cart.length}>{cart.length}</i></button>
        <button className="ghost menu" aria-expanded={menu} aria-label="Menu" onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button></div></div></header>

    <main id="main">
      <section className="hero"><div className="coinwrap" aria-hidden="true"><div className="bob"><div className="coin"><i /><i /><i /><i /><i /><b className="f">T</b><b className="bk">T</b></div></div>{[0, 1, 2].map((k) => <div className="cube" key={k}>{[0, 1, 2, 3, 4, 5].map((f) => <b key={f} />)}</div>)}</div>
        <div className="wrap"><p className="kicker">Bedrock Edition server store</p>
          <h1>{W("Gear", 0)}{W("up.", 1)}<br />{W("Rule", 2)}{W("the", 3)}<em style={{ "--d": 4 }}>server</em>.</h1>
          <p className="lead">Ranks, crates and tokens for our Bedrock community.</p>
          <div className="row"><a className="btn" href="#store">Start shopping</a>
            <button className="ghost" onClick={() => navigator.clipboard?.writeText("play.example.net").then(() => toast("Server address copied"))}>play.example.net : 19132</button></div>
          <dl className="stats"><div><dt>Categories</dt><dd><Count to={CATS.length} /></dd></div><div><dt>Items</dt><dd><Count to={products.length} /></dd></div><div><dt className="live">Online (fake)</dt><dd><Count to={1284} /></dd></div></dl></div></section>

      <div className="ticker" aria-hidden="true"><div>{[0, 1].map((k) => ["Fake demo data:", "DemoSteve unlocked Legend", "Luna_X opened a Mythic Crate", "BlockBob got 1200 Tokens", "PixelFox joined Supporter+", "Nova_77 grabbed Builder"].map((t) => <span key={k + t}><b>●</b> {t}</span>))}</div></div>

      <section className="wrap"><h2>Shop by category</h2>
        <div className="cats">{CATS.map((c, i) => <button key={c} aria-pressed={cat === c} className="cat" onClick={() => { setCat(cat === c ? "All" : c); document.getElementById("store")?.scrollIntoView({ behavior: calm() ? "auto" : "smooth" }); }}><Ico c={c} /><b>{c}</b><small>{products.filter((p) => p.category === c).length} items</small></button>)}</div></section>

      <section id="join" className="wrap"><h2>How to join</h2><ol className="steps">{[["Open Minecraft", "Launch Bedrock Edition and go to Play, then Servers."], ["Add the server", "Tap Add Server. Address play.example.net, port 19132."], ["Hop in", "Save, join, and grab your rank with the same gamertag."]].map(([t, d], i) => <li key={t}><b>0{i + 1}</b><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

      <section className="wrap"><h2>Popular right now</h2>{featured.length ? <ul className="grid">{featured.map((p, i) => <Card key={p.id} p={p} i={i} price={fmt(p.price)} inCart={cart.includes(p.id)} add={onAdd} />)}</ul> : <p className="empty">Nothing featured right now.</p>}</section>

      <section id="patrons" className="wrap"><h2>Patrons</h2>
        {patrons.length ? <ul className="patrons">{patrons.map((p) => <li key={p.name}><b>{p.name}</b><span>{p.tier}</span></li>)}</ul> : <p className="empty">No patrons yet. Be the first name here.</p>}</section>

      <section id="store" className="wrap"><h2>Store{cat !== "All" && <span className="sub"> / {cat}</span>}</h2>
        <div className="filters" role="group" aria-label="Categories">{["All", ...CATS].map((c) => <button key={c} aria-pressed={cat === c} className="chip" onClick={() => setCat(c)}>{c}</button>)}
          <input ref={searchRef} type="search" aria-label="Search products (press /)" placeholder="Search ( / )" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="feat">Featured</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option></select></div>
        {list.length ? <ul className="grid">{list.map((p, i) => <Card key={p.id} p={p} i={i} price={fmt(p.price)} inCart={cart.includes(p.id)} add={onAdd} />)}</ul> : <p className="empty">No products match. <button className="chip" onClick={() => { setCat("All"); setQ(""); }}>Clear filters</button></p>}</section>

      <div className="bigtype" aria-hidden="true"><div>{[0, 1].map((k) => ["Ranks", "Crates", "Tokens", "Grades", "Perks"].map((t) => <span key={k + t}>{t}</span>))}</div></div>

      <section id="about" className="wrap prose"><h2>About us</h2><p>We are a small community running a Bedrock server. This store is a demo build: names, prices and perks are placeholders.</p></section>
      <section id="faq" className="wrap prose"><h2>FAQ</h2>{FAQ.map(([a, b]) => <details key={a}><summary>{a}</summary><div><p>{b}</p></div></details>)}</section>
    </main>

    <footer className="foot"><div className="wrap">
      <div className="cols"><div><b className="logo">MCPE<span>Store</span></b><p>A demo storefront. Not affiliated with or endorsed by Mojang AB or Microsoft.</p></div>
        <div><h3>Useful links</h3><a href="#main">Home</a><a href="#store">Store</a><a href="/legal/rules">Rules</a><a href="/legal/privacy">Privacy Policy</a><a href="/legal/terms">Terms & Conditions</a></div>
        <div><h3>Support</h3><a href={`mailto:${email}`}>{email}</a><a href={hire}>Hire the developer</a></div></div>
      <p className="copy" suppressHydrationWarning>© 2025 - {new Date().getFullYear()} MCPE Web Store. All rights reserved.</p></div></footer>

    {top && <button className="ghost totop" aria-label="Back to top" onClick={() => scrollTo({ top: 0, behavior: calm() ? "auto" : "smooth" })}>Top</button>}

    {cartOpen && <div className="scrim end" onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}><aside role="dialog" aria-modal="true" aria-label="Your cart" className="drawer">
      <h2>Your cart</h2>{items.length ? <><ul>{items.map((p) => <li key={p.id}><span>{p.name}</span><b>{fmt(p.price)}</b><button className="ghost" aria-label={`Remove ${p.name}`} onClick={() => saveCart(cart.filter((x) => x !== p.id))}>x</button></li>)}</ul>
        <div className="goal"><span>{totalV >= conv(10) ? "Bonus unlocked: +10% tokens (demo)" : `Add ${fmtV(conv(10) - totalV)} more to unlock +10% bonus tokens (demo)`}</span><i style={{ "--g": Math.min(totalV / conv(10), 1) }} /></div>
        <p className="tot">Total <b>{fmtV(totalV)}</b></p><button className="btn" onClick={openCheckout}>Checkout</button></> : <p className="empty">Your cart is empty. Add something from the store.</p>}
      <button className="ghost" onClick={() => setCartOpen(false)}>Close</button></aside></div>}

    {ignOpen && <div className="scrim"><div role="dialog" aria-modal="true" aria-labelledby="t1" className="modal">
      <h2 id="t1">Enter your Minecraft IGN</h2><p>Your Bedrock gamertag. We use it to attach purchases to the right account. This demo checks the format only. It does not verify the account exists.</p>
      <label>IGN<input autoFocus value={ignVal} onChange={(e) => setIgnVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveIgn()} aria-invalid={!!err} /></label>
      {err && <p role="alert" className="err">{err}</p>}
      <div className="row"><button className="btn" onClick={saveIgn}>Continue</button>{ign && <button className="ghost" onClick={() => { sess.set("ignSeen", "1"); setIgnOpen(false); }}>Keep {ign}</button>}</div></div></div>}

    {step === "check" && <div className="scrim"><div role="dialog" aria-modal="true" aria-labelledby="t2" className="modal">
      <h2 id="t2">Confirm your order</h2>
      <label>Re-enter your IGN<input autoFocus value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !placing && place()} aria-invalid={!!cErr} /></label>
      {cErr && <p role="alert" className="err">{cErr}</p>}
      <dl className="sum">{items.map((p) => [<dt key={p.id}>{p.name}</dt>, <dd key={p.id + "d"}>{fmt(p.price)}</dd>])}<dt>Account</dt><dd>{ign}</dd><dt><b>Total</b></dt><dd><b>{fmtV(totalV)}</b></dd></dl>
      <p className="note">Demo checkout. No payment is processed.</p>
      <div className="row"><button className="btn" disabled={placing} onClick={place}>{placing ? "Processing..." : "Place demo order"}</button><button className="ghost" onClick={() => setStep(null)}>Cancel</button></div></div></div>}

    {step === "demo" && <div className="scrim"><div role="dialog" aria-modal="true" aria-labelledby="t4" className="modal demo">
      <h2 id="t4">This is a demo project</h2><p>No payment was taken and nothing was delivered. Want the real thing? <b>Hire me to build the full version.</b></p>
      <div className="row"><a className="btn" href={hire}>Hire me</a><button className="ghost" onClick={() => setStep(null)}>Back to store</button></div></div></div>}

    {auth && <div className="scrim"><form onSubmit={submitAuth} role="dialog" aria-modal="true" aria-labelledby="t3" className="modal">
      <h2 id="t3">{auth === "login" ? "Log in" : "Create account"}</h2>
      <label>Email<input type="email" required autoFocus value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<span className="pw"><input type={show ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" className="ghost" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></span></label>
      <div className="row"><button className="btn">{auth === "login" ? "Log in" : "Register"}</button>
        <button type="button" className="ghost" onClick={() => setAuth(auth === "login" ? "register" : "login")}>{auth === "login" ? "Need an account?" : "Have an account?"}</button>
        <button type="button" className="ghost" onClick={() => setAuth(null)}>Cancel</button></div></form></div>}

    {consent === "pending" && <div className="cookie" role="region" aria-label="Cookie consent"><p>We store your IGN, cart, theme, currency and music setting in your browser so the store works. No analytics run in this demo.</p>
      <button className="btn" onClick={() => { store.set("consent", "all"); setConsent("done"); }}>Accept</button>
      <button className="ghost" onClick={() => { store.set("consent", "essential"); setConsent("done"); }}>Essential only</button></div>}

    <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
  </>);
}
