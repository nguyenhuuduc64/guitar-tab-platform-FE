import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";

type DropdownItem = {
    name: string;
    icon: IconDefinition;
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
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg z-[9999]">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                item.onClick();
                                setOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
