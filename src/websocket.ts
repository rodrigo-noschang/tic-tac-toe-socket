import { io } from './httpServer';

interface User {
    userName: string,
    roomName: string,
    userSocketId: string
}

interface Room {
    roomName: string,
    turn: string | undefined,
    player1: User | undefined,
    player2: User | undefined
}

let users: User[] = [];
let rooms: Room[] = [];

const roomNameToSnakeCase = (roomName: string): string => {
    return roomName.split(' ').join('_');
}

io.on('connection', socket => {

    socket.on('enter_room', (user: User, callback) => {
        
        const roomNameSnakeCase = roomNameToSnakeCase(user.roomName);
        let selectedRoom: Room | undefined = rooms.find(room => room.roomName === roomNameSnakeCase);

        if (!selectedRoom) {
            selectedRoom = {
                roomName: roomNameSnakeCase,
                player1: user,
                player2: undefined,
                turn: undefined
            }
            
            rooms.push(selectedRoom);
            selectedRoom.turn = user.userSocketId;
        } else {
            if (!selectedRoom.player1) {
                selectedRoom.player1 = user;

            } else if (!selectedRoom.player2) {
                selectedRoom.player2 = user;
            
            } else {
                callback({
                    status: 'failed',
                    message: 'Sala cheia'
                })
            }
        }
            
        users.push(user);
        
        socket.join(roomNameSnakeCase);

        callback({
            status: 'success',
            message: 'Conectado com sucesso'
        })

        console.log('Users -> ', users);
        console.log('Rooms -> ', rooms);
    })

    socket.on('disconnect', () => {
        // Finds the disconnecting User and remove him from the list
        const disconnectingUser: User | undefined = users.find(user => user.userSocketId === socket.id);
        if (!disconnectingUser) return;

        users = users.filter(user => user.userSocketId !== disconnectingUser.userSocketId);

        // Finds the room he was in, and puts undefined in his place.
        const disconnectingUserRoom: Room | undefined = rooms.find(room => room.roomName === disconnectingUser.roomName);
        if (!disconnectingUserRoom) return;

        if (disconnectingUserRoom.player1?.userSocketId === disconnectingUser.userSocketId) disconnectingUserRoom.player1 = undefined;
        if (disconnectingUserRoom.player2?.userSocketId === disconnectingUser.userSocketId) disconnectingUserRoom.player2 = undefined;

        // If there is no player left, remove the room
        if (!disconnectingUserRoom.player1 && !disconnectingUserRoom.player2) {
            rooms = rooms.filter(room => room.roomName !== disconnectingUserRoom.roomName);
        } else {
            // If there is one player left, update the turn to him
            disconnectingUserRoom.turn = disconnectingUserRoom.player1?.userSocketId || disconnectingUserRoom.player2?.userSocketId;
        }
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

    // socket.on('change_player', (roomName: string) => {
    //     const selectedRoom: Room | undefined = rooms.find(room => room.roomName === roomName);

    //     if (selectedRoom) {
    //         const nextPlayer: User | undefined = selectedRoom.players.find(player => player.userName !== selectedRoom.turn);
            
    //         if (nextPlayer) {
    //             selectedRoom.turn = nextPlayer.userName;    
    //         }
    //     }

    //     const roomNameSnakeCase = roomNameToSnakeCase(roomName);
    //     io.to(roomNameSnakeCase).emit('receive_change_player', selectedRoom);
    // })


})