import React, { useState } from 'react';
import axios from 'axios';
import { setUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { BaseUrl } from '../utils/constance';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';

/* ─── Inline styles (matches Landing.jsx design system) ──────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');
  .lg-serif { font-family: 'Playfair Display', serif !important; }
  .lg-sans  { font-family: 'Inter', sans-serif; }
  .lg-field input::placeholder { color: rgba(200,160,180,0.35); }
  .lg-field:focus-within {
    border-color: rgba(233,77,122,0.5) !important;
    box-shadow: 0 0 0 3px rgba(233,77,122,0.10), 0 0 24px rgba(233,77,122,0.06);
  }
  @keyframes lg-drift {
    0%,100% { transform: translateY(0) rotate(-1deg); }
    50%      { transform: translateY(-22px) rotate(1.5deg); }
  }
  .lg-drift { animation: lg-drift 14s ease-in-out infinite; }
  .lg-noise {
    position: absolute; inset: 0; pointer-events: none; z-index: 2;
    opacity: 0.028; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
`;

/* ─── Framer stagger helper ───────────────────────────────────────────── */
const up = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] },
});

const Login = () => {
  const [emailId, setEmailId]       = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(BaseUrl + "/login", { emailId, password }, { withCredentials: true });
      dispatch(setUser(res.data));
      toast.success(`Welcome back, ${res.data.firstName}! 💕`);
      navigate("/feed");
    } catch (error) {
      toast.error(error.response?.data || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post(BaseUrl + "/auth/google", { idToken }, { withCredentials: true });
      dispatch(setUser(res.data));
      toast.success(`Welcome, ${res.data.firstName}! 💕`);
      navigate("/feed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex lg-sans" style={{ background: '#050505', color: '#fff' }}>
      <style>{STYLES}</style>

      {/* ══ LEFT PANEL — cinematic visual (desktop only) ════════════════ */}
      <div
        className="hidden lg:flex relative flex-col justify-between w-[46%] overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #0c0314 0%, #180626 55%, #07010d 100%)' }}
      >
        {/* Film grain */}
        <div className="lg-noise" />

        {/* Atmospheric bg image — same as Landing hero */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <img
            src="https://framerusercontent.com/images/9zvwRJAavKKacVyhFCwHyXW1U.png?width=1200"
            alt=""
            className="w-full h-full object-cover object-center opacity-45"
            style={{ filter: 'hue-rotate(320deg) saturate(1.1) brightness(0.65)', mixBlendMode: 'screen' }}
          />
          {/* Fade-out on right edge toward form panel */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 55%, #050505 100%)' }} />
        </div>

        {/* Floating hand — top-left corner */}
        <div
          className="absolute top-[-8%] left-[-6%] w-[62%] pointer-events-none select-none z-[3] lg-drift"
          style={{ mixBlendMode: 'hard-light', opacity: 0.78 }}
        >
          <img
            src="https://framerusercontent.com/images/KNhiA5A2ykNYqNkj04Hk6BVg5A.png?width=900"
            alt=""
            className="w-full h-auto object-contain"
            style={{ filter: 'hue-rotate(320deg) saturate(1.2) brightness(0.85)' }}
          />
        </div>

        {/* Ambient glow — back-light the top-left hand */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none z-[2]"
          style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.14), transparent 70%)', filter: 'blur(55px)' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none z-[2]"
          style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.18), transparent 70%)', filter: 'blur(45px)' }} />

        {/* Panel content */}
        <div className="relative z-[4] p-12 flex flex-col h-full justify-between">
          {/* Logo */}
          <Logo size="md" linked />

          {/* Serif quote */}
          <div className="max-w-xs">
            <p
              className="text-[2.6rem] leading-[1.18] mb-6 lg-serif"
              style={{ color: '#ffe0e0', textShadow: '0 0 40px rgba(233,77,122,0.25)' }}
            >
              <em>Where every<br />heartbeat finds<br />its echo.</em>
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,224,224,0.42)' }}>
              Millions of real connections. One platform built for love that lasts.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-10">
            {[['2M+', 'Couples'], ['98%', 'Match rate'], ['4.9★', 'Rating']].map(([num, label]) => (
              <div key={label}>
                <p className="text-lg font-semibold" style={{ color: '#e94d7a' }}>{num}</p>
                <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,200,216,0.35)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — form ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden"
        style={{ background: '#050505' }}>

        {/* Back to landing */}
        <Link
          to="/home"
          className="absolute top-5 right-5 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:bg-white/10 group z-20"
          style={{ color: 'rgba(255,200,216,0.75)', border: '1px solid rgba(196,120,154,0.25)' }}
        >
          <ArrowLeft size={13} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          Home
        </Link>

        {/* Subtle background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.08), transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-12 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.06), transparent 70%)', filter: 'blur(55px)' }} />

        <div className="w-full max-w-[380px] relative z-10">

          {/* Mobile logo */}
          <motion.div {...up(0)} className="flex justify-center mb-10 lg:hidden">
            <Logo size="md" linked />
          </motion.div>

          {/* Heading */}
          <motion.div {...up(0.06)} className="mb-10">
            <h1
              className="text-4xl font-medium tracking-tight lg-serif"
              style={{ color: '#ffe0e0', textShadow: '0 0 32px rgba(233,77,122,0.2)' }}
            >
              Welcome back.
            </h1>
            <p className="text-sm mt-2.5 font-light" style={{ color: 'rgba(220,180,200,0.42)' }}>
              Sign in to continue your story
            </p>
          </motion.div>

          <form onSubmit={handleLogin}>
            {/* Email field */}
            <motion.div {...up(0.13)} className="mb-4">
              <label className="block text-[10px] mb-2 uppercase tracking-[0.2em]" style={{ color: 'rgba(200,160,180,0.45)' }}>
                Email address
              </label>
              <div
                className="lg-field flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={emailId}
                  required
                  onChange={(e) => setEmailId(e.target.value)}
                  className="bg-transparent outline-none text-white text-sm w-full"
                  style={{ caretColor: '#e94d7a' }}
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div {...up(0.19)} className="mb-2">
              <label className="block text-[10px] mb-2 uppercase tracking-[0.2em]" style={{ color: 'rgba(200,160,180,0.45)' }}>
                Password
              </label>
              <div
                className="lg-field flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
              >
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none text-white text-sm w-full"
                  style={{ caretColor: '#e94d7a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="shrink-0 focus:outline-none transition-colors"
                  style={{ color: 'rgba(196,120,154,0.45)' }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>

            {/* Forgot password */}
            <motion.div {...up(0.23)} className="flex justify-end mb-8">
              <Link
                to="/forgot-password"
                className="text-xs transition-all hover:brightness-125"
                style={{ color: 'rgba(196,120,154,0.5)' }}
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div {...up(0.29)}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 hover:scale-[1.015] active:scale-100 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #e94d7a 0%, #8a3fa0 100%)',
                  boxShadow: '0 8px 32px rgba(233,77,122,0.32), 0 2px 8px rgba(0,0,0,0.4)',
                  color: '#fff',
                }}
              >
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : 'Sign In'
                }
              </button>
            </motion.div>
          </form>

          {/* Google Sign-In */}
          <motion.div {...up(0.33)} className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/[0.07] active:scale-[0.99]"
              style={{ border: '1px solid rgba(196,120,154,0.22)', color: 'rgba(255,220,230,0.85)', background: 'rgba(255,255,255,0.03)' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.8C43.3 37.5 46.5 31.4 46.5 24.5z"/><path fill="#FBBC05" d="M10.7 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7-5.4A23.8 23.8 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.5l7.7-5.9z"/><path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.6-4-13.5-9.5l-7.7 5.9C7 41.4 14.8 47 24 47z"/></svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div {...up(0.35)} className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.1)' }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(220,180,200,0.28)' }}>New here?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.1)' }} />
          </motion.div>

          {/* Create account ghost button */}
          <motion.div {...up(0.4)}>
            <Link
              to="/signup"
              className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20"
              style={{ border: '1px solid rgba(196,120,154,0.18)', color: 'rgba(255,200,216,0.62)', background: 'transparent' }}
            >
              Create your account
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Login;
