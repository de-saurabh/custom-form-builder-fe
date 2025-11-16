// src/components/builder/FieldEditor.tsx
import {type JSX} from "react";
import type { Field, FieldOption } from "../../types/form";
import "../../styles/FieldEditor.css";

type Props = {
    field: Field;
    onChange: (patch: Partial<Field>) => void;
    onAddOption: () => void;
    onChangeOption: (optionId: string, label: string) => void;
    onRemoveOption: (optionId: string) => void;
};

export default function FieldEditor({
                                        field,
                                        onChange,
                                        onAddOption,
                                        onChangeOption,
                                        onRemoveOption,
                                    }: Props): JSX.Element {
    if (!field) return <div className="muted">No field selected</div>;

    return (
        <div className="field-editor">
            <label className="label">
                Label
                <input
                    className="input"
                    value={field.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                />
            </label>

            <label className="label">
                Name
                <input
                    className="input"
                    value={field.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                />
            </label>

            <label className="label">
                Placeholder
                <input
                    className="input"
                    value={field.placeholder ?? ""}
                    onChange={(e) => onChange({ placeholder: e.target.value })}
                />
            </label>

            <label className="label checkbox-row">
                <input
                    type="checkbox"
                    checked={Boolean(field.validation?.required)}
                    onChange={(e) =>
                        onChange({ validation: { ...(field.validation ?? {}), required: e.target.checked } })
                    }
                />
                <span>Required</span>
            </label>

            {(field.type === "select" || field.type === "radio") && (
                <div className="options-editor">
                    <h4 className="subheading">Options</h4>

                    <ul className="options-list">
                        {(field.options ?? []).map((opt: FieldOption) => (
                            <li key={opt.id} className="option-row">
                                <input
                                    className="input"
                                    value={opt.label}
                                    onChange={(e) => onChangeOption(opt.id, e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn small"
                                    onClick={() => onRemoveOption(opt.id)}
                                >
                                    Del
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="options-actions">
                        <button type="button" className="btn small" onClick={onAddOption}>
                            Add option
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
