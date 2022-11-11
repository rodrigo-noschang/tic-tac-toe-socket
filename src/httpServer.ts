import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';


const app = express();
app.use(cors());
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['POST', 'GET'],
        allowedHeaders: ['checkers-header'],
        credentials: true
    }
});


export { httpServer, io };