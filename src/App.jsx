import { BrowserRouter, Routes, Route } from "react-router-dom";
import Target from "./pages/Target";
import Method from "./pages/Method";
import Learn from "./pages/Learn";
import Character from "./pages/Character";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <div className="flex justify-center items-center w-full h-full">
        <div
          className={`flex flex-col flex-grow justify-center items-center w-full h-full shadow-2xl backdrop-blur-sm tb-lg:rounded-3xl bg-white/90 tb-lg:h-[800px] tb-lg:max-w-[1200px]`}
        >
          <Routes>
            <Route path="/" element={<Character />} />
            <Route path="/:character" element={<Target />} />
            <Route path="/:character/:target" element={<Method />} />
            <Route path="/:character/:target/:method" element={<Learn />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
