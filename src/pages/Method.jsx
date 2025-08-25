import { Card } from "../components/ui/card";
import { BlurFade } from "../components/magicui/blur-fade";
import { useEffect, useState } from "react";
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
import MenuCard from "@/components/MenuCard";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function Method() {
  const location = useLocation();
  const { character, chapter } = useParams();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");

  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [[targetData, methodData], setData] = useState([[], []]);
  const [open, setOpen] = useState(false);
  const { data, error, isPending } = useQuery({
    queryKey: ["character", "method", character, chapter, target],
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
        const targetData = response.data.map((item) => ({
          ...item.target,
          chapterId: item.chapterId,
        }));
        console.log(item);
        if (item) {
          return [targetData, item.methods];
        }
        return [targetData, []];
      }
    },
  });

  const onCardClick = (item) => {
    setSelected(item.name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate(`/learn/${character}/${chapter}/${selected}`);
  };

  const handleCancel = () => {
    setSelected(null);
    setOpen(false);
  };

  const handleTargetChange = (e) => {
    if (e.target.value === "prev") {
      navigate(`${getPrevPath(location.pathname)}`);
    } else {
      navigate(`${location.pathname}?target=${e.target.value}`);
    }
  };

  const handlePrev = () => {
    navigate(`${getPrevPath(location.pathname)}`);
  };

  useEffect(() => {
    if (data && data.length) {
      setData(data);
    }
  }, [data]);

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
        <header className="inline-flex items-center text-2xl font-extrabold col-span-full md:text-5xl text-start">
          <button
            className="w-12 h-12 p-1 mr-1 bg-transparent rounded-full hover:bg-black/10"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          {`🎯 ${TARGETS[target]}`}
          {target === "word" ? "를" : "을"} 어떻게 배울까요?
        </header>
        <p className="text-xl font-semibold col-span-full md:text-4xl">
          재미있게 배울 방법을 선택해주세요.
        </p>
        {!isPending && !error && (
          <div className="flex flex-row w-full overflow-auto fcol-span-full whitespace-nowrap">
            <div
              className={`flex h-full space-x-1 ${
                methodData.length > 4 ? "w-max" : "w-full"
              }`}
            >
              {methodData &&
                methodData.map((item, i) => (
                  <MenuCard
                    key={`method-${i}`}
                    index={i}
                    item={item}
                    className={
                      selected === item.name
                        ? `shadow-2xl border bg-${COLORS[item.name]}-400`
                        : `hover:shadow-2xl bg-${
                            COLORS[item.name]
                          }-100 shadow-inner border-4 border-${
                            COLORS[item.name]
                          }-400`
                    }
                    textcolor={`text-${COLORS[item.name]}-500`}
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
        title={`${TARGETS[target]} ${METHODS[selected]} 학습을 시작해 볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
export default Method;
