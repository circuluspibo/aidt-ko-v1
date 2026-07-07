import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { TARGETS } from '@/utils/globals';

// 커리큘럼 설정 변경/삭제처럼 학생의 진행 정보·학습 기록에 영향을 주는 작업 전
// 교사에게 경고하는 확인 모달. 문구는 상황별로 props 로 주입한다.
// 설정 변경: 서버가 HTTP 409 + requireConfirm 으로 내려준 affectedChapters 를 근거로 노출.
const CurriculumChangeConfirmModal = ({
  open,
  onOpenChange,
  affectedChapters = [],
  onConfirm,
  onCancel,
  isSaving = false,
  title = '학습 기록이 초기화됩니다',
  description = '이 학생이 이미 학습 중이거나 완료한 챕터입니다. 설정을 변경하면 해당 챕터의 진행 정보와 학습 기록이 초기화되고 처음부터 다시 학습해야 합니다. 계속하시겠습니까?',
  confirmLabel = '계속 진행',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/40 backdrop-blur" />
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base leading-relaxed text-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {affectedChapters.length > 0 && (
          <div className="mt-2 divide-y overflow-hidden rounded-lg border">
            {affectedChapters.map((chapter) => (
              <div
                key={chapter.chapterId}
                className="flex items-center justify-between gap-2 px-4 py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">
                    {TARGETS[chapter.target]
                      ? `${TARGETS[chapter.target]} 학습`
                      : '학습 챕터'}
                  </span>
                </div>
                {typeof chapter.sessionCount === 'number' && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    세션 {chapter.sessionCount}개
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="mr-1 h-4 w-4" />
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isSaving}
            autoFocus
          >
            {isSaving ? '처리 중…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CurriculumChangeConfirmModal;
