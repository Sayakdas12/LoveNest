import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { BaseUrl } from '../utils/constance';

const STEPS = { EMAIL: 'email', OTP: 'otp' };

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${BaseUrl}/auth/forgot-password`, { email });
      toast.success('OTP sent! Check your email.');
      setStep(STEPS.OTP);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BaseUrl}/auth/verify-otp`, { email, otp });
      toast.success('OTP verified!');
      navigate(`/reset-password?token=${res.data.resetToken}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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

        <button onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm mb-6 transition-all hover:brightness-125"
          style={{ color: 'rgba(196,120,154,0.65)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back to Login
        </button>

        <h1 className="text-3xl font-black mb-2"
          style={{ background: 'linear-gradient(135deg,#f0d6e8,#c4789a,#8a3fa0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Forgot Password
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'rgba(220,180,200,0.55)' }}>
          {step === STEPS.EMAIL
            ? "Enter your email and we'll send you a verification code."
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {step === STEPS.EMAIL ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(196,120,154,0.5)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(196,120,154,0.2)',
                  borderRadius: '12px',
                  padding: '11px 14px 11px 42px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  caretColor: '#c4789a',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(196,120,154,0.5)' }} />
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                maxLength={6}
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(196,120,154,0.2)',
                  borderRadius: '12px',
                  padding: '11px 14px 11px 42px',
                  color: '#fff',
                  fontSize: '20px',
                  letterSpacing: '0.4em',
                  textAlign: 'center',
                  outline: 'none',
                  caretColor: '#c4789a',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'}
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl text-white font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep(STEPS.EMAIL)}
              className="w-full text-sm transition-all hover:brightness-125"
              style={{ color: 'rgba(196,120,154,0.65)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
