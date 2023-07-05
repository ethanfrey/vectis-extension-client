import clsx from "clsx";
import React, { PropsWithChildren, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

interface DropdownProps {
  options: {
    name: string;
    click: () => void;
    style?: string;
    disabled?: boolean;
  }[];
}

const SimpleDropdown: React.FC<PropsWithChildren<DropdownProps>> = ({ options, children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef(null);

  useClickAway(dropdownRef, () => setOpen(false));

  const OptionsItems = options.map((el) => {
    const click = () => {
      el.click();
      setOpen(false);
    };
    return (
      <li key={el.name}>
        <div
          className={clsx(
            `p-2 w-fit whitespace-nowrap bg-transparent text-slate-300 hover:cursor-pointer hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-amber-400 hover:via-pink-400 hover:to-indigo-500 ${
              el.disabled ? "text-gray-500" : ""
            }`,
            el.style
          )}
          onClick={el.disabled ? () => {} : click}
        >
          <div className="flex items-center gap-2">
            <p className={`capitalize`}>{el.name}</p>
          </div>
        </div>
      </li>
    );
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        className={clsx(
          `w-[120px] bg-transparent rounded-[4px] text-white hover:bg-white/5 flex items-center justify-between gap-2 p-2 transition duration-75 ease-in-out border border-slate-50`
        )}
        type="button"
        onClick={() => setOpen(!open)}
      >
        {children}
        <div className={clsx("flex items-center transition duration-75 ease-in-out right-[80px]", open ? "rotate-180" : "")}>
          <MdOutlineKeyboardArrowDown size={24} />
        </div>
      </button>
      <ul className={clsx(`absolute left-0 bg-slate-700 z-50 float text-left rounded-[4px] m-0 bg-clip-padding w-full`, !open && "hidden")}>
        {OptionsItems}
      </ul>
    </div>
  );
};

export default SimpleDropdown;
