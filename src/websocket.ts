import { io } from './httpServer';
import { IRoom } from './database/types';
import { connectToRoom } from './services/connectionServices';
import { disconnectUser } from './services/disconnectionServices';
import { getRoomAndUserInfo } from './services/roomInfoServices';

const roomNameToSnakeCase = (roomName: string) => {
    return roomName.split(' ').join('_');
}

io.on('connection', socket => {

    socket.on('enter_room', (user, callback) => {
        connectToRoom(socket, user, callback); 
    })

    socket.on('disconnect', () => {
        const room: IRoom | undefined = disconnectUser(socket);
        if (!room) return;
        
        const roomNameSnakeCase = roomNameToSnakeCase(room.roomName);
        console.log('On disconnect -> ', room);
        io.to(roomNameSnakeCase).emit('receive_get_room_info', room);
    })

    socket.on('get_room_info', (roomName: string) => {
        const room = getRoomAndUserInfo(roomName);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_get_room_info', room );
    })

    // socket.on('register_play', ({line, column, roomName, symbol}) => {
    //     const roomNameSnakeCase = roomNameToSnakeCase(roomName);
    //     io.to(roomNameSnakeCase).emit('receive_play', {line, column, symbol})
    // })

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