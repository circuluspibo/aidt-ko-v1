import { Card } from "../components/ui/card";
import { BlurFade } from "../components/magicui/blur-fade";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import read from "../assets/read.svg";
import listen from "../assets/listen.svg";
import speak from "../assets/speak.svg";
import write from "../assets/write.svg";
import { COLORS, TARGETS, METHODS } from "../utils/globals";
import StepDialog from "@/components/StepDialog";

function Method() {
  const { character, target } = useParams();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [open, setOpen] = useState(false);
  const onCardClick = (name) => {
    setSelectedCard(name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate(`/${character}/${target}/${selectedCard}`);
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setOpen(false);
  };

  const handleTargetChange = (e) => {
    if (e.target.value === "prev") {
      navigate(`/`);
    } else {
      navigate(`/${e.target.value}`);
    }
  };

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
        <header className="col-span-full text-2xl font-extrabold md:text-5xl text-start">
          {`🎯 `}
          <select
            defaultValue={target}
            className="w-20 bg-transparent md:w-[106px]"
            onChange={handleTargetChange}
          >
            <option value="prev">학습 대상 변경</option>
            <option value="consonant">자음</option>
            <option value="vowel">모음</option>
            <option value="syllable">글자</option>
            <option value="word">단어</option>
          </select>
          {target === "word" ? "를" : "을"} 어떻게 배울까요?
        </header>
        <p className="col-span-full text-xl font-semibold md:text-4xl">
          재미있게 배울 방법을 선택해주세요.
        </p>
        <div className="grid flex-grow gap-2 p-2 tp:grid-cols-2 tp:grid-rows-2 tl5:grid-cols-4 tl5:grid-rows-1 lg:gap-4 tl6:gap-4 tl6:p-4">
          {[
            {
              name: "read",
              icon: <img src={read} alt="read" className="aspect-square" />,
              title: "보기",
              description: ["글자를 보고 찾아보기", ""],
            },
            {
              name: "listen",
              icon: <img src={listen} alt="listen" className="aspect-square" />,
              title: "듣기",
              description: ["소리를 듣고 맞추기", ""],
            },
            {
              name: "speak",
              icon: (
                <img
                  src={speak}
                  alt="speak"
                  className="-scale-x-100 aspect-square"
                />
              ),
              title: "말하기",
              description: ["글자를 보고 따라 말하기", ""],
            },
            {
              name: "write",
              icon: (
                <img
                  src={write}
                  alt="write"
                  className="-scale-x-100 aspect-square"
                />
              ),
              title: "쓰기",
              description: ["글자를 따라 써보기", ""],
            },
          ].map((item, i) => (
            <BlurFade
              delay={0.25 * i}
              key={i}
              inView
              className="flex flex-col col-span-1 gap-2 justify-center items-center self-stretch tl6:p-2"
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
                <div className="flex flex-grow gap-2 justify-center items-center self-stretch p-2">
                  <div className="flex flex-col flex-grow gap-4 justify-center items-center self-stretch py-2 md:py-6">
                    <div className="flex justify-center items-center w-full">
                      <div className="w-24 h-24 tl6:w-28 tl6:h-28 aspect-square">
                        {item.icon}
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
