interface IUser {
    userName: string,
    roomName: string,
    userSocketId: string
}

interface IRoom {
    roomName: string,
    turn: string | undefined,
    player1: IUser | undefined,
    player2: IUser | undefined
}

export { IUser, IRoom };