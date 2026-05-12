import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserCheck, Heart, Sparkles } from 'lucide-react';

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
        <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen pb-32">
            {/* Hero banner */}
            <div className="relative overflow-hidden py-10 px-4 mb-8"
                style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.10) 0%, hsl(var(--b2)) 50%, hsl(var(--p)/0.08) 100%)' }}>
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles size={18} className="text-primary" />
                        <h1 className="text-3xl font-bold">Connection Requests</h1>
                        <Sparkles size={18} className="text-primary" />
                    </div>
                    <p className="text-base-content/50 text-sm">
                        People who are interested in you
                        {requests.length > 0 && (
                            <span className="ml-2 badge badge-error badge-sm">{requests.length} pending</span>
                        )}
                    </p>
                </div>
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, hsl(var(--p)), transparent)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4">
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center gap-5 py-20 text-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1), hsl(var(--p)/0.1))' }}>
                            <UserCheck size={40} className="text-base-content/20" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-base-content/50 mb-1">No pending requests</h2>
                            <p className="text-base-content/30 text-sm">When someone likes you, they'll appear here.</p>
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
                                            style={{ background: 'linear-gradient(135deg, hsl(var(--p)), #ec4899)' }}>
                                            <Heart size={10} className="text-white fill-white" />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-bold text-base truncate">{fromUserId.firstName} {fromUserId.lastName}</h2>
                                        <p className="text-sm text-base-content/50 truncate mt-0.5">{fromUserId.About || 'No bio'}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {fromUserId.age && (
                                                <span className="text-xs text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
                                                    {fromUserId.age} • {fromUserId.gender}
                                                </span>
                                            )}
                                            {fromUserId.Skills?.slice(0, 2).map((s, i) => (
                                                <span key={i} className="text-xs badge badge-outline badge-primary py-0">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 shrink-0">
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.88 }}
                                            onClick={() => handleReview(_id, "rejected", fromUserId.firstName)}
                                            className="btn btn-circle btn-sm btn-error btn-outline"
                                            title="Decline"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.88 }}
                                            onClick={() => handleReview(_id, "accepted", fromUserId.firstName)}
                                            className="btn btn-circle btn-sm border-0 text-white shadow-md shadow-success/30"
                                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
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
