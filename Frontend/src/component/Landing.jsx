import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Lenis from 'lenis';
import Logo from './Logo';
import ForceFieldBackground from './ForceFieldBackground';
import Footer16 from './Footer16';
import {
  Sparkles, Heart, ShieldCheck, Video, Lock, Zap, Crown,
  Star, Check, ArrowRight, Compass, Users, ChevronRight,
  Radio, EyeOff, Shield, Quote, BadgeCheck
} from 'lucide-react';

/* ─── Ultra-Sleek Luxury Obsidian & Rose Gold Aesthetics ─────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,600&display=swap');
  .ln-serif { font-family: 'Playfair Display', serif !important; }
  .ln-sans  { font-family: 'Inter', sans-serif; }

  @keyframes ln-float-l { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-22px) rotate(2.5deg); } }
  @keyframes ln-float-r { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(22px) rotate(-2.5deg); } }
  .ln-float-l { 
    animation: ln-float-l 13s ease-in-out infinite; 
    will-change: transform;
    transform: translateZ(0);
  }
  .ln-float-r { 
    animation: ln-float-r 15s ease-in-out infinite; 
    will-change: transform;
    transform: translateZ(0);
  }

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
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ln-luxe-glass-hover:hover {
    transform: translateY(-6px);
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

/* 🔢 Smooth Live Counting Number Component */
function AnimatedCounter({ value, decimals = 0, suffix = '', prefix = '', duration = 1.8 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (isInView) {
      const end = parseFloat(value);
      const startTime = performance.now();
      const durMs = duration * 1000;

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = end * ease;
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(end);
        }
      };

      requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');
  const lenisRef = useRef(null);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const heroY = useTransform(scrollY, [0, 700], [0, 240]);
  const heroOpacity = useTransform(scrollY, [0, 550], [1, 0]);

  const revealProps = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }
  });

  /* 🌌 Initialize Lenis Inertia Smooth Scroll Engine */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.8,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: -60, duration: 1.3 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  /* navbar scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
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

      {/* 🔮 Ultra-Smooth Spring Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 z-50 origin-left shadow-[0_0_15px_#f43f5e]"
        style={{ scaleX }}
      />

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
              <a
                key={label}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-300 cursor-pointer"
              >
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

        {/* ══ THREE STEPS TO YOUR FOREVER STORY ═════════════════════════ */}
        <section id="how-it-works" className="py-12 md:py-16 relative overflow-hidden z-10">
          {/* Vibrant Rose Gold & Amethyst Mesh Spotlights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] pointer-events-none select-none opacity-45 blur-[140px] z-0"
            style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(168,85,247,0.18) 50%, transparent 70%)' }} />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            {/* Featured Card matching user's reference image */}
            <motion.div
              {...revealProps()}
              className="ln-luxe-glass rounded-[36px] p-6 md:p-10 border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.65)] flex flex-col md:flex-row gap-8 items-stretch relative overflow-hidden"
            >
              {/* Left Panel — Sunset Couple Illustration Card */}
              <div className="w-full md:w-[40%] rounded-[28px] p-4 flex flex-col justify-center items-center relative overflow-hidden group bg-white/5 border border-white/10">
                <div className="relative w-full aspect-[4/5] rounded-[22px] overflow-hidden shadow-2xl">
                  <img
                    src="/forever_story_couple_sunset.png"
                    alt="Couple Sunset"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Right Panel — Steps & Details */}
              <div className="w-full md:w-[60%] flex flex-col justify-center py-2 px-2 md:px-4">
                {/* Header */}
                <div className="mb-8 pb-6 border-b border-white/12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2.5 ln-serif">
                    Three steps to your forever story
                  </h2>
                  <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed">
                    Simple, intentional, and made for people looking for something real.
                  </p>
                </div>

                {/* Steps List with Dividers */}
                <div className="space-y-6">
                  {/* Step 01 */}
                  <div className="pb-6 border-b border-white/12 group cursor-pointer">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 flex items-center gap-3">
                      <span className="font-mono text-rose-400 font-extrabold text-base md:text-lg">01 —</span>
                      <span className="group-hover:text-rose-300 transition-colors">Create your profile</span>
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-300 font-light pl-11">
                      Share what matters most to you.
                    </p>
                  </div>

                  {/* Step 02 */}
                  <div className="pb-6 border-b border-white/12 group cursor-pointer">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 flex items-center gap-3">
                      <span className="font-mono text-purple-400 font-extrabold text-base md:text-lg">02 —</span>
                      <span className="group-hover:text-purple-300 transition-colors">Start connecting</span>
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-300 font-light pl-11">
                      Meet people who genuinely complement your values.
                    </p>
                  </div>

                  {/* Step 03 */}
                  <div className="group cursor-pointer">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 flex items-center gap-3">
                      <span className="font-mono text-rose-400 font-extrabold text-base md:text-lg">03 —</span>
                      <span className="group-hover:text-rose-300 transition-colors">Find your match</span>
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-300 font-light pl-11">
                      Build conversations that can become a lifetime together.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 🌟 Slim & Sleek Animated Social Proof Capsule Bar (Full-width matching max-w-6xl) */}
            <motion.div {...revealProps(0.25)} className="mt-8 md:mt-10 w-full">
              <div 
                className="relative rounded-2xl md:rounded-full py-4 md:py-5 px-6 md:px-10 border border-white/10 overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-rose-500/30"
                style={{
                  background: 'linear-gradient(135deg, rgba(18, 14, 22, 0.75) 0%, rgba(12, 10, 15, 0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {/* Stat 01 */}
                  <div className="flex items-center justify-center gap-3 pt-2 md:pt-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 text-rose-400">
                      <Users size={15} />
                    </div>
                    <div className="text-left">
                      <div className="text-xl sm:text-2xl font-bold ln-serif text-white leading-tight">
                        <span className="ln-glow-text-rose"><AnimatedCounter value={2.4} decimals={1} suffix="M+" /></span>
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Active Members</div>
                    </div>
                  </div>

                  {/* Stat 02 */}
                  <div className="flex items-center justify-center gap-3 pt-2 md:pt-0 md:pl-6">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400">
                      <Heart size={15} />
                    </div>
                    <div className="text-left">
                      <div className="text-xl sm:text-2xl font-bold ln-serif text-white leading-tight">
                        <span className="ln-glow-text-rose"><AnimatedCounter value={680} decimals={0} suffix="K+" /></span>
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Love Matches</div>
                    </div>
                  </div>

                  {/* Stat 03 */}
                  <div className="flex items-center justify-center gap-3 pt-2 md:pt-0 md:pl-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="text-left">
                      <div className="text-xl sm:text-2xl font-bold ln-serif text-white leading-tight">
                        <span className="ln-glow-text-purple"><AnimatedCounter value={99.4} decimals={1} suffix="%" /></span>
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Safety Index</div>
                    </div>
                  </div>

                  {/* Stat 04 */}
                  <div className="flex items-center justify-center gap-3 pt-2 md:pt-0 md:pl-6">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                      <Star size={15} />
                    </div>
                    <div className="text-left">
                      <div className="text-xl sm:text-2xl font-bold ln-serif text-white leading-tight">
                        <span className="ln-glow-text-rose"><AnimatedCounter value={4.9} decimals={1} suffix=" ★" /></span>
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">App Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ BUILT FOR GENUINE CHEMISTRY (PERFECTLY ALIGNED DESIGN) ═══ */}
        <section id="features" className="py-12 md:py-16 relative overflow-hidden z-10">
          {/* Ambient Glowing Magenta & Amethyst Mesh Spotlights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] pointer-events-none select-none opacity-50 blur-[150px] z-0"
            style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.35) 0%, rgba(168,85,247,0.25) 45%, transparent 70%)' }} />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            {/* Section Header */}
            <motion.div {...revealProps()} className="mb-10 md:mb-12 text-center">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3.5 ln-serif text-white">
                Built for <span className="italic font-normal ln-glow-text-purple">genuine chemistry.</span>
              </h2>
              <p className="text-sm md:text-base text-zinc-300 font-light max-w-lg mx-auto leading-relaxed">
                Everything you need to chat, meet safely, and trust with confidence.
              </p>
            </motion.div>

            {/* Main Interactive Container (Nodes Left, Portrait Right) */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative">
              {/* Left Column — Perfectly Aligned 2x2 Feature Node Grid */}
              <div className="w-full lg:w-[56%] grid grid-cols-1 sm:grid-cols-2 gap-6 relative order-2 lg:order-1 items-stretch">
                {[
                  {
                    num: '01',
                    title: 'Smart AI Compatibility Assistant',
                    desc: 'Our Groq LLM microservice analyzes your dating preferences, conversation style, and lifestyle dynamics for intelligent 98% match synergy scoring.',
                    tag: 'AI MATCHING',
                    tagBg: 'border-purple-400/40 bg-purple-500/20 text-purple-300',
                    icon: Sparkles
                  },
                  {
                    num: '02',
                    title: 'Crystal Live Video Dates',
                    desc: 'Enjoy HD end-to-end voice and video dates inside the app before meeting in person. Safe, fast, intimate, and authentic.',
                    tag: 'LIVEKIT HD',
                    tagBg: 'border-rose-500/40 bg-rose-500/20 text-rose-300',
                    icon: Video
                  },
                  {
                    num: '03',
                    title: 'Face Biometric Lock',
                    desc: 'No catfishing allowed. Integrated AI face locks and profile verification keep your dating environment authentic and safe.',
                    tag: '100% VERIFIED',
                    tagBg: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300',
                    icon: ShieldCheck
                  },
                  {
                    num: '04',
                    title: 'Total Privacy Control',
                    desc: 'Incognito mode, customizable profile visibility settings, and encrypted message history keep your personal life completely private.',
                    tag: 'ENCRYPTED',
                    tagBg: 'border-amber-400/40 bg-amber-500/20 text-amber-300',
                    icon: Lock
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={item.num}
                    {...revealProps(idx * 0.1)}
                    onClick={() => navigate('/signup')}
                    className="ln-luxe-glass rounded-[28px] p-7 border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-pointer group hover:border-purple-400/50 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] transition-all duration-500 relative z-10 flex flex-col justify-between h-full"
                    style={{ background: 'rgba(18, 14, 26, 0.75)', backdropFilter: 'blur(24px)' }}
                  >
                    <div>
                      {/* Glowing Pulse Node Dot */}
                      <div className="absolute top-4 right-4 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] group-hover:scale-125 transition-transform" />
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-mono font-black text-purple-400/80 group-hover:text-rose-300 transition-colors">{item.num}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest border ${item.tagBg}`}>
                          {item.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2.5 ln-serif group-hover:text-rose-200 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-zinc-300 leading-relaxed font-light mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-auto">
                      <span className="text-xs text-rose-400 font-bold group-hover:text-white transition-colors">Learn More</span>
                      <ArrowRight size={15} className="text-zinc-400 group-hover:text-rose-400 group-hover:translate-x-1.5 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ⚡ Sleek Animated Laser Energy Connector Line between Grid and Picture */}
              <div className="hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[56%] right-[44%] w-8 h-1 z-30 pointer-events-none">
                <div className="w-full h-[2px] bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 shadow-[0_0_18px_#f43f5e] relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 w-8 h-full bg-white shadow-[0_0_12px_#ffffff] ln-laser-pulse-beam" />
                </div>
              </div>

              {/* Right Column — Symmetrically Aligned Dramatic Cinematic Portrait Card */}
              <motion.div
                {...revealProps(0.1)}
                className="w-full lg:w-[44%] min-h-[520px] rounded-[36px] overflow-hidden border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.35)] relative group flex-shrink-0 order-1 lg:order-2 flex"
              >
                <img
                  src="/chemistry_couple_portrait.png"
                  alt="Genuine Chemistry Couple"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Receiver Emitter Dot on the couple image */}
                <div className="absolute top-[50%] -translate-y-1/2 left-4 w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_20px_#f43f5e] animate-ping" />
                <div className="absolute top-[50%] -translate-y-1/2 left-4 w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_15px_#f43f5e]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ PRICING & SUBSCRIPTION PLANS ══════════════════════════════ */}
        <section id="pricing" className="py-12 md:py-16 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section heading */}
            <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-10 md:mb-12">

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
          </div>
        </section>

        {/* ══ STORIES / TESTIMONIALS (ENHANCED LUXURY ROMANCE DESIGN) ═══════ */}
        <section id="stories" className="py-12 md:py-16 relative overflow-hidden z-10">
          {/* Ambient Romantic Background Glows */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] pointer-events-none select-none opacity-35 blur-[140px] z-0"
            style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(168,85,247,0.15) 50%, transparent 75%)' }}
          />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section Heading */}
            <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-10 md:mb-12">

              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4 ln-serif text-white">
                Real couples.<br />
                <span className="italic font-normal ln-glow-text-rose drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                  Real happily ever afters.
                </span>
              </h2>
              <p className="text-base md:text-lg text-zinc-300 font-light max-w-xl mx-auto leading-relaxed">
                Over <span className="text-rose-300 font-medium">500,000 matches</span> have turned into authentic, meaningful relationships on LoveNest.
              </p>
            </motion.div>

            {/* Testimonial Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  q: "LoveNest's AI compatibility suggested Rohan to me based on our core shared values. We had our first video date that same weekend, and we got married last year in Mumbai!",
                  name: "Priya & Rohan",
                  milestone: "💍 Married • Mumbai",
                  badge: "99% AI Compatibility",
                  matchedYear: "Matched 2024",
                  img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80"
                },
                {
                  q: "The HD Video Date feature was a total gamechanger. We felt completely safe and had instant chemistry before ever meeting in person. Two years strong and happier than ever!",
                  name: "Ananya & Dev",
                  milestone: "💖 Together 2 Years • Bangalore",
                  badge: "10/10 Video Chemistry",
                  matchedYear: "Matched 2024",
                  img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80"
                },
                {
                  q: "From our very first late-night chat on LoveNest to building our home together. This platform actually attracts people with real intentions for love and lifelong partnership.",
                  name: "Sara & Mikhail",
                  milestone: "🥂 Engaged • Delhi",
                  badge: "Forever Verified Match",
                  matchedYear: "Matched 2025",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80"
                }
              ].map((story, i) => (
                <motion.div
                  key={story.name}
                  {...revealProps(i * 0.15)}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className="relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden border border-white/15 hover:border-rose-500/50 transition-all duration-400 group"
                  style={{
                    background: 'linear-gradient(145deg, rgba(22, 16, 26, 0.75) 0%, rgba(14, 12, 18, 0.85) 100%)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Glowing Hover Aura Inside Card */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-rose-500/15 blur-2xl pointer-events-none group-hover:bg-rose-500/25 transition-all duration-500" />

                  {/* Decorative Luminous Quote Watermark */}
                  <Quote
                    size={64}
                    className="absolute top-6 right-6 text-rose-400/10 pointer-events-none group-hover:text-rose-400/20 transition-colors duration-300"
                  />

                  {/* Top Match Tag & Rating */}
                  <div className="relative z-10 mb-6">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                        <Sparkles size={11} className="text-rose-400" />
                        {story.badge}
                      </span>
                      <span className="text-[11px] font-medium text-zinc-400">
                        {story.matchedYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                      {[...Array(5)].map((_, sIdx) => (
                        <Star key={sIdx} size={15} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  {/* Quote Body */}
                  <div className="relative z-10 mb-8">
                    <p className="text-zinc-200 text-sm leading-relaxed font-light italic">
                      "{story.q}"
                    </p>
                  </div>

                  {/* Couple Profile Footer */}
                  <div className="relative z-10 flex items-center gap-4 pt-5 border-t border-white/10">
                    <div className="relative">
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                        <img
                          src={story.img}
                          alt={story.name}
                          className="w-13 h-13 rounded-full object-cover border-2 border-[#121218]"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white border-2 border-[#121218] shadow-sm">
                        <Heart size={10} className="fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-white font-bold text-sm tracking-tight truncate ln-serif">{story.name}</h4>
                        <BadgeCheck size={15} className="text-rose-400 flex-shrink-0" />
                      </div>
                      <span className="inline-block text-[12px] font-medium text-rose-300 mt-0.5 tracking-wide">
                        {story.milestone}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ EDITORIAL CINEMATIC CTA BANNER ═══════════════════════════════════ */}
        <section className="py-12 md:py-16 relative overflow-hidden z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="relative rounded-[36px] overflow-hidden border-2 border-rose-500/30 shadow-[0_30px_100px_rgba(244,63,94,0.18),0_20px_60px_rgba(0,0,0,0.9)] min-h-[540px] md:min-h-[600px] flex items-center justify-center text-center p-8 md:p-20 group">
              {/* 🌹 High-Definition Romantic Couple Background Video Layer */}
              <video
                src="/romantic-lovers-sunset.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-1000 ease-out group-hover:scale-[1.03]"
                style={{ filter: 'contrast(1.08) brightness(0.92) saturate(1.15)' }}
              />

              {/* Romantic Obsidian & Rose Gold Legibility Overlay Gradient */}
              <div
                className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(to bottom, rgba(18, 9, 15, 0.72) 0%, rgba(244, 63, 94, 0.15) 45%, rgba(9, 9, 11, 0.90) 100%)'
                }}
              />

              {/* Soft Ambient Rose & Violet Spotlight Glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-500/25 blur-[120px] pointer-events-none z-0" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-500/20 blur-[120px] pointer-events-none z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-rose-600/10 blur-[140px] pointer-events-none z-0" />

              {/* Staggered Entrance Content */}
              <div className="relative z-10 max-w-3xl mx-auto">
                {/* Display Heading - Instrument Serif 80px (Mobile 48px), -2.46px tracking */}
                <motion.h2
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="font-instrument text-[48px] md:text-[80px] font-normal leading-[0.95] tracking-[-2.46px] text-white mb-6"
                >
                  Ready to find{' '}
                  <em className="italic font-normal font-instrument text-rose-300 drop-shadow-[0_0_35px_rgba(244,63,94,0.65)]">
                    your person?
                  </em>
                </motion.h2>

                {/* Sub-header Copy - Inter 18px, 1.625 line-height, 670px max-width */}
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="font-sans text-[16px] md:text-[18px] font-normal text-zinc-100/90 leading-[1.625] max-w-[670px] mx-auto mb-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                >
                  Join millions of singles discovering authentic relationships. Your love story begins with a single swipe.
                </motion.p>

                {/* Pill Action Buttons (Ultra-Smooth Spring Micro-interactions) */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.035, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    onClick={() => navigate('/signup')}
                    className="rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold px-12 py-5 text-[14px] tracking-widest uppercase border border-rose-400/40 shadow-[0_0_35px_rgba(244,63,94,0.45)] hover:shadow-[0_0_55px_rgba(244,63,94,0.75)] hover:border-rose-300 transition-all duration-300 ease-out cursor-pointer"
                  >
                    CREATE FREE ACCOUNT
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.035, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    onClick={() => navigate('/login')}
                    className="rounded-full bg-black/50 text-white border border-white/30 backdrop-blur-md px-10 py-5 text-[14px] font-medium tracking-widest uppercase hover:bg-white/15 hover:border-rose-300/60 transition-all duration-300 ease-out cursor-pointer shadow-lg"
                  >
                    SIGN IN
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ FOOTER 16 ══════════════════════════════════════════════════ */}
      <Footer16 />
    </div>
  );
}
