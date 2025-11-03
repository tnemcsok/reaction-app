import React, { useEffect, useRef, useState } from "react";
import { STORAGE_KEY, randInt, chooseColor, beep, clamp } from "./utils";
import {Header} from "./components/Header"

export default function App() {
  // Settings
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(4);
  const [intervalSec, setIntervalSec] = useState(5);
  const [noRepeat, setNoRepeat] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  const [wantFullscreen, setWantFullscreen] = useState(false);
  const [showProgress, setShowProgress] = useState(false); // NEW

  const [running, setRunning] = useState(false);
  const [menuHidden, setMenuHidden] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  const [display, setDisplay] = useState("—");
  const [color, setColor] = useState("#2a2f3c");
  const [popKey, setPopKey] = useState(0);

  const lastNumberRef = useRef(null);
  const lastColorRef = useRef(null);
  const timerRef = useRef(null);

  // Progress state/refs
  const [progress, setProgress] = useState(0); // 0..1
  const lastTickRef = useRef(null);
  const rafRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Load defaults from Local Storage
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
      if (s.showProgress !== undefined) setShowProgress(!!s.showProgress); // NEW
    } catch {}
  }, []);

  // Persist settings
  useEffect(() => {
    const data = {
      min, max, intervalSec,
      noRepeat, audioOn, wantFullscreen,
      menuHidden, fontScale,
      showProgress, // NEW
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [min, max, intervalSec, noRepeat, audioOn, wantFullscreen, menuHidden, fontScale, showProgress]);

  const tick = () => {
    const nextNum = randInt(min, max, noRepeat, lastNumberRef.current);
    lastNumberRef.current = nextNum;
    setDisplay(String(nextNum));

    const nextColor = chooseColor(lastColorRef.current);
    lastColorRef.current = nextColor;
    setColor(nextColor);

    setPopKey((k) => k + 1);

    // Reset progress cycle
    lastTickRef.current = performance.now();
    setProgress(0);

    if (audioOn) beep();
  };

  // Progress loop
  useEffect(() => {
    if (!running || !showProgress) {
      // Stop anim and reset if not running or not showing
      cancelAnimationFrame(rafRef.current);
      setProgress(0);
      return;
    }

    const sec = clamp(Number(intervalSec) || 5, 0.25, 3600);
    const duration = sec * 1000;

    const loop = () => {
      if (!lastTickRef.current) {
        lastTickRef.current = performance.now();
      }
      const now = performance.now();
      const elapsed = now - lastTickRef.current;
      const frac = Math.min(1, Math.max(0, elapsed / duration));
      setProgress(frac);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, showProgress, intervalSec]);

  // Start ticking when running
  useEffect(() => {
    if (!running) return;
    const sec = clamp(Number(intervalSec) || 5, 0.25, 3600);
    tick(); // sets lastTickRef & resets progress
    timerRef.current = setInterval(tick, sec * 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, intervalSec, min, max, noRepeat]);

  // Space toggles
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

    // Try to keep screen awake
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake lock request failed:', err);
    }

    if (wantFullscreen) {
      try {
        const root = document.documentElement;
        if (!document.fullscreenElement && root.requestFullscreen) {
          await root.requestFullscreen();
        }
      } catch {}
    }

    lastTickRef.current = performance.now();
    setProgress(0);
}


  async function stop() {
    setRunning(false);
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    setProgress(0);

    // Release wake lock
    try {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
    } catch (err) {
      console.warn('Wake lock release failed:', err);
    }

    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
}


  const wrapperRows = menuHidden ? "1fr auto" : "auto 1fr auto";
  const numberStyle = { color, transform: `scale(${fontScale})`, transformOrigin: "center" };

  return (
    <div className="h-screen grid gap-4" style={{ gridTemplateRows: wrapperRows }}>
      {/* Header */}
      {!menuHidden && (
        <Header
          min={min} setMin={setMin}
          max={max} setMax={setMax}
          intervalSec={intervalSec} setIntervalSec={setIntervalSec}
          noRepeat={noRepeat} setNoRepeat={setNoRepeat}
          audioOn={audioOn} setAudioOn={setAudioOn}
          wantFullscreen={wantFullscreen} setWantFullscreen={setWantFullscreen}
          showProgress={showProgress} setShowProgress={setShowProgress}
        />
      )}

      {/* Progress bar (always sits right under where header would be) */}
  

      {/* Main */}
      <main className="px-4">
        {showProgress && (<ProgressBar progress={progress} />)}
        <div key={popKey} className="grid place-items-center h-full font-extrabold leading-none tracking-tight select-none" style={numberStyle}>
          <PopNumber text={display} />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between gap-2 flex-wrap p-4 border-t border-[#1b2230] z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={start}
            onPointerDown={start}
            disabled={running}
            className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-tr from-[#4ade80] to-[#60a5fa] text-[#0b0e14] disabled:opacity-50 touch-manipulation"
          >
            Start
          </button>

          <button
            type="button"
            onClick={stop}
            onPointerDown={stop}
            disabled={!running}
            className="px-4 py-2 rounded-xl font-semibold text-sm bg-[#fb7185] text-[#0b0e14] disabled:opacity-50 touch-manipulation"
          >
            Stop
          </button>

          <button
            type="button"
            onClick={() => setMenuHidden((v) => !v)}
            onPointerDown={() => setMenuHidden((v) => !v)}
            className="px-4 py-2 rounded-xl font-semibold text-[#fff] text-sm bg-[#121722] border border-[#222a3a] touch-manipulation"
          >
            {menuHidden ? "Show menu" : "Hide menu"}
          </button>
        </div>
        {/* ... A+/A- unchanged, but also add type and pointer handler */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFontScale((s) => clamp(s + 0.1, 0.5, 3))}
            onPointerDown={() => setFontScale((s) => clamp(s + 0.1, 0.5, 3))}
            className="px-3 py-2 rounded-xl font-semibold text-sm bg-[#121722] border border-[#222a3a] touch-manipulation"
            title="Increase size"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontScale((s) => clamp(s - 0.1, 0.5, 3))}
            onPointerDown={() => setFontScale((s) => clamp(s - 0.1, 0.5, 3))}
            className="px-3 py-2 rounded-xl font-semibold text-sm bg-[#121722] border border-[#222a3a] touch-manipulation"
            title="Decrease size"
          >
            A-
          </button>
        </div>
      </footer>


      {/* Pop animation */}
      <style>{`@keyframes pop { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

// ---- Components ----

function PopNumber({ text }) {
  return (
    <div style={{ animation: "pop 150ms ease-out" }} className="text-[clamp(96px,18vw,320px)]">
      {text}
    </div>
  );
}

function ProgressBar({ progress }) {
  // progress: 0..1
  const pct = Math.round(progress * 100);
  return (
    <div className="w-full h-2 bg-[#0f1522] border-b border-[#1b2230]">
      <div
        className="h-full bg-gradient-to-r from-[#4ade80] to-[#60a5fa] transition-[width] duration-75 ease-linear"
        style={{ width: `${pct}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        role="progressbar"
      />
    </div>
  );
}
