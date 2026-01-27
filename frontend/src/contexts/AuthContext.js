import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const signInInProgress = useRef(false);

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
      
      // Skip SIGNED_IN event if we're handling it in signIn function
      if (signInInProgress.current && event === 'SIGNED_IN') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
      } else if (session?.user) {
        setUser(session.user);
        const roles = await fetchUserRoles(session.user.id);
        if (mounted) setUserRoles(roles);
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  const signIn = async (email, password) => {
    signInInProgress.current = true;
    
    try {
      // Clone the response to avoid "body already read" error
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        signInInProgress.current = false;
        let errorMessage = error.message;
        
        // Handle "body stream already read" error - this means credentials are invalid
        if (errorMessage.includes('body stream')) {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (errorMessage === 'Invalid login credentials') {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        }
        
        return { data: null, error: { message: errorMessage } };
      }

      if (data?.user) {
        setUser(data.user);
        const roles = await fetchUserRoles(data.user.id);
        setUserRoles(roles);
      }

      signInInProgress.current = false;
      return { data, error: null };
    } catch (err) {
      signInInProgress.current = false;
      console.error('SignIn error:', err);
      
      // The "body stream already read" error is thrown when credentials are invalid
      // because Supabase internally tries to read the error response twice
      const errorMessage = err.message?.includes('body stream') 
        ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
        : 'Error de conexión. Intenta de nuevo.';
      
      return { data: null, error: { message: errorMessage } };
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
