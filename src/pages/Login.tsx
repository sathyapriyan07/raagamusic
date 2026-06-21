import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, AlertCircle, Lock, Mail, UserPlus, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const err = isSignUp ? await signup(email, password) : await login(email, password);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else if (!isSignUp) {
      navigate('/');
    } else {
      setError('Account created! Check your email to confirm sign-up.');
      setIsSignUp(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 md:py-24">
      <div 
        className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(29, 185, 84, 0.05)'
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1db954]/20 mb-4">
            <Music className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white">
            {isSignUp ? 'Create Account' : 'Welcome to Raaga'}
          </h2>
          <p className="text-sm text-white/50 mt-1 max-w-[280px]">
            {isSignUp ? 'Sign up to start your music journey.' : 'Sign in to explore music, albums, and artists.'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white/60 tracking-wider uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1d1d1d] hover:bg-[#252525] focus:bg-[#252525] border border-white/5 focus:border-[#1DB954]/40 text-white placeholder-white/20 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 tracking-wider uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1d1d1d] hover:bg-[#252525] focus:bg-[#252525] border border-white/5 focus:border-[#1DB954]/40 text-white placeholder-white/20 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold text-sm tracking-wide shadow-lg shadow-[#1db954]/10 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submitting ? 'Please wait...' : isSignUp ? (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            ) : (
              <><LogIn className="w-4 h-4" /> Sign In</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-sm text-white/40 hover:text-[#1DB954] transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
