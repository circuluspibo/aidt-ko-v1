/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import learningData from "../data/learningData.converted.json";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { toast } from "sonner";
import { Toast } from "@/components/Toast";
import { METHODS } from "@/utils/globals";
import { useParams, useNavigate, useLocation } from "react-router";

const useLearningSession = () => {
  const { character, target, method } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paramRepeat = searchParams.get("repeat") || "3,3";
  const [repeatSettings] = useState({
    correct: Number(paramRepeat.split(",")[0]),
    incorrect: Number(paramRepeat.split(",")[1]),
  });
  const savedSession = JSON.parse(localStorage.getItem("learningSession"));
  const shouldRestore =
    savedSession &&
    savedSession.target === target &&
    savedSession.method === method;

  // 현재 학습 중인 항목 인덱스
  const [currentItemIndex, setCurrentItemIndex] = useState(
    shouldRestore ? savedSession.currentItemIndex : 0
  );
  // 현재 항목의 학습 문항
  const [currentQuestionNo, setCurrentQuestion] = useState(
    shouldRestore ? savedSession.currentQuestionNo : 1
  );
  // 현재 항목의 학습 횟수
  const [currentLearningCount, setCurrentLearning] = useState(
    shouldRestore ? savedSession.currentLearningCount : 1
  );
  const [timer, setTimer] = useState(0);
  const [tutorMessage, setTutorMessage] = useState("학습을 시작해 주세요.");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [learningStats, setLearningStats] = useState(
    () =>
      JSON.parse(localStorage.getItem("learningStats")) || {
        totalQuestions: 0,
        totalCorrects: 0,
        totalIncorrects: 0,
        totalFocusLack: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalTime: 0,
        attempts: [],
        sessionStart: Date.now(),
      }
  );
  const [focusLog, setFocusLog] = useState([]);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const focusLogRef = useRef([]);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const item = learningData[target][currentItemIndex];
  const NEXT_STEP = {
    consonant: {
      title: `축하합니다!`,
      description: [
        `자음 ${METHODS[method]} 학습을 완료했습니다!`,
        "모음 학습을 시작합니다.",
      ],
      next: `/${character}/vowel/${method}`,
    },
    vowel: {
      title: `축하합니다!`,
      description: [
        `모음 ${METHODS[method]} 학습을 완료했습니다!`,
        "글자 학습을 시작합니다.",
      ],
      next: `/${character}/syllable/${method}`,
    },
    syllable: {
      title: `축하합니다!`,
      description: [
        `글자 ${METHODS[method]} 학습을 완료했습니다!`,
        "단어 학습을 시작합니다.",
      ],
      next: `/${character}/word/${method}`,
    },
    word: {
      title: `축하합니다!`,
      description: [`단어 ${METHODS[method]} 학습을 완료했습니다!`],
      next: `/${character}`,
    },
  };

  const playFeedbackSound = (isCorrect) => {
    const sound = document.getElementById(
      isCorrect ? "correct-audio" : "wrong-audio"
    );
    sound.currentTime = 0;
    sound.play();
  };

  const handleNextStep = () => {
    setLoading(true);

    const { title, description, next } = NEXT_STEP[target];
    const sound = document.getElementById("complete-audio");
    sound.currentTime = 0;
    sound.play();
    toast.custom(
      () => <Toast title={title} description={description} type="info" />,
      {
        position: "top-center",
        duration: 5000,
        onAutoClose: () => {
          clearInterval(timerRef.current);
          timerRef.current = setInterval(
            () => setTimer((prev) => prev + 1),
            1000
          );
          setCurrentItemIndex(0);
          setCurrentQuestion(1);
          setCurrentLearning(1);
          setTimer(0);
          setTutorMessage("학습을 시작해 주세요.");
          setProgress(0);
          navigate(next);
          setLearningStats({
            totalQuestions: 0,
            totalCorrects: 0,
            totalIncorrects: 0,
            totalFocusLack: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalTime: 0,
            attempts: [],
            sessionStart: Date.now(),
          });
          setFocusLog([]);
          setLoading(false);
          localStorage.removeItem("learningSession"); // 저장된 진행 정보 초기화
        },
      }
    );
  };

  const nextQuestion = () => {
    // 다음 문제로 넘어가는 프로세스
    setCurrentLearning(1);
    setCurrentQuestion(1);
    // 해당 학습 내용이 완료되지 않았으면 다음 문항으로
    if (currentItemIndex < learningData[target].length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
    } else {
      // 해당 학습 내용이 완료되면 다음 학습 내용으로 자음 => 모음 => 글자 => 단어
      handleNextStep();
      return;
    }
  };

  const handleAnswer = (data, refreshOptions) => {
    setLoading(true);
    const updatedStats = {
      ...learningStats,
      totalQuestions: learningStats.totalQuestions + 1,
      totalTime: learningStats.totalTime + data?.responseTime,
      attempts: [
        ...learningStats.attempts,
        {
          ...data,
          target,
          method,
          currentItemIndex,
          currentQuestionNo,
          currentLearningCount,
        },
      ],
    };
    playFeedbackSound(data?.isCorrect);
    if (data?.isCorrect) {
      updatedStats.totalCorrects += 1;
      updatedStats.currentStreak += 1;
      updatedStats.bestStreak = Math.max(
        updatedStats.bestStreak,
        updatedStats.currentStreak
      );
      toast.custom(
        () => (
          <Toast title="정답입니다!" description="잘했어요." type="success" />
        ),
        {
          position: "top-center",
          duration: 1500,
          onAutoClose: () => {
            setLoading(false);
            // 반복 횟수가 정답수보다 적을때 다음 반복으로 넘어감
            // 최대 반복횟수는 repeatSettings.incorrect 로 잡고 최대 3번 틀리면 그냥 다음 문제로 넘어감
            //
            if (currentQuestionNo < repeatSettings.correct) {
              setCurrentLearning((p) => p + 1);
              setCurrentQuestion((p) => p + 1);
            } else {
              nextQuestion();
            }
            refreshOptions?.();
          },
        }
      );
    } else {
      updatedStats.totalIncorrects += 1;
      updatedStats.currentStreak = 0;

      toast.custom(
        () => (
          <Toast
            title="틀렸어요."
            description="다시 시도해 보세요."
            type="error"
          />
        ),
        {
          position: "top-center",
          duration: 1500,
          onAutoClose: () => {
            setLoading(false);
            // currentLearningCount+1이 repeatSettigs.incorrect와 같고,
            // currentQuestionNo이 repeatSettigs.correct 보다 작으면 다음 문제로 넘어감
            if (currentLearningCount === repeatSettings.incorrect) {
              if (currentQuestionNo < repeatSettings.correct) {
                setCurrentLearning(1);
                setCurrentQuestion((p) => p + 1);
              } else {
                nextQuestion();
              }
            } else {
              setCurrentLearning((p) => p + 1);
            }
            refreshOptions?.();
          },
        }
      );
    }
    /* {
      totalQuestions:0,
      totalCorrects: 0,
      totalIncorrects: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalTime:0,
      attempts: [],
      sessionStart: Date.now(),
    } */
    setLearningStats(updatedStats);
    localStorage.setItem("learningStats", JSON.stringify(updatedStats));
  };

  const onResults = (results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const lm = results.multiFaceLandmarks[0];
      const leftEye = lm[33];
      const rightEye = lm[263];
      const leftIris = lm[468];
      const rightIris = lm[473];
      const irisCenterX = (leftIris.x + rightIris.x) / 2;
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const dx = irisCenterX - eyeCenterX;
      const focused = Math.abs(dx) < 0.015;
      setFocusLog((prev) =>
        (prev.length > 90 ? prev.slice(-89) : prev).concat(focused)
      );
    } else {
      setFocusLog((prev) =>
        (prev.length > 90 ? prev.slice(-89) : prev).concat(false)
      );
    }
  };

  useEffect(() => {
    localStorage.setItem("learningStats", JSON.stringify(learningStats));
  }, [learningStats]);

  useEffect(() => {
    const sessionData = {
      currentItemIndex,
      currentQuestionNo,
      currentLearningCount,
      target,
      method,
      character,
      sessionStart: learningStats.sessionStart,
    };
    localStorage.setItem("learningSession", JSON.stringify(sessionData));
  }, [
    currentItemIndex,
    currentQuestionNo,
    currentLearningCount,
    target,
    method,
  ]);

  useEffect(() => {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    setProgress(
      Math.round(
        ((currentItemIndex + 1) / learningData[target].length) * 100
      ).toFixed(0)
    );
    return () => clearInterval(timerRef.current);
  }, [currentItemIndex, target]);

  useEffect(() => {
    focusLogRef.current = focusLog;
  }, [focusLog]);

  useEffect(() => {
    let initInterval;
    let focusInterval;
    function tryInit() {
      if (videoRef.current) {
        // 이미 생성된 인스턴스가 있으면 stop/해제
        if (cameraRef.current) {
          cameraRef.current.stop();
          cameraRef.current = null;
        }
        if (faceMeshRef.current) {
          faceMeshRef.current = null;
        }

        try {
          const faceMesh = new FaceMesh({
            locateFile: (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          });
          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          faceMesh.onResults(onResults);
          faceMeshRef.current = faceMesh;

          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              await faceMesh.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
          });
          camera.start();
          cameraRef.current = camera;
          clearInterval(initInterval);
        } catch (error) {
          console.error(error);
        }
      }
    }
    function focusCheck() {
      if (focusLogRef.current.length >= 30) {
        const recent = focusLogRef.current.slice(-30);
        const focusRate = recent.filter((x) => x).length / 30;
        console.log(`집중도: ${(focusRate * 100).toFixed(1)}%`);
        if (focusRate < 0.5) {
          // setTutorMessage("집중도가 낮아요! 화면을 잘 보고 집중해 주세요 👀");
          toast.custom(
            () => (
              <Toast
                title="집중도가 낮아요!"
                description="화면을 잘 보고 집중해 주세요 👀"
                type="warning"
              />
            ),
            {
              position: "bottom-center",
              duration: 2500,
              onAutoClose: () => {
                setLearningStats((prev) => ({
                  ...prev,
                  totalFocusLack: prev.totalFocusLack + 1,
                }));
              },
            }
          );
        }
      }
    }
    initInterval = setInterval(tryInit, 100);
    focusInterval = setInterval(focusCheck, 3000);
    return () => {
      clearInterval(focusInterval);
      clearInterval(initInterval);
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current = null;
      }
    };
  }, []);

  return {
    character,
    currentItemIndex,
    currentRepeat: currentQuestionNo,
    repeatSettings,
    target,
    method,
    timer,
    tutorMessage,
    progress,
    loading,
    item,
    videoRef,
    onAnswer: handleAnswer,
    setTutorMessage,
  };
};

export default useLearningSession;
