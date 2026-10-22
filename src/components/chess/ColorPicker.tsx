import type { Color } from "chess.js";
import { BoardPiece } from "./PieceBody";

export function ColorPicker({
  value,
  onChange,
  label = "Your pieces",
}: {
  value: Color;
  onChange: (color: Color) => void;
  label?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        {(["w", "b"] as const).map((color) => (
          <label
            key={color}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 font-bold ${value === color ? "border-primary bg-primary/15" : "border-border bg-card"}`}
          >
            <input
              type="radio"
              name="piece-color"
              checked={value === color}
              onChange={() => onChange(color)}
              className="accent-primary"
            />
            <span className="h-9 w-9">
              <BoardPiece type="k" color={color} />
            </span>
            {color === "w" ? "White" : "Black"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
