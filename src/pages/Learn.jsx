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
import { useState } from "react";
import TopContentList from "@/features/TopContentList";
import useContentQuery from "@/hook/useContentQuery";
import { Loading } from "@/components/Loading";

const Learn = () => {
  // URL 파라미터는 여기서 한 번만 가져옵니다.
  const { character, chapter, method } = useParams();
  const [openContentList, setOpen] = useState(false);
  // useQuery를 사용하여 target에 맞는 학습 데이터를 가져옵니다.
  const {
    data,
    isLoading: isDataLoading,
    isError,
  } = useContentQuery(character, chapter);

  const {
    loading,
    onAnswer,
    repeatSettings,
    currentRepeat,
    currentItemIndex,
    setCurrentItemIndex,
    videoRef,
  } = useLearningSession(data?.contents);
  // 현재 학습 아이템
  const item = data?.contents?.[currentItemIndex];

  const handleContent = () => {
    setOpen(!openContentList);
  };

  if (isError)
    return (
      <div className="flex items-center justify-center h-full">
        데이터를 불러오는 중 에러가 발생했습니다.
      </div>
    );

  return (
    <>
      {isDataLoading && <Loading />}
      {!isDataLoading && !isError && (
        <div className="grid grid-rows-[auto_1fr] md:gap-4 px-6 py-4 w-full h-full relative rounded-t-3xl overflow-hidden">
          <TopContentList
            open={openContentList}
            color={COLORS[method]}
            currentIndex={currentItemIndex}
            data={data?.contents}
            onSelect={(i) => setCurrentItemIndex(i)}
            onClose={() => setOpen(false)}
          />
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
                    className={`font-extrabold text-${data?.target}`}
                  >
                    <Link to={`/${character}`}>{TARGETS[data?.target]}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className={`font-extrabold text-${COLORS[method]}-500`}
                  >
                    <Link to={`/${character}/${data?.target}`}>
                      {METHODS[method]}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {item && (
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      asChild
                      className="font-extrabold text-black"
                    >
                      <div>
                        <button
                          className="px-1 py-0 font-extrabold bg-transparent btn"
                          onClick={handleContent}
                        >
                          "{item.letter}"
                        </button>
                        학습
                      </div>
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
                  max={data?.contents?.length || 0}
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
          {item && (
            <>
              {method === "read" && (
                <LearnByRead
                  {...{
                    item,
                    target: data?.target,
                    onAnswer,
                    currentRepeat,
                    currentItemIndex,
                    data: data?.contents,
                  }}
                />
              )}
              {method === "listen" && (
                <LearnByListen
                  {...{
                    item,
                    target: data?.target,
                    onAnswer,
                    currentRepeat,
                    currentItemIndex,
                    data: data?.contents,
                  }}
                />
              )}
              {method === "speak" && (
                <LearnBySpeak
                  {...{
                    item,
                    target: data?.target,
                    onAnswer,
                    currentRepeat,
                    currentItemIndex,
                    data: data?.contents,
                  }}
                />
              )}
              {method === "write" && (
                <LearnByWrite
                  {...{
                    item,
                    target: data?.target,
                    onAnswer,
                    currentRepeat,
                    currentItemIndex,
                    data: data?.contents,
                  }}
                />
              )}
            </>
          )}
          {loading ||
            (isDataLoading && (
              <BlurFade
                delay={0.15}
                inView
                className="fixed inset-0 z-50 w-full h-full"
              >
                <div className="w-full h-full rounded-3xl backdrop-blur-sm bg-white/95" />
              </BlurFade>
            ))}
          <audio id="correct-audio" src="/sounds/correct.mp3" preload="auto" />
          <audio id="wrong-audio" src="/sounds/wrong.mp3" preload="auto" />
          <audio
            id="complete-audio"
            src="/sounds/completed.mp3"
            preload="auto"
          />
          {/* <video
        ref={videoRef}
        muted
        playsInline
        className="hidden w-full h-full"
      /> */}
        </div>
      )}
    </>
  );
};

export default Learn;
