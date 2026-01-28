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

  const fetchUserRoles = useCallback(async (userId) => {
    console.log('=== DEBUG: Fetching roles for user_id:', userId);
    
    const debugInfo = { userId, steps: [] };
    
    try {
      // Step 1: Get user_roles records
      debugInfo.steps.push('Fetching user_roles...');
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      debugInfo.userRolesResult = { data: userRolesData, error: userRolesError };
      console.log('=== DEBUG: user_roles result:', JSON.stringify({ data: userRolesData, error: userRolesError }, null, 2));

      if (userRolesError) {
        debugInfo.steps.push('Error in user_roles query: ' + userRolesError.message);
        setRolesDebug(debugInfo);
        return [];
      }

      if (!userRolesData || userRolesData.length === 0) {
        debugInfo.steps.push('No user_roles records found');
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

      debugInfo.rolesResult = { data: rolesData, error: rolesError };
      console.log('=== DEBUG: roles result:', JSON.stringify({ data: rolesData, error: rolesError }, null, 2));

      if (rolesError) {
        debugInfo.steps.push('Error in roles query: ' + rolesError.message);
        setRolesDebug(debugInfo);
        return [];
      }

      // Step 4: Extract role names
      const roleNames = rolesData?.map(r => r.name).filter(Boolean) || [];
      debugInfo.roleNames = roleNames;
      debugInfo.steps.push('Extracted role names: ' + JSON.stringify(roleNames));
      
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
    let mounted = true;

    const init = async () => {
      try {
        console.log('=== DEBUG: Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('=== DEBUG: Session:', session ? 'exists' : 'null');
        
        if (!mounted) return;

        if (session?.user) {
          console.log('=== DEBUG: User found, id:', session.user.id);
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
      console.log('=== DEBUG: Auth state change:', event);
      if (!mounted) return;
      
      if (signInInProgress.current && event === 'SIGNED_IN') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
        setRolesDebug(null);
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
        const roles = await fetchUserRoles(data.user.id);
        setUserRoles(roles);
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
