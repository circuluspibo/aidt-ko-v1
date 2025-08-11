/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Users,
  Check,
} from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";

// 미리 정의된 캐릭터 데이터
const presetCharacters = [
  {
    id: "char_01",
    name: "한글이",
    avatar:
      "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_02",
    name: "글동이",
    avatar:
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_03",
    name: "말랑이",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_04",
    name: "소리",
    avatar:
      "https://images.unsplash.com/photo-1594736797933-d0b22ba0f0a4?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_05",
    name: "쓰기왕",
    avatar:
      "https://images.unsplash.com/photo-1619734086067-24bf8889ea7d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_06",
    name: "모음이",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_07",
    name: "자음아",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_08",
    name: "단어야",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_09",
    name: "문장이",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "char_10",
    name: "책읽기",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
];

export function CharacterManagement({
  groupId,
  characterId,
  onNavigate,
  chapters,
}) {
  console.log("CharacterManagement render:", {
    groupId,
    characterId,
  });

  // Mock 캐릭터 데이터를 별도 함수로 초기화
  const getInitialCharacters = () => [
    {
      id: 1,
      name: "한글이",
      nickname: "친근한 한글이",
      avatar:
        "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=400&fit=crop&crop=face",
      groupId: 1,
      createdDate: "2024-01-10",
      curriculum: [
        {
          chapterId: "chapter-1",
          order: 0,
        },
        {
          chapterId: "chapter-2",
          order: 1,
        },
      ],
    },
    {
      id: 2,
      name: "글동이",
      nickname: "활발한 글동이",
      avatar:
        "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&h=400&fit=crop&crop=face",
      groupId: 1,
      createdDate: "2024-01-12",
      curriculum: [
        {
          chapterId: "chapter-4",
          order: 0,
        },
        {
          chapterId: "chapter-5",
          order: 1,
        },
      ],
    },
    {
      id: 3,
      name: "말랑이",
      nickname: "차분한 말랑이",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
      groupId: 2,
      createdDate: "2024-01-15",
      curriculum: [
        {
          chapterId: "chapter-6",
          order: 0,
        },
      ],
    },
  ];

  const [characters, setCharacters] = useState(getInitialCharacters());

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);

  const [mounted, setMounted] = useState(false);

  // 새 캐릭터 생성 관련 상태
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [characterNickname, setCharacterNickname] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedCharacter = characterId
    ? characters.find((char) => char.id === characterId)
    : null;

  const filteredCharacters = groupId
    ? characters.filter((char) => char.groupId === groupId)
    : characters;

  const currentGroup =
    {
      1: "기초 한글반",
      2: "중급 한글반",
      3: "고급 한글반",
    }[groupId] || "전체";

  const difficultyColors = {
    쉬움: "bg-green-100 text-green-800",
    보통: "bg-yellow-100 text-yellow-800",
    어려움: "bg-red-100 text-red-800",
  };

  const handleCreateCharacter = () => {
    setEditingCharacter(null);
    setSelectedPresetId("");
    setCharacterNickname("");
    setIsDialogOpen(true);
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    // 편집 시에는 기존 방식 유지 (별도 처리 필요하면 추가)
    setIsDialogOpen(true);
  };

  const handleDeleteCharacter = (characterId) => {
    setCharacters(characters.filter((char) => char.id !== characterId));
  };

  const handleSaveCharacter = () => {
    if (!editingCharacter) {
      // 새 캐릭터 생성
      if (!selectedPresetId || !characterNickname.trim()) {
        return; // 유효성 검사
      }

      const presetCharacter = presetCharacters.find(
        (p) => p.id === selectedPresetId
      );
      if (!presetCharacter) return;

      const newCharacter = {
        id: Math.max(...characters.map((c) => c.id)) + 1,
        name: presetCharacter.name,
        nickname: characterNickname.trim(),
        avatar: presetCharacter.avatar,
        groupId: groupId || 1,
        createdDate: new Date().toISOString().split("T")[0],
        curriculum: [],
      };

      setCharacters([...characters, newCharacter]);
    } else {
      // 캐릭터 수정 (기존 로직 유지)
      const nicknameInput = document.getElementById("characterNickname");
      if (nicknameInput) {
        const updatedCharacter = {
          ...editingCharacter,
          nickname: nicknameInput.value,
        };
        setCharacters(
          characters.map((char) =>
            char.id === editingCharacter.id ? updatedCharacter : char
          )
        );
      }
    }

    setIsDialogOpen(false);
    setSelectedPresetId("");
    setCharacterNickname("");
  };

  const handleManageCurriculum = (character, event) => {
    // 이벤트 전파 방지
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log(
      "handleManageCurriculum called with character:",
      character.name
    );

    // 커리큘럼 편집 페이지로 이동
    onNavigate({
      section: "groups",
      groupId: groupId,
      characterId: character.id,
      curriculumEditing: true,
      breadcrumb: [
        {
          id: "dashboard",
          label: "Dashboard",
          section: "dashboard",
        },
        {
          id: "groups",
          label: "학습 그룹 관리",
          section: "groups",
        },
        {
          id: `group-${groupId}`,
          label: currentGroup,
          section: "groups",
          groupId: groupId,
        },
        {
          id: `character-${character.id}`,
          label: character.nickname,
          section: "groups",
          groupId: groupId,
          characterId: character.id,
        },
        {
          id: `curriculum-${character.id}`,
          label: "커리큘럼 편집",
          section: "groups",
          groupId: groupId,
          characterId: character.id,
          curriculumEditing: true,
        },
      ],
    });
  };

  const handleBackToCharacterList = () => {
    onNavigate({
      section: "groups",
      groupId: groupId,
      characterId: undefined,
      breadcrumb: [
        {
          id: "dashboard",
          label: "Dashboard",
          section: "dashboard",
        },
        {
          id: "groups",
          label: "학습 그룹 관리",
          section: "groups",
        },
        {
          id: `group-${groupId}`,
          label: currentGroup,
          section: "groups",
          groupId: groupId,
        },
      ],
    });
  };

  const handleBackToGroups = () => {
    onNavigate({
      section: "groups",
      groupId: undefined,
      characterId: undefined,
      chapterId: undefined,
      breadcrumb: [
        {
          id: "dashboard",
          label: "Dashboard",
          section: "dashboard",
        },
        {
          id: "groups",
          label: "학습 그룹 관리",
          section: "groups",
        },
      ],
    });
  };

  const getChaptersByCharacter = (character) => {
    return character.curriculum
      .sort((a, b) => a.order - b.order)
      .map((curriculumItem) =>
        chapters.find((chapter) => chapter.id === curriculumItem.chapterId)
      )
      .filter((chapter) => chapter !== undefined);
  };

  // 특정 캐릭터가 선택된 경우 커리큘럼 상세 관리 화면 표시
  if (characterId && selectedCharacter) {
    const assignedChapters = getChaptersByCharacter(selectedCharacter);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToCharacterList}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              캐릭터 목록으로
            </Button>
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCharacter.nickname} - 커리큘럼 관리
              </h2>
              <p className="mt-1 text-muted-foreground">
                {selectedCharacter.nickname} 캐릭터의 학습 커리큘럼을
                관리합니다.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={(e) => handleManageCurriculum(selectedCharacter, e)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              커리큘럼 편집
            </Button>
          </div>
        </div>

        {/* 캐릭터 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={selectedCharacter.avatar}
                alt={selectedCharacter.nickname}
                className="object-cover w-16 h-16 rounded-full"
              />
              <div>
                <CardTitle>{selectedCharacter.nickname}</CardTitle>
                <p className="mt-1 text-muted-foreground">
                  {selectedCharacter.name} 캐릭터
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{currentGroup}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{assignedChapters.length}개 챕터</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>등록일: {selectedCharacter.createdDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 배정된 챕터 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>배정된 학습 챕터</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedChapters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순서</TableHead>
                    <TableHead>챕터명</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>난이도</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCharacter.curriculum
                    .sort((a, b) => a.order - b.order)
                    .map((curriculumItem, index) => {
                      const chapter = chapters.find(
                        (c) => c.id === curriculumItem.chapterId
                      );
                      if (!chapter) return null;
                      return (
                        <TableRow key={curriculumItem.chapterId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {chapter.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {chapter.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                difficultyColors[chapter.difficulty] ||
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {chapter.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                chapter.isPublished ? "default" : "secondary"
                              }
                            >
                              {chapter.isPublished ? "공개" : "비공개"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p>아직 배정된 챕터가 없습니다.</p>
                <Button
                  className="mt-4"
                  onClick={(e) => handleManageCurriculum(selectedCharacter, e)}
                >
                  <Plus className="w-4 h-4 mr-2" />첫 번째 챕터 추가
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {groupId && (
            <Button variant="outline" size="sm" onClick={handleBackToGroups}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              그룹 목록으로
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {groupId ? `${currentGroup} - 캐릭터 관리` : "전체 캐릭터 관리"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {groupId
                ? `${currentGroup}에 속한 캐릭터들을 관리하고 각 캐릭터의 학습 커리큘럼을 설정합니다.`
                : "모든 그룹의 캐릭터들을 관리합니다."}
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateCharacter} className="gap-2">
              <Plus className="w-4 h-4" />
              캐릭터 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCharacter ? "캐릭터 수정" : "새 캐릭터 생성"}
              </DialogTitle>
              <DialogDescription>
                {editingCharacter
                  ? "캐릭터의 닉네임을 수정할 수 있습니다."
                  : "학생들의 학습을 도와줄 캐릭터를 선택하고 닉네임을 설정해주세요."}
              </DialogDescription>
            </DialogHeader>

            {!editingCharacter ? (
              <div className="space-y-6">
                {/* 캐릭터 선택 */}
                <div className="space-y-3">
                  <Label>캐릭터 선택</Label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    {presetCharacters.map((preset) => (
                      <div
                        key={preset.id}
                        className={`
                          cursor-pointer border-2 rounded-lg p-3 text-center transition-all
                          ${
                            selectedPresetId === preset.id
                              ? "border-primary bg-primary/5 scale-105"
                              : "border-border hover:border-primary/50"
                          }
                        `}
                        onClick={() => setSelectedPresetId(preset.id)}
                      >
                        <div className="relative">
                          <ImageWithFallback
                            src={preset.avatar}
                            alt={preset.name}
                            className="object-cover w-16 h-16 mx-auto mb-2 rounded-full"
                          />
                          {selectedPresetId === preset.id && (
                            <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -top-1 -right-1 bg-primary">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium">{preset.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 캐릭터 닉네임 설정 */}
                {selectedPresetId && (
                  <div className="space-y-2">
                    <Label htmlFor="characterNickname">캐릭터 닉네임</Label>
                    <Input
                      id="characterNickname"
                      placeholder="캐릭터의 닉네임을 입력하세요"
                      value={characterNickname}
                      onChange={(e) => setCharacterNickname(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      선택한 캐릭터:{" "}
                      {
                        presetCharacters.find((p) => p.id === selectedPresetId)
                          ?.name
                      }
                    </p>
                  </div>
                )}

                {!groupId && (
                  <div className="space-y-2">
                    <Label htmlFor="groupId">소속 그룹</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="그룹을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">기초 한글반</SelectItem>
                        <SelectItem value="2">중급 한글반</SelectItem>
                        <SelectItem value="3">고급 한글반</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : (
              // 캐릭터 수정 폼
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <ImageWithFallback
                    src={editingCharacter.avatar}
                    alt={editingCharacter.name}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{editingCharacter.name}</div>
                    <div className="text-sm text-muted-foreground">
                      기본 캐릭터
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="characterNickname">캐릭터 닉네임</Label>
                  <Input
                    id="characterNickname"
                    placeholder="캐릭터의 닉네임을 입력하세요"
                    defaultValue={editingCharacter.nickname}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <div className="flex w-full gap-2">
                <Button
                  className="flex-1"
                  onClick={handleSaveCharacter}
                  disabled={
                    !editingCharacter &&
                    (!selectedPresetId || !characterNickname.trim())
                  }
                >
                  {editingCharacter ? "수정" : "생성"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  취소
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* 캐릭터 카드 목록 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCharacters.map((character) => {
          const assignedChapters = getChaptersByCharacter(character);
          return (
            <Card
              key={character.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <ImageWithFallback
                    src={character.avatar}
                    alt={character.nickname}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {character.nickname}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {character.name} 캐릭터
                    </p>
                    {!groupId && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {currentGroup}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{assignedChapters.length}개 챕터 배정됨</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  등록일: {character.createdDate}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() =>
                      onNavigate({
                        section: "groups",
                        groupId: groupId,
                        characterId: character.id,
                        breadcrumb: [
                          {
                            id: "dashboard",
                            label: "Dashboard",
                            section: "dashboard",
                          },
                          {
                            id: "groups",
                            label: "학습 그룹 관리",
                            section: "groups",
                          },
                          {
                            id: `group-${groupId}`,
                            label: currentGroup,
                            section: "groups",
                            groupId: groupId,
                          },
                          {
                            id: `character-${character.id}`,
                            label: character.nickname,
                            section: "groups",
                            groupId: groupId,
                            characterId: character.id,
                          },
                        ],
                      })
                    }
                  >
                    커리큘럼 관리
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCharacter(character)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCharacter(character.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {groupId
                ? `${currentGroup}에 등록된 캐릭터가 없습니다.`
                : "등록된 캐릭터가 없습니다."}
            </p>
            <Button className="mt-4" onClick={handleCreateCharacter}>
              <Plus className="w-4 h-4 mr-2" />첫 번째 캐릭터 추가
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
