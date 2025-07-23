import ResumeLearningModal from "@/components/ResumeLearningModal";
import { Outlet, useParams } from "react-router-dom";

const ProgressLayout = () => {
  const { target, method } = useParams();

  return (
    <>
      <Outlet />
      <ResumeLearningModal target={target} method={method} />
    </>
  );
};

export default ProgressLayout;
