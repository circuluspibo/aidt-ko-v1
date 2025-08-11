import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import QueryProvider from "./providers/QueryProvider";
import NotFound from "./pages/NotFound";
import Character from "./pages/Character";
import Target from "./pages/Target";
import Method from "./pages/Method";
import Learn from "./pages/Learn";
import RootLayout from "./layouts/RootLayout";
import ProgressLayout from "./layouts/ProgressLayout";
import DashboardIndex from "./pages/dashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<DashboardIndex />} />
      <Route path="learn" element={<RootLayout />}>
        <Route index element={<Character />} />
        <Route path=":character" element={<ProgressLayout />}>
          <Route index element={<Target />} />
          <Route path=":target" element={<Method />} />
          <Route path=":target/:method" element={<Learn />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </React.StrictMode>
);
