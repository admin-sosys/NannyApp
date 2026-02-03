import React, { useState } from 'react';
import { Card } from '../components/Card';
import { WiiButton } from '../components/WiiButton';
import { api } from '../services/mockSupabase';
import { LogIn, UserPlus } from 'lucide-react';

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await api.auth.signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await api.auth.signUp(email, password);
        if (error) throw error;
        // Auto sign-in or alert message usually happens here, but Supabase signUp auto-signs in by default if email confirm is off
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-wii-blue mb-2 tracking-tight">NannyTime</h1>
        <p className="text-gray-500">Track time, get paid, stay organized.</p>
      </div>

      <Card className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-wii-light p-4 rounded-full">
            {isLogin ? <LogIn size={32} className="text-wii-blue" /> : <UserPlus size={32} className="text-wii-accent" />}
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-wii-blue focus:outline-none transition-colors font-bold text-gray-700"
              placeholder="nanny@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-wii-blue focus:outline-none transition-colors font-bold text-gray-700"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <WiiButton 
            type="submit" 
            variant={isLogin ? 'primary' : 'success'} 
            size="lg" 
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </WiiButton>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-gray-400 hover:text-wii-blue text-sm font-bold underline decoration-2 underline-offset-4 transition-colors"
          >
            {isLogin ? "Need an account? Sign Up" : "Have an account? Sign In"}
          </button>
        </div>
      </Card>
      
      <div className="text-center text-xs text-gray-400 max-w-xs">
        Your data is securely stored and synchronized across your devices.
      </div>
    </div>
  );
};