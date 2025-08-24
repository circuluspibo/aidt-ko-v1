import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/card";
import { BlurFade } from "../components/magicui/blur-fade";
import { TARGETS } from "../utils/globals";
import StepDialog from "@/components/StepDialog";
import { get } from "@/api";

function Target() {
  const { character } = useParams();
  const navigate = useNavigate();
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
  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
        <header className="text-2xl font-extrabold col-span-full md:text-5xl text-start">
          📚 무엇을 배울까요?
        </header>
        <p className="text-xl font-semibold col-span-full md:text-4xl">
          배우고 싶은 한글을 선택해주세요.
        </p>
        {!isPending && !error && (
          <div className="grid flex-grow gap-2 p-2 tp:grid-cols-2 tp:grid-rows-2 tl5:grid-cols-4 tl5:grid-rows-1 lg:gap-4 tl6:gap-4 tl6:p-4">
            {targetData &&
              targetData.map((item, i) => (
                <BlurFade
                  delay={0.25 * i}
                  key={i}
                  inView
                  className="flex flex-col items-center self-stretch justify-center col-span-1 gap-2 tl6:p-2"
                >
                  <Card
                    className={`flex p-2 flex-col justify-center items-center gap-2 flex-grow self-stretch col-span-1 shadow-xl ${
                      selected?.name === item.name
                        ? `shadow-2xl border bg-${item.name}`
                        : `hover:shadow-2xl bg-${item.name}/50 shadow-inner border-4 border-${item.name}`
                    }
                  `}
                    onClick={() => onCardClick(item)}
                  >
                    <div className="flex items-center self-stretch justify-center flex-grow gap-2 p-2">
                      <div className="flex flex-col items-center self-stretch justify-center flex-grow gap-4 py-2 md:py-6">
                        <div className="flex items-center justify-center w-full">
                          <div className="w-24 h-24 tl6:w-28 tl6:h-28 aspect-square">
                            <img
                              src={`/images/${item.name}.svg`}
                              alt={item.name}
                              className="aspect-square"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center text-center opacity-80 tl6:text-xl">
                          <p>{item.description[0]}</p>
                          <p>{item.description[1]}</p>
                        </div>
                        <div
                          className={`text-4xl md:text-6xl tl6:text-6xl font-extrabold text-center h-[4rem] md:h-[7.5rem] tl6:h-[7.5rem] leading-none flex flex-col justify-center self-stretch mix-blend-difference text-${item.name}/95`}
                        >
                          {item.title}
                        </div>
                      </div>
                    </div>
                  </Card>
                </BlurFade>
              ))}
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
