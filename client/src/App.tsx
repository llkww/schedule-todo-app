import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { AppToaster } from "./components/ui/AppToaster";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
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
              <Route path="schedules" element={<PlaceholderPage title="Schedules" />} />
              <Route path="schedules/new" element={<PlaceholderPage title="New schedule" />} />
              <Route path="schedules/:id" element={<PlaceholderPage title="Schedule detail" />} />
              <Route path="schedules/:id/edit" element={<PlaceholderPage title="Edit schedule" />} />
              <Route path="calendar" element={<PlaceholderPage title="Calendar" />} />
              <Route path="matrix" element={<PlaceholderPage title="Priority matrix" />} />
              <Route path="tags" element={<PlaceholderPage title="Tags" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
          </Route>
          <Route path="*" element={<PlaceholderPage title="Page not found" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
