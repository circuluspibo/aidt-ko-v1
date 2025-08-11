import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  X,
  GripVertical,
  BookOpen,
  Target,
  ArrowLeft,
  Plus,
  Volume2,
  Mic,
  PenTool,
  Search,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useDraggableInPortal } from "@/hook/useDraggableInPortal";

// Mock 학습 데이터
const learningItemsData = {
  모음: [
    { id: "vowel_1", content: "ㅏ", difficulty: "normal" },
    { id: "vowel_2", content: "ㅓ", difficulty: "normal" },
    { id: "vowel_3", content: "ㅗ", difficulty: "normal" },
    { id: "vowel_4", content: "ㅜ", difficulty: "normal" },
    { id: "vowel_5", content: "ㅡ", difficulty: "normal" },
    { id: "vowel_6", content: "ㅣ", difficulty: "normal" },
    { id: "vowel_7", content: "ㅑ", difficulty: "normal" },
    { id: "vowel_8", content: "ㅕ", difficulty: "normal" },
    { id: "vowel_9", content: "ㅛ", difficulty: "normal" },
    { id: "vowel_10", content: "ㅠ", difficulty: "normal" },
  ],
  자음: [
    { id: "consonant_1", content: "ㄱ", difficulty: "normal" },
    { id: "consonant_2", content: "ㄴ", difficulty: "normal" },
    { id: "consonant_3", content: "ㄷ", difficulty: "normal" },
    { id: "consonant_4", content: "ㄹ", difficulty: "normal" },
    { id: "consonant_5", content: "ㅁ", difficulty: "normal" },
    { id: "consonant_6", content: "ㅂ", difficulty: "normal" },
    { id: "consonant_7", content: "ㅅ", difficulty: "normal" },
    { id: "consonant_8", content: "ㅇ", difficulty: "normal" },
    { id: "consonant_9", content: "ㅈ", difficulty: "normal" },
    { id: "consonant_10", content: "ㅊ", difficulty: "normal" },
    { id: "consonant_11", content: "ㅋ", difficulty: "normal" },
    { id: "consonant_12", content: "ㅌ", difficulty: "normal" },
    { id: "consonant_13", content: "ㅍ", difficulty: "normal" },
    { id: "consonant_14", content: "ㅎ", difficulty: "normal" },
  ],
  글자: [
    { id: "letter_1", content: "가", difficulty: "normal" },
    { id: "letter_2", content: "나", difficulty: "normal" },
    { id: "letter_3", content: "다", difficulty: "normal" },
    { id: "letter_4", content: "라", difficulty: "normal" },
    { id: "letter_5", content: "마", difficulty: "normal" },
    { id: "letter_6", content: "바", difficulty: "normal" },
    { id: "letter_7", content: "사", difficulty: "normal" },
    { id: "letter_8", content: "아", difficulty: "normal" },
    { id: "letter_9", content: "자", difficulty: "normal" },
    { id: "letter_10", content: "차", difficulty: "normal" },
  ],
  낱말: [
    { id: "word_1", content: "가방", difficulty: "easy" },
    { id: "word_2", content: "나무", difficulty: "easy" },
    { id: "word_3", content: "다리", difficulty: "easy" },
    { id: "word_4", content: "라면", difficulty: "normal" },
    { id: "word_5", content: "마을", difficulty: "normal" },
    { id: "word_6", content: "바다", difficulty: "normal" },
    { id: "word_7", content: "사과", difficulty: "normal" },
    { id: "word_8", content: "아이", difficulty: "hard" },
    { id: "word_9", content: "자동차", difficulty: "hard" },
    { id: "word_10", content: "컴퓨터", difficulty: "hard" },
    { id: "word_11", content: "집", difficulty: "easy" },
    { id: "word_12", content: "학교", difficulty: "easy" },
    { id: "word_13", content: "선생님", difficulty: "normal" },
    { id: "word_14", content: "친구", difficulty: "normal" },
    { id: "word_15", content: "놀이터", difficulty: "hard" },
  ],
};

// Utility functions
function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

