import React, { useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';
import { motion } from 'framer-motion';
import { Heart, Users, MessageCircle, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Connections = () => {
    const connections = useSelector((store) => store.connection);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchConnections = async () => {
        try {
            const res = await axios.get(`${BaseUrl}/user/connections`, { withCredentials: true });
            dispatch(addConnections(res.data.data));
        } catch (error) {
            console.error("Error fetching connections:", error);
        }
    };

    useEffect(() => { fetchConnections(); }, []);

    return (
        <div className="min-h-screen pb-32">
            {/* Hero banner */}
            <div className="relative overflow-hidden py-10 px-4 mb-8"
                style={{ background: 'linear-gradient(135deg, hsl(var(--p)/0.12) 0%, hsl(var(--b2)) 50%, rgba(236,72,153,0.08) 100%)' }}>
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Heart size={20} className="text-primary fill-primary/60" />
                        <h1 className="text-3xl font-bold">My Connections</h1>
                        <Heart size={20} className="text-primary fill-primary/60" />
                    </div>
                    <p className="text-base-content/50 text-sm">
                        People you've matched with
                        {connections?.length > 0 && (
                            <span className="ml-2 badge badge-primary badge-sm">{connections.length} match{connections.length !== 1 ? 'es' : ''}</span>
                        )}
                    </p>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, hsl(var(--p)), transparent)' }} />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4">
                {!connections || connections.length === 0 ? (
                    <div className="flex flex-col items-center gap-5 py-20 text-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--p)/0.1), rgba(236,72,153,0.1))' }}>
                            <Users size={40} className="text-base-content/20" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-base-content/50 mb-1">No connections yet</h2>
                            <p className="text-base-content/30 text-sm">Start swiping to find your matches!</p>
                        </div>
                        <Link to="/feed" className="btn btn-primary btn-sm px-6 shadow-md shadow-primary/20">
                            <Sparkles size={14} /> Find Matches
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
                                className="group flex items-center gap-4 p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-default"
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img
                                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=80&background=random&color=fff&bold=true`}
                                        alt={user.firstName}
                                        className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=80&background=ec4899&color=fff&bold=true`; }}
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100 shadow-sm" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-base truncate">{user.firstName} {user.lastName}</h2>
                                    <p className="text-sm text-base-content/50 truncate mt-0.5">{user.About || 'No bio yet.'}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {user.age && user.gender && (
                                            <span className="text-xs text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
                                                {user.age} • {user.gender}
                                            </span>
                                        )}
                                        {user.Skills?.slice(0, 2).map((s, i) => (
                                            <span key={i} className="text-xs badge badge-outline badge-primary py-0">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat button */}
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => navigate(`/chat/${user._id}`)}
                                    className="btn btn-sm rounded-xl gap-1.5 border-0 text-white shadow-md shadow-primary/20 transition-all"
                                    style={{ background: 'linear-gradient(135deg, hsl(var(--p)) 0%, #ec4899 100%)' }}
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

