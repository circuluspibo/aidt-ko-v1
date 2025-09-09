/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Options from "@/features/Options";
import Letters from "./Letters";
import { JOSA } from "@/utils/globals";

const LearnByRead = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) => {
  const [options, setOptions] = useState([]);

  const generateChoices = () => {
    if (item) {
      const correct = item.letter;
      const pool = data.map((i) => i.letter);
      const choices = [correct];
      while (choices.length < 3) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        if (!choices.includes(random)) choices.push(random);
      }
      const newOne = choices.sort(() => Math.random() - 0.5);
      setOptions(newOne);
    }
  };

  const handleSelect = (choice) => {
    onAnswer(choice, item.letter);
  };

  useEffect(() => {
    generateChoices();
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-9 grid grid-rows-[auto_1fr] gap-4">
        <div className="row-span-1 p-2 w-full text-2xl font-bold text-center rounded-lg border shadow border-neutral-300 bg-amber-300/80">
          {`"${item.letter}"${JOSA().c(item.name, "을/를")} 찾아보세요.`}
        </div>
        <div className="grid grid-cols-9 row-span-2 gap-4 w-full h-full">
          {/* 힌트 영역 */}
          <div className="flex col-span-4 gap-4 justify-center items-center w-full h-full bg-white rounded-lg border shadow">
            {target !== "letter" && (
              <div className="flex col-span-2 justify-center items-center p-4 text-9xl font-extrabold">
                {target === "word" ? (
                  <img
                    src={`/images/words/${encodeURI(item.name).replaceAll(
                      "%",
                      ""
                    )}.png`}
                    alt={item.letter}
                    className="p-2 aspect-square"
                  />
                ) : (
                  <img
                    src={`/images/hangul/${item.letter.charCodeAt(0)}.png`}
                    alt={item.letter}
                  />
                )}
              </div>
            )}
            {target === "letter" && (
              <div className="flex justify-center items-center pr-4 w-full text-6xl font-extrabold">
                <img
                  src={`/images/hangul/${item.components[0].charCodeAt(0)}.png`}
                  alt={item.components[0]}
                  className="object-contain flex-1 w-1/3 h-auto scale-75"
                />
                <span>+</span>
                <img
                  src={`/images/hangul/${item.components[1].charCodeAt(0)}.png`}
                  alt={item.components[1]}
                  className="object-contain flex-1 w-1/3 h-auto"
                />
                <span>=</span>
              </div>
            )}
          </div>
          {/* 문제-보기 영역 */}
          <div className="flex col-span-5 gap-2 justify-center items-center w-full h-full bg-white rounded-lg border shadow">
            {target !== "word" && (
              <Letters
                n={1}
                letter={item.letter}
                className="col-span-1 p-2 font-extrabold"
                noBorder
              />
            )}
            {target === "word" && (
              <>
                {item.components.map((c, i) => (
                  <Letters
                    n={item.components.length}
                    letter={c}
                    key={`${c}-${i}`}
                    className="col-span-1 p-2 font-extrabold"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      {/* 보기 영역 */}
      <Options
        key={`${currentItemIndex}-${currentLearningCount}-${currentRepeat}-${target}`}
        enabled
        correctAnswer={item.letter}
        options={options}
        onSelect={handleSelect}
        color="amber"
        currentItemIndex={currentItemIndex}
      />
    </div>
  );
};

export default LearnByRead;
