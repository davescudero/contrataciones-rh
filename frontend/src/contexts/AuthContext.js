import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSigningIn = useRef(false);

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
      
      // Skip if we're in the middle of signing in (to avoid double processing)
      if (isSigningIn.current && event === 'SIGNED_IN') {
        return;
      }

      if (session?.user) {
        setUser(session.user);
        const roles = await fetchUserRoles(session.user.id);
        if (mounted) setUserRoles(roles);
      } else {
        setUser(null);
        setUserRoles([]);
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  const signIn = async (email, password) => {
    isSigningIn.current = true;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        isSigningIn.current = false;
        return { data: null, error };
      }

      if (data?.user) {
        setUser(data.user);
        const roles = await fetchUserRoles(data.user.id);
        setUserRoles(roles);
      }

      isSigningIn.current = false;
      return { data, error: null };
    } catch (err) {
      isSigningIn.current = false;
      console.error('SignIn error:', err);
      return { data: null, error: { message: 'Error de conexión. Intenta de nuevo.' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setUserRoles([]);
      }
      return { error };
    } catch (err) {
      console.error('SignOut error:', err);
      return { error: { message: 'Error al cerrar sesión' } };
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
