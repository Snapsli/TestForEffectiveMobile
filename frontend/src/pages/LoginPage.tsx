import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/lib/api";
import { useAuth } from "@/auth/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await AuthAPI.login(email, password);
      const token = res?.token as string;
      if (!token) throw new Error("Не получили токен");
      login(token);
      navigate("/");
    } catch (e: any) {
      setError(e.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Вход</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        <input placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        <button disabled={loading} type="submit">Войти</button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
}

