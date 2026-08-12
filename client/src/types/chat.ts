type User = {
    _id : string,
    username : string,
    profileImage : string
}

export  type Conversastion = {
    _id : string,
    participants : User[],
    lastMessage? : {
        text? : string,
        image : string,
        sender : User
    }
}