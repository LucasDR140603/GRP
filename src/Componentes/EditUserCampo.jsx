import { useEffect,useState } from "react"
import api from "../Api"
import { vacio,comprobar, comprobar_telefono } from "../Funciones"
export default function({title="",campos=[],valores=[]}){
    const [datos,setDatos]=useState(valores)
    const [acierto,setAcierto]=useState(false)
    const [error,setError]=useState(false)
    const [mensaje,setMensaje]=useState('')
    const handleChange=(index,value)=>{
        setAcierto(false)
        setError(false)
        setMensaje('')
        const nuevos=[...datos]
        nuevos[index]=value
        setDatos(nuevos)
    }
    const enviar=async()=>{
        let e=false
        let m=''
        if (title=='Contraseña'){
            if (datos[0]!=datos[1]){
                e=true
                m='Las contraseñas no coinciden'
            }
            else if(!comprobar(datos[0])){
                e=true
                m='La contraseña debe tener como mínimo 8 caracteres, sin espacios, una mayúscula, una minúscula, un nº y un símbolo'
            }
        }
        else{
            for (let i in campos){
                if (title!='Contraseña' || i==0){
                    await api.put(`Usuarios/${title=='Contraseña'?'Clave':campos[i].replaceAll(' ','')}`,{valor:datos[i]}).catch((error)=>{
                        e=true
                    })
                }
            }
        }
        setError(e)
        if (!e){
            setAcierto(true)
        }
        setMensaje(m==''?`${title} ${e?'repetido':'editado con éxito'}`:m)
    }
}