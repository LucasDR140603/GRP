import Password from "./Password.tsx";
import { useState,useEffect, useRef } from "react";
import { useData } from "../DataContext.tsx";
import Input from "./Input.tsx";
import Cookies from 'js-cookie'
import Close from "./Close.tsx";
import { ThreeDots } from "react-loader-spinner";
import api from "../Api.tsx";
import { comprobar } from "../Funciones.tsx";
import {useTimer} from 'react-timer-hook'
import Turnstile from "react-turnstile";
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
export default function(){
    const {init}=useData()
    const [user,setUser]=useState("")
    const [clave,setClave]=useState("")
    const [clave_repe,setClaveRepe]=useState("")
    const [error,setError]=useState(false)
    const [mensaje,setMensaje]=useState("")
    const [recuperar,setRecuperar]=useState(false)
    const [encontrado,setEncontrado]=useState(false)
    const [token,setToken]=useState(false)
    const [captcha,setCaptcha]=useState(null)
    const [codigo,setCodigo]=useState("")
    const [codigo_correcto,setCodigoCorrecto]=useState(false)
    const [cargando,setCargando]=useState(false)
    const inputRefs=useRef<any>([])
    const ventana=useRef<any>(null)
    const tiempo=()=>{
        const t=new Date();
        t.setSeconds(t.getSeconds()+900);
        return t
    }
    const {seconds,minutes,start,restart}=useTimer({
        autoStart:false,
        onExpire:()=>{
            setEncontrado(false);
            restart(tiempo(),false)
        },
        expiryTimestamp:tiempo()
    })
    const loguear=()=>init({user:user,clave:clave}).then((res:any)=>{
        if (Cookies.get('token')==null){
            setError(true)
        }
    })
    useEffect(()=>{
        const handleKeyDown=(e:any)=>{
            if (['ArrowDown','ArrowUp'].includes(e.key)){
                inputRefs.current.find((x:any)=>x!=document.activeElement).focus()
            }
        }
        window.addEventListener('keydown',handleKeyDown)
        return()=>{
            window.removeEventListener('keydown',handleKeyDown)
        }
    },[])
    useEffect(()=>{
        if (encontrado){
            start()
        }
    },[encontrado])
    useEffect(()=>{
        setError(false)
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter"){
                if (recuperar){
                    if (codigo_correcto){
                        cambiar()
                    }
                    else if (encontrado){
                        verificar_codigo()
                    }
                    else{
                        buscar()
                    }
                }
                else{
                    loguear()
                }
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return()=>{
            window.removeEventListener("keydown",handleKeyDown)
        }
    },[user,clave,clave_repe,recuperar,encontrado,codigo_correcto,token,codigo])
    useEffect(()=>{
        if (recuperar){
            ventana.current.showModal()
        }
        else{
            ventana.current.close()
        }
        restart(tiempo())
        setEncontrado(false)
        setUser("")
        setClave("")
        setClaveRepe("")
        setCodigo("")
        setCodigoCorrecto(false)
        setCargando(false)
        setError(false)
        setMensaje("")
    },[recuperar])
    const buscar=()=>{
        setCargando(true)
        api.post(`recuperar`,{user:user}).then((res)=>{
            setToken(res.data.token)
            setEncontrado(true)
        }).catch((error)=>{
            setError(true)
            setMensaje("Usuario no encontrado")
        }).finally(()=>{
            setCargando(false)
        })
    }
    const verificar_codigo=()=>{
        setCargando(true)
        api.post('comprobar',{codigo:codigo,captchaToken:captcha},{headers:{"Authorization":`Bearer ${token}`}}).then((res)=>{
            setToken(res.data.token)
            setCodigoCorrecto(true)
        }).catch((error)=>{
            alert(error.toString())
            setError(true)
            setMensaje("Código incorrecto")
        }).finally(()=>{
            setCargando(false)
        })
    }
    const cambiar=()=>{
        if (clave==clave_repe){
            if (comprobar(clave)){
                init({clave:clave},"cambiarclave", {headers:{"Authorization":`Bearer ${token}`}}).then((res:any)=>{
                    if (Cookies.get('token')==null){
                        setError(true)
                        setMensaje("Contraseña ya usada o no hay conexión")
                    }
                })
            }
            else{
                setError(true)
                setMensaje("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un nº y un símbolo")
            }
        }
        else{
            setError(true)
            setMensaje("Las contraseñas no coinciden")
        }
    }
    return (
        <div className="component">
            <div className="form-page">
                <h1>INICIAR SESIÓN</h1>
                <div className="form">
                    <TextField ref={(el:any) => (inputRefs.current[0] = el)} style={{width:'100%'}} label='Nick o Email' error={error} onChange={(e)=>{setUser(e.target.value)}}/>
                    <Password label="Contraseña" onChange={(e)=>{setClave(e.target.value)}} error={error}/>
                    <Button variant="outlined" onClick={()=>{loguear()}}>Iniciar Sesión</Button>
                    <a onClick={()=>{setRecuperar(true)}}>¿Contraseña olvidada?</a>
                </div>
            </div>
            <div>
            </div>
            <dialog ref={ventana} onClose={()=>{setRecuperar(false)}}>
                <Close onClick={()=>{setRecuperar(false)}} absolute={true}/>
                <div className="column">
                    {!encontrado?
                    <>
                        <h1>RECUPERAR CUENTA</h1>
                        <input className={error?"error":""} type="text" onChange={(e)=>{setError(false);setUser(e.target.value)}} placeholder="Nick o Email"/>
                        <a className="btn" onClick={buscar}>{cargando?<div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>Buscando {<ThreeDots width={"20"} height={"10"}/>}</div>:"Buscar Usuario"}</a>
                    </>
                    :!codigo_correcto?
                    <>
                        <h1 style={{marginBottom:0,marginTop:'3rem',lineHeight:0}}>CÓDIGO DE RECUPERACIÓN</h1>
                        <h1 style={{lineHeight:0,marginBottom:'0.5rem'}}>{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}</h1>
                        <input className={error?"error":""} value={codigo} type="text" maxLength={4} onChange={(e)=>{setError(false);setCodigo(e.target.value)}} placeholder="Código de Recuperación"/>
                        <a className="btn" onClick={verificar_codigo}>{cargando?<div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>Comprobando {<ThreeDots width={"20"} height={"10"}/>}</div>:"Enviar"}</a>
                    </>
                    :<>
                        <h1>CAMBIAR CONTRASEÑA</h1>
                        <Input type="password" onChange={setClave} className={error?"red":""} label="Contraseña Nueva"/>
                        <Input type="password" onChange={setClaveRepe} className={error?"red":""} label="Repetir Contraseña"/>
                        <a className="btn" onClick={cambiar}>Enviar</a>
                    </>}
                    {error?<p className="red">{mensaje}</p>:""}
                </div>
            </dialog>
        </div>
    )
}