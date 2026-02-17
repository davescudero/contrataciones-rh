import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../lib/logger';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const signInInProgress = useRef(false);

  const fetchUserRoles = useCallback(async (userId) => {
    setRolesLoading(true);
    try {
      // Get user_roles records
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (userRolesError) {
        logger.error('AuthContext', 'Error fetching user_roles', userRolesError);
        return [];
      }

      if (!userRolesData || userRolesData.length === 0) {
        return [];
      }

      // Get role_ids from user_roles
      const roleIds = userRolesData.map(ur => ur.role_id).filter(Boolean);

      if (roleIds.length === 0) {
        return [];
      }

      // Get roles by ids
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .in('id', roleIds);

      if (rolesError) {
        logger.error('AuthContext', 'Error fetching roles', rolesError);
        return [];
      }

      // Extract role names
      const roleNames = rolesData?.map(r => r.name).filter(Boolean) || [];
      return roleNames;
    } catch (err) {
      logger.error('AuthContext', 'Error fetching user roles', err);
      return [];
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const loadUserRolesWithRetry = useCallback(async (userId) => {
    const maxAttempts = 3;
    const delayMs = 700;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const roles = await fetchUserRoles(userId);
      if (roles.length > 0) {
        return roles;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return [];
  }, [fetchUserRoles]);

  useEffect(() => {
    let mounted = true;
    let timeoutId = null;

    const init = async () => {
      // Safety timeout - if init takes more than 5 seconds, force initialize
      timeoutId = setTimeout(() => {
        if (mounted) {
          logger.warn('AuthContext', 'Init timeout - forcing initialization');
          setLoading(false);
          setInitialized(true);
        }
      }, 5000);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          logger.error('AuthContext', 'Session error', sessionError);
          setUser(null);
          setUserRoles([]);
        } else if (session?.user) {
          setUser(session.user);
          
          try {
            const roles = await loadUserRolesWithRetry(session.user.id);
            if (mounted) setUserRoles(roles);
            if (mounted && roles.length === 0) {
              logger.warn('AuthContext', 'No roles found after retries, forcing re-auth');
              await supabase.auth.signOut();
              setUser(null);
              setUserRoles([]);
            }
          } catch (rolesErr) {
            logger.error('AuthContext', 'Roles fetch error', rolesErr);
          }
        } else {
          // No hay sesión activa
          setUser(null);
          setUserRoles([]);
        }
      } catch (err) {
        logger.error('AuthContext', 'Auth init error', err);
        setUser(null);
        setUserRoles([]);
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Skip if signIn is handling this event
      if (signInInProgress.current && event === 'SIGNED_IN') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
      } else if (session?.user) {
        setUser(session.user);
        try {
          const roles = await loadUserRolesWithRetry(session.user.id);
          if (mounted) setUserRoles(roles);
          if (mounted && roles.length === 0) {
            logger.warn('AuthContext', 'No roles found after retries on auth change, forcing re-auth');
            await supabase.auth.signOut();
            setUser(null);
            setUserRoles([]);
          }
        } catch (err) {
          logger.error('AuthContext', 'Roles fetch error on auth change', err);
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserRoles, loadUserRolesWithRetry]);

  const signIn = async (email, password) => {
    signInInProgress.current = true;
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        signInInProgress.current = false;
        setLoading(false);
        let errorMessage = error.message;
        
        if (errorMessage.includes('body stream')) {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (errorMessage === 'Invalid login credentials') {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        }
        
        return { data: null, error: { message: errorMessage } };
      }

      if (data?.user) {
        setUser(data.user);
        try {
          const roles = await loadUserRolesWithRetry(data.user.id);
          setUserRoles(roles);
          logger.debug('AuthContext', 'Roles loaded on sign in', { roles });
          if (roles.length === 0) {
            logger.warn('AuthContext', 'No roles found after retries on sign in, forcing re-auth');
            await supabase.auth.signOut();
            setUser(null);
            setUserRoles([]);
            return { data: null, error: { message: 'Tu usuario no tiene roles asignados.' } };
          }
        } catch (err) {
          logger.error('AuthContext', 'Roles fetch error on sign in', err);
        }
      }

      signInInProgress.current = false;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      signInInProgress.current = false;
      setLoading(false);
      logger.error('AuthContext', 'SignIn error', err);
      
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
      logger.error('AuthContext', 'SignOut error', err);
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
    initialized,
    rolesLoading,
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
