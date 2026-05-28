import { url } from "../Api"
export default function({usuario,size=60}){
    return <img style={{width:`${size}px`,aspectRatio:'1',borderRadius:'50%'}} src={`${url}/perfiles/${usuario.perfil || 'default.png'}`}/>
}