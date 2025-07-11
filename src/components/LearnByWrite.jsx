import React, { useRef, useState, useEffect } from "react";
import learningData from "../data/learningData.json";
import { toast } from "sonner";
import useLearningSession from "@/hook/useLearningSession";

const LearnByWrite = ({ target }) => {
  const {
    onAnswer,
    progress,
    timer,
    currentItemIndex,
    currentRepeat,
    repeatSettings,
  } = useLearningSession(target);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const item = learningData[target][currentItemIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 8;
    ctxRef.current = ctx;
  }, []);

  const startDraw = (e) => {
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
    if (!isDrawing) return;
    ctxRef.current.lineTo(
      e.nativeEvent.offsetX ||
        e.touches[0].clientX - e.target.getBoundingClientRect().left,
      e.nativeEvent.offsetY ||
        e.touches[0].clientY - e.target.getBoundingClientRect().top
    );
    ctxRef.current.stroke();
  };

  const endDraw = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = (e) => {
    ctxRef.current.clearRect(0, 0, 300, 300);
    if (e) {
      toast("캔버스를 초기화했습니다. 다시 시도해보세요.");
    }
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");

    try {
      const res = await fetch("/write/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          label: item.letter,
        }),
      });
      const data = await res.json();
      const isCorrect = data.result === "correct";
      onAnswer(isCorrect, clearCanvas);
    } catch (error) {
      console.error("채점 요청 오류:", error);
      toast.error("채점 중 오류가 발생했습니다. 다시 시도해 주세요.");
      clearCanvas();
    }
  };

  return (
    <div className="p-6 mx-auto max-w-xl text-center">
      <h2 className="mb-2 text-2xl font-bold">✍️ 쓰기 학습 ({target})</h2>
      <p className="mb-2 text-sm text-gray-600">
        진행: {progress}% | 문제: {currentItemIndex + 1} /{" "}
        {learningData[target].length} | 반복: {currentRepeat} /{" "}
        {repeatSettings.correct}
      </p>
      <p className="mb-2 text-sm text-gray-600">경과 시간: {timer}초</p>
      {/* <p className="mb-4 font-semibold text-blue-600">{tutorMessage}</p> */}

      <div className="mb-2 text-5xl">{item.letter}</div>
      <div className="mb-4 text-lg">
        {item.name} [{item.sound}]
      </div>
      <div className="mb-4 text-4xl">{item.image}</div>
      <p className="mb-4 text-sm text-gray-700">
        {item.example || item.meaning}
      </p>

      <canvas
        ref={canvasRef}
        className="mb-4 bg-white border"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-green-500 rounded"
        >
          제출
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 text-white bg-gray-500 rounded"
        >
          지우기
        </button>
      </div>
    </div>
  );
};

export default LearnByWrite;
