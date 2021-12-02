import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';

const server = express();

server.use(cors());

const httpServer = createServer(server);
const io = new Server(httpServer, {
	allowEIO3: true,
});

let onlineUsers = [];

const addNewUser = (username, socketId) => {
	!onlineUsers.some((user) => user.username === username) &&
		onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
	onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
	return onlineUsers.find((user) => user.username === username);
};

io.on('connection', (socket) => {
	socket.on('newUser', (username) => {
		console.log(username, socket.id, 'inside newUser');
		addNewUser(username, socket.id);
		console.log(onlineUsers, 'list of inline users');
	});

	socket.on('sendNotification', ({ senderName, receiverName, type }) => {
		const receiver = getUser(receiverName);
		console.log(receiver, '<<<<<Receiver line 37');
		// io.to(receiver.socketId).emit('getNotification', {
		// 	senderName,
		// 	type,
		// });
	});

	socket.on('sendText', ({ senderName, receiverName, text }) => {
		const receiver = getUser(receiverName);
		io.to(receiver.socketId).emit('getText', {
			senderName,
			text,
		});
	});

	socket.on('disconnect', () => {
		removeUser(socket.id);
	});
});

httpServer.listen(3003);
