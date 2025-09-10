import React, { useEffect, useRef, useState } from "react";
import colors from "tailwindcss/colors";

const Options = ({
  key,
  correctAnswer,
  options,
  onSelect,
  color,
  enabled,
  currentItemIndex,
}) => {
  const WRONG_STATE = "border-4 border-red-400 bg-red-50";
  const CORRECT_STATE = `bg-${color}-500 text-white`;
  const [selected, setSelected] = useState(null);
  const submitted = useRef(false);
  const handleClick = (choice) => {
    submitted.current = true;
    setSelected(choice);
    onSelect(choice);
  };

  useEffect(() => {
    submitted.current = false;
    setSelected(null);
  }, [options, currentItemIndex]);

  return (
    <div className="grid col-span-3 grid-rows-3 gap-4 h-full">
      {options.length > 0 &&
        options.map((choice, idx) => (
          <button
            key={`${key}-${idx}`}
            onClick={() => handleClick(choice)}
            style={{
              "--hover-bg": colors[color]["200"],
              "--hover-border": colors[color]["500"],
            }}
            className={`bg-${color}-50 border-neutral-300 flex justify-center items-center p-2 w-full text-6xl font-extrabold leading-none text-center rounded-lg border shadow-sm cursor-pointer min-w-64 ${
              selected === choice
                ? choice === correctAnswer
                  ? CORRECT_STATE
                  : WRONG_STATE
                : "disabled:saturate-0"
            }`}
            disabled={
              submitted.current || enabled === undefined
                ? selected !== null
                : !enabled
            }
          >
            {choice}
          </button>
        ))}
    </div>
  );
};

export default Options;
