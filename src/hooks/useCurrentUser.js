"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getMe, logout as authLogout } from "@/services/auth";
import { getToken } from "@/lib/auth";

export const authKeys = {
  currentUser: ["currentUser"],
};

export function useCurrentUser() {
  const queryClient = useQueryClient();

  // Better Auth native session hook
  const {
    data: sessionData,
    isPending: sessionPending,
    error: sessionError,
    refetch: refetchSession,
  } = authClient.useSession();

  const userId = sessionData?.user?.id;
  const hasLocalToken = typeof window !== "undefined" ? Boolean(getToken()) : false;

  // Fetch full user profile from backend (/user/me) when session exists or token is present,
  // or fallback to getMe() which handles mock mode gracefully.
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const currentUser = profileData || sessionData?.user || null;

  const isLoading =
    sessionPending ||
    (Boolean(userId || hasLocalToken) && profileLoading && !profileData);

  async function handleLogout() {
    await authLogout();
    queryClient.setQueryData(authKeys.currentUser, null);
    queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    refetchSession();
  }

  return {
    user: currentUser,
    session: sessionData?.session || null,
    isLoading,
    isAuthenticated: Boolean(currentUser?.id || currentUser?.username),
    error: profileError || sessionError,
    refetch: () => {
      refetchSession();
      refetchProfile();
    },
    logout: handleLogout,
  };
}
