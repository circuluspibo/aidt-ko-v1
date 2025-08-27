/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import LetterConsonant from "./LetterConsonant";
import LetterVowel from "./LetterVowel";
import { Button } from "./ui/button";
import Letters from "./Letters";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { JOSA } from "../utils/globals";

let startTime = null;
const LearnBySpeak = ({
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [manuallyStopped, setManuallyStopped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // 음성 인식 결과 처리
  useEffect(() => {
    if (!listening && transcript && !manuallyStopped) {
      checkPronunciation(transcript);
    }
  }, [listening]);

  const handleMicButton = () => {
    if (!browserSupportsSpeechRecognition) {
      setErrorMessage("브라우저가 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (listening) {
      window.SpeechRecognition &&
        window.SpeechRecognition.stop &&
        window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
      SpeechRecognition.stopListening();
      setManuallyStopped(true);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: false,
        language: "ko-KR",
      });
      setManuallyStopped(false);
    }
  };

  const checkPronunciation = (transcript) => {
    const correct = item.name;
    const isCorrect = transcript.includes(correct);
    const endTime = new Date().valueOf();
    const responseTime = (endTime - startTime) / 1000;

    const attempt = {
      timestamp: new Date(),
      responseTime,
      isCorrect,
      correct,
      user: transcript,
    };
    onAnswer(attempt);

    if (!isCorrect) handleMicButton();
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
    startTime = new Date().valueOf();
    document.dispatchEvent(new Event("stop-sound"));
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
    setManuallyStopped(true);
  }, [currentItemIndex, target]);

  useEffect(() => {
    setErrorMessage("");
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
    setManuallyStopped(true);
  }, [currentRepeat]);

  useEffect(() => {
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-9 grid grid-rows-[auto_1fr] gap-4">
        <div className="row-span-1 p-2 w-full text-2xl font-bold text-center rounded-lg border shadow border-neutral-300 bg-blue-300/80">
          {`"말하기"를 선택하고 "${item.letter}"${JOSA().c(
            item.name,
            "을/를"
          )} 소리내어 말해보세요.`}
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
                  src={`/images/hangul/{item.components[0].charCodeAt(0)}.png`}
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
            <div className="flex gap-2">
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
            <Button
              onClick={playSound}
              disabled={isPlaying}
              size="lg"
              className={`flex flex-col gap-10 justify-center text-2xl font-bold hover:bg-blue-600/50 ${
                isPlaying
                  ? "text-blue-500 bg-blue-100 hover:bg-blue-200"
                  : "bg-blue-400 hover:bg-blue-200/"
              } h-fit`}
            >
              {isPlaying ? "🔊 소리 듣는 중..." : "🔊 소리 듣기"}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col col-span-3 grid-rows-3 gap-10 justify-center items-center p-8 w-full h-full text-center bg-white rounded-lg border shadow-sm">
        <Button
          onClick={handleMicButton}
          size="lg"
          className={`flex flex-col gap-10 justify-center pt-12 pb-6 text-2xl font-bold ${
            listening
              ? "text-blue-500 bg-blue-100 hover:bg-blue-200"
              : "bg-blue-500 animate-focus hover:bg-blue-600"
          } h-fit max-w-48`}
        >
          <p className="text-9xl">🎙️</p>
          <p className="max-w-fit text-wrap">
            {listening ? "듣는 중..." : "말하기"}
          </p>
        </Button>
        {errorMessage && (
          <span className="text-red-500 max-w-48 text-start text-bold text-wrap">
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default LearnBySpeak;
