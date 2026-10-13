import Password from "./Password.tsx";
import { useState,useEffect, useRef } from "react";
import { useData } from "../DataContext.tsx";
import Input from "./Input.tsx";
import Cookies from 'js-cookie'
import { ThreeDots } from "react-loader-spinner";
import api from "../Api.tsx";
import { comprobar } from "../Funciones.tsx";
import {useTimer} from 'react-timer-hook'
import Turnstile from "react-turnstile";
import {TextField,Dialog,DialogTitle,DialogContent,IconButton,Button} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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
    const [abierto,setAbierto]=useState(false)
    // const ventana=useRef<any>(null)
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
            // ventana.current.showModal()
            // setAbierto(true)
        }
        else{
            // ventana.current.close()
            // setAbierto(false)
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
                    <TextField inputRef={(el:any) => (inputRefs.current[0] = el)} style={{width:'100%'}} label='Nick o Email' error={error} onChange={(e)=>{setUser(e.target.value)}}/>
                    <Password ref={(el:any) => (inputRefs.current[1] = el)} label="Contraseña" onChange={(e)=>{setClave(e.target.value)}} error={error}/>
                    <Button variant="outlined" onClick={()=>{loguear()}}>Iniciar Sesión</Button>
                    <a onClick={()=>{setRecuperar(true)}}>¿Contraseña olvidada?</a>
                </div>
            </div>
            <div>
            </div>
            <Dialog open={recuperar} onClose={(event,reason)=>{
                if (reason && reason=='backdropClick'){
                    return;
                }
                setRecuperar(false)}} aria-labelledby="customized-dialog-title">
                <DialogTitle sx={{m:0,paddingBlock:0,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}} id='customized-dialog-title'>
                    <p>{!encontrado?"RECUPERAR CUENTA":!codigo_correcto?"CÓDIGO DE RECUPERACIÓN":"CAMBIAR CONTRASEÑA"}</p>
                    <IconButton onClick={(e)=>{setRecuperar(false)}} sx={{width:'fit-content'}}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers={true}>
                    <div className="column">
                        {!encontrado?
                        <>
                            {/* <h1>RECUPERAR CUENTA</h1> */}
                            <TextField error={error} onChange={(e)=>{setError(false);setUser(e.target.value)}} label="Nick o Email"/>
                            <Button variant='outlined' onClick={buscar}>{cargando?<div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>Buscando {<ThreeDots width={"20"} height={"10"}/>}</div>:"Buscar Usuario"}</Button>
                        </>
                        :!codigo_correcto?
                        <>
                            {/* <h1 style={{marginBottom:0,marginTop:'3rem',lineHeight:0}}>CÓDIGO DE RECUPERACIÓN</h1> */}
                            <h1 style={{lineHeight:0,marginBottom:'0.5rem'}}>{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}</h1>
                            <TextField error={error} value={codigo} type="text" onChange={(e)=>{setError(false);setCodigo(e.target.value)}} label="Código de Recuperación"/>
                            <Button variant='outlined' onClick={verificar_codigo}>{cargando?<div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>Comprobando {<ThreeDots width={"20"} height={"10"}/>}</div>:"Enviar"}</Button>
                        </>
                        :<>
                            {/* <h1>CAMBIAR CONTRASEÑA</h1> */}
                            <Password onChange={(e)=>{setClave(e.target.value)}} error={error} label="Contraseña Nueva"/>
                            <Password onChange={(e)=>{setClaveRepe(e.target.value)}} error={error} label="Repetir Contraseña"/>
                            <Button variant='outlined' onClick={cambiar}>Enviar</Button>
                        </>}
                        {error?<p className="red">{mensaje}</p>:""}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}