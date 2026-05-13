import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Heart } from 'lucide-react';

const STUN_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

// Global hook so ChatWindow can trigger outgoing calls
// Usage: window.__lovenest_startCall?.({ peerId, peerName, peerAvatar, callType })
// CallModal registers this on mount.

const CallModal = () => {
    const loggedInUser = useSelector(state => state.user);

    const [phase, setPhase] = useState('idle'); // idle | incoming | calling | active
    const [callType, setCallType] = useState('video');
    const [peerId, setPeerId] = useState(null);
    const [peerName, setPeerName] = useState('');
    const [peerAvatar, setPeerAvatar] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [duration, setDuration] = useState(0);

    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const pendingOffer = useRef(null);
    const pendingPeerId = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const timerRef = useRef(null);

    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        clearInterval(timerRef.current);
        setDuration(0);
        setIsMuted(false);
        setIsCameraOff(false);
    }, []);

    const createPC = useCallback((remotePeerId) => {
        const pc = new RTCPeerConnection(STUN_CONFIG);
        pcRef.current = pc;

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                getSocket()?.emit('ice_candidate', { peerId: remotePeerId, candidate: e.candidate });
            }
        };

        pc.ontrack = (e) => {
            if (remoteVideoRef.current && e.streams[0]) {
                remoteVideoRef.current.srcObject = e.streams[0];
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                cleanup();
                setPhase('idle');
            }
        };

        return pc;
    }, [cleanup]);

    const startCall = useCallback(async ({ peerId: targetId, peerName: name, peerAvatar: avatar, callType: type }) => {
        setPeerId(targetId);
        setPeerName(name || 'Unknown');
        setPeerAvatar(avatar || '');
        setCallType(type || 'video');
        setPhase('calling');
        pendingPeerId.current = targetId;

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                type === 'video' ? { video: true, audio: true } : { audio: true }
            );
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const pc = createPC(targetId);
            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            getSocket()?.emit('call_offer', { receiverId: targetId, offer, callType: type });
        } catch (err) {
            console.error('Failed to start call:', err);
            cleanup();
            setPhase('idle');
        }
    }, [createPC, cleanup]);

    // Register global hook so ChatWindow can trigger a call
    useEffect(() => {
        window.__lovenest_startCall = startCall;
        return () => { delete window.__lovenest_startCall; };
    }, [startCall]);

    // Socket event listeners
    useEffect(() => {
        if (!loggedInUser) return;
        const socket = getSocket();
        if (!socket) return;

        const onIncomingCall = ({ from, offer, callType: type, callerName: name, callerAvatar: avatar }) => {
            // Ignore if already in a call
            if (phase !== 'idle') {
                getSocket()?.emit('call_reject', { callerId: from });
                return;
            }
            pendingOffer.current = offer;
            pendingPeerId.current = from;
            setPeerId(from);
            setPeerName(name || 'Someone');
            setPeerAvatar(avatar || '');
            setCallType(type || 'video');
            setPhase('incoming');
        };

        const onCallAnswered = async ({ answer }) => {
            try {
                await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
                setPhase('active');
                timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
            } catch (err) {
                console.error('setRemoteDescription error:', err);
            }
        };

        const onIceCandidate = async ({ candidate }) => {
            try {
                if (candidate && pcRef.current) {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (err) {
                console.error('addIceCandidate error:', err);
            }
        };

        const onCallRejected = () => { cleanup(); setPhase('idle'); };
        const onCallEnded = () => { cleanup(); setPhase('idle'); };

        socket.on('incoming_call', onIncomingCall);
        socket.on('call_answered', onCallAnswered);
        socket.on('ice_candidate', onIceCandidate);
        socket.on('call_rejected', onCallRejected);
        socket.on('call_ended', onCallEnded);

        return () => {
            socket.off('incoming_call', onIncomingCall);
            socket.off('call_answered', onCallAnswered);
            socket.off('ice_candidate', onIceCandidate);
            socket.off('call_rejected', onCallRejected);
            socket.off('call_ended', onCallEnded);
        };
    }, [loggedInUser, phase, cleanup]);

    const answerCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                callType === 'video' ? { video: true, audio: true } : { audio: true }
            );
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const pc = createPC(pendingPeerId.current);
            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.current));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            getSocket()?.emit('call_answer', { callerId: pendingPeerId.current, answer });
            setPhase('active');
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        } catch (err) {
            console.error('Failed to answer call:', err);
            rejectCall();
        }
    };

    const rejectCall = () => {
        getSocket()?.emit('call_reject', { callerId: pendingPeerId.current });
        cleanup();
        setPhase('idle');
    };

    const endCallHandler = () => {
        getSocket()?.emit('call_end', { peerId: pendingPeerId.current || peerId });
        cleanup();
        setPhase('idle');
    };

    const toggleMute = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
        setIsMuted(prev => !prev);
    };

    const toggleCamera = () => {
        localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = isCameraOff; });
        setIsCameraOff(prev => !prev);
    };

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const avatarUrl = peerAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(peerName || 'U')}&size=120&background=8a3fa0&color=fff&bold=true`;

    if (phase === 'idle') return null;

    return (
        <AnimatePresence>
            <motion.div
                key="call-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                style={{ background: 'rgba(8,2,14,0.94)', backdropFilter: 'blur(16px)' }}>

                {/* ── Video call: remote full-screen + local PiP ── */}
                {(phase === 'active' && callType === 'video') ? (
                    <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden"
                        style={{ background: '#0d0318', border: '1px solid rgba(196,120,154,0.2)', boxShadow: '0 24px 80px rgba(138,63,160,0.3)' }}>
                        {/* Remote video */}
                        <video ref={remoteVideoRef} autoPlay playsInline
                            className="w-full h-full object-cover" />

                        {/* Local PiP */}
                        <div className="absolute bottom-4 right-4 w-28 h-20 rounded-2xl overflow-hidden"
                            style={{ border: '2px solid rgba(196,120,154,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
                            <video ref={localVideoRef} autoPlay playsInline muted
                                className="w-full h-full object-cover" />
                        </div>

                        {/* Duration */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-mono font-semibold text-white"
                            style={{ background: 'rgba(18,6,30,0.75)', backdropFilter: 'blur(8px)' }}>
                            {fmt(duration)}
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                            <button onClick={toggleMute} className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                                style={{ background: isMuted ? 'rgba(255,80,80,0.25)' : 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <button onClick={toggleCamera} className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                                style={{ background: isCameraOff ? 'rgba(255,80,80,0.25)' : 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                                {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                            </button>
                            <button onClick={endCallHandler} className="w-14 h-12 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', boxShadow: '0 4px 16px rgba(220,38,38,0.4)' }}>
                                <PhoneOff size={20} />
                            </button>
                        </div>
                    </div>

                ) : (
                    /* ── Audio call / incoming / calling ── */
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full max-w-sm rounded-3xl overflow-hidden text-center p-8 flex flex-col items-center gap-6"
                        style={{ background: 'linear-gradient(160deg, #1a0828 0%, #2b1040 100%)', border: '1px solid rgba(196,120,154,0.2)', boxShadow: '0 24px 80px rgba(138,63,160,0.35)' }}>

                        {/* Avatar with pulsing rings for incoming/calling */}
                        <div className="relative flex items-center justify-center">
                            {(phase === 'incoming' || phase === 'calling') && (
                                <>
                                    <div className="absolute w-32 h-32 rounded-full animate-ping"
                                        style={{ background: 'rgba(138,63,160,0.12)', animationDuration: '2s' }} />
                                    <div className="absolute w-24 h-24 rounded-full animate-ping"
                                        style={{ background: 'rgba(196,120,154,0.10)', animationDuration: '2s', animationDelay: '0.5s' }} />
                                </>
                            )}
                            <img src={avatarUrl} alt={peerName}
                                className="relative w-24 h-24 rounded-full object-cover z-10"
                                style={{ border: '3px solid rgba(196,120,154,0.4)', boxShadow: '0 0 32px rgba(138,63,160,0.3)' }} />
                        </div>

                        <div>
                            <p className="text-2xl font-bold text-white mb-1">{peerName}</p>
                            <p className="text-sm font-medium flex items-center justify-center gap-1.5"
                                style={{ color: 'rgba(220,180,200,0.5)' }}>
                                {callType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                                {phase === 'incoming' && 'Incoming call...'}
                                {phase === 'calling' && 'Calling...'}
                                {phase === 'active' && fmt(duration)}
                            </p>
                        </div>

                        {/* Hidden local audio for audio-only active calls */}
                        <audio ref={remoteVideoRef} autoPlay />
                        <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />

                        {/* Buttons */}
                        {phase === 'incoming' && (
                            <div className="flex gap-6 mt-2">
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={rejectCall}
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}>
                                        <PhoneOff size={24} />
                                    </button>
                                    <span className="text-xs" style={{ color: 'rgba(220,180,200,0.4)' }}>Decline</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={answerCall}
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', boxShadow: '0 4px 20px rgba(22,163,74,0.4)' }}>
                                        <Phone size={24} />
                                    </button>
                                    <span className="text-xs" style={{ color: 'rgba(220,180,200,0.4)' }}>Answer</span>
                                </div>
                            </div>
                        )}

                        {phase === 'calling' && (
                            <button onClick={endCallHandler}
                                className="w-16 h-16 rounded-full flex items-center justify-center mt-2"
                                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}>
                                <PhoneOff size={24} />
                            </button>
                        )}

                        {phase === 'active' && (
                            <div className="flex gap-4 mt-2">
                                <button onClick={toggleMute}
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: isMuted ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                                <button onClick={endCallHandler}
                                    className="w-14 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', boxShadow: '0 4px 16px rgba(220,38,38,0.4)' }}>
                                    <PhoneOff size={20} />
                                </button>
                                {callType === 'video' && (
                                    <button onClick={toggleCamera}
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ background: isCameraOff ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 opacity-30 mt-2">
                            <Heart size={10} style={{ color: '#c4789a' }} className="fill-current" />
                            <span className="text-[10px]" style={{ color: 'rgba(220,180,200,0.5)' }}>LoveNest</span>
                            <Heart size={10} style={{ color: '#c4789a' }} className="fill-current" />
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CallModal;
