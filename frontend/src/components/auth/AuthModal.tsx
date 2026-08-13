import React, { useState } from 'react';
import { Activity, Mail, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithEmail, signupWithEmail, loginWithSocial, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup' | 'phone'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else if (mode === 'signup') {
        await signupWithEmail(email, password);
      } else if (mode === 'phone') {
        if (!otpSent) {
          await sendPhoneOtp(phone);
          setOtpSent(true);
          setIsLoading(false);
          return;
        } else {
          await verifyPhoneOtp(phone, otp);
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithSocial(provider);
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to continue with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50">
        {/* Glow Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 mb-3 shadow-lg shadow-cyan-500/20">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('auth.welcome_title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {t('auth.welcome_subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode !== 'phone' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      {t('auth.enter_otp')}
                    </label>
                    <span className="text-[11px] text-cyan-400 font-mono">
                      {t('auth.demo_otp_hint')}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center tracking-widest text-lg font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
          >
            <span>
              {mode === 'phone'
                ? (otpSent ? t('auth.verify_otp') : t('auth.send_otp'))
                : (mode === 'signup' ? t('auth.create_account') : t('auth.sign_in'))}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Social Options */}
        <div className="mt-5">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">
              {t('auth.or_continue_with')}
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-2">
            <button
              onClick={() => handleSocial('google')}
              className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => handleSocial('apple')}
              className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.22.67-2.91 1.47-.59.68-1.12 1.83-.98 2.93 1.12.09 2.24-.56 2.9-1.36z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'phone' ? 'signin' : 'phone');
              setOtpSent(false);
              setError(null);
            }}
            className="w-full mt-2.5 py-2 px-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 transition flex items-center justify-center space-x-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mode === 'phone' ? 'Use Email / Password Instead' : t('auth.continue_phone')}</span>
          </button>
        </div>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-5 text-center">
          {mode === 'signin' ? (
            <button
              onClick={() => setMode('signup')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              {t('auth.dont_have_account')}
            </button>
          ) : (
            <button
              onClick={() => setMode('signin')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              {t('auth.already_have_account')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
