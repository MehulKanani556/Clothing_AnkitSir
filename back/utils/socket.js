import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS', 'HEAD',],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join', (data) => {
            const { userId, tokenHash } = data;
            if (userId) {
                const userIdStr = userId.toString();
                // Join user room
                socket.join(userIdStr);
                console.log(`📡 Socket ${socket.id} joined userId room: ${userIdStr}`);

                // Also join a specific session room if tokenHash provided
                if (tokenHash) {
                    const sessionRoom = `${userIdStr}-${tokenHash}`;
                    socket.join(sessionRoom);
                    console.log(`📡 Socket ${socket.id} joined session room: ${sessionRoom}`);
                }
            } else {
                console.log('⚠️ Socket join attempt without userId');
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

export const getIO = () => {
    return io;
};

export const sendRealTimeNotification = (userId, notification) => {
    if (io && userId) {
        io.to(userId.toString()).emit('new-notification', notification);
    }
};

export const sendSessionRevoked = (userId, tokenHash) => {
    if (io && userId && tokenHash) {
        const userIdStr = String(userId);
        const sessionRoom = `${userIdStr}-${tokenHash}`;
        console.log(`🚀 Emitting session-revoked to session room: ${sessionRoom}`);
        // Also emit to user room so any tab of this user can handle it if needed
        io.to(userIdStr).emit('session-revocation-check', { tokenHash });
        // Emit to specific session room
        io.to(sessionRoom).emit('session-revoked', { tokenHash });
    }
};

export const sendLogoutAllDevices = (userId) => {
    if (io && userId) {
        const userIdStr = userId.toString();
        console.log(`🚀 Emitting logout-all-devices to user room: ${userIdStr}`);
        io.to(userIdStr).emit('logout-all-devices');
    }
};

export const sendNewLoginAlert = (userId, newSessionData) => {
    if (io && userId) {
        const userIdStr = userId.toString();
        // Emit to user room so all existing sessions/tabs get it
        io.to(userIdStr).emit('new-login-detected', newSessionData);
    }
};

