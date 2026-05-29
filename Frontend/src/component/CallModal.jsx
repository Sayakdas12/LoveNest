import '@livekit/components-styles';
import React, { useEffect, useState, useCallback } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { useSelector } from 'react-redux';
import { getSocket } from '../utils/socket';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { PhoneOff, Video, Mic } from 'lucide-react';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://hummingbird-tirincgj.livekit.cloud';

/**
 * CallModal handles OUTGOING calls triggered via window.__lovenest_startCall.
 * INCOMING calls are handled by IncomingCallModal and passed as props here.
 *
 * Props (for incoming / already-joined calls):
 *   roomName, token, callType, onEnd
 */
const CallModal = ({ roomName: incomingRoom, token: incomingToken, callType: incomingType, onEnd }) => {
  const loggedInUser = useSelector(state => state.user);

  // Outgoing call state
  const [outgoing, setOutgoing] = useState(null); // { peerId, peerName, peerAvatar, callType, roomName, token, phase }

  // phase: 'ringing' | 'active'
  const endCall = useCallback(() => {
    if (outgoing) {
      getSocket()?.emit('call_ended', { callId: outgoing.callId, peerId: outgoing.peerId });
    }
    if (onEnd) onEnd();
    setOutgoing(null);
  }, [outgoing, onEnd]);

  // Register global hook so ChatWindow can trigger outgoing calls
  const startCall = useCallback(async ({ peerId, peerName, peerAvatar, callType }) => {
    const callId = `${loggedInUser?._id}-${peerId}-${Date.now()}`;
    const roomName = `lovenest-${callId}`;

    try {
      const res = await axios.post(`${BaseUrl}/call/token`, {
        roomName,
        receiverId: peerId,
        callType,
      }, { withCredentials: true });

      setOutgoing({ peerId, peerName, peerAvatar, callType, roomName, token: res.data.token, callId, phase: 'ringing' });

      getSocket()?.emit('call_user', {
        recipientId: peerId,
        callId,
        callType,
        callerName: `${loggedInUser?.firstName || ''} ${loggedInUser?.lastName || ''}`.trim(),
        callerAvatar: loggedInUser?.photoUrl || '',
        roomName,
      });
    } catch (err) {
      console.error('Failed to initiate call:', err);
    }
  }, [loggedInUser]);

  useEffect(() => {
    window.__lovenest_startCall = startCall;
    return () => { delete window.__lovenest_startCall; };
  }, [startCall]);

  // Listen for call_accepted (peer answered our call)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onAccepted = ({ callId }) => {
      setOutgoing(prev => prev?.callId === callId ? { ...prev, phase: 'active' } : prev);
    };
    const onRejected = ({ callId }) => {
      setOutgoing(prev => prev?.callId === callId ? null : prev);
    };
    const onEnded = ({ callId }) => {
      setOutgoing(prev => prev?.callId === callId ? null : prev);
      if (onEnd) onEnd();
    };
    const onOffline = ({ callId }) => {
      setOutgoing(prev => prev?.callId === callId ? null : prev);
    };

    socket.on('call_accepted', onAccepted);
    socket.on('call_rejected', onRejected);
    socket.on('call_ended', onEnded);
    socket.on('call_user_offline', onOffline);
    return () => {
      socket.off('call_accepted', onAccepted);
      socket.off('call_rejected', onRejected);
      socket.off('call_ended', onEnded);
      socket.off('call_user_offline', onOffline);
    };
  }, [onEnd]);

  // Determine active call details
  const activeRoom = incomingRoom || (outgoing?.phase === 'active' ? outgoing.roomName : null);
  const activeToken = incomingToken || (outgoing?.phase === 'active' ? outgoing.token : null);
  const activeCallType = incomingType || outgoing?.callType || 'video';

  // Ringing screen (outgoing, not yet answered)
  const isRinging = outgoing?.phase === 'ringing';

  if (!activeRoom && !isRinging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)' }}>

      {/* Ringing state */}
      {isRinging && !activeRoom && (
        <div className="text-center">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-400" />
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-green-400">
              {outgoing.peerAvatar ? (
                <img src={outgoing.peerAvatar} alt={outgoing.peerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
                  {outgoing.peerName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{outgoing.peerName}</h2>
          <p className="text-purple-300 mb-10 flex items-center justify-center gap-2">
            {outgoing.callType === 'video' ? <Video size={16} /> : <Mic size={16} />}
            Calling…
          </p>
          <button onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center mx-auto transition-all hover:scale-110 shadow-xl">
            <PhoneOff size={26} className="text-white" />
          </button>
        </div>
      )}

      {/* Active LiveKit room */}
      {activeRoom && activeToken && (
        <div className="w-full h-full flex flex-col">
          <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={activeToken}
            connect={true}
            video={activeCallType === 'video'}
            audio={true}
            onDisconnected={endCall}
            style={{ height: '100%' }}
          >
            <VideoConference />
          </LiveKitRoom>
        </div>
      )}
    </div>
  );
};

export default CallModal;