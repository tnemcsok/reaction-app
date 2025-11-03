// ...imports unchanged
export function Header({
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
        {/* Range */}
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
          <input
            type="checkbox"
            checked={showProgress}
            onChange={(e) => setShowProgress(e.target.checked)}
          />
          show progress
        </label>
      </div>
    </header>
  );
}
