"use client";
import React, { useState } from "react";

interface TreeNodeProps {
  label: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <li className="pt-10 ml-2 pl-2 pr-2">
        <div className="flex items-center justify-between border-b-1 border-[#adbdd8]">
          <span className="pl-2">{label}</span>
          <button className="text-lg w-4 h-4 ml-4 flex items-center justify-center rounded-sm">
            +
          </button>
        </div>
      </li>

      {/* Children – eingerückt mit Linien */}
      {/* {children && (
        <ul className="relative pt-3 ml-4 space-y-1 before:absolute before:top-0 before:-bottom-15 before:left-0 before:w-px before:bg-[#8d9fbb]">
          {React.Children.map(children, (child) => (
            <li className="relative pl-3">
              <div className="absolute top-3 left-0 w-2 h-px bg-[#c1cfdf]"></div>
              <div className="inline-flex items-center bg-[#c1cfdf] rounded-lg px-2 py-1">
                <span className="mr-3">{child}</span>
                <button
                  onClick={() => onRemove(child)}
                  className="text-white hover:text-red-200 font-bold focus:outline-none"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )} */}
    </>
  );
};
