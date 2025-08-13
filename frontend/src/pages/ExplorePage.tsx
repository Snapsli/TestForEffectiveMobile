import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { UsersAPI } from "@/lib/api";

type ExploreUser = {
  id: string;
  fullName: string;
  birthDate?: string | Date;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  followersCount: number;
  followingCount: number;
  isFollowed: boolean;
};

export default function ExplorePage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const list = await UsersAPI.exploreList(token);
        setUsers(list);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить список");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  if (!token) return null;
  return (
    <div>
      <h3>Люди</h3>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginTop: 12 }}>
        {users.map(u => (
          <div key={u.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600 }}>{u.fullName}</div>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{u.role}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 14 }}>{u.email}</div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
              Подписчики: {u.followersCount} · Подписки: {u.followingCount}
            </div>
            <div style={{ marginTop: 10 }}>
              {u.isActive ? (
                u.isFollowed ? (
                  <button onClick={async () => {
                    try {
                      await UsersAPI.unfollow(u.id, token);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isFollowed: false, followersCount: Math.max(0, x.followersCount - 1) } : x));
                    } catch (e: any) {
                      alert(e.message || "Не удалось отписаться");
                    }
                  }}>Отписаться</button>
                ) : (
                  <button onClick={async () => {
                    try {
                      await UsersAPI.follow(u.id, token);
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isFollowed: true, followersCount: x.followersCount + 1 } : x));
                    } catch (e: any) {
                      alert(e.message || "Не удалось подписаться");
                    }
                  }}>Подписаться</button>
                )
              ) : (
                <span style={{ fontSize: 12, color: "#a00" }}>Пользователь заблокирован</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


