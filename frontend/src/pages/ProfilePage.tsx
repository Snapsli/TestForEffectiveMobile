import React from "react";
import { useAuth } from "@/auth/AuthProvider";
import { UsersAPI } from "@/lib/api";

export default function ProfilePage() {
  const { token, user, setUser } = useAuth();
  if (!token) return null;
  return (
    <div>
      <h3>Профиль</h3>
      {!user && <div>Загрузка...</div>}
      {user && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <b>ID:</b> <code>{user.id}</code>
            <button style={{ marginLeft: 8 }} onClick={() => navigator.clipboard.writeText(user.id)}>Скопировать</button>
          </div>
          <div><b>ФИО:</b> {user.fullName}</div>
          <div><b>Дата рождения:</b> {formatDate(user.birthDate)}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Роль:</b> {user.role}</div>
          <div><b>Статус:</b> {user.isActive ? "Активен" : "Заблокирован"}</div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            {user.isActive ? (
              <button
                onClick={async () => {
                  if (!confirm("Вы уверены, что хотите заблокировать свой аккаунт?")) return;
                  try {
                    await UsersAPI.block(user.id, token);
                    setUser({ ...user, isActive: false });
                  } catch (e: any) {
                    alert(e.message || "Не удалось заблокировать аккаунт");
                  }
                }}
              >Заблокировать себя</button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await UsersAPI.unblock(user.id, token);
                    setUser({ ...user, isActive: true });
                  } catch (e: any) {
                    alert(e.message || "Не удалось разблокировать аккаунт");
                  }
                }}
              >Разблокировать себя</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(d: string | Date | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString();
}

