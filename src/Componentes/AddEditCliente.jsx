import { useData } from "../DataContext";
import { useEffect, useState } from "react";
import Checkbox from "./Checkbox";
import api from "../Api";
export default function({x,editar=false}){
    const [acierto,setAcierto]=useState(false)
    const [error,setError]=useState(false)
    const [nombre,setNombre]=useState(x.nombre)
    const [abierto,setAbierto]=useState(x.abierto)
    useEffect(()=>{
        setAcierto(false)
        const handleKeyDown=(e)=>{
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
            <h1 style={{marginBottom:0}}>{editar?"EDITAR":"AÑADIR"} CLIENTE</h1>
            <input type="text" className={error?"red":''} placeholder="Nombre" value={nombre} onChange={(e)=>{setNombre(e.target.value)}} style={{width:'100%',border:error?'1px solid red':''}}/>
            {x.id!=null?<Checkbox val={abierto} title={"Abierto"} setVal={setAbierto}/>:null}
            <a className="btn" onClick={enviar}>Confirmar</a>
            {acierto || error?<p className={error?"red":"aqua"} style={{marginBlock:0}}>{acierto?`Cliente ${editar?"editado":"añadido"} con éxito`:`ERROR: Nombre repetido`}</p>:null}
        </div>
    )
}