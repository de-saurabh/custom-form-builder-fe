// src/types/form.ts
export type FieldType = "text" | "textarea" | "number" | "select" | "checkbox" | "radio" | "date";

export interface FieldOption {
    id: string;
    label: string;
    value: string;
}

export interface FieldValidation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
}

export interface FieldStyling {
    width?: "full" | "half" | "third";
    className?: string;
}

export interface Field {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: FieldOption[];
    validation?: FieldValidation;
    styling?: FieldStyling;
    disabled?: boolean;
}

export interface FormMeta {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    disabled?: boolean;
    slug?: string;
    globalStyle?: {
        submitLabel?: string;
        layout?: "vertical" | "horizontal";
        className?: string;
    };
    fields: Field[];
}
