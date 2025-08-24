// src/main.jsx
import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import objectSupport from "dayjs/plugin/objectSupport";
import "dayjs/locale/ko";
import QueryProvider from "./providers/QueryProvider";

import NotFound from "./pages/NotFound";
import Character from "./pages/Character";
import Target from "./pages/Target";
import Method from "./pages/Method";
import Learn from "./pages/Learn";
import LearnLayout from "./layouts/LearnLayout";
import ProgressLayout from "./layouts/ProgressLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { GroupManagement } from "./components/dashboard/GroupManagement";
import { CharacterManagement } from "./components/dashboard/CharacterManagement";
import { StudentManagement } from "./components/dashboard/StudentManagement";
import DashboardLayout from "./layouts/DashboardLayout";
import Main from "./pages/dashboard";
import CharacterCurriculumManagement from "./components/dashboard/CharacterCurriculumManagement";

import LoginPage from "./pages/Login";
import { getUserData } from "./api";
import AuthLayout from "./layouts/AuthLayout";

dayjs.locale("ko");
dayjs.extend(objectSupport);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

async function loader() {
  let user = await getUserData();
  return { user };
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthLayout />} loader={loader} errorElement={<NotFound />}>
      {/* 공개 페이지 */}
      <Route path="/" element={<Main />} />
      <Route path="/login/teacher" element={<LoginPage target="teacher" />} />
      <Route path="/login/student" element={<LoginPage target="student" />} />

      {/* 교사 전용: /manage */}
      <Route path="manage" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="groups" element={<GroupManagement />} />
        <Route path="groups/:groupId" element={<CharacterManagement />} />
        <Route
          path="groups/:groupId/:characterId"
          element={<CharacterCurriculumManagement />}
        />
        <Route path="students" element={<StudentManagement />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 학생 전용: /learn */}
      <Route path="learn" element={<LearnLayout />}>
        <Route index element={<Character />} />
        <Route path=":character" element={<ProgressLayout />}>
          <Route index element={<Target />} />
          <Route path=":chapter" element={<Method />} />
          <Route path=":chapter/:method" element={<Learn />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 공통 에러/기타 */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </React.StrictMode>
);
