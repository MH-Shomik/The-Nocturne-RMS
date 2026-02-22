// Staff Login – The Nocturne
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ChefHat, Settings, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAppStore } from '../../store';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@nocturne.com', password: 'nocturne2026', icon: <Settings className="w-3.5 h-3.5" />, color: '#FBBF24' },
  { role: 'Kitchen', email: 'kitchen@nocturne.com', password: 'nocturne2026', icon: <ChefHat className="w-3.5 h-3.5" />, color: '#EA580C' },
];

const FloatField: React.FC<{
  label: string; type?: string; value: string;
  onChange: (v: string) => void; icon?: React.ReactNode;
  right?: React.ReactNode; error?: boolean;
}> = ({ label, type = 'text', value, onChange, icon, right, error }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  return (
    <div className="relative group">
      <div className={`flex items-center rounded-xl border transition-all duration-200 ${
        error ? 'border-red-500/60 bg-red-500/5' :
        focused ? 'border-brand-orange/50 bg-white/4 shadow-[0_0_14px_rgba(234,88,12,0.12)]' :
        'border-white/10 bg-white/3 hover:border-white/20'
      }`}>
        {icon && <span className="pl-4 text-white/30">{icon}</span>}
        <div className="relative flex-1 px-4 pt-5 pb-2">
          <label className={`absolute left-4 pointer-events-none transition-all duration-200 font-semibold ${
            lifted ? 'top-1.5 text-[10px] tracking-widest uppercase' : 'top-1/2 -translate-y-1/2 text-sm'
          } ${focused ? 'text-brand-orange' : 'text-white/35'}`}>
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-white/90 text-sm outline-none pt-1"
          />
        </div>
        {right && <div className="pr-3">{right}</div>}
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const { setUser } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError(''); setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);
    if (result.success && result.data?.id) {
      setUser(result.data);
      navigate('/management');
    } else {
      // Demo mode: derive role from email and mock a user
      if (email.includes('kitchen')) {
        setUser({ id: 'demo-kitchen', email, role: 'kitchen', name: 'Kitchen Staff', createdAt: new Date() });
        navigate('/kitchen');
      } else {
        setUser({ id: 'demo-admin', email, role: 'admin', name: 'Admin User', createdAt: new Date() });
        navigate('/management');
      }
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[number]) => {
    setEmail(acc.email); setPassword(acc.password); setError('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 font-sans"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(234,88,12,0.08) 0%, #080604 50%)' }}
    >
      {/* Back to site */}
      <Link
        to="/"
        className="fixed top-6 left-8 flex items-center gap-2 text-white/35 hover:text-white/70 text-xs font-semibold tracking-widest uppercase transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> The Nocturne
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
          >N</div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Staff Portal</h1>
          <p className="text-white/35 text-sm mt-1 tracking-wide">The Nocturne — Access your dashboard</p>
        </div>

        {/* Demo accounts */}
        <div className="mb-6 p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-3">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8 hover:border-white/20 transition-all text-left"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span style={{ color: acc.color }}>{acc.icon}</span>
                <div>
                  <p className="text-white/70 text-[11px] font-bold">{acc.role}</p>
                  <p className="text-white/30 text-[9px] truncate">{acc.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl border border-white/8 p-6"
          style={{ background: 'rgba(14,11,8,0.92)', backdropFilter: 'blur(20px)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatField
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              error={!!error && !email}
            />
            <FloatField
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              error={!!error && !password}
              right={
                <button type="button" onClick={() => setShowPass(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.3)' }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-white/20 text-[10px] mt-4 tracking-wide">
            Password for all demo accounts: <span className="text-white/40 font-mono">nocturne2026</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
