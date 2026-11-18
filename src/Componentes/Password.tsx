import {FaEye,FaEyeSlash} from 'react-icons/fa'
import { useState } from 'react'
import {TextField,InputAdornment,IconButton} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
interface Props{
    onChange:React.Dispatch<any>,
    className?:string,
    label?:string,
    ref?:React.Ref<any>
    error?:boolean
}
export default function({label="",className="",ref=null,onChange=(e)=>{},error=false}:Props){
    const [mostrar,setMostrar]=useState<boolean>(false)
    return (
        <TextField inputRef={ref} label={label} type={mostrar?'text':'password'} error={error} onChange={(e)=>{onChange(e)}} slotProps={{
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