import { rooms } from "../database/data";

const roomNameToSnakeCase = (roomName: string): string => {
    return roomName.split(' ').join('_');
}

const getRoomAndUserInfo = (roomName: string ) => {
    const room = rooms.find(room => room.roomName === roomName);
    
    return room
}

const findRoomAndChangeTurn = (roomName: string, currentPlayer: string) => {
    const room = rooms.find(room => room.roomName === roomName);
    if (!room) return;

    const nextPlayerSocketId = currentPlayer === 'player1' ?
        room.player2?.userSocketId :
        room.player1?.userSocketId;

    room.turn = nextPlayerSocketId;

    return room;
}

export { getRoomAndUserInfo, roomNameToSnakeCase, findRoomAndChangeTurn };