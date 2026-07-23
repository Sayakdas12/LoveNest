import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from './Logo';

/* ─── Inline styles ───────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;900&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400&display=swap');
  .ln-serif { font-family: 'Playfair Display', serif !important; }
  .ln-sans  { font-family: 'Inter', sans-serif; }
  @keyframes ln-float-l { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-22px) rotate(2.5deg); } }
  @keyframes ln-float-r { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(22px) rotate(-2.5deg); } }
  .ln-float-l { animation: ln-float-l 13s ease-in-out infinite; }
  .ln-float-r { animation: ln-float-r 15s ease-in-out infinite; }
  .ln-dot-bg {
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .ln-noise {
    position: fixed; inset: 0; z-index: 60; pointer-events: none;
    opacity: 0.035; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
  @keyframes ln-pulse-glow {
    0%,100% { box-shadow: 0 0 20px rgba(233,77,122,0.15), 0 0 60px rgba(233,77,122,0.05); }
    50% { box-shadow: 0 0 30px rgba(138,63,160,0.25), 0 0 80px rgba(138,63,160,0.1); }
  }
  .ln-pulse-glow { animation: ln-pulse-glow 4s ease-in-out infinite; }
  @keyframes ln-gradient-border {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .ln-gradient-border {
    background: linear-gradient(135deg, #e94d7a, #c4789a, #8a3fa0, #e94d7a);
    background-size: 300% 300%;
    animation: ln-gradient-border 6s ease infinite;
  }
  @keyframes ln-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .ln-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    animation: ln-shimmer 3s ease-in-out infinite;
  }
  @keyframes ln-float-heart {
    0% { transform: translateY(0) scale(1); opacity: 0.6; }
    50% { transform: translateY(-30px) scale(1.1); opacity: 1; }
    100% { transform: translateY(0) scale(1); opacity: 0.6; }
  }
  .ln-step-line {
    background: linear-gradient(90deg, #e94d7a, #c4789a, #8a3fa0);
    height: 2px;
    flex: 1;
    border-radius: 1px;
    opacity: 0.4;
  }
  .ln-bento-card {
    transition: all 0.5s cubic-bezier(0.22,1,0.36,1);
    position: relative;
    overflow: hidden;
  }
  .ln-bento-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, transparent, rgba(233,77,122,0.2), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.5s;
  }
  .ln-bento-card:hover::before { opacity: 1; }
  .ln-bento-card:hover { transform: translateY(-4px); }
  .ln-testimonial-card {
    position: relative;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.22,1,0.36,1);
  }
  .ln-testimonial-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #e94d7a, #c4789a, #8a3fa0);
    opacity: 0;
    transition: opacity 0.5s;
  }
  .ln-testimonial-card:hover::before { opacity: 1; }
  .ln-testimonial-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(233,77,122,0.12); }
  .ln-grayscale-img {
    filter: grayscale(100%);
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ln-grayscale-img:hover {
    filter: grayscale(0%);
  }
  @keyframes ln-float-cta {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-12px) rotate(5deg); }
    66% { transform: translateY(-6px) rotate(-3deg); }
  }
  @keyframes ln-pulse-red {
    0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    50% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  }
  .ln-live-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #ef4444;
    border-radius: 50%;
    animation: ln-pulse-red 2s infinite;
  }
`;

/* ─── Landing ─────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');
  const [matchCount, setMatchCount] = useState(40);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 280]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  const revealProps = (delay = 0) => ({
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }
  });

  /* navbar scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* live clock */
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m} ${ap}`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden ln-sans" style={{ background: 'linear-gradient(to bottom, #16010a 0%, #0d0208 30%, #090106 75%, #050003 100%)' }}>
      <style>{STYLES}</style>
      <div className="ln-noise" />

      {/* ══ NAV ═════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 border-b border-white/5' : 'py-6'}`}
        style={{
          background: scrolled ? 'rgba(22,1,10,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" linked={false} />
            <span className="ln-live-dot" title="Live Platform Status" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Stories', '#stories']].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                {label}
              </a>
            ))}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-[#e94d7a] text-white hover:scale-105 hover:bg-[#d63c69] transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
        {/* Atmospheric background image */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-65 mix-blend-screen">
            <img
              src="https://framerusercontent.com/images/9zvwRJAavKKacVyhFCwHyXW1U.png?width=1536&height=1024"
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ filter: 'hue-rotate(320deg) saturate(1.15) brightness(0.85)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#16010a] z-10" />
        </div>

        {/* Floating hand — left */}
        <div
          className="absolute -left-[10%] top-[-10%] md:left-[-5%] md:top-[-15%] w-[50vw] md:w-[40vw] max-w-[800px] z-10 pointer-events-none ln-float-l"
          style={{ mixBlendMode: 'hard-light', opacity: 0.82 }}
        >
          <img
            src="https://framerusercontent.com/images/KNhiA5A2ykNYqNkj04Hk6BVg5A.png?width=1540&height=1320"
            alt=""
            className="w-full h-auto object-contain"
            style={{ filter: 'hue-rotate(320deg) saturate(1.2) brightness(0.88)' }}
          />
        </div>

        {/* Floating hand — right */}
        <div
          className="absolute -right-[10%] bottom-[-10%] md:right-[-5%] md:bottom-[-5%] w-[45vw] md:w-[35vw] max-w-[700px] z-10 pointer-events-none ln-float-r"
          style={{ mixBlendMode: 'hard-light', opacity: 0.82 }}
        >
          <img
            src="https://framerusercontent.com/images/X89VFCABCEjjZ4oLGa3PjbOmsA.png?width=1542&height=1002"
            alt=""
            className="w-full h-auto object-contain"
            style={{ filter: 'hue-rotate(320deg) saturate(1.2) brightness(0.88)' }}
          />
        </div>

        {/* Hero text */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 text-center max-w-4xl mx-auto px-6 flex flex-col items-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95 }}
            className="text-5xl md:text-7xl font-medium leading-[1.1] tracking-tight mb-6 ln-serif mix-blend-overlay"
            style={{ color: '#ffe0e0', textShadow: '0 0 12px rgba(255,255,255,0.71)' }}
          >
            LoveNest.<br />
            <span className="italic font-light" style={{ color: '#ffe0e0' }}>Where hearts find home.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.22 }}
            className="text-base md:text-lg max-w-md mx-auto mb-14 font-light tracking-wide leading-relaxed mix-blend-overlay"
            style={{ color: 'rgba(255,224,224,0.9)', textShadow: '0 0 12px rgba(255,255,255,0.71)' }}
          >
            We turn fleeting glances into lifelong stories. A space for those who believe in real, lasting love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.44 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="relative group px-8 py-3.5 rounded-full text-sm font-medium text-white/85 border border-white/20 bg-white/5 backdrop-blur-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10"
              >
                <div className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: '#e94d7a' }} />
                <span className="relative z-10">Find Your Match</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 rounded-full text-sm font-medium bg-white text-black hover:scale-105 hover:bg-gray-100 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
            <div
              className="flex items-center gap-4 mt-4 font-mono"
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '0.15em' }}
            >
              <span>{time}</span>
              <span className="w-px h-3 bg-white/20" />
              <span>LOVENEST PLATFORM</span>
              <span className="w-px h-3 bg-white/20" />
              <span>v2.0</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden">
        {/* Subtle radial glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none select-none opacity-40 blur-[130px] z-0" style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] pointer-events-none select-none opacity-20 blur-[100px] z-0" style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.12) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section heading */}
          <motion.div {...revealProps()} className="max-w-4xl mx-auto text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #e94d7a)' }} />
              <span className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: '#e94d7a' }}>How It Works</span>
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, #e94d7a, transparent)' }} />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight mb-6 ln-serif text-white">
              Three steps to your<br /><span className="italic" style={{ color: '#e94d7a' }}>forever story</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-light max-w-2xl mx-auto">
              We remove the noise so the right person can find you. Simple, intentional, real.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 max-w-5xl mx-auto">
            {[
              { icon: '✨', title: 'Create Profile', desc: 'Share your story, your passions, and what makes your heart sing.', num: '01' },
              { icon: '💬', title: 'Start Connecting', desc: 'Our AI finds people who truly complement your personality and values.', num: '02' },
              { icon: '💕', title: 'Find Your Match', desc: 'Move from meaningful conversations to a love that lasts a lifetime.', num: '03' },
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                <motion.div
                  {...revealProps(i * 0.15)}
                  className="flex flex-col items-center"
                >
                  <div className="bg-[#111111]/85 p-8 rounded-3xl border border-white/10 backdrop-blur-md flex flex-col items-center justify-between min-h-[280px] max-w-[280px] hover:scale-[1.02] transition-transform duration-300">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 relative ln-pulse-glow"
                      style={{ background: 'rgba(233,77,122,0.08)', border: '1px solid rgba(233,77,122,0.2)' }}
                    >
                      <span className="relative z-10">{step.icon}</span>
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase mb-2" style={{ color: '#e94d7a' }}>{step.num}</span>
                    <h3 className="text-base font-semibold text-white tracking-wide mb-2 ln-serif">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </motion.div>
                {i < 2 && <div className="hidden md:block ln-step-line mx-4" style={{ minWidth: '40px', maxWidth: '80px' }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Stats panel */}
          <motion.div {...revealProps()} className="mt-16 md:mt-20">
            <div
              className="relative max-w-4xl mx-auto rounded-2xl p-[1px] ln-gradient-border overflow-hidden"
            >
              <div
                className="rounded-2xl py-8 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center relative ln-shimmer overflow-hidden"
                style={{ background: 'rgba(22,1,10,0.95)', backdropFilter: 'blur(20px)' }}
              >
                {[
                  ['2M+', 'Members Worldwide'],
                  ['500K+', 'Matches Made'],
                  ['98%', 'Satisfaction Rate'],
                  ['4.9★', 'App Store Rating'],
                ].map(([n, l], i) => (
                  <div key={l} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold ln-serif mb-2" style={{ color: '#e94d7a' }}>{n}</div>
                    <div className="text-[11px] text-gray-500 tracking-widest uppercase leading-tight">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES BENTO GRID ══════════════════════════════════════ */}
      <section id="features" className="py-16 md:py-24 relative overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.05] pointer-events-none ln-dot-bg" />
        {/* Ambient glow blobs */}
        <div className="absolute top-1/3 right-[5%] w-[600px] h-[600px] pointer-events-none select-none opacity-30 blur-[120px] z-0" style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-[5%] w-[600px] h-[600px] pointer-events-none select-none opacity-25 blur-[120px] z-0" style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.1) 0%, transparent 70%)' }} />
 
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section heading */}
          <motion.div {...revealProps()} className="mb-14 md:mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #e94d7a)' }} />
              <span className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: '#e94d7a' }}>Features</span>
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, #e94d7a, transparent)' }} />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl ln-serif text-white">
              Define your<br /><span className="italic" style={{ color: '#e94d7a' }}>love story</span>
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-6xl mx-auto">
            {/* Card 1 — AI Matchmaking (large, spans 7 cols) */}
            <motion.div
              {...revealProps()}
              className="md:col-span-7 ln-bento-card group cursor-pointer rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden border border-pink-500/10 hover:border-pink-500/35 hover:shadow-[0_20px_50px_rgba(244,63,94,0.18)] hover:-translate-y-1 transition-all duration-500"
              style={{ background: 'radial-gradient(circle at 80% 30%, rgba(244,63,94,0.18) 0%, rgba(22,1,10,0.45) 80%)', backdropFilter: 'blur(20px)' }}
              onClick={() => navigate('/signup')}
            >
              {/* Background Image Overlay with Gradient Fade */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
                <img
                  src="/assets/ai_matchmaking.png"
                  className="w-full h-full object-cover opacity-[0.32] group-hover:opacity-[0.55] group-hover:scale-105 transition-all duration-700 ease-out"
                  alt=""
                  style={{ objectPosition: 'center right' }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: 'linear-gradient(90deg, rgba(22,1,10,0.92) 25%, rgba(22,1,10,0.4) 65%, transparent 100%)' 
                  }} 
                />
              </div>
 
              {/* Card Content */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex justify-between items-start">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}
                  >🧠</div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-full" style={{ color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>AI-Powered</span>
                </div>
                <div className="mt-8">
                  <h3 className="text-3xl md:text-4xl text-white mb-3 leading-tight tracking-tight ln-serif">
                    Smart <span className="italic font-light font-serif text-pink-400">Matchmaking</span>
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
                    Our AI goes beyond surface-level preferences. It understands your values, communication style, and what truly makes a connection last.
                  </p>
                </div>
              </div>
            </motion.div>
 
            {/* Card 2 — Video Dates (spans 5 cols) */}
            <motion.div
              {...revealProps(0.1)}
              className="md:col-span-5 ln-bento-card group cursor-pointer rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden border border-purple-500/10 hover:border-purple-500/35 hover:shadow-[0_20px_50px_rgba(168,85,247,0.18)] hover:-translate-y-1 transition-all duration-500"
              style={{ background: 'radial-gradient(circle at 20% 70%, rgba(168,85,247,0.18) 0%, rgba(22,1,10,0.45) 80%)', backdropFilter: 'blur(20px)' }}
              onClick={() => navigate('/signup')}
            >
              {/* Background Image Overlay with Gradient Fade */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
                <img
                  src="/assets/video_dates.png"
                  className="w-full h-full object-cover opacity-[0.32] group-hover:opacity-[0.55] group-hover:scale-105 transition-all duration-700 ease-out"
                  alt=""
                  style={{ objectPosition: 'center bottom' }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(22,1,10,0.88) 25%, rgba(22,1,10,0.4) 65%, transparent 100%)' 
                  }} 
                />
              </div>
 
              {/* Card Content */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex justify-between items-start">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
                  >📹</div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-full" style={{ color: '#c084fc', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>Live</span>
                </div>
                <div className="mt-8">
                  <h3 className="text-3xl md:text-4xl text-white mb-3 leading-tight tracking-tight ln-serif">
                    Video <span className="italic font-light font-serif text-purple-400">Dates</span>
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
                    See the smile, hear the laugh. Meet face-to-face from the comfort of home before your first real date.
                  </p>
                </div>
              </div>
            </motion.div>
 
            {/* Card 3 — Verified Profiles (spans 5 cols) */}
            <motion.div
              {...revealProps(0.15)}
              className="md:col-span-5 ln-bento-card group cursor-pointer rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden border border-cyan-500/10 hover:border-cyan-500/35 hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)] hover:-translate-y-1 transition-all duration-500"
              style={{ background: 'radial-gradient(circle at 80% 70%, rgba(6,182,212,0.18) 0%, rgba(22,1,10,0.45) 80%)', backdropFilter: 'blur(20px)' }}
              onClick={() => navigate('/signup')}
            >
              {/* Background Image Overlay with Gradient Fade */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
                <img
                  src="/assets/verified_profiles.png"
                  className="w-full h-full object-cover opacity-[0.32] group-hover:opacity-[0.55] group-hover:scale-105 transition-all duration-700 ease-out"
                  alt=""
                  style={{ objectPosition: 'center center' }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(22,1,10,0.88) 25%, rgba(22,1,10,0.4) 65%, transparent 100%)' 
                  }} 
                />
              </div>
 
              {/* Card Content */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex justify-between items-start">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform duration-500"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}
                  >🛡️</div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-full" style={{ color: '#22d3ee', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>Trusted</span>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl md:text-3xl text-white mb-3 leading-tight tracking-tight ln-serif">
                    Verified <span className="italic font-light font-serif text-cyan-400">Profiles</span>
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
                    Every profile is verified with photo ID and face recognition. Real people, real intentions.
                  </p>
                </div>
              </div>
            </motion.div>
 
            {/* Card 4 — Privacy First (spans 7 cols) */}
            <motion.div
              {...revealProps(0.2)}
              className="md:col-span-7 ln-bento-card group cursor-pointer rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden border border-amber-500/10 hover:border-amber-500/35 hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)] hover:-translate-y-1 transition-all duration-500"
              style={{ background: 'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.18) 0%, rgba(22,1,10,0.45) 80%)', backdropFilter: 'blur(20px)' }}
              onClick={() => navigate('/signup')}
            >
              {/* Background Image Overlay with Gradient Fade */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
                <img
                  src="/assets/privacy_first.png"
                  className="w-full h-full object-cover opacity-[0.32] group-hover:opacity-[0.55] group-hover:scale-105 transition-all duration-700 ease-out"
                  alt=""
                  style={{ objectPosition: 'center right' }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: 'linear-gradient(90deg, rgba(22,1,10,0.88) 25%, rgba(22,1,10,0.4) 65%, transparent 100%)' 
                  }} 
                />
              </div>
 
              {/* Card Content */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex justify-between items-start">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                  >🔒</div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-full" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>Secure</span>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl md:text-3xl text-white mb-3 leading-tight tracking-tight ln-serif">
                    Privacy <span className="italic font-light font-serif text-amber-400">First</span>
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
                    End-to-end encrypted messages, incognito browsing mode, and full control over who sees your profile. Your love story stays yours.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ PRICING & SUBSCRIPTION PLANS ══════════════════════════════ */}
      <section id="pricing" className="py-20 md:py-28 relative overflow-hidden">
        {/* Central brand glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none select-none opacity-30 blur-[130px]" style={{ background: 'radial-gradient(circle, rgba(138, 63, 160, 0.2) 0%, transparent 70%)' }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section heading */}
          <motion.div {...revealProps()} className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #e94d7a)' }} />
              <span className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: '#e94d7a' }}>Pricing Plans</span>
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, #e94d7a, transparent)' }} />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight mb-6 ln-serif text-white">
              Choose your<br /><span className="italic" style={{ color: '#e94d7a' }}>journey</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-light max-w-2xl mx-auto">
              Find the perfect plan to fuel your connections. Flexible pricing tailored to your matching intentions.
            </p>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              {...revealProps(0.05)}
              className="bg-[#111111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e94d7a]">Starter</span>
                <div className="flex items-baseline gap-1 mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-white">$19</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-400 mb-8 font-light">Ideal for those beginning their search for a meaningful partner.</p>
                <ul className="space-y-4 mb-8 text-sm text-gray-300 font-light">
                  <li className="flex items-center gap-2">✓ 15 Smart Matches / month</li>
                  <li className="flex items-center gap-2">✓ AI Personality Analysis</li>
                  <li className="flex items-center gap-2">✓ Standard Support</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 transition-all duration-300"
              >
                Select Plan
              </button>
            </motion.div>

            {/* Growth Plan (Featured, scaled brand gradient) */}
            <motion.div
              {...revealProps(0.1)}
              className="rounded-3xl p-8 flex flex-col justify-between md:scale-105 shadow-[0_20px_50px_rgba(233,77,122,0.2)] relative z-20 hover:scale-[1.07] transition-transform duration-300 border border-white/20"
              style={{ background: 'linear-gradient(135deg, #e94d7a, #8a3fa0)' }}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Growth</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full">Popular</span>
                </div>
                <div className="flex items-baseline gap-1 mt-4 mb-6">
                  <span className="text-5xl font-extrabold text-white">$49</span>
                  <span className="text-sm text-white/70">/mo</span>
                </div>
                <p className="text-sm text-white/80 mb-8 font-light">Advanced features and more connections to find matches faster.</p>
                <ul className="space-y-4 mb-8 text-sm text-white font-medium">
                  <li className="flex items-center gap-2">✓ 50 Smart Matches / month</li>
                  <li className="flex items-center gap-2">✓ Priority Match Notification</li>
                  <li className="flex items-center gap-2">✓ Video Dates & Live Audio Chat</li>
                  <li className="flex items-center gap-2">✓ 24/7 Priority Support</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-black hover:scale-105 transition-all duration-300 shadow-md"
              >
                Get Started
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              {...revealProps(0.15)}
              className="bg-[#111111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a3fa0]">Pro</span>
                <div className="flex items-baseline gap-1 mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-400 mb-8 font-light">Unlimited access and direct premium matches for serious intentions.</p>
                <ul className="space-y-4 mb-8 text-sm text-gray-300 font-light">
                  <li className="flex items-center gap-2">✓ Unlimited Matches</li>
                  <li className="flex items-center gap-2">✓ Exclusive VIP Profiles</li>
                  <li className="flex items-center gap-2">✓ Dedicated Relationship Agent</li>
                  <li className="flex items-center gap-2">✓ Premium Event Invitations</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 transition-all duration-300"
              >
                Select Plan
              </button>
            </motion.div>
          </div>

          {/* Glassmorphic Calculator Component */}
          <motion.div
            {...revealProps()}
            className="bg-[#160814]/90 border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto mt-16 shadow-[0_15px_40px_rgba(233,77,122,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-xl bg-[#e94d7a] pointer-events-none rounded-full" />
            <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-2 text-center ln-serif">Credit Estimator</h3>
            <p className="text-xs text-gray-400 text-center mb-8 font-light uppercase tracking-widest">Adjust to see monthly matchmaking price dynamically</p>
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-[#e94d7a]">Target Matches</span>
                <span className="text-2xl font-black text-white">{matchCount} / month</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={matchCount}
                onChange={(e) => setMatchCount(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-gray-800 appearance-none cursor-pointer border-none shadow-[0_0_12px_rgba(233,77,122,0.3)] accent-[#e94d7a]"
                style={{ outline: 'none' }}
              />
              
              <div className="w-full h-px bg-white/10 my-2" />
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold uppercase tracking-widest text-[#c4789a]">Estimated Price</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">${Math.round(matchCount * 0.95)}</span>
                  <span className="text-xs text-gray-400">/mo</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STORIES / TESTIMONIALS ═══════════════════════════════════ */}
      <section id="stories" className="py-16 md:py-24 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none select-none opacity-40 blur-[130px] z-0" style={{ background: 'radial-gradient(circle, rgba(233,77,122,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] pointer-events-none select-none opacity-20 blur-[120px] z-0" style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.1) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section heading */}
          <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c4789a)' }} />
              <span className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: '#c4789a' }}>Love Stories</span>
              <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, #c4789a, transparent)' }} />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight mb-6 ln-serif text-white">
              Real connections.<br /><span className="italic" style={{ color: '#e94d7a' }}>Real stories.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-light">
              Thousands of couples found their forever on LoveNest.
            </p>
          </motion.div>

          {/* Decorative large quote */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none select-none" style={{ opacity: 0.03 }}>
            <svg width="200" height="160" viewBox="0 0 200 160" fill="white">
              <path d="M0 100C0 44.8 44.8 0 100 0v40c-33.1 0-60 26.9-60 60v60H0V100zm120 0C120 44.8 164.8 0 220 0v40c-33.1 0-60 26.9-60 60v60h-40V100z" />
            </svg>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { q: 'I never believed in online dating until LoveNest. We got married last spring and it\'s been the best decision of our lives.', n: 'Priya & Rohan', s: 'Together since 2024', initials: 'PR', color: 'linear-gradient(135deg, #e94d7a, #c4789a)' },
              { q: 'The AI matchmaking truly understood what I was looking for. It felt like the algorithm could read my heart. Life changing.', n: 'Ananya & Dev', s: 'Together since 2025', initials: 'AD', color: 'linear-gradient(135deg, #c4789a, #8a3fa0)' },
              { q: 'From first message to forever. LoveNest made it feel so natural and real. We\'re planning our wedding now!', n: 'Sara & Mikhail', s: 'Together since 2024', initials: 'SM', color: 'linear-gradient(135deg, #8a3fa0, #e94d7a)' },
            ].map((t, i) => (
              <motion.div
                key={t.n}
                {...revealProps(i * 0.12)}
                className="ln-testimonial-card rounded-2xl p-6 md:p-7 bg-[#111111]/85 border border-white/10"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} className="text-sm text-[#e94d7a]">★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-white/70 text-base leading-relaxed mb-5 font-light">
                  "{t.q}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-4 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.n}</p>
                    <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
                      <span className="text-[#e94d7a]">♥</span> {t.s}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA below stories */}
          <motion.div {...revealProps(0.2)} className="mt-10 text-center">
            <button
              onClick={() => navigate('/signup')}
              className="group relative inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:gap-3 text-[#e94d7a]"
            >
              <span>Join 2M+ Happy Members</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            {...revealProps()}
            className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(233,77,122,0.1), rgba(138,63,160,0.08))' }}
          >
            {/* Floating hearts decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {['💕', '✨', '💗', '🌹', '💞'].map((emoji, i) => (
                <span
                  key={i}
                  className="absolute text-xl select-none"
                  style={{
                    left: `${15 + i * 18}%`,
                    top: `${10 + (i % 3) * 25}%`,
                    opacity: 0.12 + i * 0.03,
                    animation: `ln-float-cta ${5 + i * 1.5}s ease-in-out ${i * 0.8}s infinite`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl lg:text-6xl ln-serif mb-4 text-white">
                Ready to find<br /><span className="italic" style={{ color: '#e94d7a' }}>your match?</span>
              </h2>
              <p className="text-lg text-gray-400 font-light max-w-lg mx-auto mb-6">
                Join millions who've already found meaningful connections. Your love story starts with a single step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="group relative px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_40px_rgba(233,77,122,0.3)]"
                  style={{ background: 'linear-gradient(135deg, #e94d7a, #c4789a)' }}
                >
                  <span className="relative z-10">Get Started Free</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white/[0.06]"
                  style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden bg-[#050003]">
        {/* Gradient top line */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(233,77,122,0.3), rgba(138,63,160,0.3), transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-8 relative z-10">
          {/* Main footer grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" linked={false} />
              <p className="text-gray-500 text-sm leading-relaxed mt-4 max-w-xs font-light">
                Where hearts find home. Building meaningful connections through technology and intention.
              </p>
              {/* Social icons */}
              <div className="flex gap-3 mt-6">
                {[
                  { label: 'Twitter', icon: '𝕏' },
                  { label: 'Instagram', icon: '📷' },
                  { label: 'Facebook', icon: 'f' },
                  { label: 'LinkedIn', icon: 'in' },
                ].map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform column */}
            <div>
              <span className="text-[11px] font-medium tracking-[0.25em] uppercase mb-5 block text-[#c4789a]">Platform</span>
              <div className="flex flex-col gap-3">
                {[
                  ['Discover', '/feed'],
                  ['Premium', '/premium'],
                  ['AI Assistant', '/ai-chat'],
                  ['Events', '/feed'],
                ].map(([label, path]) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-300 text-left hover:translate-x-1 transform font-light"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Support column */}
            <div>
              <span className="text-[11px] font-medium tracking-[0.25em] uppercase mb-5 block text-[#c4789a]">Support</span>
              <div className="flex flex-col gap-3">
                {['Help Center', 'Safety Tips', 'Community', 'Contact Us'].map((label) => (
                  <span key={label} className="text-sm text-gray-500 hover:text-white transition-colors duration-300 cursor-pointer hover:translate-x-1 transform inline-block font-light">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Legal column */}
            <div>
              <span className="text-[11px] font-medium tracking-[0.25em] uppercase mb-5 block text-[#c4789a]">Legal</span>
              <div className="flex flex-col gap-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((label) => (
                  <span key={label} className="text-sm text-gray-500 hover:text-white transition-colors duration-300 cursor-pointer hover:translate-x-1 transform inline-block font-light">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}

        </div>

        {/* Background watermark */}
        <h2
          className="absolute bottom-6 left-6 leading-[0.8] tracking-tighter font-bold select-none pointer-events-none ln-serif"
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', color: 'rgba(255,255,255,0.02)' }}
        >
          LOVENEST.
        </h2>
      </footer>
    </div>
  );
}
