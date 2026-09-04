import { url } from "../Api.tsx"
interface Props{
    usuario:Record<string,any>,
    size?:number
}
export default function({usuario,size=60}:Props){
    return <img style={{width:`${size}px`,aspectRatio:'1',borderRadius:'50%'}} src={`${url}/perfiles/${usuario.perfil || 'default.png'}`}/>
}