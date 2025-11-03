import React from "react";

/**
 * Header: settings controls.
 * Controlled entirely via props passed from App.
 */
export function Header({
  // NEW
  mode, setMode,
  arrowSet, setArrowSet,

  // existing
  min, setMin,
  max, setMax,
  intervalSec, setIntervalSec,
  noRepeat, setNoRepeat,
  audioOn, setAudioOn,
  wantFullscreen, setWantFullscreen,
  showProgress, setShowProgress,
}) {
  return (
    <header className="w-full px-4 py-3 border-b border-[#1b2230]">
      <div className="flex flex-wrap justify-between items-center gap-2">

        {/* Mode */}
        <span className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-[#121722] border border-[#222a3a] text-sm rounded-md px-2 py-1 text-white"
          >
            <option value="numbers">numbers</option>
            <option value="arrows">arrows</option>
          </select>
        </span>

        {/* Range (only for numbers) */}
        {mode === "numbers" && (
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
        )}

        {/* Num (only for arrows) */}
        {mode === "arrows" && (
          <span className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
            Num
            <select
              value={arrowSet}
              onChange={(e) => setArrowSet(e.target.value)}
              className="bg-[#121722] border border-[#222a3a] text-sm rounded-md px-2 py-1 text-white"
            >
              <option value="2h">2 (horizontal)</option>
              <option value="2v">2 (vertical)</option>
              <option value="4">4</option>
              <option value="8">8</option>
            </select>
          </span>
        )}

        {/* Interval */}
        <span className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
          Interval (sec)
          <input
            type="number" min={0.5} step={0.5}
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            className="bg-[#121722] border border-[#222a3a] text-sm rounded-md px-2 py-1 w-24 text-white"
          />
        </span>

        {/* Toggles */}
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

        <label className="inline-flex items-center gap-2 border border-[#222a3a] bg-[#121722] px-3 py-1.5 rounded-full text-xs text-[#a0a3ac]">
          <input type="checkbox" checked={showProgress} onChange={(e) => setShowProgress(e.target.checked)} />
          show progress
        </label>
      </div>
    </header>
  );
}
