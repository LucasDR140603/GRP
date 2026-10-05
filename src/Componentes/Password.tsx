import {FaEye,FaEyeSlash} from 'react-icons/fa'
import { useState } from 'react'
import {TextField,InputAdornment,IconButton} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
interface Props{
    onChange:React.Dispatch<any>,
    className?:string,
    label?:string,
    error?:boolean
}
export default function({label="",className="",onChange=(e)=>{},error=false}:Props){
    const [mostrar,setMostrar]=useState<boolean>(false)
    return (
        // <div style={{position:'relative'}}>
        //     <div className={className} style={{position:'absolute',top:'50%',transform:'translateY(-50%)',right:'0.5rem',cursor:'pointer',color:'#8e8a4c'}} onClick={()=>{setMostrar(!mostrar)}}>{mostrar?<FaEyeSlash className={className}/>:<FaEye className={className}/>}</div>
        //     <input className={className} type={mostrar?"text":"password"} onChange={(e)=>{onChange(e.target.value);}} placeholder={placeholder}/>
        // </div>
        <TextField label={label} type={mostrar?'text':'password'} error={error} onChange={(e)=>{onChange(e)}} slotProps={{
            input:{
                endAdornment:(
                    <InputAdornment position='end'>
                        <IconButton aria-label="" onClick={()=>{setMostrar(!mostrar)}}>
                            {mostrar ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                )
            }
        }}
        />
    )
}