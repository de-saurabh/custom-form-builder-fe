import {type JSX, useEffect, useMemo, useState} from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useForms } from "../hooks/useForms";
import type { FormMeta, Field, FieldOption } from "../types/form";
import "../styles/FormBuilderPage.css";

/**
 * FormBuilderPage (fixed)
 *
 * - Loads a form by :formId from the inMemory store via useForms()
 * - Maintains a local editable copy (so Save / Discard make sense)
 * - Left: simple FieldPalette (buttons to add field types)
 * - Middle: Field inspector for selected field (basic edits)
 * - Right: Preview (simple live preview of current local copy)
 *
 * This file fixes previous TypeScript/syntax issues.
 */

const FIELD_TYPES: Field["type"][] = [
    "text",
    "textarea",
    "number",
    "select",
    "checkbox",
    "radio",
    "date",
];

export default function FormBuilderPage(): JSX.Element {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const { forms, updateForm } = useForms();
    const [localForm, setLocalForm] = useState<FormMeta | null>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // find authoritative form from store
    const sourceForm = useMemo(() => {
        if (!formId) return undefined;
        return forms.find((f) => f.id === formId);
    }, [forms, formId]);

    // initialize localForm when sourceForm changes
    useEffect(() => {
        if (sourceForm) {
            const cloned = JSON.parse(JSON.stringify(sourceForm)) as FormMeta;
            setLocalForm(cloned);
            setSelectedFieldId(cloned.fields?.[0]?.id ?? null);
            setIsDirty(false);
        } else {
            setLocalForm(null);
            setSelectedFieldId(null);
            setIsDirty(false);
        }
    }, [sourceForm]);

    // defensive navigation
    if (!formId) return <Navigate to="/" replace />;
    if (!sourceForm) {
        return (
            <div className="builder-page">
                <div className="builder-empty">
                    Form not found. Return to the <a href="/">dashboard</a>.
                </div>
            </div>
        );
    }

    // helper to update local copy immutably and mark dirty
    function setLocal(updater: (prev: FormMeta) => FormMeta) {
        setLocalForm((prev) => {
            if (!prev) return prev;
            const copy = JSON.parse(JSON.stringify(prev)) as FormMeta;
            const next = updater(copy);
            setIsDirty(true);
            return next;
        });
    }

    function addField(type: Field["type"]) {
        setLocal((prev) => {
            const nextField: Field = {
                id: cryptoRandomId(),
                name: `field_${(prev.fields?.length ?? 0) + 1}`,
                label: `New ${type}`,
                type,
                placeholder: "",
                options:
                    type === "select" || type === "radio"
                        ? [{ id: cryptoRandomId(), label: "Option 1", value: "opt1" }]
                        : undefined,
                validation: {},
                styling: { width: "full" },
                disabled: false,
            };
            return { ...prev, fields: [...(prev.fields ?? []), nextField] };
        });
    }

    function removeField(fieldId: string) {
        setLocal((prev) => {
            const nextFields = (prev.fields ?? []).filter((f) => f.id !== fieldId);
            const next = { ...prev, fields: nextFields };
            if (selectedFieldId === fieldId) {
                setSelectedFieldId(nextFields?.[0]?.id ?? null);
            }
            return next;
        });
    }

    function updateSelectedField(patch: Partial<Field>) {
        if (!localForm || !selectedFieldId) return;
        setLocal((prev) => {
            const nextFields = (prev.fields ?? []).map((f) =>
                f.id === selectedFieldId ? { ...f, ...patch } : f
            );
            return { ...prev, fields: nextFields };
        });
    }

    function save() {
        if (!localForm) return;
        // updateForm expects (id, patch)
        updateForm(localForm.id, localForm);
        setIsDirty(false);
    }

    function discard() {
        if (sourceForm) {
            const cloned = JSON.parse(JSON.stringify(sourceForm)) as FormMeta;
            setLocalForm(cloned);
            setSelectedFieldId(cloned.fields?.[0]?.id ?? null);
            setIsDirty(false);
        }
    }

    const selectedField = localForm?.fields?.find((f) => f.id === selectedFieldId) ?? null;

    // helper to update an option's label/value for selected field
    function updateOptionLabel(optionId: string, newLabel: string) {
        if (!selectedField) return;
        const newOptions = (selectedField.options ?? []).map((o) =>
            o.id === optionId ? { ...o, label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, "_") } : o
        );
        updateSelectedField({ options: newOptions });
    }

    // helper to remove an option
    function removeOption(optionId: string) {
        if (!selectedField) return;
        const newOptions = (selectedField.options ?? []).filter((o) => o.id !== optionId);
        updateSelectedField({ options: newOptions });
    }

    // helper to add an option
    function addOption() {
        if (!selectedField) return;
        const newOptions = [...(selectedField.options ?? []), { id: cryptoRandomId(), label: "New option", value: "new_option" }];
        updateSelectedField({ options: newOptions });
    }

    return (
        <div className="builder-page">
            <header className="builder-header">
                <div className="builder-title">
                    <h2>{localForm?.title ?? "Untitled Form"}</h2>
                    <p className="builder-desc">{localForm?.description}</p>
                </div>

                <div className="builder-actions">
                    <button className="btn" onClick={discard} disabled={!isDirty}>
                        Discard
                    </button>
                    <button className="btn primary" onClick={save} disabled={!isDirty}>
                        Save
                    </button>
                    <button
                        className="btn"
                        onClick={() => {
                            // quick navigation back to dashboard
                            navigate("/");
                        }}
                    >
                        Back
                    </button>
                </div>
            </header>

            <div className="builder-grid">
                {/* Left column */}
                <aside className="pane pane-left">
                    <section className="card">
                        <h3 className="pane-heading">Add Fields</h3>
                        <div className="field-palette">
                            {FIELD_TYPES.map((t) => (
                                <button key={t} className="btn small" onClick={() => addField(t)}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="card" aria-labelledby="fields-list-heading">
                        <h3 id="fields-list-heading" className="pane-heading">
                            Fields
                        </h3>
                        <ul className="field-list">
                            {(localForm?.fields ?? []).map((f) => (
                                <li key={f.id} className={`field-row ${selectedFieldId === f.id ? "selected" : ""}`}>
                                    <button
                                        type="button"
                                        className="field-row-main"
                                        onClick={() => setSelectedFieldId(f.id)}
                                    >
                                        <div className="field-row-label">{f.label}</div>
                                        <div className="field-row-type">{f.type}</div>
                                    </button>
                                    <div className="field-row-actions">
                                        <button className="btn small" onClick={() => setSelectedFieldId(f.id)}>
                                            Edit
                                        </button>
                                        <button className="btn small" onClick={() => removeField(f.id)}>
                                            Del
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {(!localForm?.fields || localForm.fields.length === 0) && (
                                <li className="muted">No fields yet — add one from the palette</li>
                            )}
                        </ul>
                    </section>
                </aside>

                {/* Middle column: Inspector */}
                <section className="pane pane-middle card">
                    <h3 className="pane-heading">Inspector</h3>

                    {!selectedField && <div className="muted">Select a field to edit its properties.</div>}

                    {selectedField && (
                        <div className="inspector">
                            <label className="label">
                                Label
                                <input
                                    className="input"
                                    value={selectedField.label}
                                    onChange={(e) => updateSelectedField({ label: e.target.value })}
                                />
                            </label>

                            <label className="label">
                                Name
                                <input
                                    className="input"
                                    value={selectedField.name}
                                    onChange={(e) => updateSelectedField({ name: e.target.value })}
                                />
                            </label>

                            <label className="label">
                                Placeholder
                                <input
                                    className="input"
                                    value={selectedField.placeholder ?? ""}
                                    onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                                />
                            </label>

                            <label className="label checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={Boolean(selectedField.validation?.required)}
                                    onChange={(e) =>
                                        updateSelectedField({
                                            validation: { ...(selectedField.validation ?? {}), required: e.target.checked },
                                        })
                                    }
                                />
                                <span>Required</span>
                            </label>

                            {(selectedField.type === "select" || selectedField.type === "radio") && (
                                <div>
                                    <h4 className="subheading">Options</h4>
                                    <ul className="options-list">
                                        {(selectedField.options ?? []).map((opt: FieldOption) => (
                                            <li key={opt.id} className="option-row">
                                                <input
                                                    className="input"
                                                    value={opt.label}
                                                    onChange={(e) => updateOptionLabel(opt.id, e.target.value)}
                                                />
                                                <button className="btn small" onClick={() => removeOption(opt.id)}>
                                                    Del
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <div style={{ marginTop: 8 }}>
                                        <button className="btn small" onClick={addOption}>
                                            Add option
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Right column: Preview */}
                <aside className="pane pane-right card">
                    <h3 className="pane-heading">Preview</h3>
                    <div className="preview">
                        <h4 className="preview-title">{localForm?.title}</h4>
                        <p className="preview-desc">{localForm?.description}</p>

                        <form
                            className="preview-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert("Preview submit (no-op)");
                            }}
                        >
                            {(localForm?.fields ?? []).map((f) => (
                                <div key={f.id} className="preview-field">
                                    <label className="preview-label">{f.label}</label>

                                    {f.type === "textarea" ? (
                                        <textarea className="input" placeholder={f.placeholder} />
                                    ) : f.type === "select" ? (
                                        <select className="input">
                                            {f.options?.map((o) => (
                                                <option key={o.id} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : f.type === "checkbox" ? (
                                        <input type="checkbox" />
                                    ) : (
                                        <input
                                            className="input"
                                            type={f.type === "number" ? "number" : "text"}
                                            placeholder={f.placeholder}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="preview-actions">
                                <button className="btn primary" type="submit">
                                    {localForm?.globalStyle?.submitLabel ?? "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </aside>
            </div>
        </div>
    );
}

/** helper id generator */
function cryptoRandomId(): string {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
        return (crypto as any).randomUUID();
    }
    return Math.random().toString(36).slice(2, 9);
}
