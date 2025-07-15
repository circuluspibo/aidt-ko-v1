import { useState, useEffect, useRef } from "react";
import learningData from "../data/learningData.converted.json";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { toast } from "sonner";
import { Toast } from "@/components/Toast";
import { TARGETS, METHODS } from "@/utils/globals";
import { useParams, useNavigate } from "react-router";

const useLearningSession = () => {
  const { character, target, method } = useParams();
  const navigate = useNavigate();
  const [repeatSettings] = useState({
    correct: 1,
    incorrect: 1,
  });
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [timer, setTimer] = useState(0);
  const [tutorMessage, setTutorMessage] = useState("학습을 시작해 주세요.");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [learningStats, setLearningStats] = useState(
    () =>
      JSON.parse(localStorage.getItem("learningStats")) || {
        totalQuestions: 0,
        correctAnswers: 0,
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
          setCurrentRepeat(1);
          setTimer(0);
          setTutorMessage("학습을 시작해 주세요.");
          setProgress(0);
          navigate(next);
          setLearningStats({
            totalQuestions: 0,
            correctAnswers: 0,
            sessionStart: Date.now(),
          });
          setFocusLog([]);
          setLoading(false);
        },
      }
    );
  };

  const handleAnswer = (isCorrect, refreshOptions) => {
    setLoading(true);
    const updatedStats = {
      ...learningStats,
      totalQuestions: learningStats.totalQuestions + 1,
      correctAnswers: learningStats.correctAnswers + (isCorrect ? 1 : 0),
    };
    setLearningStats(updatedStats);
    localStorage.setItem("learningStats", JSON.stringify(updatedStats));
    playFeedbackSound(isCorrect);
    if (isCorrect) {
      toast.custom(
        () => (
          <Toast title="정답입니다!" description="잘했어요." type="success" />
        ),
        {
          position: "top-center",
          duration: 1500,
          onAutoClose: () => {
            setLoading(false);
            if (currentRepeat < repeatSettings.correct) {
              setCurrentRepeat((prev) => prev + 1);
            } else {
              setCurrentRepeat(1);
              if (currentItemIndex < learningData[target].length - 1) {
                setCurrentItemIndex((prev) => prev + 1);
              } else {
                handleNextStep();
                return;
              }
            }
            refreshOptions?.();
          },
        }
      );
    } else {
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

            if (currentRepeat < repeatSettings.incorrect) {
              setCurrentRepeat((prev) => prev + 1);
            } else {
              setCurrentRepeat(1);
            }
            refreshOptions();
          },
        }
      );
    }
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
    focusLogRef.current = focusLog;
  }, [focusLog]);

  useEffect(() => {
    let interval;
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

        clearInterval(interval);
      }
    }
    interval = setInterval(tryInit, 100);

    return () => {
      clearInterval(interval);
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const focusCheck = setInterval(() => {
      if (focusLogRef.current.length >= 30) {
        const recent = focusLogRef.current.slice(-30);
        const focusRate = recent.filter((x) => x).length / 30;
        console.log(`집중도: ${(focusRate * 100).toFixed(1)}%`);
        if (focusRate < 0.5) {
          setTutorMessage("집중도가 낮아요! 화면을 잘 보고 집중해 주세요 👀");
        }
      }
    }, 3000);

    return () => clearInterval(focusCheck);
  }, []);

  return {
    character,
    currentItemIndex,
    currentRepeat,
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
