import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro do AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for existing session on app boot
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.warn('[AuthContext] getSession error:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Listen for future auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Auth Actions ───────────────────────────────────────────────────────────

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, username) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const getProfile = async () => {
    if (!user) return { data: null, error: new Error('Não autenticado') };
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Não autenticado') };
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
  };

  // ─── Value ──────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        getProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
