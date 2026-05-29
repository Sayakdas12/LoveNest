import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { getSocket } from '../utils/socket';
import { BaseUrl } from '../utils/constance';
import {
  ArrowLeft, Send, Phone, Video, Smile, Paperclip, Mic, MicOff,
  X, Reply, Edit2, Trash2, Bookmark, Pin, MoreVertical, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StickerPicker from './StickerPicker';

const nid = (id) => id?._id?.toString() || id?.toString() || '';
const REACTIONS = ['❤️','😂','😮','😢','👍','🔥'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function MsgBubble({ msg, isMine, onReact, onReply, onEdit, onDelete, onPin, onBookmark, loggedInUser }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setShowMenu(false); };
    if (showMenu) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMenu]);

  const isDeleted = msg.deletedForAll;
  const myId = nid(loggedInUser?._id);

  const renderContent = () => {
    if (isDeleted) return <span className="italic text-xs opacity-50">This message was deleted.</span>;
    if (msg.type === 'image' && msg.mediaUrl) return (
      <img src={msg.mediaUrl} alt="shared" className="max-w-[220px] rounded-xl cursor-pointer"
        onClick={() => window.open(msg.mediaUrl, '_blank')} />
    );
    if (msg.type === 'voice' && msg.audioUrl) return (
      <audio controls src={msg.audioUrl} className="max-w-[220px] h-10"
        style={{ filter: 'invert(1) hue-rotate(300deg)', opacity: 0.85 }} />
    );
    if (msg.type === 'file' && msg.fileUrl) return (
      <a href={msg.fileUrl} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 text-blue-300 underline text-sm">
        <Download size={14} /> {msg.fileName || 'Download file'}
      </a>
    );
    if (msg.type === 'sticker') return <span className="text-4xl">{msg.stickerId}</span>;
    if (msg.type === 'gif' && msg.mediaUrl) return (
      <img src={msg.mediaUrl} alt="gif" className="max-w-[200px] rounded-xl" />
    );
    return <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>;
  };

  const myReaction = msg.reactions?.find(r => nid(r.userId) === myId);

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group mb-1 relative`}>
      <div className="max-w-[70%] flex flex-col">
        {/* Reply reference */}
        {msg.replyTo && (
          <div className={`text-xs rounded-t-xl px-3 py-1.5 opacity-70 border-l-2 mb-1 ${isMine ? 'border-pink-400 bg-purple-900/40' : 'border-purple-400 bg-purple-900/30'}`}>
            <span className="truncate block max-w-[180px]">
              {msg.replyTo?.text || `[${msg.replyTo?.type}]` || 'Original message'}
            </span>
          </div>
        )}

        {/* Pin indicator */}
        {msg.pinned && (
          <div className="text-[10px] text-yellow-400/60 flex items-center gap-1 mb-0.5 ml-1">
            <Pin size={9} /> Pinned
          </div>
        )}

        <div className="relative">
          {/* Bubble */}
          <div
            className={`px-3.5 py-2.5 rounded-2xl relative select-text ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
            style={isMine
              ? { background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }
              : { background: 'rgba(138,63,160,0.18)', border: '1px solid rgba(138,63,160,0.25)' }
            }
          >
            {renderContent()}
            {msg.editedAt && <span className="text-[10px] opacity-40 ml-1">(edited)</span>}
            <div className={`flex items-center gap-1 mt-1 text-[10px] opacity-50 ${isMine ? 'justify-end' : 'justify-start'}`}>
              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {isMine && msg.readAt && <span>✓✓</span>}
            </div>
          </div>

          {/* Context menu trigger */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-purple-300 hover:text-white ${isMine ? '-left-6' : '-right-6'}`}
          >
            <MoreVertical size={14} />
          </button>

          {/* Context menu */}
          {showMenu && (
            <div ref={menuRef}
              className={`absolute z-20 top-0 ${isMine ? 'right-full mr-2' : 'left-full ml-2'} w-36 rounded-xl shadow-xl overflow-hidden border border-purple-700/40`}
              style={{ background: 'rgba(22,8,34,0.98)' }}>
              {[
                { icon: <Reply size={13} />, label: 'Reply', fn: () => onReply(msg) },
                ...(isMine && !isDeleted && msg.type === 'text' ? [{ icon: <Edit2 size={13} />, label: 'Edit', fn: () => onEdit(msg) }] : []),
                { icon: <Pin size={13} />, label: msg.pinned ? 'Unpin' : 'Pin', fn: () => onPin(msg._id) },
                { icon: <Bookmark size={13} />, label: 'Bookmark', fn: () => onBookmark(msg._id) },
                { icon: <Trash2 size={13} />, label: 'Delete', fn: () => onDelete(msg._id, isMine) },
              ].map(item => (
                <button key={item.label} onClick={() => { item.fn(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-purple-200 hover:bg-purple-700/30 transition-colors">
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {msg.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(
              msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
            ).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact(msg._id, emoji)}
                className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-all ${
                  myReaction?.emoji === emoji ? 'border-pink-400/60 bg-pink-400/15' : 'border-purple-700/40 bg-purple-900/30 hover:bg-purple-700/30'
                }`}>
                <span>{emoji}</span>
                {count > 1 && <span className="text-purple-300">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Quick reaction row (hover) */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
          {REACTIONS.map(e => (
            <button key={e} onClick={() => onReact(msg._id, e)}
              className="text-sm p-0.5 rounded hover:scale-125 transition-transform">{e}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const ChatWindow = () => {
  const { userId } = useParams();
  const loggedInUser = useSelector((s) => s.user);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Composer state
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimer = useRef(null);
  const seenIds = useRef(new Set());
  const scrollAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // ── Load history ─────────────────────────────────────────────────
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

  // ── Socket events ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loggedInUser) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_chat', userId);

    const onReceive = (msg) => {
      const sid = msg._id?.toString();
      if (seenIds.current.has(sid)) return;
      if (nid(msg.senderId) !== userId && nid(msg.senderId) !== nid(loggedInUser._id)) return;
      seenIds.current.add(sid);
      setMessages(prev => [...prev, msg]);
    };
    const onSent = (msg) => {
      const sid = msg._id?.toString();
      if (!seenIds.current.has(sid)) { seenIds.current.add(sid); setMessages(prev => [...prev, msg]); }
    };
    const onTyping = ({ userId: uid }) => { if (uid === userId) setIsTyping(true); };
    const onStopTyping = ({ userId: uid }) => { if (uid === userId) setIsTyping(false); };
    const onOnline = ({ userId: uid }) => { if (uid === userId) setIsOtherOnline(true); };
    const onOffline = ({ userId: uid }) => { if (uid === userId) setIsOtherOnline(false); };
    const onOnlineStatus = ({ userId: uid, online }) => { if (uid === userId) setIsOtherOnline(online); };
    const onReaction = ({ msgId, userId: uid, emoji }) => {
      setMessages(prev => prev.map(m => {
        if (m._id?.toString() !== msgId) return m;
        const reactions = m.reactions ? [...m.reactions] : [];
        const idx = reactions.findIndex(r => nid(r.userId) === uid && r.emoji === emoji);
        if (idx >= 0) reactions.splice(idx, 1);
        else reactions.push({ userId: uid, emoji });
        return { ...m, reactions };
      }));
    };
    const onEdited = ({ msgId, text: newText }) => {
      setMessages(prev => prev.map(m => m._id?.toString() === msgId ? { ...m, text: newText, editedAt: new Date() } : m));
    };
    const onDeleted = ({ msgId, forAll }) => {
      if (forAll) setMessages(prev => prev.map(m => m._id?.toString() === msgId ? { ...m, deletedForAll: true } : m));
      else setMessages(prev => prev.filter(m => m._id?.toString() !== msgId));
    };

    socket.on('receive_message', onReceive);
    socket.on('message_sent', onSent);
    socket.on('user_typing', onTyping);
    socket.on('user_stopped_typing', onStopTyping);
    socket.on('user_online', onOnline);
    socket.on('user_offline', onOffline);
    socket.on('online_status', onOnlineStatus);
    socket.on('message_reaction', onReaction);
    socket.on('message_edited', onEdited);
    socket.on('message_deleted', onDeleted);

    socket.emit('check_online', { userId });
    socket.emit('mark_read', { senderId: userId });

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('message_sent', onSent);
      socket.off('user_typing', onTyping);
      socket.off('user_stopped_typing', onStopTyping);
      socket.off('user_online', onOnline);
      socket.off('user_offline', onOffline);
      socket.off('online_status', onOnlineStatus);
      socket.off('message_reaction', onReaction);
      socket.off('message_edited', onEdited);
      socket.off('message_deleted', onDeleted);
      socket.emit('leave_chat', userId);
    };
  }, [loggedInUser, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Typing indicator ───────────────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing_start', { receiverId: userId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing_stop', { receiverId: userId }), 1500);
  };

  // ── Send text/sticker ──────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || uploading) return;
    const socket = getSocket();
    if (!socket) return;

    if (editingMsg) {
      axios.patch(`${BaseUrl}/chat/message/${editingMsg._id}/edit`, { text: trimmed }, { withCredentials: true })
        .then(() => {
          setMessages(prev => prev.map(m => m._id === editingMsg._id ? { ...m, text: trimmed, editedAt: new Date() } : m));
          socket.emit('message_edited', { msgId: editingMsg._id, receiverId: userId, text: trimmed });
        }).catch(() => {});
      setEditingMsg(null);
    } else {
      socket.emit('send_message', {
        receiverId: userId, text: trimmed, type: 'text',
        ...(replyTo ? { replyTo: replyTo._id } : {}),
      });
    }
    setText('');
    setReplyTo(null);
    getSocket()?.emit('typing_stop', { receiverId: userId });
  }, [text, editingMsg, replyTo, userId, uploading]);

  const sendSticker = (sticker) => {
    getSocket()?.emit('send_message', { receiverId: userId, type: 'sticker', stickerId: sticker.emoji });
    setShowSticker(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── File / image upload ────────────────────────────────────────
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${BaseUrl}/upload/media`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { url, resourceType } = res.data;
      const isImage = resourceType === 'image';
      getSocket()?.emit('send_message', {
        receiverId: userId,
        type: isImage ? 'image' : 'file',
        ...(isImage ? { mediaUrl: url } : { fileUrl: url, fileName: file.name, fileSize: file.size }),
        ...(replyTo ? { replyTo: replyTo._id } : {}),
      });
      setReplyTo(null);
    } catch { alert('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  // ── Voice recording ────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setUploading(true);
        try {
          const form = new FormData();
          form.append('file', blob, 'voice.webm');
          const res = await axios.post(`${BaseUrl}/upload/media`, form, {
            withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' },
          });
          getSocket()?.emit('send_message', {
            receiverId: userId, type: 'voice', audioUrl: res.data.url,
            audioDuration: Math.round(audioChunks.current.length * 0.5),
            ...(replyTo ? { replyTo: replyTo._id } : {}),
          });
          setReplyTo(null);
        } catch { alert('Failed to send voice note.'); }
        finally { setUploading(false); }
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch { alert('Microphone access denied.'); }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  // ── Message actions ────────────────────────────────────────────
  const handleReact = async (msgId, emoji) => {
    try {
      await axios.post(`${BaseUrl}/chat/${userId}/react/${msgId}`, { emoji }, { withCredentials: true });
      getSocket()?.emit('message_reaction', { msgId, receiverId: userId, emoji });
    } catch {}
  };

  const handlePin = async (msgId) => {
    try {
      await axios.patch(`${BaseUrl}/chat/message/${msgId}/pin`, {}, { withCredentials: true });
      setMessages(prev => prev.map(m => m._id?.toString() === msgId ? { ...m, pinned: !m.pinned } : m));
    } catch {}
  };

  const handleBookmark = async (msgId) => {
    try {
      await axios.patch(`${BaseUrl}/chat/message/${msgId}/bookmark`, {}, { withCredentials: true });
    } catch {}
  };

  const handleDelete = async (msgId, isMine) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`${BaseUrl}/chat/message/${msgId}${isMine ? '?forAll=true' : ''}`, { withCredentials: true });
      if (isMine) setMessages(prev => prev.map(m => m._id?.toString() === msgId ? { ...m, deletedForAll: true } : m));
      else setMessages(prev => prev.filter(m => m._id?.toString() !== msgId));
      getSocket()?.emit('message_deleted', { msgId, receiverId: userId, forAll: isMine });
    } catch {}
  };

  const handleEdit = (msg) => { setEditingMsg(msg); setText(msg.text); textareaRef.current?.focus(); };

  // ── Call ──────────────────────────────────────────────────────
  const startCall = (type) => {
    if (otherUser) {
      window.__lovenest_startCall?.({
        peerId: userId,
        peerName: `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim(),
        peerAvatar: otherUser.photoUrl || '',
        callType: type,
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)]">
      <span className="loading loading-spinner text-purple-400" />
    </div>
  );

  const myId = nid(loggedInUser?._id);

  return (
    <div className="flex flex-col h-[calc(100vh-66px)] max-w-3xl mx-auto"
      onClick={() => { setShowEmoji(false); setShowSticker(false); }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-800/30"
        style={{ background: 'rgba(26,9,40,0.9)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/30 transition-colors">
          <ArrowLeft size={20} />
        </button>
        {otherUser && (
          <>
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2"
                style={{ borderColor: isOtherOnline ? '#4ade80' : 'rgba(138,63,160,0.4)' }}>
                {otherUser.photoUrl
                  ? <img src={otherUser.photoUrl} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
                      {otherUser.firstName?.[0]}
                    </div>}
              </div>
              {isOtherOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-[#1a0928] rounded-full" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{otherUser.firstName} {otherUser.lastName}</p>
              <p className="text-xs" style={{ color: isOtherOnline ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
                {isOtherOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={() => startCall('audio')} className="p-2 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/30 transition-colors">
            <Phone size={18} />
          </button>
          <button onClick={() => startCall('video')} className="p-2 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/30 transition-colors">
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map(msg => {
          const isMine = nid(msg.senderId) === myId;
          return (
            <MsgBubble
              key={msg._id}
              msg={msg}
              isMine={isMine}
              loggedInUser={loggedInUser}
              onReact={handleReact}
              onReply={setReplyTo}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPin={handlePin}
              onBookmark={handleBookmark}
            />
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl rounded-bl-sm text-purple-300 text-sm border border-purple-500/20"
              style={{ background: 'rgba(138,63,160,0.15)' }}>
              <span className="loading loading-dots loading-xs" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ───────────────────────────────────────────── */}
      <div className="border-t border-purple-800/30 px-3 py-3"
        style={{ background: 'rgba(26,9,40,0.9)' }}
        onClick={e => e.stopPropagation()}>

        {/* Reply bar */}
        {replyTo && !editingMsg && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl border border-purple-500/20 bg-purple-900/20">
            <Reply size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-xs text-purple-300 truncate flex-1">{replyTo.text || `[${replyTo.type}]`}</span>
            <button onClick={() => setReplyTo(null)} className="text-purple-500 hover:text-white"><X size={14} /></button>
          </div>
        )}

        {/* Edit bar */}
        {editingMsg && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl border border-yellow-500/30 bg-yellow-900/10">
            <Edit2 size={14} className="text-yellow-400 flex-shrink-0" />
            <span className="text-xs text-yellow-300 flex-1">Editing message</span>
            <button onClick={() => { setEditingMsg(null); setText(''); }} className="text-yellow-600 hover:text-white"><X size={14} /></button>
          </div>
        )}

        {/* Pickers */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[72px] right-4 z-30 shadow-2xl rounded-2xl overflow-hidden">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(e) => { setText(t => t + e.emoji); setShowEmoji(false); }}
                skinTonesDisabled
                searchDisabled
                height={340} width={320}
              />
            </motion.div>
          )}
          {showSticker && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[72px] right-4 z-30 shadow-2xl">
              <StickerPicker onSelect={sendSticker} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* Attachment */}
          <input ref={fileInputRef} type="file" className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileSelect} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="p-2.5 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/30 transition-colors flex-shrink-0 disabled:opacity-40">
            {uploading ? <span className="loading loading-spinner loading-xs" /> : <Paperclip size={19} />}
          </button>

          {/* Emoji picker */}
          <button onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); setShowSticker(false); }}
            className="p-2.5 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/30 transition-colors flex-shrink-0">
            <Smile size={19} />
          </button>

          {/* Sticker picker */}
          <button onClick={(e) => { e.stopPropagation(); setShowSticker(!showSticker); setShowEmoji(false); }}
            className="p-2.5 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/30 transition-colors flex-shrink-0 text-lg leading-none">
            🎭
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKey}
            placeholder="Message…"
            rows={1}
            className="flex-1 resize-none px-3.5 py-2.5 rounded-2xl text-sm text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/50 transition-colors"
            style={{ background: 'rgba(138,63,160,0.12)', maxHeight: '100px' }}
          />

          {/* Voice / Send */}
          {text.trim() ? (
            <button onClick={sendMessage}
              className="p-2.5 rounded-xl text-white flex-shrink-0 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
              <Send size={18} />
            </button>
          ) : (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={uploading}
              className={`p-2.5 rounded-xl flex-shrink-0 text-white transition-all hover:scale-105 disabled:opacity-40 ${recording ? 'animate-pulse' : ''}`}
              style={{ background: recording ? '#ef4444' : 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
              {recording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;