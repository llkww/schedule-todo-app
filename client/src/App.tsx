import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { AppToaster } from "./components/ui/AppToaster";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { MatrixPage } from "./pages/matrix/MatrixPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ScheduleDetailPage } from "./pages/schedules/ScheduleDetailPage";
import { ScheduleFormPage } from "./pages/schedules/ScheduleFormPage";
import { ScheduleListPage } from "./pages/schedules/ScheduleListPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { TagsPage } from "./pages/tags/TagsPage";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppToaster />
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="schedules" element={<ScheduleListPage />} />
              <Route path="schedules/new" element={<ScheduleFormPage />} />
              <Route path="schedules/:id" element={<ScheduleDetailPage />} />
              <Route path="schedules/:id/edit" element={<ScheduleFormPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="matrix" element={<MatrixPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
