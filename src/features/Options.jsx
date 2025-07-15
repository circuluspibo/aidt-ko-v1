import React, { useEffect, useState } from "react";

const Options = ({ correctAnswer, options, onSelect, color }) => {
  const [selected, setSelected] = useState(null);
  const handleClick = (choice) => {
    setSelected(choice);
    onSelect(choice);
  };

  useEffect(() => {
    setSelected(null);
  }, [options]);

  return (
    <div className="grid col-span-1 grid-rows-3 gap-4 h-full">
      {options.length > 0 &&
        options.map((choice, idx) => (
          <button
            key={`${choice}-${idx}`}
            onClick={() => handleClick(choice)}
            className={`flex justify-center items-center p-2 w-full text-6xl font-extrabold leading-none text-center rounded-lg border shadow-sm cursor-pointer min-w-64 ${
              selected === choice
                ? choice === correctAnswer
                  ? `bg-${color}-500 text-white`
                  : "border-4 border-red-400 bg-red-50"
                : `bg-${color}-50 border-${color}-500 hover:bg-${color}-200 hover:border-${color}-500`
            }`}
            disabled={selected !== null}
          >
            {choice}
          </button>
        ))}
    </div>
  );
};

export default Options;
