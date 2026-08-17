import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from 'react-icons/fa6';

const defaultColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Smart AI Matching', href: '#features' },
      { label: 'Live Video Dates', href: '#features' },
      { label: 'Face Biometric Security', href: '#features' },
      { label: 'Incognito Stealth Mode', href: '#features' },
    ],
  },
  {
    title: 'Experience',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Romance Membership Plans', href: '#pricing' },
      { label: 'Real Love Stories', href: '#stories' },
      { label: 'Safety Index', href: '#how-it-works' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About LoveNest', href: '/signup' },
      { label: 'Dating Insights & Blog', href: '#' },
      { label: 'Trust & Safety', href: '#' },
      { label: 'Support & Concierge', href: '#' },
    ],
  },
];

const defaultLegalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Safety Guidelines', href: '#' },
];

const defaultSocials = [
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'Twitter', href: '#', icon: 'twitter' },
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
];

const backgroundUrl = 'https://assets.watermelon.sh/footer-16-bg.avif';

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const wordmarkVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 1.1, bounce: 0 },
  },
};

const riseVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.65, bounce: 0 },
  },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 7 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', duration: 0.42, bounce: 0 },
  },
};

const socialIcons = {
  facebook: FaFacebookF,
  twitter: FaXTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
};

export function Footer16({
  brandName = 'LOVENEST',
  tagline = 'Find your forever story with AI compatibility,\nHD video dates, and real verified chemistry.\nYour modern path to meaningful love.',
  columns = defaultColumns,
  legalLinks = defaultLegalLinks,
  socials = defaultSocials,
  copyright = '© 2026 LoveNest Inc. All rights reserved.',
  backgroundImage = backgroundUrl,
  compact = false,
}) {
  if (compact) {
    return (
      <footer className="relative w-full overflow-hidden bg-[#09090b] backdrop-blur-md font-sans text-zinc-100 antialiased z-20 py-6 px-6 sm:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>
              <Heart size={15} className="fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight ln-serif">
              Love<span className="ln-glow-text-rose italic font-normal">Nest</span>
            </span>
            <span className="text-zinc-600 text-xs hidden sm:inline">•</span>
            <span className="text-xs font-light text-zinc-400">{copyright}</span>
          </div>

          {/* Center Legal Links */}
          <ul className="flex flex-wrap items-center gap-x-5 text-xs text-zinc-400 font-light">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-rose-300 transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Social Icons */}
          <ul className="flex items-center gap-2">
            {socials.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-white transition-all text-xs"
                  >
                    <Icon size={13} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative w-full overflow-hidden bg-[#09090b] font-sans text-zinc-100 antialiased z-20">
      {/* Soft Ambient Rose & Violet Spotlight Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] pointer-events-none select-none opacity-45 blur-[120px] z-0"
        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.25) 0%, rgba(168,85,247,0.15) 50%, transparent 75%)' }}
      />

      {/* 🏔️ Romantic Mountain Landscape Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-55 pointer-events-none transition-opacity duration-300"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      {/* Light Ambient Overlay */}
      <div
        className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.5)_0%,rgba(9,9,11,0.2)_35%,rgba(9,9,11,0.6)_75%,rgba(7,7,9,0.95)_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* 🌌 Starry Night Sky Field Above Mountains */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Twinkling Star Field Dots */}
        {[
          { top: '8%',  left: '6%',   size: 3, delay: '0s',   dur: '2.5s', color: 'bg-white' },
          { top: '14%', left: '15%',  size: 2, delay: '0.8s', dur: '3.2s', color: 'bg-rose-200' },
          { top: '6%',  left: '28%',  size: 4, delay: '1.2s', dur: '4s',   color: 'bg-purple-200' },
          { top: '22%', left: '34%',  size: 2, delay: '0.4s', dur: '2.8s', color: 'bg-white' },
          { top: '10%', left: '48%',  size: 3, delay: '1.8s', dur: '3.5s', color: 'bg-rose-300' },
          { top: '18%', left: '58%',  size: 2, delay: '2.1s', dur: '4.2s', color: 'bg-white' },
          { top: '8%',  left: '68%',  size: 4, delay: '0.3s', dur: '3.8s', color: 'bg-purple-200' },
          { top: '25%', left: '76%',  size: 2, delay: '1.5s', dur: '2.9s', color: 'bg-rose-200' },
          { top: '12%', left: '86%',  size: 3, delay: '0.6s', dur: '3.6s', color: 'bg-white' },
          { top: '20%', left: '94%',  size: 2, delay: '2.4s', dur: '4.5s', color: 'bg-purple-300' },
          { top: '32%', left: '10%',  size: 2, delay: '1.1s', dur: '3.1s', color: 'bg-white' },
          { top: '28%', left: '22%',  size: 3, delay: '2.6s', dur: '3.9s', color: 'bg-rose-200' },
          { top: '36%', left: '40%',  size: 2, delay: '0.2s', dur: '2.7s', color: 'bg-white' },
          { top: '30%', left: '64%',  size: 3, delay: '1.9s', dur: '4.1s', color: 'bg-purple-200' },
          { top: '34%', left: '88%',  size: 2, delay: '0.9s', dur: '3.3s', color: 'bg-rose-300' },
        ].map((star, idx) => (
          <div
            key={idx}
            className={`absolute rounded-full ${star.color} shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse`}
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.dur,
              opacity: 0.75,
            }}
          />
        ))}

        {/* 4-Point Glowing Constellation Star SVGs */}
        {[
          { top: '10%', left: '20%', size: 14, color: '#f43f5e', delay: '0s' },
          { top: '16%', left: '72%', size: 16, color: '#c084fc', delay: '1.5s' },
          { top: '24%', left: '42%', size: 12, color: '#fb7185', delay: '0.8s' },
          { top: '12%', left: '88%', size: 15, color: '#e879f9', delay: '2.2s' },
        ].map((star, idx) => (
          <svg
            key={`svg-star-${idx}`}
            className="absolute animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: '3.5s',
              filter: `drop-shadow(0 0 8px ${star.color})`,
            }}
            viewBox="0 0 24 24"
            fill={star.color}
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" opacity="0.85" />
          </svg>
        ))}
      </div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
        className="relative mx-auto flex flex-col justify-end pt-2 sm:pt-4 pb-2"
      >
        {/* 💎 Subtle, Elegant & Transparent LOVENEST Watermark Typography */}
        <motion.div
          variants={wordmarkVariants}
          className="pointer-events-none relative left-1/2 flex w-[110vw] -translate-x-1/2 justify-center overflow-visible -mb-6 sm:-mb-10 lg:-mb-12 z-10"
          aria-hidden="true"
        >
          <svg
            className="h-auto w-full select-none opacity-28 overflow-visible"
            style={{ 
              filter: 'drop-shadow(0 0 25px rgba(244,63,94,0.25))',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            }}
            viewBox={`0 0 ${Math.max(brandName.length * 90, 400)} 150`}
            preserveAspectRatio="xMidYMid meet"
            aria-label={brandName}
          >
            <defs>
              <linearGradient id="brandGrad16" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="68%"
              dominantBaseline="alphabetic"
              textAnchor="middle"
              textLength="85%"
              lengthAdjust="spacing"
              className="font-sans font-extrabold tracking-tight"
              fill="url(#brandGrad16)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.4"
              fontSize="100"
            >
              {brandName}
            </text>
          </svg>
        </motion.div>

        {/* Footer Minimal Bottom Bar (Compact, zero extra space) */}
        <div className="relative z-10 px-6 pt-0 max-w-7xl mx-auto w-full">
          <motion.div
            variants={riseVariants}
            className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-t border-white/10 pt-3.5 pb-2"
          >
            {/* Left Brand Logo & Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>
                <Heart size={14} className="fill-white" />
              </div>
              <span className="text-base font-bold tracking-tight ln-serif">
                Love<span className="ln-glow-text-rose italic font-normal">Nest</span>
              </span>
              <span className="text-zinc-600 text-xs font-light">•</span>
              <p className="text-xs font-light text-zinc-400">
                {copyright}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Legal Links */}
              <motion.ul
                variants={listVariants}
                className="flex flex-wrap items-center gap-x-5 gap-y-1"
              >
                {legalLinks.map((link) => (
                  <motion.li variants={linkVariants} key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center text-xs font-light text-zinc-400 transition-colors duration-200 ease-out hover:text-rose-300"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Social Icons */}
              <motion.ul
                variants={listVariants}
                className="flex items-center gap-1.5"
                aria-label="Social links"
              >
                {socials.map((social) => {
                  const Icon = socialIcons[social.icon];

                  return (
                    <motion.li variants={linkVariants} key={social.label}>
                      <a
                        href={social.href}
                        aria-label={social.label}
                        className="group relative flex size-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-400 transition-all duration-200 ease-out hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-white active:scale-[0.96]"
                      >
                        <Icon className="size-3.5 transition-transform duration-200 ease-out group-hover:scale-110" />
                      </a>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer16;
