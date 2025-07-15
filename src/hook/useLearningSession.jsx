import { useState, useEffect, useRef } from "react";
import learningData from "../data/learningData.json";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { toast } from "sonner";
import { Toast } from "@/components/Toast";

const useLearningSession = (target) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [repeatSettings] = useState({
    correct: 3,
    incorrect: 5,
  });
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
  const correctSoundRef = useRef(new Audio("/sounds/correct.mp3"));
  const wrongSoundRef = useRef(new Audio("/sounds/wrong.mp3"));
  const item = learningData[target][currentItemIndex];

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
    const sound = isCorrect ? correctSoundRef.current : wrongSoundRef.current;
    sound.currentTime = 0;
    sound.play();
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
          position: "top-left",
          duration: 1500,
          onAutoClose: () => {
            setLoading(false);
            if (currentRepeat < repeatSettings.correct) {
              setCurrentRepeat((prev) => prev + 1);
            } else {
              setCurrentRepeat(1);
              setCurrentItemIndex((prev) => prev + 1);
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
          position: "top-left",
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

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    const focusCheck = setInterval(() => {
      if (focusLog.length >= 30) {
        const recent = focusLog.slice(-30);
        const focusRate = recent.filter((x) => x).length / 30;
        console.log(focusRate, `집중도: ${(focusRate * 100).toFixed(1)}%`);
        if (focusRate < 0.5) {
          setTutorMessage("집중도가 낮아요! 화면을 잘 보고 집중해 주세요 👀");
        }
      }
    }, 3000);

    return () => clearInterval(focusCheck);
  }, [focusLog]);

  return {
    currentItemIndex,
    currentRepeat,
    repeatSettings,
    timer,
    tutorMessage,
    progress,
    loading,
    item,
    onAnswer: handleAnswer,
    setTutorMessage,
  };
};

export default useLearningSession;
