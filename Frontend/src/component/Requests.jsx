import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserCheck, Heart, Sparkles } from 'lucide-react';
import Loader from './Loader';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${BaseUrl}/user/requests/received`, { withCredentials: true });
            setRequests(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleReview = async (requestId, status, name) => {
        try {
            await axios.post(
                `${BaseUrl}/request/review/${status}/${requestId}`,
                {},
                { withCredentials: true }
            );
            setRequests((prev) => prev.filter((r) => r._id !== requestId));
            if (status === "accepted") {
                toast.success(`You accepted ${name}'s request! 💕`);
            } else {
                toast(`Declined ${name}'s request`, { icon: '👋' });
            }
        } catch (err) {
            toast.error("Failed to update request");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader label="Loading requests…" />
        </div>
    );

    return (
        <div className="min-h-screen pb-32">
            {/* Hero banner */}
            <div className="relative overflow-hidden py-10 px-4 mb-8"
                style={{ background: 'linear-gradient(135deg, rgba(196,120,154,0.10) 0%, rgba(28,10,42,0.6) 50%, rgba(138,63,160,0.08) 100%)', borderBottom: '1px solid rgba(196,120,154,0.08)' }}>
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles size={18} style={{ color: '#c4789a' }} />
                        <h1 className="text-3xl font-bold text-white">Connection Requests</h1>
                        <Sparkles size={18} style={{ color: '#c4789a' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(220,180,200,0.45)' }}>
                        People who are interested in you
                        {requests.length > 0 && (
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(196,120,154,0.25)', color: '#f0c0d8', border: '1px solid rgba(196,120,154,0.3)' }}>
                                {requests.length} pending
                            </span>
                        )}
                    </p>
                </div>
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #c4789a, transparent)' }} />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #8a3fa0, transparent)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4">
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center gap-5 py-20 text-center">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full"
                                style={{ background: 'linear-gradient(135deg, rgba(196,120,154,0.12), rgba(138,63,160,0.08))', border: '1px solid rgba(196,120,154,0.12)' }} />
                            <UserCheck size={38} style={{ color: 'rgba(196,120,154,0.35)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>No pending requests</h2>
                            <p className="text-sm" style={{ color: 'rgba(220,180,200,0.35)' }}>When someone likes you, they'll appear here.</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="flex flex-col gap-3">
                            {requests.map(({ _id, fromUserId }) => (
                                <motion.div
                                    key={_id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -120, scale: 0.95 }}
                                    transition={{ duration: 0.22 }}
                                    className="flex items-center gap-4 p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-200/30 transition-all duration-200"
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <img
                                            src={fromUserId.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fromUserId.firstName + ' ' + fromUserId.lastName)}&size=80&background=ec4899&color=fff&bold=true`}
                                            alt={fromUserId.firstName}
                                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                                            onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fromUserId.firstName)}&size=80&background=ec4899&color=fff&bold=true`; }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
                                            <Heart size={10} className="text-white fill-white" />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-bold text-base truncate text-white">{fromUserId.firstName} {fromUserId.lastName}</h2>
                                        <p className="text-sm truncate mt-0.5" style={{ color: 'rgba(220,180,200,0.5)' }}>{fromUserId.About || 'No bio'}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {fromUserId.age && (
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(220,180,200,0.5)' }}>
                                                    {fromUserId.age} • {fromUserId.gender}
                                                </span>
                                            )}
                                            {fromUserId.Skills?.slice(0, 2).map((s, i) => (
                                                <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(138,63,160,0.2)', color: '#d4a0be', border: '1px solid rgba(138,63,160,0.3)' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 shrink-0">
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.88 }}
                                            onClick={() => handleReview(_id, "rejected", fromUserId.firstName)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:brightness-110"
                                            style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080' }}
                                            title="Decline"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.88 }}
                                            onClick={() => handleReview(_id, "accepted", fromUserId.firstName)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:brightness-110"
                                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                                            title="Accept"
                                        >
                                            <Check size={16} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Requests;
