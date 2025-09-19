const { Server } = require('socket.io');
const messageModel = require('../api/models/message');
const { sendNotification } = require('../api/Services/messageService');

const initilizaSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        allowEIO3: true,
        transports: ['websocket', 'polling']
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.id}`);
        socket.emit('welcome', 'Welcome to the server! keyur');

        socket.on('joinChat', ({ sender, receiver }) => {
            socket.join([sender, receiver].sort().join('_'));
        });
        socket.on('sendMessage', async ({ sender, receiver, content }) => {
            const message = new messageModel({ sender, receiver, content })
            await message.save();

            await sendNotification(receiver, {
                title: 'New Message',
                message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                icon: '../assets/whatsapp.png',
                url: `/chat/${sender}`
            });
            io.to([sender, receiver].sort().join('_')).emit('receiveMessage', { sender, content });
        });

        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected: ${socket.id}, Reason: ${reason}`);
        });

        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });
    });
}

module.exports = initilizaSocket;