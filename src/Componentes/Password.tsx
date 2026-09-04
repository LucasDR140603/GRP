import {FaEye,FaEyeSlash} from 'react-icons/fa'
import { useState } from 'react'
interface Props{
    onChange:React.Dispatch<any>,
    className?:string,
    placeholder?:string,
}
export default function({placeholder="",className="",onChange=(val)=>{}}:Props){
    const [mostrar,setMostrar]=useState<boolean>(false)
    return (
        <div style={{position:'relative'}}>
            <div className={className} style={{position:'absolute',top:'50%',transform:'translateY(-50%)',right:'0.5rem',cursor:'pointer',color:'#8e8a4c'}} onClick={()=>{setMostrar(!mostrar)}}>{mostrar?<FaEyeSlash className={className}/>:<FaEye className={className}/>}</div>
            <input className={className} type={mostrar?"text":"password"} onChange={(e)=>{onChange(e.target.value);}} placeholder={placeholder}/>
        </div>
    )
}