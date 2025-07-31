import { useEffect, useState } from "react";

const Letters = ({ letter, className, noBorder }) => {
  const [textSize, setTextSize] = useState("text-len1");
  useEffect(() => {
    switch (letter.length) {
      case 2:
        setTextSize("text-9xl");
        break;
      case 3:
        setTextSize("text-8xl");
        break;
      case 4:
        setTextSize("text-7xl");
        break;
      default:
        setTextSize("text-len1");
        break;
    }
  }, [letter]);
  return (
    <div
      className={`font-extrabold text-center rounded-lg ${
        !noBorder && "border-2 border-letter"
      } ${className} ${textSize}`}
    >
      {letter}
    </div>
  );
};

export default Letters;
