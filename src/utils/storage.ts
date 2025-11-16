// src/utils/storage.ts
// src/utils/storage.ts
import type {FormMeta} from "../types/form";

const KEY = "forms_v1";

export function loadForms(): FormMeta[] {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as FormMeta[]) : [];
    } catch (err) {
        console.error("Failed to load forms from localStorage:", err);
        return [];
    }
}

export function saveForms(forms: FormMeta[]): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(forms));
    } catch (err) {
        console.error("Failed to save forms to localStorage:", err);
    }
}

export function getFormById(id: string): FormMeta | undefined {
    return loadForms().find((f) => f.id === id);
}

/** Save a single user submission (response) for a form */
export function saveResponse(formId: string, payload: Record<string, any>): void {
    try {
        const key = `responses:${formId}`;
        const raw = localStorage.getItem(key);
        const arr = raw ? (JSON.parse(raw) as any[]) : [];
        arr.push({ id: cryptoRandomId(), submittedAt: new Date().toISOString(), payload });
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (err) {
        console.error("Failed to save response:", err);
    }
}

export function getResponses(formId: string): Array<{ id: string; submittedAt: string; payload: Record<string, any> }> {
    try {
        const key = `responses:${formId}`;
        const raw = localStorage.getItem(key) ?? "[]";
        return JSON.parse(raw) as Array<{ id: string; submittedAt: string; payload: Record<string, any> }>;
    } catch (err) {
        console.error("Failed to load responses:", err);
        return [];
    }
}

/** Small helper to generate ids */
function cryptoRandomId(): string {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
        return (crypto as any).randomUUID();
    }
    return Math.random().toString(36).substring(2, 10);
}
