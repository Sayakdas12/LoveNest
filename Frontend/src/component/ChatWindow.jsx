import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getSocket } from '../utils/socket';
import { BaseUrl } from '../utils/constance';
import { ArrowLeft, Send, Heart, Phone, Video, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';

const nid = (id) => id?._id?.toString() || id?.toString() || '';

const ChatWindow = () => {
    const { userId } = useParams();
    const loggedInUser = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOtherOnline, setIsOtherOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    const typingTimer = useRef(null);
    const seenIds = useRef(new Set());
    const scrollAreaRef = useRef(null);

    // ── Load history + find peer user ──────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [histRes, connRes] = await Promise.all([
                    axios.get(`${BaseUrl}/chat/${userId}?limit=30`, { withCredentials: true }),
                    axios.get(`${BaseUrl}/user/connections`, { withCredentials: true }),
                ]);
                const msgs = histRes.data.data || [];
                msgs.forEach(m => seenIds.current.add(m._id?.toString()));
                setMessages(msgs);
                setHasMore(histRes.data.hasMore || false);
                const found = (connRes.data.data || []).find(u => u._id === userId);
                setOtherUser(found || null);
            } catch (err) {
                console.error('Chat init error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [userId]);

    // ── Socket event listeners (uses shared socket from Body.jsx) ──
    useEffect(() => {
        if (!loggedInUser) return;

        const socket = getSocket();
        if (!socket) return;

        const onConnect = () => {
            socket.emit('check_online', { userId });
            socket.emit('mark_read', { senderId: userId });
        };

        // If socket is already connected, fire immediately; otherwise wait
        if (socket.connected) onConnect();
        socket.on('connect', onConnect);

        const onOnlineStatus = ({ userId: uid, online }) => {
            if (uid === userId) setIsOtherOnline(online);
        };
        const onUserOnline = ({ userId: uid }) => {
            if (uid === userId) setIsOtherOnline(true);
        };
        const onUserOffline = ({ userId: uid }) => {
            if (uid === userId) setIsOtherOnline(false);
        };
        const onUserTyping = ({ userId: uid }) => {
            if (uid === userId) setIsTyping(true);
        };
        const onUserStoppedTyping = ({ userId: uid }) => {
            if (uid === userId) setIsTyping(false);
        };
        const onReceiveMessage = (msg) => {
            const id = msg._id?.toString();
            if (id && seenIds.current.has(id)) return;
            if (id) seenIds.current.add(id);
            if (nid(msg.senderId) === userId) {
                setMessages(prev => [...prev, msg]);
                socket.emit('mark_read', { senderId: userId });
            }
        };
        const onMessageSent = (msg) => {
            const id = msg._id?.toString();
            if (id && seenIds.current.has(id)) return;
            if (id) seenIds.current.add(id);
            setMessages(prev => [...prev, msg]);
        };
        const onMessagesRead = ({ by }) => {
            if (by === userId) {
                setMessages(prev => prev.map(m =>
                    nid(m.senderId) === loggedInUser?._id?.toString() && !m.readAt
                        ? { ...m, readAt: new Date().toISOString() }
                        : m
                ));
            }
        };

        socket.on('online_status', onOnlineStatus);
        socket.on('user_online', onUserOnline);
        socket.on('user_offline', onUserOffline);
        socket.on('user_typing', onUserTyping);
        socket.on('user_stopped_typing', onUserStoppedTyping);
        socket.on('receive_message', onReceiveMessage);
        socket.on('message_sent', onMessageSent);
        socket.on('messages_read', onMessagesRead);

        return () => {
            socket.off('connect', onConnect);
            socket.off('online_status', onOnlineStatus);
            socket.off('user_online', onUserOnline);
            socket.off('user_offline', onUserOffline);
            socket.off('user_typing', onUserTyping);
            socket.off('user_stopped_typing', onUserStoppedTyping);
            socket.off('receive_message', onReceiveMessage);
            socket.off('message_sent', onMessageSent);
            socket.off('messages_read', onMessagesRead);
        };
    }, [loggedInUser, userId]);

    useEffect(() => {
        if (!loadingMore) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const loadMore = async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;
        setLoadingMore(true);
        const oldestId = messages[0]?._id;
        const scrollEl = scrollAreaRef.current;
        const prevHeight = scrollEl?.scrollHeight || 0;
        try {
            const res = await axios.get(`${BaseUrl}/chat/${userId}?before=${oldestId}&limit=30`, { withCredentials: true });
            const older = (res.data.data || []).filter(m => !seenIds.current.has(m._id?.toString()));
            older.forEach(m => seenIds.current.add(m._id?.toString()));
            setMessages(prev => [...older, ...prev]);
            setHasMore(res.data.hasMore || false);
            requestAnimationFrame(() => {
                if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
            });
        } catch (err) {
            console.error('Load more error:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        if (e.target.scrollTop < 60 && hasMore && !loadingMore) loadMore();
    };

    const sendMessage = () => {
        const socket = getSocket();
        if (!text.trim() || !socket) return;
        clearTimeout(typingTimer.current);
        socket.emit('typing_stop', { receiverId: userId });
        socket.emit('send_message', { receiverId: userId, text: text.trim() });
        setText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 112) + 'px';
        const socket = getSocket();
        if (socket) {
            if (e.target.value.trim()) {
                socket.emit('typing_start', { receiverId: userId });
                clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => {
                    socket.emit('typing_stop', { receiverId: userId });
                }, 2000);
            } else {
                clearTimeout(typingTimer.current);
                socket.emit('typing_stop', { receiverId: userId });
            }
        }
    };

    const startPhoneCall = () => {
        window.__lovenest_startCall?.({
            peerId: userId,
            peerName: `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim(),
            peerAvatar: otherUser?.photoUrl || '',
            callType: 'audio',
        });
    };

    const startVideoCall = () => {
        window.__lovenest_startCall?.({
            peerId: userId,
            peerName: `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim(),
            peerAvatar: otherUser?.photoUrl || '',
            callType: 'video',
        });
    };

    const groupedMessages = messages.reduce((acc, msg) => {
        const date = msg.createdAt
            ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Today';
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {});

    const otherAvatar = otherUser?.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent((otherUser?.firstName || 'U') + '+' + (otherUser?.lastName || ''))}&size=80&background=8a3fa0&color=fff&bold=true`;
    const myAvatar = loggedInUser?.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent((loggedInUser?.firstName || 'Me') + '+' + (loggedInUser?.lastName || ''))}&size=40&background=8a3fa0&color=fff&bold=true`;
    const myId = loggedInUser?._id?.toString();

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader label="Loading conversation..." />
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-66px)] max-w-2xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
                style={{ background: 'rgba(18,6,30,0.97)', borderBottom: '1px solid rgba(196,120,154,0.14)', backdropFilter: 'blur(20px)' }}>
                <button onClick={() => navigate('/connections')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:brightness-125"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(220,180,200,0.6)' }}>
                    <ArrowLeft size={18} />
                </button>

                {otherUser ? (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <img src={otherAvatar} alt={otherUser.firstName}
                                className="w-11 h-11 rounded-full object-cover shadow"
                                style={{ border: '2px solid rgba(196,120,154,0.35)' }} />
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                                style={{ background: isOtherOnline ? '#22c55e' : 'rgba(255,255,255,0.15)', borderColor: '#12061e' }} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold leading-tight truncate text-white">{otherUser.firstName} {otherUser.lastName}</p>
                            <p className="text-xs font-medium flex items-center gap-1 mt-0.5"
                                style={{ color: isOtherOnline ? '#22c55e' : 'rgba(220,180,200,0.35)' }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block"
                                    style={{ background: isOtherOnline ? '#22c55e' : 'rgba(220,180,200,0.25)' }} />
                                {isTyping
                                    ? <span style={{ color: '#c4789a' }}>typing...</span>
                                    : isOtherOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-28 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <div className="h-2.5 w-16 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                )}

                <div className="flex gap-2 shrink-0">
                    <button onClick={startPhoneCall}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:brightness-125"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(220,180,200,0.7)', border: '1px solid rgba(196,120,154,0.2)' }}
                        title="Voice call">
                        <Phone size={15} />
                    </button>
                    <button onClick={startVideoCall}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:brightness-125"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(220,180,200,0.7)', border: '1px solid rgba(196,120,154,0.2)' }}
                        title="Video call">
                        <Video size={15} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollAreaRef}
                className="flex-1 overflow-y-auto px-4 py-5"
                style={{ background: 'linear-gradient(160deg, #12061e 0%, #1a0828 50%, #160820 100%)' }}
                onScroll={handleScroll}>

                {loadingMore && (
                    <div className="flex justify-center py-3">
                        <Loader size="sm" />
                    </div>
                )}
                {hasMore && !loadingMore && (
                    <div className="flex justify-center py-2">
                        <button onClick={loadMore} className="text-xs px-3 py-1 rounded-full"
                            style={{ color: 'rgba(220,180,200,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.12)' }}>
                            Load earlier messages
                        </button>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(138,63,160,0.15), rgba(196,120,154,0.12))', border: '1px solid rgba(196,120,154,0.12)' }}>
                            <Heart size={40} style={{ color: '#c4789a' }} className="fill-current" />
                        </motion.div>
                        <p className="font-semibold text-lg text-white">Start the conversation!</p>
                        <p className="text-sm" style={{ color: 'rgba(220,180,200,0.35)' }}>
                            Say hello to {otherUser?.firstName || 'them'} 💕
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.1)' }} />
                                <span className="text-[10px] font-medium px-3 py-1 rounded-full"
                                    style={{ color: 'rgba(220,180,200,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,120,154,0.1)' }}>
                                    {date}
                                </span>
                                <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.1)' }} />
                            </div>

                            {msgs.map((msg, i) => {
                                const senderId = nid(msg.senderId);
                                const isMine = senderId === myId;
                                const time = msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : '';
                                const nextSender = msgs[i + 1] ? nid(msgs[i + 1].senderId) : null;
                                const showAvatar = i === msgs.length - 1 || nextSender !== senderId;

                                return (
                                    <motion.div
                                        key={msg._id || i}
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                                        <div className="w-7 shrink-0">
                                            {showAvatar && (
                                                <img src={isMine ? myAvatar : otherAvatar} alt=""
                                                    className="w-7 h-7 rounded-full object-cover" />
                                            )}
                                        </div>

                                        <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMine ? 'text-white rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
                                                style={isMine ? {
                                                    background: 'linear-gradient(135deg, #8a3fa0 0%, #c4789a 100%)',
                                                    boxShadow: '0 4px 14px rgba(138,63,160,0.25)',
                                                } : {
                                                    background: 'rgba(28,10,42,0.88)',
                                                    border: '1px solid rgba(196,120,154,0.18)',
                                                    color: 'rgba(240,220,230,0.92)',
                                                }}>
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-[10px]" style={{ color: 'rgba(220,180,200,0.3)' }}>{time}</span>
                                                {isMine && (
                                                    msg.readAt
                                                        ? <CheckCheck size={12} style={{ color: '#c4789a' }} />
                                                        : <Check size={12} style={{ color: 'rgba(220,180,200,0.3)' }} />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}

                {/* Typing indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="flex items-end gap-2 mb-2">
                            <div className="w-7 shrink-0">
                                <img src={otherAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                                style={{ background: 'rgba(28,10,42,0.88)', border: '1px solid rgba(196,120,154,0.18)' }}>
                                {[0, 0.2, 0.4].map((delay, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                                        style={{ background: 'rgba(196,120,154,0.6)', animationDelay: `${delay}s`, animationDuration: '0.9s' }} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="flex items-end gap-2 px-4 py-3"
                style={{ background: 'rgba(18,6,30,0.97)', borderTop: '1px solid rgba(196,120,154,0.12)', backdropFilter: 'blur(20px)' }}>
                <div className="flex-1 flex items-end gap-2 rounded-2xl px-4 py-2.5 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,120,154,0.18)' }}>
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        className="flex-1 bg-transparent resize-none text-sm leading-relaxed focus:outline-none max-h-28 overflow-y-auto text-white"
                        placeholder={`Message ${otherUser?.firstName || ''}...`}
                        style={{ minHeight: '22px', caretColor: '#c4789a' }}
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <motion.button
                    whileTap={{ scale: 0.82 }}
                    whileHover={{ scale: 1.06 }}
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                    style={text.trim() ? {
                        background: 'linear-gradient(135deg, #8a3fa0, #c4789a)',
                        boxShadow: '0 4px 16px rgba(138,63,160,0.35)',
                        color: 'white',
                    } : {
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(220,180,200,0.3)',
                    }}>
                    <Send size={17} />
                </motion.button>
            </div>
        </div>
    );
};

export default ChatWindow;