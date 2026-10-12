import { format, formatDate, parse } from "date-fns";
import { useData } from "../DataContext.tsx";
import { useEffect, useRef, useState } from "react";
import {FormControlLabel,Checkbox,TextField,Select,MenuItem,Button} from '@mui/material'
import api from "../Api.tsx";
interface Props{
    x:Record<string,any>
    editar:boolean
}
export default function({x,editar=false}:Props){
    const formato="yyyy-MM-dd HH:mm"
    const [acierto,setAcierto]=useState(false)
    const [error,setError]=useState(false)
    const [nombre,setNombre]=useState(x.nombre)
    const {usuario,centros_abiertos,clientes_con_centro,getClienteByProyecto}=useData()
    const [cliente,setCliente]=useState(clientes_con_centro.find((y:any)=>y.id==getClienteByProyecto.current(x).id))
    const [centro,setCentro]=useState(centros_abiertos.find((y:any)=>y.id==x.id_centro))
    const [descripcion,setDescripcion]=useState(x.descripcion)
    const [begin,setBegin]=useState(x.inicio)
    const [end,setEnd]=useState(x.fin)
    const descRef=useRef(null)
    useEffect(()=>{
        if (cliente.id!=centro.id_cliente){
            setCentro(centros_abiertos.find((y:any)=>y.id_cliente==cliente.id))
        }
    },[cliente.id])
    const selects=()=>{
        if (clientes_con_centro.find((y:any)=>y.id==cliente.id)==null){
            setCliente(clientes_con_centro[0])
        }
        else if (centros_abiertos.find((y:any)=>y.id==centro.id)==null){
            setCentro(centros_abiertos.find((y:any)=>y.id_cliente==cliente.id))
        }
        return <>
            <Select value={cliente.id} onChange={(e)=>{setCliente(clientes_con_centro.find((y:any)=>y.id==e.target.value))}}>
            {clientes_con_centro.map((y:any)=>{
                return <MenuItem value={y.id}>{y.nombre}</MenuItem>
            })}
            </Select>
            <Select value={centro.id} onChange={(e)=>{setCentro(centros_abiertos.find((y:any)=>y.id==e.target.value))}}>
            {centros_abiertos.filter((y:any)=>y.id_cliente==cliente.id).map((y:any)=>{
                return <MenuItem value={y.id}>{y.nombre}</MenuItem>
            })}
            </Select>
        </>
    }
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter"){
                if(descRef.current!=document.activeElement){
                    // enviar()
                }
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return()=>{
            window.removeEventListener("keydown",handleKeyDown)
        }
    },[nombre,centro,descripcion,end])
    useEffect(()=>{
        setError(false)
    },[nombre])
    const enviar=()=>{
        setAcierto(false)
        let nuevo={...x,nombre:nombre,id_centro:centro.id,inicio:begin,fin:end,descripcion:descripcion}
        const accion=editar?api.put:api.post
        accion('proyectos',nuevo).then((res)=>{
            setAcierto(true)
        }).catch((error)=>{
            setError(true)
        })
    }
    return <div className="column">
        {selects()}
        <TextField type="text" error={error} label="Nombre" value={nombre} onChange={(e)=>{setNombre(e.target.value)}} style={{width:'100%'}}/>
        <TextField style={{width:'100%',height:'5rem'}} className="textarea" multiline={true} maxRows={2} ref={descRef} value={descripcion} onChange={(e)=>{setDescripcion(e.target.value)}} label="Descripción"/>
        {x.id!=null?<FormControlLabel checked={end!=null} label='Finalizado' control={<Checkbox/>} onChange={(e)=>{setEnd(end!=null?null:formatDate(new Date(),formato).replace(' ','T'))}}/>:null}
        <Button variant='outlined' onClick={enviar}>Confirmar</Button>
        {acierto || error?<p className={error?"red":"aqua"} style={{marginBlock:0}}>{acierto?`Proyecto ${editar?"editado":"añadido"} con éxito`:`ERROR: Nombre repetido`}</p>:null}
    </div>
}