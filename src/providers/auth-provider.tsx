"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authService, userService } from "@/services";
import { getSupabase } from "@/lib/supabase/client";
import { stripPassword } from "@/utils/user";
import type { AuthSession, UserProfile } from "@/types";
import { useLocale } from "@/providers/locale-provider";

interface AuthContextValue {
  session: AuthSession | null | undefined;
  user: AuthSession["user"] | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { locale } = useLocale();
  const messages = useMemo(() => ({
    tr: {
      welcome: "Tekrar hoş geldiniz",
      created: "Hesabınız oluşturuldu",
      signedOut: "Çıkış yapıldı",
      loginRequired: "Favorilere eklemek için giriş yapın",
      favoritesUpdated: "Favoriler güncellendi",
      profileSaved: "Profil kaydedildi",
      authError: "E-posta veya şifre hatalı",
    },
    en: {
      welcome: "Welcome back",
      created: "Account created",
      signedOut: "Signed out",
      loginRequired: "Please login to save favorites",
      favoritesUpdated: "Favorites updated",
      profileSaved: "Profile saved",
      authError: "Invalid email or password",
    },
    ru: {
      welcome: "С возвращением",
      created: "Аккаунт создан",
      signedOut: "Вы вышли из аккаунта",
      loginRequired: "Войдите, чтобы сохранить в избранное",
      favoritesUpdated: "Избранное обновлено",
      profileSaved: "Профиль сохранён",
      authError: "Неверная почта или пароль",
    },
  })[locale], [locale]);
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: authService.session,
  });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DATA_PROVIDER !== "supabase") return;
    const sb = getSupabase();
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["session"], null);
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void authService.session().then((next) => {
          queryClient.setQueryData(["session"], next);
        });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data);
      toast.success(messages.welcome);
    },
    onError: () => toast.error(messages.authError),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data);
      toast.success(messages.created);
    },
    onError: () => toast.error(messages.authError),
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      login: async (email, password) => {
        await loginMutation.mutateAsync({ email, password });
      },
      register: async (input) => {
        await registerMutation.mutateAsync(input);
      },
      logout: async () => {
        await authService.logout();
        queryClient.setQueryData(["session"], null);
        toast.success(messages.signedOut);
      },
      toggleFavorite: async (vehicleId) => {
        if (!session?.user) {
          toast.error(messages.loginRequired);
          return;
        }
        const updated = await userService.toggleFavorite(session.user.id, vehicleId);
        queryClient.setQueryData(["session"], {
          ...session,
          user: stripPassword(updated),
        });
        toast.success(messages.favoritesUpdated);
      },
      updateProfile: async (patch) => {
        if (!session?.user) return;
        const updated = await userService.update(session.user.id, patch);
        queryClient.setQueryData(["session"], {
          ...session,
          user: stripPassword(updated),
        });
        toast.success(messages.profileSaved);
      },
    }),
    [session, isLoading, loginMutation, registerMutation, queryClient, messages],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
