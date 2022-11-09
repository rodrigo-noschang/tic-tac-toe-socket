import { io } from './httpServer';

interface User {
    userName: string,
    roomName: string,
    userSocketId: string
}

interface Room {
    roomName: string,
    players: User[],
    turn: string
}

let users: User[] = [];
const rooms: Room[] = [];

io.on('connection', socket => {

    socket.on('enter_room', (user: User, callback) => {

        const userIsAlreadyConnected: User | undefined = users.find(connectedUser => connectedUser.userSocketId === user.userSocketId);
        if (userIsAlreadyConnected) {
            callback({
                status: 'failed',
                message: 'Usuário já conectado'
            })
        };
        
        const roomNameSnakeCase = user.roomName.split(' ').join('_');
        let selectedRoom: Room | undefined = rooms.find(room => room.roomName === roomNameSnakeCase);

        if (!selectedRoom) {
            selectedRoom = {
                roomName: roomNameSnakeCase,
                players: [],
                turn: ''
            }
            
            rooms.push(selectedRoom);
            selectedRoom.turn = user.userName;
        } else {
            // Limites 2 users per room
            if (selectedRoom.players.length === 2) {
                callback({
                    status: 'failed',
                    message: 'Sala cheia'
                })
                return;
            }

        }
        
        const isUserInRoom = selectedRoom.players.find(player => player.userSocketId === user.userSocketId);
        if (isUserInRoom) {
            callback({
                status: 'failed',
                message: 'Sala cheia'
            })
        };
            
        users.push(user);
        selectedRoom.players.push(user);
        socket.join(roomNameSnakeCase);

        callback({
            status: 'success',
            message: 'Conectado com sucesso'
        })

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

    socket.on('get_room_info', roomName => {
        const room = rooms.find(room => room.roomName === roomName);
        const roomNameSnakeCase = roomName.split(' ').join('_');

        io.to(roomNameSnakeCase).emit('receive_room_info', room);
    })
})