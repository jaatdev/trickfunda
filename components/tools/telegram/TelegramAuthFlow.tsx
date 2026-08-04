import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Key, Phone, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onAuthenticated: (username: string) => void;
}

export const TelegramAuthFlow: React.FC<Props> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [tempSession, setTempSession] = useState('');

  const handleSendCode = async () => {
    if (!apiId || !apiHash || !phone) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tools/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendCode', apiId, apiHash, phone })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPhoneCodeHash(data.phoneCodeHash);
      setTempSession(data.tempSession);
      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tools/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'signIn', 
          apiId, apiHash, phone, phoneCodeHash, phoneCode: code, tempSession 
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (data.requiresPassword) {
        setTempSession(data.tempSession);
        setStep('password');
      } else {
        checkStatus();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tools/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'checkPassword', 
          apiId, apiHash, password, tempSession 
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      checkStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    const res = await fetch('/api/tools/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
    });
    const data = await res.json();
    if (data.authenticated) {
        onAuthenticated(data.user);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl p-8 max-w-md w-full mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
          <Send className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Telegram</h2>
        <p className="text-sm text-gray-400">
          Log in once to download restricted media. Your session is saved locally.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">API ID</label>
              <input
                type="text"
                value={apiId}
                onChange={e => setApiId(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">API HASH</label>
              <input
                type="text"
                value={apiHash}
                onChange={e => setApiHash(e.target.value)}
                placeholder="e.g. 0123456789abcdef0123456789abcdef"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading || !apiId || !apiHash || !phone}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Login Code'}
            </button>
          </motion.div>
        )}

        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <p className="text-sm text-gray-300">We sent a code to <b className="text-white">{phone}</b> via Telegram.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Login Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="12345"
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={loading || !code}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
            </button>
          </motion.div>
        )}

        {step === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-sm text-gray-300">Two-Step Verification is enabled.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your 2FA password"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <button
              onClick={handleVerifyPassword}
              disabled={loading || !password}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Password'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
