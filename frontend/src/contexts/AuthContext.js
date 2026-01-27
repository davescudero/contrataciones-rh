import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const processingAuth = useRef(false);

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
      if (!mounted || processingAuth.current) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
      } else if (session?.user && event === 'SIGNED_IN') {
        // Only process if we didn't already handle it in signIn
        if (!user || user.id !== session.user.id) {
          setUser(session.user);
          const roles = await fetchUserRoles(session.user.id);
          if (mounted) setUserRoles(roles);
        }
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles, user]);

  const signIn = async (email, password) => {
    processingAuth.current = true;
    
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle the response carefully to avoid body stream issues
      const { data, error } = response;

      if (error) {
        processingAuth.current = false;
        // Translate common error messages
        let errorMessage = error.message;
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        }
        return { data: null, error: { message: errorMessage } };
      }

      if (data?.user) {
        setUser(data.user);
        const roles = await fetchUserRoles(data.user.id);
        setUserRoles(roles);
      }

      processingAuth.current = false;
      return { data, error: null };
    } catch (err) {
      processingAuth.current = false;
      console.error('SignIn catch error:', err);
      
      // Handle the specific "body stream already read" error
      if (err.message?.includes('body stream')) {
        return { data: null, error: { message: 'Credenciales inválidas. Verifica tu correo y contraseña.' } };
      }
      
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
