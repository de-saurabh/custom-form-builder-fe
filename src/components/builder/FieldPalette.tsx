// src/components/builder/FieldPalette.tsx
import type { Field as FieldType } from "../../types/form";
import "../../styles/FieldPalette.css";
import type {JSX} from "react";

export const AVAILABLE_FIELDS: FieldType["type"][] = [
    "text",
    "textarea",
    "number",
    "select",
    "checkbox",
    "radio",
    "date",
];

type Props = {
    onAdd: (type: FieldType["type"]) => void;
    compact?: boolean;
};

export default function FieldPalette({ onAdd }: Props): JSX.Element {
    return (
        <div className="field-palette" role="region" aria-label="Add fields">
            <h3 className="pane-heading">Add Fields</h3>

            <div className="field-palette-buttons" aria-hidden={false}>
                {AVAILABLE_FIELDS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        className={`palette-btn type-${t}`}
                        onClick={() => onAdd(t)}
                        aria-label={`Add ${t} field`}
                        title={`Add ${t} field`}
                    >
                        <span className={`palette-swatch type-${t}`} aria-hidden="true" />
                        <span className="palette-label">{t}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
