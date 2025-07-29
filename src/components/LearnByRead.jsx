/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Options from "@/features/Options";
import LetterConsonant from "./LetterConsonant";
import LetterVowel from "./LetterVowel";
import Letters from "./Letters";

const LearnByRead = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
}) => {
  const [options, setOptions] = useState([]);
  const [index, setIndex] = useState(0);
  let startTime = null;

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
    const endTime = new Date().valueOf();
    const responseTime = (endTime - startTime) / 1000;
    const isCorrect = choice === item.letter;
    const attempt = {
      timestamp: new Date(),
      responseTime,
      isCorrect,
      correct: item.letter,
      user: choice,
    };
    onAnswer(attempt, generateChoices);
  };

  useEffect(() => {
    if (target !== "word") {
      setIndex(currentRepeat - 1);
    }
  }, [currentRepeat]);

  useEffect(() => {
    startTime = new Date().valueOf();
    generateChoices();
  }, [currentItemIndex, target]);

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      {/* 힌트 영역 */}
      <div className="col-span-4 grid grid-rows-[1fr_auto_auto] grid-cols-2 gap-4">
        <div className="flex items-center justify-center col-span-2 p-4 font-extrabold bg-white border rounded-lg shadow-sm text-9xl">
          {item.image[index]}
        </div>
        {(target === "vowel" || target === "consonant") && (
          <>
            <div className="col-span-1 p-4 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
              {item.name}
            </div>
            <div className="col-span-1 p-4 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
              {item.letter}
            </div>
          </>
        )}
        {target === "letter" && (
          <div className="flex items-center justify-center col-span-2 py-2 bg-white border rounded-lg shadow-sm">
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
        {target !== "word" && (
          <div className="col-span-2 p-4 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
            {item?.example[index]}
          </div>
        )}
        {/* {(target === "letter" || target === "word") && (
          <div className="col-span-2 p-4 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
            {item?.meaning[index]}
          </div>
        )} */}
      </div>
      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-cols-[1fr_auto] gap-4">
        {/* 문제 영역 */}
        <div className="col-span-1 grid grid-rows-[auto_1fr] gap-4">
          <div className="w-full p-2 text-2xl font-bold text-center border rounded-lg shadow-sm bg-amber-300">
            {`"${item.letter}"을 찾아보세요.`}
          </div>
          {target !== "word" && (
            <div className="flex items-center justify-center w-full p-2 font-extrabold text-center bg-white border rounded-lg shadow-sm text-9xl">
              {item.letter}
            </div>
          )}
          {target === "word" && (
            <div className="flex items-center justify-center w-full gap-1 p-4 overflow-auto font-extrabold text-center bg-white border rounded-lg shadow-sm text-9xl">
              {item.components.map((c, i) => (
                <Letters
                  letter={c}
                  key={`${c}-${i}`}
                  className="col-span-1 p-2 font-extrabold text-8xl"
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
