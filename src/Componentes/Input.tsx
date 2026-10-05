import {FaEye,FaEyeSlash} from 'react-icons/fa'
import { useState,useRef,useEffect } from 'react'
import { numeros } from '../Funciones.tsx'
import {TextField,InputAdornment,IconButton} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
interface Props{
    value?:any,
    onChange:React.Dispatch<any>,
    className?:string,
    style?:{},
    type:string,
    label:string,
    error?:boolean,
    maxLength?:number | undefined,
    ref?:any
}
export default function({value=null,onChange=(e)=>{},className="",style={},type="text",label="",error=false,maxLength=undefined,ref=useRef(null)}:Props){
    const [mostrar,setMostrar]=useState(false)
    const tipo=type.toLowerCase()
    const clave=tipo=="password"
    const tel=tipo=="tel"
    return <TextField style={{...style}} type={(clave && mostrar)?"text":tipo} error={error} label={label} onChange={(e)=>{onChange(e)}}
        slotProps={clave?{
            input:{
                endAdornment:(
                    <InputAdornment position='end'>
                        <IconButton aria-label="" onClick={()=>{setMostrar(!mostrar)}}>{mostrar ? <VisibilityOff /> : <Visibility />}</IconButton>
                    </InputAdornment>
                )
            }
        }:{}}/>
    // return <div style={{position:'relative',...style}}>
    //     {clave?<div className={className+(error?" red":"")} style={{position:'absolute',top:'50%',transform:'translateY(-50%)',right:'0.5rem',cursor:'pointer',color:error?'red':'#8e8a4c'}} onClick={()=>{setMostrar(!mostrar)}}>{mostrar?<FaEyeSlash className={className}/>:<FaEye className={className}/>}</div>:null}
    //     <input ref={ref} style={{height:'100%',width:'100%'}} className={className+(error?" red":"")} type={(clave && mostrar)?"text":tipo} value={value} onChange={(e)=>{let texto=e.target.value;if(tel){texto=numeros(texto)};onChange(texto)}} maxLength={tel?9:maxLength} label={label}/>
    // </div>
}