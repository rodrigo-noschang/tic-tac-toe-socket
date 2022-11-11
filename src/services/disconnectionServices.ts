import { rooms, users, setRooms, setUsers } from "../database/data";
import { roomNameToSnakeCase } from "./roomInfoServices";
import { IRoom, IUser } from "../database/types";

const findUserAndRemoveHim = (socket:any) => {
    // Finds user and remove him from users list
    const disconnectingUser: IUser | undefined = users.find(user => user.userSocketId === socket.id);
    if (!disconnectingUser) return;

    const newUsers = users.filter(user => user.userSocketId !== disconnectingUser.userSocketId);
    setUsers(newUsers);

    return disconnectingUser;
}

const findUserRoomAndRemoveHim = (disconnectingUser: IUser) => {
    // Finds the room he was in, and puts undefined in his place.
    const disconnectingUserRoom: IRoom | undefined = rooms.find(room => room.roomName === disconnectingUser.roomName);
    if (!disconnectingUserRoom) return;

    if (disconnectingUserRoom.player1?.userSocketId === disconnectingUser.userSocketId) {
        disconnectingUserRoom.player1 = disconnectingUserRoom.player2;
    }
    disconnectingUserRoom.player2 = undefined;

    return disconnectingUserRoom;
}

const deleteRoomOrUpdatePlayerTurn = (disconnectingUserRoom: IRoom) => {
    // If there is no player left, remove the room
    if (!disconnectingUserRoom.player1 && !disconnectingUserRoom.player2) {
        const newRooms = rooms.filter(room => room.roomName !== disconnectingUserRoom.roomName);
        setRooms(newRooms);
    } else {
        // If there is one player left, it should be his turn to play
        disconnectingUserRoom.turn = disconnectingUserRoom.player1?.userSocketId || disconnectingUserRoom.player2?.userSocketId;
    }
}

const disconnectUser = (socket: any) => {
    const disconnectingUser: IUser | undefined = findUserAndRemoveHim(socket);
    if (!disconnectingUser) return;

    const disconnectingUserRoom: IRoom | undefined = findUserRoomAndRemoveHim(disconnectingUser);
    if (!disconnectingUserRoom) return;

    deleteRoomOrUpdatePlayerTurn(disconnectingUserRoom);    

    socket.leave(roomNameToSnakeCase(disconnectingUserRoom.roomName));

    console.log('Disconnection Users -> ', users);
    console.log('Disconnection Rooms -> ', rooms);

    return disconnectingUserRoom;
}

export { disconnectUser };