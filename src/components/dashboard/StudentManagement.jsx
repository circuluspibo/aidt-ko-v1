/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Eye, MessageSquare, User } from "lucide-react";

export function StudentManagement() {
  const [students, setStudents] = useState([
    {
      id: 1,
      anonymousId: "학습자-001",
      group: "기초 한글반",
      character: "한글이",
      currentChapter: "기본 자음 익히기",
      progress: 85,
      grade: "우수",
      activities: [
        {
          date: "2024-08-06",
          type: "쓰기",
          chapter: "기본 자음 익히기",
          score: 95,
          timeSpent: 10,
        },
        {
          date: "2024-08-05",
          type: "읽기",
          chapter: "기본 자음 익히기",
          score: 88,
          timeSpent: 12,
        },
      ],
    },
    {
      id: 2,
      anonymousId: "학습자-002",
      group: "기초 한글반",
      character: "글동이",
      currentChapter: "기본 모음 익히기",
      progress: 92,
      grade: "우수",
      activities: [
        {
          date: "2024-08-06",
          type: "듣기",
          chapter: "기본 모음 익히기",
          score: 92,
          timeSpent: 8,
        },
        {
          date: "2024-08-05",
          type: "말하기",
          chapter: "기본 모음 익히기",
          score: 89,
          timeSpent: 15,
        },
      ],
    },
    {
      id: 3,
      anonymousId: "학습자-003",
      group: "중급 한글반",
      character: "말랑이",
      currentChapter: "자음과 모음 조합",
      progress: 68,
      grade: "보통",
      activities: [
        {
          date: "2024-08-06",
          type: "읽기",
          chapter: "자음과 모음 조합",
          score: 75,
          timeSpent: 18,
        },
        {
          date: "2024-08-05",
          type: "쓰기",
          chapter: "자음과 모음 조합",
          score: 68,
          timeSpent: 20,
        },
      ],
    },
    {
      id: 4,
      anonymousId: "학습자-004",
      group: "중급 한글반",
      character: "한글이",
      currentChapter: "간단한 단어 읽기",
      progress: 75,
      grade: "보통",
      activities: [
        {
          date: "2024-08-06",
          type: "읽기",
          chapter: "간단한 단어 읽기",
          score: 82,
          timeSpent: 14,
        },
        {
          date: "2024-08-05",
          type: "쓰기",
          chapter: "간단한 단어 읽기",
          score: 76,
          timeSpent: 16,
        },
      ],
    },
    {
      id: 5,
      anonymousId: "학습자-005",
      group: "기초 한글반",
      character: "글동이",
      currentChapter: "기본 자음 익히기",
      progress: 45,
      grade: "개선필요",
      activities: [
        {
          date: "2024-08-06",
          type: "쓰기",
          chapter: "기본 자음 익히기",
          score: 52,
          timeSpent: 25,
        },
        {
          date: "2024-08-05",
          type: "읽기",
          chapter: "기본 자음 익히기",
          score: 48,
          timeSpent: 22,
        },
      ],
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const gradeColors = {
    우수: "bg-green-100 text-green-800",
    보통: "bg-yellow-100 text-yellow-800",
    개선필요: "bg-red-100 text-red-800",
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const mockChapterProgress = [
    { chapter: "기본 자음 익히기", progress: 85, status: "진행중" },
    { chapter: "기본 모음 익히기", progress: 0, status: "미시작" },
    { chapter: "자음과 모음 조합", progress: 0, status: "미시작" },
    { chapter: "간단한 단어 읽기", progress: 0, status: "미시작" },
  ];

  // 통계 데이터 계산
  const groupStats = students.reduce((acc, student) => {
    if (!acc[student.group]) {
      acc[student.group] = { count: 0, totalProgress: 0, avgProgress: 0 };
    }
    acc[student.group].count += 1;
    acc[student.group].totalProgress += student.progress;
    acc[student.group].avgProgress = Math.round(
      acc[student.group].totalProgress / acc[student.group].count
    );
    return acc;
  }, {});

  const gradeDistribution = students.reduce((acc, student) => {
    acc[student.grade] = (acc[student.grade] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">학습 현황 관리</h2>
          <p className="mt-1 text-muted-foreground">
            익명화된 학습자들의 진도와 성취도를 확인합니다. 개인정보는 보호되며
            학습 데이터만 추적됩니다.
          </p>
        </div>
      </div>

      {/* 그룹별 통계 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(groupStats).map(([groupName, stats]) => (
          <Card key={groupName}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    학습자 수
                  </span>
                  <span className="font-medium">{stats.count}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    평균 진도
                  </span>
                  <span className="font-medium">{stats.avgProgress}%</span>
                </div>
                <Progress value={stats.avgProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 성취도 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>성취도 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <div
                key={grade}
                className="p-4 text-center rounded-lg bg-muted/50"
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{grade}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>학습자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학습자 ID</TableHead>
                <TableHead>소속 그룹</TableHead>
                <TableHead>학습 캐릭터</TableHead>
                <TableHead>현재 챕터</TableHead>
                <TableHead>진도율</TableHead>
                <TableHead>성취도</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-mono text-sm">
                        {student.anonymousId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{student.group}</TableCell>
                  <TableCell>{student.character}</TableCell>
                  <TableCell>{student.currentChapter}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="w-16 h-2" />
                      <span className="text-sm">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={gradeColors[student.grade]}>
                      {student.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(student)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      상세 보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedStudent && (
                <>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {selectedStudent.anonymousId} 학습 상세 현황
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              학습자의 진도, 활동 로그, 성취도를 확인하고 피드백을 작성할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">학습자 ID</p>
                  <p className="font-mono font-medium">
                    {selectedStudent.anonymousId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">소속 그룹</p>
                  <p className="font-medium">{selectedStudent.group}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">학습 캐릭터</p>
                  <p className="font-medium">{selectedStudent.character}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">전체 진도율</p>
                  <p className="font-medium">{selectedStudent.progress}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">성취도</p>
                  <Badge className={gradeColors[selectedStudent.grade]}>
                    {selectedStudent.grade}
                  </Badge>
                </div>
              </div>

              {/* 챕터별 진도 */}
              <Card>
                <CardHeader>
                  <CardTitle>챕터별 진도 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockChapterProgress.map((chapter, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{chapter.chapter}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{chapter.progress}%</span>
                            <Badge variant="outline">{chapter.status}</Badge>
                          </div>
                        </div>
                        <Progress value={chapter.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 최근 학습 활동 */}
              <Card>
                <CardHeader>
                  <CardTitle>최근 학습 활동 로그</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>날짜</TableHead>
                        <TableHead>활동 유형</TableHead>
                        <TableHead>챕터</TableHead>
                        <TableHead>점수</TableHead>
                        <TableHead>소요 시간</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudent.activities.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell>{activity.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{activity.type}</Badge>
                          </TableCell>
                          <TableCell>{activity.chapter}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                activity.score >= 90
                                  ? "bg-green-100 text-green-800"
                                  : activity.score >= 80
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {activity.score}점
                            </Badge>
                          </TableCell>
                          <TableCell>{activity.timeSpent}분</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* 피드백 입력 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    학습 피드백 작성
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">선생님 피드백</Label>
                    <Textarea
                      id="feedback"
                      placeholder="학습자에 대한 피드백을 작성해주세요. 개인식별정보는 포함하지 마세요."
                      rows={4}
                    />
                  </div>
                  <Button>피드백 저장</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
