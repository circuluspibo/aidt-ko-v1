import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import Letters from "./Letters";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { JOSA, TARGETS } from "@/utils/globals";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, AudioLines, Square } from "lucide-react";

let startTime = null;
const LearnBySpeak = ({
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
}) => {
  const [[type, message], setAlert] = useState(["", ""]);
  const [isPlaying, setIsPlaying] = useState(false);
  const startedRef = useRef(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // 음성 인식 결과 처리
  useEffect(() => {
    setAlert(["", ""]);
    if (listening && !transcript) {
      setAlert([
        "destructive",
        `마이크를 통해 ${TARGETS[target]}${JOSA().c(
          TARGETS[target],
          "을/를"
        )} 소리내어 말해주세요.`,
      ]);
      return;
    }
    if (listening && transcript) {
      setAlert([
        "primary",
        `인식된 ${TARGETS[target]}${JOSA().c(
          TARGETS[target],
          "이/가"
        )}있습니다. "제출하기" 버튼을 눌러주세요.`,
      ]);
      return;
    }
  }, [listening, transcript]);

  const stopMicButton = () => {
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
    startedRef.current = false;
    resetTranscript();
    setAlert(["", ""]);
  };

  const handleMicButton = async () => {
    try {
      setAlert(["", ""]);
      if (!browserSupportsSpeechRecognition) {
        setAlert(["destructive", "브라우저가 음성 인식을 지원하지 않습니다."]);
        return;
      }

      startedRef.current = true;
      await SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: "ko-KR",
      });
    } catch (error) {
      console.error(error);
      startedRef.current = false;
    }
  };

  const checkPronunciation = () => {
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

    stopMicButton;
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
    startedRef.current = false;
  }, [currentItemIndex, target]);

  useEffect(() => {
    setAlert(["", ""]);
    window.SpeechRecognition &&
      window.SpeechRecognition.stop &&
      window.SpeechRecognition.stop(); // 일부 브라우저에서 필수
    SpeechRecognition.stopListening();
    startedRef.current = false;
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
        {!listening && (
          <Button
            onClick={handleMicButton}
            size="lg"
            className={`flex flex-col gap-10 justify-center pt-12 pb-6 text-2xl font-bold bg-blue-500 animate-focus hover:bg-blue-600 h-fit max-w-48`}
          >
            <p className="text-9xl">🎙️</p>
            <p className="max-w-fit text-wrap">말하기</p>
          </Button>
        )}
        {listening && (
          <div className="flex flex-col gap-6 justify-center items-center text-2xl text-blue-500">
            <p className="text-2xl font-extrabold text-center max-w-fit text-wrap animate-focus">
              듣는 중...
            </p>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="flex justify-center text-2xl font-bold h-fit"
                variant="destructive"
                onClick={stopMicButton}
              >
                <Square /> 정지
              </Button>
              <Button
                size="lg"
                className="flex justify-center text-2xl font-bold h-fit"
                onClick={checkPronunciation}
                disabled={!transcript}
              >
                <AudioLines />
                제출하기
              </Button>
            </div>
          </div>
        )}
        {message && (
          <Alert variant={type} className="items-center">
            <AlertDescription className="flex gap-2 items-center">
              <AlertCircle />
              {message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default LearnBySpeak;
