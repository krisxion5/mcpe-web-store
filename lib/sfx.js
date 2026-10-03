// Tiny UI sound effects (Web Audio, no files). Silenced by the same ♪ toggle as the music.
let ctx;
const enabled = () => { try { return localStorage.getItem("music") !== "off"; } catch { return true; } };
const SET = {
  click: [[660, 0, 0.06, 0.05, "triangle"], [990, 0.03, 0.05, 0.03, "triangle"]],
  hover: [[1400, 0, 0.03, 0.01, "sine"]],
  add: [[784, 0, 0.12, 0.06, "triangle"], [1175, 0.07, 0.2, 0.05, "triangle"]],
  ok: [[523, 0, 0.14, 0.06, "triangle"], [659, 0.08, 0.14, 0.06, "triangle"], [784, 0.16, 0.14, 0.06, "triangle"], [1047, 0.24, 0.35, 0.06, "triangle"]],
  err: [[170, 0, 0.16, 0.06, "sawtooth"], [130, 0.08, 0.2, 0.05, "sawtooth"]],
  open: [[440, 0, 0.08, 0.04, "sine"], [660, 0.05, 0.12, 0.04, "sine"]],
};
export function sfx(name) {
  if (!enabled()) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    (SET[name] || []).forEach(([f, o, d, g, type]) => {
      const osc = ctx.createOscillator(), e = ctx.createGain();
      osc.type = type; osc.frequency.value = f;
      e.gain.setValueAtTime(0, t + o); e.gain.linearRampToValueAtTime(g, t + o + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t + o + d);
      osc.connect(e).connect(ctx.destination); osc.start(t + o); osc.stop(t + o + d + 0.05);
    });
    if (name === "click" || name === "add") navigator.vibrate?.(8);
    if (name === "err") navigator.vibrate?.([30, 40, 30]);
  } catch {}
}
