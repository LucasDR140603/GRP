import { io, Socket } from "socket.io-client"
import api,{host} from "./Api.tsx"
import Cookies from 'js-cookie'
let s:Socket | null=null
export function connect(){
    s=io(host,{
        path:"/webapi/socket.io",
        withCredentials:true,
        transports:["websocket"]
    })
    s.on("connect",()=>{
        console.log("Conectado al servidor",s!.id)
    })
    s.on("connect_error",async(err)=>{
        if (err.message==="TOKEN_EXPIRED"){
            try{
                await api.post('refresh')
                s!.connect()
            }
            catch{}
        }
    })
}
export function disconnect(){
    s?.disconnect()
    s=null
}
export function getSocket(){
    return s
}