// src/services/inMemoryStore.ts
import type { FormMeta } from "../types/form";

/**
 * Simple in-memory store for forms.
 * - Keeps data in a module-level variable (lost on page reload)
 * - Exposes CRUD functions
 * - Provides subscribe/unsubscribe so UI can react to updates
 *
 * Usage:
 *  import { inMemoryStore } from "../services/inMemoryStore";
 *  const forms = inMemoryStore.getAll();
 *  inMemoryStore.create({...});
 *  inMemoryStore.subscribe(fn) -> returns subscription id
 *  inMemoryStore.unsubscribe(id)
 */

type Subscriber = (forms: FormMeta[]) => void;

// const KEY = "__IN_MEMORY_FORMS__"; // just a symbolic key (not used in storage)

// module-level state
let formsStore: FormMeta[] = [
    {
        id: "1",
        title: "Employee Feedback Form",
        description: "Collects feedback from employees quarterly.",
        createdAt: "2025-10-15T12:30:00Z",
        updatedAt: "",
        fields: []
    },
    {
        id: "2",
        title: "Customer Satisfaction Survey",
        description: "Survey to measure overall customer satisfaction.",
        createdAt: "2025-09-10T08:15:00Z",
        updatedAt: "",
        fields: []
    },
    {
        id: "3",
        title: "Event Registration Form",
        description: "Used for attendee registration at company events.",
        createdAt: "2025-08-05T10:00:00Z",
        updatedAt: "",
        fields: []
    },
];

// subscribers map: id -> callback
const subscribers = new Map<number, Subscriber>();
let nextSubId = 1;

/** Notify all subscribers about the current forms */
function notifyAll() {
    const snapshot = formsStore.slice(); // shallow copy
    for (const cb of subscribers.values()) {
        try {
            cb(snapshot);
        } catch (err) {
            // swallow subscriber errors so one bad subscriber doesn't break others
            // eslint-disable-next-line no-console
            console.error("inMemoryStore subscriber error:", err);
        }
    }
}

/** Small id helper */
function cryptoRandomId(): string {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
        return (crypto as any).randomUUID();
    }
    return Math.random().toString(36).substring(2, 10);
}

export const inMemoryStore = {
    /** Return all forms (shallow copy) */
    getAll(): FormMeta[] {
        return formsStore.slice();
    },

    /** Return a form by id */
    getById(id: string): FormMeta | undefined {
        return formsStore.find((f) => f.id === id);
    },

    /** Replace entire store (useful for testing) */
    setAll(next: FormMeta[]) {
        formsStore = next.slice();
        notifyAll();
    },

    /** Create and return new form */
    create(title = "Untitled Form", description = ""): FormMeta {
        const newForm: FormMeta = {
            id: cryptoRandomId(),
            title,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            disabled: false,
            fields: [],
            globalStyle: {
                layout: "vertical",
                submitLabel: "Submit",
            },
        };
        formsStore = [newForm, ...formsStore];
        notifyAll();
        return newForm;
    },

    /** Update a form partially */
    update(id: string, patch: Partial<FormMeta>): FormMeta | undefined {
        let updated: FormMeta | undefined;
        formsStore = formsStore.map((f) => {
            if (f.id === id) {
                updated = { ...f, ...patch, updatedAt: new Date().toISOString() };
                return updated;
            }
            return f;
        });
        if (updated) notifyAll();
        return updated;
    },

    /** Delete a form by id */
    delete(id: string) {
        const before = formsStore.length;
        formsStore = formsStore.filter((f) => f.id !== id);
        if (formsStore.length !== before) notifyAll();
    },

    /** Clone a form (deep-ish copy for our simple shapes) */
    clone(id: string): FormMeta | undefined {
        const src = formsStore.find((f) => f.id === id);
        if (!src) return undefined;
        // shallow copy of fields array and options is fine here
        const clone: FormMeta = {
            ...structuredClone ? structuredClone(src) : JSON.parse(JSON.stringify(src)),
            id: cryptoRandomId(),
            title: `${src.title} (copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        formsStore = [clone, ...formsStore];
        notifyAll();
        return clone;
    },

    /** Toggle disabled state */
    toggleStatus(id: string): FormMeta | undefined {
        const f = formsStore.find((x) => x.id === id);
        if (!f) return undefined;
        const updated = { ...f, disabled: !f.disabled, updatedAt: new Date().toISOString() };
        formsStore = formsStore.map((x) => (x.id === id ? updated! : x));
        notifyAll();
        return updated;
    },

    /**
     * Subscribe to changes.
     * Callback is called immediately with current state.
     * Returns a numeric subscription id; call unsubscribe(id) to remove.
     */
    subscribe(cb: Subscriber): number {
        const id = nextSubId++;
        subscribers.set(id, cb);
        try {
            cb(formsStore.slice());
        } catch (err) {
            // swallow callback error
            // eslint-disable-next-line no-console
            console.error("inMemoryStore initial subscriber error:", err);
        }
        return id;
    },

    unsubscribe(subId: number) {
        subscribers.delete(subId);
    },

    /** Utility: clear all forms (for tests) */
    clear() {
        formsStore = [];
        notifyAll();
    },
};
