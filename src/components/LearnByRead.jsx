/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Options from "@/features/Options";
import LetterConsonant from "./LetterConsonant";
import LetterVowel from "./LetterVowel";
import LetterSyllable from "./LetterSyllable";

const LearnByRead = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
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
    const isCorrect = choice === item.letter;
    onAnswer(isCorrect, generateChoices);
  };

  useEffect(() => {
    generateChoices();
  }, [currentItemIndex, target]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* 힌트 영역 */}
      <div className="col-span-4 grid grid-rows-[1fr_auto_auto] grid-cols-2 gap-4">
        <div className="flex col-span-2 justify-center items-center p-4 text-9xl font-extrabold bg-white rounded-lg border shadow-sm">
          {item.image[currentRepeat - 1]}
        </div>
        {(target === "vowel" || target === "consonant") && (
          <>
            <div className="col-span-1 p-4 text-6xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
              {item.name}
            </div>
            <div className="col-span-1 p-4 text-6xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
              {item.sound}
            </div>
          </>
        )}
        {target === "syllable" && (
          <div className="flex col-span-2 justify-center items-center py-2 bg-white rounded-lg border shadow-sm">
            <LetterConsonant
              letter={item.components[0]}
              className="col-span-1 p-4 text-9xl"
            />
            <span className="text-8xl">+</span>
            <LetterVowel
              letter={item.components[1]}
              className="col-span-1 p-4 text-9xl"
            />
            <span className="text-8xl">=</span>
          </div>
        )}
        {(target === "vowel" || target === "consonant") && (
          <div className="col-span-2 p-4 text-6xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
            {item?.example[currentRepeat - 1]}
          </div>
        )}
        {(target === "syllable" || target === "word") && (
          <div className="col-span-2 p-4 text-6xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
            {item?.meaning[currentRepeat - 1]}
          </div>
        )}
      </div>
      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-cols-[1fr_auto] gap-4">
        {/* 문제 영역 */}
        <div className="col-span-1 grid grid-rows-[auto_1fr] gap-4">
          <div className="p-2 w-full text-2xl font-bold text-center bg-amber-300 rounded-lg border shadow-sm">
            {`"${item.letter}"을 찾아보세요.`}
          </div>
          {target !== "word" && (
            <div className="flex justify-center items-center p-2 w-full text-9xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
              {item.letter}
            </div>
          )}
          {target === "word" && (
            <div className="flex overflow-auto gap-1 justify-center items-center p-4 w-full text-9xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
              {item.components.map((c, i) => (
                <LetterSyllable
                  letter={c}
                  key={`${c}-${i}`}
                  className="col-span-1 p-2 text-8xl font-extrabold"
                />
              ))}
            </div>
          )}
        </div>
        {/* 보기 영역 */}
        <Options
          correctAnswer={item.letter}
          options={options}
          onSelect={handleSelect}
          color="amber"
        />
      </div>
    </div>
  );
};

export default LearnByRead;
