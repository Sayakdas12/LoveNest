import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from './Logo';

/* ─── Inline styles ───────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
  .ln-serif { font-family: 'Playfair Display', serif !important; }
  .ln-sans  { font-family: 'Inter', sans-serif; }
  .ln-reveal {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1);
  }
  .ln-reveal.ln-active { opacity: 1; transform: translateY(0); }
  @keyframes ln-float-l { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-22px) rotate(2.5deg); } }
  @keyframes ln-float-r { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(22px) rotate(-2.5deg); } }
  .ln-float-l { animation: ln-float-l 13s ease-in-out infinite; }
  .ln-float-r { animation: ln-float-r 15s ease-in-out infinite; }
  .ln-dot-bg {
    background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .ln-noise {
    position: fixed; inset: 0; z-index: 60; pointer-events: none;
    opacity: 0.035; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
`;

/* ─── Landing ─────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime]         = useState('');

  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0, 700],    [0,  280]);
  const heroOpacity = useTransform(scrollY, [0, 600],    [1,  0]);
  const cardDownY   = useTransform(scrollY, [200, 1200], [0,  55]);
  const cardUpY     = useTransform(scrollY, [200, 1200], [0, -55]);

  /* navbar scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* live clock */
  useEffect(() => {
    const tick = () => {
      const d  = new Date();
      let   h  = d.getHours();
      const m  = String(d.getMinutes()).padStart(2, '0');
      const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m} ${ap}`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('ln-active'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.ln-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden ln-sans">
      <style>{STYLES}</style>
      <div className="ln-noise" />

      {/* ══ NAV ═════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 border-b border-white/5' : 'py-7'}`}
        style={{
          background: scrolled ? 'rgba(5,5,5,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo size="md" linked={false} />
          <div className="hidden md:flex items-center gap-8">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Stories', '#stories']].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                {label}
              </a>
            ))}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:scale-105 hover:bg-gray-100 transition-all duration-300"
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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] z-10" />
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

      {/* ══ MISSION ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center ln-reveal">
            <h2
              className="text-3xl md:text-5xl lg:text-6xl leading-tight mb-12 ln-serif"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              We create the space where two hearts find their way to each other.
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light">
              Connection is clarity. We remove the noise so the right person can find you.
            </p>
          </div>

          <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {[['2M+', 'Members'], ['500K+', 'Matches Made'], ['98%', 'Satisfaction'], ['4.9★', 'App Rating']].map(([n, l], i) => (
              <div
                key={l}
                className="ln-reveal text-center"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold ln-serif mb-1" style={{ color: '#e94d7a' }}>{n}</div>
                <div className="text-xs text-gray-500 tracking-widest uppercase">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CARDS ════════════════════════════════════════════════════ */}
      <section id="features" className="py-40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="ln-reveal mb-32 text-center">
            <h2 className="text-5xl md:text-7xl ln-serif">
              Define your<br /><span className="italic">love story</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1 — rose */}
            <motion.div style={{ y: cardDownY }}>
              <div
                className="ln-reveal group cursor-pointer rounded-3xl p-8 md:p-12 flex flex-col justify-between shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_rgba(233,77,122,0.32)]"
                style={{ background: 'linear-gradient(145deg,#e94d7a,#c4789a)', aspectRatio: '4/5' }}
                onClick={() => navigate('/signup')}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center text-2xl group-hover:rotate-45 transition-transform duration-500">💞</div>
                  <span className="font-medium text-sm border border-black/20 px-3 py-1 rounded-full text-black/80">01</span>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl text-black mb-4 leading-none tracking-tight ln-serif">
                    New to<br />Love
                  </h3>
                  <p className="text-black/65 text-lg leading-snug">
                    You have the heart. We provide the space for it to find where it truly belongs.
                  </p>
                </div>
                <div className="w-full h-px bg-black/10 mt-8" />
              </div>
            </motion.div>

            {/* Card 2 — dark */}
            <motion.div style={{ y: cardUpY }} className="md:mt-24">
              <div
                className="ln-reveal group cursor-pointer rounded-3xl p-8 md:p-12 flex flex-col justify-between shadow-2xl transition-all duration-500 border border-white/10 hover:border-[#e94d7a]/50"
                style={{ background: '#111111', aspectRatio: '4/5', transitionDelay: '150ms' }}
                onClick={() => navigate('/signup')}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">✨</div>
                  <span className="text-white/50 font-medium text-sm border border-white/10 px-3 py-1 rounded-full">02</span>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl text-white mb-4 leading-none tracking-tight ln-serif">
                    Ready for<br />Forever
                  </h3>
                  <p className="text-gray-400 text-lg leading-snug">
                    You have lived. Now let us find the one who makes every chapter worth writing.
                  </p>
                </div>
                <div className="w-full h-px bg-white/10 mt-8" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* dot grid bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.07] pointer-events-none ln-dot-bg" />
      </section>

      {/* ══ STORIES ══════════════════════════════════════════════════ */}
      <section id="stories" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center ln-reveal mb-20">
            <h2
              className="text-3xl md:text-5xl lg:text-6xl leading-tight mb-6 ln-serif"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Real connections.<br /><span className="italic">Real stories.</span>
            </h2>
            <p className="text-xl text-gray-500 font-light">
              Thousands of couples found their forever on LoveNest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q: 'I never believed in online dating until LoveNest. We got married last spring.',  n: 'Priya & Rohan',  s: 'Together since 2024' },
              { q: 'The AI matchmaking truly understood what I was looking for. Life changing.',      n: 'Ananya & Dev',   s: 'Together since 2025' },
              { q: 'From first message to forever. LoveNest made it feel natural and real.',         n: 'Sara & Mikhail', s: 'Together since 2024' },
            ].map((t, i) => (
              <div
                key={t.n}
                className="ln-reveal rounded-2xl p-6 border border-white/[0.07] transition-all duration-300 hover:border-[#e94d7a]/30"
                style={{ background: '#111111', transitionDelay: `${i * 100}ms` }}
              >
                <p className="text-white/65 text-base leading-relaxed mb-6 italic">"{t.q}"</p>
                <div>
                  <p className="text-white font-medium text-sm">{t.n}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{t.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="py-20 border-t border-white/[0.05] bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <h2
              className="leading-[0.8] tracking-tighter font-bold select-none pointer-events-none ln-serif"
              style={{ fontSize: 'clamp(3rem,10vw,8rem)', color: 'rgba(255,255,255,0.05)' }}
            >
              LOVENEST.
            </h2>
            <div className="flex flex-col gap-8 text-right">
              <div className="flex flex-col gap-3 text-gray-400 text-sm">
                <span className="text-gray-600 text-xs tracking-widest uppercase mb-1">Platform</span>
                <button onClick={() => navigate('/feed')}    className="hover:text-white transition-colors text-right">Discover</button>
                <button onClick={() => navigate('/premium')} className="hover:text-white transition-colors text-right">Premium</button>
                <button onClick={() => navigate('/ai-chat')} className="hover:text-white transition-colors text-right">AI Assistant</button>
              </div>
              <p className="text-sm text-gray-600">© 2026 LoveNest. Where hearts find home.</p>
            </div>
          </div>

          <div className="mt-20 text-center">
            <button
              onClick={() => navigate('/signup')}
              className="group relative inline-flex items-center gap-3 border border-white/15 bg-white/[0.04] backdrop-blur-sm px-8 py-4 rounded-full text-sm uppercase tracking-widest transition-all duration-300 hover:border-[#e94d7a]/40 hover:bg-white/[0.08]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              <span>Begin Your Story</span>
              <span className="text-lg">💞</span>
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                style={{ background: '#e94d7a' }}
              />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
