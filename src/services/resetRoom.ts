import { rooms } from "../database/data";
import { IRoom } from "../database/types";

const resetRoom = (roomName: string) => {
    const room = rooms.find(room => room.roomName === roomName);
    if (!room) return;

    room.turn = room.player1?.userSocketId;
    return room;
}

const resetBoard = () => {
    return [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]
}

export { resetRoom, resetBoard };