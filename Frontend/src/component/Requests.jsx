import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserCheck } from 'lucide-react';

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
        <div className="max-w-2xl mx-auto px-4 py-10 mb-32">
            <h1 className="text-3xl font-bold text-center mb-1">Connection Requests</h1>
            <p className="text-center text-base-content/40 text-sm mb-8">
                People who are interested in you
                {requests.length > 0 && (
                    <span className="ml-2 badge badge-primary badge-sm">{requests.length}</span>
                )}
            </p>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <UserCheck size={64} className="text-base-content/20" />
                    <h2 className="text-xl font-semibold text-base-content/50">No pending requests</h2>
                    <p className="text-base-content/40 text-sm">When someone likes you, they'll appear here.</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="flex flex-col gap-4">
                        {requests.map(({ _id, fromUserId }) => (
                            <motion.div
                                key={_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="flex items-center gap-4 p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <img
                                    src={fromUserId.photoUrl || 'https://bbdu.ac.in/wp-content/uploads/2021/11/dummy-image1.jpg'}
                                    alt={fromUserId.firstName}
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-semibold truncate">
                                        {fromUserId.firstName} {fromUserId.lastName}
                                    </h2>
                                    <p className="text-sm text-base-content/50 truncate">
                                        {fromUserId.About || 'No bio'}
                                    </p>
                                    {fromUserId.age && (
                                        <p className="text-xs text-base-content/40 mt-0.5">
                                            {fromUserId.age} &bull; {fromUserId.gender}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleReview(_id, "rejected", fromUserId.firstName)}
                                        className="btn btn-circle btn-sm btn-error btn-outline"
                                        title="Decline"
                                    >
                                        <X size={16} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleReview(_id, "accepted", fromUserId.firstName)}
                                        className="btn btn-circle btn-sm btn-success"
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
    );
};

export default Requests;
