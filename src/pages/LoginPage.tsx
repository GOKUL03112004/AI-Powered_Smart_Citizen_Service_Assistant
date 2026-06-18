import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.access_token, username);
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to the server. Is it running?');
      } else {
        setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary-100 rounded-full">
            <LogIn className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-2">Welcome Back</h2>
        <p className="text-center text-neutral-500 mb-8">Sign in to access citizen services</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full justify-center mt-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-primary-600 hover:text-primary-700 font-semibold">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};
