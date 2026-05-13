import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "md", showTagline = false, linked = true }) => {
    const cfg = {
        sm: { svgSize: 38, name: "1.1rem", tag: "0.55rem", gap: "0.5rem" },
        md: { svgSize: 54, name: "1.35rem", tag: "0.65rem", gap: "0.65rem" },
        lg: { svgSize: 72, name: "1.75rem", tag: "0.75rem", gap: "0.75rem" },
    }[size] || { svgSize: 54, name: "1.35rem", tag: "0.65rem", gap: "0.65rem" };

    const inner = (
        <div
            className="flex items-center"
            style={{ gap: cfg.gap, cursor: linked ? "pointer" : "default" }}
        >
            {/* SVG House + Heart Logo */}
            <svg
                width={cfg.svgSize}
                height={cfg.svgSize}
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
            >
                <defs>
                    {/* Main house gradient */}
                    <linearGradient id={`houseG-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9b3fbf" />
                        <stop offset="50%" stopColor="#b05090" />
                        <stop offset="100%" stopColor="#c4789a" />
                    </linearGradient>
                    {/* Lighter face for 3D depth */}
                    <linearGradient id={`houseLight-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b870c8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#e0a0bc" stopOpacity="0" />
                    </linearGradient>
                    {/* Roof gradient */}
                    <linearGradient id={`roofG-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d090c0" />
                        <stop offset="100%" stopColor="#8a3fa0" />
                    </linearGradient>
                    {/* Heart glow */}
                    <radialGradient id={`heartG-${size}`} cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ffd0e8" stopOpacity="0.85" />
                    </radialGradient>
                    {/* Drop shadow filter */}
                    <filter id={`shadow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#5a1060" floodOpacity="0.7" />
                    </filter>
                    {/* Glow filter for heart */}
                    <filter id={`glow-${size}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* House body — main fill */}
                <path
                    d="M40 92 L100 42 L160 92 V162 H40 Z"
                    fill={`url(#houseG-${size})`}
                    stroke="#4a1065"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    filter={`url(#shadow-${size})`}
                />

                {/* Left face lighter sheen for 3D */}
                <path
                    d="M40 92 L100 42 L100 162 H40 Z"
                    fill={`url(#houseLight-${size})`}
                />

                {/* Door */}
                <rect
                    x="80" y="128" width="40" height="34"
                    rx="20" ry="20"
                    fill="#3a0850"
                    opacity="0.45"
                />

                {/* Roof / peak lines */}
                <path
                    d="M22 97 L100 24 L178 97"
                    fill="none"
                    stroke={`url(#roofG-${size})`}
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Inner softer roof line */}
                <path
                    d="M30 96 L100 32 L170 96"
                    fill="none"
                    stroke="rgba(220,160,200,0.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Heart */}
                <path
                    d="M100 128
                       C100 108,130 97,130 121
                       C130 145,100 162,100 162
                       C100 162,70 145,70 121
                       C70 97,100 108,100 128 Z"
                    fill={`url(#heartG-${size})`}
                    filter={`url(#glow-${size})`}
                />
            </svg>

            {/* Text */}
            <div style={{ lineHeight: 1 }}>
                <div
                    style={{
                        fontSize: cfg.name,
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                        background: "linear-gradient(135deg, #d4a0f0 0%, #f0b8d4 50%, #c4789a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    LoveNest
                </div>
                {showTagline && (
                    <div
                        style={{
                            fontSize: cfg.tag,
                            color: "rgba(220,180,200,0.5)",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            marginTop: "2px",
                        }}
                    >
                        Where hearts find home
                    </div>
                )}
            </div>
        </div>
    );

    if (!linked) return inner;
    return (
        <Link to="/" className="flex-shrink-0 transition-all duration-200 hover:brightness-110">
            {inner}
        </Link>
    );
};

export default Logo;
