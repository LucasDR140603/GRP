import { useData } from "../DataContext";
import { useEffect, useState } from "react";
import Checkbox from "./Checkbox";
import api from "../Api";
export default function({x,editar=false}){
    const [acierto,setAcierto]=useState(false)
    const [error,setError]=useState(false)
    const [nombre,setNombre]=useState(x.nombre)
    const {usuario,clientes_abiertos,getClienteByCentro}=useData()
    const [cliente,setCliente]=useState(clientes_abiertos.find((y)=>y.id==x.id_cliente))
    const [abierto,setAbierto]=useState(x.abierto)
    const selects=()=>{
        if (clientes_abiertos.find((y)=>y.id==cliente.id)==null){
            setCliente(clientes_abiertos[0])
        }
        return <>
            <select value={cliente.id} onChange={(e)=>{setCliente(clientes_abiertos.find((y)=>y.id==e.target.value))}}>
            {clientes_abiertos.map((y)=>{
                return <option value={y.id}>{y.nombre}</option>
            })}
            </select>
        </>
    }
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e)=>{
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
            <h1 style={{marginBottom:0}}>{editar?"EDITAR":"AÑADIR"} CENTRO</h1>
            {selects()}
            <input type="text" className={error?"red":''} placeholder="Nombre" value={nombre} onChange={(e)=>{setNombre(e.target.value)}} style={{width:'100%',border:error?'1px solid red':''}}/>
            {x.id!=null?<Checkbox val={abierto} title={"Abierto"} setVal={setAbierto}/>:null}
            <a className="btn" onClick={enviar}>Confirmar</a>
            {acierto || error?<p className={error?"red":"aqua"} style={{marginBlock:0}}>{acierto?`Centro ${editar?"editado":"añadido"} con éxito`:`ERROR: Nombre repetido`}</p>:null}
        </div>
    )
}