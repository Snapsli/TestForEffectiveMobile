const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";

export type RegisterPayload = {
  fullName: string;
  birthDate: string; // ISO string yyyy-mm-dd
  email: string;
  password: string;
};

export async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof body === "string" ? body : body?.error || "Request failed";
    throw new Error(message);
  }
  return body;
}

export const AuthAPI = {
  async register(payload: RegisterPayload) {
    return apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },
  async login(email: string, password: string) {
    return apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  async logout() {
    return apiFetch("/api/auth/logout", { method: "POST" });
  },
};

export const UsersAPI = {
  async me(token: string) {
    return apiFetch(`/api/users/me`, {}, token);
  },
  async getById(id: string, token: string) {
    return apiFetch(`/api/users/${id}`, {}, token);
  },
  async list(token: string) {
    return apiFetch(`/api/users`, {}, token);
  },
  async block(id: string, token: string) {
    return apiFetch(`/api/users/${id}/block`, { method: "PATCH" }, token);
  },
  async unblock(id: string, token: string) {
    return apiFetch(`/api/users/${id}/unblock`, { method: "PATCH" }, token);
  },
  async update(id: string, data: any, token: string) {
    return apiFetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token);
  },
  async changePassword(id: string, data: { currentPassword: string; newPassword: string }, token: string) {
    return apiFetch(`/api/users/${id}/password`, { method: "PATCH", body: JSON.stringify(data) }, token);
  },
};

