import React from 'react';
import { Heart, Globe, Youtube, Linkedin, Mail, Shield, FileText, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer
            style={{
                background: 'linear-gradient(180deg, #1a0824 0%, #120618 100%)',
                borderTop: '1px solid rgba(196,120,154,0.16)',
            }}
        >
            {/* Top glow line */}
            <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,120,154,0.4) 30%, rgba(138,63,160,0.5) 50%, rgba(196,120,154,0.4) 70%, transparent)' }} />

            <div className="max-w-7xl mx-auto px-5 pt-12 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-10 mb-10">

                    {/* Brand — wider column */}
                    <div className="sm:col-span-5 flex flex-col gap-4">
                        <Link to="/" className="w-fit group">
                            <img
                                src="/logo.png"
                                alt="LoveNest"
                                className="h-12 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                                style={{ filter: 'drop-shadow(0 0 14px rgba(196,120,154,0.3))' }}
                            />
                        </Link>
                        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(220,180,200,0.45)' }}>
                            Where hearts find home. Connect, chat, and build meaningful relationships with people who share your passions.
                        </p>
                        {/* Social icons */}
                        <div className="flex gap-2.5 mt-1">
                            {[
                                { Icon: Globe, href: '#', label: 'Website' },
                                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                                { Icon: Youtube, href: '#', label: 'YouTube' },
                            ].map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    style={{
                                        background: 'rgba(196,120,154,0.08)',
                                        border: '1px solid rgba(196,120,154,0.14)',
                                        color: 'rgba(220,180,200,0.45)',
                                    }}
                                >
                                    <Icon size={13} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigate */}
                    <div className="sm:col-span-3">
                        <p
                            className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-4"
                            style={{ color: 'rgba(196,120,154,0.55)' }}
                        >
                            Navigate
                        </p>
                        <ul className="space-y-2.5">
                            {[
                                { to: '/feed', label: 'Discover' },
                                { to: '/connections', label: 'Connections' },
                                { to: '/requests', label: 'Requests' },
                                { to: '/premium', label: 'Premium ✦' },
                                { to: '/profile', label: 'My Profile' },
                            ].map(({ to, label }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        className="text-xs transition-all duration-150 hover:translate-x-0.5 inline-flex items-center gap-1"
                                        style={{ color: 'rgba(220,180,200,0.42)' }}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="sm:col-span-4">
                        <p
                            className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-4"
                            style={{ color: 'rgba(196,120,154,0.55)' }}
                        >
                            Support & Legal
                        </p>
                        <ul className="space-y-2.5">
                            {[
                                { Icon: Shield, label: 'Privacy Policy' },
                                { Icon: FileText, label: 'Terms of Service' },
                                { Icon: Phone, label: 'Help & Support' },
                                { Icon: Mail, label: 'Contact Us' },
                            ].map(({ Icon, label }) => (
                                <li key={label}>
                                    <a
                                        href="#"
                                        className="flex items-center gap-2 text-xs transition-colors duration-150"
                                        style={{ color: 'rgba(220,180,200,0.42)' }}
                                    >
                                        <Icon size={11} />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,120,154,0.2) 50%, transparent)' }} />

                {/* Bottom bar */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px]" style={{ color: 'rgba(220,180,200,0.28)' }}>
                        &copy; {new Date().getFullYear()} LoveNest. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(220,180,200,0.28)' }}>
                        Made with
                        <Heart size={10} className="fill-pink-500/70 text-pink-500/70 animate-pulse" />
                        by the LoveNest team
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
