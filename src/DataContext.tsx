import {createContext,useState,useEffect, useContext,useRef} from "react"
import Cookies from 'js-cookie'
import api from "./Api.tsx"
import { connect,getSocket,disconnect } from "./Socket.tsx"
import { fechaSQL } from "./Funciones.tsx"
import { Socket } from "socket.io-client"
const DataContext=createContext(undefined)
type elemento=Record<string,any>
type objeto=elemento | null
export const DataProvider=({children}:any)=>{
    const prevuser=useRef<objeto>(null)
    const [cargando,setCargando]=useState<boolean>(true)
    const [usuario,setUsuario]=useState<objeto>(null)
    const [clientes,setClientes]=useState<elemento[]>([])
    const [centros,setCentros]=useState<elemento[]>([])
    const [proyectos,setProyectos]=useState<elemento[]>([])
    const [registros,setRegistros]=useState<elemento[]>([])
    const [usuarios,setUsuarios]=useState<elemento[]>([])
    const sets=[setClientes,setCentros,setProyectos,setUsuarios,setRegistros]
    const acciones=Array('insert','update','delete')
    const tablas=Array('clientes','centros','proyectos','usuarios','registros')
    const [socket,setSocket]=useState<Socket | null>(null)
    const getClienteByCentro:elemento=useRef<(o:elemento)=>elemento>(null)
    const getCentroByProyecto:elemento=useRef<(o:elemento)=>elemento>(null)
    const getClienteByProyecto:elemento=useRef<(o:elemento)=>elemento>(null)
    const clientes_abiertos:elemento[]=clientes.filter((x)=>x.abierto)
    const centros_abiertos:elemento[]=centros.filter((x)=>x.abierto)
    const proyectos_abiertos:elemento[]=proyectos.filter((x)=>x.fin==null)
    const clientes_con_centro:elemento[]=clientes.filter((x)=>centros_abiertos.find((y)=>x.id==y.id_cliente)!=null)
    const clientes_con_proyecto:elemento[]=clientes.filter((x)=>centros.find((y)=>x.id==y.id_cliente && proyectos_abiertos.find((z)=>y.id==z.id_centro)!=null)!=null)
    const centros_con_proyecto:elemento[]=centros.filter((x)=>proyectos_abiertos.find((y)=>x.id==y.id_centro)!=null)
    const init=async(x:elemento,accion:string='login',config={})=>{
        setCargando(true)
        try{
            const {token,refreshToken,usuario}=(await api.post(accion,x,config)).data
            Cookies.set("token",token,{expires:1})
            Cookies.set("refreshToken",refreshToken,{expires:7})
            connect()
            setSocket(getSocket())
            setUsuario(usuario)
        }
        catch(err:any){
            setCargando(false)
            return err.response.data
        }
    }
    useEffect(()=>{
        const refreshToken=Cookies.get("refreshToken")
        if (refreshToken!=undefined){
            api.post('refresh',{refreshToken:Cookies.get("refreshToken")}).then((res)=>{
                Cookies.set('token',res.data.token,{expires:1})
                connect()
                setSocket(getSocket())
                api.post('usuario').then((res)=>{
                    setUsuario(res.data)
                })
            }).catch((err)=>{
                Cookies.remove("token")
                Cookies.remove("refreshToken")
                setCargando(false)
            })
        }
        else{
            setCargando(false)
        }
    },[])
    useEffect(()=>{
        getClienteByCentro.current=(x:elemento)=>{
            return clientes.find(y => y.id === x.id_cliente)!
        }
        getClienteByProyecto.current=(x:elemento)=>{
            return getClienteByCentro.current!(getCentroByProyecto.current!(x))
        }
    },[clientes])
    useEffect(()=>{
        getCentroByProyecto.current=(x:elemento)=>{
            return centros.find(y => y.id === x.id_centro)!
        }
    },[centros])
    useEffect(()=>{
        if (!usuario){
            return
        }
        const cargar=async()=>{
            setClientes((await api.get('clientes/abierto-cerrado')).data)
            setCentros((await api.get('centros/abierto-cerrado')).data)
            setProyectos((await api.get('proyectos/orden-cc/abierto-cerrado')).data)
            setUsuarios((await api.get('usuarios/abierto-cerrado')).data)
            setRegistros((await api.get('registros/ccpu')).data)
            acciones.forEach((accion,i)=>{
                tablas.forEach((tabla,j)=>{
                    socket!.on(`${accion}-${tabla}`,(data:elemento)=>{
                        let nombre_objeto=tabla.substring(0,tabla.length-1)
                        sets[j](prev=>{
                            let lista=[...(i<2?[data]:[]), ...prev.filter((x)=>x.id!=data.id)]
                            if (i<2){
                                function abierto(o:elemento){
                                    return [2,4].includes(j)?o.fin==null:j==3?o.operativo:o.abierto
                                }
                                if ([2,3].includes(j)){
                                    if (i==1 && abierto(data) && prev.filter((x)=>!abierto(x) && x.id==data.id).length>0){
                                        api.get(`${tabla}/${data.id}/registros/ccpu`).then((res)=>{
                                            setRegistros(prev=>{
                                                return [...res.data,...prev].sort((x,y)=>fechaSQL(y.inicio).localeCompare(fechaSQL(x.inicio)))
                                            })
                                        })
                                    }
                                    else if(!abierto(data)){
                                        setRegistros(prev=>{
                                            let lista=prev.filter((x)=>x[`id_${nombre_objeto}`]!=data.id)
                                            return lista
                                        })
                                    }
                                }
                                if (i==1 && j<4){
                                    let campo=j==3?'nick':'nombre'
                                    if (prev.filter((x)=>x[campo]!=data[campo] && x.id==data.id).length>0){
                                        setRegistros(prev=>{
                                            let lista=prev.map((x)=>{
                                                if (x[`id_${nombre_objeto}`]==data.id){
                                                    x[nombre_objeto]=data[campo]
                                                }
                                                return x
                                            })
                                            return lista
                                        })
                                    }
                                }
                                lista.sort((x,y)=>{
                                    let campo=j<3?'nombre':j==3?'nick':'inicio'
                                    let orden=campo=='inicio'?-1:1
                                    function formatear(x:elemento){
                                        return (campo=='inicio'?fechaSQL(x[campo]):x[campo]).toLowerCase()
                                    }
                                    return formatear(x).localeCompare(formatear(y))*orden
                                })
                                if (j==1){
                                    lista.sort((x,y)=>getClienteByCentro.current(x).nombre.toLowerCase().localeCompare(getClienteByCentro.current(y).nombre.toLowerCase()))
                                }
                                else if (j==2){
                                    lista.sort((x,y)=>getCentroByProyecto.current(x).nombre.toLowerCase().localeCompare(getCentroByProyecto.current(y).nombre.toLowerCase()))
                                    lista.sort((x,y)=>getClienteByProyecto.current(x).nombre.toLowerCase().localeCompare(getClienteByProyecto.current(y).nombre.toLowerCase()))
                                }
                                if (j<2 && i==1){
                                    let get=(x:elemento):elemento=>{
                                        return lista.find(y=>y.id==x[`id_${nombre_objeto}`])!
                                    }
                                    const gets=[get,getClienteByProyecto.current]
                                    sets[j+1](prev=>{
                                        let lista=prev
                                        lista.sort((x,y)=>x.nombre.toLowerCase().localeCompare(y.nombre.toLowerCase()))
                                        for (let k=0;k<=j;k++){
                                            lista.sort((x,y)=>gets[k](x).nombre.toLowerCase().localeCompare(gets[k](y).nombre.toLowerCase()))
                                        }
                                        return lista
                                    })
                                    if (j==0){
                                        let getCliente=(x:elemento)=>{
                                            return get(getCentroByProyecto.current(x))
                                        }
                                        sets[j+2](prev=>{
                                            let lista=prev
                                            lista.sort((x,y)=>x.nombre.toLowerCase().localeCompare(y.nombre.toLowerCase()))
                                            lista.sort((x,y)=>getCentroByProyecto.current(x).nombre.toLowerCase().localeCompare(getCentroByProyecto.current(y).nombre.toLowerCase()))
                                            lista.sort((x,y)=>getCliente(x).nombre.toLowerCase().localeCompare(getCliente(y).nombre.toLowerCase()))
                                            return lista
                                        })
                                    }
                                }
                            }
                            return lista
                        })
                    })
                })
            })
            setCargando(false)
        }
        if (prevuser.current==null && usuario!=null){
            cargar()
        }
        prevuser.current=usuario
        return () => {
            prevuser.current=null
            disconnect()
            setClientes([])
            setCentros([])
            setProyectos([])
            setUsuarios([])
            setRegistros([])
            setSocket(null)
        }
    },[usuario?.id])
    useEffect(()=>{
        if (usuario!=null){
            if (usuarios.filter((x)=>x.id==usuario.id && x.operativo).length==0 && !cargando){
                logout()
            }
            else{
                setUsuario(usuarios.filter((x)=>x.id==usuario.id)[0])
            }
        }
    },[usuarios,cargando])
    useEffect(()=>{
        if (usuario!=null){
            api.get(`registros/ccpu`).then((res)=>{
                setRegistros(res.data)
            })
            api.get('usuarios').then((res)=>{
                setUsuarios(res.data)
            })
        }
    },[usuario?.administrador])
    const logout=()=>{
        setUsuario(null)
        Cookies.remove("token")
        Cookies.remove("refreshToken")
        setCargando(false)
    }
    const value:any={
        init,clientes_abiertos,centros_abiertos,proyectos_abiertos,clientes_con_centro,clientes_con_proyecto,centros_con_proyecto,getClienteByCentro,getClienteByProyecto,getCentroByProyecto,prevuser,cargando,usuario,usuarios,setUsuario,clientes,centros,proyectos,registros,logout
    }
    return(
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}
export const useData:any=()=>useContext(DataContext)