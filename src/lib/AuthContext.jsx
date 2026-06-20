import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) { setUser(data.user); setIsAuthenticated(true); }
      setIsLoadingAuth(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const logout = () => { supabase.auth.signOut(); setUser(null); setIsAuthenticated(false); };
  const navigateToLogin = () => { if (typeof window !== 'undefined') window.location.href = '/Admin'; };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth,
      isLoadingPublicSettings: false, authError: null, appPublicSettings: null,
      logout, navigateToLogin, checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within an AuthProvider');
  return c;
};
