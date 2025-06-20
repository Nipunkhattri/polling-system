import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import socketHandler from './socket/index.js';

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.get('/', (req, res) => {
    res.json({'message':'Polling System Backend is running'});
});

socketHandler(io);

server.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});