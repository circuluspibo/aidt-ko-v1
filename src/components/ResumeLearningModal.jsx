/* eslint-disable react-hooks/exhaustive-deps */
import { useSessionStore } from "@/hook/useSessionStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { X, Circle, RefreshCcw } from "lucide-react";
import { TARGETS, METHODS } from "@/utils/globals";

const ResumeLearningModal = ({ target, method }) => {
  const { getAllProgress, clearSessionFor } = useSessionStore();
  const [open, setOpen] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const all = getAllProgress();
    if (all.length > 0) {
      if (target && method) {
        const lastOne = all.filter(
          (item) => item?.target === target && item?.method === method
        );
        setLastSession(lastOne[0]);
      } else if (target) {
        const lastOne = all.filter((item) => item?.target === target);
        setLastSession(lastOne[0]);
      } else {
        // 가장 최근 학습만 골라서 표시 (updatedAt 기준)
        setLastSession(all[0]);
      }
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const all = getAllProgress();
    if (all.length > 0) {
      let lastOne;
      if (target && method) {
        lastOne = all.filter(
          (item) => item?.target === target && item?.method === method
        );
      } else if (target) {
        lastOne = all.filter((item) => item?.target === target);
      }
      if (lastOne?.length) {
        setLastSession(lastOne[0]);
        setOpen(true);
      }
    }
  }, [method, target]);

  const onCancel = () => {
    setOpen(false);
  };

  const onRestart = () => {
    const { target: t, method: m } = lastSession;
    clearSessionFor(t, m);
    setOpen(false);
  };

  const onResume = () => {
    const { character, target: t, method: m } = lastSession;
    navigate(`/${character}/${t}/${m}`);
    setOpen(false);
  };

  if (!open || !lastSession) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="backdrop-blur bg-white/95" />
      <DialogContent className="min-w-[340px] md:min-w-[480px] max-w-4xl py-12 px-8 md:px-16 rounded-3xl shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="mb-6 text-3xl font-extrabold text-center md:text-4xl">
            이전 학습을 이어하시겠습니까?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-2xl text-center md:text-3xl">
          {`${TARGETS[lastSession.target]} - ${
            METHODS[lastSession.method]
          } - "${lastSession.letter}" 학습`}
        </DialogDescription>
        <DialogFooter className="flex flex-row justify-center gap-6 mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center w-40 h-24 gap-2 text-2xl font-bold rounded-2xl"
            onClick={onCancel}
          >
            <X className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span>닫기</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex items-center justify-center w-40 h-24 gap-2 text-2xl font-bold tracking-tighter rounded-2xl"
            onClick={onRestart}
            autoFocus
          >
            <RefreshCcw className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span className="">새로 시작</span>
          </Button>
          <Button
            type="button"
            className="flex items-center justify-center w-40 h-24 gap-2 text-2xl font-bold rounded-2xl"
            onClick={onResume}
            autoFocus
          >
            <Circle className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span>이어하기</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeLearningModal;
