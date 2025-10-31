import React, { useEffect, useMemo, useRef, useState } from "react";

// Features:
// - Random numbers in a range at a fixed interval
// - No immediate repeat (number + color)
// - Beep option, Fullscreen option
// - Hide/Show menu collapses header and reflows grid rows to `1fr auto`
// - Font size controls (A+/A-)
// - Spacebar toggles Start/Stop
// - LocalStorage persistence

export default function App() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(4);
  const [intervalSec, setIntervalSec] = useState(5);
  const [noRepeat, setNoRepeat] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  const [wantFullscreen, setWantFullscreen] = useState(false);
  const [running, setRunning] = useState(false);
  const [menuHidden, setMenuHidden] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  const [display, setDisplay] = useState("—");
  const [color, setColor] = useState("#2a2f3c");
  const [popKey, setPopKey] = useState(0);

  const lastNumberRef = useRef(null);
  const lastColorRef = useRef(null);
  const timerRef = useRef(null);

  const COLORS = useMemo(
    () => ["#ef4444", "#22c55e", "#3b82f6", "#eab308"],
    []
  );

  // Persistence
  const STORAGE_KEY = "rnd-settings-react";
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (s.min !== undefined) setMin(Number(s.min));
      if (s.max !== undefined) setMax(Number(s.max));
      if (s.intervalSec !== undefined) setIntervalSec(Number(s.intervalSec));
      if (s.noRepeat !== undefined) setNoRepeat(!!s.noRepeat);
      if (s.audioOn !== undefined) setAudioOn(!!s.audioOn);
      if (s.wantFullscreen !== undefined) setWantFullscreen(!!s.wantFullscreen);
      if (s.menuHidden !== undefined) setMenuHidden(!!s.menuHidden);
      if (s.fontScale !== undefined) setFontScale(Number(s.fontScale));
    } catch {}
  }, []);
  useEffect(() => {
    const data = {
      min, max, intervalSec,
      noRepeat, audioOn, wantFullscreen,
      menuHidden, fontScale,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [min, max, intervalSec, noRepeat, audioOn, wantFullscreen, menuHidden, fontScale]);

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  function randInt(a, b) {
    let minV = Math.ceil(Math.min(a, b));
    let maxV = Math.floor(Math.max(a, b));
    if (minV === maxV) return minV;
    let r;
    do {
      r = Math.floor(Math.random() * (maxV - minV + 1)) + minV;
    } while (noRepeat && maxV > minV && r === lastNumberRef.current);
    lastNumberRef.current = r;
    return r;
  }

  function chooseColor() {
    let c;
    do {
      c = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (c === lastColorRef.current && COLORS.length > 1);
    lastColorRef.current = c;
    return c;
  }

  function beep() {
    if (!audioOn) return;
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

  const tick = () => {
    const v = randInt(min, max);
    setDisplay(String(v));
    const c = chooseColor();
    setColor(c);
    setPopKey((k) => k + 1);
    beep();
  };

  useEffect(() => {
    if (!running) return;
    const sec = clamp(Number(intervalSec) || 5, 0.25, 3600);
    tick();
    timerRef.current = setInterval(tick, sec * 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, intervalSec, min, max, noRepeat]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        running ? stop() : start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  async function start() {
    setRunning(true);
    if (wantFullscreen) {
      try {
        const root = document.documentElement;
        if (!document.fullscreenElement && root.requestFullscreen) {
          await root.requestFullscreen();
        }
      } catch {}
    }
  }
  async function stop() {
    setRunning(false);
    clearInterval(timerRef.current);
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
  }

  const wrapperRows = menuHidden ? "1fr auto" : "auto 1fr auto";
  const numberStyle = { color, transform: `scale(${fontScale})`, transformOrigin: "center" };

  return (
    <div className="h-screen grid gap-4" style={{ gridTemplateRows: wrapperRows }}>
      {/* Header */}
      {!menuHidden && (
        <header className="w-full px-4 py-3 border-b border-[#1b2230]">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
              Range
              <label className="flex items-center gap-1">min
                <input
                  type="number" value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  className="bg-[#121722] border border-[#222a3a] text-sm rounded-md px-2 py-1 w-20 text-white"
                />
              </label>
              <label className="flex items-center gap-1">max
                <input
                  type="number" value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  className="bg-[#121722] border border-[#222a3a] text-sm rounded-md px-2 py-1 w-20 text-white"
                />
              </label>
            </span>

            <span className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
              Interval (sec)
              <input
                type="number" min={0.5} step={0.5}
                value={intervalSec}
                onChange={(e) => setIntervalSec(Number(e.target.value))}
                className="bg-[#121722] border border-[#222a3a] text-sm rounded-md px-2 py-1 w-24 text-white"
              />
            </span>

            <label className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
              <input type="checkbox" checked={noRepeat} onChange={(e) => setNoRepeat(e.target.checked)} />
              no immediate repeat
            </label>

            <label className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
              <input type="checkbox" checked={audioOn} onChange={(e) => setAudioOn(e.target.checked)} />
              beep
            </label>

            <label className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
              <input type="checkbox" checked={wantFullscreen} onChange={(e) => setWantFullscreen(e.target.checked)} />
              fullscreen
            </label>
          </div>
        </header>
      )}

      {/* Main */}
      <main className="grid place-items-center px-4">
        <div key={popKey} className="font-extrabold leading-none tracking-tight select-none" style={numberStyle}>
          <PopNumber text={display} />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between gap-2 flex-wrap p-4 border-t border-[#1b2230]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={start} disabled={running}
            className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-tr from-[#4ade80] to-[#60a5fa] text-[#0b0e14] disabled:opacity-50">
            Start
          </button>
          <button
            onClick={stop} disabled={!running}
            className="px-4 py-2 rounded-xl font-semibold text-sm bg-[#fb7185] text-[#0b0e14] disabled:opacity-50">
            Stop
          </button>
          <button
            onClick={() => setMenuHidden((v) => !v)}
            className="px-4 py-2 rounded-xl font-semibold text-[#fff] text-sm bg-[#121722] border border-[#222a3a]">
            {menuHidden ? "Show menu" : "Hide menu"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontScale((s) => clamp(s + 0.1, 0.5, 3))}
            className="px-3 py-2 rounded-xl font-semibold text-sm bg-[#121722] border border-[#222a3a]"
            title="Increase size">
            A+
          </button>
          <button
            onClick={() => setFontScale((s) => clamp(s - 0.1, 0.5, 3))}
            className="px-3 py-2 rounded-xl font-semibold text-sm bg-[#121722] border border-[#222a3a]"
            title="Decrease size">
            A-
          </button>
        </div>
      </footer>

      {/* Pop animation */}
      <style>{`@keyframes pop { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

function PopNumber({ text }) {
  return (
    <div style={{ animation: "pop 150ms ease-out" }} className="text-[clamp(96px,18vw,320px)]">
      {text}
    </div>
  );
}
