import { LoaderCircle } from "lucide-react";

export function Loading({ text, icon }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-[1800]">
      <div className="absolute inset-0 z-50 w-full h-full"></div>
      {text && !icon && <p className="text-primary">{text}</p>}
      {!text && icon && (
        <progress className="w-56 progress progress-primary"></progress>
      )}
      {!text && !icon && <LoaderCircle className="w-56 h-56 animate-spin" />}
    </div>
  );
}
