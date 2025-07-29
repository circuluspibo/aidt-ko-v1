/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TARGETS } from "@/utils/globals";
import Options from "@/features/Options";
import { Button } from "./ui/button";

const LearnByListen = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
}) => {
  const [options, setOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  let startTime = null;

  const generateChoices = () => {
    const correct = item.letter;
    const pool = data.map((i) => i.letter);
    const choices = [correct];
    while (choices.length < 3) {
      const random = pool[Math.floor(Math.random() * pool.length)];
      if (!choices.includes(random)) choices.push(random);
    }
    const newOne = choices.sort(() => Math.random() - 0.5);
    setOptions(newOne);
  };

  const handleSelect = (choice) => {
    document.dispatchEvent(new Event("stop-sound"));
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

  const playSound = () => {
    setIsPlaying(true);
    window.speechSynthesis.cancel();

    let repeatCount = 0;
    let cancelled = false;

    const stopHandler = () => {
      cancelled = true;
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      document.removeEventListener("stop-sound", stopHandler);
    };
    document.addEventListener("stop-sound", stopHandler);

    const speakName = () => {
      if (cancelled) return;
      try {
        const utterance = new SpeechSynthesisUtterance(item.name);
        utterance.lang = "ko-KR";
        utterance.rate = 0.6;
        utterance.pitch = 1.2;
        utterance.onend = () => {
          repeatCount += 1;
          if (repeatCount < 3 && !cancelled) {
            setTimeout(() => {
              speakName();
            }, 500);
          } else {
            setIsPlaying(false);
            document.removeEventListener("stop-sound", stopHandler);
          }
        };
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error(error);
      }
    };
    speakName();
  };

  useEffect(() => {
    if (target !== "word") {
      setIndex(currentRepeat - 1);
    }
  }, [currentRepeat]);

  useEffect(() => {
    startTime = new Date().valueOf();
    document.dispatchEvent(new Event("stop-sound"));
    generateChoices();
  }, [currentItemIndex, target]);

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      {/* 힌트 영역 */}
      <div className="col-span-4 grid grid-rows-[1fr_auto_auto] grid-cols-2 gap-4">
        <div className="flex items-center justify-center col-span-2 p-4 font-extrabold bg-white border rounded-lg shadow-sm text-9xl">
          {item.image[index]}
        </div>
        {target !== "word" && (
          <div className="col-span-2 p-4 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
            {item?.example[index]}
          </div>
        )}
        {/* {(target === "word") && (
          <div className="col-span-2 p-4 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
            {item?.meaning[index]}
          </div>
        )} */}
      </div>
      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-cols-[1fr_auto] gap-4">
        {/* 문제 영역 */}
        <div className="col-span-1 grid grid-rows-[auto_1fr] gap-4">
          <div className="w-full p-2 text-2xl font-bold text-center bg-teal-300 border rounded-lg shadow-sm">
            {`"소리 듣기"를 선택하여 들리는 소리와 같은 "${TARGETS[target]}"을 선택하세요.`}
          </div>
          <div className="flex flex-col items-center justify-center w-full gap-10 p-2 text-center bg-white border rounded-lg shadow-sm">
            <Button
              onClick={playSound}
              disabled={isPlaying}
              size="lg"
              className={`flex flex-col gap-10 justify-center pt-12 pb-6 text-2xl font-bold hover:bg-teal-600 ${
                isPlaying
                  ? "text-teal-500 bg-teal-100 hover:bg-teal-200"
                  : "bg-teal-500 animate-focus hover:bg-teal-600"
              } h-fit`}
            >
              <p className="text-9xl">🔊</p>
              {isPlaying ? "소리 듣는 중..." : "소리 듣기"}
            </Button>
          </div>
        </div>
        {/* 보기 영역 */}
        <Options
          correctAnswer={item.letter}
          options={options}
          onSelect={handleSelect}
          color="teal"
        />
      </div>
    </div>
  );
};

export default LearnByListen;
