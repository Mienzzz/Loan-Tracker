
import React, { useState } from 'react';
import { Lock, User, Wallet } from 'lucide-react';
import { USERS, User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowerUser = username.toLowerCase();
    
    if (lowerUser === 'firman' && password === 'angka1saja') {
      onLogin(USERS.find(u => u.id === 'firman')!);
    } else if (lowerUser === 'tommy' && password === 'semangat45') {
      onLogin(USERS.find(u => u.id === 'tommy')!);
    } else if (lowerUser === 'anggi' && password === 'semangat45') {
      onLogin(USERS.find(u => u.id === 'anggi')!);
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-xl overflow-hidden justify-center px-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
          <Wallet className="w-10 h-10 text-white -rotate-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Loan Tracker</h1>
        <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Internal Debt Management</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Masukkan username"
              className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              placeholder="Masukkan password"
              className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 py-2 rounded-lg">{error}</p>
        )}

        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          Login Sekarang
        </button>
      </form>

      <p className="text-center mt-10 text-[10px] text-slate-400 uppercase font-bold tracking-tighter leading-relaxed">
        Pencatatan Hutang Terpadu<br/>Firman, Tommy & Anggi
      </p>
    </div>
  );
};

export default Login;
