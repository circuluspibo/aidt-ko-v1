import {
  ChevronRight,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function Sidebar({ navigationState, onNavigate }) {
  const handleBreadcrumbClick = (breadcrumbItem) => {
    const { section, groupId, characterId, chapterId } = breadcrumbItem;

    // 클릭한 항목까지의 breadcrumb만 유지
    const breadcrumbIndex = navigationState.breadcrumb.findIndex(
      (item) => item.id === breadcrumbItem.id
    );
    const newBreadcrumb = navigationState.breadcrumb.slice(
      0,
      breadcrumbIndex + 1
    );

    onNavigate({
      section,
      groupId,
      characterId,
      chapterId,
      breadcrumb: newBreadcrumb,
    });
  };

  const handleMainMenuClick = (section) => {
    const breadcrumbMap = {
      dashboard: [
        { id: "dashboard", label: "Dashboard", section: "dashboard" },
      ],
      groups: [
        { id: "dashboard", label: "Dashboard", section: "dashboard" },
        { id: "groups", label: "학습 그룹", section: "groups" },
      ],
      students: [
        { id: "dashboard", label: "Dashboard", section: "dashboard" },
        { id: "students", label: "학습 현황", section: "students" },
      ],
    };

    onNavigate({
      section,
      groupId: undefined,
      characterId: undefined,
      curriculumEditing: undefined,
      breadcrumb: breadcrumbMap[section],
    });
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      action: () => handleMainMenuClick("dashboard"),
    },
    {
      id: "groups",
      label: "학습 그룹",
      icon: Users,
      action: () => handleMainMenuClick("groups"),
    },
    {
      id: "students",
      label: "학습 현황",
      icon: GraduationCap,
      action: () => handleMainMenuClick("students"),
    },
  ];

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Breadcrumb Navigation */}
        {navigationState.breadcrumb.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-sidebar-foreground/70">
              경로
            </h3>
            <div className="flex flex-col space-y-1">
              {navigationState.breadcrumb.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`justify-start h-auto p-1 text-sm ${
                      index === navigationState.breadcrumb.length - 1
                        ? "text-sidebar-primary font-medium"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                    }`}
                    onClick={() => handleBreadcrumbClick(item)}
                  >
                    {item.label}
                  </Button>
                  {index < navigationState.breadcrumb.length - 1 && (
                    <ChevronRight className="flex-shrink-0 w-3 h-3 mx-1 text-sidebar-foreground/40" />
                  )}
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-sidebar-foreground/70">
            메인 메뉴
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.id === "dashboard" &&
                  navigationState.section === "dashboard") ||
                (item.id === "groups" &&
                  navigationState.section === "groups") ||
                (item.id === "students" &&
                  navigationState.section === "students");

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className="justify-start w-full gap-3 h-9"
                  onClick={item.action}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Context-specific navigation */}
        {navigationState.section === "groups" && (
          <div className="space-y-2">
            <Separator />
            <h3 className="text-sm font-medium text-sidebar-foreground/70">
              빠른 실행
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full gap-2 text-sm"
                onClick={() => handleMainMenuClick("groups")}
              >
                <Users className="w-3 h-3" />
                모든 그룹 보기
              </Button>
              {navigationState.groupId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full gap-2 text-sm"
                  onClick={() =>
                    onNavigate({
                      section: "groups",
                      groupId: navigationState.groupId,
                      characterId: undefined,
                      curriculumEditing: undefined,
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
                          id: `group-${navigationState.groupId}`,
                          label: "그룹 캐릭터",
                          section: "groups",
                          groupId: navigationState.groupId,
                        },
                      ],
                    })
                  }
                >
                  <User className="w-3 h-3" />
                  그룹 캐릭터 관리
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Current Context Info */}
        {(navigationState.groupId ||
          navigationState.characterId ||
          navigationState.curriculumEditing) && (
          <div className="space-y-2">
            <Separator />
            <h3 className="text-sm font-medium text-sidebar-foreground/70">
              현재 위치
            </h3>
            <div className="space-y-1 text-xs text-sidebar-foreground/60">
              {navigationState.groupId && (
                <div>그룹 ID: {navigationState.groupId}</div>
              )}
              {navigationState.characterId && (
                <div>캐릭터 ID: {navigationState.characterId}</div>
              )}
              {navigationState.curriculumEditing && <div>커리큘럼 편집 중</div>}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
