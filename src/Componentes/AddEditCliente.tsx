import { useEffect, useState } from "react";
import api from "../Api.tsx";
import {Button,Checkbox,FormControlLabel,TextField,Alert} from '@mui/material'
interface Props{
    x:Record<string,any>
    editar:boolean
}
export default function({x,editar=false}:Props){
    const [acierto,setAcierto]=useState(false)
    const [error,setError]=useState(false)
    const [nombre,setNombre]=useState(x.nombre)
    const [abierto,setAbierto]=useState(x.abierto)
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter"){
                enviar()
            }
        }
        window.addEventListener('keydown',handleKeyDown)
        return()=>{
            window.removeEventListener('keydown',handleKeyDown)
        }
    },[nombre,abierto])
    useEffect(()=>{
        setError(false)
    },[nombre])
    const enviar=()=>{
        setAcierto(false)
        let nuevo={...x,nombre:nombre,abierto:abierto}
        const accion=editar?api.put:api.post
        accion('clientes',nuevo).then((res)=>{
            setAcierto(true)
        }).catch((error)=>{
            setError(true)
        })
    }
    return (
        <div className="column">
            <TextField error={error} label="Nombre" value={nombre} onChange={(e)=>{setNombre(e.target.value)}} style={{width:'100%'}}/>
            {x.id!=null?<FormControlLabel control={<Checkbox/>} checked={abierto} label={"Abierto"} onChange={(e)=>{setAbierto(!abierto)}}/>:null}
            <Button variant="outlined" onClick={enviar}>Confirmar</Button>
            {acierto || error?<Alert severity={error?"error":"success"}>{acierto?`Cliente ${editar?"editado":"añadido"} con éxito`:`ERROR: Nombre repetido`}</Alert>:null}
        </div>
    )
}