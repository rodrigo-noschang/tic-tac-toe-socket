import { io } from './httpServer';
import { IRoom } from './database/types';
import { connectToRoom } from './services/connectionServices';
import { disconnectUser } from './services/disconnectionServices';
import { getRoomAndUserInfo, findRoomAndChangeTurn } from './services/roomInfoServices';

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
        io.to(roomNameSnakeCase).emit('receive_get_room_info', room);
    })

    socket.on('get_room_info', (roomName: string) => {
        const room = getRoomAndUserInfo(roomName);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_get_room_info', room );
    })

    socket.on('register_new_board', (roomName, updatedBoard) => {
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);
        
        io.to(roomNameSnakeCase).emit('receive_register_new_board', updatedBoard);
    })
    
    socket.on('change_turn', (roomName, currentPlayer) => {
        const updatedRoom = findRoomAndChangeTurn(roomName, currentPlayer);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_get_room_info', updatedRoom);
    })
    
})