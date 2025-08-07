const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');
const Document = require('../models/document');
const Message = require('../models/messages');
require('dotenv').config()

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // Change * to frontend URL in prod
            methods: ['GET', 'POST'],
        },
    });

    // Auth socket with jwt
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if(!token) {
            return next(new Error('Auth error: No token'));
        }
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = { userId: decoded.userId, role: decoded.role};
            next();
        } catch (err) {
            next(new Error('Auth error: Invalid token'))
        }
    });

    // Connection
    io.on('connection', async(socket) => {
        console.log(`User ${socket.user.userId} connected`);

        // User specific channel
        socket.join(`User:${socket.user.userId}`);

        // Join task room
        try {
            const tasks = await Task.find({ assignedUsers: socket.user.userId});
            tasks.forEach((task) => {
                socket.join(`task:${task._id}`);
            });

            // Join document room
            const documents = await Document.find({ collaborators: socket.user.userId});
            documents.forEach((doc) => {
                socket.join(`document:${doc._id}`);
            });
        } catch (err) {
            console.error('Error joining rooms:', err);
        }

        // Chat messages
        socket.on('chat-message', async ({taskId, documentId, content})  => {
            try {
                // validate mesage data
                if(!taskId && !documentId){
                    socket.emit('error', { message: 'Task Id or Document Id required'});
                    return;
                }
                if(taskId && DocumentId){
                    socket.emit('error', {message: 'Specify either Task Id or Document ID, not both'});
                    return;
                }

                // Check role permissions
                let hasAccess = false;
                if (taskId) {
                    const task = await Task.findById(taskId);
                    if(task && task.assignedUsers.includes(socket.user.userId)){
                        hasAccess = true;
                    }
                } else if(documentId) {
                    const doc = await Document.findById(documentId);
                    if(doc && doc.assignedUsers.includes(socket.user.userId)){
                        hasAccess = true;
                    }
                }

                if(!hasAccess) {
                    socket.emit('error', { message: 'Access denied: You are not assigned to this task or document'});
                    return;
                }

                // Save messages
                const message = new Message({
                    content,
                    senderid: socket.user.userId,
                    taskId,
                    documentId,
                    timestamp: new Date()
                });

                await message.save();

                // Send message to room

                const room = taskId ? `task:${taskId}` : `document:${documentId}`;
                io.to(room).emit('chat-message', {
                    messageId: message._id,
                    content,
                    senderid: socket.user.userId,
                    taskId,
                    documentId,
                    timestamp: message.timestamp,
                });
            } catch (err) {
                socket.emit('error', {message: 'Error sending message', err: err.message});
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.user.userId} disconnected`);
        });
    });
    return io;
};

const getIo = () => {
    if(!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIo };