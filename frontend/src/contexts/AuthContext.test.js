import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// Test component to access auth context
const TestComponent = () => {
  const { user, userRoles, loading, signIn, signOut, hasRole, hasAnyRole } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="roles">{userRoles.join(',') || 'no-roles'}</div>
      <button onClick={() => signIn('test@test.com', 'password')} data-testid="sign-in">
        Sign In
      </button>
      <button onClick={signOut} data-testid="sign-out">
        Sign Out
      </button>
      <div data-testid="has-role">{hasRole('PLANEACION') ? 'yes' : 'no'}</div>
      <div data-testid="has-any-role">{hasAnyRole(['PLANEACION', 'RH']) ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    supabase.auth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
  });

  test('provides default values when not authenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('roles')).toHaveTextContent('no-roles');
  });

  test('hasRole returns false when user has no roles', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('has-role')).toHaveTextContent('no');
    expect(screen.getByTestId('has-any-role')).toHaveTextContent('no');
  });

  test('signIn returns error on invalid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' }
    });

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await user.click(screen.getByTestId('sign-in'));

    // User should remain null
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });
});
