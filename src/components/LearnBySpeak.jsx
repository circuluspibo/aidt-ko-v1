import React, { useState } from "react";
import learningData from "../data/learningData.json";
import { toast } from "sonner";
import useLearningSession from "@/hook/useLearningSession";

const LearnBySpeak = ({ target }) => {
  const {
    onAnswer,
    progress,
    timer,
    currentItemIndex,
    currentRepeat,
    repeatSettings,
  } = useLearningSession(target);
  const [tutorMessage, setTutorMessage] = useState(
    "마이크 버튼을 눌러 발음을 연습해 보세요."
  );
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const item = learningData[target][currentItemIndex];

  const playTargetSound = () => {
    const utterance = new SpeechSynthesisUtterance(
      item.sound.replace(/\[|\]/g, "")
    );
    utterance.lang = "ko-KR";
    utterance.rate = 0.7;
    utterance.pitch = 1.2;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setTutorMessage("발음을 잘 듣고 따라 말해 보세요!");
  };

  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast.error("브라우저가 음성 인식을 지원하지 않습니다.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTutorMessage("듣는 중입니다. 발음해 보세요.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
      checkPronunciation(transcript);
    };

    recognition.onerror = () =>
      toast.error("음성 인식 오류가 발생했습니다. 다시 시도해 주세요.");

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const checkPronunciation = (transcript) => {
    const correct =
      target === "syllable"
        ? item.result
        : target === "word"
        ? item.word
        : item.letter;
    const isCorrect = transcript.includes(correct);
    onAnswer(isCorrect);
  };

  return (
    <div className="p-6 mx-auto max-w-xl text-center">
      <h2 className="mb-1 text-2xl font-bold">한글 단계 학습: {target}</h2>
      <p className="mb-2 text-sm text-gray-600">
        진행: {progress}% | 문제: {currentItemIndex + 1} /{" "}
        {learningData[target].length} | 반복: {currentRepeat} /{" "}
        {repeatSettings.correct}
      </p>
      <p className="mb-2 text-sm text-gray-600">경과 시간: {timer}초</p>
      <p className="mb-4 font-semibold text-blue-600">{tutorMessage}</p>
      <div className="mb-2 text-5xl">{item.letter}</div>
      <div className="mb-4 text-lg">
        {item.name} [{item.sound}]
      </div>
      <div className="mb-4 text-4xl">{item.image[currentRepeat - 1]}</div>
      <p className="mb-4 text-sm text-gray-700">
        {item.example[currentRepeat - 1] || item.meaning}
      </p>
      <button
        onClick={startListening}
        disabled={isListening}
        className={`px-4 py-2 rounded ${
          isListening ? "bg-gray-400" : "text-white bg-red-500"
        } mb-2`}
      >
        🎤 {isListening ? "듣는 중..." : "발음 시작"}
      </button>
      <button
        onClick={playTargetSound}
        className="px-4 py-2 ml-2 text-white bg-green-500 rounded"
      >
        🔊 발음 듣기
      </button>
      {recognizedText && (
        <p className="mt-4 text-sm text-gray-800">
          인식된 발음: "{recognizedText}"
        </p>
      )}
    </div>
  );
};

export default LearnBySpeak;
