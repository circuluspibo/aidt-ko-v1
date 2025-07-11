/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import learningData from "../data/learningData.json";
import ConsonantView from "@/features/ConsonantView";
import VowelView from "@/features/VowelView";
import SyllableView from "@/features/SyllableView";
import WordView from "@/features/WordView";
import ChoicesGrid from "@/features/ChoicesGrid";
import useLearningSession from "@/hook/useLearningSession";
import { TARGETS, COLORS } from "@/utils/globals";

const LearnByRead = ({ target }) => {
  const {
    onAnswer,
    progress,
    timer,
    currentItemIndex,
    currentRepeat,
    repeatSettings,
  } = useLearningSession(target);

  const [options, setOptions] = useState([]);
  const item = learningData[target][currentItemIndex];

  /*
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const [tutorMessage, setTutorMessage] = useState(
    "한글 학습에 오신 것을 환영합니다! 글자를 보고 선택해 주세요."
  );
  useEffect(() => {
    speak(tutorMessage);
  }, [tutorMessage]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    speechSynthesisRef.current.cancel();
    speechSynthesisRef.current.speak(utterance);
  };
   */

  useEffect(() => {
    generateChoices();
  }, [currentItemIndex, target]);

  const generateChoices = () => {
    let correct;
    let pool;
    if (target === target || target === "vowel") {
      correct = item.letter;
      pool = learningData[target].map((i) => i.letter);
    } else if (target === "syllable") {
      correct = item.result;
      pool = learningData[target].map((i) => i.result);
    } else if (target === "word") {
      correct = item.word;
      pool = learningData[target].map((i) => i.word);
    }
    const choices = [correct];
    while (choices.length < 3) {
      const random = pool[Math.floor(Math.random() * pool.length)];
      if (!choices.includes(random)) choices.push(random);
    }
    const newOne = choices.sort(() => Math.random() - 0.5);
    setOptions(newOne);
  };

  const handleSelect = (choice) => {
    const correct =
      target === "syllable"
        ? item.result
        : target === "word"
        ? item.word
        : item.letter;
    const isCorrect = choice === correct;
    onAnswer(isCorrect, generateChoices);
  };

  const renderLevelContent = () => {
    if (target === "consonant")
      return <ConsonantView item={item} index={currentRepeat - 1} />;
    if (target === "vowel")
      return <VowelView item={item} index={currentRepeat - 1} />;
    if (target === "syllable")
      return <SyllableView item={item} index={currentRepeat - 1} />;
    if (target === "word") return <WordView item={item} />;
    return <div>학습 단계 로드 오류</div>;
  };

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-4 py-6 w-full h-full">
        <header className="inline-flex col-span-full gap-3 text-2xl font-extrabold md:text-6xl text-start">
          <span className={`text-${COLORS[target]}-500`}>
            {TARGETS[target]}
          </span>
          <span className={`text-${COLORS.read}-500`}>보기</span>
          <span>학습</span>
        </header>
        <p className="col-span-full text-xl font-semibold md:text-4xl">
          재미있게 배울 방법을 선택해주세요.
        </p>
      </div>
      <div className="p-6 mx-auto max-w-xl text-center">
        <h2 className="mb-1 text-2xl font-bold">한글 단계 학습: {target}</h2>
        <p className="mb-2 text-sm text-gray-600">
          진행: {progress}% | 문제: {currentItemIndex + 1} /{" "}
          {learningData[target].length} | 반복: {currentRepeat} /{" "}
          {repeatSettings.correct}
        </p>
        <p className="mb-2 text-sm text-gray-600">경과 시간: {timer}초</p>
        {/* <p className="mb-4 font-semibold text-blue-600">{tutorMessage}</p> */}
        {renderLevelContent()}
        <ChoicesGrid
          correctAnswer={
            target === "syllable"
              ? item.result
              : target === "word"
              ? item.word
              : item.letter
          }
          options={options}
          onSelect={handleSelect}
        />
      </div>
    </>
  );
};

export default LearnByRead;
