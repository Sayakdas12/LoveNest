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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #0d0517 0%, #1a0928 50%, #12061e 100%)' }}>
      <div className="w-full max-w-md p-8 rounded-3xl border border-purple-500/20"
        style={{ background: 'rgba(138,63,160,0.08)', backdropFilter: 'blur(20px)' }}>
        
        <button onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-purple-400 hover:text-pink-300 mb-6 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </button>

        <h1 className="text-3xl font-black text-white mb-2">Forgot Password</h1>
        <p className="text-purple-300 mb-8 text-sm">
          {step === STEPS.EMAIL
            ? "Enter your email and we'll send you a verification code."
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {step === STEPS.EMAIL ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/60 transition-colors"
                style={{ background: 'rgba(138,63,160,0.15)' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="relative">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                maxLength={6}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/60 transition-colors tracking-[0.4em] text-center text-xl"
                style={{ background: 'rgba(138,63,160,0.15)' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep(STEPS.EMAIL)}
              className="w-full text-purple-400 text-sm hover:text-pink-300 transition-colors">
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
