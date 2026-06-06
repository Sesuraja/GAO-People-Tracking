import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldAlert, PlayCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (mode: 'real' | 'demo') => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess('real');
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isSignUp ? 'Failed to create account' : 'Failed to login'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-[#007BC4]">
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-none mb-2">GAO</h1>
          <span className="text-xs tracking-widest text-[#E0F2FE] font-semibold uppercase">People Tracking</span>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2 outline-none focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] transition"
                placeholder="admin@gaostaff.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2 outline-none focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] transition"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#007BC4] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#0064A0] transition disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
            
            <div className="text-center mt-4 text-sm">
              <span className="text-slate-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="ml-2 text-[#007BC4] font-medium hover:underline focus:outline-none"
              >
                {isSignUp ? 'Sign In' : 'Create one now'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or</span>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              type="button"
              onClick={() => onLoginSuccess('demo')}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 rounded-lg px-4 py-2 font-medium hover:bg-slate-50 hover:border-slate-300 transition flex justify-center items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Demo Mode
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              Demo mode runs completely offline with simulated tracking data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
