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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full animate-ping absolute inset-0"
                        style={{ background: 'rgba(138,63,160,0.15)' }} />
                    <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                        style={{ background: 'linear-gradient(135deg, rgba(138,63,160,0.25), rgba(196,120,154,0.2))', border: '1px solid rgba(196,120,154,0.2)' }}>
                        <Heart size={32} style={{ color: '#c4789a' }} className="animate-pulse fill-current" />
                    </div>
                </div>
                <p className="text-sm font-medium" style={{ color: 'rgba(220,180,200,0.55)' }}>Finding matches for you...</p>
            </div>
        );
    }

    // Floating background emojis
    const BG_EMOJIS = [
        { emoji: '💜', top: '5%',  left: '4%',   size: 28, dur: '6s',  delay: '0s',   op: 0.13 },
        { emoji: '💕', top: '12%', right: '6%',  size: 22, dur: '8s',  delay: '1s',   op: 0.10 },
        { emoji: '✨', top: '22%', left: '2%',   size: 20, dur: '5s',  delay: '2s',   op: 0.15, spin: true },
        { emoji: '🌸', top: '35%', right: '3%',  size: 26, dur: '7s',  delay: '0.5s', op: 0.11 },
        { emoji: '💫', top: '48%', left: '5%',   size: 18, dur: '9s',  delay: '3s',   op: 0.13, spin: true },
        { emoji: '🦋', top: '58%', right: '5%',  size: 24, dur: '6.5s',delay: '1.5s', op: 0.10 },
        { emoji: '💗', top: '70%', left: '3%',   size: 22, dur: '7.5s',delay: '2.5s', op: 0.12 },
        { emoji: '🌺', top: '80%', right: '4%',  size: 20, dur: '8.5s',delay: '0.8s', op: 0.10 },
        { emoji: '💝', top: '88%', left: '7%',   size: 16, dur: '5.5s',delay: '1.8s', op: 0.11 },
        { emoji: '✨', top: '92%', right: '8%',  size: 14, dur: '6.2s',delay: '3.5s', op: 0.13, spin: true },
        { emoji: '💞', top: '15%', left: '45%',  size: 13, dur: '10s', delay: '4s',   op: 0.08 },
        { emoji: '🌷', top: '75%', left: '48%',  size: 15, dur: '9s',  delay: '2.2s', op: 0.09 },
    ];

    return (
        <div className="relative flex flex-col items-center mt-8 mb-24 px-4 overflow-x-clip">

            {/* Floating emoji background */}
            {BG_EMOJIS.map((e, i) => (
                <span
                    key={i}
                    className={`ln-bg-emoji${e.spin ? ' spin' : ''}`}
                    style={{
                        top: e.top, left: e.left, right: e.right,
                        fontSize: e.size,
                        '--dur': e.dur,
                        '--delay': e.delay,
                        '--op': e.op,
                    }}
                    aria-hidden="true"
                >{e.emoji}</span>
            ))}
            {/* Filter toggle button */}
            <div className="w-full max-w-sm flex justify-end mb-3">
                <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                    onClick={() => setShowFilters(v => !v)}
                    style={hasActiveFilters ? {
                        background: 'linear-gradient(135deg, rgba(138,63,160,0.35), rgba(196,120,154,0.25))',
                        border: '1px solid rgba(196,120,154,0.35)',
                        color: '#e0b8cc',
                    } : {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(196,120,154,0.15)',
                        color: 'rgba(220,180,200,0.5)',
                    }}
                >
                    <SlidersHorizontal size={14} />
                    Filters
                    {hasActiveFilters && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(196,120,154,0.35)', color: '#f0c0d8' }}>ON</span>
                    )}
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div
                    className="w-full max-w-sm rounded-2xl p-5 mb-5"
                    style={{
                        background: 'rgba(28,10,42,0.9)',
                        border: '1px solid rgba(196,120,154,0.18)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-white text-sm">Filter Profiles</h3>
                        <button onClick={() => setShowFilters(false)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(220,180,200,0.5)' }}>
                            <X size={13} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            {[['Min Age','minAge','18'],['Max Age','maxAge','50']].map(([lbl,key,ph]) => (
                                <div key={key} className="flex-1">
                                    <label className="text-[10px] mb-1 block" style={{ color: 'rgba(196,120,154,0.6)' }}>{lbl}</label>
                                    <input type="number" min="18" max="80" value={filters[key]} placeholder={ph}
                                        onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,120,154,0.18)', caretColor: '#c4789a' }} />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-[10px] mb-1 block" style={{ color: 'rgba(196,120,154,0.6)' }}>Gender</label>
                            <select value={filters.gender}
                                onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,120,154,0.18)', color: filters.gender ? 'white' : 'rgba(255,255,255,0.3)' }}>
                                <option value="" style={{ background: '#1e0d30' }}>Any gender</option>
                                <option value="male" style={{ background: '#1e0d30' }}>Male</option>
                                <option value="female" style={{ background: '#1e0d30' }}>Female</option>
                                <option value="other" style={{ background: '#1e0d30' }}>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] mb-1 block" style={{ color: 'rgba(196,120,154,0.6)' }}>Skills <span style={{ opacity: 0.5 }}>(comma-separated)</span></label>
                            <input type="text" value={filters.skills} placeholder="e.g. yoga, travel"
                                onChange={e => setFilters(f => ({ ...f, skills: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,120,154,0.18)', caretColor: '#c4789a' }} />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}
                            onClick={handleApplyFilters}>Apply</button>
                        <button className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,120,154,0.18)', color: 'rgba(220,180,200,0.55)' }}
                            onClick={handleResetFilters}>Reset</button>
                    </div>
                </div>
            )}

            {!feed || feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center px-4">
                    {/* Animated heart rings */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: 'rgba(138,63,160,0.1)', animationDuration: '2s' }} />
                        <div className="absolute inset-3 rounded-full animate-ping"
                            style={{ background: 'rgba(196,120,154,0.1)', animationDuration: '2s', animationDelay: '0.5s' }} />
                        <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(138,63,160,0.2), rgba(196,120,154,0.15))', border: '1px solid rgba(196,120,154,0.2)' }}>
                            <Heart size={36} style={{ color: '#c4789a' }} className="fill-current" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white mb-2">
                            {hasActiveFilters ? 'No matches found' : "You're all caught up!"}
                        </h2>
                        <p className="text-sm max-w-xs" style={{ color: 'rgba(220,180,200,0.45)' }}>
                            {hasActiveFilters
                                ? 'No profiles match your current filters. Try broadening your search.'
                                : 'No more profiles right now. Come back later for new matches!'}
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <button
                            className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 6px 20px rgba(138,63,160,0.3)' }}
                            onClick={handleResetFilters}
                        >Reset Filters</button>
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
                    <p className="text-xs mt-4" style={{ color: 'rgba(220,180,200,0.3)' }}>
                        {feed.length} profile{feed.length !== 1 ? 's' : ''} remaining
                    </p>
                </>
            )}
        </div>
    );
};

export default Feed;
