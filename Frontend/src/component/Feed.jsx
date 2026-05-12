import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BaseUrl } from '../utils/constance';
import { useDispatch, useSelector } from 'react-redux';
import { setFeed, removeUserFromFeed } from '../utils/feedSlice';
import Usercard from './Usercard';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

const Feed = () => {
    const feed = useSelector((state) => state.feed);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const getFeedData = async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BaseUrl + "/feed", { withCredentials: true });
            dispatch(setFeed(res?.data?.data));
        } catch (error) {
            console.error("Error fetching feed data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFeedData();
    }, []);

    const handleAction = async (status) => {
        const currentUser = feed[0];
        if (!currentUser) return;
        try {
            await axios.post(
                `${BaseUrl}/request/send/${status}/${currentUser._id}`,
                {},
                { withCredentials: true }
            );
            dispatch(removeUserFromFeed(currentUser._id));
            if (status === "interested") {
                toast.success(`You liked ${currentUser.firstName}! 💕`);
            } else {
                toast(`Skipped ${currentUser.firstName}`, { icon: '👋' });
            }
        } catch (error) {
            toast.error("Something went wrong. Try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/50 text-sm">Finding matches for you...</p>
            </div>
        );
    }

    if (!feed || feed.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-center px-4">
                <Heart size={64} className="text-primary opacity-20" />
                <h2 className="text-2xl font-bold">You're all caught up!</h2>
                <p className="text-base-content/50 text-sm">No more profiles right now. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center mt-10 mb-32">
            <AnimatePresence mode="wait">
                <Usercard
                    key={feed[0]?._id}
                    user={feed[0]}
                    onIgnore={() => handleAction("ignored")}
                    onInterested={() => handleAction("interested")}
                />
            </AnimatePresence>
            <p className="text-xs text-base-content/30 mt-4">{feed.length} profile{feed.length !== 1 ? 's' : ''} remaining</p>
        </div>
    );
};

export default Feed;
