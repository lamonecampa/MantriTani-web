import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Sprout } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile
        await updateProfile(user, { displayName: name });
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          displayName: name,
          email: email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error('Auth Error:', err);
      let message = 'Terjadi kesalahan';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Email atau kata sandi salah';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email sudah terdaftar';
      } else if (err.code === 'auth/weak-password') {
        message = 'Kata sandi terlalu lemah';
      } else if (err.message.includes('apiKey')) {
        message = 'Firebase belum terkonfigurasi dengan benar. Silakan hubungi admin.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-forest/10 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-forest/10 border border-slate-100 p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-forest rounded-[24px] flex items-center justify-center mx-auto shadow-xl shadow-forest/20 animate-pulse-slow">
            <span className="text-4xl">👨‍🌾</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">MantriTani</h1>
          <p className="text-slate-500 font-medium text-sm">
            {isLogin ? 'Masuk ke akun Anda' : 'Daftar akun baru'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:ring-2 focus:ring-forest-soft focus:bg-white outline-none transition-all shadow-inner"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alamat Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@tani.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:ring-2 focus:ring-forest-soft focus:bg-white outline-none transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kata Sandi</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:ring-2 focus:ring-forest-soft focus:bg-white outline-none transition-all shadow-inner"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-forest text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-forest/20 flex items-center justify-center gap-2 hover:bg-forest-medium transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-slate-500 hover:text-forest transition-colors"
          >
            {isLogin ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
