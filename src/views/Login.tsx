import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { Shield, Lock, User as UserIcon, Wallet, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'admin' | 'analyst' | 'viewer'>('viewer');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const { loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword, error: authError, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 10) strength += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['WEAK', 'FAIR', 'GOOD', 'STRONG'];
  const strengthColors = ['bg-expense', 'bg-cat-amber', 'bg-cat-teal', 'bg-cat-emerald'];

  const requirements = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Uppercase & Lowercase', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Number or Symbol', met: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSuccess(null);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setLocalError('SECURITY KEYS DO NOT MATCH');
        return;
      }
      if (strength < 2) {
        setLocalError('SECURITY KEY IS TOO WEAK');
        return;
      }
    }

    try {
      if (isLogin) {
        await loginWithEmail(email, password, role);
      } else {
        await signupWithEmail(email, password, displayName, role);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setLocalError('EMAIL/PASSWORD SIGNUP IS CURRENTLY DISABLED IN THE FIREBASE CONSOLE. PLEASE CONTACT THE ADMINISTRATOR TO ENABLE IT.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(role);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLocalError('PLEASE ENTER YOUR EMAIL ADDRESS FIRST');
      return;
    }
    setLocalError(null);
    setResetSuccess(null);
    try {
      await resetPassword(email);
      setResetSuccess('PASSWORD RESET EMAIL SENT. PLEASE CHECK YOUR INBOX.');
    } catch (err: any) {
      // Error is handled in context
    }
  };

  const roleColors = {
    admin: 'bg-cat-indigo',
    analyst: 'bg-cat-amber',
    viewer: 'bg-cat-teal'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-8 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cat-rose/5 rounded-full blur-[120px]" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-cat-indigo/5 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface rounded-[2.5rem] p-12 relative z-10 card-shadow border border-white/50"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-xl shadow-accent/30 mx-auto mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight uppercase mb-2">MY LEDGER</h1>
          <p className="text-[11px] font-bold text-muted uppercase tracking-[0.3em]">
            {isLogin ? 'SECURE ACCESS PORTAL' : 'CREATE NEW ACCOUNT'}
          </p>
        </div>

        <div 
          className="flex bg-bg p-1 rounded-2xl mb-8" 
          role="tablist" 
          aria-label="Authentication Mode"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              setIsLogin(!isLogin);
            }
          }}
        >
          <button 
            onClick={() => {
              setIsLogin(true);
              setLocalError(null);
              setResetSuccess(null);
            }}
            className={cn(
              "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all outline-none focus:ring-2 focus:ring-accent/20",
              isLogin ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-text"
            )}
            role="tab"
            aria-selected={isLogin}
            aria-controls="auth-form"
            tabIndex={isLogin ? 0 : -1}
          >
            LOG IN
          </button>
          <button 
            onClick={() => {
              setIsLogin(false);
              setLocalError(null);
              setResetSuccess(null);
            }}
            className={cn(
              "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all outline-none focus:ring-2 focus:ring-accent/20",
              !isLogin ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-text"
            )}
            role="tab"
            aria-selected={!isLogin}
            aria-controls="auth-form"
            tabIndex={!isLogin ? 0 : -1}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" id="auth-form">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                DISPLAY NAME
              </label>
              <input 
                id="displayName"
                type="text" 
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none uppercase tracking-widest transition-all focus:ring-2 focus:ring-accent/10"
                placeholder="YOUR NAME"
                aria-required="true"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              EMAIL ADDRESS
            </label>
            <input 
              id="email"
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none uppercase tracking-widest transition-all focus:ring-2 focus:ring-accent/10"
              placeholder="EMAIL@MYLEDGER.COM"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cat-rose" aria-hidden="true" />
              SECURITY KEY
            </label>
            <input 
              id="password"
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none transition-all focus:ring-2 focus:ring-accent/10"
              placeholder="••••••••"
              aria-required="true"
              aria-describedby={!isLogin && password ? "password-strength" : undefined}
            />
            {isLogin && (
              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[9px] font-bold text-accent hover:text-accent/80 uppercase tracking-widest transition-all outline-none focus:underline"
                >
                  FORGOT SECURITY KEY?
                </button>
              </div>
            )}
            {!isLogin && password && (
              <div className="space-y-4 px-1" id="password-strength" role="status">
                <div className="space-y-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          strength >= step ? strengthColors[strength - 1] : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-muted uppercase tracking-widest">STRENGTH:</span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-widest",
                      strength > 0 ? strengthColors[strength - 1].replace('bg-', 'text-') : "text-muted"
                    )}>
                      {strength > 0 ? strengthLabels[strength - 1] : 'TOO SHORT'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 border-t border-border pt-3">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        req.met ? "bg-cat-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-border"
                      )} />
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest transition-all",
                        req.met ? "text-text" : "text-muted"
                      )}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cat-rose" aria-hidden="true" />
                CONFIRM SECURITY KEY
              </label>
              <input 
                id="confirmPassword"
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none transition-all focus:ring-2 focus:ring-accent/10"
                placeholder="••••••••"
                aria-required="true"
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cat-emerald" aria-hidden="true" />
              {isLogin ? 'ACCESS AS ROLE' : 'INITIAL ACCESS LEVEL'}
            </label>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Select Access Level">
              {(['admin', 'analyst', 'viewer'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "py-3 rounded-xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all outline-none focus:ring-2 focus:ring-accent/20",
                    role === r 
                      ? `${roleColors[r]} border-transparent text-white shadow-lg` 
                      : "border-border text-muted hover:border-accent"
                  )}
                  role="radio"
                  aria-checked={role === r}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {(authError || localError || resetSuccess) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest leading-relaxed text-center",
                resetSuccess 
                  ? "border-success/20 bg-success/5 text-success" 
                  : "border-expense/20 bg-expense/5 text-expense"
              )}
              role="alert"
            >
              {resetSuccess || localError || authError}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-bold text-xs py-5 rounded-2xl shadow-xl shadow-accent/30 hover:bg-accent/90 transition-all uppercase mt-2 disabled:opacity-50 flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-accent/20"
            aria-busy={loading}
          >
            {loading ? 'VERIFYING...' : (
              <>
                {isLogin ? 'AUTHORIZE ACCESS' : 'CREATE ACCOUNT'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase">
            <span className="bg-surface px-4 text-muted tracking-widest">OR CONTINUE WITH</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-surface border border-border text-text font-bold text-xs py-4 rounded-2xl hover:bg-bg transition-all uppercase flex items-center justify-center gap-3 shadow-sm outline-none focus:ring-2 focus:ring-accent/10"
          aria-label="Sign in with Google Account"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          GOOGLE ACCOUNT
        </button>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto">
            UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED. ALL SESSIONS ARE MONITORED.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
