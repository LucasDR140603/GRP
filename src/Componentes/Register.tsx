import { useState,useEffect, useRef } from "react"
import { useData } from "../DataContext.tsx"
import Input from "./Input.tsx"
import { vacio,comprobar, comprobar_telefono } from "../Funciones.tsx"
import Cookies from 'js-cookie'
import ReactFlagsSelect from 'react-flags-select'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
export default function(){
    const {init}=useData()
    const [pais,setPais]=useState("ES")
    const [nombre,setNombre]=useState("")
    const [ape1,setApe1]=useState("")
    const [ape2,setApe2]=useState("")
    const [nick,setNick]=useState("")
    const [clave,setClave]=useState("")
    const [clave_repe,setClaveRepe]=useState("")
    const [email,setEmail]=useState("")
    const [telefono,setTelefono]=useState("")
    const [clave_registro,setClaveRegistro]=useState("")
    const campos=[nombre,ape1,ape2,nick,clave,clave_repe,email,telefono,clave_registro]
    const sets=[setNombre,setApe1,setApe2,setNick,setClave,setClaveRepe,setEmail,setTelefono,setClaveRegistro]
    const labels=["Nombre","1º Apellido","2º Apellido","Nick","Contraseña","Repetir Contraseña","Email","Teléfono","Contraseña de Registro"]
    const [error,setError]=useState(false)
    const [mensaje,setMensaje]=useState("")
    const inputRefs=useRef<any[]>([])
    useEffect(()=>{
        const handleKeyDown=(e:any)=>{
            if (document.activeElement!=null){
                if (['ArrowDown','ArrowUp'].includes(e.key)){
                    let abajo=e.key=='ArrowDown'
                    let indice_actual=inputRefs.current.indexOf(document.activeElement)
                    let ultimo=campos.length-1
                    let sumador=abajo?indice_actual==ultimo?-indice_actual:1:indice_actual==0?ultimo:-1
                    inputRefs.current[indice_actual+sumador].focus()
                }
            }
        }
        window.addEventListener('keydown',handleKeyDown)
        return()=>{
            window.removeEventListener('keydown',handleKeyDown)
        }
    },[])
    useEffect(()=>{
        setError(false)
        setMensaje("")
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter"){
                registrar()
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return()=>{
            window.removeEventListener("keydown",handleKeyDown)
        }
    },[nombre,ape1,ape2,nick,clave,clave_repe,email,telefono,clave_registro])
    const registrar=()=>{
        if (vacio(nombre) || vacio(ape1) || vacio(ape2) || vacio(nick) || !comprobar(clave) || clave!=clave_repe || vacio(email) || !comprobar_telefono(telefono) || clave_registro!=process.env.REACT_APP_REGISTER_KEY){
            setError(true)
            if (vacio(nombre) || vacio(ape1) || vacio(ape2) || vacio(nick) || vacio(clave_registro)){
                setMensaje("Faltan campos")
            }
            else if (!comprobar(clave)){
                setMensaje("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un nº y un símbolo")
            }
            else if (clave!=clave_repe){
                setMensaje("Las contraseñas no coinciden")
            }
            else if (!comprobar_telefono(telefono)){
                setMensaje("El teléfono debe tener 9 números")
            }
            else if (clave_registro!=process.env.REACT_APP_REGISTER_KEY){
                setMensaje("Contraseña de registro incorrecta")
            }
        }
        else{
            let nuevo={
                nombre:nombre,
                apellido1:ape1,
                apellido2:ape2,
                nick:nick,
                clave:clave,
                email:email,
                telefono:telefono,
                pais:pais
            }
            init(nuevo,"register",{headers:{"X-register-key":clave_registro}}).then((res:any)=>{
                if (Cookies.get('token')==null){
                    setError(true)
                    setMensaje(res)
                }
            })
        }
    }
    return (
        <div className="form-page">
            <h1>REGISTRAR</h1>
            <div className="form">
                {/* <TextField onChange={(e)=>{sets[0](e.target.value)}} label={labels[0]}/>
                <TextField onChange={(e)=>{sets[1](e.target.value)}} label={labels[1]}/>
                <TextField onChange={(e)=>{sets[2](e.target.value)}} label={labels[2]}/>
                <TextField onChange={(e)=>{sets[3](e.target.value)}} label={labels[3]}/> */}
                {campos.map((x,i)=>{
                    return <div style={{display:'flex',gap:'0.25rem',alignItems:'center',width:'100%'}}>
                        {i==7?<ReactFlagsSelect className="banderas" searchable={true} selected={pais} onSelect={setPais}/>:null}
                        <Input ref={(el:any)=>(inputRefs.current[i]=el)} style={{width:'100%',height:'100%'}} type={[4,5,8].includes(i)?"password":i==7?"tel":"text"} error={(i==5 && clave!=clave_repe) || (error && ((mensaje.includes("repetidos")) || (i==4 && (!comprobar(clave) || mensaje.includes("Contraseña"))) || (i==8 && clave_registro!=process.env.REACT_APP_REGISTER_KEY)))} value={x} onChange={(e)=>{sets[i](e.target.value)}} label={labels[i]}/>
                    </div>
                })}
                <Button variant="outlined" onClick={()=>{registrar()}}>Registrar</Button>
                {error?<p className="red">{mensaje}</p>:null}
            </div>
        </div>
    )
}