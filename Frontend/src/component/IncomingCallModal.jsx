import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, PhoneCall } from 'lucide-react';
import { getSocket } from '../utils/socket';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import CallModal from './CallModal';

export default function IncomingCallModal() {
  const [incoming, setIncoming] = useState(null); // { callId, callType, callerName, callerAvatar, callerId, roomName }
  const [activeCall, setActiveCall] = useState(null); // { roomName, token, callType }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncoming = (data) => {
      setIncoming(data);
      // Auto-dismiss after 45 seconds if not answered
      setTimeout(() => setIncoming(prev => prev?.callId === data.callId ? null : prev), 45000);
    };

    const handleCallEnded = () => {
      setIncoming(null);
      setActiveCall(null);
    };

    socket.on('incoming_call', handleIncoming);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_rejected', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncoming);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_rejected', handleCallEnded);
    };
  }, []);

  const accept = async () => {
    if (!incoming) return;
    try {
      const res = await axios.post(`${BaseUrl}/call/token`, {
        roomName: incoming.roomName,
        callType: incoming.callType,
      }, { withCredentials: true });

      const socket = getSocket();
      socket?.emit('call_accepted', {
        callId: incoming.callId,
        callerId: incoming.callerId,
        roomName: incoming.roomName,
      });

      setActiveCall({ roomName: incoming.roomName, token: res.data.token, callType: incoming.callType });
      setIncoming(null);
    } catch {
      reject();
    }
  };

  const reject = () => {
    if (!incoming) return;
    const socket = getSocket();
    socket?.emit('call_rejected', { callId: incoming.callId, callerId: incoming.callerId });
    setIncoming(null);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  if (!incoming && !activeCall) return null;

  return (
    <>
      {/* Active call modal */}
      {activeCall && (
        <CallModal
          roomName={activeCall.roomName}
          token={activeCall.token}
          callType={activeCall.callType}
          onEnd={endCall}
        />
      )}

      {/* Incoming call overlay */}
      {incoming && !activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm mx-4 p-8 rounded-3xl text-center border border-purple-500/30"
            style={{ background: 'linear-gradient(160deg, #1a0928, #12061e)' }}>

            {/* Pulse ring */}
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: incoming.callType === 'video' ? '#60a5fa' : '#4ade80' }} />
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center"
                style={{ borderColor: incoming.callType === 'video' ? '#60a5fa' : '#4ade80' }}>
                {incoming.callerAvatar ? (
                  <img src={incoming.callerAvatar} alt={incoming.callerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
                    {incoming.callerName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{incoming.callerName}</h3>
            <p className="text-purple-300 mb-8 flex items-center justify-center gap-2">
              {incoming.callType === 'video' ? <Video size={16} /> : <Phone size={16} />}
              Incoming {incoming.callType} call…
            </p>

            <div className="flex justify-center gap-8">
              <button onClick={reject}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white bg-red-500 hover:bg-red-400 transition-all hover:scale-110 shadow-xl">
                <PhoneOff size={26} />
              </button>
              <button onClick={accept}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white bg-green-500 hover:bg-green-400 transition-all hover:scale-110 shadow-xl">
                <PhoneCall size={26} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
