import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, logoutUser } from '../redux/slice/auth.slice';
import toast from 'react-hot-toast';
import { BASE_URL } from '../utils/BASE_URL';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

// Helper function to decode JWT without library
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && user?._id) {
            console.log('Initializing socket connection for user:', user._id);
            
            // Get tokenHash from access token
            const accessToken = localStorage.getItem('accessToken');
            let tokenHash = null;
            
            if (accessToken) {
                const decoded = decodeJWT(accessToken);
                if (decoded) {
                    tokenHash = decoded.tokenHash;
                    console.log('Decoded tokenHash:', tokenHash);
                }
            }
            
            // Create socket connection - use root URL, not /api subpath
            const socketUrl = BASE_URL.replace('/api', '');
            console.log('Connecting to socket at:', socketUrl);
            
            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                const id = user._id;
                console.log('✅ Socket connected:', newSocket.id, 'for user:', id);
                setIsConnected(true);
                console.log('🔑 Emitting join for room identifier:', { userId: id, tokenHash });
                // Join user's room with tokenHash
                newSocket.emit('join', { userId: id, tokenHash });
                
                // Show connection success for debugging (can be removed later)
                // toast.success('Socket Connected', { id: 'socket-connected' });
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error.message);
                setIsConnected(false);
                console.log('Current socketUrl being used:', socketUrl);
                toast.error('Socket Connection Failed', { id: 'socket-error' });
            });

            newSocket.on('disconnect', (reason) => {
                console.log('⚠️ Socket disconnected, reason:', reason);
                setIsConnected(false);
            });

            // Listen for session revoked event (specific room)
            newSocket.on('session-revoked', (data) => {
                console.log('🚫 Session revoked event received (specific room):', data);
                
                toast.error('Your session has been terminated from another device', {
                    duration: 5000,
                    icon: '🚫'
                });
                
                setTimeout(() => {
                    dispatch(logoutUser());
                    navigate('/auth');
                }, 1000);
            });

            // Fallback: Listen for revocation check on general user room
            newSocket.on('session-revocation-check', (data) => {
                console.log('🛡️ Revocation check received on user room:', data, 'Current hash:', tokenHash);
                
                if (data.tokenHash === tokenHash) {
                    console.log('🎯 This session matches revoked hash. Logging out...');
                    toast.error('Your session was revoked from another device', {
                        duration: 5000,
                        icon: '🚫'
                    });
                    
                    setTimeout(() => {
                        dispatch(logoutUser());
                        navigate('/auth');
                    }, 1000);
                }
            });

            // Listen for logout all devices event
            newSocket.on('logout-all-devices', () => {
                console.log('📢 Logout all devices event received');
                toast.error('You have been logged out from all devices', {
                    duration: 5000,
                    icon: '📢'
                });
                
                setTimeout(() => {
                    dispatch(logoutUser());
                    navigate('/auth');
                }, 1000);
            });

            // Listen for regular notifications
            newSocket.on('new-notification', (notification) => {
                console.log('🔔 New notification received:', notification);
                toast.success(notification.title || 'New Notification', {
                    description: notification.message,
                    duration: 6000,
                });
            });

            // Listen for new login from another device
            newSocket.on('new-login-detected', (data) => {
                console.log('📱 New login detected from another device:', data);
                
                toast((t) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '18px' }}>🔐</span> New Login Detected
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        Logged in via <b>{data.browser || 'Unknown Browser'}</b> on <b>{data.os || 'Unknown OS'}</b>
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7, fontStyle: 'italic' }}>
                        IP Address: {data.ip || 'Unknown'}
                      </div>
                    </div>
                  ), {
                    duration: 8000,
                    position: 'top-right',
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid #333',
                        padding: '12px 16px',
                        minWidth: '280px'
                    }
                  });
            });

            setSocket(newSocket);
            socketRef.current = newSocket;

            return () => {
                console.log('Cleaning up socket connection');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // Disconnect socket if user logs out
            if (socketRef.current) {
                console.log('User logged out, disconnecting socket');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user?._id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

