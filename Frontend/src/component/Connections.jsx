import React, { useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';
import { motion } from 'framer-motion';
import { Heart, Users, MessageCircle, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from './Loader';

const Connections = () => {
    const connections = useSelector((store) => store.connection);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);

    const fetchConnections = async () => {
        try {
            const res = await axios.get(`${BaseUrl}/user/connections`, { withCredentials: true });
            dispatch(addConnections(res.data.data));
        } catch (error) {
            console.error("Error fetching connections:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConnections(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader label="Loading connections…" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Hero banner */}
            <div className="relative overflow-hidden py-10 px-4 mb-8"
                style={{ background: 'linear-gradient(135deg, rgba(138,63,160,0.12) 0%, rgba(28,10,42,0.6) 50%, rgba(196,120,154,0.08) 100%)', borderBottom: '1px solid rgba(196,120,154,0.08)' }}>
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Heart size={20} style={{ color: '#c4789a' }} className="fill-current opacity-70" />
                        <h1 className="text-3xl font-bold text-white">My Connections</h1>
                        <Heart size={20} style={{ color: '#c4789a' }} className="fill-current opacity-70" />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(220,180,200,0.45)' }}>
                        People you've matched with
                        {connections?.length > 0 && (
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(138,63,160,0.3)', color: '#e0b8cc', border: '1px solid rgba(196,120,154,0.25)' }}>
                                {connections.length} match{connections.length !== 1 ? 'es' : ''}
                            </span>
                        )}
                    </p>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #8a3fa0, transparent)' }} />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #c4789a, transparent)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4">
                {!connections || connections.length === 0 ? (
                    <div className="flex flex-col items-center gap-5 py-20 text-center">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full"
                                style={{ background: 'linear-gradient(135deg, rgba(138,63,160,0.12), rgba(196,120,154,0.08))', border: '1px solid rgba(196,120,154,0.12)' }} />
                            <Users size={38} style={{ color: 'rgba(196,120,154,0.35)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>No connections yet</h2>
                            <p className="text-sm" style={{ color: 'rgba(220,180,200,0.35)' }}>Start swiping to find your matches!</p>
                        </div>
                        <Link to="/feed"
                            className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 6px 20px rgba(138,63,160,0.3)' }}>
                            <span className="flex items-center gap-1.5"><Sparkles size={13} /> Find Matches</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {connections.map((user, index) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.25 }}
                                className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-default"
                            style={{ background: 'rgba(28,10,42,0.75)', border: '1px solid rgba(196,120,154,0.12)', backdropFilter: 'blur(12px)' }}
                            onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(196,120,154,0.28)'}
                            onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(196,120,154,0.12)'}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img
                                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=80&background=random&color=fff&bold=true`}
                                        alt={user.firstName}
                                        className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=80&background=ec4899&color=fff&bold=true`; }}
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 shadow-sm" style={{ background: '#22c55e', borderColor: '#1a0824' }} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-base truncate text-white">{user.firstName} {user.lastName}</h2>
                                    <p className="text-sm truncate mt-0.5" style={{ color: 'rgba(220,180,200,0.5)' }}>{user.About || 'No bio yet.'}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {user.age && user.gender && (
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(220,180,200,0.5)' }}>
                                                {user.age} • {user.gender}
                                            </span>
                                        )}
                                        {user.Skills?.slice(0, 2).map((s, i) => (
                                            <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(138,63,160,0.2)', color: '#d4a0be', border: '1px solid rgba(138,63,160,0.3)' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat button */}
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => navigate(`/chat/${user._id}`)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                                    style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 4px 14px rgba(138,63,160,0.3)' }}
                                    title="Chat"
                                >
                                    <MessageCircle size={15} />
                                    <span className="hidden sm:inline">Chat</span>
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;

