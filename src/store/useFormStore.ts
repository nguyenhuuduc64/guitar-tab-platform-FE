import { create } from "zustand";

type FormStore = {
    openFormName: string | null;
    openForm: (name: string) => void;
    closeForm: () => void;
};

export const useFormStore = create<FormStore>((set) => ({
    openFormName: null,
    openForm: (name) => set({ openFormName: name }),
    closeForm: () => set({ openFormName: null }),
}));
