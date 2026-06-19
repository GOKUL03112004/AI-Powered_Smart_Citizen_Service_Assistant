import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const TestComponent = () => {
  const { token, username, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <div data-testid="username-display">{username || 'No User'}</div>
      <div data-testid="token-display">{token || 'No Token'}</div>
      <button onClick={() => login('test-token-123', 'testuser')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default logged-out state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.getByTestId('username-display')).toHaveTextContent('No User');
    expect(screen.getByTestId('token-display')).toHaveTextContent('No Token');
  });

  it('allows a user to log in and updates state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await userEvent.click(loginButton);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('username-display')).toHaveTextContent('testuser');
    expect(screen.getByTestId('token-display')).toHaveTextContent('test-token-123');
    
    expect(localStorage.getItem('token')).toBe('test-token-123');
    expect(localStorage.getItem('username')).toBe('testuser');
  });

  it('allows a user to log out and clears state', async () => {
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('username', 'existing-user');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');

    const logoutButton = screen.getByText('Logout');
    await userEvent.click(logoutButton);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });
  it('initializes with existing data from localStorage on first render', () => {
    localStorage.setItem('token', 'saved-token');
    localStorage.setItem('username', 'saved-user');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('username-display')).toHaveTextContent('saved-user');
    expect(screen.getByTestId('token-display')).toHaveTextContent('saved-token');
  });

  it('throws an error when useAuth is used outside of AuthProvider', () => {
    // Suppress console.error temporarily to avoid cluttering test output with expected errors
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const BadComponent = () => {
      useAuth(); // Should throw error
      return null;
    };

    expect(() => render(<BadComponent />)).toThrowError();
    
    consoleSpy.mockRestore();
  });

  it('handles login sequentially to overwrite previous user data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    // First login
    await userEvent.click(loginButton);
    expect(screen.getByTestId('username-display')).toHaveTextContent('testuser');

    // Simulate another login by calling the hook directly or using a different button
    // We'll add a temporary button to the test component just for this test
    const CustomTestComponent = () => {
      const { login, username } = useAuth();
      return (
        <div>
          <div data-testid="custom-username">{username}</div>
          <button onClick={() => login('new-token-456', 'newuser')}>Login 2</button>
        </div>
      );
    };

    const { unmount } = render(
      <AuthProvider>
        <CustomTestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login 2'));
    expect(screen.getByTestId('custom-username')).toHaveTextContent('newuser');
    expect(localStorage.getItem('token')).toBe('new-token-456');
    expect(localStorage.getItem('username')).toBe('newuser');
    unmount();
  });

  it('handles login with empty strings gracefully', async () => {
    const EmptyLoginComponent = () => {
      const { login, token, username } = useAuth();
      return (
        <div>
          <div data-testid="empty-token">{token || 'empty'}</div>
          <div data-testid="empty-user">{username || 'empty'}</div>
          <button onClick={() => login('', '')}>Login Empty</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <EmptyLoginComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login Empty'));
    // Since we set them to empty strings (falsy), the AuthContext useEffects 
    // will actually treat them as invalid and call localStorage.removeItem().
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('allows logging out multiple times without throwing errors', async () => {
    localStorage.setItem('token', 'active-token');
    localStorage.setItem('username', 'active-user');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    
    // First logout
    await userEvent.click(logoutButton);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    
    // Second logout should be a safe no-op
    await userEvent.click(logoutButton);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
  });

  it('retains authentication state across component re-renders', () => {
    localStorage.setItem('token', 'persisted-token');
    localStorage.setItem('username', 'persisted-user');

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');

    // Force a re-render
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('username-display')).toHaveTextContent('persisted-user');
  });
});
