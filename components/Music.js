"use client";
import { useEffect, useRef, useState } from "react";
// Soft procedural lofi: generated in the browser, no audio files, very quiet.
const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 59], [52, 56, 59, 62]];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const BEAT = 60 / 72, VOL = 0.85;
function engine() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = 0;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1700;
  const comp = ctx.createDynamicsCompressor(); // keeps louder playback from clipping
  master.connect(lp).connect(comp).connect(ctx.destination);
  const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = (t, dur, g, f) => { const s = ctx.createBufferSource(), h = ctx.createBiquadFilter(), e = ctx.createGain(); s.buffer = nb; h.type = "highpass"; h.frequency.value = f; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(h).connect(e).connect(master); s.start(t); s.stop(t + dur); };
  const tone = (m, t, dur, g, type = "triangle") => { const o = ctx.createOscillator(), e = ctx.createGain(); o.type = type; o.frequency.value = hz(m); o.detune.value = (Math.random() - 0.5) * 14; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + 0.04); e.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(e).connect(master); o.start(t); o.stop(t + dur + 0.05); };
  const kick = (t) => { const o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); e.gain.setValueAtTime(0.12, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(e).connect(master); o.start(t); o.stop(t + 0.3); };
  const bed = ctx.createBufferSource(), bg = ctx.createGain(), bf = ctx.createBiquadFilter(); bed.buffer = nb; bed.loop = true; bf.type = "bandpass"; bf.frequency.value = 3000; bg.gain.value = 0.004; bed.connect(bf).connect(bg).connect(master); bed.start();
  let next = ctx.currentTime + 0.15, i = 0;
  const id = setInterval(() => {
    while (next < ctx.currentTime + 0.5) {
      const c = CH[(i >> 2) % 8], b = i % 4;
      if (b === 0) { c.forEach((m, k) => tone(m, next + k * 0.015, BEAT * 3.8, 0.045)); tone(c[0] - 12, next, BEAT * 3.6, 0.07, "sine"); }
      if (b === 0 || b === 2) kick(next); else noise(next, 0.12, 0.022, 1800);
      noise(next + BEAT / 2 + 0.03, 0.04, 0.008, 7000);
      if (Math.random() < 0.25) noise(next + Math.random() * BEAT, 0.012, 0.035, 2500); // vinyl pops
      if (Math.random() < 0.55) tone(c[(Math.random() * 4) | 0] + 12, next + (Math.random() < 0.5 ? 0 : BEAT / 2), BEAT * 1.5, 0.028);
      next += BEAT; i++;
    }
  }, 150);
  return { ctx, master, id };
}
export default function Music() {
  const [on, setOn] = useState(false), E = useRef(null), want = useRef(true);
  const play = () => { try { if (!E.current) E.current = engine(); const { ctx, master } = E.current; ctx.resume(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(VOL, ctx.currentTime, 1.2); setOn(true); } catch {} };
  const stop = () => { setOn(false); const e = E.current; if (!e) return; e.master.gain.setTargetAtTime(0, e.ctx.currentTime, 0.2); setTimeout(() => { if (!want.current) e.ctx.suspend(); }, 900); };
  useEffect(() => {
    let pref; try { pref = localStorage.getItem("music"); } catch {}
    want.current = pref !== "off"; setOn(want.current); // on by default; audio starts at your first tap (browsers block autoplay)
    const first = (e) => { if (e.target.closest?.("[data-music]")) return; if (want.current && !E.current) play(); };
    addEventListener("pointerdown", first, { once: true }); addEventListener("keydown", first, { once: true });
    const vis = () => { const e = E.current; if (!e) return; if (document.hidden) e.ctx.suspend(); else if (want.current) e.ctx.resume(); };
    document.addEventListener("visibilitychange", vis);
    return () => { removeEventListener("pointerdown", first); removeEventListener("keydown", first); document.removeEventListener("visibilitychange", vis); if (E.current) { clearInterval(E.current.id); E.current.ctx.close(); E.current = null; } };
  }, []);
  const toggle = () => { want.current = !on; try { localStorage.setItem("music", on ? "off" : "on"); } catch {} on ? stop() : play(); };
  return <button data-music className="ghost" aria-pressed={on} aria-label={on ? "Mute music" : "Play soft lofi music"} onClick={toggle}>{on ? "♪ On" : "♪ Off"}</button>;
}
