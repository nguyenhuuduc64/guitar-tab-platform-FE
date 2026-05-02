import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import type { FieldConfig } from "../../types/SchemaFormProps";

export const SchemaFormField: React.FC<{
    field: FieldConfig;
    parentName?: string;
}> = ({ field, parentName }) => {
    const {
        register,
        formState: { errors },
        control,
    } = useFormContext();

    const fieldName = parentName ? `${parentName}.${field.name}` : field.name;

    // 👉 HANDLE NESTED OBJECT
    if (field.children && field.children.length > 0) {
        return (
            <div
                className={`space-y-4 border p-4 rounded-md bg-gray-50 ${field.className || ""}`}
            >
                {field.label && (
                    <h3 className="font-semibold text-gray-700">
                        {field.label}
                    </h3>
                )}

                {field.children.map((child) => (
                    <SchemaFormField
                        key={child.name}
                        field={child}
                        parentName={fieldName}
                    />
                ))}
            </div>
        );
    }

    // 👉 GET ERROR FROM NESTED
    const getError = (name: string, errors: any) => {
        return name.split(".").reduce((obj, key) => obj?.[key], errors);
    };

    const error = getError(fieldName, errors);
    const errorMessage = error?.message;

    const baseClass =
        "w-full p-2 border rounded-md focus:outline-none focus:ring-2 transition";

    const inputClass = `${baseClass} ${
        error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
    }`;

    return (
        <div className={`flex flex-col gap-1 ${field.className || ""}`}>
            {/* LABEL */}
            {field.label && (
                <label className="text-sm font-medium text-gray-700">
                    {field.label}
                </label>
            )}

            {/* FIELD TYPES */}
            {field.type === "textarea" ? (
                <textarea
                    {...register(fieldName, field.validation)}
                    placeholder={field.placeholder}
                    className={`${inputClass} min-h-[100px]`}
                />
            ) : field.type === "select" ? (
                <select
                    {...register(fieldName, field.validation)}
                    className={inputClass}
                >
                    <option value="">{field.placeholder || "Chọn"}</option>

                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type || "text"}
                    {...register(fieldName, field.validation)}
                    placeholder={field.placeholder}
                    className={inputClass}
                />
            )}

            {/* ERROR */}
            {errorMessage && (
                <span className="text-xs text-red-500">{errorMessage}</span>
            )}
        </div>
    );
};
