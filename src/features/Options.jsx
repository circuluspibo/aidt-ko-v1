import React, { useEffect, useState } from "react";
import colors from "tailwindcss/colors";

const Options = ({
  correctAnswer,
  options,
  onSelect,
  color,
  enabled,
  currentItemIndex,
}) => {
  const [selected, setSelected] = useState(null);
  const handleClick = (choice) => {
    setSelected(choice);
    onSelect(choice);
  };

  useEffect(() => {
    setSelected(null);
  }, [options]);

  return (
    <div className="grid col-span-3 grid-rows-3 gap-4 h-full">
      {options.length > 0 &&
        options.map((choice, idx) => (
          <button
            key={`${choice}-${currentItemIndex}-${idx}`}
            onClick={() => handleClick(choice)}
            style={{
              "--hover-bg": colors[color]["200"],
              "--hover-border": colors[color]["500"],
            }}
            className={`flex justify-center items-center p-2 w-full text-6xl font-extrabold leading-none text-center rounded-lg border shadow-sm cursor-pointer min-w-64 ${
              selected === choice
                ? choice === correctAnswer
                  ? `bg-${color}-500 text-white`
                  : "border-4 border-red-400 bg-red-50"
                : `bg-${color}-50 border-neutral-300 hover:border-2 hover:bg-[--hover-bg] hover:border-[--hover-border] disabled:saturate-0`
            }`}
            disabled={enabled === undefined ? selected !== null : !enabled}
          >
            {choice}
          </button>
        ))}
    </div>
  );
};

export default Options;