const CurriculumEditor = ({
  groupId,
  characterId,
  onNavigate,
  chapters,
  onAddChapter,
}) => {
  const renderInPortal = useDraggableInPortal();

  // Mock 캐릭터 데이터 - 실제로는 API에서 가져올 것
  const [character, setCharacter] = useState(null);
  const [chapterList, setChapterList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 새 챕터 생성 상태
  const [newChapterData, setNewChapterData] = useState({
    name: "",
    difficulty: "",
    description: "",
  });

  // 학습 내용 관련 상태
  const [learningContents, setLearningContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAccordionItem, setActiveAccordionItem] = useState("");

  const activityIcons = {
    읽기: BookOpen,
    듣기: Volume2,
    말하기: Mic,
    쓰기: PenTool,
  };

  const learningTypes = ["모음", "자음", "글자", "낱말"];
  const activityTypes = ["읽기", "듣기", "말하기", "쓰기"];

  // Mock 캐릭터 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출
    const mockCharacter = {
      id: characterId,
      name: "한글이",
      nickname: "친근한 한글이",
      curriculum: [
        { chapterId: "chapter-1", order: 0 },
        { chapterId: "chapter-2", order: 1 },
      ],
    };
    setCharacter(mockCharacter);
  }, [characterId]);

  useEffect(() => {
    if (character && chapters) {
      // 캐릭터의 커리큘럼에 포함되지 않은 챕터들만 라이브러리에 표시
      setChapterList(
        chapters.filter(
          (chapter) =>
            !character.curriculum.find(
              (curriculumItem) => curriculumItem.chapterId === chapter.id
            )
        )
      );
      // 캐릭터의 커리큘럼에 포함된 챕터들을 순서대로 표시
      const orderedChapters = character.curriculum
        .sort((a, b) => a.order - b.order)
        .map((curriculumItem) =>
          chapters.find((chapter) => chapter.id === curriculumItem.chapterId)
        )
        .filter((chapter) => chapter !== undefined);
      setSelectedOrder(orderedChapters);
    }
  }, [character, chapters]);

  const currentGroup =
    {
      1: "기초 한글반",
      2: "중급 한글반",
      3: "고급 한글반",
    }[groupId] || "전체";

  const handleBackToCharacter = () => {
    onNavigate({
      section: "groups",
      groupId: groupId,
      characterId: characterId,
      curriculumEditing: false,
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
          id: `character-${characterId}`,
          label: character?.nickname || "캐릭터",
          section: "groups",
          groupId: groupId,
          characterId: characterId,
        },
      ],
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "쉬움":
        return "bg-green-100 text-green-800 border-green-200";
      case "보통":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "어려움":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLearningItemDifficultyColor = (difficulty, isSelected = false) => {
    if (isSelected) {
      switch (difficulty) {
        case "easy":
          return "bg-primary/10 border-primary text-green-700";
        case "normal":
          return "bg-primary/10 border-primary text-yellow-700";
        case "hard":
          return "bg-primary/10 border-primary text-red-700";
        default:
          return "bg-primary/10 border-primary text-gray-700";
      }
    } else {
      switch (difficulty) {
        case "easy":
          return "bg-green-50 border-green-200 text-green-800 hover:bg-green-100";
        case "normal":
          return "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100";
        case "hard":
          return "bg-red-50 border-red-200 text-red-800 hover:bg-red-100";
        default:
          return "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100";
      }
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "모음":
        return "bg-blue-100 text-blue-800";
      case "자음":
        return "bg-purple-100 text-purple-800";
      case "글자":
        return "bg-orange-100 text-orange-800";
      case "낱말":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // 같은 영역 내 정렬
    if (
      source.droppableId === "selected" &&
      source.droppableId === destination.droppableId
    ) {
      setSelectedOrder((prev) =>
        reorder(prev, source.index, destination.index)
      );
      return;
    }

    // 상단 → 하단 (이동)
    if (
      source.droppableId === "list" &&
      destination.droppableId === "selected"
    ) {
      const chapter = chapterList.find((c) => c.id === draggableId);
      if (!chapter) return;

      const newChapterList = [...chapterList];
      const [moveItem] = newChapterList.splice(source.index, 1);
      const newSelectedOrder = [...selectedOrder];
      newSelectedOrder.splice(destination.index, 0, moveItem);

      setSelectedOrder(newSelectedOrder);
      setChapterList(newChapterList);
      return;
    }
  };

  const onRemove = (id) => {
    const removeIndex = selectedOrder.findIndex((item) => item.id === id);
    if (removeIndex < 0) return;

    const newSelectedOrder = [...selectedOrder];
    const [removeItem] = newSelectedOrder.splice(removeIndex, 1);
    const newChapterList = [removeItem, ...chapterList];

    setChapterList(newChapterList);
    setSelectedOrder(newSelectedOrder);
  };

  const addLearningContent = () => {
    const newContent = {
      type: "모음",
      selectedItems: [],
      activities: {},
    };
    const newIndex = learningContents.length;
    setLearningContents([...learningContents, newContent]);
    // 새로 추가된 아이템을 자동으로 열기
    setActiveAccordionItem(`item-${newIndex}`);
  };

  const updateLearningContent = (index, updates) => {
    const updatedContents = [...learningContents];
    updatedContents[index] = {
      ...updatedContents[index],
      ...updates,
    };
    setLearningContents(updatedContents);
  };

  const toggleLearningItem = (contentIndex, itemId) => {
    const updatedContents = [...learningContents];
    const content = updatedContents[contentIndex];
    const currentItems = content.selectedItems || [];

    if (currentItems.includes(itemId)) {
      content.selectedItems = currentItems.filter((id) => id !== itemId);
    } else {
      content.selectedItems = [...currentItems, itemId];
    }

    setLearningContents(updatedContents);
  };

  const updateActivity = (contentIndex, activityType, enabled) => {
    const updatedContents = [...learningContents];
    if (!updatedContents[contentIndex].activities) {
      updatedContents[contentIndex].activities = {};
    }
    updatedContents[contentIndex].activities[activityType] = {
      enabled,
      description: "",
    };
    setLearningContents(updatedContents);
  };

  const removeLearningContent = (index) => {
    setLearningContents(learningContents.filter((_, i) => i !== index));
    // 삭제 후 accordion 상태 초기화
    setActiveAccordionItem("");
  };

  const handleCreateChapter = () => {
    if (!newChapterData.name || !newChapterData.difficulty) {
      return;
    }

    // learningContents를 Chapter 형식에 맞게 변환
    const formattedLearningContents = learningContents.map((content) => ({
      type: content.type,
      selectedItems: content.selectedItems.map((itemId) => ({
        itemId,
        repetitions: 3, // 기본값
        activities: {
          읽기: content.activities.읽기 || { enabled: false, description: "" },
          듣기: content.activities.듣기 || { enabled: false, description: "" },
          말하기: content.activities.말하기 || {
            enabled: false,
            description: "",
          },
          쓰기: content.activities.쓰기 || { enabled: false, description: "" },
        },
      })),
    }));

    const newChapter = {
      id: `chapter-${Date.now()}`,
      name: newChapterData.name,
      difficulty: newChapterData.difficulty,
      description: newChapterData.description,
      learningContents: formattedLearningContents,
      createdDate: new Date().toISOString().split("T")[0],
      isPublished: true,
    };

    onAddChapter(newChapter);
    setChapterList((prev) => [...prev, newChapter]);

    // 상태 초기화
    setNewChapterData({ name: "", difficulty: "", description: "" });
    setLearningContents([]);
    setActiveAccordionItem("");
    setSearchTerm("");
    setIsCreateDialogOpen(false);
  };

  const handleSaveCurriculum = () => {
    if (character) {
      // selectedOrder를 기반으로 커리큘럼 업데이트
      const updatedCurriculum = selectedOrder.map((chapter, index) => ({
        chapterId: chapter.id,
        order: index,
      }));

      const updatedCharacter = {
        ...character,
        curriculum: updatedCurriculum,
      };

      // 실제로는 API 호출로 저장
      console.log("커리큘럼 저장:", updatedCharacter);

      // 캐릭터 상세 페이지로 돌아가기
      handleBackToCharacter();
    }
  };

  if (!character) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToCharacter}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            캐릭터로 돌아가기
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {character.nickname} - 커리큘럼 편집
            </h2>
            <p className="mt-1 text-muted-foreground">
              챕터를 드래그하여 커리큘럼을 구성하세요. 새로운 챕터를 생성할 수도
              있습니다.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>새 챕터 생성</DialogTitle>
                <DialogDescription>
                  새로운 학습 챕터를 생성하고 학습 내용을 구성해보세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* 기본 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>기본 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="chapterName">챕터명</Label>
                        <Input
                          id="chapterName"
                          placeholder="챕터명을 입력하세요"
                          value={newChapterData.name}
                          onChange={(e) =>
                            setNewChapterData({
                              ...newChapterData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">난이도</Label>
                        <Select
                          value={newChapterData.difficulty}
                          onValueChange={(value) =>
                            setNewChapterData({
                              ...newChapterData,
                              difficulty: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="난이도를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="쉬움">쉬움</SelectItem>
                            <SelectItem value="보통">보통</SelectItem>
                            <SelectItem value="어려움">어려움</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">챕터 설명</Label>
                      <Input
                        id="description"
                        placeholder="챕터에 대한 간단한 설명을 입력하세요"
                        value={newChapterData.description}
                        onChange={(e) =>
                          setNewChapterData({
                            ...newChapterData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 학습 내용 구성 */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>학습 내용 구성</CardTitle>
                    <Button onClick={addLearningContent} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      학습 내용 추가
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {learningContents.length > 0 ? (
                      <Accordion
                        type="single"
                        collapsible
                        value={activeAccordionItem}
                        onValueChange={setActiveAccordionItem}
                        className="space-y-4"
                      >
                        {learningContents.map((content, contentIndex) => {
                          const getContentSummary = () => {
                            const selectedCount =
                              content.selectedItems?.length || 0;
                            const activitiesCount = Object.values(
                              content.activities
                            ).filter((activity) => activity?.enabled).length;
                            return `${content.type} • ${selectedCount}개 선택 • ${activitiesCount}개 활동`;
                          };

                          return (
                            <AccordionItem
                              key={contentIndex}
                              value={`item-${contentIndex}`}
                              className="border rounded-lg"
                            >
                              <div className="flex items-center">
                                <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-medium">
                                      학습 내용 {contentIndex + 1}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getContentSummary()}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <div className="px-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLearningContent(contentIndex);
                                    }}
                                    className="opacity-60 hover:opacity-100"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    {/* 학습 유형 선택 */}
                                    <div className="space-y-2">
                                      <Label>학습 유형</Label>
                                      <Select
                                        value={content.type}
                                        onValueChange={(value) => {
                                          updateLearningContent(contentIndex, {
                                            type: value,
                                            selectedItems: [],
                                          });
                                          setSearchTerm("");
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {learningTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {/* 활동 구성 */}
                                    <div className="space-y-3">
                                      <Label>활동 구성</Label>
                                      <div className="grid grid-cols-2 gap-3">
                                        {activityTypes.map((type) => {
                                          const Icon = activityIcons[type];
                                          return (
                                            <div
                                              key={type}
                                              className="flex items-center space-x-2"
                                            >
                                              <Checkbox
                                                id={`${contentIndex}-${type}`}
                                                checked={
                                                  content.activities[type]
                                                    ?.enabled || false
                                                }
                                                onCheckedChange={(checked) =>
                                                  updateActivity(
                                                    contentIndex,
                                                    type,
                                                    !!checked
                                                  )
                                                }
                                              />
                                              <Label
                                                htmlFor={`${contentIndex}-${type}`}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <Icon className="w-4 h-4" />
                                                {type}
                                              </Label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 학습 내용 선택 */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label>학습 내용 선택</Label>
                                      <div className="text-sm text-muted-foreground">
                                        {content.selectedItems?.length || 0}개
                                        선택됨
                                      </div>
                                    </div>

                                    <div className="p-4 border rounded-lg bg-muted/20">
                                      {content.type === "낱말" ? (
                                        <div className="space-y-4">
                                          <div className="relative">
                                            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                                            <Input
                                              placeholder="낱말 검색..."
                                              value={searchTerm}
                                              onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                              }
                                              className="pl-10"
                                            />
                                          </div>

                                          <Tabs
                                            defaultValue="easy"
                                            className="w-full"
                                          >
                                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                              <TabsTrigger
                                                value="easy"
                                                className="gap-2"
                                              >
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                쉬움
                                              </TabsTrigger>
                                              <TabsTrigger
                                                value="normal"
                                                className="gap-2"
                                              >
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                보통
                                              </TabsTrigger>
                                              <TabsTrigger
                                                value="hard"
                                                className="gap-2"
                                              >
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                어려움
                                              </TabsTrigger>
                                            </TabsList>

                                            {["easy", "normal", "hard"].map(
                                              (difficulty) => (
                                                <TabsContent
                                                  key={difficulty}
                                                  value={difficulty}
                                                  className="space-y-3"
                                                >
                                                  <div className="flex flex-wrap gap-2 overflow-y-auto max-h-48">
                                                    {(
                                                      learningItemsData[
                                                        content.type
                                                      ] || []
                                                    )
                                                      .filter(
                                                        (item) =>
                                                          item.difficulty ===
                                                          difficulty
                                                      )
                                                      .filter(
                                                        (item) =>
                                                          searchTerm === "" ||
                                                          item.content
                                                            .toLowerCase()
                                                            .includes(
                                                              searchTerm.toLowerCase()
                                                            )
                                                      )
                                                      .map((item) => {
                                                        const isSelected =
                                                          content.selectedItems?.includes(
                                                            item.id
                                                          ) || false;
                                                        return (
                                                          <div
                                                            key={item.id}
                                                            className={`
                                                            p-3 rounded-md border-2 cursor-pointer transition-all text-center
                                                            ${
                                                              isSelected
                                                                ? `scale-105 ${getLearningItemDifficultyColor(
                                                                    item.difficulty,
                                                                    true
                                                                  )}`
                                                                : getLearningItemDifficultyColor(
                                                                    item.difficulty,
                                                                    false
                                                                  )
                                                            }
                                                          `}
                                                            onClick={() =>
                                                              toggleLearningItem(
                                                                contentIndex,
                                                                item.id
                                                              )
                                                            }
                                                          >
                                                            <div className="text-lg font-medium">
                                                              {item.content}
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                  </div>

                                                  {(
                                                    learningItemsData[
                                                      content.type
                                                    ] || []
                                                  )
                                                    .filter(
                                                      (item) =>
                                                        item.difficulty ===
                                                        difficulty
                                                    )
                                                    .filter(
                                                      (item) =>
                                                        searchTerm === "" ||
                                                        item.content
                                                          .toLowerCase()
                                                          .includes(
                                                            searchTerm.toLowerCase()
                                                          )
                                                    ).length === 0 && (
                                                    <div className="py-8 text-center text-muted-foreground">
                                                      {searchTerm
                                                        ? "검색 결과가 없습니다."
                                                        : "해당 난이도의 학습 내용이 없습니다."}
                                                    </div>
                                                  )}
                                                </TabsContent>
                                              )
                                            )}
                                          </Tabs>
                                        </div>
                                      ) : (
                                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-48">
                                          {(
                                            learningItemsData[content.type] ||
                                            []
                                          ).map((item) => {
                                            const isSelected =
                                              content.selectedItems?.includes(
                                                item.id
                                              ) || false;
                                            return (
                                              <div
                                                key={item.id}
                                                className={`
                                                  p-3 rounded-md border-2 cursor-pointer transition-all text-center
                                                  ${
                                                    isSelected
                                                      ? "scale-105 bg-primary/10 border-primary"
                                                      : "bg-background border-border hover:border-primary/50"
                                                  }
                                                `}
                                                onClick={() =>
                                                  toggleLearningItem(
                                                    contentIndex,
                                                    item.id
                                                  )
                                                }
                                              >
                                                <div className="text-lg font-medium">
                                                  {item.content}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        학습 내용을 추가해주세요
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <div className="flex w-full gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreateChapter}
                    disabled={
                      !newChapterData.name || !newChapterData.difficulty
                    }
                  >
                    생성 후 추가
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewChapterData({
                        name: "",
                        difficulty: "",
                        description: "",
                      });
                      setLearningContents([]);
                      setActiveAccordionItem("");
                      setSearchTerm("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSaveCurriculum}>커리큘럼 저장</Button>
        </div>
      </div>

      {/* 커리큘럼 편집 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            커리큘럼 편집
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-8">
              {/* 챕터 라이브러리 */}
              <div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">사용 가능한 챕터</h3>
                    <Badge variant="secondary" className="text-xs">
                      {chapterList.length}개
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />새 챕터 생성
                  </Button>
                </div>
                <Droppable
                  droppableId="list"
                  type="CARD"
                  direction="horizontal"
                >
                  {(dropProvided, dropSnapshot) => (
                    <div
                      ref={dropProvided.innerRef}
                      {...dropProvided.droppableProps}
                      className={`flex gap-3 min-h-32 p-4 border rounded-lg transition-colors overflow-auto ${
                        dropSnapshot.isDraggingOver
                          ? "bg-muted/50 border-primary"
                          : "bg-muted/20"
                      }`}
                    >
                      {chapterList.length === 0 && (
                        <div className="flex items-center justify-center w-full text-muted-foreground">
                          사용 가능한 챕터가 없습니다. 새 챕터를 생성하거나
                          커리큘럼에서 챕터를 제거해보세요.
                        </div>
                      )}
                      {chapterList.map((chapter, index) => (
                        <Draggable
                          key={chapter.id}
                          draggableId={chapter.id}
                          index={index}
                        >
                          {renderInPortal((dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`${
                                dragSnapshot.isDragging
                                  ? "opacity-70 rotate-3 scale-105"
                                  : ""
                              }`}
                            >
                              <Card className="w-64 transition-shadow cursor-grab hover:shadow-md">
                                <CardHeader className="p-4">
                                  <CardTitle className="text-sm">
                                    {chapter.name}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {chapter.description}
                                  </p>
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getDifficultyColor(
                                        chapter.difficulty
                                      )}`}
                                    >
                                      {chapter.difficulty}
                                    </Badge>
                                    {chapter.learningContents
                                      .slice(0, 2)
                                      .map((content, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className={`text-xs ${getContentTypeColor(
                                            content.type
                                          )}`}
                                        >
                                          {content.type}
                                        </Badge>
                                      ))}
                                  </div>
                                </CardHeader>
                              </Card>
                            </div>
                          ))}
                        </Draggable>
                      ))}
                      {dropProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* 현재 커리큘럼 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">현재 커리큘럼</h3>
                  <Badge variant="secondary" className="text-xs">
                    {selectedOrder.length}개
                  </Badge>
                </div>
                <Droppable
                  droppableId="selected"
                  type="CARD"
                  direction="horizontal"
                >
                  {(dropProvided, dropSnapshot) => (
                    <div
                      ref={dropProvided.innerRef}
                      {...dropProvided.droppableProps}
                      className={`flex gap-3 min-h-32 p-4 border rounded-lg transition-colors overflow-auto ${
                        dropSnapshot.isDraggingOver
                          ? "bg-primary/5 border-primary"
                          : "bg-background"
                      }`}
                    >
                      {selectedOrder.length === 0 && (
                        <div className="flex items-center justify-center w-full text-muted-foreground">
                          위의 챕터를 드래그하여 커리큘럼에 추가하세요.
                        </div>
                      )}
                      {selectedOrder.map((curriculumChapter, index) => (
                        <Draggable
                          key={curriculumChapter.id}
                          draggableId={curriculumChapter.id}
                          index={index}
                        >
                          {renderInPortal((dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`${
                                dragSnapshot.isDragging
                                  ? "opacity-70 rotate-3 scale-105"
                                  : ""
                              }`}
                            >
                              <Card className="relative w-64 transition-shadow cursor-grab hover:shadow-md">
                                <CardHeader className="p-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                          variant="outline"
                                          className="font-mono text-xs"
                                        >
                                          #{index + 1}
                                        </Badge>
                                        <CardTitle className="text-sm truncate">
                                          {curriculumChapter.name}
                                        </CardTitle>
                                      </div>
                                      <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                                        {curriculumChapter.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getDifficultyColor(
                                            curriculumChapter.difficulty
                                          )}`}
                                        >
                                          {curriculumChapter.difficulty}
                                        </Badge>
                                        {curriculumChapter.learningContents
                                          .slice(0, 2)
                                          .map((content, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className={`text-xs ${getContentTypeColor(
                                                content.type
                                              )}`}
                                            >
                                              {content.type}
                                            </Badge>
                                          ))}
                                        {curriculumChapter.learningContents
                                          .length > 2 && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            +
                                            {curriculumChapter.learningContents
                                              .length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(curriculumChapter.id);
                                      }}
                                      className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </CardHeader>
                              </Card>
                            </div>
                          ))}
                        </Draggable>
                      ))}
                      {dropProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
          <div className="my-2 text-sm text-muted-foreground">
            총 {selectedOrder.length}개 챕터가 커리큘럼에 포함됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurriculumEditor;
