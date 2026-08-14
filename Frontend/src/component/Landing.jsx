import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from './Logo';
import ForceFieldBackground from './ForceFieldBackground';
import { 
  Sparkles, Heart, ShieldCheck, Video, Lock, Zap, Crown, 
  Star, Check, ArrowRight, Compass, Users, ChevronRight,
  Radio, EyeOff, Shield
} from 'lucide-react';

/* ─── Ultra-Sleek Luxury Obsidian & Rose Gold Aesthetics ─────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,600&display=swap');
  .ln-serif { font-family: 'Playfair Display', serif !important; }
  .ln-sans  { font-family: 'Inter', sans-serif; }

  @keyframes ln-float-l { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-22px) rotate(2.5deg); } }
  @keyframes ln-float-r { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(22px) rotate(-2.5deg); } }
  .ln-float-l { animation: ln-float-l 13s ease-in-out infinite; }
  .ln-float-r { animation: ln-float-r 15s ease-in-out infinite; }

  .ln-dot-bg {
    background-image: radial-gradient(circle, rgba(244,63,94,0.12) 1px, transparent 1px);
    background-size: 36px 36px;
  }

  .ln-noise {
    position: fixed; inset: 0; z-index: 60; pointer-events: none;
    opacity: 0.025; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  /* 🌟 Obsidian Glassmorphism Cards */
  .ln-luxe-glass {
    background: rgba(18, 18, 24, 0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .ln-luxe-glass-hover {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ln-luxe-glass-hover:hover {
    transform: translateY(-8px);
    border-color: rgba(244, 63, 94, 0.5);
    background: rgba(24, 24, 32, 0.75);
    box-shadow: 0 30px 90px rgba(244, 63, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  /* Bright Rose Glow Text Gradient */
  .ln-glow-text-rose {
    background: linear-gradient(135deg, #ffffff 0%, #fda4af 40%, #f43f5e 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 16px rgba(244, 63, 94, 0.4));
  }

  .ln-glow-text-purple {
    background: linear-gradient(135deg, #ffffff 0%, #d8b4fe 40%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.4));
  }

  @keyframes ln-pulse-red {
    0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
    50% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
  }
  .ln-live-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #f43f5e;
    border-radius: 50%;
    animation: ln-pulse-red 2s infinite;
  }
`;

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');
  const [matchCount, setMatchCount] = useState(40);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 280]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  const revealProps = (delay = 0) => ({
    initial: { opacity: 0, y: 36 },
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
    <div className="min-h-screen text-white overflow-x-hidden ln-sans relative" style={{ background: 'linear-gradient(to bottom, #09090b 0%, #0d0d12 30%, #0c0a10 75%, #08080a 100%)' }}>
      <style>{STYLES}</style>
      <div className="ln-noise" />
      <div className="ln-doodle-pattern-bg" />

      {/* ══ NAV ═════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3.5 border-b border-white/10' : 'py-6'}`}
        style={{
          background: scrolled ? 'rgba(9, 9, 11, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" linked={false} />
            <span className="ln-live-dot" title="Live Platform Status" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[
              ['How It Works', '#how-it-works'],
              ['Features', '#features'],
              ['Pricing', '#pricing'],
              ['Stories', '#stories']
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-300">
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:scale-105 hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO (CLEAN UNTOUCHED HERO SECTION) ═══════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
        {/* Atmospheric background image overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-65 mix-blend-screen">
            <img
              src="https://framerusercontent.com/images/9zvwRJAavKKacVyhFCwHyXW1U.png?width=1536&height=1024"
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ filter: 'hue-rotate(320deg) saturate(1.15) brightness(0.85)' }}
            />
          </div>
        </div>

        {/* Floating hand — left */}
        <div
          className="absolute -left-[10%] top-[-10%] md:left-[-5%] md:top-[-15%] w-[50vw] md:w-[40vw] max-w-[800px] z-10 pointer-events-none ln-float-l"
          style={{ 
            mixBlendMode: 'hard-light', 
            opacity: 0.82,
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)'
          }}
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
          style={{ 
            mixBlendMode: 'hard-light', 
            opacity: 0.82,
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)'
          }}
        >
          <img
            src="https://framerusercontent.com/images/X89VFCABCEjjZ4oLGa3PjbOmsA.png?width=1542&height=1002"
            alt=""
            className="w-full h-auto object-contain"
            style={{ filter: 'hue-rotate(320deg) saturate(1.2) brightness(0.88)' }}
          />
        </div>

        {/* Seamless Melting Gradient Overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-80 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(9,9,11,0.4) 40%, rgba(9,9,11,0.85) 75%, #09090b 100%)' }}
        />

        {/* Hero text */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 text-center max-w-4xl mx-auto px-6 flex flex-col items-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95 }}
            className="text-5xl md:text-7xl font-medium leading-[1.1] tracking-tight mb-6 ln-serif mix-blend-overlay relative"
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
                <div className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: '#f43f5e' }} />
                <span className="relative z-10">Find Your Match</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-full text-sm font-medium bg-white text-black hover:scale-105 hover:bg-gray-100 transition-all duration-300"
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

      {/* ══ REST OF THE SECTIONS CONTAINER WITH FORCE FIELD BACKGROUND ════ */}
      <div className="relative">
        {/* Interactive ForceField Particle Layer for all lower sections */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-auto">
          <ForceFieldBackground 
            hue={345}
            saturation={90}
            spacing={24}
            forceStrength={18}
            magnifierRadius={190}
            minStroke={1.5}
            maxStroke={4.5}
            density={1.2}
          />
        </div>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden z-10">
          {/* Vibrant Rose Gold & Amethyst Mesh Spotlights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] pointer-events-none select-none opacity-45 blur-[140px] z-0" 
               style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(168,85,247,0.18) 50%, transparent 70%)' }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section heading */}
            <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-16 md:mb-20 relative">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-6 border border-rose-500/40 bg-rose-500/15 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <Sparkles size={14} className="text-white animate-pulse" />
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-white">Simplified Path to Love</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 ln-serif text-white">
                Three steps to your<br />
                <span className="italic font-normal ln-glow-text-rose">forever story</span>
              </h2>
              <p className="text-base md:text-lg text-zinc-300 font-light max-w-xl mx-auto leading-relaxed">
                We remove the noise so the right person can find you. Simple, intentional, real.
              </p>
            </motion.div>

            {/* Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
              {[
                { icon: Sparkles, title: 'Create Profile', desc: 'Share your story, your passions, and what makes your heart sing.', num: '01' },
                { icon: Compass, title: 'Start Connecting', desc: 'Our AI finds people who truly complement your personality and values.', num: '02' },
                { icon: Heart, title: 'Find Your Match', desc: 'Move from meaningful conversations to a love that lasts a lifetime.', num: '03' },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  {...revealProps(i * 0.15)}
                  className="ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-[0_0_25px_rgba(244,63,94,0.45)] relative"
                           style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>
                        <step.icon size={26} className="text-white" />
                      </div>
                      <span className="text-4xl font-mono font-black text-white/30 group-hover:text-rose-300 transition-colors duration-300">{step.num}</span>
                    </div>
                    <span className="text-[11px] font-mono tracking-[0.25em] uppercase block mb-2 font-bold text-rose-400">Step {step.num}</span>
                    <h3 className="text-2xl font-bold text-white tracking-wide mb-3 ln-serif">{step.title}</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-light">{step.desc}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/15 flex items-center text-xs font-bold gap-2 text-rose-400">
                    <span>Explore detail</span> <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Banner */}
            <motion.div {...revealProps(0.3)} className="mt-20 max-w-5xl mx-auto">
              <div className="ln-luxe-glass rounded-3xl p-8 md:p-10 border border-white/20 relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/15">
                  {[
                    { num: '2.4M+', label: 'Active Members', icon: Users },
                    { num: '680K+', label: 'Love Matches', icon: Heart },
                    { num: '99.4%', label: 'Safety Index', icon: ShieldCheck },
                    { num: '4.9 ★', label: 'App Rating', icon: Star },
                  ].map((stat, idx) => (
                    <div key={stat.label} className={`text-center ${idx !== 0 ? 'pt-6 md:pt-0' : ''}`}>
                      <div className="text-3xl md:text-4xl font-extrabold ln-serif mb-1.5 flex items-center justify-center gap-2">
                        <span className="ln-glow-text-rose">{stat.num}</span>
                      </div>
                      <div className="text-xs text-zinc-300 tracking-wider uppercase font-semibold flex items-center justify-center gap-1.5">
                        <stat.icon size={13} className="text-rose-500" />
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ FEATURES BENTO GRID ══════════════════════════════════════ */}
        <section id="features" className="py-24 md:py-32 relative overflow-hidden z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.06] pointer-events-none ln-dot-bg" />
          <div className="absolute top-1/3 right-[5%] w-[600px] h-[600px] pointer-events-none select-none opacity-40 blur-[130px] z-0" 
               style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.28) 0%, transparent 70%)' }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section heading */}
            <motion.div {...revealProps()} className="mb-16 md:mb-20 text-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-6 border border-purple-400/40 bg-purple-500/15 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Zap size={14} className="text-white" />
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-white">Modern Matchmaking Tech</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4 ln-serif text-white">
                Built for <span className="italic font-normal ln-glow-text-purple">genuine chemistry</span>
              </h2>
              <p className="text-base md:text-lg text-zinc-300 font-light max-w-xl mx-auto">
                Everything you need to discover, chat, and meet safely with total confidence.
              </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
              {/* Card 1 — AI Compatibility */}
              <motion.div
                {...revealProps(0.1)}
                onClick={() => navigate('/signup')}
                className="md:col-span-7 ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 md:p-10 relative overflow-hidden cursor-pointer group flex flex-col justify-between min-h-[360px]"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(244,63,94,0.45)]"
                         style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider text-white border border-rose-500/40 bg-rose-500/25 shadow-md">
                      AI-POWERED
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 ln-serif">
                    Smart AI Compatibility Assistant
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light max-w-md mb-6">
                    Our Groq LLM microservice analyzes your dating preferences, conversation style, and lifestyle dynamics for intelligent match scoring.
                  </p>

                  {/* Compatibility Widget */}
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-md">
                    <div className="flex justify-between items-center text-xs text-white mb-2 font-semibold">
                      <span className="text-rose-300 font-bold">AI Match Synergy</span>
                      <span className="font-mono font-bold text-white text-sm">98% Compatibility</span>
                    </div>
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full w-[98%]" style={{ background: 'linear-gradient(90deg, #f43f5e, #fb7185)' }} />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-rose-400 font-bold">Explore AI Assistant</span>
                  <ArrowRight size={18} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>

              {/* Card 2 — Video Dates */}
              <motion.div
                {...revealProps(0.2)}
                onClick={() => navigate('/signup')}
                className="md:col-span-5 ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 md:p-10 relative overflow-hidden cursor-pointer group flex flex-col justify-between min-h-[360px]"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(168,85,247,0.45)]"
                         style={{ background: 'linear-gradient(135deg, #a855f7 0%, #f43f5e 100%)' }}>
                      <Video size={28} className="text-white" />
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider text-white border border-purple-400/40 bg-purple-500/25 shadow-md">
                      LIVEKIT
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 ln-serif">
                    Crystal Live Video Dates
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light mb-6">
                    Enjoy HD end-to-end voice and video dates inside the app before meeting in person. Safe, fast, and intimate.
                  </p>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15">
                    <Radio size={16} className="text-rose-400 animate-pulse" />
                    <span className="text-xs text-white font-mono font-medium">HD Live Peer-to-Peer Calls</span>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-rose-400 font-bold">Virtual Dating</span>
                  <ArrowRight size={18} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>

              {/* Card 3 — Verified Security */}
              <motion.div
                {...revealProps(0.25)}
                onClick={() => navigate('/signup')}
                className="md:col-span-5 ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 md:p-10 relative overflow-hidden cursor-pointer group flex flex-col justify-between min-h-[340px]"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(6,182,212,0.45)]"
                         style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>
                      <ShieldCheck size={28} />
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider text-white border border-cyan-400/40 bg-cyan-500/25 shadow-md">
                      VERIFIED
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 ln-serif">
                    Face Biometric Lock
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light mb-6">
                    No catfishing. Integrated AI face locks and profile verification keep your dating environment authentic and secure.
                  </p>

                  <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono font-semibold">
                    <Shield size={14} /> 100% Real Verified Singles
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-cyan-300 font-bold">Safe Community</span>
                  <ArrowRight size={18} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>

              {/* Card 4 — Privacy Control */}
              <motion.div
                {...revealProps(0.3)}
                onClick={() => navigate('/signup')}
                className="md:col-span-7 ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 md:p-10 relative overflow-hidden cursor-pointer group flex flex-col justify-between min-h-[340px]"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(245,158,11,0.45)]"
                         style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
                      <Lock size={28} />
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider text-white border border-amber-400/40 bg-amber-500/25 shadow-md">
                      ENCRYPTED
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 ln-serif">
                    Total Privacy Control
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light max-w-md mb-6">
                    Incognito mode, customizable profile visibility settings, and encrypted message history keep your personal life private.
                  </p>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-md">
                    <EyeOff size={16} className="text-amber-300" />
                    <span className="text-xs text-white font-semibold">Stealth Mode & Incognito Active</span>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-bold">Privacy Protection</span>
                  <ArrowRight size={18} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ PRICING & SUBSCRIPTION PLANS ══════════════════════════════ */}
        <section id="pricing" className="py-24 md:py-32 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section heading */}
            <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-6 border border-rose-500/40 bg-rose-500/15 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <Crown size={14} className="text-white" />
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-white">Flexible Memberships</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4 ln-serif text-white">
                Choose your <span className="italic font-normal ln-glow-text-rose">romance plan</span>
              </h2>
              <p className="text-base md:text-lg text-zinc-300 font-light max-w-xl mx-auto">
                Unlock unlimited swipes, video dates, and AI matching boosts. No hidden commitments.
              </p>
            </motion.div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Essential Plan */}
              <motion.div
                {...revealProps(0.1)}
                className="ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 flex flex-col justify-between border border-white/15"
              >
                <div>
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-rose-400">Essential</span>
                  <div className="flex items-baseline gap-1 mt-4 mb-4">
                    <span className="text-4xl font-extrabold text-white">₹1,000</span>
                    <span className="text-xs text-zinc-400">/ 30 days</span>
                  </div>
                  <p className="text-xs text-zinc-300 mb-6 font-light">Perfect for getting started and exploring matches.</p>

                  <div className="h-px bg-white/15 mb-6" />

                  <ul className="space-y-3.5 mb-8 text-xs text-zinc-200 font-medium">
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-rose-500 flex-shrink-0" /> Unlimited profile swipes</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-rose-500 flex-shrink-0" /> See who liked you</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-rose-500 flex-shrink-0" /> Real-time chat & emojis</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-rose-500 flex-shrink-0" /> Ad-free experience</li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/35 transition-all duration-300 shadow-md"
                >
                  Choose Essential
                </button>
              </motion.div>

              {/* Premium Plan (Featured Spotlight) */}
              <motion.div
                {...revealProps(0.2)}
                className="rounded-3xl p-8 flex flex-col justify-between relative md:-translate-y-3 border-2 border-white shadow-[0_25px_90px_rgba(244,63,94,0.55)]"
                style={{ background: 'linear-gradient(160deg, #f43f5e 0%, #e11d48 50%, #a855f7 100%)' }}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-300 text-black shadow-xl">
                  MOST POPULAR
                </div>

                <div>
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-white">Premium Pass</span>
                  <div className="flex items-baseline gap-1 mt-4 mb-4">
                    <span className="text-5xl font-extrabold text-white">₹2,000</span>
                    <span className="text-xs text-white/90">/ 90 days</span>
                  </div>
                  <p className="text-xs text-white/95 mb-6 font-light">Best value — 3× longer access with full feature unlock.</p>

                  <div className="h-px bg-white/25 mb-6" />

                  <ul className="space-y-3.5 mb-8 text-xs text-white font-semibold">
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-amber-300 flex-shrink-0" /> Everything in Essential</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-amber-300 flex-shrink-0" /> Boost profile visibility in Feed</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-amber-300 flex-shrink-0" /> HD Video & Voice call sessions</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-amber-300 flex-shrink-0" /> Groq AI Match Assistant</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-amber-300 flex-shrink-0" /> Golden Crown Profile Badge</li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300 shadow-xl"
                >
                  Get Premium Pass
                </button>
              </motion.div>

              {/* VIP Plan */}
              <motion.div
                {...revealProps(0.3)}
                className="ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 flex flex-col justify-between border border-white/15"
              >
                <div>
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-purple-400">VIP Elite</span>
                  <div className="flex items-baseline gap-1 mt-4 mb-4">
                    <span className="text-4xl font-extrabold text-white">₹4,500</span>
                    <span className="text-xs text-zinc-400">/ 180 days</span>
                  </div>
                  <p className="text-xs text-zinc-300 mb-6 font-light">Full semi-annual VIP access with priority support.</p>

                  <div className="h-px bg-white/15 mb-6" />

                  <ul className="space-y-3.5 mb-8 text-xs text-zinc-200 font-medium">
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-purple-400 flex-shrink-0" /> Unlimited AI Match Recommendations</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-purple-400 flex-shrink-0" /> Incognito Privacy Mode</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-purple-400 flex-shrink-0" /> Dedicated Match Concierge</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-purple-400 flex-shrink-0" /> Priority 24/7 Support</li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-purple-400/40 bg-purple-500/20 hover:bg-purple-500/35 transition-all duration-300 shadow-md"
                >
                  Choose VIP
                </button>
              </motion.div>
            </div>

            {/* Interactive Match Calculator */}
            <motion.div
              {...revealProps(0.4)}
              className="ln-luxe-glass rounded-3xl p-8 max-w-2xl mx-auto mt-16 border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-1.5 text-center ln-serif">Match Estimator</h3>
              <p className="text-xs text-zinc-400 text-center mb-8 font-light tracking-wider">Slide to estimate how many profiles you want to swipe & match monthly</p>
              
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Target Matches</span>
                  <span className="text-2xl font-black text-white font-mono">{matchCount} / month</span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={matchCount}
                  onChange={(e) => setMatchCount(Number(e.target.value))}
                  className="w-full h-2.5 rounded-lg bg-white/15 appearance-none cursor-pointer border-none accent-rose-500"
                  style={{ outline: 'none' }}
                />
                
                <div className="w-full h-px bg-white/15 my-1" />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Recommended Plan</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{matchCount > 90 ? 'VIP Elite' : matchCount > 30 ? 'Premium Pass' : 'Essential'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ STORIES / TESTIMONIALS ═══════════════════════════════════ */}
        <section id="stories" className="py-24 md:py-32 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section heading */}
            <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-6 border border-rose-500/40 bg-rose-500/15 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <Heart size={14} className="text-white fill-white/30" />
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-white">Love Stories</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4 ln-serif text-white">
                Real couples.<br />
                <span className="italic font-normal ln-glow-text-rose">Real happily ever afters.</span>
              </h2>
              <p className="text-base md:text-lg text-zinc-300 font-light max-w-xl mx-auto">
                Over 500,000 matches have turned into beautiful love stories on LoveNest.
              </p>
            </motion.div>

            {/* Testimonial Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  q: "LoveNest's AI match compatibility suggested Rohan to me based on shared values. We got married last year!",
                  name: "Priya & Rohan",
                  tag: "Married in Mumbai",
                  img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop&q=80"
                },
                {
                  q: "The video date feature was a gamechanger! We felt so safe and had instant chemistry before meeting in person.",
                  name: "Ananya & Dev",
                  tag: "Together 2 Years",
                  img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&auto=format&fit=crop&q=80"
                },
                {
                  q: "From our first chat on LoveNest to building our home together. This app actually cares about real intentions.",
                  name: "Sara & Mikhail",
                  tag: "Engaged in Delhi",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80"
                }
              ].map((story, i) => (
                <motion.div
                  key={story.name}
                  {...revealProps(i * 0.15)}
                  className="ln-luxe-glass ln-luxe-glass-hover rounded-3xl p-8 flex flex-col justify-between border border-white/15"
                >
                  <div>
                    <div className="flex gap-1 mb-6 text-amber-300">
                      {[...Array(5)].map((_, sIdx) => (
                        <Star key={sIdx} size={16} fill="currentColor" />
                      ))}
                    </div>

                    <p className="text-zinc-200 text-sm leading-relaxed mb-6 font-light italic">
                      "{story.q}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-white/15">
                    <img src={story.img} alt={story.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" />
                    <div>
                      <h4 className="text-white font-bold text-sm font-serif">{story.name}</h4>
                      <span className="text-xs text-rose-400 font-semibold">{story.tag}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ═══════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 relative overflow-hidden z-10">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              {...revealProps()}
              className="ln-luxe-glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border-2 border-white/25 shadow-[0_30px_90px_rgba(244,63,94,0.35)]"
              style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.3) 0%, rgba(168,85,247,0.2) 100%)' }}
            >
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 ln-serif text-white">
                  Ready to find<br />
                  <span className="italic font-normal ln-glow-text-rose">your person?</span>
                </h2>
                <p className="text-base md:text-lg text-zinc-200 font-light mb-10 leading-relaxed">
                  Join millions of singles discovering authentic relationships. Your love story begins with a single swipe.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-9 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 hover:shadow-[0_0_35px_rgba(244,63,94,0.7)] hover:scale-105 transition-all duration-300"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/30 hover:bg-white/10 transition-all duration-300"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden bg-[#08080a] pt-16 pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" linked={false} />
              <p className="text-zinc-400 text-xs leading-relaxed mt-4 max-w-xs font-light">
                LoveNest — Where hearts find home. Built with love to foster genuine human connection.
              </p>
            </div>

            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400 block mb-4">Navigation</span>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-light">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">AI Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Membership Plans</a></li>
                <li><a href="#stories" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-400 block mb-4">Product</span>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-light">
                <li><button onClick={() => navigate('/feed')} className="hover:text-white transition-colors">Discover Feed</button></li>
                <li><button onClick={() => navigate('/ai-chat')} className="hover:text-white transition-colors">LoveBot AI</button></li>
                <li><button onClick={() => navigate('/premium')} className="hover:text-white transition-colors">Premium Upgrade</button></li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400 block mb-4">Safety & Privacy</span>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-light">
                <li className="hover:text-white transition-colors cursor-pointer">Community Guidelines</li>
                <li className="hover:text-white transition-colors cursor-pointer">Safety Tips</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-light">
            <p>© {new Date().getFullYear()} LoveNest Platform Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for real relationships</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
