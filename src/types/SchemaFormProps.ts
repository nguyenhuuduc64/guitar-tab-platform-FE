import type { RegisterOptions } from "react-hook-form";

export type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "editor"
    | "file";

export interface FieldOption {
    label: string;
    value: string | number;
}

export interface FieldConfig {
    name: string;
    label?: string;
    type?: FieldType;
    placeholder?: string;
    defaultValue?: any;
    validation?: RegisterOptions;
    options?: FieldOption[];
    children?: FieldConfig[];
    className?: string; // Optional custom styling
}

export interface SchemaFormProps {
    name: string;
    schema?: FieldConfig[];
    onSubmit: (data: any) => void;
    className?: string;
    children?: React.ReactNode;
    defaultValues?: Record<string, any>;
}
