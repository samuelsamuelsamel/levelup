import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GamesProvider } from "@/contexts/GamesContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/layout/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Público */}
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/cadastro"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            {/* Privado — exige sessão e carrega a biblioteca uma única vez */}
            <Route
              element={
                <ProtectedRoute>
                  <GamesProvider>
                    <AppLayout />
                  </GamesProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/biblioteca" element={<Library />} />
              <Route path="/estatisticas" element={<Stats />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Route>

            {/* Compatibilidade com endereços em inglês */}
            <Route path="/library" element={<Navigate to="/biblioteca" replace />} />
            <Route path="/stats" element={<Navigate to="/estatisticas" replace />} />
            <Route path="/profile" element={<Navigate to="/perfil" replace />} />
            <Route path="/settings" element={<Navigate to="/configuracoes" replace />} />
            <Route path="/register" element={<Navigate to="/cadastro" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
