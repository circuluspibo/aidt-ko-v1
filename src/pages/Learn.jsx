import { Link } from "react-router-dom";
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
import LearnByListen from "@/components/LearnByListen";
import TopContentList from "@/features/TopContentList";
import { Loading } from "@/components/Loading";

const Learn = () => {
  const {
    // URL 파라미터
    chapter,
    character,
    method,
    target,

    // 콘텐츠 리스트 관련
    openContentList,
    handleContentListToggle,
    handleContentListClose,
    handleContentSelect,

    // 데이터 관련
    data,
    isDataLoading,
    isError,

    // 학습 세션 관련
    currentItemIndex,
    currentRepeat,
    repeatSettings,
    onAnswer,
    item,
  } = useLearningSession();

  if (isError)
    return (
      <div className="flex justify-center items-center h-full">
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
            onSelect={handleContentSelect}
            onClose={handleContentListClose}
          />
          <div className="flex justify-between items-center">
            <Breadcrumb>
              <BreadcrumbList className="font-bold text-[2.5rem]">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/learn/${character}`}>홈</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className={`font-extrabold text-${target}`}
                  >
                    <Link to={`/learn/${character}`}>{TARGETS[target]}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className={`font-extrabold text-${COLORS[method]}-500`}
                  >
                    <Link
                      to={`/learn/${character}/${chapter}?target=${target}`}
                    >
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
                          onClick={handleContentListToggle}
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
            <div className="flex gap-8 items-center">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-bold">반복</span>
                <Stepper
                  currentStep={currentRepeat}
                  totalSteps={repeatSettings.correct}
                  activeColor={`bg-${COLORS[method]}-500`}
                  style={{ minWidth: `${repeatSettings.correct * 2.5}rem` }}
                />
              </div>
              <div className="flex gap-2 items-center">
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
                    target,
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
                    target,
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
                    target,
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
                    target,
                    onAnswer,
                    currentRepeat,
                    currentItemIndex,
                    data: data?.contents,
                  }}
                />
              )}
            </>
          )}
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
