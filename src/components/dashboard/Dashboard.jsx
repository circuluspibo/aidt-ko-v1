import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  LabelList,
} from "recharts";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  Target,
  Brain,
  Loader2,
} from "lucide-react";
import { useLearningOverview } from "@/hook/useStudentAnalytics";
import { transformOverview } from "@/utils/dataTransformers";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: rawOverview,
    isPending,
    isError,
  } = useLearningOverview(user?._id, {});

  // API 응답을 Mock 데이터 구조로 변환 (실제 데이터만 사용)
  const overview = rawOverview ? transformOverview(rawOverview, "api") : null;

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">학습 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <span>학습 데이터를 불러올 수 없습니다.</span>
      </div>
    );
  }

  // 실제 데이터가 없는 경우
  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium">학습 데이터가 없습니다</h3>
          <p className="text-sm">
            학생들이 학습을 시작하면 여기에 통계가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  const summaryData = [
    {
      title: "활동 학생",
      value: overview.totalActiveStudents.toString(),
      subtitle: "전체 학습자",
      color: "bg-blue-500",
      icon: GraduationCap,
      action: () => navigate("/manage/students"),
    },
    {
      title: "응시 문제",
      value: overview.totalQuestionsAttempted.toLocaleString(),
      subtitle: "누적 학습량",
      color: "bg-green-500",
      icon: Target,
      action: () => navigate("/manage/students"),
    },
    {
      title: "평균 정답률",
      value: `${overview.averageAccuracy.toFixed(1)}%`,
      subtitle: "전체 성취도",
      color: "bg-purple-500",
      icon: TrendingUp,
      action: () => navigate("/manage/students"),
    },
    {
      title: "총 학습 시간",
      value:
        overview.totalStudyMinutes > 0
          ? overview.totalStudyHours > 0
            ? `${overview.totalStudyHours}시간 ${
                overview.totalStudyMinutes % 60
              }분`
            : `${overview.totalStudyMinutes}분`
          : "0분",
      subtitle: "누적 학습량",
      color: "bg-orange-500",
      icon: Clock,
      action: () => navigate("/manage/students"),
    },
  ];

  // 1) 오늘부터 6일 전까지 날짜 배열 만들기
  const last7days = Array.from({ length: 7 }, (_, i) =>
    dayjs()
      .subtract(6 - i, "day")
      .format("YYYY-MM-DD")
  );

  // 2) dailyActivity 데이터를 날짜 기준으로 매핑
  const activityMap = Object.fromEntries(
    overview.dailyActivity.map((d) => [d.date, d])
  );
  // 최근 2주간 일일 활동 데이터 (LegacyDashboard와 동일)
  // 1) 데이터 전처리: 0문제인 날은 정답률을 null로 처리해 급락 오해 방지
  // dayjs.
  const recentActivityData = last7days.map((dateStr) => {
    const activity = activityMap[dateStr] || {};
    const dt = new Date(dateStr);
    return {
      dateRaw: dt, // time scale용
      dateLabel: dayjs(dt).format("M/D"),
      activeStudents: activity.activeStudents ?? 0,
      questions: activity.questionsAttempted ?? 0,
      accuracy:
        activity.questionsAttempted > 0
          ? Math.round(activity.averageAccuracy)
          : null,
    };
  });

  // 콘텐츠 타입별 정답률 데이터 (LegacyDashboard와 동일) - 고정 순서
  const contentTypeOrder = ["vowel", "consonant", "letter", "word"];
  const contentAccuracyData = contentTypeOrder.map((type) => {
    const item = overview.contentTypeDistribution.find(
      (c) => c.contentType === type
    );
    return {
      타입:
        type === "vowel"
          ? "모음"
          : type === "consonant"
          ? "자음"
          : type === "letter"
          ? "글자"
          : "낱말",
      정답률: item ? Math.round(item.averageAccuracy) : 0,
      문제수: item ? item.questionsAttempted : 0, // 실제 개수
    };
  });

  // 활동 타입별 데이터 (LegacyDashboard와 동일) - 고정 순서
  const activityTypeOrder = ["read", "listen", "speak", "write"];
  const activityTypeData = activityTypeOrder.map((type) => {
    const item = overview.activityTypeDistribution.find(
      (a) => a.activityType === type
    );
    return {
      name:
        type === "read"
          ? "읽기"
          : type === "listen"
          ? "듣기"
          : type === "speak"
          ? "말하기"
          : "쓰기",
      value: item ? Math.round(item.averageAccuracy) : 0,
      questions: item ? item.questionsAttempted : 0,
      color:
        type === "read"
          ? "#3b82f6"
          : type === "listen"
          ? "#10b981"
          : type === "speak"
          ? "#f59e0b"
          : "#ef4444",
    };
  });

  // 난이도별 성과 데이터 (LegacyDashboard와 동일) - 고정 순서
  const difficultyOrder = ["쉬움", "보통", "어려움"];
  const difficultyData = difficultyOrder.map((difficulty) => {
    const item = overview.difficultyDistribution.find(
      (d) => d.difficulty === difficulty
    );
    return {
      난이도: difficulty,
      정답률: item ? Math.round(item.accuracy) : 0,
      문제수: item ? item.questionsAttempted : 0, // 실제 개수
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">한글 학습 관리 시스템</h1>
          <p className="text-muted-foreground">
            특수교육 대상 학생들을 위한 통합 학습 관리 플랫폼
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/manage/groups")}
            className="gap-2"
            size="lg"
          >
            <Users className="w-4 h-4" />
            그룹 관리 시작
          </Button>
          <Button
            onClick={() => navigate("/manage/students")}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <GraduationCap className="w-4 h-4" />
            학습 현황 보기
          </Button>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="transition-shadow cursor-pointer hover:shadow-md"
              onClick={item.action}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="mb-1 text-2xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 일주일 학습 활동 (막대=문제수 / 선=정답률 / 라벨=활동학생) */}
        <Card>
          <CardHeader>
            <CardTitle>최근 일주일 학습 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={recentActivityData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                {/* 날짜축: 시간 스케일 */}
                <XAxis
                  dataKey="dateRaw"
                  type="number"
                  scale="time"
                  padding="no-gap"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) => dayjs(v).format("M/D")}
                />

                {/* 좌측축: 문제수 */}
                <YAxis yAxisId="left" />

                {/* 우측축: 정답률 */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />

                <Tooltip
                  labelFormatter={(v) => dayjs(v).format("M/D")}
                  formatter={(value, name) => {
                    if (name === "accuracy") return [`${value}%`, "정답률"];
                    if (name === "questions") return [value, "응시 문제"];
                    if (name === "activeStudents")
                      return [value, "활동 학생 수"];
                    return [value, name];
                  }}
                />

                {/* 막대: 문제수 (파랑) */}
                <Bar
                  yAxisId="left"
                  dataKey="questions"
                  name="questions"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey="activeStudents"
                    name="activeStudents"
                    position="top"
                    formatter={(v) => (v != null ? `👥 ${v}` : "")}
                  />
                </Bar>

                {/* 선: 정답률 (초록) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  name="accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 활동 타입별 성과 */}
        <Card>
          <CardHeader>
            <CardTitle>활동 타입별 평균 정답률</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "평균 정답률"]} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 콘텐츠 타입별 학습 성과 */}
        <Card>
          <CardHeader>
            <CardTitle>콘텐츠 타입별 학습 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={contentAccuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="타입" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "정답률" ? `${value}%` : `${value}개`,
                    name === "정답률" ? "평균 정답률" : "응시 문제 수",
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="문제수"
                  fill="#3b82f6"
                  name="응시 문제 수"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="정답률"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="평균 정답률"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 난이도별 성과 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>난이도별 성과 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="난이도" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "정답률" ? `${value}%` : `${value}개`,
                    name === "정답률" ? "평균 정답률" : "응시 문제 수",
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="문제수"
                  fill="#8b5cf6"
                  name="응시 문제 수"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="정답률"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="평균 정답률"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 주요 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            주요 학습 통계 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                전체 성과
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">총 응시 문제</span>
                  <span className="font-medium">
                    {overview.totalQuestionsAttempted.toLocaleString()}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">평균 정답률</span>
                  <span className="font-medium text-green-600">
                    {overview.averageAccuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">총 학습 시간</span>
                  <span className="font-medium">
                    {overview.totalStudyHours}시간
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                활동별 최고 성과
              </h4>
              <div className="space-y-2">
                {activityTypeData
                  .sort((a, b) => b.value - a.value)
                  .map((activity, index) => (
                    <div key={activity.name} className="flex justify-between">
                      <span className="text-sm">{activity.name}</span>
                      <span
                        className={`font-medium ${
                          index === 0 ? "text-green-600" : ""
                        }`}
                      >
                        {activity.value}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                콘텐츠별 진도
              </h4>
              <div className="space-y-2">
                {contentAccuracyData.map((content) => (
                  <div key={content.타입} className="flex justify-between">
                    <span className="text-sm">{content.타입}</span>
                    <span
                      className={`font-medium ${
                        content.정답률 > 0 ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {content.정답률}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
