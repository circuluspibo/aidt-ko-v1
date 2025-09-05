/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import Letters from "./Letters";
import { JOSA, TARGETS } from "@/utils/globals";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, AudioLines, Square } from "lucide-react";

const getSR = () => window.SpeechRecognition || window.webkitSpeechRecognition;

const LearnBySpeak = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) => {
  const [[type, message], setAlert] = useState(["", ""]);
  const [isPlaying, setIsPlaying] = useState(false);

  // ★ 낙관적 시작 로딩 + UI용 상태
  const [starting, setStarting] = useState(false); // 클릭→onstart 사이
  const [listening, setListening] = useState(false); // UI 표시용
  const [transcript, setTranscript] = useState("");

  const recogRef = useRef(null);
  const forceStopRef = useRef(false); // 사용자가 정지/제출 눌렀는지

  // 안내 메시지 (원래 로직 유지 + 네이티브로 대체)
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
  }, [listening, transcript, target]);

  // 네이티브 인식 시작
  const handleMicButton = async () => {
    setAlert(["", ""]);
    const SR = getSR();
    if (!SR) {
      setAlert([
        "destructive",
        "브라우저가 Web Speech API를 지원하지 않습니다.",
      ]);
      return;
    }
    if (!window.isSecureContext) {
      setAlert(["destructive", "HTTPS 환경에서만 동작합니다."]);
      return;
    }

    try {
      setStarting(true); // ★ 클릭 즉시 로딩 UI
      window.speechSynthesis?.cancel?.();

      // 기존 세션 정리
      stopRecognition({ uiOnly: true }); // UI 유지한 채 내부만 정리

      const rec = new SR();
      recogRef.current = rec;

      rec.lang = "ko-KR";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = true; // ★ 제출/정지 전까지 계속 듣기

      forceStopRef.current = false;

      rec.onstart = () => {
        setStarting(false);
        setListening(true);
      };

      rec.onresult = (e) => {
        let text = transcript;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const seg = e.results[i][0]?.transcript || "";
          // interim 포함 누적 (필요시 확정만 사용하려면 e.results[i].isFinal로 분기)
          text = seg.trim();
        }
        setTranscript(text);
      };

      rec.onerror = (e) => {
        // 사용자가 의도적으로 끄는 중이면 무시
        if (forceStopRef.current) return;
        setAlert(["destructive", e?.error || "음성 인식 오류가 발생했습니다."]);
      };

      rec.onend = () => {
        // Chrome이 자동으로 end를 호출할 수 있음 → 연속 청취 유지 위해 재시작
        if (!forceStopRef.current) {
          try {
            rec.start();
          } catch (e) {
            // 재시작 실패 시에도 UI는 유지하고 안내만
            setAlert([
              "destructive",
              "마이크 연결이 일시적으로 끊어졌습니다. 다시 시도 중...",
            ]);
            // 짧은 재시도
            setTimeout(() => {
              rec.start();
            }, 300);
          }
        }
      };

      rec.start();
    } catch (error) {
      console.error(error);
      setStarting(false);
      setListening(false);
    }
  };

  // 네이티브 인식 정지
  const stopRecognition = ({ uiOnly = false } = {}) => {
    if (recogRef.current) {
      recogRef.current.onend = null;
      recogRef.current.onerror = null;
      recogRef.current.onresult = null;
      recogRef.current.stop && recogRef.current.stop();
      recogRef.current.abort && recogRef.current.abort();
    }
    recogRef.current = null;

    if (!uiOnly) {
      setListening(false);
      setStarting(false);
    }
  };

  const stopMicButton = () => {
    forceStopRef.current = true;
    stopRecognition({ uiOnly: false }); // UI도 종료
    setTranscript("");
    setAlert(["", ""]);
  };

  const checkPronunciation = () => {
    onAnswer(transcript, item.name);
    stopMicButton(); // ★ 실제 정지 호출(괄호 누락 수정)
  };

  // 발음 예시 TTS (원본 유지)
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
            setTimeout(speakName, 500);
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

  // 전환/반복/언마운트 시 정리 (원본 의도 유지)
  useEffect(() => {
    document.dispatchEvent(new Event("stop-sound"));
    forceStopRef.current = true;
    stopRecognition({ uiOnly: false });
    setTranscript("");
    setAlert(["", ""]);
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  useEffect(() => {
    return () => {
      forceStopRef.current = true;
      stopRecognition({ uiOnly: false });
      window.speechSynthesis?.cancel?.();
    };
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
                {/* ★ 원본 버그 수정: 템플릿 리터럴 올바르게 */}
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

      {/* 우측 컨트롤: starting/ listening 상태 표시 */}
      <div className="flex flex-col col-span-3 grid-rows-3 gap-10 justify-center items-center p-8 w-full h-full text-center bg-white rounded-lg border shadow-sm">
        {!listening && !starting && (
          <Button
            onClick={handleMicButton}
            size="lg"
            className="flex flex-col gap-10 justify-center pt-12 pb-6 text-2xl font-bold bg-blue-500 animate-focus hover:bg-blue-600 h-fit max-w-48"
          >
            <p className="text-9xl">🎙️</p>
            <p className="max-w-fit text-wrap">말하기</p>
          </Button>
        )}

        {!listening && starting && (
          <div className="flex flex-col gap-4 items-center text-blue-600">
            <div className="w-10 h-10 rounded-full border-4 border-blue-300 animate-spin border-t-transparent" />
            <p className="text-xl font-bold">마이크 여는 중…</p>
            <p className="text-sm text-neutral-500">
              브라우저 권한/장치 연결을 확인하는 중
            </p>
          </div>
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
