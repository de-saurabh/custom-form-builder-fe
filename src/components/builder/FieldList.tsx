// src/components/builder/FieldList.tsx
import type { Field } from "../../types/form";
import "../../styles/FieldList.css";
import type {JSX} from "react";

type Props = {
    fields: Field[];
    selectedId?: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    /**
     * Called when the user requests a reordered field list.
     * The component provides the new fields array in the requested order.
     */
    onReorder: (next: Field[]) => void;
};

export default function FieldList({ fields, selectedId, onSelect, onDelete, onReorder }: Props): JSX.Element {
    // Move an item at index i up by one (if possible)
    function moveUp(index: number) {
        if (index <= 0) return;
        const next = fields.slice();
        const tmp = next[index - 1];
        next[index - 1] = next[index];
        next[index] = tmp;
        onReorder(next);
    }

    // Move an item at index i down by one (if possible)
    function moveDown(index: number) {
        if (index >= fields.length - 1) return;
        const next = fields.slice();
        const tmp = next[index + 1];
        next[index + 1] = next[index];
        next[index] = tmp;
        onReorder(next);
    }

    if (!fields || fields.length === 0) {
        return (
            <div className="field-list" aria-live="polite">
                <p className="muted">No fields yet — add one from the palette.</p>
            </div>
        );
    }

    return (
        <div className="field-list" role="list" aria-label="Fields">
            <h3 className="pane-heading">Fields</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {fields.map((f, idx) => {
                    const isSelected = selectedId === f.id;
                    return (
                        <li
                            key={f.id}
                            role="listitem"
                            aria-current={isSelected ? "true" : undefined}
                            className={`field-row ${isSelected ? "selected" : ""}`}
                        >
                            <div
                                className="field-row-main"
                                onClick={() => onSelect(f.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") onSelect(f.id);
                                }}
                            >
                                <div className="field-row-label" title={f.label}>
                                    {f.label}
                                </div>

                                {/* Color swatch (no text). CSS will style .field-row-swatch and .type-<type> */}
                                <div
                                    className={`field-row-swatch type-${f.type}`}
                                    title={f.type}
                                    aria-label={`Field type: ${f.type}`}
                                    role="img"
                                />
                            </div>

                            <div className="field-row-actions">
                                <button type="button" className="btn small" onClick={() => moveUp(idx)} aria-label={`Move ${f.label} up`} disabled={idx === 0}>
                                    ↑
                                </button>
                                <button type="button" className="btn small" onClick={() => moveDown(idx)} aria-label={`Move ${f.label} down`} disabled={idx === fields.length - 1}>
                                    ↓
                                </button>
                                <button type="button" className="btn small" onClick={() => onSelect(f.id)} aria-label={`Edit ${f.label}`}>
                                    Edit
                                </button>
                                <button type="button" className="btn small" onClick={() => onDelete(f.id)} aria-label={`Delete ${f.label}`}>
                                    Del
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
