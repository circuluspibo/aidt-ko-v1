import { Card } from "../components/ui/card";
import { BlurFade } from "../components/magicui/blur-fade";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import consonant from "../assets/consonant.svg";
import vowel from "../assets/vowel.svg";
import syllable from "../assets/syllable.svg";
import word from "../assets/word.svg";
import { TARGETS } from "../utils/globals";
import StepDialog from "@/components/StepDialog";

function Target() {
  const { character } = useParams();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [open, setOpen] = useState(false);

  const onCardClick = (name) => {
    setSelectedCard(name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate(`/${character}/${selectedCard}`);
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
        <div className="grid flex-grow gap-2 p-2 tp:grid-cols-2 tp:grid-rows-2 tl5:grid-cols-4 tl5:grid-rows-1 lg:gap-4 tl6:gap-4 tl6:p-4">
          {[
            {
              name: "consonant",
              icon: (
                <img
                  src={consonant}
                  alt="consonant"
                  className="aspect-square"
                />
              ),
              title: "자음",
              description: ["ㄱ,ㄴ,ㄷ,ㄹ,ㅁ...", "한글의 기본이 되는 소리"],
            },
            {
              name: "vowel",
              icon: <img src={vowel} alt="vowel" className="aspect-square" />,
              title: "모음",
              description: ["ㅏ,ㅓ,ㅗ,ㅜ,ㅡ...", "예쁜 소리를 내는 글자"],
            },
            {
              name: "syllable",
              icon: (
                <img src={syllable} alt="syllable" className="aspect-square" />
              ),
              title: "글자",
              description: ["가, 나, 다, 라...", "자음 + 모음 = 글자"],
            },
            {
              name: "word",
              icon: <img src={word} alt="word" className="aspect-square" />,
              title: "단어",
              description: ["엄마, 아빠, 사과...", "의미가 있는 완전한 말"],
            },
          ].map((item, i) => (
            <BlurFade
              delay={0.25 * i}
              key={i}
              inView
              className="flex flex-col items-center self-stretch justify-center col-span-1 gap-2 tl6:p-2"
            >
              <Card
                className={`flex p-2 flex-col justify-center items-center gap-2 flex-grow self-stretch col-span-1 shadow-xl ${
                  selectedCard === item.name
                    ? `shadow-2xl border bg-${item.name}`
                    : `hover:shadow-2xl bg-${item.name}/50 shadow-inner border-4 border-${item.name}`
                }
                  `}
                onClick={() => onCardClick(item.name)}
              >
                <div className="flex items-center self-stretch justify-center flex-grow gap-2 p-2">
                  <div className="flex flex-col items-center self-stretch justify-center flex-grow gap-4 py-2 md:py-6">
                    <div className="flex items-center justify-center w-full">
                      <div className="w-24 h-24 tl6:w-28 tl6:h-28 aspect-square">
                        {item.icon}
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
      </div>
      <StepDialog
        open={open}
        setOpen={setOpen}
        title={`${TARGETS[selectedCard]}을(를) 학습해 볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
export default Target;
