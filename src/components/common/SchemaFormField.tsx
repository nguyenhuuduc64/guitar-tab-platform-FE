import React from "react";
import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "../../types/SchemaFormProps";

export const SchemaFormField: React.FC<{
    field: FieldConfig;
    parentName?: string;
}> = ({ field, parentName }) => {
    const {
        register,
        formState: { errors },
        watch,
    } = useFormContext();

    const fieldName = parentName ? `${parentName}.${field.name}` : field.name;

    if (field.children?.length > 0) {
        return (
            <div
                className={`space-y-4 border p-4 rounded-md bg-gray-50 ${
                    field.className || ""
                }`}
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

    const getError = (name: string, errors: any) => {
        return name
            .split(".")
            .reduce((obj: any, key: string) => obj?.[key], errors);
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

    // 👉 FILE INPUT FIX
    if (field.type === "file") {
        const watchedValue = watch(fieldName);

        const previewUrl =
            watchedValue instanceof FileList && watchedValue.length > 0
                ? URL.createObjectURL(watchedValue[0])
                : typeof watchedValue === "string"
                  ? watchedValue
                  : "";

        return (
            <div className={`flex flex-col gap-1 ${field.className || ""}`}>
                {field.label && (
                    <label className="text-sm font-medium text-gray-700">
                        {field.label}
                    </label>
                )}

                <input
                    type="file"
                    accept="image/*"
                    {...register(fieldName)}
                    className={inputClass}
                />

                {/* PREVIEW */}
                {previewUrl && (
                    <img
                        src={previewUrl}
                        className="w-24 h-24 rounded object-cover mt-2 border"
                        alt="preview"
                    />
                )}

                {errorMessage && (
                    <span className="text-xs text-red-500">{errorMessage}</span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-1 ${field.className || ""}`}>
            {/* LABEL */}
            {field.label && (
                <label className="text-sm font-medium text-gray-700">
                    {field.label}
                </label>
            )}

            {/* TEXTAREA */}
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
