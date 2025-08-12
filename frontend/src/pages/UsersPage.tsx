import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { UsersAPI } from "@/lib/api";

type UserListItem = {
  id: string;
  fullName: string;
  birthDate?: string | Date;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
};

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const list = await UsersAPI.list(token);
        setUsers(list);
      } catch (e: any) {
        setError(e.message || "Не удалось получить список");
      }
    };
    run();
  }, [token]);

  if (!token) return null;
  return (
    <div>
      <h3>Пользователи</h3>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <table cellPadding={6} style={{ borderCollapse: "collapse", marginTop: 8 }}>
        <thead>
          <tr>
            <th align="left">ID</th>
            <th align="left">ФИО</th>
            <th align="left">Дата рождения</th>
            <th align="left">Email</th>
            <th align="left">Роль</th>
            <th align="left">Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <code>{u.id}</code>
                <button style={{ marginLeft: 6 }} onClick={() => navigator.clipboard.writeText(u.id)}>⧉</button>
              </td>
              <td>{u.fullName}</td>
              <td>{formatDate(u.birthDate)}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? "Активен" : "Заблокирован"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                {u.isActive ? (
                  <button onClick={async () => {
                    try {
                      await UsersAPI.block(u.id, token!);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: false } : x));
                    } catch (e: any) {
                      alert(e.message || "Ошибка блокировки");
                    }
                  }}>Заблокировать</button>
                ) : (
                  <button onClick={async () => {
                    try {
                      await UsersAPI.unblock(u.id, token!);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: true } : x));
                    } catch (e: any) {
                      alert(e.message || "Ошибка разблокировки");
                    }
                  }}>Разблокировать</button>
                )}

                {u.role === "user" ? (
                  <button onClick={async () => {
                    try {
                      await UsersAPI.update(u.id, { role: "admin" }, token!);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: "admin" } : x));
                    } catch (e: any) {
                      alert(e.message || "Не удалось назначить админом");
                    }
                  }}>Сделать админом</button>
                ) : (
                  <button onClick={async () => {
                    try {
                      await UsersAPI.update(u.id, { role: "user" }, token!);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: "user" } : x));
                    } catch (e: any) {
                      alert(e.message || "Не удалось снять роль админа");
                    }
                  }}>Снять админа</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(d?: string | Date) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString();
}

