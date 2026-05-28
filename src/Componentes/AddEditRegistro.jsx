import { format, formatDate, parse } from "date-fns";
import { useData } from "../DataContext";
import { useEffect, useRef, useState } from "react";
import Checkbox from "./Checkbox";
import api from "../Api";
export default function({x,editar=false}){
    const [acierto,setAcierto]=useState(false)
    const {usuario,registros,proyectos_abiertos,centros_con_proyecto,clientes_con_proyecto}=useData()
    const [cliente,setCliente]=useState(clientes_con_proyecto.find((y)=>y.id==x.id_cliente))
    const [centro,setCentro]=useState(centros_con_proyecto.find((y)=>y.id==x.id_centro))
    const [proyecto,setProyecto]=useState(proyectos_abiertos.find((y)=>y.id==x.id_proyecto))
    const [descripcion,setDescripcion]=useState(x.descripcion)
    const [observaciones,setObservaciones]=useState(x.observaciones)
    const [begin,setBegin]=useState(parse(x.inicio,"dd/MM/yyyy HH:mm",new Date()))
    const [end,setEnd]=useState(x.fin==null?null:parse(x.fin,"dd/MM/yyyy HH:mm",new Date()))
    const [km,setKm]=useState(x.km)
    const [desplazamiento,setDesplazamiento]=useState(x.desplazamiento)
    const [manutencion,setManutencion]=useState(x.manutencion)
    const [alojamiento,setAlojamiento]=useState(x.alojamiento)
    const campos_gasto=[km,desplazamiento,manutencion,alojamiento]
    const sets_gasto=[setKm,setDesplazamiento,setManutencion,setAlojamiento]
    const labels_gasto=["Km","Desplazamiento","Manutención","Alojamiento"]
    const descRef=useRef(null)
    const obsRef=useRef(null)
    const [foco,setFoco]=useState(false)
    useEffect(()=>{
        if (cliente.id!=centro.id_cliente){
            setCentro(centros_con_proyecto.find((y)=>y.id_cliente==cliente.id))
        }
    },[cliente.id])
    useEffect(()=>{
        if (centro.id!=proyecto.id_centro){
            setProyecto(proyectos_abiertos.find((y)=>y.id_centro==centro.id))
        }
    },[centro.id])
    useEffect(()=>{
        if (begin>end && end!=null){
            setEnd(begin)
        }
    },[begin])
    useEffect(()=>{
        if (begin>end && end!=null){
            setBegin(end)
        }
    },[end])
    const ChangeBegin=(event)=>{
        let v=event.target.value
        const valores=v.split("-")
        if (v.length==0 || valores[0].length>4){
            setBegin(parse(x.inicio,"dd/MM/yyyy HH:mm",new Date()))
        }
        else{
            var f=new Date(v)
            setBegin(f)
        }
    }
    const ChangeEnd=(event)=>{
        let v=event.target.value
        const valores=v.split("-")
        if (v.length==0 || valores[0].length>4){
            setEnd(parse(x.inicio,"dd/MM/yyyy HH:mm",new Date()))
        }
        else{
            let f=new Date(v)
            setEnd(f)
        }
    }
    const selects=()=>{
        if (clientes_con_proyecto.find((y)=>y.id==cliente.id)==null){
            setCliente(clientes_con_proyecto[0])
        }
        else if (centros_con_proyecto.find((y)=>y.id==centro.id)==null){
            setCentro(centros_con_proyecto.find((y)=>y.id_cliente==cliente.id))
        }
        else if (proyectos_abiertos.find((y)=>y.id==proyecto.id)==null){
            setProyecto(proyectos_abiertos.find((y)=>y.id_centro==centro.id))
        }
        return <>
            <select value={cliente.id} onChange={(e)=>{setCliente(clientes_con_proyecto.find((y)=>y.id==e.target.value))}}>
            {clientes_con_proyecto.map((y)=>{
                return <option value={y.id}>{y.nombre}</option>
            })}
            </select>
            <select value={centro.id} onChange={(e)=>{setCentro(centros_con_proyecto.find((y)=>y.id==e.target.value))}}>
            {centros_con_proyecto.filter((y)=>y.id_cliente==cliente.id).map((y)=>{
                return <option value={y.id}>{y.nombre}</option>
            })}
            </select>
            <select value={proyecto.id} onChange={(e)=>{setProyecto(proyectos_abiertos.find((y)=>y.id==e.target.value))}}>
            {proyectos_abiertos.filter((y)=>y.id_centro==centro.id).map((y)=>{
                return <option value={y.id}>{y.nombre}</option>
            })}
            </select>
        </>
    }
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e)=>{
            if (e.key=="Enter"){
                if(![descRef.current,obsRef.current].includes(document.activeElement)){
                    enviar()
                }
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return()=>{
            window.removeEventListener("keydown",handleKeyDown)
        }
    },[proyecto,descripcion,observaciones,begin,end,...campos_gasto])
    const enviar=()=>{
        setAcierto(false)
        let nuevo={...x,id_proyecto:proyecto.id,inicio:formatDate(begin,'yyyy-MM-dd HH:mm'),fin:end==null?null:formatDate(end,'yyyy-MM-dd HH:mm'),descripcion:descripcion,observaciones:observaciones,km:km,desplazamiento:desplazamiento,manutencion:manutencion,alojamiento:alojamiento}
        const accion=editar?api.put:api.post
        accion('registros',nuevo).then((res)=>{
            setAcierto(true)
        })
    }
    return <div className="column">
        <h1 style={{margin:0}}>{editar?"EDITAR":"AÑADIR"} REGISTRO</h1>
        {selects()}
        <div style={{display:'grid',rowGap:'1rem',columnGap:'1rem',gridTemplateRows:`repeat(${x.fin==null && end!=null?5:4},1fr)`}}>
            <textarea ref={descRef} value={descripcion} onChange={(e)=>{setDescripcion(e.target.value)}} placeholder="Descripción"/>
            <textarea ref={obsRef} value={observaciones} onChange={(e)=>{setObservaciones(e.target.value)}} placeholder="Observaciones"/>
            <input type="datetime-local" onChange={ChangeBegin} value={formatDate(begin,'yyyy-MM-dd HH:mm')}/>
            {x.id==null || x.fin==null?<div style={{display:'flex',gap:'0.5rem',gridRow:4,alignItems:'center'}}><input type="checkbox" id={"terminado"} onChange={(e)=>{setEnd(end!=null?null:begin)}}/><label for='terminado'>Terminado</label></div>:null}
            {end!=null?<input style={{gridColumn:'1',gridRow:x.fin==null?5:4}} type="datetime-local" onChange={ChangeEnd} value={formatDate(end,'yyyy-MM-dd HH:mm')}/>:null}
            {campos_gasto.map((y,i)=>{
                return <div style={{gridColumn:'2',gridRow:(i+1)}}>
                    <label>{labels_gasto[i]}: {y}</label>
                    <input type="number" value={y} onChange={(e)=>{let v=parseFloat(e.target.value) || 0;sets_gasto[i](v<0?0:v)}}/>
                </div>
            })}
        </div>
        <a className="btn" onClick={enviar}>Confirmar</a>
        {acierto?<p className="aqua" style={{marginBlock:0}}>Registro {editar?"editado":"añadido"} con éxito</p>:null}
    </div>
}