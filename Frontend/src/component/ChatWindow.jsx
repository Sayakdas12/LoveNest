import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BaseUrl } from '../utils/constance';
import { ArrowLeft, Send, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

let socket = null;

const ChatWindow = () => {
    const { userId } = useParams();
    const loggedInUser = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                const [histRes, connRes] = await Promise.all([
                    axios.get(`${BaseUrl}/chat/${userId}`, { withCredentials: true }),
                    axios.get(`${BaseUrl}/user/connections`, { withCredentials: true }),
                ]);
                setMessages(histRes.data.data || []);
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

    useEffect(() => {
        if (!loggedInUser) return;
        const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
        socket = io(BaseUrl, { auth: { token }, withCredentials: true });
        socket.on('receive_message', (msg) => {
            if (msg.senderId === userId || msg.receiverId === userId) {
                setMessages(prev => [...prev, msg]);
            }
        });
        socket.on('message_sent', (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => { socket?.disconnect(); socket = null; };
    }, [loggedInUser, userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim() || !socket) return;
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
    };

    // Group messages by date
    const groupedMessages = messages.reduce((acc, msg) => {
        const date = msg.createdAt
            ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Today';
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {});

    const otherAvatar = otherUser?.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent((otherUser?.firstName || 'U') + ' ' + (otherUser?.lastName || ''))}&size=80&background=ec4899&color=fff&bold=true`;

    const myAvatar = loggedInUser?.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent((loggedInUser?.firstName || 'Me') + ' ' + (loggedInUser?.lastName || ''))}&size=40&background=6d28d9&color=fff&bold=true`;

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Heart size={32} className="text-primary fill-primary/40" />
            </div>
            <p className="text-base-content/40 text-sm">Loading conversation…</p>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] max-w-2xl mx-auto">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10 shadow-sm border-b border-base-300"
                style={{ background: 'linear-gradient(135deg, hsl(var(--b2)) 0%, hsl(var(--b3)) 100%)' }}>
                <button onClick={() => navigate('/connections')}
                    className="btn btn-circle btn-ghost btn-sm hover:bg-primary/15 transition-colors">
                    <ArrowLeft size={18} />
                </button>

                {otherUser ? (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <img src={otherAvatar} alt={otherUser.firstName}
                                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/40 shadow" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200 shadow-sm" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold leading-tight truncate">{otherUser.firstName} {otherUser.lastName}</p>
                            <p className="text-xs text-success font-medium flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                                Online
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-28 bg-base-300 rounded-full animate-pulse" />
                        <div className="h-2.5 w-16 bg-base-300 rounded-full animate-pulse" />
                    </div>
                )}

                <Heart size={18} className="text-primary/50 fill-primary/20 shrink-0" />
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1"
                style={{
                    backgroundImage: `radial-gradient(ellipse at 20% 60%, rgba(236,72,153,0.05) 0%, transparent 60%),
                                      radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 60%)`,
                    backgroundColor: 'hsl(var(--b1))',
                }}>

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20 gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.12, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))' }}>
                            <Heart size={40} className="text-primary fill-primary/30" />
                        </motion.div>
                        <p className="font-semibold text-base-content/60 text-lg">Start the conversation!</p>
                        <p className="text-sm text-base-content/30">Say hello to {otherUser?.firstName || 'them'} 💕</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date divider */}
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-base-300/60" />
                                <span className="text-[10px] font-medium text-base-content/30 bg-base-200 border border-base-300 px-3 py-1 rounded-full">{date}</span>
                                <div className="flex-1 h-px bg-base-300/60" />
                            </div>

                            {msgs.map((msg, i) => {
                                const isMine = msg.senderId === loggedInUser?._id || msg.senderId?._id === loggedInUser?._id;
                                const time = msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'Now';
                                const showAvatar = i === msgs.length - 1 || msgs[i + 1] && (
                                    (msgs[i + 1].senderId === loggedInUser?._id) !== isMine
                                );

                                return (
                                    <motion.div
                                        key={msg._id || i}
                                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className={`flex items-end gap-2 mb-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {/* Avatar */}
                                        <div className="w-7 shrink-0">
                                            {showAvatar && (
                                                <img
                                                    src={isMine ? myAvatar : otherAvatar}
                                                    alt=""
                                                    className="w-7 h-7 rounded-full object-cover shadow-sm"
                                                />
                                            )}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`flex flex-col max-w-[68%] ${isMine ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                                isMine
                                                    ? 'text-white rounded-2xl rounded-br-sm'
                                                    : 'bg-base-100 border border-base-200 text-base-content rounded-2xl rounded-bl-sm'
                                            }`}
                                                style={isMine ? {
                                                    background: 'linear-gradient(135deg, hsl(var(--p)) 0%, #ec4899 100%)',
                                                } : {}}>
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                            </div>
                                            <span className="text-[10px] text-base-content/30 mt-1 px-1">{time}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="flex items-end gap-2 px-4 py-3 border-t border-base-300"
                style={{ background: 'linear-gradient(135deg, hsl(var(--b2)) 0%, hsl(var(--b3)) 100%)' }}>
                <div className="flex-1 flex items-end gap-2 bg-base-100 border border-base-300 rounded-2xl px-4 py-2.5 focus-within:border-primary/50 focus-within:shadow-sm focus-within:shadow-primary/10 transition-all shadow-sm">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        className="flex-1 bg-transparent resize-none text-sm leading-relaxed focus:outline-none max-h-28 overflow-y-auto placeholder:text-base-content/30"
                        placeholder={`Message ${otherUser?.firstName || ''}…`}
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        style={{ minHeight: '22px' }}
                    />
                </div>
                <motion.button
                    whileTap={{ scale: 0.82 }}
                    whileHover={{ scale: 1.06 }}
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className={`btn btn-circle border-0 shadow-md transition-all duration-200 ${
                        text.trim()
                            ? 'hover:shadow-lg hover:shadow-primary/30'
                            : 'opacity-30 cursor-not-allowed'
                    }`}
                    style={text.trim() ? {
                        background: 'linear-gradient(135deg, hsl(var(--p)) 0%, #ec4899 100%)',
                        color: 'white',
                    } : {}}>
                    <Send size={17} />
                </motion.button>
            </div>
        </div>
    );
};

export default ChatWindow;
