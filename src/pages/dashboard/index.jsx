import { CharacterManagement } from "@/components/dashboard/CharacterManagement";
import CurriculumEditor from "@/components/dashboard/CurriculumEditor";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { GroupManagement } from "@/components/dashboard/GroupManagement";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StudentManagement } from "@/components/dashboard/StudentManagement";
import { useState } from "react";

// 초기 챕터 데이터
const initialChapters = [
  {
    id: "chapter-1",
    name: "한글의 기초 - 모음 익히기",
    difficulty: "쉬움",
    description: "ㅏ, ㅑ, ㅓ, ㅕ 등 기본 모음을 학습합니다.",
    learningContents: [
      {
        type: "모음",
        selectedItems: [
          {
            itemId: "vowel_1",
            repetitions: 3,
            activities: {
              읽기: { enabled: true, description: "모음 소리 따라 읽기" },
              듣기: { enabled: true, description: "모음 소리 구분하기" },
              말하기: { enabled: true, description: "모음 소리 따라 말하기" },
              쓰기: { enabled: true, description: "모음 쓰기 연습" },
            },
          },
          {
            itemId: "vowel_7",
            repetitions: 2,
            activities: {
              읽기: { enabled: true, description: "모음 소리 따라 읽기" },
              듣기: { enabled: true, description: "모음 소리 구분하기" },
              말하기: { enabled: false, description: "" },
              쓰기: { enabled: true, description: "모음 쓰기 연습" },
            },
          },
        ],
      },
    ],
    createdDate: "2024-01-15",
    isPublished: true,
  },
  {
    id: "chapter-2",
    name: "자음과 친해지기",
    difficulty: "쉬움",
    description: "ㄱ, ㄴ, ㄷ, ㄹ 등 기본 자음을 학습합니다.",
    learningContents: [
      {
        type: "자음",
        selectedItems: [
          {
            itemId: "consonant_1",
            repetitions: 3,
            activities: {
              읽기: { enabled: true, description: "자음 소리 따라 읽기" },
              듣기: { enabled: true, description: "자음 소리 구분하기" },
              말하기: { enabled: true, description: "자음 소리 따라 말하기" },
              쓰기: { enabled: true, description: "자음 쓰기 연습" },
            },
          },
        ],
      },
    ],
    createdDate: "2024-01-20",
    isPublished: true,
  },
  {
    id: "chapter-3",
    name: "첫 번째 단어 만들기",
    difficulty: "보통",
    description: "간단한 두 글자 단어를 만들어 봅시다.",
    learningContents: [
      {
        type: "글자",
        selectedItems: [
          {
            itemId: "letter_1",
            repetitions: 2,
            activities: {
              읽기: { enabled: true, description: "글자 소리내어 읽기" },
              듣기: { enabled: true, description: "글자 소리 듣고 구분하기" },
              말하기: { enabled: false, description: "" },
              쓰기: { enabled: true, description: "글자 따라 쓰기" },
            },
          },
        ],
      },
    ],
    createdDate: "2024-01-25",
    isPublished: true,
  },
  {
    id: "chapter-4",
    name: "동물 친구들의 이름",
    difficulty: "보통",
    description: "동물 이름을 통해 낱말을 익혀봅시다.",
    learningContents: [
      {
        type: "낱말",
        selectedItems: [
          {
            itemId: "word_1",
            repetitions: 4,
            activities: {
              읽기: { enabled: true, description: "동물 이름 읽기" },
              듣기: { enabled: true, description: "동물 소리와 이름 연결하기" },
              말하기: { enabled: true, description: "동물 이름 말하기" },
              쓰기: { enabled: true, description: "동물 이름 쓰기" },
            },
          },
        ],
      },
    ],
    createdDate: "2024-02-01",
    isPublished: true,
  },
  {
    id: "chapter-5",
    name: "복잡한 모음 조합",
    difficulty: "어려움",
    description: "ㅘ, ㅙ, ㅚ 등 복합 모음을 학습합니다.",
    learningContents: [
      {
        type: "모음",
        selectedItems: [
          {
            itemId: "vowel_1",
            repetitions: 5,
            activities: {
              읽기: { enabled: true, description: "복합 모음 읽기" },
              듣기: { enabled: true, description: "복합 모음 소리 구분하기" },
              말하기: { enabled: true, description: "복합 모음 발음하기" },
              쓰기: { enabled: true, description: "복합 모음 쓰기" },
            },
          },
        ],
      },
    ],
    createdDate: "2024-02-10",
    isPublished: true,
  },
  {
    id: "chapter-6",
    name: "쌍자음 조합",
    difficulty: "어려움",
    description: "ㄲ, ㄸ, ㅃ, ㅆ, ㅉ 쌍자음을 학습합니다.",
    learningContents: [
      {
        type: "자음",
        selectedItems: [
          {
            itemId: "consonant_11",
            repetitions: 5,
            activities: {
              읽기: { enabled: true, description: "쌍자음 읽기" },
              듣기: { enabled: true, description: "쌍자음 소리 구분하기" },
              말하기: { enabled: true, description: "쌍자음 발음하기" },
              쓰기: { enabled: true, description: "쌍자음 쓰기" },
            },
          },
        ],
      },
    ],
    createdDate: "2024-02-10",
    isPublished: true,
  },
];

export default function DashboardIndex() {
  const [navigationState, setNavigationState] = useState({
    section: "dashboard",
    breadcrumb: [{ id: "dashboard", label: "Dashboard", section: "dashboard" }],
  });

  // 중앙 관리되는 챕터 데이터
  const [chapters, setChapters] = useState(initialChapters);

  const navigateTo = (newState) => {
    setNavigationState((prev) => ({
      ...prev,
      ...newState,
      breadcrumb: newState.breadcrumb || prev.breadcrumb,
    }));
  };

  // 챕터 관련 함수들
  const updateChapter = (updatedChapter) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === updatedChapter.id ? updatedChapter : chapter
      )
    );
  };

  const addChapter = (newChapter) => {
    setChapters((prev) => [...prev, newChapter]);
  };

  const renderContent = () => {
    const { section, groupId, characterId, curriculumEditing } =
      navigationState;

    switch (section) {
      case "dashboard":
        return <Dashboard onNavigate={navigateTo} />;
      case "groups":
        if (curriculumEditing && characterId && groupId) {
          // 커리큘럼 편집 페이지
          return (
            <CurriculumEditor
              groupId={groupId}
              characterId={characterId}
              onNavigate={navigateTo}
              chapters={chapters}
              onUpdateChapter={updateChapter}
              onAddChapter={addChapter}
            />
          );
        } else if (characterId && groupId) {
          // 캐릭터가 선택된 경우 - 캐릭터별 커리큘럼 관리 페이지 표시
          return (
            <CharacterManagement
              groupId={groupId}
              characterId={characterId}
              onNavigate={navigateTo}
              chapters={chapters}
            />
          );
        } else if (groupId) {
          // 그룹이 선택된 경우 - 해당 그룹의 캐릭터 관리 페이지 표시
          return (
            <CharacterManagement
              groupId={groupId}
              onNavigate={navigateTo}
              chapters={chapters}
            />
          );
        } else {
          // 아무것도 선택되지 않은 경우 - 그룹 관리 페이지 표시
          return <GroupManagement onNavigate={navigateTo} />;
        }
      case "students":
        return <StudentManagement onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar navigationState={navigationState} onNavigate={navigateTo} />
      <main className="pt-16 pl-64">
        <div className="p-6 mx-auto max-w-7xl">{renderContent()}</div>
      </main>
    </div>
  );
}
