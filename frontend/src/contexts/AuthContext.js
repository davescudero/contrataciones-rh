import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(ur => ur.roles?.name).filter(Boolean) || [];
    } catch (err) {
      console.error('Error fetching roles:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const roles = await fetchUserRoles(session.user.id);
          if (mounted) setUserRoles(roles);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  // Use direct fetch API to avoid body stream issues
  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error_description || data.msg || data.error || 'Error al iniciar sesión';
        if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credentials')) {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        }
        return { data: null, error: { message: errorMessage } };
      }

      // Set session in Supabase client
      if (data.access_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        const userData = data.user;
        setUser(userData);
        
        if (userData?.id) {
          const roles = await fetchUserRoles(userData.id);
          setUserRoles(roles);
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error('SignIn error:', err);
      return { data: null, error: { message: 'Error de conexión. Intenta de nuevo.' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRoles([]);
      return { error: null };
    } catch (err) {
      console.error('SignOut error:', err);
      setUser(null);
      setUserRoles([]);
      return { error: null };
    }
  };

  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => userRoles.includes(role));
  };

  const value = {
    user,
    userRoles,
    loading,
    signIn,
    signOut,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
