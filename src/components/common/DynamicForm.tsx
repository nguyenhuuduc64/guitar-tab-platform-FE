import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useFormStore } from "../../store/useFormStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { SchemaFormField } from "./SchemaFormField";

export const DynamicForm = ({
    name,
    schema,
    onSubmit,
    className,
    children,
    defaultValues,
}: any) => {
    const { openFormName, closeForm } = useFormStore();

    const methods = useForm({ defaultValues });

    useEffect(() => {
        if (openFormName === name) {
            if (defaultValues) {
                methods.reset(defaultValues);
            }
        }
    }, [openFormName, name, defaultValues]);

    if (openFormName !== name) return null;

    const handleClose = () => {
        closeForm();
        methods.reset();
    };

    return (
        <FormProvider {...methods}>
            <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm">
                <form
                    onSubmit={methods.handleSubmit((data) => {
                        onSubmit(data);
                        closeForm();
                        methods.reset();
                    })}
                    className={`max-h-[90vh] overflow-y-auto bg-white shadow-lg rounded-xl p-6 fixed w-[90%] md:w-1/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                        className || ""
                    }`}
                >
                    {/* CLOSE */}
                    <div className="flex justify-end mb-2">
                        <FontAwesomeIcon
                            icon={faClose}
                            className="cursor-pointer text-lg"
                            onClick={handleClose}
                        />
                    </div>

                    {/* FIELDS */}
                    <div className="space-y-4">
                        {schema?.map((field: any) => (
                            <SchemaFormField key={field.name} field={field} />
                        ))}
                    </div>

                    {/* SUBMIT */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Submit
                        </button>
                    </div>

                    {children}
                </form>
            </div>
        </FormProvider>
    );
};
