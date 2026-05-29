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
        style={{ background: '#050505' }}>
        <div className="text-center">
          <p className="text-xl" style={{ color: 'rgba(220,180,200,0.7)' }}>Invalid reset link.</p>
          <button onClick={() => navigate('/forgot-password')}
            className="mt-4 text-sm transition-all hover:brightness-125"
            style={{ color: 'rgba(196,120,154,0.75)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Request a new one
          </button>
        </div>
      </div>
    );
  }

  const fieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(196,120,154,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    caretColor: '#c4789a',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#050505', color: '#fff' }}>
      {/* Ambient glows */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.12), transparent)' }} />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(196,120,154,0.09), transparent)' }} />

      <div className="w-full max-w-md p-8 rounded-3xl relative"
        style={{ background: 'rgba(18,6,28,0.82)', border: '1px solid rgba(196,120,154,0.18)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

        <h1 className="text-3xl font-black mb-2"
          style={{ background: 'linear-gradient(135deg,#f0d6e8,#c4789a,#8a3fa0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          New Password
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'rgba(220,180,200,0.55)' }}>Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(196,120,154,0.5)' }} />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              minLength={8}
              required
              style={{ ...fieldStyle, paddingLeft: '42px', paddingRight: '44px', paddingTop: '11px', paddingBottom: '11px' }}
              onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
              onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-all hover:brightness-125"
              style={{ color: 'rgba(196,120,154,0.55)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(196,120,154,0.5)' }} />
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
              style={{ ...fieldStyle, paddingLeft: '42px', paddingTop: '11px', paddingBottom: '11px' }}
              onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
              onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-3 rounded-xl text-white font-bold transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
