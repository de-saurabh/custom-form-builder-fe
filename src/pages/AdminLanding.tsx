import {type JSX, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForms } from "../hooks/useForms";
import CreateFormModal from "../components/CreateFormModal";
import "../styles/AdminLanding.css";

export default function AdminLanding(): JSX.Element {
    const { forms, cloneForm, deleteForm, toggleFormStatus } = useForms();
    const [isCreateOpen, setCreateOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    function handleCreated(formId: string) {
        // After creating a form, navigate to the builder so user can start editing.
        // If you haven't implemented the builder route yet that's fine; navigation
        // will simply change the URL and won't crash.
        navigate(`/builder/${formId}`);
    }

    return (
        <div className="admin-landing">
            <header className="admin-header">
                <h1 className="page-title">Forms</h1>
                <div>
                    <button className="btn primary" onClick={() => setCreateOpen(true)}>
                        + Create Form
                    </button>
                </div>
            </header>

            <main className="admin-content">
                {forms.length === 0 ? (
                    <div className="card empty">No forms yet. Click “Create Form” to get started.</div>
                ) : (
                    <table className="forms-table" aria-describedby="forms-table">
                        <caption id="forms-table" className="sr-only">
                            List of forms
                        </caption>

                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {forms.map((form) => (
                            <tr key={form.id}>
                                <td className="col-title">{form.title}</td>
                                <td className="col-desc">{form.description || "—"}</td>
                                <td className="col-created">
                                    <time dateTime={form.createdAt}>
                                        {new Date(form.createdAt).toLocaleDateString()}{" "}
                                        {new Date(form.createdAt).toLocaleTimeString()}
                                    </time>
                                </td>
                                <td className="col-status">{form.disabled ? "Disabled" : "Active"}</td>
                                <td className="col-actions">
                                    <div className="actions">
                                        {/* Edit: placeholder for future edit modal / navigation */}
                                        <button
                                            className="btn small"
                                            onClick={() => {
                                                // TODO: wire to an edit modal or navigate to builder in edit mode
                                                navigate(`/builder/${form.id}`);
                                            }}
                                            title="Edit form"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn small"
                                            onClick={() => {
                                                cloneForm(form.id);
                                            }}
                                            title="Clone form"
                                        >
                                            Clone
                                        </button>

                                        <Link to={`/f/${form.id}`}>
                                            <button className="btn small" title="Open public link">
                                                Open Link
                                            </button>
                                        </Link>

                                        <button
                                            className="btn small"
                                            onClick={() => toggleFormStatus(form.id)}
                                            title={form.disabled ? "Enable form" : "Disable form"}
                                        >
                                            {form.disabled ? "Enable" : "Disable"}
                                        </button>

                                        <button
                                            className="btn small danger"
                                            onClick={() => {
                                                if (window.confirm("Delete this form? This cannot be undone.")) {
                                                    deleteForm(form.id);
                                                }
                                            }}
                                            title="Delete form"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </main>

            <CreateFormModal
                isOpen={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={handleCreated}
            />
        </div>
    );
}
