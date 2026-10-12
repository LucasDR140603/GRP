import { useData } from "../DataContext.tsx";
import { useEffect, useState } from "react";
import api from "../Api.tsx";
import {Checkbox,FormControlLabel,Select,MenuItem,TextField,Button} from '@mui/material'
interface Props{
    x:Record<string,any>
    editar:boolean
}
export default function({x,editar=false}:Props){
    const [acierto,setAcierto]=useState<boolean>(false)
    const [error,setError]=useState<boolean>(false)
    const [nombre,setNombre]=useState(x['nombre'])
    const {usuario,clientes_abiertos,getClienteByCentro}=useData()
    const [cliente,setCliente]=useState(clientes_abiertos.find((y:Record<string,any>)=>y.id==x.id_cliente))
    const [abierto,setAbierto]=useState(x.abierto)
    const selects=()=>{
        if (clientes_abiertos.find((y:Record<string,any>)=>y.id==cliente.id)==null){
            setCliente(clientes_abiertos[0])
        }
        return <>
            <Select value={cliente.id} onChange={(e)=>{setCliente(clientes_abiertos.find((y:Record<string,any>)=>y.id==e.target.value))}}>
            {clientes_abiertos.map((y:Record<string,any>)=>{
                return <MenuItem value={y.id}>{y.nombre}</MenuItem>
            })}
            </Select>
        </>
    }
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter"){
                enviar()
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return()=>{
            window.removeEventListener("keydown",handleKeyDown)
        }
    },[nombre,cliente,abierto])
    useEffect(()=>{
        setError(false)
    },[nombre])
    const enviar=()=>{
        setAcierto(false)
        let nuevo={...x,nombre:nombre,id_cliente:cliente.id,abierto:abierto}
        const accion=editar?api.put:api.post
        accion('centros',nuevo).then((res)=>{
            setAcierto(true)
        }).catch((error)=>{
            setError(true)
        })
    }
    return (
        <div className="column">
            {selects()}
            <TextField error={error} label="Nombre" value={nombre} onChange={(e)=>{setNombre(e.target.value)}} style={{width:'100%'}}/>
            {x.id!=null?<FormControlLabel control={<Checkbox/>} checked={abierto} label='Abierto' onChange={(e)=>{setAbierto(!abierto)}}/>:null}
            <Button variant='outlined' onClick={enviar}>Confirmar</Button>
            {acierto || error?<p className={error?"red":"aqua"} style={{marginBlock:0}}>{acierto?`Centro ${editar?"editado":"añadido"} con éxito`:`ERROR: Nombre repetido`}</p>:null}
        </div>
    )
}