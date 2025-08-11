import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Plus, Edit, Trash2, Users, ChevronRight } from "lucide-react";

export function GroupManagement({ onNavigate }) {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "기초 한글반",
      description: "한글을 처음 배우는 학생들을 위한 그룹",
      studentCount: 8,
      characterCount: 3,
      status: "활성",
      createdDate: "2024-01-10",
    },
    {
      id: 2,
      name: "중급 한글반",
      description: "기본 자음과 모음을 익힌 학생들을 위한 그룹",
      studentCount: 12,
      characterCount: 5,
      status: "활성",
      createdDate: "2024-01-15",
    },
    {
      id: 3,
      name: "고급 한글반",
      description: "문장 구성과 읽기 연습을 위한 그룹",
      studentCount: 6,
      characterCount: 4,
      status: "비활성",
      createdDate: "2024-01-20",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const statusColors = {
    활성: "bg-green-100 text-green-800",
    비활성: "bg-gray-100 text-gray-800",
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsDialogOpen(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const handleDeleteGroup = (groupId) => {
    setGroups(groups.filter((group) => group.id !== groupId));
  };

  const handleGroupClick = (group) => {
    onNavigate({
      section: "groups",
      groupId: group.id,
      characterId: undefined,
      chapterId: undefined,
      breadcrumb: [
        { id: "dashboard", label: "Dashboard", section: "dashboard" },
        { id: "groups", label: "학습 그룹 관리", section: "groups" },
        {
          id: `group-${group.id}`,
          label: group.name,
          section: "groups",
          groupId: group.id,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">학습 그룹 관리</h2>
          <p className="mt-1 text-muted-foreground">
            학습 그룹을 생성하고 관리합니다. 각 그룹에는 캐릭터와 학습 챕터가
            포함됩니다.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateGroup} className="gap-2">
              <Plus className="w-4 h-4" />
              그룹 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "그룹 수정" : "새 그룹 생성"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup
                  ? "기존 학습 그룹의 정보를 수정할 수 있습니다."
                  : "새로운 학습 그룹을 생성하고 학생들을 배정해보세요."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">그룹명</Label>
                <Input
                  id="groupName"
                  placeholder="그룹명을 입력하세요"
                  defaultValue={editingGroup?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Input
                  id="description"
                  placeholder="그룹 설명을 입력하세요"
                  defaultValue={editingGroup?.description || ""}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  {editingGroup ? "수정" : "생성"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 그룹 카드 목록 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="transition-shadow cursor-pointer hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge className={statusColors[group.status]}>
                  {group.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{group.studentCount}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{group.characterCount}개 캐릭터</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                등록일: {group.createdDate}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleGroupClick(group)}
                >
                  캐릭터 관리
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditGroup(group);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(group.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>그룹 현황 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-4 text-center rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {groups.length}
              </div>
              <div className="text-sm text-blue-700">총 그룹 수</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {groups.filter((g) => g.status === "활성").length}
              </div>
              <div className="text-sm text-green-700">활성 그룹</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                {groups.reduce((total, group) => total + group.studentCount, 0)}
              </div>
              <div className="text-sm text-purple-700">총 학생 수</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">
                {groups.reduce(
                  (total, group) => total + group.characterCount,
                  0
                )}
              </div>
              <div className="text-sm text-orange-700">총 캐릭터 수</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
