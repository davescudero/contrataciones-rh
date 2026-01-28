import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [rolesDebug, setRolesDebug] = useState(null);
  const [loading, setLoading] = useState(true);
  const signInInProgress = useRef(false);
  const initializationDone = useRef(false);

  const fetchUserRoles = useCallback(async (userId) => {
    console.log('=== DEBUG: Fetching roles for user_id:', userId);
    
    const debugInfo = { userId, steps: [], timestamp: new Date().toISOString() };
    
    try {
      // Step 1: Get user_roles records with timeout
      debugInfo.steps.push('Fetching user_roles...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 10s')), 10000)
      );
      
      const queryPromise = supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      const { data: userRolesData, error: userRolesError } = await Promise.race([queryPromise, timeoutPromise]);

      debugInfo.userRolesResult = { data: userRolesData, error: userRolesError?.message || null };
      console.log('=== DEBUG: user_roles result:', JSON.stringify(debugInfo.userRolesResult, null, 2));

      if (userRolesError) {
        debugInfo.steps.push('Error in user_roles query: ' + userRolesError.message);
        setRolesDebug(debugInfo);
        return [];
      }

      if (!userRolesData || userRolesData.length === 0) {
        debugInfo.steps.push('No user_roles records found for this user');
        setRolesDebug(debugInfo);
        return [];
      }

      // Step 2: Get role_ids from user_roles
      const roleIds = userRolesData.map(ur => ur.role_id).filter(Boolean);
      debugInfo.roleIds = roleIds;
      debugInfo.steps.push('Found role_ids: ' + JSON.stringify(roleIds));

      if (roleIds.length === 0) {
        debugInfo.steps.push('No role_ids found in user_roles');
        setRolesDebug(debugInfo);
        return [];
      }

      // Step 3: Get roles by ids
      debugInfo.steps.push('Fetching roles by ids...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .in('id', roleIds);

      debugInfo.rolesResult = { data: rolesData, error: rolesError?.message || null };
      console.log('=== DEBUG: roles result:', JSON.stringify(debugInfo.rolesResult, null, 2));

      if (rolesError) {
        debugInfo.steps.push('Error in roles query: ' + rolesError.message);
        setRolesDebug(debugInfo);
        return [];
      }

      // Step 4: Extract role names
      const roleNames = rolesData?.map(r => r.name).filter(Boolean) || [];
      debugInfo.roleNames = roleNames;
      debugInfo.steps.push('Extracted role names: ' + JSON.stringify(roleNames));
      debugInfo.success = true;
      
      setRolesDebug(debugInfo);
      console.log('=== DEBUG: Final role names:', roleNames);
      
      return roleNames;
    } catch (err) {
      console.error('=== DEBUG: Catch error fetching roles:', err);
      debugInfo.steps.push('Exception: ' + err.message);
      debugInfo.exception = err.message;
      setRolesDebug(debugInfo);
      return [];
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializationDone.current) return;
    initializationDone.current = true;

    let mounted = true;

    const init = async () => {
      console.log('=== DEBUG: Starting auth initialization...');
      
      try {
        // Set a maximum timeout for the entire initialization
        const timeout = setTimeout(() => {
          console.log('=== DEBUG: Init timeout reached, forcing loading=false');
          if (mounted) setLoading(false);
        }, 15000);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('=== DEBUG: getSession result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          error: sessionError?.message 
        });
        
        if (!mounted) {
          clearTimeout(timeout);
          return;
        }

        if (sessionError) {
          console.error('=== DEBUG: Session error:', sessionError);
          setLoading(false);
          clearTimeout(timeout);
          return;
        }

        if (session?.user) {
          console.log('=== DEBUG: User found, id:', session.user.id);
          setUser(session.user);
          
          // Fetch roles but don't block loading on it
          try {
            const roles = await fetchUserRoles(session.user.id);
            if (mounted) setUserRoles(roles);
          } catch (rolesErr) {
            console.error('=== DEBUG: Roles fetch error:', rolesErr);
          }
        }

        clearTimeout(timeout);
        if (mounted) {
          console.log('=== DEBUG: Setting loading=false');
          setLoading(false);
        }
      } catch (err) {
        console.error('=== DEBUG: Init error:', err);
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== DEBUG: Auth state change:', event);
      if (!mounted) return;
      
      if (signInInProgress.current && event === 'SIGNED_IN') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
        setRolesDebug(null);
        setLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        try {
          const roles = await fetchUserRoles(session.user.id);
          if (mounted) setUserRoles(roles);
        } catch (err) {
          console.error('Roles fetch error on auth change:', err);
        }
        if (mounted) setLoading(false);
      } else {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  const signIn = async (email, password) => {
    signInInProgress.current = true;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        signInInProgress.current = false;
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
          const roles = await fetchUserRoles(data.user.id);
          setUserRoles(roles);
        } catch (err) {
          console.error('Roles fetch error on sign in:', err);
        }
      }

      signInInProgress.current = false;
      return { data, error: null };
    } catch (err) {
      signInInProgress.current = false;
      console.error('SignIn error:', err);
      
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
      setRolesDebug(null);
      return { error: null };
    } catch (err) {
      console.error('SignOut error:', err);
      setUser(null);
      setUserRoles([]);
      setRolesDebug(null);
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
    rolesDebug,
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
