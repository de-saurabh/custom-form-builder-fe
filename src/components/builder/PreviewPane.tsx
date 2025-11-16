// src/components/builder/PreviewPane.css
import React, {type JSX} from "react";
import type { FormMeta, Field } from "../../types/form";
import "../../styles/PreviewPane.css";

type Props = {
    form: FormMeta;
    /**
     * Optional submit handler for the preview. If not provided,
     * the preview will simply show an alert on submit (no-op).
     */
    onSubmit?: (values: Record<string, any>) => void;
};

export default function PreviewPane({ form, onSubmit }: Props): JSX.Element {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const obj: Record<string, any> = {};
        for (const [k, v] of fd.entries()) {
            // If multiple values for same key, convert to array
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                const cur = obj[k];
                if (Array.isArray(cur)) {
                    cur.push(v);
                } else {
                    obj[k] = [cur, v];
                }
            } else {
                obj[k] = v;
            }
        }

        if (onSubmit) {
            onSubmit(obj);
            return;
        }

        // default no-op behavior
        // eslint-disable-next-line no-alert
        alert("Preview submit (no-op)\n\n" + JSON.stringify(obj, null, 2));
    }

    function renderField(f: Field) {
        const name = f.name || f.id;
        switch (f.type) {
            case "textarea":
                return <textarea name={name} className="preview-input" placeholder={f.placeholder} defaultValue={""} />;

            case "select":
                return (
                    <select name={name} className="preview-input" defaultValue={f.options?.[0]?.value ?? ""}>
                        {(f.options ?? []).map((o) => (
                            <option key={o.id} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                );

            case "checkbox":
                return <input type="checkbox" name={name} className="preview-checkbox" defaultChecked={false} />;

            case "radio":
                return (
                    <div className="preview-radio-group" role="radiogroup" aria-label={f.label}>
                        {(f.options ?? []).map((o) => (
                            <label key={o.id} className="preview-radio-row">
                                <input type="radio" name={name} value={o.value} />
                                <span>{o.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case "number":
                return <input type="number" name={name} className="preview-input" placeholder={f.placeholder} />;

            case "date":
                return <input type="date" name={name} className="preview-input" />;

            case "text":
            default:
                return <input type="text" name={name} className="preview-input" placeholder={f.placeholder} />;
        }
    }

    return (
        <div className="preview-pane">
            <h4 className="preview-title">{form.title}</h4>
            {form.description && <p className="preview-desc">{form.description}</p>}

            <form className="preview-form" onSubmit={handleSubmit}>
                {(form.fields ?? []).map((f) => (
                    <div key={f.id} className="preview-field">
                        <label className="preview-label" htmlFor={f.name || f.id}>
                            {f.label}
                            {f.validation?.required ? <span className="required">*</span> : null}
                        </label>

                        {renderField(f)}
                    </div>
                ))}

                <div className="preview-actions">
                    <button type="submit" className="btn primary">
                        {form.globalStyle?.submitLabel ?? "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
}
