/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import LetterConsonant from "./LetterConsonant";
import LetterVowel from "./LetterVowel";
import { Button } from "./ui/button";
import Letters from "./Letters";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

let startTime = null;
const LearnBySpeak = ({
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [index, setIndex] = useState(0);
  const [manuallyStopped, setManuallyStopped] = useState(false);

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
    if (target !== "word") {
      setIndex(currentRepeat - 1);
    }
    setErrorMessage("");
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
    setManuallyStopped(true);
    playTargetSound();
  }, [currentRepeat]);

  useEffect(() => {
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
  }, []);

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
        {target !== "word" && (
          <div className="col-span-2 p-4 text-3xl font-semibold text-center bg-white border rounded-lg shadow-sm">
            {`이번에는 "${item?.example[index]}"을 생각하며 발음해 보세요.`}
          </div>
        )}
        {/* {(target === "word") && (
          <div className="col-span-2 p-4 text-3xl font-semibold text-left bg-white border rounded-lg shadow-sm">
            {`이번에는 "${item?.meaning[index]}"을 생각하며 발음해 보세요.`}
          </div>
        )} */}
      </div>
      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-cols-[1fr_auto] gap-4">
        {/* 문제 영역 */}
        <div className="col-span-1 grid grid-rows-[auto_1fr] gap-4">
          <div className="w-full p-2 text-2xl font-bold text-center bg-blue-300 border rounded-lg shadow-sm">
            {`"말하기"를 선택하고 "${item.name}"을 소리내어 말해보세요.`}
          </div>
          <div className="flex flex-col items-center justify-center w-full gap-4 p-2 text-6xl font-extrabold text-center bg-white border rounded-lg shadow-sm">
            <p className="text-9xl">{item.name}</p>
            {(target === "vowel" || target === "consonant") && (
              <p>{item.sound}</p>
            )}
            {target === "letter" && (
              <div className="flex items-center justify-center">
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
              <div className="flex items-center justify-center">
                {item.components.map((c, i) => (
                  <>
                    <Letters
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
        <div className="flex flex-col items-center justify-center w-full col-span-1 gap-10 p-8 text-center bg-white border rounded-lg shadow-sm">
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
    </div>
  );
};

export default LearnBySpeak;
