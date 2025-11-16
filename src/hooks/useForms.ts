// src/hooks/useForms.ts
import { useCallback, useEffect, useState } from "react";
import type { FormMeta } from "../types/form";
import { inMemoryStore } from "../services/inMemoryStore";

/**
 * useForms hook backed by inMemoryStore.
 * - Subscribes to the in-memory store on mount and unsubscribes on unmount.
 * - Returns the current forms and mutation helpers that delegate to the store.
 *
 * Note: this is in-memory only — data will be lost on full page reload.
 */

export function useForms() {
    const [forms, setFormsState] = useState<FormMeta[]>([]);

    // Subscribe on mount to keep in-sync with the inMemoryStore
    useEffect(() => {
        const subId = inMemoryStore.subscribe((snapshot) => {
            setFormsState(snapshot);
        });

        return () => {
            inMemoryStore.unsubscribe(subId);
        };
    }, []);

    // Exposed operations (memoized)
    const createForm = useCallback((title = "Untitled Form", description = ""): FormMeta => {
        return inMemoryStore.create(title, description);
    }, []);

    const cloneForm = useCallback((id: string): FormMeta | undefined => {
        return inMemoryStore.clone(id);
    }, []);

    const deleteForm = useCallback((id: string): void => {
        inMemoryStore.delete(id);
    }, []);

    const toggleFormStatus = useCallback((id: string): FormMeta | undefined => {
        return inMemoryStore.toggleStatus(id);
    }, []);

    const updateForm = useCallback((id: string, patch: Partial<FormMeta>): FormMeta | undefined => {
        return inMemoryStore.update(id, patch);
    }, []);

    const setForms = useCallback((next: FormMeta[]) => {
        inMemoryStore.setAll(next);
    }, []);

    return {
        forms,
        setForms,
        createForm,
        cloneForm,
        deleteForm,
        toggleFormStatus,
        updateForm,
    };
}
