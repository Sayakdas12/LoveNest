import { io } from 'socket.io-client';
import { BaseUrl } from './constance';

let _socket = null;

export const getSocket = () => _socket;

export const connectSocket = () => {
    if (_socket?.connected) return _socket;
    if (_socket) _socket.disconnect();
    _socket = io(BaseUrl, { withCredentials: true });
    return _socket;
};

export const disconnectSocket = () => {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
};
