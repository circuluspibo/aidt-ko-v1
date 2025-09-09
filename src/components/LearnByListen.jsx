/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { JOSA, TARGETS } from "@/utils/globals";
import Options from "@/features/Options";
import { Button } from "./ui/button";

const LearnByListen = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) => {
  const [options, setOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setPlayed] = useState(false);

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
    onAnswer(choice, item.letter);
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
      setPlayed(true);
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
            setPlayed(true);
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
    setPlayed(false);
    document.dispatchEvent(new Event("stop-sound"));
    generateChoices();
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-9 grid grid-rows-[auto_1fr] gap-4">
        <div className="row-span-1 p-2 w-full text-2xl font-bold text-center rounded-lg border shadow border-neutral-300 bg-teal-300/80">
          {`"소리 듣기"를 선택하여 들리는 소리와 같은 "${
            TARGETS[target]
          }"${JOSA().c(TARGETS[target], "을/를")} 선택하세요.`}
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
                {/* <LetterConsonant
                  letter={item.components[0]}
                  className="py-2 text-9xl"
                /> */}
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
                {/* <LetterVowel
                  letter={item.components[1]}
                  className="py-2 text-9xl"
                /> */}
                <span>=</span>
              </div>
            )}
          </div>
          {/* 문제-보기 영역 */}
          <div className="flex flex-col col-span-5 gap-2 justify-center items-center w-full h-full bg-white rounded-lg border shadow">
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
      </div>
      {/* 보기 영역 */}
      <Options
        key={`${currentItemIndex}-${currentLearningCount}-${currentRepeat}-${target}`}
        enabled={isPlayed}
        correctAnswer={item.letter}
        options={options}
        onSelect={handleSelect}
        color="teal"
        currentItemIndex={currentItemIndex}
      />
    </div>
  );
};

export default LearnByListen;
