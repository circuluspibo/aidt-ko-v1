import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { JOSA } from "@/utils/globals";
import { fetchWriteOCR } from "@/api/learning";

let startTime = null;
const LearnByWrite = ({ item, target, onAnswer, currentRepeat }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hint, setHint] = useState(true);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const parentRef = useRef(null);
  const { mutate: checkAnswer, isPending } = useMutation({
    mutationFn: async (blob) => {
      const formData = new FormData();
      formData.append("uploadFile", blob, "test.png");
      try {
        const data = await fetchWriteOCR(target === "word", formData);
        if (data) {
          const isCorrect = data.text === item.letter;
          const endTime = new Date().valueOf();
          const responseTime = (endTime - startTime) / 1000;
          const attempt = {
            timestamp: new Date(),
            responseTime,
            isCorrect,
            correct: item.letter,
            user: data.text,
          };
          return attempt;
        }
      } catch (error) {
        console.error("채점 요청 오류:", error);
        return false;
      }
    },
    onSuccess: (data) => {
      onAnswer(data, () => {
        clearCanvas();
        setHint(true);
      });
    },
    onError: (error) => {
      console.error("채점 요청 오류:", error);
      toast.error("채점 중 오류가 발생했습니다. 다시 시도해 주세요.");
      clearCanvas();
    },
  });

  const startDraw = (e) => {
    if (isPending) return;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(
      e.nativeEvent.offsetX ||
        e.touches[0].clientX - e.target.getBoundingClientRect().left,
      e.nativeEvent.offsetY ||
        e.touches[0].clientY - e.target.getBoundingClientRect().top
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || isPending) return;
    ctxRef.current.lineTo(
      e.nativeEvent.offsetX ||
        e.touches[0].clientX - e.target.getBoundingClientRect().left,
      e.nativeEvent.offsetY ||
        e.touches[0].clientY - e.target.getBoundingClientRect().top
    );
    ctxRef.current.stroke();
  };

  const endDraw = () => {
    if (isPending) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = (e) => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    if (e) {
      toast("캔버스를 초기화했습니다. 다시 시도해보세요.");
    }
  };

  const handleSubmit = async () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvasRef.current, 0, 0);
    const blobPromise = new Promise((resolve) => {
      tempCanvas.toBlob((blob) => {
        /* 다운로드용 링크 생성
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${item.letter}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
         */
        resolve(blob);
      }, "image/png");
    });
    const blob = await blobPromise;
    checkAnswer(blob);
  };

  useEffect(() => {
    startTime = new Date().valueOf();
  }, [currentRepeat]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = parentRef?.current?.clientWidth;
    canvas.height = parentRef?.current?.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 8;
    ctxRef.current = ctx;
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* 힌트 영역 */}
      <div className="grid-cols-2 col-span-4 gap-4">
        <div className="flex justify-center items-center p-4 h-full text-9xl font-extrabold bg-white rounded-lg border shadow-sm">
          {target !== "letter" && (
            <div className="flex col-span-2 justify-center items-center p-4 text-9xl font-extrabold">
              {target === "word" ? (
                <img
                  src={`/images/words/${encodeURI(item.name).replaceAll(
                    "%",
                    ""
                  )}.png`}
                  alt={item.letter}
                  className="p-2 aspect-square"
                />
              ) : (
                <img
                  src={`/images/write/${item.letter.charCodeAt(0)}.png`}
                  alt={item.letter}
                />
              )}
            </div>
          )}
          {target === "letter" && (
            <div className="flex justify-center items-center pr-4 w-full text-6xl font-extrabold">
              {/* <LetterConsonant
                  letter={item.components[0]}
                  className="py-2 text-9xl"
                /> */}
              <img
                src={`/images/write/${item.components[0].charCodeAt(0)}.png`}
                alt={item.components[0]}
                className="object-contain flex-1 w-1/2 h-auto scale-75"
              />
              <span>+</span>
              <img
                src={`/images/write/${item.components[1].charCodeAt(0)}.png`}
                alt={item.components[1]}
                className="object-contain flex-1 w-auto h-48"
              />
              {/* <LetterVowel
                  letter={item.components[1]}
                  className="py-2 text-9xl"
                /> */}
              <span>=</span>
            </div>
          )}
        </div>
      </div>
      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-rows-[auto_1fr] gap-4">
        <div className="row-span-1 p-2 w-full text-2xl font-bold text-center rounded-lg border shadow border-neutral-300 bg-rose-300/80">
          {`"${item.name}"${JOSA().c(item.name, "을/를")} 직접 써보세요.`}
        </div>
        <div className="flex flex-col gap-10 justify-center items-center p-2 w-full text-center bg-white rounded-lg border shadow-sm">
          <div className="grid grid-cols-[1fr_auto] gap-2 w-full h-full">
            <div className="relative col-span-1 w-full h-full" ref={parentRef}>
              {hint && (
                <div
                  className="absolute inset-0 z-0 w-full h-full font-extrabold cursor-default bg-black/10 text-black/20"
                  style={{ userSelect: "none" }}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <p
                    className={`flex items-center justify-center h-full select-none text-9xl nanum-gothic-extrabold write-letter-${target}-${item.letter.length}`}
                  >
                    {item.letter}
                  </p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="absolute z-50 w-full h-full"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <div className="grid grid-rows-[1fr_1fr_1fr] col-span-1 gap-2">
              <Button
                size="lg"
                className={`p-4 h-full text-6xl bg-white hover:bg-warning/20 disabled:bg-black/20 ${
                  hint && "grayscale"
                }`}
                disabled={isPending}
                onClick={() => setHint(!hint)}
              >
                💡
              </Button>
              <Button
                size="lg"
                className="p-4 h-full text-6xl bg-white hover:bg-error/20 disabled:grayscale disabled:bg-black/20"
                disabled={isPending}
                onClick={clearCanvas}
              >
                ❌
              </Button>
              <Button
                size="lg"
                className="p-4 h-full text-6xl bg-white hover:bg-success/20 disabled:bg-black/20"
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <Loader2Icon className="!w-10 !h-10 text-rose-500/50 animate-spin" />
                ) : (
                  "✅"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnByWrite;
