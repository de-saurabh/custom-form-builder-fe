// src/components/builder/FormBuilderShell.tsx
import {type JSX, useEffect, useMemo, useState} from "react";
import type { FormMeta, Field } from "../../types/form";
import { useForms } from "../../hooks/useForms";
import FieldPalette from "./FieldPalette";
import FieldList from "./FieldList";
import FieldEditor from "./FieldEditor";
import PreviewPane from "./PreviewPane";
import "../../styles/FormBuilderShell.css";

type Props = {
    formId: string;
};

/**
 * FormBuilderShell (modular)
 *
 * Composes FieldPalette, FieldList, FieldEditor and PreviewPane.
 * Keeps a local editable copy of the form so Save / Discard work as expected.
 */
export default function FormBuilderShell({ formId }: Props): JSX.Element {
    const { forms, updateForm, cloneForm } = useForms();
    const sourceForm = useMemo(() => forms.find((f) => f.id === formId), [forms, formId]);

    const [localForm, setLocalForm] = useState<FormMeta | null>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // initialize local copy whenever the source changes
    useEffect(() => {
        if (!sourceForm) {
            setLocalForm(null);
            setSelectedFieldId(null);
            setIsDirty(false);
            return;
        }
        const clone = JSON.parse(JSON.stringify(sourceForm)) as FormMeta;
        setLocalForm(clone);
        setSelectedFieldId(clone.fields?.[0]?.id ?? null);
        setIsDirty(false);
    }, [sourceForm]);

    // safe setter that marks dirty
    function updateLocal(fn: (prev: FormMeta) => FormMeta) {
        setLocalForm((prev) => {
            if (!prev) return prev;
            const copy = JSON.parse(JSON.stringify(prev)) as FormMeta;
            const next = fn(copy);
            setIsDirty(true);
            return next;
        });
    }

    // add a new field
    function addField(type: Field["type"]) {
        updateLocal((prev) => {
            const newField: Field = {
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
            return { ...prev, fields: [...(prev.fields ?? []), newField] };
        });
    }

    // remove field
    function removeField(id: string) {
        updateLocal((prev) => {
            const nextFields = (prev.fields ?? []).filter((f) => f.id !== id);
            if (selectedFieldId === id) {
                setSelectedFieldId(nextFields?.[0]?.id ?? null);
            }
            return { ...prev, fields: nextFields };
        });
    }

    // reorder fields (receives reordered array from FieldList)
    function reorderFields(next: Field[]) {
        updateLocal((prev) => ({ ...prev, fields: next }));
    }

    // update selected field partially
    function updateSelectedField(patch: Partial<Field>) {
        if (!localForm || !selectedFieldId) return;
        updateLocal((prev) => {
            const fields = (prev.fields ?? []).map((f) => (f.id === selectedFieldId ? { ...f, ...patch } : f));
            return { ...prev, fields };
        });
    }

    // options helpers
    function addOptionToSelected() {
        if (!localForm || !selectedFieldId) return;
        const selected = localForm.fields?.find((f) => f.id === selectedFieldId);
        if (!selected) return;
        const nextOptions = [...(selected.options ?? []), { id: cryptoRandomId(), label: "New option", value: "new_option" }];
        updateSelectedField({ options: nextOptions });
    }

    function updateOptionLabel(optionId: string, label: string) {
        if (!localForm || !selectedFieldId) return;
        const selected = localForm.fields?.find((f) => f.id === selectedFieldId);
        if (!selected) return;
        const nextOptions = (selected.options ?? []).map((o) =>
            o.id === optionId ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "_") } : o
        );
        updateSelectedField({ options: nextOptions });
    }

    function removeOptionFromSelected(optionId: string) {
        if (!localForm || !selectedFieldId) return;
        const selected = localForm.fields?.find((f) => f.id === selectedFieldId);
        if (!selected) return;
        const nextOptions = (selected.options ?? []).filter((o) => o.id !== optionId);
        updateSelectedField({ options: nextOptions });
    }

    // Save local changes back to store
    function save() {
        if (!localForm) return;
        updateForm(localForm.id, localForm);
        setIsDirty(false);
    }

    // Discard local changes (reset to source)
    function discard() {
        if (!sourceForm) return;
        const clone = JSON.parse(JSON.stringify(sourceForm)) as FormMeta;
        setLocalForm(clone);
        setSelectedFieldId(clone.fields?.[0]?.id ?? null);
        setIsDirty(false);
    }

    if (!localForm) {
        return (
            <div className="builder-shell empty">
                <p className="muted">Form not found.</p>
            </div>
        );
    }

    const selectedField = localForm.fields?.find((f) => f.id === selectedFieldId) ?? null;

    return (
        <div className="builder-shell">
            <header className="builder-shell-header">
                <div>
                    <h2 className="builder-title">{localForm.title}</h2>
                    <p className="builder-desc">{localForm.description}</p>
                </div>

                <div className="builder-shell-actions">
                    <button className="btn" onClick={discard} disabled={!isDirty}>
                        Discard
                    </button>
                    <button className="btn primary" onClick={save} disabled={!isDirty}>
                        Save
                    </button>
                    <button className="btn" onClick={() => cloneForm(localForm.id)}>
                        Clone
                    </button>
                </div>
            </header>

            <div className="builder-shell-grid">
                <aside className="left-col">
                    <FieldPalette onAdd={addField} />
                    <FieldList
                        fields={localForm.fields ?? []}
                        selectedId={selectedFieldId}
                        onSelect={(id) => setSelectedFieldId(id)}
                        onDelete={(id) => removeField(id)}
                        onReorder={(next) => reorderFields(next)}
                    />
                </aside>

                <section className="middle-col card">
                    <h3 className="pane-heading">Inspector</h3>
                    {!selectedField ? (
                        <div className="muted">Select a field to edit.</div>
                    ) : (
                        <FieldEditor
                            field={selectedField}
                            onChange={(patch) => updateSelectedField(patch)}
                            onAddOption={addOptionToSelected}
                            onChangeOption={updateOptionLabel}
                            onRemoveOption={removeOptionFromSelected}
                        />
                    )}
                </section>

                <aside className="right-col card">
                    <h3 className="pane-heading">Preview</h3>
                    <PreviewPane form={localForm} />
                </aside>
            </div>
        </div>
    );
}

/* small id helper */
function cryptoRandomId(): string {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") return (crypto as any).randomUUID();
    return Math.random().toString(36).slice(2, 9);
}
