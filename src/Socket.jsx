import { io } from "socket.io-client"
import api,{host} from "./Api"
import Cookies from 'js-cookie'
let s=null
const refreshToken=async()=>{
    if (Cookies.get('refreshToken')){
        const res=await api.post('refresh',{'refreshToken':Cookies.get('refreshToken')})
        return res.data.token
    }
    else{
        return "ERROR"
    }
}
export function connect(){
    s=io(host,{
        auth:{
            token:Cookies.get('token')
        },
        path:"/webapi/socket.io",
        transports:["websocket"]
    })
    s.on("connect",()=>{
        console.log("Conectado al servidor",s.id)
    })
    s.on("connect_error",async(err)=>{
        if (err.message==="TOKEN_EXPIRED"){
            const newToken=await refreshToken()
            if (newToken!="ERROR"){
                Cookies.set("token",newToken)
                s.auth.token=newToken
                s.connect()
            }
        }
    })
}
export function disconnect(){
    s=null
}
export function getSocket(){
    return s
}