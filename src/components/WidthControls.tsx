import { PRESETS } from "../constants";

interface WidthControlsProps {
  textWidth: number;
  activePresetId: string | null; // null when the width came from dragging
  onPreset: (id: string) => void;
  visibleChars: number; // chars surviving in MY post's hook, as a sanity readout
}

// Width = the whole UX. Expose the governing variable directly: presets that set
// the text-container width, plus a live readout of the current width and the
// visible char count.
export function WidthControls({
  textWidth,
  activePresetId,
  onPreset,
  visibleChars,
}: WidthControlsProps) {
  return (
    <div className="width-controls">
      <div className="preset-row">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              activePresetId === p.id ? "preset-btn preset-btn--active" : "preset-btn"
            }
            onClick={() => onPreset(p.id)}
            title={p.trusted ? "Measured at full window — trusted" : "Calibrate against a real device"}
          >
            {p.label}
            {!p.trusted && <span className="preset-cal" title="Approximate — calibrate"> ~</span>}
          </button>
        ))}
      </div>
      <div className="readout">
        <span className="readout-num">{Math.round(textWidth)}px</span>
        <span className="readout-label">text container</span>
        <span className="readout-dot">·</span>
        <span className="readout-num">{visibleChars}</span>
        <span className="readout-label">visible chars in your hook</span>
      </div>
    </div>
  );
}
