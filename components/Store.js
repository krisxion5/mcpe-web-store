"use client";
import { useEffect, useRef, useState } from "react";
import Music from "./Music";
const IGN_RE = /^[A-Za-z0-9_ ]{3,16}$/;
const CATS = ["Ranks", "Grades", "Crates", "Subscriptions", "Tokens"];
const RATES = { USD: 1, EUR: 0.92, GBP: 0.79 };
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
function Card({ p, i, fmt, inCart, add }) {
  return (<li className="card" style={{ "--n": i < 8 ? i : 0 }}><div className="top"><div className="icon" aria-hidden="true">{p.name[0]}</div><span className="tag">{p.category}</span></div>
    <div><h3>{p.name}{p.badge && <span className="badge">{p.badge}</span>}</h3><p>{p.description}</p></div>
    <div className="buy"><b>{fmt(p.price)}</b><button className="btn" disabled={!p.available} onClick={(e) => add(p, e.currentTarget)}>{inCart ? "In cart" : "Add to cart"}</button></div></li>);
}

export default function Store({ products, patrons, email, hire }) {
  const [ign, setIgn] = useState(null), [ignOpen, setIgnOpen] = useState(false), [ignVal, setIgnVal] = useState(""), [err, setErr] = useState("");
  const [cat, setCat] = useState("All"), [q, setQ] = useState(""), [cur, setCur] = useState("USD");
  const [cart, setCart] = useState([]), [cartOpen, setCartOpen] = useState(false), [step, setStep] = useState(null), [confirm, setConfirm] = useState(""), [cErr, setCErr] = useState(""), [placing, setPlacing] = useState(false);
  const [toasts, setToasts] = useState([]), [theme, setTheme] = useState("dark"), [menu, setMenu] = useState(false), [consent, setConsent] = useState("done"), [top, setTop] = useState(false);
  const [auth, setAuth] = useState(null), [form, setForm] = useState({ email: "", password: "" }), [show, setShow] = useState(false), [user, setUser] = useState(null);
  const searchRef = useRef();
  const toast = (msg, type = "ok") => { const id = Math.random(); setToasts((t) => [...t.slice(-3), { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500); };
  const fmt = (n) => new Intl.NumberFormat("en", { style: "currency", currency: cur }).format(n * RATES[cur]);
  const saveCart = (c) => { setCart(c); store.set("cart", JSON.stringify(c)); };
  const loadUser = () => fetch("/api/auth").then((r) => r.json()).then((u) => setUser(u.email ? u : null)).catch(() => {});

  useEffect(() => {
    const s = store.get("ign"); if (s) { setIgn(s); setIgnVal(s); }
    setCur(store.get("cur") || "USD");
    try { const c = JSON.parse(store.get("cart") || "[]"); if (Array.isArray(c)) setCart(c.filter((x) => typeof x === "string")); } catch {}
    if (!sess.get("ignSeen")) setIgnOpen(true);
    const t = store.get("theme") || "dark"; setTheme(t); document.documentElement.dataset.theme = t;
    setConsent(store.get("consent") || "pending"); loadUser();
    const sc = () => setTop(scrollY > 600); addEventListener("scroll", sc, { passive: true });
    const k = (e) => { if (e.key === "Escape") { setStep(null); setAuth(null); setMenu(false); setCartOpen(false); if (store.get("ign")) setIgnOpen(false); return; } if (e.target.matches("input,textarea,select")) return; if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); } };
    addEventListener("keydown", k);
    const seen = new WeakMap(); // double-click guard
    const g = (e) => { const b = e.target.closest?.("button,.btn"); if (!b) return; const n = Date.now(); if (n - (seen.get(b) || 0) < 700) { e.preventDefault(); e.stopPropagation(); toast("Slow down! One click at a time.", "err"); return; } seen.set(b, n); };
    document.addEventListener("click", g, true);
    return () => { removeEventListener("scroll", sc); removeEventListener("keydown", k); document.removeEventListener("click", g, true); };
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
  const add = (p, el) => { if (cart.includes(p.id)) return toast(`${p.name} is already in your cart`, "err"); saveCart([...cart, p.id]); fly(el); toast(`${p.name} added to cart`); };
  const items = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean), total = items.reduce((a, p) => a + p.price, 0);
  const openCheckout = () => { if (!ign) return setIgnOpen(true); setCartOpen(false); setConfirm(""); setCErr(""); setStep("check"); };
  const place = () => {
    if (confirm.trim().toLowerCase() !== ign.toLowerCase()) return setCErr(`That doesn't match your saved IGN (${ign}). Checkout blocked.`);
    setPlacing(true); setTimeout(() => { setPlacing(false); setStep("demo"); saveCart([]); burst(); toast("This is a demo project. Hire me to build the full version."); }, 900);
  };
  const submitAuth = async (e) => { e.preventDefault(); const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: auth, ...form }) }); const d = await r.json().catch(() => ({})); if (r.ok) { toast(auth === "register" ? "Account created" : "Signed in"); setAuth(null); loadUser(); } else toast(d.error || "Something went wrong.", "err"); };
  const logout = async () => { await fetch("/api/auth", { method: "DELETE" }).catch(() => {}); setUser(null); toast("Logged out"); };
  const list = products.filter((p) => (cat === "All" || p.category === cat) && (p.name + p.description).toLowerCase().includes(q.toLowerCase()));
  const featured = products.filter((p) => p.badge === "Popular").slice(0, 3);
  const W = (t, d) => <span style={{ "--d": d }}>{t} </span>;
  const ctl = (<><select aria-label="Currency" value={cur} onChange={(e) => { setCur(e.target.value); store.set("cur", e.target.value); }}>{Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}</select>
    <button className="ghost" onClick={() => setIgnOpen(true)}>{ign || "Set IGN"}</button>
    <button className="ghost" aria-label="Toggle theme" onClick={flip}>{theme === "dark" ? "Light" : "Dark"}</button>
    {user?.role === "ADMIN" && <a className="ghost" href="/admin">Admin</a>}
    {user ? <button className="ghost" onClick={logout}>Log out</button> : <button className="ghost" onClick={() => setAuth("login")}>Login</button>}</>);

  return (<>
    <div className="progress" aria-hidden="true" /><div className="curtain" aria-hidden="true" />
    <div className="demo-bar">DEMO PROJECT: nothing here is real. <a href={hire}>Hire me to build the full version</a></div>
    <header className="head"><div className="wrap bar">
      <a className="logo" href="#main">MCPE<span>Store</span></a>
      <nav className={menu ? "open" : ""} aria-label="Main" onClick={(e) => e.target.closest("a") && setMenu(false)}><a href="#store">Store</a><a href="#patrons">Patrons</a><a href="#about">About</a><a href="#faq">FAQ</a><div className="mt">{ctl}</div></nav>
      <div className="tools"><Music /><div className="dt">{ctl}</div>
        <button className="ghost cart" aria-label={`Cart, ${cart.length} items`} onClick={() => setCartOpen(true)}>Cart<i key={cart.length}>{cart.length}</i></button>
        <button className="ghost menu" aria-expanded={menu} aria-label="Menu" onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button></div></div></header>

    <main id="main">
      <section className="hero"><div className="coinwrap" aria-hidden="true"><div className="bob"><div className="coin"><span>T</span></div></div><i /><i /><i /></div>
        <div className="wrap"><p className="kicker">Bedrock Edition server store</p>
          <h1>{W("Gear", 0)}{W("up.", 1)}<br />{W("Rule", 2)}{W("the", 3)}<em style={{ "--d": 4 }}>server</em>.</h1>
          <p className="lead">Ranks, crates and tokens for our Bedrock community.</p>
          <div className="row"><a className="btn" href="#store">Start shopping</a>
            <button className="ghost" onClick={() => navigator.clipboard?.writeText("play.example.net").then(() => toast("Server address copied"))}>play.example.net : 19132</button></div>
          <dl className="stats"><div><dt>Categories</dt><dd><Count to={CATS.length} /></dd></div><div><dt>Items</dt><dd><Count to={products.length} /></dd></div><div><dt className="live">Online (fake)</dt><dd><Count to={1284} /></dd></div></dl></div></section>

      <div className="ticker" aria-hidden="true"><div>{[0, 1].map((k) => ["Fake demo data:", "DemoSteve unlocked Legend", "Luna_X opened a Mythic Crate", "BlockBob got 1200 Tokens", "PixelFox joined Supporter+", "Nova_77 grabbed Builder"].map((t) => <span key={k + t}><b>●</b> {t}</span>))}</div></div>

      <section className="wrap"><h2>Shop by category</h2>
        <div className="cats">{CATS.map((c, i) => <button key={c} aria-pressed={cat === c} className="cat" onClick={() => { setCat(cat === c ? "All" : c); document.getElementById("store")?.scrollIntoView({ behavior: calm() ? "auto" : "smooth" }); }}><span>0{i + 1}</span><b>{c}</b><small>{products.filter((p) => p.category === c).length} items</small></button>)}</div></section>

      <section className="wrap"><h2>Popular right now</h2>{featured.length ? <ul className="grid">{featured.map((p, i) => <Card key={p.id} p={p} i={i} fmt={fmt} inCart={cart.includes(p.id)} add={add} />)}</ul> : <p className="empty">Nothing featured right now.</p>}</section>

      <section id="patrons" className="wrap"><h2>Patrons</h2>
        {patrons.length ? <ul className="patrons">{patrons.map((p) => <li key={p.name}><b>{p.name}</b><span>{p.tier}</span></li>)}</ul> : <p className="empty">No patrons yet. Be the first name here.</p>}</section>

      <section id="store" className="wrap"><h2>Store{cat !== "All" && <span className="sub"> / {cat}</span>}</h2>
        <div className="filters" role="group" aria-label="Categories">{["All", ...CATS].map((c) => <button key={c} aria-pressed={cat === c} className="chip" onClick={() => setCat(c)}>{c}</button>)}
          <input ref={searchRef} type="search" aria-label="Search products (press /)" placeholder="Search ( / )" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {list.length ? <ul className="grid">{list.map((p, i) => <Card key={p.id} p={p} i={i} fmt={fmt} inCart={cart.includes(p.id)} add={add} />)}</ul> : <p className="empty">No products match. <button className="chip" onClick={() => { setCat("All"); setQ(""); }}>Clear filters</button></p>}</section>

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
        <p className="tot">Total <b>{fmt(total)}</b></p><button className="btn" onClick={openCheckout}>Checkout</button></> : <p className="empty">Your cart is empty. Add something from the store.</p>}
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
        <button type="button" className="ghost" onClick={() => setAuth(auth === "login" ? "register" : "login")}>{auth === "login" ? "Need an account?" : "Have an account?"}</button>
        <button type="button" className="ghost" onClick={() => setAuth(null)}>Cancel</button></div></form></div>}

    {consent === "pending" && <div className="cookie" role="region" aria-label="Cookie consent"><p>We store your IGN, cart, theme, currency and music setting in your browser so the store works. No analytics run in this demo.</p>
      <button className="btn" onClick={() => { store.set("consent", "all"); setConsent("done"); }}>Accept</button>
      <button className="ghost" onClick={() => { store.set("consent", "essential"); setConsent("done"); }}>Essential only</button></div>}

    <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
  </>);
}
