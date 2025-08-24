import { Card } from "../components/ui/card";
import { BlurFade } from "../components/magicui/blur-fade";
import { useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { COLORS, TARGETS, METHODS, getPrevPath } from "../utils/globals";
import StepDialog from "@/components/StepDialog";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/api";

function Method() {
  const location = useLocation();
  const { character, chapter } = useParams();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");

  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [open, setOpen] = useState(false);
  const {
    data: methodData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["character", "method", character, chapter],
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
        const item = response.data.find((item) => item.chapterId === chapter);
        if (item) {
          return item.methods;
        }
      }
    },
  });

  const onCardClick = (name) => {
    setSelectedCard(name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (target === "word") {
      navigate(`/learn/${character}/${target}/${selectedCard}?repeat=1,3`);
    } else {
      navigate(`/learn/${character}/${chapter}/${selectedCard}`);
    }
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setOpen(false);
  };

  const handleTargetChange = (e) => {
    if (e.target.value === "prev") {
      navigate(`${getPrevPath(location.pathname)}`);
    } else {
      navigate(`${location.pathname}?target=${e.target.value}`);
    }
  };

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
        <header className="text-2xl font-extrabold col-span-full md:text-5xl text-start">
          {`🎯 `}
          <select
            defaultValue={target}
            className="w-20 bg-transparent md:w-[106px]"
            onChange={handleTargetChange}
          >
            <option value="prev">학습 대상 변경</option>
            <option value="vowel">모음</option>
            <option value="consonant">자음</option>
            <option value="letter">글자</option>
            <option value="word">낱말</option>
          </select>
          {target === "word" ? "를" : "을"} 어떻게 배울까요?
        </header>
        <p className="text-xl font-semibold col-span-full md:text-4xl">
          재미있게 배울 방법을 선택해주세요.
        </p>
        {!isPending && !error && (
          <div className="grid flex-grow gap-2 p-2 tp:grid-cols-2 tp:grid-rows-2 tl5:grid-cols-4 tl5:grid-rows-1 lg:gap-4 tl6:gap-4 tl6:p-4">
            {methodData &&
              methodData.map((item, i) => (
                <BlurFade
                  delay={0.25 * i}
                  key={i}
                  inView
                  className="flex flex-col items-center self-stretch justify-center col-span-1 gap-2 tl6:p-2"
                >
                  <Card
                    className={`flex p-2 flex-col justify-center items-center gap-2 flex-grow self-stretch col-span-1 transition-all duration-300 cursor-pointer shadow-xl
                     ${
                       selectedCard === item.name
                         ? `shadow-2xl border bg-${COLORS[item.name]}-400`
                         : `hover:shadow-2xl bg-${
                             COLORS[item.name]
                           }-100 shadow-inner border-4 border-${
                             COLORS[item.name]
                           }-400`
                     }
                  `}
                    onClick={() => onCardClick(item.name)}
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
                          className={`text-4xl md:text-6xl tl6:text-6xl font-extrabold text-center h-[4rem] md:h-[7.5rem] tl6:h-[7.5rem] leading-none flex flex-col justify-center self-stretch text-${
                            COLORS[item.name]
                          }-500`}
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
        title={`${TARGETS[target]} ${METHODS[selectedCard]} 학습을 시작해 볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
export default Method;
