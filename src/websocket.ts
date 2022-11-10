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

const roomNameToSnakeCase = (roomName: string): string => {
    return roomName.split(' ').join('_');
}

io.on('connection', socket => {

    socket.on('enter_room', (user: User, callback) => {

        const userIsAlreadyConnected: User | undefined = users.find(connectedUser => connectedUser.userSocketId === user.userSocketId);
        if (userIsAlreadyConnected) {
            callback({
                status: 'failed',
                message: 'Usuário já conectado'
            })
        };
        
        const roomNameSnakeCase = roomNameToSnakeCase(user.roomName);
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

    socket.on('get_room_info', (roomName: string) => {
        const room = rooms.find(room => room.roomName === roomName);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_room_info', room);
    })

    socket.on('register_play', ({line, column, roomName, symbol}) => {
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);
        io.to(roomNameSnakeCase).emit('receive_play', {line, column, symbol})
    })

    socket.on('change_player', (roomName: string) => {
        const selectedRoom: Room | undefined = rooms.find(room => room.roomName === roomName);

        if (selectedRoom) {
            const nextPlayer: User | undefined = selectedRoom.players.find(player => player.userName !== selectedRoom.turn);
            
            if (nextPlayer) {
                selectedRoom.turn = nextPlayer.userName;    
            }
        }

        const roomNameSnakeCase = roomNameToSnakeCase(roomName);
        io.to(roomNameSnakeCase).emit('receive_change_player', selectedRoom);
    })


})