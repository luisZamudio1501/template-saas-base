import { supabase } from "@/lib/supabase";
import { Usuario } from "./types";

export const authService = {
  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  async register(email: string, password: string): Promise<{ hasSession: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { hasSession: !!data.session };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  async getCurrentUser(): Promise<Usuario | null> {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (!data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email ?? null,
    };
  },

  async resetPassword(email: string): Promise<void> {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/update-password`,
    });

    if (error) throw error;
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
  },

  onAuthStateChange(
    callback: (event: string) => void
  ): { data: { subscription: { unsubscribe: () => void } } } {
    return supabase.auth.onAuthStateChange((event) => callback(event));
  },
};
