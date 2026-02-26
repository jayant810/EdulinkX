import { useAuth } from "@/auth/AuthProvider";

export async function apiFetch(url: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  return res.json();
}
