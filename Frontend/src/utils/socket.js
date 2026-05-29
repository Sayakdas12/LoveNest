import { io } from 'socket.io-client';
import { BaseUrl } from './constance';

let _socket = null;

export const getSocket = () => _socket;

export const connectSocket = () => {
    if (_socket?.connected) return _socket;
    if (_socket) _socket.disconnect();
    // withCredentials sends the httpOnly cookie automatically in the
    // WebSocket upgrade handshake headers — no manual token extraction needed.
    _socket = io(import.meta.env.VITE_SOCKET_URL || BaseUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
    });
    return _socket;
};

export const disconnectSocket = () => {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
};
