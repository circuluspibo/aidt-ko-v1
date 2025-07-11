import React, { useState, useEffect } from "react";
import learningData from "../data/learningData.json";
import ChoicesGrid from "@/features/ChoicesGrid";
import useLearningSession from "@/hook/useLearningSession";

const LearnByListen = ({ target }) => {
  const {
    onAnswer,
    progress,
    timer,
    currentItemIndex,
    currentRepeat,
    repeatSettings,
  } = useLearningSession(target);
  const [options, setOptions] = useState([]);
  const [tutorMessage, setTutorMessage] = useState(
    "소리를 듣고 맞는 글자를 선택해 보세요."
  );
  const item = learningData[target][currentItemIndex];

  useEffect(() => {
    generateChoices();
  }, [currentItemIndex, target]);

  const playSound = () => {
    const utterance = new SpeechSynthesisUtterance(
      item.sound.replace(/\[|\]/g, "")
    );
    utterance.lang = "ko-KR";
    utterance.rate = 0.6;
    utterance.pitch = 1.2;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setTutorMessage("소리를 잘 듣고 맞는 글자를 찾아보세요!");
  };

  const generateChoices = () => {
    let correct;
    let pool;
    if (target === "consonant" || target === "vowel") {
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

  return (
    <div className="p-6 mx-auto max-w-xl text-center">
      <h2 className="mb-1 text-2xl font-bold">듣기 단계 학습: {target}</h2>
      <p className="mb-2 text-sm text-gray-600">
        진행: {progress}% | 문제: {currentItemIndex + 1} /{" "}
        {learningData[target].length} | 반복: {currentRepeat} /{" "}
        {repeatSettings.correct}
      </p>
      <p className="text-sm text-gray-600">경과 시간: {timer}초</p>
      <p className="mb-3 font-semibold text-blue-600">{tutorMessage}</p>
      {/* 힌트 영역 */}
      <div className="mb-4 hint-section">
        <div className="hint-content">
          <div className="text-4xl hint-image">{item.image}</div>
          <div className="text-left hint-text">
            <div className="hint-title">힌트: {item.name}</div>
            <div className="text-sm text-gray-700 hint-description">
              {item.example || item.meaning}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={playSound}
        className="px-4 py-2 mb-4 text-white bg-green-500 rounded"
      >
        🔊 소리 듣기
      </button>
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
  );
};

export default LearnByListen;
