import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';


const app = express();
app.use(cors());
const httpServer = http.createServer(app);
dotenv.config();

const io = new Server(httpServer, {
    cors: {
        origin: process.env.ALLOWED_CORS_ORIGIN,
        methods: ['POST', 'GET'],
        allowedHeaders: ['checkers-header'],
        credentials: true,
    },
    allowRequest: (req, callback) => {
        const noOriginHeader = req.headers.origin === undefined;
        callback(null, noOriginHeader);
    }
});


export { httpServer, io };