import { del } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon, CheckCircle2Icon, Trash2 } from "lucide-react";
import { useState } from "react";
const CharacterDeleteDialog = ({
  open,
  character,
  onOpenChange,
  onDelete,
  onClose,
}) => {
  const [type, setType] = useState(null);
  const { mutate: deleteCharacter } = useMutation({
    mutationKey: ["learning", "group", "character", "delete", character?._id],
    mutationFn: async () => {
      const res = await del(`character/${character?._id}`);
      if (res?.error) throw Error(res.error);
      return res.result;
    },
    onSettled: (data, error) => {
      if (error) {
        setType("destructive");
      } else {
        setType("success");
        setTimeout(() => {
          onDelete();
        }, 1500);
      }
    },
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>캐릭터 삭제</DialogTitle>
          <DialogDescription className="py-2 text-base">
            <span className="font-bold">{character?.nickname}</span>
            <span>{` 캐릭터를 삭제하시겠습니까?`}</span>
          </DialogDescription>
        </DialogHeader>
        {type && (
          <Alert variant={type}>
            {type === "destructive" ? (
              <AlertCircleIcon />
            ) : (
              <CheckCircle2Icon />
            )}
            <AlertTitle>
              {type === "destructive" ? "캐릭터 삭제 실패" : "캐릭터 삭제 성공"}
            </AlertTitle>
            <AlertDescription>
              {`${character?.nickname} 캐릭터 ${
                type === "destructive"
                  ? "삭제에 실패했습니다."
                  : "가 삭제되었습니다."
              }`}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={deleteCharacter}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterDeleteDialog;
