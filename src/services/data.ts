import { IUser, IRoom } from './types';

let users: IUser[] = [];
let rooms: IRoom[] = [];

const setRooms = (newValue: IRoom[]) => {
    rooms = newValue;
}

const setUsers = (newValue: IUser[]) => {
    users = newValue;
}

export { users, rooms, setRooms, setUsers };