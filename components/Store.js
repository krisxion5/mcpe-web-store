"use client";
import { useEffect, useRef, useState } from "react";
import Music from "./Music";
const RULES = { java: /^\w{3,16}$/, bedrock: /^[A-Za-z0-9_ ]{3,16}$/ };
const CATS = ["Ranks", "Crates", "Grades", "Subscriptions", "Gems"];
const REALMS = ["survival", "lifesteal", "duels", "oneblock"];
const RATES = { USD: 1, EUR: 0.92, GBP: 0.79 };
const FAQ = [
  ["What is MCPE Web Store?", "A demo storefront for a Minecraft server. Nothing here is real: no payments, no delivery."],
  ["How do I purchase something?", "Add items to your cart, open it, re-enter your IGN and place the demo order."],
  ["Why do I need my IGN?", "So an order is tied to the right in-game account. This demo checks the format only, not that the account exists."],
  ["Can I change my IGN?", "Yes. Use the IGN button in the header at any time."],
  ["What happens after purchasing?", "In a live store, items arrive in-game. In this demo you'll see a note about hiring the developer."],
];
const wrap = (s) => ({ get: (k) => { try { return s().getItem(k); } catch { return null; } }, set: (k, v) => { try { s().setItem(k, v); } catch {} } });
const store = wrap(() => localStorage), sess = wrap(() => sessionStorage);

function Card({ p, i, fmt, inCart, add }) {
  return (<li className="card" style={{ "--n": i % 8 }}><div className="top"><div className="icon" aria-hidden="true">{p.name[0]}</div><span className="tag">{p.category}{p.realm !== "all" && ` / ${p.realm}`}</span></div>
    <div><h3>{p.name}{p.badge && <span className="badge">{p.badge}</span>}</h3><p>{p.description}</p></div>
    <div className="buy"><b>{fmt(p.price)}</b><button className="btn" disabled={!p.available} onClick={() => add(p)}>{inCart ? "In cart" : "Add to cart"}</button></div></li>);
}

