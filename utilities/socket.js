const { Server } = require('socket.io');

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

        socket.on('joinChat', (data) => {
            console.log(data);
        });
        socket.on('sendMessage', () => { });

        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected: ${socket.id}, Reason: ${reason}`);
        });

        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });
    });
}

module.exports = initilizaSocket;