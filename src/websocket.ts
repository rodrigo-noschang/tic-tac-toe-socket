import { io } from './httpServer';

interface User {
    userName: string,
    roomName: string,
    userSocketId: string
}

interface Room {
    roomName: string,
    players: User[]
}

let users: User[] = [];
const rooms: Room[] = [];

io.on('connection', socket => {

    socket.on('enter_room', (user: User, callback) => {

        const userIsAlreadyConnected: User | undefined = users.find(connectedUser => connectedUser.userSocketId === user.userSocketId);
        if (userIsAlreadyConnected) return;
        
        const roomNameSnakeCase = user.roomName.split(' ').join('_');
        const selectedRoom = rooms.find(room => room.roomName === roomNameSnakeCase);

        if (!selectedRoom) {
            const newRoom: Room = {
                roomName: roomNameSnakeCase,
                players: []
            }
            
            rooms.push(newRoom);
        } else {
            // Limites 2 users per room
            if (selectedRoom.players.length === 2) {
                callback({
                    status: 'failed',
                    message: 'capacitade limite'
                })
                return;
            }
            
            const isUserInRoom = selectedRoom.players.find(player => player.userSocketId === user.userSocketId);
            if (isUserInRoom) return;
            
            users.push(user);
            selectedRoom.players.push(user);
            socket.join(roomNameSnakeCase);
        }

        console.log('Users -> ', users);
        console.log('Rooms -> ', rooms);
    })

    socket.on('disconnect', () => {
        const disconnectedUser: User | undefined = users.find(connectedUser => connectedUser.userSocketId === socket.id);
        if (!disconnectedUser) return;

        // Remove user from users array: MAY GENERATE CONNECTION PROBLEMS
        users = users.filter(connectedUser => connectedUser.userSocketId !== disconnectedUser.userSocketId);

        // Remove user from his room:
        const userRoom = rooms.find(room => room.roomName === disconnectedUser.roomName);
        if (!userRoom) return;

        userRoom.players = userRoom.players.filter(player => player.userSocketId !== disconnectedUser.userSocketId);
    })

    socket.on('send_greeting', (user: User) => {
        const roomNameSnakeCase = user.roomName.split(' ').join('_');
        io.to(roomNameSnakeCase).emit('receive_greeting', `Hello you all from room ${user.roomName} ${Math.random()}`);
    })
})