import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/card";
import { BlurFade } from "../components/magicui/blur-fade";
import { TARGETS } from "../utils/globals";
import StepDialog from "@/components/StepDialog";
import { get } from "@/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import MenuCard from "@/components/MenuCard";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function Target() {
  const { character } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selected, setSelectedCard] = useState(null);
  const [open, setOpen] = useState(false);
  const {
    data: targetData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["character", "target", character],
    queryFn: async () => {
      const result = await get(`character/${character}/curriculum`);
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        return response.data.map((item) => ({
          ...item.target,
          chapterId: item.chapterId,
        }));
      }
    },
  });
  const onCardClick = (name) => {
    setSelectedCard(name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate(
      `/learn/${character}/${selected.chapterId}?target=${selected.name}`
    );
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setOpen(false);
  };

  const handlePrev = () => {
    logout();
  };

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] overflow-hidden md:gap-4 px-6 py-4 w-full h-full">
        <header className="text-2xl font-extrabold col-span-full md:text-5xl text-start">
          <button
            className="w-12 h-12 p-1 mr-1 bg-transparent rounded-full hover:bg-black/10"
            onClick={handlePrev}
          >
            <LogOut className="w-8 h-8 -scale-x-100" />
          </button>
          📚 무엇을 배울까요?
        </header>
        <p className="text-xl font-semibold col-span-full md:text-4xl">
          배우고 싶은 한글을 선택해주세요.
        </p>
        {!isPending && !error && (
          <div className="flex flex-row w-full overflow-auto fcol-span-full whitespace-nowrap">
            <div
              className={`flex h-full space-x-1 ${
                targetData.length > 4 ? "w-max" : "w-full"
              }`}
            >
              {targetData &&
                targetData.map((item, i) => (
                  <MenuCard
                    key={`target-${i}`}
                    index={i}
                    item={item}
                    className={
                      selected?.name === item.name
                        ? `shadow-2xl border bg-${item.name}`
                        : `hover:shadow-2xl bg-${item.name}/50 shadow-inner border-4 border-${item.name}`
                    }
                    textcolor={`mix-blend-difference text-${item.name}/95`}
                    onCardClick={onCardClick}
                    selected={selected}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      <StepDialog
        open={open}
        setOpen={setOpen}
        title={`${TARGETS[selected?.name]}을(를) 학습해 볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
export default Target;
