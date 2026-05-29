import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { BaseUrl } from '../../utils/constance';

export default function ChatLockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    try {
      await axios.post(`${BaseUrl}/profile/chat-lock/verify`, { password }, { withCredentials: true });
      onUnlock?.();
    } catch {
      toast.error('Incorrect password. Try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}>
      <div className="text-center w-full max-w-sm mx-4 p-8 rounded-3xl border border-purple-500/30"
        style={{ background: 'linear-gradient(160deg, #1a0928, #12061e)' }}>

        <Lock size={48} className="mx-auto mb-4" style={{ color: '#c4789a' }} />
        <h2 className="text-2xl font-black text-white mb-2">Chat Lock</h2>
        <p className="text-purple-300 text-sm mb-6">Enter your chat lock password to continue.</p>

        <form onSubmit={verify} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Chat lock password"
              required
              autoFocus
              className="w-full pl-11 pr-12 py-3 rounded-xl text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/60 transition-colors"
              style={{ background: 'rgba(138,63,160,0.15)' }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-pink-300">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={!password || loading}
            className="w-full py-3 rounded-xl text-white font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
