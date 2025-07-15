import React, { useEffect, useRef, useState } from "react";
import LetterConsonant from "./LetterConsonant";
import LetterVowel from "./LetterVowel";
import { Button } from "./ui/button";
import LetterSyllable from "./LetterSyllable";

const LearnBySpeak = ({
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
}) => {
  const [tutorMessage, setTutorMessage] = useState("말하기");
  const [errorMessage, setErrorMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const recognitionRef = useRef(null); // recognition 인스턴스 저장

  // 목표 발음 재생 - 문제가 전환되면 자동 실행?
  const playTargetSound = () => {
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(item.name);
      utterance.lang = "ko-KR";
      utterance.rate = 0.6;
      utterance.pitch = 1.2;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }, 500);
  };

  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.log("브라우저가 음성 인식을 지원하지 않습니다.");
      setErrorMessage(`브라우저가 음성 인식을 지원하지 않습니다.`);
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
      setTutorMessage("듣는 중...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(transcript);
      setRecognizedText(transcript);
      checkPronunciation(transcript);
    };

    recognition.onerror = (e) => {
      let msg = "";
      if (e.error === "no-speech") {
        msg = `음성이 감지되지 않았습니다.\n마이크에 대고 또박또박 말해 주세요.`;
      } else if (e.error === "aborted") {
        msg = `음성 인식이 중단되었습니다.\n다시 시도해 주세요.`;
      } else if (e.error === "audio-capture") {
        msg = `마이크를 찾을 수 없습니다.\n마이크 연결을 확인해 주세요.`;
      } else if (e.error === "network") {
        msg = `네트워크 오류가 발생했습니다.\n인터넷 연결을 확인해 주세요.`;
      } else if (
        e.error === "not-allowed" ||
        e.error === "service-not-allowed"
      ) {
        msg = `마이크 사용이 허용되지 않았습니다.\n브라우저 설정을 확인해 주세요.`;
      } else if (e.error === "bad-grammar") {
        msg = `음성 인식 문법 오류가 발생했습니다.\n다시 시도해 주세요.`;
      } else if (e.error === "language-not-supported") {
        msg = `지원하지 않는 언어입니다.\n한국어로 설정해 주세요.`;
      } else {
        msg = `음성 인식 오류가 발생했습니다.\n다시 시도해 주세요.`;
      }
      setErrorMessage(msg);
      console.log(msg);
    };
    recognitionRef.current = recognition; // ref에 저장
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setErrorMessage("");
    setRecognizedText("");
    setTutorMessage("말하기");
  };

  const handleMicButton = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const checkPronunciation = (transcript) => {
    const correct = item.name;
    const isCorrect = transcript.includes(correct);
    console.log(isCorrect, recognizedText);
    onAnswer(isCorrect);
  };

  useEffect(() => {
    setIsListening(false);
    setErrorMessage("");
    setRecognizedText("");
    setTutorMessage("말하기");
    playTargetSound();
    document.dispatchEvent(new Event("stop-sound"));
  }, [currentItemIndex, target]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* 힌트 영역 */}
      <div className="col-span-4 grid grid-rows-[1fr_auto_auto] grid-cols-2 gap-4">
        <div className="flex col-span-2 justify-center items-center p-4 text-9xl font-extrabold bg-white rounded-lg border shadow-sm">
          {item.image[currentRepeat - 1]}
        </div>
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
        {(target === "vowel" || target === "consonant") && (
          <div className="col-span-2 p-4 text-3xl font-semibold text-center bg-white rounded-lg border shadow-sm">
            {`이번에는 "${
              item?.example[currentRepeat - 1]
            }"을 생각하며 발음해 보세요.`}
          </div>
        )}
        {(target === "syllable" || target === "word") && (
          <div className="col-span-2 p-4 text-3xl font-semibold text-left bg-white rounded-lg border shadow-sm">
            {`이번에는 "${
              item?.meaning[currentRepeat - 1]
            }"을 생각하며 발음해 보세요.`}
          </div>
        )}
      </div>
      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-cols-[1fr_auto] gap-4">
        {/* 문제 영역 */}
        <div className="col-span-1 grid grid-rows-[auto_1fr] gap-4">
          <div className="p-2 w-full text-2xl font-bold text-center bg-blue-300 rounded-lg border shadow-sm">
            {`"말하기"를 선택하고 "${item.name}"을 소리내어 말해보세요.`}
          </div>
          <div className="flex flex-col gap-4 justify-center items-center p-2 w-full text-6xl font-extrabold text-center bg-white rounded-lg border shadow-sm">
            <p className="text-9xl">{item.name}</p>
            {(target === "vowel" || target === "consonant") && (
              <p>{item.sound}</p>
            )}
            {target === "syllable" && (
              <div className="flex justify-center items-center">
                <LetterConsonant
                  letter={item.components[0]}
                  className="p-2 text-6xl"
                />
                <span>+</span>
                <LetterVowel
                  letter={item.components[1]}
                  className="p-2 text-6xl"
                />
              </div>
            )}
            {target === "word" && (
              <div className="flex justify-center items-center">
                {item.components.map((c, i) => (
                  <>
                    <LetterSyllable
                      letter={c}
                      key={`${c}-${i}`}
                      className="p-2 text-6xl font-extrabold"
                    />
                    {i < item.components.length - 1 && (
                      <span className="text-5xl">+</span>
                    )}
                  </>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 보기 영역 */}
        <div className="flex flex-col col-span-1 gap-10 justify-center items-center p-8 w-full text-center bg-white rounded-lg border shadow-sm">
          <Button
            onClick={handleMicButton}
            size="lg"
            className={`flex flex-col gap-10 justify-center pt-12 pb-6 text-2xl font-bold ${
              isListening
                ? "text-blue-500 bg-blue-100"
                : "bg-blue-500 animate-focus"
            } h-fit max-w-48`}
          >
            <p className="text-9xl">🎙️</p>
            <p className="max-w-fit text-wrap">{tutorMessage}</p>
          </Button>
          {errorMessage && (
            <span className="text-red-500 max-w-48 text-start text-bold text-wrap">
              {errorMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnBySpeak;
