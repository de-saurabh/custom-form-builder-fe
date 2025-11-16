// src/App.tsx (example)
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLanding from "./pages/AdminLanding";
import FormBuilderPage from "./pages/FormBuilderPage.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<AdminLanding />} />
            <Route path="/builder/:formId" element={<FormBuilderPage />} />
            {/*<Route path="/f/:formId" element={<FormRendererPage />} />*/}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
