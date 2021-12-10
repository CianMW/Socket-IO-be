export interface IOnlineUser {
    username: string
    room: IRoom
    socketId: string
}
export interface IRoom {
    room: string
}
export interface IOnlineUsers {
    onlineUsers: IOnlineUser[]
}

