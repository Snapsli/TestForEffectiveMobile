import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import React from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import ExplorePage from "./pages/ExplorePage";
import { useAuth } from "./auth/AuthProvider";

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginRight: 12 }}>Test for Effective Mobile</h2>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/">Профиль</Link>
          {isAuthenticated && <Link to="/explore">Люди</Link>}
          {isAuthenticated && user?.role === "admin" && <Link to="/users">Пользователи</Link>}
          {!isAuthenticated && <Link to="/login">Войти</Link>}
          {!isAuthenticated && <Link to="/register">Регистрация</Link>}
        </nav>
        <div style={{ marginLeft: "auto" }}>
          {isAuthenticated && (
            <button onClick={() => { logout(); navigate("/login"); }}>Выйти</button>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
        <Route path="/explore" element={<RequireAuth><ExplorePage /></RequireAuth>} />
        <Route path="/" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

