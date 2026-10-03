// UI sound effects (Web Audio, no files). Silenced by the same ♪ toggle as the music.
// Shared bus: soft low-pass -> compressor, plus a short generated reverb for sparkle. Pitch jitter keeps repeats from sounding robotic.
let ctx, bus, verb, nbuf, active = 0;
const last = {}, GAP = { hover: 60, click: 30, remove: 80 };
const enabled = () => { try { return localStorage.getItem("music") !== "off"; } catch { return true; } };
const J = (c) => (Math.random() - 0.5) * c;
function init() {
  ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 24; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 9000;
  bus = ctx.createGain(); bus.connect(lp).connect(comp).connect(ctx.destination);
  const n = (ctx.sampleRate * 0.7) | 0, ir = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3.2; }
  verb = ctx.createConvolver(); verb.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.22; verb.connect(wet).connect(comp);
  nbuf = ctx.createBuffer(1, (ctx.sampleRate * 0.5) | 0, ctx.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
function out(node, r) { node.connect(bus); if (r) { const s = ctx.createGain(); s.gain.value = r; node.connect(s).connect(verb); } }
function tone({ f, to, at = 0, d = 0.1, g = 0.05, type = "sine", a = 0.004, r = 0, det = 0 }) {
  const t = ctx.currentTime + 0.004 + at, o = ctx.createOscillator(), e = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); o.detune.value = det;
  e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + a); e.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(e); out(e, r); o.start(t); o.stop(t + d + 0.03); active++; o.onended = () => { active--; e.disconnect(); };
}
function puff({ at = 0, d = 0.05, g = 0.03, f = 3000, to, q = 1, type = "bandpass", r = 0 }) {
  const t = ctx.currentTime + 0.004 + at, s = ctx.createBufferSource(), h = ctx.createBiquadFilter(), e = ctx.createGain();
  s.buffer = nbuf; h.type = type; h.Q.value = q; h.frequency.setValueAtTime(f, t); if (to) h.frequency.exponentialRampToValueAtTime(to, t + d);
  e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(h).connect(e); out(e, r); s.start(t, Math.random() * 0.25, d + 0.02); active++; s.onended = () => { active--; e.disconnect(); };
}
const SND = {
  click() { puff({ d: 0.018, g: 0.05, f: 4200, q: 0.8 }); tone({ f: 900, to: 560, d: 0.07, g: 0.05, det: J(60) }); },
  hover() { tone({ f: 2000, to: 2300, d: 0.03, g: 0.006, a: 0.006, det: J(100) }); },
  add() { tone({ f: 988, d: 0.12, g: 0.06, type: "triangle", r: 0.25 }); tone({ f: 1319, at: 0.07, d: 0.22, g: 0.06, type: "triangle", r: 0.35 }); tone({ f: 2637, at: 0.07, d: 0.3, g: 0.015, r: 0.5 }); puff({ at: 0.07, d: 0.05, g: 0.02, f: 6000 }); },
  ok() { [523, 659, 784, 988, 1319].forEach((f, i) => { tone({ f, at: i * 0.065, d: 0.35 + i * 0.05, g: 0.05, type: "triangle", r: 0.4 }); tone({ f: f * 2, at: i * 0.065, d: 0.25, g: 0.012, r: 0.5, det: 7 }); }); },
  err() { tone({ f: 230, to: 120, d: 0.16, g: 0.09, type: "triangle" }); tone({ f: 170, to: 90, at: 0.09, d: 0.2, g: 0.08, type: "triangle" }); puff({ d: 0.04, g: 0.02, f: 400, type: "lowpass" }); },
  open() { puff({ d: 0.16, g: 0.03, f: 500, to: 2600, q: 1.2, r: 0.2 }); tone({ f: 520, to: 780, d: 0.14, g: 0.035, r: 0.25 }); },
  close() { puff({ d: 0.13, g: 0.025, f: 2400, to: 450, q: 1.2 }); tone({ f: 700, to: 440, d: 0.11, g: 0.03 }); },
  remove() { tone({ f: 520, to: 260, d: 0.12, g: 0.05, type: "triangle" }); puff({ d: 0.03, g: 0.02, f: 1200 }); },
};
export function sfx(name) {
  if (!enabled()) return;
  try {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // browsers block audio before the first tap
    const now = performance.now(); if (now - (last[name] || 0) < (GAP[name] || 0)) return; last[name] = now;
    if (!ctx) init(); if (ctx.state === "suspended") ctx.resume();
    if (active > 28 && (name === "hover" || name === "click")) return; // voice limit keeps it glitch-free
    SND[name]?.();
    if (name === "click" || name === "add") navigator.vibrate?.(8);
    if (name === "err") navigator.vibrate?.([30, 40, 30]);
  } catch {}
}
