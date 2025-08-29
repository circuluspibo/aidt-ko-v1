// ✅ 학습 세션 관리 (진행률, 타이머, 문제 이동 등)
// ✅ 학습 통계 관리
// ✅ 커리큘럼 관리
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Toast } from "@/components/Toast";
import { METHODS, TARGETS } from "@/utils/globals";
import { useParams, useNavigate } from "react-router";
import { useSessionStore } from "./useSessionStore";
import useContentQuery from "./useContentQuery";
import useCurriculumQuery from "./useCurriculumQuery";

const useLearningSession = () => {
  // URL 파라미터 관리
  const { character, chapter, method } = useParams();
  const navigate = useNavigate();

  // 콘텐츠 리스트 상태
  const [openContentList, setOpenContentList] = useState(false);

  // 데이터 쿼리
  const {
    data,
    isLoading: isDataLoading,
    isError,
  } = useContentQuery(character, chapter, method);
  const learningDataForTarget = data?.contents;

  // Curriculum API 호출
  const { curriculumData } = useCurriculumQuery(character);

  const { loadProgress, saveProgress, loadStats, saveStats } =
    useSessionStore();

  const [repeatSettings, setRepeatSettings] = useState({
    correct: data?.repeat || 1,
    incorrect: Math.round(data?.repeat * 1.5) || 2,
  });
  const [curriculumIndex, setCurriculumIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentQuestionNo, setCurrentQuestion] = useState(1);
  const [currentLearningCount, setCurrentLearningCount] = useState(1);
  const [timer, setTimer] = useState(0);

  // data나 method가 변경될 때마다 saved를 업데이트하고 상태 초기화
  useEffect(() => {
    if (chapter && method && data) {
      // data가 존재할 때만 실행
      // chapter를 chapterId로 사용 (저장된 데이터 구조와 일치)
      const savedProgress = loadProgress(chapter, method);

      // saved 데이터가 있으면 상태 업데이트, 없으면 기본값 사용
      setCurrentItemIndex(savedProgress?.index ?? 0);
      setCurrentQuestion(savedProgress?.question ?? 1);
      setCurrentLearningCount(savedProgress?.learningCount ?? 1);
    }
  }, [chapter, method, loadProgress, data]);

  const [tutorMessage, setTutorMessage] = useState("학습을 시작해 주세요.");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [learningStats, setLearningStats] = useState(loadStats());
  const [curriculum, setCurriculum] = useState(null);

  const timerRef = useRef(null);
  const item = learningDataForTarget?.[currentItemIndex];

  // Curriculum 데이터를 기반으로 동적으로 NEXT_STEP 생성
  const getNextStep = () => {
    if (!curriculumData || !data?.target) return null;

    const currentChapter = curriculumData.find(
      (item) => item.chapterId === chapter
    );
    if (!currentChapter) return null;

    const currentIndex = curriculumData.findIndex(
      (item) => item.chapterId === chapter
    );
    const nextChapter = curriculumData[currentIndex + 1];

    if (!nextChapter) {
      // 마지막 챕터인 경우
      return {
        title: `축하합니다!`,
        description: [
          `${TARGETS[data?.target || "unknown"]} ${
            METHODS[method]
          } 학습을 완료했습니다!`,
        ],
        next: `/learn/${character}`,
      };
    }

    // 다음 챕터로 이동
    const nextTarget = nextChapter.target;
    return {
      title: `축하합니다!`,
      description: [
        `${TARGETS[data?.target || "unknown"]} ${
          METHODS[method]
        } 학습을 완료했습니다!`,
        `${TARGETS[nextTarget]} 학습을 시작합니다.`,
      ],
      next: `/learn/${character}/${nextChapter.chapterId}?target=${nextTarget}`,
    };
  };

  // Method 페이지에서 사용할 methodData 반환 함수
  const getMethodData = (targetChapter) => {
    if (!curriculumData) return null;

    const chapterData = curriculumData.find(
      (item) => item.chapterId === targetChapter
    );
    return chapterData?.methods || null;
  };

  // 콘텐츠 리스트 핸들러
  const handleContentListToggle = () => {
    setOpenContentList(!openContentList);
  };

  const handleContentListClose = () => {
    setOpenContentList(false);
  };

  const handleContentSelect = (index) => {
    setCurrentItemIndex(index);
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
    const nextStep = getNextStep();

    if (!nextStep) {
      // nextSteps 없는 경우 기본 동작
      setLoading(false);
      return;
    }

    const { title, description, next } = nextStep;
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
          setCurrentItemIndex(0);
          // setCurrentQuestion(1);
          // setCurrentLearningCount(1);
          setTimer(0);
          setTutorMessage("학습을 시작해 주세요.");
          setProgress(0);
          navigate(next);
          const resetStats = {
            totalQuestions: 0,
            totalCorrects: 0,
            totalIncorrects: 0,
            totalFocusLack: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalTime: 0,
            attempts: [],
            sessionStart: Date.now(),
          };
          setLearningStats(resetStats);
          saveStats(resetStats);
          setLoading(false);
        },
      }
    );
  };

  const nextQuestion = () => {
    // setCurrentLearningCount(1);
    // setCurrentQuestion(1);
    if (currentItemIndex < learningDataForTarget?.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
    } else {
      handleNextStep();
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
          target: data?.target,
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
            if (currentQuestionNo < repeatSettings.correct) {
              setCurrentLearningCount((p) => p + 1);
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
            console.log(repeatSettings.incorrect);
            if (currentLearningCount === repeatSettings.incorrect) {
              if (currentQuestionNo < repeatSettings.correct) {
                setCurrentLearningCount(1);
                setCurrentQuestion((p) => p + 1);
              } else {
                nextQuestion();
              }
            } else {
              setCurrentLearningCount((p) => p + 1);
            }
            refreshOptions?.();
          },
        }
      );
    }
    setLearningStats(updatedStats);
    saveStats(updatedStats);
    saveProgress(
      chapter, // chapter를 chapterId로 사용
      method,
      currentItemIndex,
      item.letter,
      currentQuestionNo,
      currentLearningCount,
      curriculumData[curriculumIndex]?.target?.name // 'consonant', 'vowel', 'letter', 'word' 중 하나
    );
  };

  useEffect(() => {
    if (data) {
      // data가 존재할 때만 실행
      setRepeatSettings({
        correct: data?.repeat || 1,
        incorrect: Math.round((data?.repeat || 1) * 1.5) || 2,
      });
      setCurriculumIndex(data?.index || 0);
    }
  }, [data]);

  useEffect(() => {
    setTimer(0);
    setCurrentLearningCount(1);
    setCurrentQuestion(1);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);

    // data가 존재할 때만 progress 계산
    if (data?.contents && learningDataForTarget) {
      setProgress(
        Math.round(
          ((currentItemIndex + 1) / learningDataForTarget?.length) * 100
        ).toFixed(0)
      );
    }

    return () => clearInterval(timerRef.current);
  }, [currentItemIndex, data?.target, learningDataForTarget, data?.contents]);

  return {
    // URL 파라미터
    character,
    chapter,
    method,
    target: data?.target,

    // 콘텐츠 리스트 관련
    openContentList,
    handleContentListToggle,
    handleContentListClose,
    handleContentSelect,

    // 데이터 관련
    data,
    isDataLoading,
    isError,
    learningDataForTarget,

    // 커리큘럼 관련
    curriculumIndex,
    curriculum,
    setCurriculum,
    curriculumData,
    getMethodData,

    // 학습 세션 관련
    currentItemIndex,
    currentRepeat: currentQuestionNo,
    repeatSettings,
    timer,
    tutorMessage,
    progress,
    loading,
    item,
    onAnswer: handleAnswer,
    setTutorMessage,
    setCurrentItemIndex,
  };
};

export default useLearningSession;
