import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

export function Dashboard() {
  const summaryData = [
    { title: "등록된 학습 그룹", value: "12", color: "bg-blue-500" },
    { title: "생성된 캐릭터", value: "8", color: "bg-green-500" },
    { title: "전체 학습 챕터", value: "24", color: "bg-purple-500" },
    { title: "등록 학생", value: "48", color: "bg-orange-500" },
  ];

  const progressData = [
    { name: "완료", value: 65, color: "#22c55e" },
    { name: "진행중", value: 25, color: "#f59e0b" },
    { name: "미시작", value: 10, color: "#ef4444" },
  ];

  const studentProgressData = [
    { name: "우수", students: 12 },
    { name: "보통", students: 28 },
    { name: "개선필요", students: 8 },
  ];

  const groupProgressData = [
    { name: "그룹A", progress: 85 },
    { name: "그룹B", progress: 72 },
    { name: "그룹C", progress: 91 },
    { name: "그룹D", progress: 68 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">학습 현황 대시보드</h2>

      {/* 요약 지표 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <div className={`w-4 h-4 rounded ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 전체 학습 진도율 */}
        <Card>
          <CardHeader>
            <CardTitle>전체 학습 진도율</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {progressData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 학생별 성취도 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>학생별 성취도 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studentProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 그룹별 평균 진도율 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>그룹별 평균 진도율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupProgressData.map((group, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{group.name}</span>
                    <span>{group.progress}%</span>
                  </div>
                  <Progress value={group.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
