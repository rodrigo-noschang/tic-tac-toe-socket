import { io } from './httpServer';
import { IRoom } from './database/types';
import { connectToRoom } from './services/connectionServices';
import { disconnectUser } from './services/disconnectionServices';
import { getRoomAndUserInfo, findRoomAndChangeTurn } from './services/roomInfoServices';
import { checkForWin } from './services/winChecks';
import { checkForDraw } from './services/drawCheck';
import { resetRoom, resetBoard } from './services/resetRoom';
import { users } from './database/data';

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

    socket.on('register_new_board_and_check_for_endgame', (roomName: string, updatedBoard: string[][], line: number, column: number) => {
        let winner;
        // The game has and end if someone wins or if it is a draw
        const win = checkForWin(updatedBoard, line, column);
        const draw = checkForDraw(updatedBoard)

        if (win) {
            winner = users.find(user => user.userSocketId === socket.id);
        }
        
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);
        io.to(roomNameSnakeCase).emit('receive_register_new_board_and_check_for_endgame', updatedBoard, win, winner, draw);
    })

    socket.on('reset_game', (roomName: string) => {
        // Get back to Player 1's turn.
        const resetedRoom = resetRoom(roomName);
        const resetedBoard = resetBoard();
        
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);
        io.to(roomNameSnakeCase).emit('receive_reset_game', resetedRoom, resetedBoard);
        
    })
    
    socket.on('change_turn', (roomName, currentPlayer) => {
        const updatedRoom = findRoomAndChangeTurn(roomName, currentPlayer);
        const roomNameSnakeCase = roomNameToSnakeCase(roomName);

        io.to(roomNameSnakeCase).emit('receive_get_room_info', updatedRoom);
    })
    
})