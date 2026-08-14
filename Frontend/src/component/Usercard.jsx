import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Sparkles, Star } from 'lucide-react';

/* ─── Swipe threshold (px) before action fires ─── */
const SWIPE_THRESHOLD = 90;

const Usercard = ({ user, onIgnore, onInterested }) => {
    const { firstName, lastName, photoUrl, age, gender, About, Skills } = user || {};

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        (firstName || 'U') + ' ' + (lastName || '')
    )}&size=400&background=2b1040&color=c4789a&bold=true&length=2`;

    /* ─── Motion values for drag ─── */
    const x = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });

    // Card rotation based on horizontal drag
    const rotate = useTransform(springX, [-200, 200], [-18, 18]);
    // Like/Nope indicator opacity
    const likeOpacity  = useTransform(x, [10, SWIPE_THRESHOLD], [0, 1]);
    const nopeOpacity  = useTransform(x, [-SWIPE_THRESHOLD, -10], [1, 0]);

    const [isDragging, setIsDragging] = useState(false);
    const [btnAnim, setBtnAnim] = useState(null); // 'like' | 'nope' | null

    const handleDragEnd = (_, info) => {
        setIsDragging(false);
        if (info.offset.x > SWIPE_THRESHOLD) {
            triggerAction('like');
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
            triggerAction('nope');
        } else {
            x.set(0);
        }
    };

    const triggerAction = (type) => {
        setBtnAnim(type);
        setTimeout(() => {
            setBtnAnim(null);
            if (type === 'like') onInterested();
            else onIgnore();
        }, 280);
    };

    if (!user) return null;

    return (
        <div className="relative flex flex-col items-center" style={{ perspective: '1200px' }}>

            {/* ── Card ── */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                style={{ x: springX, rotate }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: btnAnim === 'like' ? 280 : -280, rotate: btnAnim === 'like' ? 20 : -20 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="relative cursor-grab active:cursor-grabbing select-none"
                style={{
                    width: 'min(88vw, 360px)',
                    height: 'min(75vh, 520px)',
                    borderRadius: '28px',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(196,120,154,0.15)',
                    overflow: 'hidden',
                    background: '#160826',
                    x: springX, rotate,
                }}
            >
                {/* ── Full-bleed photo ── */}
                <img
                    src={photoUrl || fallbackAvatar}
                    alt={firstName}
                    onError={e => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
                    draggable={false}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        pointerEvents: 'none',
                    }}
                />

                {/* ── Gradient overlay (bottom-up) ── */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(12,4,22,0.97) 0%, rgba(12,4,22,0.6) 38%, transparent 65%)',
                    pointerEvents: 'none',
                }} />

                {/* ── LIKE stamp ── */}
                <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-10 left-6 pointer-events-none"
                >
                    <div style={{
                        border: '3px solid #4ade80',
                        borderRadius: '10px',
                        padding: '4px 14px',
                        transform: 'rotate(-18deg)',
                        color: '#4ade80',
                        fontSize: 28,
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        textShadow: '0 0 12px rgba(74,222,128,0.6)',
                    }}>LIKE</div>
                </motion.div>

                {/* ── NOPE stamp ── */}
                <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute top-10 right-6 pointer-events-none"
                >
                    <div style={{
                        border: '3px solid #f87171',
                        borderRadius: '10px',
                        padding: '4px 14px',
                        transform: 'rotate(18deg)',
                        color: '#f87171',
                        fontSize: 28,
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        textShadow: '0 0 12px rgba(248,113,113,0.6)',
                    }}>NOPE</div>
                </motion.div>

                {/* ── Profile info (bottom) ── */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '20px 22px 24px',
                    pointerEvents: 'none',
                }}>

                    {/* Name + age */}
                    <div className="flex items-end gap-3 mb-1">
                        <h2 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(22px, 5vw, 28px)',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.15,
                            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                        }}>
                            {firstName} {lastName}
                        </h2>
                        {age && (
                            <span style={{
                                fontSize: 20,
                                fontWeight: 400,
                                color: 'rgba(255,255,255,0.7)',
                                paddingBottom: 2,
                            }}>{age}</span>
                        )}
                    </div>

                    {/* Gender / location pill */}
                    {gender && (
                        <div className="flex items-center gap-1.5 mb-3">
                            <MapPin size={12} style={{ color: '#c4789a' }} />
                            <span style={{ fontSize: 12, color: 'rgba(220,180,200,0.7)', textTransform: 'capitalize' }}>
                                {gender}
                            </span>
                        </div>
                    )}

                    {/* Bio */}
                    {About && (
                        <p style={{
                            fontSize: 13,
                            color: 'rgba(230,200,215,0.75)',
                            lineHeight: 1.5,
                            marginBottom: 10,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                            {About}
                        </p>
                    )}

                    {/* Skills */}
                    {Skills && Skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1">
                            {Skills.slice(0, 4).map((skill, i) => (
                                <span key={i} style={{
                                    background: 'rgba(138,63,160,0.35)',
                                    border: '1px solid rgba(196,120,154,0.35)',
                                    color: 'rgba(240,214,232,0.9)',
                                    borderRadius: 20,
                                    padding: '3px 10px',
                                    fontSize: 11,
                                    fontWeight: 500,
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Drag hint (only when NOT dragging) ── */}
                {!isDragging && (
                    <div style={{
                        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: 6, alignItems: 'center',
                        background: 'rgba(0,0,0,0.38)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 20,
                        padding: '4px 12px',
                        pointerEvents: 'none',
                    }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
                            ← swipe →
                        </span>
                    </div>
                )}
            </motion.div>

            {/* ── Action buttons ── */}
            <div className="flex items-center gap-6 mt-6">

                {/* Pass */}
                <motion.button
                    onClick={() => triggerAction('nope')}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    animate={btnAnim === 'nope' ? { scale: [1, 1.3, 1] } : {}}
                    style={{
                        width: 60, height: 60,
                        borderRadius: '50%',
                        border: '2px solid rgba(248,113,113,0.5)',
                        background: 'rgba(248,113,113,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(248,113,113,0.15)',
                        transition: 'all 0.2s',
                    }}
                >
                    <X size={26} style={{ color: '#f87171' }} />
                </motion.button>

                {/* Super Like */}
                <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                        width: 46, height: 46,
                        borderRadius: '50%',
                        border: '2px solid rgba(251,191,36,0.4)',
                        background: 'rgba(251,191,36,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(251,191,36,0.1)',
                    }}
                >
                    <Star size={20} style={{ color: '#fbbf24' }} />
                </motion.button>

                {/* Like */}
                <motion.button
                    onClick={() => triggerAction('like')}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    animate={btnAnim === 'like' ? { scale: [1, 1.3, 1] } : {}}
                    style={{
                        width: 60, height: 60,
                        borderRadius: '50%',
                        border: '2px solid rgba(196,120,154,0.5)',
                        background: 'linear-gradient(135deg, rgba(138,63,160,0.35), rgba(196,120,154,0.25))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 24px rgba(196,120,154,0.25)',
                        transition: 'all 0.2s',
                    }}
                >
                    <Heart size={26} style={{ color: '#c4789a' }} fill="#c4789a" />
                </motion.button>
            </div>
        </div>
    );
};

export default Usercard;
