import { useEffect, useState } from "react";

const Letters = ({ letter, n, className, noBorder }) => {
  const [textSize, setTextSize] = useState("text-len1");
  useEffect(() => {
    switch (n) {
      case 3:
        setTextSize("text-9xl");
        break;
      case 4:
        setTextSize("text-8xl");
        break;
      default:
        setTextSize("text-len1");
        break;
    }
  }, [n]);
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
