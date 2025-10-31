export const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"]

export const STORAGE_KEY = "rnd-settings-react";

export function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

export function randInt(a, b, noRepeat, lastNumber) {
    let minV = Math.ceil(Math.min(a, b));
    let maxV = Math.floor(Math.max(a, b));
    if (minV === maxV) return minV;
    let r;
    do {
      r = Math.floor(Math.random() * (maxV - minV + 1)) + minV;
    } while (noRepeat && maxV > minV && r === lastNumber);
    return r;
}

export function chooseColor(lastColor) {
    let c;
    do {
      c = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (c === lastColor && COLORS.length > 1);
    return c;
}

export function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }