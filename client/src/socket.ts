import {io} from "socket.io-client"
const URL = "http://localhost:6001"

export const socket= io(URL, {
    withCredentials : true,
    autoConnect : true
})

