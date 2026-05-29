import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "md", showTagline = false, linked = true }) => {
    const cfg = {
        sm: { w: 34,  h: 34,  name: "1.05rem", tag: "0.52rem", gap: "0.45rem" },
        md: { w: 46,  h: 46,  name: "1.35rem", tag: "0.62rem", gap: "0.6rem"  },
        lg: { w: 64,  h: 64,  name: "1.75rem", tag: "0.72rem", gap: "0.75rem" },
    }[size] || { w: 46, h: 46, name: "1.35rem", tag: "0.62rem", gap: "0.6rem" };

    /* Unique IDs per size so multiple Logo instances don't clash */
    const id = size;

    const inner = (
        <div style={{ display: "flex", alignItems: "center", gap: cfg.gap, cursor: linked ? "pointer" : "default" }}>

            {/* ── SVG Mark ── */}
            <svg
                width={cfg.w}
                height={cfg.h}
                viewBox="0 0 80 82"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0, overflow: "visible" }}
            >
                <defs>
                    {/* Heart gradient */}
                    <linearGradient id={`hg-${id}`} x1="10%" y1="0%" x2="90%" y2="110%">
                        <stop offset="0%"   stopColor="#ff6b9d" />
                        <stop offset="55%"  stopColor="#e94d7a" />
                        <stop offset="100%" stopColor="#8a3fa0" />
                    </linearGradient>

                    {/* Nest arc gradient */}
                    <linearGradient id={`ng-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#8a3fa0" stopOpacity="0" />
                        <stop offset="35%"  stopColor="#c4789a" stopOpacity="0.85" />
                        <stop offset="65%"  stopColor="#c4789a" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#8a3fa0" stopOpacity="0" />
                    </linearGradient>

                    {/* Inner heart highlight */}
                    <radialGradient id={`hh-${id}`} cx="42%" cy="32%" r="55%">
                        <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>

                    {/* Ambient glow behind mark */}
                    <radialGradient id={`glow-${id}`} cx="50%" cy="52%" r="52%">
                        <stop offset="0%"   stopColor="#e94d7a" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#e94d7a" stopOpacity="0"   />
                    </radialGradient>

                    {/* Soft glow filter on heart */}
                    <filter id={`blur-${id}`} x="-35%" y="-35%" width="170%" height="170%">
                        <feGaussianBlur stdDeviation="3.5" result="b" />
                        <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Ambient glow */}
                <ellipse cx="40" cy="44" rx="34" ry="32" fill={`url(#glow-${id})`} />

                {/* ── Heart ── */}
                <path
                    d="M40 54
                       C40 54 16 40 16 26
                       C16 17.5 23.5 12 31 12
                       C35.5 12 38.5 14.5 40 17
                       C41.5 14.5 44.5 12 49 12
                       C56.5 12 64 17.5 64 26
                       C64 40 40 54 40 54Z"
                    fill={`url(#hg-${id})`}
                    filter={`url(#blur-${id})`}
                />
                {/* Inner highlight on heart */}
                <path
                    d="M40 54
                       C40 54 16 40 16 26
                       C16 17.5 23.5 12 31 12
                       C35.5 12 38.5 14.5 40 17
                       C41.5 14.5 44.5 12 49 12
                       C56.5 12 64 17.5 64 26
                       C64 40 40 54 40 54Z"
                    fill={`url(#hh-${id})`}
                />

                {/* ── Nest arcs (below heart) ── */}
                <path
                    d="M20 62 Q40 76 60 62"
                    stroke={`url(#ng-${id})`} strokeWidth="2.8" strokeLinecap="round"
                />
                <path
                    d="M26 69 Q40 79 54 69"
                    stroke={`url(#ng-${id})`} strokeWidth="2.2" strokeLinecap="round"
                    opacity="0.65"
                />
            </svg>

            {/* ── Wordmark ── */}
            <div style={{ lineHeight: 1, userSelect: "none" }}>
                <div style={{
                    fontSize: cfg.name,
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    letterSpacing: "-0.015em",
                    background: "linear-gradient(135deg, #ffe0e0 0%, #ffc8d8 45%, #e94d7a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                    LoveNest.
                </div>
                {showTagline && (
                    <div style={{
                        fontSize: cfg.tag,
                        color: "rgba(255,200,216,0.42)",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        fontWeight: 400,
                        marginTop: "3px",
                        fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                        Where hearts find home
                    </div>
                )}
            </div>
        </div>
    );

    if (!linked) return inner;
    return (
        <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}
            className="transition-all duration-200 hover:brightness-110 hover:opacity-90">
            {inner}
        </Link>
    );
};

export default Logo;
