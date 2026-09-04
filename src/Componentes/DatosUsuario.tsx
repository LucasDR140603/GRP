import { useData } from "../DataContext.tsx"
import Perfil from "./Perfil.tsx"
import {MdMail,MdPhone,MdVerified} from 'react-icons/md'
import Close from './Close.tsx'
import { useState,useEffect } from 'react'
import {parsePhoneNumberFromString,getCountryCallingCode} from 'libphonenumber-js'
import api from "../Api.tsx"
import Input from "./Input.tsx"
import { comprobar, sin_acentos, vacio } from "../Funciones.tsx"
import ReactFlagsSelect from 'react-flags-select'
export default function(){
    const {usuario}=useData()
    const [edicion,setEdicion]=useState<string | null>(null)
    const [nuevo,setNuevo]=useState<any>(null)
    const [error,setError]=useState(false)
    const [acierto,setAcierto]=useState(false)
    const [mensaje,setMensaje]=useState('')
    const Editar=(campo:string)=>{
        let c=sin_acentos(campo.toLowerCase())
        let campos=[...(c=="nombre completo"?["nombre","apellido1","apellido2"]:c=="contraseña"?["clave","clave_repe"]:c=="telefono"?["pais","telefono"]:[c])]
        return <div className="ventana-emergente" style={{height:c=="telefono"?'330px':'auto'}}>
            <Close absolute={true} onClick={()=>{setEdicion(null)}}/>
            <h1>EDITAR {campo.toUpperCase()}</h1>
            <div style={{display:'flex',flexDirection:c=="telefono"?'row':'column',gap:'0.5rem'}}>
            {campos.map((x,i)=>{
                return x=="pais"?<ReactFlagsSelect className="banderas" searchable={true} selected={nuevo.pais} onSelect={(e)=>{setNuevo({...nuevo,pais:e})}}/>:<Input value={nuevo[x]} type={x=="telefono"?"tel":x.includes("clave")?"password":"text"} onChange={(e)=>{setNuevo({...nuevo,[x]:e})}} placeholder={c=="contraseña"?i==0?"Contraseña":"Repetir contraseña":x}/>
            })}
            </div>
            <a style={{margin:'0rem auto',marginTop:'0.75rem',}} className="btn" onClick={()=>{
                let n={...nuevo,telefono:`+${getCountryCallingCode('ES')}${nuevo.telefono}`}
                let e=false
                if (c=="contraseña"){
                    if (vacio(n[campos[0]]) || n[campos[0]]!=n[campos[1]] || !comprobar(n[campos[0]])){
                        e=true
                        setError(true)
                        if (vacio(n[campos[0]])){
                            setMensaje("Contraseña vacía")
                        }
                        else if (n[campos[0]]!=n[campos[1]]){
                            setMensaje("Las contraseñas no coinciden")
                        }
                        else{
                            setMensaje("La contraseña debe tener como mínimo 8 caracteres, una mayúscula, una minúscula, un nº y un símbolo")
                        }
                    }
                }
                else{
                    if (c=="telefono"){
                        if (nuevo["telefono"].length<9){
                            e=true
                            setError(true)
                            setMensaje("El teléfono debe tener 9 dígitos")
                        }
                    }
                    delete n.clave
                }
                if (!e){
                    api.put('usuarios',n).then((res)=>{
                        setAcierto(true)
                        setMensaje(`${campo} editad${c=="contraseña"?"a":"o"} con éxito`)
                    }).catch((error)=>{
                        setMensaje("Campo repetido")
                        setError(true)
                    })
                }
            }}>Confirmar</a>
            {error || acierto?<p className={error?'red':'aqua'} style={{marginBottom:'0',textAlign:'center'}}>{mensaje}</p>:null}
        </div>
    }
    useEffect(()=>{
        if (edicion==null){
            setNuevo({...usuario,clave:"",clave_repe:"",telefono:usuario.telefono.slice(-9),pais:`${parsePhoneNumberFromString(usuario.telefono)!.country}`})
        }
    },[edicion])
    useEffect(()=>{
        setError(false)
        setAcierto(false)
        setMensaje('')
    },[nuevo])
    return (
        <div className="component">
            <h1>DATOS DE USUARIO</h1>
            <div className="column">
                <Perfil usuario={usuario} size={192}/>
                <input type="file" accept="image/*" onChange={(e:any)=>{
                    const file=e.target.files[0]
                    if (!file) return;
                    const formData=new FormData()
                    formData.append("foto",file)
                    api.put('usuarios/perfil',formData)
                }}/>
                <table className="datos-usuario">
                    <tr><td>Nick</td><td>{usuario.nick}</td><td><a className="btn" onClick={()=>{setEdicion("Nick")}}>Editar</a></td></tr>
                    <tr><td>Nombre completo</td><td>{usuario.nombre} {usuario.apellido1} {usuario.apellido2}</td><td><a className="btn" onClick={()=>{setEdicion("Nombre completo")}}>Editar</a></td></tr>
                    <tr><td><MdMail/> Email</td><td>{usuario.email}</td><td><a className="btn" onClick={()=>{setEdicion("Email")}}>Editar</a></td></tr>
                    <tr><td><MdPhone/> Teléfono</td><td>{usuario.telefono}</td><td><a className="btn" onClick={()=>{setEdicion("Teléfono")}}>Editar</a></td></tr>
                    <tr><td><MdVerified/> Administrador</td><td colSpan={2}>{usuario.administrador?"Sí":"No"}</td></tr>
                </table>
                <a className="btn" onClick={()=>{setEdicion("Contraseña")}}>Cambiar Contraseña</a>
            </div>
            {edicion!=null?Editar(edicion):null}
        </div>
    )
}