import { PRESETS } from "../constants";

interface WidthControlsProps {
  textWidth: number;
  activePresetId: string | null; // null when the width came from dragging
  onPreset: (id: string) => void;
  matchWindow: boolean; // true = width follows the live browser window
  onToggleMatchWindow: () => void;
  visibleChars: number; // chars surviving in MY post's hook, as a sanity readout
}

// Width = the whole UX. Expose the governing variable directly: presets that set
// the text-container width, a "match my window" mode that follows the live
// browser size, plus a readout of the current width and the visible char count.
export function WidthControls({
  textWidth,
  activePresetId,
  onPreset,
  matchWindow,
  onToggleMatchWindow,
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
              activePresetId === p.id && !matchWindow
                ? "preset-btn preset-btn--active"
                : "preset-btn"
            }
            onClick={() => onPreset(p.id)}
            title={p.trusted ? "Measured at full window — trusted" : "Calibrate against a real device"}
          >
            {p.label}
            {!p.trusted && <span className="preset-cal" title="Approximate — calibrate"> ~</span>}
          </button>
        ))}
        <button
          type="button"
          className={
            matchWindow ? "preset-btn preset-btn--active" : "preset-btn"
          }
          onClick={onToggleMatchWindow}
          title="Track the live browser window — resize it and watch the hook re-clamp"
        >
          Match my window
        </button>
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
