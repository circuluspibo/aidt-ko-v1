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
import { ChevronLeft } from "lucide-react";
import { useRef, useEffect } from "react";
import { useIntegratedConcentrationMonitor } from "@/hook/useIntegratedConcentrationMonitor";

const Learn = () => {
  // 비디오 요소 ref 생성
  const videoRef = useRef(null);

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

  // 집중도 모니터링 초기화 (Learn.jsx에서 관리)
  const sessionId = `${character}-${chapter}-${method}`;
  const studentId = "student_1"; // 실제로는 사용자 ID를 사용해야 함

  const concentrationMonitor = useIntegratedConcentrationMonitor(
    sessionId,
    studentId,
    method,
    videoRef
  );

  // 문제 변경 시 집중도 모니터링 시작
  useEffect(() => {
    if (item) {
      concentrationMonitor.startQuestion();
    }
  }, [currentItemIndex, item]);

  // 실시간 집중도 상태 확인
  const concentrationStatus = concentrationMonitor.getConcentrationStatus();

  // 집중도 상태 변화 감지 및 로그 출력 (레벨 변경 시에만)
  useEffect(() => {
    // 레벨이 변경될 때만 간단하게 로그 출력
    console.log(
      "🎯 집중도:",
      concentrationStatus.level,
      concentrationStatus.focusRate
        ? `(${concentrationStatus.focusRate.toFixed(1)}%)`
        : "",
      concentrationStatus.faceDetected ? "" : " - 얼굴 미감지"
    );
  }, [concentrationStatus.level]);

  if (isError)
    return (
      <div className="flex justify-center items-center h-full">
        데이터를 불러오는 중 에러가 발생했습니다.
      </div>
    );

  // data가 로딩 중이거나 없을 때 로딩 표시
  if (isDataLoading || !data) return <Loading />;

  return (
    <>
      <div className="grid grid-rows-[auto_1fr] md:gap-4 px-6 py-4 w-full h-full relative rounded-t-3xl overflow-hidden">
        {/* 숨겨진 비디오 요소 - 모든 학습 컴포넌트에서 공유 */}
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          muted
          playsInline
          onLoadedMetadata={() => console.log("✅ 비디오 메타데이터 로드됨")}
          onError={(e) => console.error("❌ 비디오 에러:", e)}
        />

        {/* 집중도 상태 표시 */}
        {(concentrationStatus.level !== "high" ||
          concentrationStatus.absoluteWarnings.length > 0) && (
          <div
            className={`fixed bottom-4 left-4 p-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
              concentrationStatus.absoluteWarnings.length > 0 ||
              concentrationStatus.level === "low"
                ? "bg-red-100 border border-red-300 text-red-800"
                : "bg-yellow-100 border border-yellow-300 text-yellow-800"
            }`}
          >
            <div className="font-semibold">
              집중도: {concentrationStatus.level === "low" ? "낮음" : "보통"}
            </div>

            {/* 절대적 경고 메시지 우선 표시 */}
            {concentrationStatus.absoluteWarnings.length > 0 && (
              <div className="mt-1">
                {concentrationStatus.absoluteWarnings.map((warning, index) => (
                  <div key={index} className="text-sm font-medium text-red-600">
                    ⚠️ {warning}
                  </div>
                ))}
              </div>
            )}

            {/* 일반 정보 표시 */}
            {concentrationStatus.focusRate !== undefined && (
              <div className="text-sm">
                시선 집중도: {concentrationStatus.focusRate.toFixed(1)}%
              </div>
            )}
            {!concentrationStatus.faceDetected &&
              concentrationStatus.absoluteWarnings.length === 0 && (
                <div className="text-sm text-red-600">
                  ⚠️ 카메라 앞에 앉아주세요
                </div>
              )}
            {concentrationStatus.recommendations.length > 0 &&
              concentrationStatus.absoluteWarnings.length === 0 && (
                <div className="mt-1 text-sm">
                  💡 {concentrationStatus.recommendations[0]}
                </div>
              )}
            <div className="mt-1 text-xs text-gray-500">
              💡 문제에 답하거나 화면을 터치하면 집중도가 개선됩니다
            </div>
          </div>
        )}

        <TopContentList
          open={openContentList}
          color={COLORS[method]}
          currentIndex={currentItemIndex}
          data={data?.contents}
          onSelect={handleContentSelect}
          onClose={handleContentListClose}
        />
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center">
            <Link
              className="p-1 mr-1 w-12 h-12 bg-transparent rounded-full opacity-65 hover:opacity-100 hover:bg-white/50"
              to={`/learn/${character}/${chapter}?target=${target}`}
            >
              <ChevronLeft className="w-10 h-10" />
            </Link>
            <Breadcrumb>
              <BreadcrumbList className="font-bold text-[2.5rem]">
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
          </div>
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
                  submitAnswer: concentrationMonitor.submitAnswer,
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
                  submitAnswer: concentrationMonitor.submitAnswer,
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
                  submitAnswer: concentrationMonitor.submitAnswer,
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
                  submitAnswer: concentrationMonitor.submitAnswer,
                }}
              />
            )}
          </>
        )}
        <audio id="correct-audio" src="/sounds/correct.mp3" preload="auto" />
        <audio id="wrong-audio" src="/sounds/wrong.mp3" preload="auto" />
        <audio id="complete-audio" src="/sounds/completed.mp3" preload="auto" />
      </div>
    </>
  );
};

export default Learn;
