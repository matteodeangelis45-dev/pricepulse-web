import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_TIMEOUT_MS = 10000;

function devLog(message: string, payload?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[PricePulse auth] ${message}`, payload ?? '');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileRetryRef = useRef<number | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch profile:', error.message);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        if (profileRetryRef.current) window.clearTimeout(profileRetryRef.current);
        profileRetryRef.current = window.setTimeout(async () => {
          try {
            const { data: retryData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            if (retryError) {
              devLog('Profile retry failed', retryError.message);
              return;
            }
            if (retryData) setProfile(retryData);
          } catch (err) {
            devLog('Profile retry threw', err);
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;
    const authSafetyTimer = window.setTimeout(() => {
      if (!mounted) return;
      devLog('Auth restore exceeded safety timeout');
      setLoading(false);
    }, AUTH_TIMEOUT_MS);

    async function restoreSession() {
      try {
        const { data: { session: sess }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) console.error('Failed to restore session:', error.message);
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) void fetchProfile(sess.user.id);
        devLog('Session restored', sess?.user?.id);
      } catch (err) {
        if (mounted) console.error('Error restoring session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if (!mounted) return;

        devLog('Auth state changed', event);
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          void fetchProfile(sess.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        devLog('Tab became visible, checking session');
        void supabase.auth.getSession().then(({ data, error }) => {
          if (!mounted) return;
          if (error) {
            console.error('Failed to refresh visible session:', error.message);
            return;
          }
          setSession(data.session);
          setUser(data.session?.user ?? null);
          if (data.session?.user) void fetchProfile(data.session.user.id);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearTimeout(authSafetyTimer);
      if (profileRetryRef.current) window.clearTimeout(profileRetryRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) return { error: error.message };

      // After successful signup, immediately sign in to get session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.warn('Auto sign-in after signup failed:', signInError.message);
        return { error: null }; // Signup succeeded, just auto-login failed
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Signup failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) return { error: error.message };
      if (profile) setProfile({ ...profile, ...updates });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
