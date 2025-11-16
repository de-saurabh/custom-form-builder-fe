// src/pages/FormBuilderPage.tsx
// src/pages/FormBuilderPage.tsx
import type {JSX} from "react";
import { useParams, Navigate } from "react-router-dom";
import FormBuilderShell from "../components/builder/FormBuilderShell";

/**
 * FormBuilderPage
 *
 * Route-level component that extracts the formId from the URL
 * and delegates all builder logic to FormBuilderShell.
 */
export default function FormBuilderPage(): JSX.Element {
    const { formId } = useParams<{ formId: string }>();

    if (!formId) return <Navigate to="/" replace />;

    return (
        <div className="page-wrapper">
            <FormBuilderShell formId={formId} />
        </div>
    );
}
