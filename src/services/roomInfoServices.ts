import { rooms } from "../database/data";

const roomNameToSnakeCase = (roomName: string): string => {
    return roomName.split(' ').join('_');
}

const getRoomAndUserInfo = (roomName: string ) => {
    const room = rooms.find(room => room.roomName === roomName);
    
    return room
}

export { getRoomAndUserInfo, roomNameToSnakeCase };