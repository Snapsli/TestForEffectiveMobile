import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/lib/api";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      await AuthAPI.register({ fullName, birthDate, email, password });
      setOk("Регистрация успешна. Теперь войдите.");
      setTimeout(() => navigate("/login"), 800);
    } catch (e: any) {
      setError(e.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Регистрация</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input placeholder="ФИО" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input placeholder="Дата рождения" value={birthDate} onChange={e => setBirthDate(e.target.value)} type="date" required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        <input placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        <button disabled={loading} type="submit">Зарегистрироваться</button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        {ok && <div style={{ color: "green" }}>{ok}</div>}
      </form>
    </div>
  );
}

