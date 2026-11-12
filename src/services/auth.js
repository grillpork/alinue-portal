import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { setToken, removeToken } from "@/lib/auth";

const DEFAULT_MOCK_ADMIN = {
  id: "admin-1",
  name: "ผู้ดูแลระบบ",
  username: "admin",
  email: "admin@commi.market",
  role: { name: "admin" },
  roleName: "admin",
  avatarUrl: null,
};

export async function login(payload) {
  const email = payload.email?.trim();
  const password = payload.password;

  const res = await authClient.signIn.email({
    email,
    password,
  });

  if (res?.error) {
    throw new Error(res.error.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  if (res?.data?.token) {
    setToken(res.data.token);
  }

  return res.data;
}

export async function getMe() {
  try {
    const { data } = await api.get("/user/me");
    const user = data?.user || data;
    if (user?.id) {
      return user;
    }
  } catch (_) {}

  // Fallback to Better Auth session
  try {
    const session = await authClient.getSession();
    if (session?.data?.user) {
      return session.data.user;
    }
  } catch (_) {}

  // Fallback for mock environment
  if (process.env.NEXT_PUBLIC_ADMIN_USE_MOCK !== "false") {
    return DEFAULT_MOCK_ADMIN;
  }

  return null;
}

export async function logout() {
  try {
    await authClient.signOut();
  } catch (_) {}
  removeToken();
  return { success: true };
}
