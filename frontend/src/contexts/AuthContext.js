import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let mounted = true;

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!mounted) return;

    if (session?.user) {
      setUser(session.user);
      await fetchUserRoles(session.user.id);
    }
    setLoading(false);
  };

  init();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!mounted) return;

    if (session?.user) {
      setUser(session.user);
      await fetchUserRoles(session.user.id);
    } else {
      setUser(null);
      setUserRoles([]);
    }
    setLoading(false);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);


  const fetchUserRoles = async (userId) => {
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
        setUserRoles([]);
        return;
      }

      const roles = data?.map(ur => ur.roles?.name).filter(Boolean) || [];
      setUserRoles(roles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setUserRoles([]);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      console.error('SignIn error:', err);
      return { data: null, error: { message: 'Error de conexión. Intenta de nuevo.' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setUserRoles([]);
    }
    return { error };
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
