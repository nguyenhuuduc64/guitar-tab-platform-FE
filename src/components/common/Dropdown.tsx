import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";

type DropdownItem = {
    name: string;
    icon?: IconDefinition;
    onClick: () => void;
};

type DropdownProps = {
    items: DropdownItem[];
    trigger: React.ReactNode;
};

const Dropdown: React.FC<DropdownProps> = ({ items, trigger }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>

            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 shadow-lg rounded-md z-[9999] text-gray-800 dark:text-slate-200">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                item.onClick();
                                setOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                            {item.icon && <FontAwesomeIcon icon={item.icon} className="text-gray-400 dark:text-slate-500 w-4" />}
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
