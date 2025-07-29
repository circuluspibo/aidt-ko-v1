import { Link, useParams } from "react-router-dom";
import LearnByRead from "@/components/LearnByRead";
import LearnBySpeak from "@/components/LearnBySpeak";
import LearnByWrite from "@/components/LearnByWrite";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TARGETS, METHODS, COLORS } from "@/utils/globals";
import useLearningSession from "@/hook/useLearningSession";
import Stepper from "@/components/ui/stepper";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import colors from "tailwindcss/colors";
import { BlurFade } from "@/components/magicui/blur-fade";
import LearnByListen from "@/components/LearnByListen";
import { useQuery } from "@tanstack/react-query";
import { fetchLearningDataByTarget } from "@/api/learning";

const Learn = () => {
  // URL 파라미터는 여기서 한 번만 가져옵니다.
  const { character, target, method } = useParams();

  // useQuery를 사용하여 target에 맞는 학습 데이터를 가져옵니다.
  const {
    data: learningDataForTarget,
    isLoading: isDataLoading,
    isError,
  } = useQuery({
    queryKey: ["learningData", target],
    queryFn: () => fetchLearningDataByTarget(target),
    enabled: !!target, // target이 있을 때만 쿼리를 실행합니다.
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh 상태로 유지 (API 호출 최소화)
  });
  const {
    loading,
    onAnswer,
    repeatSettings,
    currentRepeat,
    currentItemIndex,
    videoRef,
  } = useLearningSession(learningDataForTarget);
  // 현재 학습 아이템
  const item = learningDataForTarget?.[currentItemIndex];

  if (isDataLoading)
    return (
      <div className="flex items-center justify-center h-full">로딩 중...</div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-full">
        데이터를 불러오는 중 에러가 발생했습니다.
      </div>
    );

  return (
    <div className="grid grid-rows-[auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList className="font-bold text-[2.5rem]">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">홈</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className={`font-extrabold text-${target}`}
              >
                <Link to={`/${character}`}>{TARGETS[target]}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className={`font-extrabold text-${COLORS[method]}-500`}
              >
                <Link to={`/${character}/${target}`}>{METHODS[method]}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {item && (
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="font-extrabold text-black">
                  <p>{`"${item.letter}" 학습`}</p>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">반복</span>
            <Stepper
              currentStep={currentRepeat}
              totalSteps={repeatSettings.correct}
              activeColor={`bg-${COLORS[method]}-500`}
              style={{ minWidth: `${repeatSettings.correct * 2.5}rem` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">진행</span>
            <AnimatedCircularProgressBar
              className="w-12 h-12"
              max={learningDataForTarget?.length || 0}
              min={1}
              value={currentItemIndex + 1}
              gaugePrimaryColor={
                COLORS[method] ? colors[COLORS[method]][500] : "#f59e42"
              }
              gaugeSecondaryColor={colors.gray["200"]}
            />
          </div>
        </div>
      </div>
      {method === "read" && (
        <LearnByRead
          {...{
            item,
            target,
            onAnswer,
            currentRepeat,
            currentItemIndex,
            data: learningDataForTarget,
          }}
        />
      )}
      {method === "listen" && (
        <LearnByListen
          {...{
            item,
            target,
            onAnswer,
            currentRepeat,
            currentItemIndex,
            data: learningDataForTarget,
          }}
        />
      )}
      {method === "speak" && (
        <LearnBySpeak
          {...{
            item,
            target,
            onAnswer,
            currentRepeat,
            currentItemIndex,
            data: learningDataForTarget,
          }}
        />
      )}
      {method === "write" && (
        <LearnByWrite
          {...{
            item,
            target,
            onAnswer,
            currentRepeat,
            currentItemIndex,
            data: learningDataForTarget,
          }}
        />
      )}
      {loading && (
        <BlurFade
          delay={0.15}
          inView
          className="fixed inset-0 z-50 w-full h-full"
        >
          <div className="w-full h-full rounded-3xl backdrop-blur-sm bg-white/95" />
        </BlurFade>
      )}
      <audio id="correct-audio" src="/sounds/correct.mp3" preload="auto" />
      <audio id="wrong-audio" src="/sounds/wrong.mp3" preload="auto" />
      <audio id="complete-audio" src="/sounds/completed.mp3" preload="auto" />
      <video
        ref={videoRef}
        muted
        playsInline
        className="hidden w-full h-full"
      />
    </div>
  );
};

export default Learn;
