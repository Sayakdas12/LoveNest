import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { clearUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Rss, Users, Bell, Sparkles } from 'lucide-react';

const NAV_LINKS = [
    { to: '/feed', icon: Rss, label: 'Feed' },
    { to: '/connections', icon: Users, label: 'Connections' },
    { to: '/requests', icon: Bell, label: 'Requests', badge: true },
    { to: '/premium', icon: Sparkles, label: 'Premium', highlight: true },
];

const NavBar = () => {
    const user = useSelector((state) => state.user);
    const [notifCount, setNotifCount] = useState(0);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchCount = async () => {
            try {
                const res = await axios.get(`${BaseUrl}/user/notifications/count`, { withCredentials: true });
                setNotifCount(res.data.count || 0);
            } catch (_) {}
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = async () => {
        try {
            await axios.post(BaseUrl + '/logout', {}, { withCredentials: true });
            dispatch(clearUser());
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className="sticky top-0 z-50 border-b"
            style={{
                background: 'linear-gradient(135deg, #1a0824 0%, #2b1040 60%, #1e0c2e 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderColor: 'rgba(196,120,154,0.18)',
                boxShadow: '0 4px 32px rgba(100,40,120,0.25), 0 1px 0 rgba(196,120,154,0.08)',
            }}
        >
            <div className="max-w-7xl mx-auto px-5 flex items-center h-[66px] gap-4">

                {/* Logo */}
                <Link to="/" className="flex-shrink-0 group">
                    <img
                        src="/logo.png"
                        alt="LoveNest"
                        className="h-10 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(196,120,154,0.35))' }}
                    />
                </Link>

                {/* Divider */}
                {user && (
                    <div
                        className="hidden md:block w-px h-7 mx-1 flex-shrink-0"
                        style={{ background: 'linear-gradient(180deg, transparent, rgba(196,120,154,0.35), transparent)' }}
                    />
                )}

                {/* Desktop Nav Links */}
                {user && (
                    <div className="hidden md:flex items-center gap-0.5 flex-1">
                        {NAV_LINKS.map(({ to, icon: Icon, label, badge, highlight }) => (
                            <Link
                                key={to}
                                to={to}
                                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group"
                                style={isActive(to) ? {
                                    background: 'linear-gradient(135deg, rgba(138,60,160,0.35), rgba(196,100,150,0.2))',
                                    color: '#e0b8cc',
                                    boxShadow: '0 0 18px rgba(138,60,160,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
                                } : { color: 'rgba(255,255,255,0.42)' }}
                            >
                                <Icon
                                    size={14}
                                    style={{ color: highlight && !isActive(to) ? 'rgba(251,191,36,0.65)' : 'inherit' }}
                                    className="transition-colors duration-200"
                                />
                                <span className="transition-colors duration-200" style={!isActive(to) ? {} : {}}>{label}</span>

                                {badge && notifCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold text-white flex items-center justify-center rounded-full px-1"
                                        style={{ background: 'linear-gradient(135deg, #be185d, #e11d48)' }}
                                    >
                                        {notifCount > 9 ? '9+' : notifCount}
                                    </span>
                                )}

                                {isActive(to) && (
                                    <span
                                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #8a3fa0, #c4789a)' }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div className="flex items-center gap-3 ml-auto">

                    {/* Mobile bell */}
                    {user && notifCount > 0 && (
                        <Link to="/requests" className="md:hidden relative p-1.5 rounded-lg" style={{ background: 'rgba(196,120,154,0.1)' }}>
                            <Bell size={18} style={{ color: 'rgba(255,255,255,0.55)' }} />
                            <span
                                className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] text-[9px] font-bold text-white flex items-center justify-center rounded-full"
                                style={{ background: '#e11d48' }}
                            >
                                {notifCount > 9 ? '9+' : notifCount}
                            </span>
                        </Link>
                    )}

                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="cursor-pointer group">
                                <div
                                    className="p-0.5 rounded-full transition-all duration-200 group-hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 0 12px rgba(138,63,160,0.4)' }}
                                >
                                    <img
                                        alt="Profile"
                                        src={user.photoUrl || "https://w7.pngwing.com/pngs/910/606/png-transparent-head-the-dummy-avatar-man-tie-jacket-user-thumbnail.png"}
                                        className="w-9 h-9 rounded-full object-cover block"
                                    />
                                </div>
                            </div>

                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content rounded-2xl z-50 mt-3 w-64 p-2 shadow-2xl"
                                style={{
                                    background: 'rgba(22,8,30,0.98)',
                                    backdropFilter: 'blur(24px)',
                                    border: '1px solid rgba(196,120,154,0.14)',
                                    boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,120,154,0.06)',
                                }}
                            >
                                {/* Profile header */}
                                <li className="px-3 py-3 pointer-events-none">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-0.5 rounded-full flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}
                                        >
                                            <img
                                                src={user.photoUrl || "https://w7.pngwing.com/pngs/910/606/png-transparent-head-the-dummy-avatar-man-tie-jacket-user-thumbnail.png"}
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-white/90 truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-[11px] truncate" style={{ color: '#c4789a' }}>{user.emailId}</p>
                                        </div>
                                    </div>
                                </li>
                                <div className="mx-2 my-1" style={{ height: 1, background: 'rgba(196,120,154,0.12)' }} />

                                {[
                                    { to: '/profile', Icon: User, label: 'My Profile' },
                                    { to: '/feed', Icon: Rss, label: 'Discover Feed' },
                                    { to: '/connections', Icon: Users, label: 'Connections', mobile: true },
                                    { to: '/requests', Icon: Bell, label: 'Requests', mobile: true, count: notifCount },
                                    { to: '/premium', Icon: Sparkles, label: 'Premium', mobile: true, gold: true },
                                ].map(({ to, Icon, label, mobile, count, gold }) => (
                                    <li key={to} className={mobile ? 'md:hidden' : ''}>
                                        <Link
                                            to={to}
                                            className="rounded-xl flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
                                            style={{ color: gold ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.58)' }}
                                        >
                                            <Icon size={14} />
                                            {label}
                                            {count > 0 && (
                                                <span
                                                    className="ml-auto text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                                                    style={{ background: '#e11d48' }}
                                                >{count}</span>
                                            )}
                                        </Link>
                                    </li>
                                ))}

                                <div className="mx-2 my-1" style={{ height: 1, background: 'rgba(196,120,154,0.12)' }} />
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150"
                                        style={{ color: 'rgba(248,113,113,0.75)' }}
                                    >
                                        <LogOut size={14} /> Sign out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-100"
                            style={{
                                background: 'linear-gradient(135deg, #8a3fa0, #c4789a)',
                                boxShadow: '0 4px 16px rgba(138,63,160,0.45)',
                            }}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
