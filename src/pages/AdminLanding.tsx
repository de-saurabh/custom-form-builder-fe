import "../styles/AdminLanding.css";
import type {JSX} from "react";

interface FormData {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    status: "Active" | "Disabled";
}

const dummyForms: FormData[] = [
    {
        id: "1",
        title: "Employee Feedback Form",
        description: "Collects feedback from employees quarterly.",
        createdAt: "2025-10-15T12:30:00Z",
        status: "Active",
    },
    {
        id: "2",
        title: "Customer Satisfaction Survey",
        description: "Survey to measure overall customer satisfaction.",
        createdAt: "2025-09-10T08:15:00Z",
        status: "Disabled",
    },
    {
        id: "3",
        title: "Event Registration Form",
        description: "Used for attendee registration at company events.",
        createdAt: "2025-08-05T10:00:00Z",
        status: "Active",
    },
];

export default function AdminLanding(): JSX.Element {
    return (
        <div className="admin-landing">
            <header className="admin-header">
                <h1 className="page-title">Forms</h1>
                <button className="btn primary">+ Create Form</button>
            </header>

            <main className="admin-content">
                <table className="forms-table">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Created At</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dummyForms.map((form) => (
                        <tr key={form.id}>
                            <td>{form.title}</td>
                            <td>{form.description}</td>
                            <td>
                                {new Date(form.createdAt).toLocaleDateString()}{" "}
                                {new Date(form.createdAt).toLocaleTimeString()}
                            </td>
                            <td>{form.status}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="btn small">Edit</button>
                                    <button className="btn small">Clone</button>
                                    <button className="btn small">Open</button>
                                    <button className="btn small">Disable</button>
                                    <button className="btn small danger">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}
