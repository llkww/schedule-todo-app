import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { AppToaster } from "./components/ui/AppToaster";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ScheduleDetailPage } from "./pages/schedules/ScheduleDetailPage";
import { ScheduleFormPage } from "./pages/schedules/ScheduleFormPage";
import { ScheduleListPage } from "./pages/schedules/ScheduleListPage";
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
              <Route index element={<PlaceholderPage title="Dashboard" />} />
              <Route path="schedules" element={<ScheduleListPage />} />
              <Route path="schedules/new" element={<ScheduleFormPage />} />
              <Route path="schedules/:id" element={<ScheduleDetailPage />} />
              <Route path="schedules/:id/edit" element={<ScheduleFormPage />} />
              <Route path="calendar" element={<PlaceholderPage title="Calendar" />} />
              <Route path="matrix" element={<PlaceholderPage title="Priority matrix" />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
          </Route>
          <Route path="*" element={<PlaceholderPage title="Page not found" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
