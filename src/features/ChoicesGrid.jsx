import React, { useEffect, useState } from "react";

const ChoicesGrid = ({ correctAnswer, options, onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleClick = (choice) => {
    setSelected(choice);
    onSelect(choice);
  };

  useEffect(() => {
    setSelected(null);
  }, [options]);

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {options.map((choice, idx) => (
        <button
          key={`${choice}-${idx}`}
          onClick={() => handleClick(choice)}
          className={`border p-4 rounded text-3xl font-bold transition bg-white hover:bg-blue-100 ${
            selected === choice
              ? choice === correctAnswer
                ? "bg-green-200 border-green-400"
                : "bg-red-200 border-red-400"
              : ""
          }`}
          disabled={selected !== null}
        >
          {choice}
        </button>
      ))}
    </div>
  );
};

export default ChoicesGrid;
