import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BaseUrl } from '../utils/constance';
import { useDispatch, useSelector } from 'react-redux';
import { setFeed, removeUserFromFeed } from '../utils/feedSlice';
import Usercard from './Usercard';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Heart, SlidersHorizontal, X } from 'lucide-react';

const DEFAULT_FILTERS = { minAge: '', maxAge: '', gender: '', skills: '' };

const Feed = () => {
    const feed = useSelector((state) => state.feed);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    const getFeedData = async (activeFilters = appliedFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeFilters.minAge) params.append('minAge', activeFilters.minAge);
            if (activeFilters.maxAge) params.append('maxAge', activeFilters.maxAge);
            if (activeFilters.gender) params.append('gender', activeFilters.gender);
            if (activeFilters.skills) params.append('skills', activeFilters.skills);
            const query = params.toString();
            const res = await axios.get(`${BaseUrl}/feed${query ? '?' + query : ''}`, { withCredentials: true });
            dispatch(setFeed(res?.data?.data));
        } catch (error) {
            console.error("Error fetching feed data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFeedData(DEFAULT_FILTERS);
    }, []);

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        setShowFilters(false);
        getFeedData(filters);
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        setShowFilters(false);
        getFeedData(DEFAULT_FILTERS);
    };

    const hasActiveFilters = Object.values(appliedFilters).some(v => v !== '');

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

    return (
        <div className="flex flex-col items-center mt-6 mb-32 px-4">
            {/* Filter toggle button */}
            <div className="w-full max-w-sm flex justify-end mb-2">
                <button
                    className={`btn btn-sm gap-2 ${hasActiveFilters ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setShowFilters(v => !v)}
                >
                    <SlidersHorizontal size={15} />
                    Filters
                    {hasActiveFilters && <span className="badge badge-sm badge-secondary">ON</span>}
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="w-full max-w-sm bg-base-200 rounded-2xl p-5 mb-4 shadow-lg border border-base-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Filter Profiles</h3>
                        <button onClick={() => setShowFilters(false)} className="btn btn-circle btn-ghost btn-xs">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-base-content/50 mb-1 block">Min Age</label>
                                <input type="number" min="18" max="80" value={filters.minAge}
                                    onChange={e => setFilters(f => ({ ...f, minAge: e.target.value }))}
                                    className="input input-bordered input-sm w-full" placeholder="18" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-base-content/50 mb-1 block">Max Age</label>
                                <input type="number" min="18" max="80" value={filters.maxAge}
                                    onChange={e => setFilters(f => ({ ...f, maxAge: e.target.value }))}
                                    className="input input-bordered input-sm w-full" placeholder="50" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-base-content/50 mb-1 block">Gender</label>
                            <select value={filters.gender}
                                onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
                                className="select select-bordered select-sm w-full">
                                <option value="">Any</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-base-content/50 mb-1 block">Skills <span className="opacity-50">(comma-separated)</span></label>
                            <input type="text" value={filters.skills}
                                onChange={e => setFilters(f => ({ ...f, skills: e.target.value }))}
                                placeholder="e.g. yoga, travel" className="input input-bordered input-sm w-full" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button className="btn btn-primary btn-sm flex-1" onClick={handleApplyFilters}>Apply</button>
                        <button className="btn btn-ghost btn-sm flex-1" onClick={handleResetFilters}>Reset</button>
                    </div>
                </div>
            )}

            {!feed || feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
                    <Heart size={64} className="text-primary opacity-20" />
                    <h2 className="text-2xl font-bold">You're all caught up!</h2>
                    <p className="text-base-content/50 text-sm">
                        {hasActiveFilters ? 'No profiles match your filters. Try resetting them.' : 'No more profiles right now. Check back later!'}
                    </p>
                    {hasActiveFilters && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>Reset Filters</button>
                    )}
                </div>
            ) : (
                <>
                    <AnimatePresence mode="wait">
                        <Usercard
                            key={feed[0]?._id}
                            user={feed[0]}
                            onIgnore={() => handleAction("ignored")}
                            onInterested={() => handleAction("interested")}
                        />
                    </AnimatePresence>
                    <p className="text-xs text-base-content/30 mt-4">{feed.length} profile{feed.length !== 1 ? 's' : ''} remaining</p>
                </>
            )}
        </div>
    );
};

export default Feed;
