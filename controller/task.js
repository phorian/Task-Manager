const Task = require('../models/task')
const Notification = require('../models/notification');
const User = require('../models/user');
const getIo = require('../services/socket');
const messages = require('../models/messages');

//create task --> admin and manager
exports.createTask = async (req, res) => {
    try {
        const {title, description, assignedUsers, documentId } = req.body;
        if(!title || !assignedUsers || ! !Array.isArray(assignedUsers)) {
            return res.status(400).json({
                message: 'Title and assignedUsers are required'
            })
        }

        const task = new Task({
            title,
            description,
            assignedUsers,
            createdBy: req.user.userId,
            documentId,
            status: 'Assigned'
        });

        await task.save();

        // Trigger notifications of task to assigned users
        const notifications = assignedUsers.map((userId) => ({
            recipientId: userId,
            type: 'task-assigned',
            message: `You have been assigned to task: ${title}`,
            taskId: task._id
        }));

        await Notification.insertMany(notifications)

        // Emit notificion socke.io
        const io = getIo();
        assignedUsers.forEach((userId) => {
            io.to(`user:${userId}`).emit('notification', {
                message: `You have been assigned to task: ${title}`,
                taskId: task._id,
                type: 'task-assigned'
            });
        });

        io.to(`task:${task._id}`).emit(`task-created`, {
            taskId: task._id,
            title,
            status: task.status,
        });

        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({
            message: ' Server error', error: err.message
        });
    }
};

//list tasks --> admin, manager, assigned user
//update task status --> admin, manager
//delete task --> admin only