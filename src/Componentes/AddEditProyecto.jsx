import { format, formatDate, parse } from "date-fns";
import { useData } from "../DataContext";
import { useEffect, useRef, useState } from "react";
import Checkbox from "./Checkbox";
import api from "../Api";
export default function({x,editar=false}){
    const formato="yyyy-MM-dd HH:mm"
    const [acierto,setAcierto]=useState(false)
    const [error,setError]=useState(false)
    const [nombre,setNombre]=useState(x.nombre)
    const {usuario,centros_abiertos,clientes_con_centro,getClienteByCentro,getClienteByProyecto}=useData()
    const [cliente,setCliente]=useState(clientes_con_centro.find((y)=>y.id==getClienteByProyecto.current(x).id))
    const [centro,setCentro]=useState(centros_abiertos.find((y)=>y.id==x.id_centro))
    const [descripcion,setDescripcion]=useState(x.descripcion)
    const [begin,setBegin]=useState(x.inicio)
    const [end,setEnd]=useState(x.fin)
    const descRef=useRef(null)
    useEffect(()=>{
        if (cliente.id!=centro.id_cliente){
            setCentro(centros_abiertos.find((y)=>y.id_cliente==cliente.id))
        }
    },[cliente.id])
    const selects=()=>{
        if (clientes_con_centro.find((y)=>y.id==cliente.id)==null){
            setCliente(clientes_con_centro[0])
        }
        else if (centros_abiertos.find((y)=>y.id==centro.id)==null){
            setCentro(centros_abiertos.find((y)=>y.id_cliente==cliente.id))
        }
        return <>
            <select value={cliente.id} onChange={(e)=>{setCliente(clientes_con_centro.find((y)=>y.id==e.target.value))}}>
            {clientes_con_centro.map((y)=>{
                return <option value={y.id}>{y.nombre}</option>
            })}
            </select>
            <select value={centro.id} onChange={(e)=>{setCentro(centros_abiertos.find((y)=>y.id==e.target.value))}}>
            {centros_abiertos.filter((y)=>y.id_cliente==cliente.id).map((y)=>{
                return <option value={y.id}>{y.nombre}</option>
            })}
            </select>
        </>
    }
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e)=>{
            if (e.key=="Enter"){
                if(descRef.current!=document.activeElement){
                    enviar()
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
        <h1 style={{marginBottom:0}}>{editar?"EDITAR":"AÑADIR"} PROYECTO</h1>
        {selects()}
        <input type="text" className={error?"red":''} placeholder="Nombre" value={nombre} onChange={(e)=>{setNombre(e.target.value)}} style={{width:'100%',border:error?'1px solid red':''}}/>
        <textarea ref={descRef} value={descripcion} onChange={(e)=>{setDescripcion(e.target.value)}} placeholder="Descripción"/>
        {x.id!=null?<div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}><input type="checkbox" id={"terminado"} checked={end!=null} onChange={(e)=>{setEnd(end!=null?null:formatDate(new Date(),formato).replace(' ','T'))}}/><label for='terminado'>Finalizado</label></div>:null}
        <a className="btn" onClick={enviar}>Confirmar</a>
        {acierto || error?<p className={error?"red":"aqua"} style={{marginBlock:0}}>{acierto?`Proyecto ${editar?"editado":"añadido"} con éxito`:`ERROR: Nombre repetido`}</p>:null}
    </div>
}