const { Server } = require('socket.io');
const messageModel = require('../api/models/message');
const userModel = require('../api/models/user')
const { sendNotification } = require('../api/Services/messageService');
const { default: mongoose } = require('mongoose');

const initilizaSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://13.51.106.37", "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: "/api/socket.io",
        transports: ["websocket", "polling"],
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
            io.emit('updateDrawer');
        });

        socket.on('drawerList', async ({ loginId }) => {
            const users = await userModel.aggregate([
                {
                    $match: {
                        _id: { $ne: new mongoose.Types.ObjectId(loginId) }
                    }
                },
                {
                    $lookup: {
                        from: "messages",
                        let: { otherUserId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$sender", "$$otherUserId"] }, // Only messages RECEIVED BY current user
                                            { $eq: ["$receiver", new mongoose.Types.ObjectId(loginId)] }
                                        ]
                                    },
                                    isRead: false
                                }
                            },
                            { $sort: { createdAt: -1 } }
                        ],
                        as: "unreadMessages"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        unreadCount: { $size: "$unreadMessages" },
                        lastMessage: {
                            $ifNull: [
                                { $arrayElemAt: ["$unreadMessages.content", 0] },
                                null
                            ]
                        },
                        lastMessageTime: {
                            $ifNull: [
                                { $arrayElemAt: ["$unreadMessages.createdAt", 0] },
                                null
                            ]
                        }
                    }
                },
                {
                    $sort: { unreadCount: -1, lastMessageTime: -1 }
                }
            ])
            socket.emit('chatList', users);
        })

        socket.on('markAsRead', async ({ senderId, receiverId }) => {
            await messageModel.updateMany({
                sender: new mongoose.Types.ObjectId(receiverId),
                receiver: new mongoose.Types.ObjectId(senderId), isRead: false
            }, { isRead: true });
        });

        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected: ${socket.id}, Reason: ${reason}`);
        });

        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });
    })
}

module.exports = initilizaSocket;