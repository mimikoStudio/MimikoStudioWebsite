import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please set up environment variables.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-champagne/10 flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-espresso">Admin Dashboard</h1>
          <p className="text-sm text-espresso/50 mt-2">Mimiko Studio | Fabric Art</p>
        </div>

        <form onSubmit={handleLogin} className="bg-pearl border border-beige/20 rounded-sm p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
              {error}
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-champagne/5 border border-champagne/20 rounded-sm">
              <p className="text-sm text-espresso/70">
                <strong>Setup Required:</strong> Configure your Supabase credentials in the environment variables to enable authentication.
              </p>
              <a href="#/setup" className="text-xs text-champagne underline mt-2 inline-block">View Setup Guide →</a>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">
              <Mail size={12} className="inline mr-1" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-luxury"
              placeholder="admin@mimikostudio.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">
              <Lock size={12} className="inline mr-1" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-luxury pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-champagne"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-luxury-filled w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-espresso/40 mt-6">
          Authorized personnel only. All access is monitored.
        </p>
      </div>
    </div>
  );
}
