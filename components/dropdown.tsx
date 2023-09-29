import { NextPage } from "next";
import { useState } from "react";

interface DropDownProps {
  dropdownArray: { name: string; id: number }[];
  onStatusSelect: (status: { name: string; id: number }) => void;
}

const DropDown: NextPage<DropDownProps> = ({ dropdownArray, onStatusSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusSelect = (status: { name: string; id: number }) => {
    onStatusSelect(status);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="p-2 bg-gray-300 w-28 rounded-xl text-black text-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        Status
      </button>
      {isOpen && (
        <div className="absolute top-10 right-0 w-28 bg-white shadow-md rounded-md overflow-hidden">
          {dropdownArray.map((s) => (
            <div
              key={s.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              onClick={() => handleStatusSelect(s)}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;