export default function Store({ products, patrons, email, hire }) {
  const [ign, setIgn] = useState(null), [ignOpen, setIgnOpen] = useState(false), [ignVal, setIgnVal] = useState(""), [platform, setPlatform] = useState("bedrock"), [err, setErr] = useState("");
  const [realm, setRealm] = useState("all"), [cat, setCat] = useState("All"), [q, setQ] = useState(""), [cur, setCur] = useState("USD");
  const [cart, setCart] = useState([]), [cartOpen, setCartOpen] = useState(false), [step, setStep] = useState(null), [confirm, setConfirm] = useState(""), [cErr, setCErr] = useState(""), [placing, setPlacing] = useState(false);
  const [toasts, setToasts] = useState([]), [theme, setTheme] = useState("dark"), [menu, setMenu] = useState(false), [consent, setConsent] = useState("done"), [top, setTop] = useState(false);
  const [auth, setAuth] = useState(null), [form, setForm] = useState({ email: "", password: "" }), [show, setShow] = useState(false);
  const searchRef = useRef();
  const toast = (msg, type = "ok") => { const id = Math.random(); setToasts((t) => [...t.slice(-3), { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500); };
  const fmt = (n) => new Intl.NumberFormat("en", { style: "currency", currency: cur }).format(n * RATES[cur]);

  useEffect(() => {
    const s = store.get("ign"); if (s) { setIgn(s); setIgnVal(s); }
    setPlatform(store.get("platform") || "bedrock"); setCur(store.get("cur") || "USD");
    if (!sess.get("ignSeen")) setIgnOpen(true); // IGN popup on every new visit
    const t = store.get("theme") || "dark"; setTheme(t); document.documentElement.dataset.theme = t;
    setConsent(store.get("consent") || "pending");
    const sc = () => setTop(scrollY > 600); addEventListener("scroll", sc);
    const k = (e) => { if (e.key === "Escape") { setStep(null); setAuth(null); setMenu(false); setCartOpen(false); if (store.get("ign")) setIgnOpen(false); return; } if (e.target.matches("input,textarea,select")) return; if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); } };
    addEventListener("keydown", k);
    // Double-click guard: same button clicked twice within 700ms is swallowed.
    const seen = new WeakMap();
    const g = (e) => { const b = e.target.closest?.("button,.btn"); if (!b) return; const n = Date.now(); if (n - (seen.get(b) || 0) < 700) { e.preventDefault(); e.stopPropagation(); toast("Slow down! One click at a time.", "err"); return; } seen.set(b, n); };
    document.addEventListener("click", g, true);
    return () => { removeEventListener("scroll", sc); removeEventListener("keydown", k); document.removeEventListener("click", g, true); };
  }, []);

  useEffect(() => {
    // Scroll effects: progress bar, hero parallax, and a light velocity blur (skipped on reduced-motion / low-memory devices).
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator.deviceMemory && navigator.deviceMemory < 4);
    const bar = document.querySelector(".progress"), blocks = document.querySelector(".blocks");
    let last = scrollY, v = 0, raf = 0;
    const targets = () => document.querySelectorAll(".grid,.realms");
    const clear = () => targets().forEach((e) => { e.style.filter = ""; e.style.transform = ""; });
    const loop = () => {
      raf = 0; v *= 0.86; const b = Math.min(Math.abs(v) * 0.04, 1.5);
      if (b < 0.25) { clear(); if (Math.abs(v) < 1) return; }
      else { const f = `blur(${b.toFixed(2)}px)`, t = `skewY(${Math.max(-1, Math.min(1, v * 0.015)).toFixed(2)}deg)`; targets().forEach((e) => { e.style.filter = f; e.style.transform = t; }); }
      raf = requestAnimationFrame(loop);
    };
    const on = () => {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      if (blocks && y < 900) blocks.style.transform = `translate3d(0,${y * 0.2}px,0)`;
      if (calm) { last = y; return; }
      v = y - last; last = y; if (!raf) raf = requestAnimationFrame(loop);
    };
    addEventListener("scroll", on, { passive: true });
    return () => { removeEventListener("scroll", on); cancelAnimationFrame(raf); clear(); };
  }, []);
  useEffect(() => {
    const els = [...document.querySelectorAll("main > section:not(.hero)")];
    els.forEach((e) => e.classList.add("rv"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 });
    els.forEach((e) => io.observe(e)); return () => io.disconnect();
  }, []);
  const flip = () => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); store.set("theme", t); document.documentElement.dataset.theme = t; };
  const saveIgn = () => { const v = ignVal.trim(); if (!RULES[platform].test(v)) return setErr(platform === "java" ? "Java names: 3 to 16 letters, numbers or underscores." : "Bedrock names: 3 to 16 letters, numbers, spaces or underscores."); store.set("ign", v); store.set("platform", platform); sess.set("ignSeen", "1"); setIgn(v); setIgnOpen(false); setErr(""); toast(`Welcome, ${v}!`); };
  const add = (p) => { if (cart.includes(p.id)) return toast(`${p.name} is already in your cart`, "err"); setCart([...cart, p.id]); toast(`${p.name} added to cart`); };
  const items = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean), total = items.reduce((a, p) => a + p.price, 0);
  const openCheckout = () => { if (!ign) return setIgnOpen(true); setCartOpen(false); setConfirm(""); setCErr(""); setStep("check"); };
  const place = () => {
    if (confirm.trim().toLowerCase() !== ign.toLowerCase()) return setCErr(`That doesn't match your saved IGN (${ign}). Checkout blocked.`);
    setPlacing(true); setTimeout(() => { setPlacing(false); setStep("demo"); setCart([]); toast("This is a demo project. Hire me to build the full version."); }, 900);
  };
  const submitAuth = async (e) => { e.preventDefault(); const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: auth, ...form }) }); const d = await r.json().catch(() => ({})); if (r.ok) { toast(auth === "register" ? "Account created" : "Signed in"); setAuth(null); } else toast(d.error || "Something went wrong.", "err"); };
  const list = products.filter((p) => (realm === "all" || p.realm === "all" || p.realm === realm) && (cat === "All" || p.category === cat) && (p.name + p.description).toLowerCase().includes(q.toLowerCase()));
  const featured = products.filter((p) => p.badge === "Popular").slice(0, 3);
  const count = (r) => products.filter((p) => p.realm === r).length;

  const ctl = (<><select aria-label="Currency" value={cur} onChange={(e) => { setCur(e.target.value); store.set("cur", e.target.value); }}>{Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}</select>
    <button className="ghost" onClick={() => setIgnOpen(true)}>{ign || "Set IGN"}</button>
    <button className="ghost" aria-label="Toggle theme" onClick={flip}>{theme === "dark" ? "Light" : "Dark"}</button>
    <button className="ghost" onClick={() => setAuth("login")}>Login</button></>);
  return (<>
    <div className="progress" aria-hidden="true" /><div className="demo-bar">DEMO PROJECT: nothing here is real. <a href={hire}>Hire me to build the full version</a></div>
    <header className="head"><div className="wrap bar">
      <a className="logo" href="#main">MCPE<span>Store</span></a>
      <nav className={menu ? "open" : ""} aria-label="Main" onClick={(e) => e.target.closest("a") && setMenu(false)}><a href="#realms">Realms</a><a href="#store">Store</a><a href="#patrons">Patrons</a><a href="#about">About</a><a href="#faq">FAQ</a><div className="mt">{ctl}</div></nav>
      <div className="tools"><Music /><div className="dt">{ctl}</div>
        <button className="ghost cart" aria-label={`Cart, ${cart.length} items`} onClick={() => setCartOpen(true)}>Cart<i key={cart.length}>{cart.length}</i></button>
        <button className="ghost menu" aria-expanded={menu} aria-label="Menu" onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button></div></div></header>

    <main id="main">
      <section className="hero"><div className="blocks" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} />)}</div><div className="wrap"><p className="kicker">Official demo store</p><h1>Support the server.<br />Get your <em>rank</em>.</h1>
        <p className="lead">Four realms, one account. Pick a realm, grab ranks, crates and gems.</p>
        <div className="row"><a className="btn" href="#store">Start shopping</a>
          <button className="ghost" onClick={() => navigator.clipboard?.writeText("play.example.net").then(() => toast("Server address copied"))}>play.example.net</button></div>
        <dl className="stats"><div><dt>Realms</dt><dd>4</dd></div><div><dt>Items</dt><dd>{products.length}</dd></div><div><dt className="live">Online (fake)</dt><dd>1,284</dd></div></dl></div></section>

      <div className="ticker" aria-hidden="true"><div>{[0, 1].map((k) => ["Fake demo data:", "DemoSteve unlocked Legend", "Luna_X opened a Mythic Crate", "BlockBob got 1200 Gems", "PixelFox joined Supporter+", "Nova_77 grabbed Warrior"].map((t) => <span key={k + t}><b>●</b> {t}</span>))}</div></div>

      <section id="realms" className="wrap"><h2>Select realm</h2>
        <div className="realms">{REALMS.map((r, i) => <button key={r} aria-pressed={realm === r} className="realm" onClick={() => { setRealm(realm === r ? "all" : r); document.getElementById("store").scrollIntoView({ behavior: "smooth" }); }}><span>0{i + 1}</span><b>{r}</b><small>{count(r)} items</small></button>)}</div></section>

      <section className="wrap"><h2>Popular right now</h2>{featured.length ? <ul className="grid">{featured.map((p, i) => <Card key={p.id} p={p} i={i} fmt={fmt} inCart={cart.includes(p.id)} add={add} />)}</ul> : <p className="empty">Nothing featured right now.</p>}</section>

      <section id="patrons" className="wrap"><h2>Patrons</h2>
        {patrons.length ? <ul className="patrons">{patrons.map((p) => <li key={p.name}><b>{p.name}</b><span>{p.tier}</span></li>)}</ul> : <p className="empty">No patrons yet. Be the first name here.</p>}</section>

      <section id="store" className="wrap"><h2>Store{realm !== "all" && <span className="sub"> / {realm}</span>}</h2>
        <div className="filters" role="group" aria-label="Categories">{["All", ...CATS].map((c) => <button key={c} aria-pressed={cat === c} className="chip" onClick={() => setCat(c)}>{c}</button>)}
          <input ref={searchRef} type="search" aria-label="Search products (press /)" placeholder="Search ( / )" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {list.length ? <ul className="grid">{list.map((p, i) => <Card key={p.id} p={p} i={i} fmt={fmt} inCart={cart.includes(p.id)} add={add} />)}</ul> : <p className="empty">No products match. <button className="chip" onClick={() => { setRealm("all"); setCat("All"); setQ(""); }}>Clear filters</button></p>}</section>

      <section id="about" className="wrap prose"><h2>About us</h2><p>We are a small community running Bedrock and Java realms. This store is a demo build: names, prices and perks are placeholders.</p></section>
      <section id="faq" className="wrap prose"><h2>FAQ</h2>{FAQ.map(([a, b]) => <details key={a}><summary>{a}</summary><div><p>{b}</p></div></details>)}</section>
    </main>

    <footer className="foot"><div className="wrap">
      <div className="cols"><div><b className="logo">MCPE<span>Store</span></b><p>A demo storefront. Not affiliated with or endorsed by Mojang AB or Microsoft.</p></div>
        <div><h3>Useful links</h3><a href="#main">Home</a><a href="#store">Store</a><a href="/legal/rules">Rules</a><a href="/legal/privacy">Privacy Policy</a><a href="/legal/terms">Terms & Conditions</a></div>
        <div><h3>Support</h3><a href={`mailto:${email}`}>{email}</a><a href={hire}>Hire the developer</a></div></div>
      <p className="copy" suppressHydrationWarning>© 2025 - {new Date().getFullYear()} MCPE Web Store. All rights reserved.</p></div></footer>

    {top && <button className="ghost totop" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>Top</button>}

    {cartOpen && <div className="scrim end" onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}><aside role="dialog" aria-modal="true" aria-label="Your cart" className="drawer">
      <h2>Your cart</h2>{items.length ? <><ul>{items.map((p) => <li key={p.id}><span>{p.name}</span><b>{fmt(p.price)}</b><button className="ghost" aria-label={`Remove ${p.name}`} onClick={() => setCart(cart.filter((x) => x !== p.id))}>x</button></li>)}</ul>
        <p className="tot">Total <b>{fmt(total)}</b></p><button className="btn" onClick={openCheckout}>Checkout</button></> : <p className="empty">Your cart is empty. Add something from the store.</p>}
      <button className="ghost" onClick={() => setCartOpen(false)}>Close</button></aside></div>}

    {ignOpen && <div className="scrim"><div role="dialog" aria-modal="true" aria-labelledby="t1" className="modal">
      <h2 id="t1">Enter your Minecraft IGN</h2><p>We use it to attach purchases to the right account. This demo checks the format only. It does not verify the account exists.</p>
      <div className="seg" role="group" aria-label="Platform">{["bedrock", "java"].map((p) => <button key={p} aria-pressed={platform === p} className="chip" onClick={() => setPlatform(p)}>{p === "java" ? "Java Edition" : "Bedrock Edition"}</button>)}</div>
      <label>IGN<input autoFocus value={ignVal} onChange={(e) => setIgnVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveIgn()} aria-invalid={!!err} /></label>
      {err && <p role="alert" className="err">{err}</p>}
      <div className="row"><button className="btn" onClick={saveIgn}>Continue</button>{ign && <button className="ghost" onClick={() => { sess.set("ignSeen", "1"); setIgnOpen(false); }}>Keep {ign}</button>}</div></div></div>}

    {step === "check" && <div className="scrim"><div role="dialog" aria-modal="true" aria-labelledby="t2" className="modal">
      <h2 id="t2">Confirm your order</h2>
      <label>Re-enter your IGN<input autoFocus value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !placing && place()} aria-invalid={!!cErr} /></label>
      {cErr && <p role="alert" className="err">{cErr}</p>}
      <dl className="sum">{items.map((p) => [<dt key={p.id}>{p.name}</dt>, <dd key={p.id + "d"}>{fmt(p.price)}</dd>])}<dt>Account</dt><dd>{ign}</dd><dt><b>Total</b></dt><dd><b>{fmt(total)}</b></dd></dl>
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
        <button type="button" className="ghost" onClick={() => setAuth(auth === "login" ? "register" : "login")}>{auth === "login" ? "Need an account?" : "Have an account?"}</button></div></form></div>}

    {consent === "pending" && <div className="cookie" role="region" aria-label="Cookie consent"><p>We store your IGN, theme, currency and music setting in your browser so the store works. No analytics run in this demo.</p>
      <button className="btn" onClick={() => { store.set("consent", "all"); setConsent("done"); }}>Accept</button>
      <button className="ghost" onClick={() => { store.set("consent", "essential"); setConsent("done"); }}>Essential only</button></div>}

    <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
  </>);
}
