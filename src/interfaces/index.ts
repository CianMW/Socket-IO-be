export interface IOnlineUser {
    name: string
    room: IRoom
}
export interface IRoom {
    room: string
}
export interface IOnlineUsers {
    onlineUsers: IOnlineUser[]
}

