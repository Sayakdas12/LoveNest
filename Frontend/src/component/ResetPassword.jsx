import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { BaseUrl } from '../utils/constance';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match!'); return; }
    if (!token) { toast.error('Invalid or expired reset link.'); return; }
    setLoading(true);
    try {
      await axios.post(`${BaseUrl}/auth/reset-password`, { token, newPassword: password });
      toast.success('Password updated! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Try requesting a new code.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #0d0517 0%, #1a0928 50%, #12061e 100%)' }}>
        <div className="text-center text-purple-300">
          <p className="text-xl">Invalid reset link.</p>
          <button onClick={() => navigate('/forgot-password')}
            className="mt-4 underline text-pink-300 hover:text-pink-200">
            Request a new one
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #0d0517 0%, #1a0928 50%, #12061e 100%)' }}>
      <div className="w-full max-w-md p-8 rounded-3xl border border-purple-500/20"
        style={{ background: 'rgba(138,63,160,0.08)', backdropFilter: 'blur(20px)' }}>

        <h1 className="text-3xl font-black text-white mb-2">New Password</h1>
        <p className="text-purple-300 mb-8 text-sm">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              minLength={8}
              required
              className="w-full pl-11 pr-12 py-3 rounded-xl text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/60 transition-colors"
              style={{ background: 'rgba(138,63,160,0.15)' }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-pink-300">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/60 transition-colors"
              style={{ background: 'rgba(138,63,160,0.15)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-3 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
