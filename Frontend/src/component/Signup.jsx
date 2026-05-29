import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../utils/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import { BaseUrl } from '../utils/constance';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Camera, Sparkles, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';
import toast from 'react-hot-toast';

/* ─── Design system (mirrors Login / Landing) ─────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');
  .sg-serif { font-family: 'Playfair Display', serif !important; }
  .sg-sans  { font-family: 'Inter', sans-serif; }
  .sg-field input::placeholder,
  .sg-field textarea::placeholder { color: rgba(200,160,180,0.35); }
  .sg-field select { color: rgba(200,160,180,0.35); }
  .sg-field select.has-value { color: #fff; }
  .sg-field:focus-within {
    border-color: rgba(233,77,122,0.5) !important;
    box-shadow: 0 0 0 3px rgba(233,77,122,0.10), 0 0 24px rgba(233,77,122,0.06);
  }
  @keyframes sg-rise {
    0%,100% { transform: translateY(0) rotate(1deg); }
    50%      { transform: translateY(-20px) rotate(-1.5deg); }
  }
  .sg-rise { animation: sg-rise 16s ease-in-out infinite; }
  .sg-noise {
    position: absolute; inset: 0; pointer-events: none; z-index: 2;
    opacity: 0.028; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
  .sg-scroll::-webkit-scrollbar { width: 0; }
`;

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Shared field wrapper ────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    {label && (
      <label className="block text-[10px] mb-1.5 uppercase tracking-[0.2em]"
        style={{ color: 'rgba(200,160,180,0.45)' }}>
        {label}
      </label>
    )}
    <div
      className="sg-field flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
    >
      {children}
    </div>
  </div>
);

const inputCls = "bg-transparent outline-none text-white text-sm w-full";

/* ─── Signup ──────────────────────────────────────────────────────────── */
const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', emailId: '', password: '',
    age: '', gender: '', about: '', skills: '', photo: null,
  });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post(BaseUrl + '/auth/google', { idToken }, { withCredentials: true });
      dispatch(setUser(res.data));
      toast.success(`Welcome to LoveNest, ${res.data.firstName}! 💕`);
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign-in failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('emailId', formData.emailId);
      payload.append('password', formData.password);
      payload.append('age', formData.age);
      payload.append('gender', formData.gender);
      payload.append('about', formData.about);
      if (formData.skills.trim()) payload.append('skills', formData.skills);
      if (formData.photo) payload.append('photo', formData.photo);

      const res = await axios.post(BaseUrl + '/signup', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      dispatch(setUser(res.data));
      toast.success('Welcome to LoveNest! 💕');
      navigate('/feed');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Something went wrong!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex sg-sans" style={{ background: '#050505', color: '#fff' }}>
      <style>{STYLES}</style>

      {/* ══ LEFT PANEL — cinematic visual (desktop only) ════════════════ */}
      <div
        className="hidden lg:flex relative flex-col justify-between w-[46%] overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #07010d 0%, #160626 55%, #0c0314 100%)' }}
      >
        {/* Film grain */}
        <div className="sg-noise" />

        {/* Atmospheric bg image */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <img
            src="https://framerusercontent.com/images/9zvwRJAavKKacVyhFCwHyXW1U.png?width=1200"
            alt=""
            className="w-full h-full object-cover object-center opacity-40"
            style={{ filter: 'hue-rotate(320deg) saturate(1.1) brightness(0.6)', mixBlendMode: 'screen' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 55%, #050505 100%)' }} />
        </div>

        {/* Floating hand — bottom-right corner */}
        <div
          className="absolute bottom-[-8%] right-[-6%] w-[60%] pointer-events-none select-none z-[3] sg-rise"
          style={{ mixBlendMode: 'hard-light', opacity: 0.75 }}
        >
          <img
            src="https://framerusercontent.com/images/X89VFCABCEjjZ4oLGa3PjbOmsA.png?width=900"
            alt=""
            className="w-full h-auto object-contain"
            style={{ filter: 'hue-rotate(320deg) saturate(1.2) brightness(0.85)' }}
          />
        </div>

        {/* Ambient glow — back-light the bottom-right hand */}
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none z-[2]"
          style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.13), transparent 70%)', filter: 'blur(55px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none z-[2]"
          style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.17), transparent 70%)', filter: 'blur(45px)' }} />

        {/* Panel content */}
        <div className="relative z-[4] p-12 flex flex-col h-full justify-between">
          {/* Logo */}
          <Logo size="md" linked />

          {/* Serif quote */}
          <div className="max-w-xs">
            <p
              className="text-[2.6rem] leading-[1.18] mb-6 sg-serif"
              style={{ color: '#ffe0e0', textShadow: '0 0 40px rgba(233,77,122,0.25)' }}
            >
              <em>Begin your most<br />beautiful<br />chapter.</em>
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,224,224,0.40)' }}>
              Thousands of new connections every day. Your person is already here.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-10">
            {[['500K+', 'New this year'], ['3 min', 'Avg. match time'], ['Free', 'To join']].map(([num, label]) => (
              <div key={label}>
                <p className="text-lg font-semibold" style={{ color: '#e94d7a' }}>{num}</p>
                <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,200,216,0.35)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — form ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
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

        {/* Subtle glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.08), transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute top-10 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.06), transparent 70%)', filter: 'blur(55px)' }} />

        <div className="w-full max-w-[400px] relative z-10">

          {/* Mobile logo */}
          <motion.div {...up(0)} className="flex justify-center mb-8 lg:hidden">
            <Logo size="md" linked />
          </motion.div>

          {/* Heading */}
          <motion.div {...up(0.05)} className="mb-7">
            <h1
              className="text-4xl font-medium tracking-tight sg-serif"
              style={{ color: '#ffe0e0', textShadow: '0 0 32px rgba(233,77,122,0.2)' }}
            >
              {step === 1 ? 'Create account.' : 'Your profile.'}
            </h1>
            <p className="text-sm mt-2.5 font-light" style={{ color: 'rgba(220,180,200,0.42)' }}>
              {step === 1 ? 'Start your love story today' : 'Help others get to know you'}
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div {...up(0.09)} className="flex items-center gap-3 mb-8">
            <div className="flex gap-2">
              {[1, 2].map(n => (
                <div
                  key={n}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: n === step ? 24 : 8,
                    height: 8,
                    background: n === step
                      ? 'linear-gradient(90deg, #e94d7a, #8a3fa0)'
                      : n < step ? 'rgba(233,77,122,0.5)' : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(200,160,180,0.38)' }}>
              Step {step} of 2
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* ── Step 1: basics ────────────────────────────────── */
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleNext}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <input name="firstName" type="text" placeholder="Jane"
                      className={inputCls} value={formData.firstName}
                      onChange={handleChange} required style={{ caretColor: '#e94d7a' }} />
                  </Field>
                  <Field label="Last name">
                    <input name="lastName" type="text" placeholder="Doe"
                      className={inputCls} value={formData.lastName}
                      onChange={handleChange} required style={{ caretColor: '#e94d7a' }} />
                  </Field>
                </div>

                <Field label="Email address">
                  <input name="emailId" type="email" placeholder="you@example.com"
                    className={inputCls} value={formData.emailId}
                    onChange={handleChange} required style={{ caretColor: '#e94d7a' }} />
                </Field>

                <div>
                  <label className="block text-[10px] mb-1.5 uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(200,160,180,0.45)' }}>Password</label>
                  <div
                    className="sg-field flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
                  >
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={inputCls}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ caretColor: '#e94d7a' }}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="shrink-0 focus:outline-none transition-colors"
                      style={{ color: 'rgba(196,120,154,0.45)' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 hover:scale-[1.015] active:scale-100 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #e94d7a 0%, #8a3fa0 100%)',
                    boxShadow: '0 8px 32px rgba(233,77,122,0.32), 0 2px 8px rgba(0,0,0,0.4)',
                    color: '#fff',
                  }}
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/[0.07] active:scale-[0.99]"
                  style={{ border: '1px solid rgba(196,120,154,0.22)', color: 'rgba(255,220,230,0.85)', background: 'rgba(255,255,255,0.03)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.8C43.3 37.5 46.5 31.4 46.5 24.5z"/><path fill="#FBBC05" d="M10.7 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7-5.4A23.8 23.8 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.5l7.7-5.9z"/><path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.6-4-13.5-9.5l-7.7 5.9C7 41.4 14.8 47 24 47z"/></svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.1)' }} />
                  <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(220,180,200,0.28)' }}>Have an account?</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.1)' }} />
                </div>
                <Link
                  to="/login"
                  className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20"
                  style={{ border: '1px solid rgba(196,120,154,0.18)', color: 'rgba(255,200,216,0.62)', background: 'transparent' }}
                >
                  Sign in instead
                </Link>
              </motion.form>
            ) : (
              /* ── Step 2: profile ───────────────────────────────── */
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age">
                    <input name="age" type="number" min="18" max="99" placeholder="25"
                      className={inputCls} value={formData.age}
                      onChange={handleChange} required style={{ caretColor: '#e94d7a' }} />
                  </Field>
                  <div>
                    <label className="block text-[10px] mb-1.5 uppercase tracking-[0.2em]"
                      style={{ color: 'rgba(200,160,180,0.45)' }}>Gender</label>
                    <div
                      className="sg-field flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
                    >
                      <select
                        name="gender"
                        className={`${inputCls} ${formData.gender ? 'text-white' : ''}`}
                        style={{ color: formData.gender ? '#fff' : 'rgba(200,160,180,0.35)', background: 'transparent' }}
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled style={{ background: '#0c0314' }}>Select</option>
                        <option value="male" style={{ background: '#0c0314' }}>Male</option>
                        <option value="female" style={{ background: '#0c0314' }}>Female</option>
                        <option value="other" style={{ background: '#0c0314' }}>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] mb-1.5 uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(200,160,180,0.45)' }}>About you</label>
                  <div
                    className="sg-field flex items-start gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
                  >
                    <textarea
                      name="about"
                      placeholder="A few words about yourself…"
                      rows={2}
                      className={`${inputCls} resize-none`}
                      value={formData.about}
                      onChange={handleChange}
                      required
                      style={{ caretColor: '#e94d7a' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] mb-1.5 uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(200,160,180,0.45)' }}>Interests <span style={{ color: 'rgba(200,160,180,0.25)' }}>(optional)</span></label>
                  <div
                    className="sg-field flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
                  >
                    <Sparkles size={13} style={{ color: 'rgba(196,120,154,0.4)', flexShrink: 0 }} />
                    <input name="skills" type="text" placeholder="e.g. hiking, cooking, music"
                      className={inputCls} value={formData.skills}
                      onChange={handleChange} style={{ caretColor: '#e94d7a' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] mb-1.5 uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(200,160,180,0.45)' }}>Profile photo <span style={{ color: 'rgba(200,160,180,0.25)' }}>(optional)</span></label>
                  <label
                    className="sg-field flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer hover:border-pink-500/30"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.15)' }}
                  >
                    <Camera size={13} style={{ color: 'rgba(196,120,154,0.4)', flexShrink: 0 }} />
                    <span className="text-sm truncate"
                      style={{ color: formData.photo ? '#e94d7a' : 'rgba(200,160,180,0.35)' }}>
                      {formData.photo ? formData.photo.name : 'Upload a photo…'}
                    </span>
                    <input name="photo" type="file" className="hidden" onChange={handleChange} accept="image/*" />
                  </label>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 hover:bg-white/[0.06]"
                    style={{ border: '1px solid rgba(196,120,154,0.18)', color: 'rgba(255,200,216,0.55)' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 hover:scale-[1.015] active:scale-100 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #e94d7a 0%, #8a3fa0 100%)',
                      boxShadow: '0 8px 32px rgba(233,77,122,0.32), 0 2px 8px rgba(0,0,0,0.4)',
                      color: '#fff',
                    }}
                  >
                    {loading
                      ? <span className="loading loading-spinner loading-sm" />
                      : 'Create Account'
                    }
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Signup;
