import { io } from './httpServer';
import { IRoom } from './database/types';
import { connectToRoom } from './services/connectionServices';
import { disconnectUser } from './services/disconnectionServices';
import { getRoomAndUserInfo, findRoomAndChangeTurn } from './services/roomInfoServices';
import { checkForWin } from './services/winChecks';
import { users } from './database/data';
import { IUser } from './database/types';

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
        socket.emit('receive_disconnect');
    })

    socket.on('is_user_connected_correctly', () => {
        const foundUser = users.find(user => user.userSocketId === socket.id);

        socket.emit('receive_is_user_connected_correctly', foundUser);
    })

    socket.on('get_room_info', (roomName: string) => {
        const room = getRoomAndUserInfo(roomName);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_get_room_info', room );
    })

    socket.on('register_new_board_and_check_for_win', (roomName: string, updatedBoard: string[][], line: number | undefined, column: number | undefined) => {
        // If there is no value for line and column, than the user is just reseting the board
        // and there is no need to check for wins. Gotta remember that these values can be zero.
        let win = false;
        let winner: IUser | undefined;

        if (line !== undefined && column !== undefined) {
            win = checkForWin(updatedBoard, line, column);

            if (win) {
                winner = users.find(user => user.userSocketId === socket.id);
            }
        }
        
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);
        io.to(roomNameSnakeCase).emit('receive_register_new_board_and_check_for_win', updatedBoard, win, winner);
    })
    
    socket.on('change_turn', (roomName, currentPlayer) => {
        const updatedRoom = findRoomAndChangeTurn(roomName, currentPlayer);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_get_room_info', updatedRoom);
    })
    
})