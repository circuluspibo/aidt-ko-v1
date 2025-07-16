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
import learningData from "@/data/learningData.converted.json";
import useLearningSession from "@/hook/useLearningSession";
import Stepper from "@/components/ui/stepper";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import colors from "tailwindcss/colors";
import { BlurFade } from "@/components/magicui/blur-fade";
import LearnByListen from "@/components/LearnByListen";

const Learn = () => {
  const {
    character,
    target,
    method,
    loading,
    onAnswer,
    repeatSettings,
    currentRepeat,
    currentItemIndex,
    videoRef,
  } = useLearningSession();
  const item = learningData[target][currentItemIndex];

  return (
    <div className="grid grid-rows-[auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
      <div className="flex justify-between items-center">
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
              max={learningData[target].length}
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
            data: learningData[target],
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
            data: learningData[target],
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
            data: learningData[target],
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
            data: learningData[target],
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
