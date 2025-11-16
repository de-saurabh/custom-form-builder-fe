import React, { useState } from "react";
import { useForms } from "../hooks/useForms";
import "../styles/CreateFormModal.css";

type CreateFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Optional callback that receives the created form id.
     * Useful if you want to navigate to the builder or form page immediately.
     */
    onCreated?: (formId: string) => void;
};

export default function CreateFormModal({ isOpen, onClose, onCreated }: CreateFormModalProps) {
    const { createForm } = useForms();
    const [title, setTitle] = useState<string>("Untitled Form");
    const [description, setDescription] = useState<string>("");

    if (!isOpen) return null;

    function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const created = createForm(title.trim() || "Untitled Form", description.trim());
        if (onCreated) onCreated(created.id);
        onClose();
        // Reset fields for future opens
        setTitle("Untitled Form");
        setDescription("");
    }

    function handleDiscard() {
        // simply close and reset
        setTitle("Untitled Form");
        setDescription("");
        onClose();
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-form-title">
            <div className="modal">
                <header className="modal-header">
                    <h2 id="create-form-title">Create new form</h2>
                </header>

                <form className="modal-body" onSubmit={handleSave}>
                    <label className="label">
                        Title
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Form title"
                            required
                        />
                    </label>

                    <label className="label">
                        Description
                        <textarea
                            className="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description (optional)"
                            rows={3}
                        />
                    </label>

                    <div className="modal-actions">
                        <button type="submit" className="btn primary">Save</button>
                        <button type="button" className="btn" onClick={handleDiscard}>Discard</button>
                        <button type="button" className="btn" onClick={onClose}>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
