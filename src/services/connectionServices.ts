import { rooms, users } from "./data";
import { IUser, IRoom } from "./types";

const roomNameToSnakeCase = (roomName: string): string => {
    return roomName.split(' ').join('_');
}

const createRoomAndInsertFirstPlayer = (selectedRoom: IRoom | undefined, user: IUser, roomNameSnakeCase: string) => {
    selectedRoom = {
        roomName: roomNameSnakeCase,
        player1: user,
        player2: undefined,
        turn: undefined
    }
    
    rooms.push(selectedRoom);
    selectedRoom.turn = user.userSocketId;
}

const insertNewPlayer = (selectedRoom: IRoom, user: IUser, callback: any) => {
    // If there already is a player 1, set as player 2, if both players are
    // already in the room, stop the process and return a fail message.
    
    if (!selectedRoom.player1) {
        selectedRoom.player1 = user;
    } else if (!selectedRoom.player2) {
        selectedRoom.player2 = user;
    } else {
        return false;
    }
    return true;
}

const connectToRoom = (socket: any, user: IUser, callback: any) => {
    const roomNameSnakeCase = roomNameToSnakeCase(user.roomName);
    let selectedRoom: IRoom | undefined = rooms.find(room => room.roomName === roomNameSnakeCase);

    if (!selectedRoom) {
        createRoomAndInsertFirstPlayer(selectedRoom, user, roomNameSnakeCase);
    } else {
        const playerAddedOk = insertNewPlayer(selectedRoom, user, callback);

        // If user could not be added, we will not add him to the array of users
        // neither join his socket on that room.
        if (!playerAddedOk) {
            callback({
                status: 'failed',
                message: 'Sala cheia'
            })
            return;
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
}

export { connectToRoom };