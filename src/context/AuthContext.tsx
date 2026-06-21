import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const fetchProfile = useCallback(async (uid: string, email: string): Promise<User> => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (existing) {
      return {
        id: existing.id,
        email: existing.email,
        role: existing.role as 'admin' | 'user',
        username: existing.username,
        avatar: existing.avatar || '',
      };
    }

    const username = email.split('@')[0];
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);

    await supabase.from('profiles').insert({
      id: uid,
      email,
      username: displayName,
      role: 'user',
      avatar: '',
    });

    return { id: uid, email, role: 'user' as const, username: displayName, avatar: '' };
  }, []);

  const loadUserProfile = useCallback(async (uid: string, email?: string) => {
    if (!email) {
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchProfile(uid, email);
      setUser(profile);
      localStorage.setItem('raaga_user', JSON.stringify(profile));
    } catch {
      setUser(null);
      localStorage.removeItem('raaga_user');
    }
    setLoading(false);
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    await loadUserProfile(session.user.id, session.user.email);
  }, [session, loadUserProfile]);

  useEffect(() => {
    localStorage.removeItem('raaga_user');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        localStorage.removeItem('raaga_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return error.message;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user.id, session.user.email);
    }

    return null;
  };

  const signup = async (email: string, password: string): Promise<string | null> => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return error.message;
    }

    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('raaga_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshProfile, loading, session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
