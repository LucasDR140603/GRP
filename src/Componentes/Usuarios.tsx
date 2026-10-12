import { useData } from "../DataContext.tsx"
import Perfil from "./Perfil.tsx"
import api from "../Api.tsx"
import Close from "./Close.tsx"
import { useEffect,useState,useRef } from "react"
import { HiArrowLongDown,HiArrowLongUp } from "react-icons/hi2"
import { sin_acentos } from "../Funciones.tsx"
import {TableContainer,Table,TableHead as Thead,TableBody as Tbody,TableRow as Tr,TableCell as Td,TableSortLabel,Paper,Checkbox,FormControlLabel,TextField,Button,IconButton,Dialog,DialogTitle,DialogContent} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
export default function(){
    const {usuarios,usuario}=useData()
    const columnas=["Perfil","Nick","Nombre","1º Apellido","2º Apellido","Email","Teléfono","Administrador","Operativo"]
    const [orden,setOrden]=useState<string | null>(null)
    const [sentido,setSentido]=useState<number | null>(null)
    const [abiertos,setAbiertos]=useState(true)
    const [cerrados,setCerrados]=useState(true)
    const [busqueda,setBusqueda]=useState("")
    const [seleccion,setSeleccion]=useState<Record<string,any> | null>(null)
    const [accion,setAccion]=useState("")
    const acciones=["hacer administrador","Dar de ","Eliminar"]
    const [confirmacion,setConfirmacion]=useState(false)
    const [abierto,setAbierto]=useState(false)
    useEffect(()=>{
        setAccion("")
        setConfirmacion(false)
        if (seleccion!=null){
            setAbierto(true)
        }
        else{
            setAbierto(false)
        }
    },[seleccion])
    const mostrables:any[]=usuarios.filter((x:any)=>{
        let sin_perfil={...x}
        delete sin_perfil.perfil
        return Object.values(sin_perfil).map((y)=>y==true?"sí":y==false?"no":`${y}`).find((y)=>sin_acentos(y.toLowerCase()).includes(sin_acentos(busqueda.toLowerCase())))!=null &&  ((!x.operativo && cerrados) || (x.operativo && abiertos))
    })
    const ordenados=()=>{
        let lista=mostrables
        if (orden!=null && sentido!=null){
            lista.sort((x,y)=>{
                    let campo=orden
                    function format(o:any){
                        let indice_columna=columnas.map((z)=>sin_acentos(z.toLowerCase())).indexOf(orden!)
                        let valor=o[indice_columna==columnas.length-1?'operativo':campo]
                        if (typeof(valor)==typeof("texto")){
                            valor=valor.toLowerCase()
                        }
                        else{
                            valor=valor?"1":"2"
                        }
                        return valor
                    }
                    return (format(x).localeCompare(format(y)))*sentido
                })
        }
        return lista
    }
    useEffect(()=>{
        if (acciones.includes(accion)){
            if (accion!=acciones[2]){
                let campo=accion==acciones[0]?"administrador":"operativo"
                let nuevo={...seleccion,
                    [campo]:!seleccion![campo]
                }
                api.put(`usuarios`,nuevo).then((res)=>{
                    setSeleccion(null)
                })
            }
            else if (confirmacion){
                api.delete(`usuarios/${seleccion!.id}`).then((res)=>{
                    setSeleccion(null)
                })
            }
        }
    },[accion,confirmacion])
    useEffect(()=>{
        if (seleccion!=null && seleccion.id!=null && mostrables.find((x)=>x.id==seleccion.id)==null){
            setSeleccion(null)
        }
    })
    useEffect(()=>{
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter" && accion==acciones[2]){
                setConfirmacion(true)
            }
        }
        window.addEventListener('keydown',handleKeyDown)
        return()=>{
            window.removeEventListener('keydown',handleKeyDown)
        }
    },[accion])
    const opciones=()=>{
        if (seleccion!=null && seleccion.id!=null && mostrables.find((x)=>x.id==seleccion.id)==null){
            setSeleccion(null)
        }
        return seleccion!=null?
            <div className="ventana-emergente" style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                {acciones.map((x,i)=>{
                    let texto=(i==0 && seleccion.administrador?"Des":"")+x+(i==1?seleccion.operativo?"baja":"alta":"")
                    return <a className="btn" onClick={()=>{setAccion(x)}}>{texto.charAt(0).toUpperCase()+texto.slice(1)}</a>
                })}
                <Close onClick={()=>{setSeleccion(null)}}/>
            </div>
            :null
    }
    const confirmar=()=>{
        return accion==acciones[2]?
        <div className="ventana-emergente">
            <Close onClick={()=>{setAccion("")}} absolute={true}/>
            <h1 style={{marginBlock:0}}>ALERTA</h1>
            <p>Va a eliminar un usuario y con él sus registros. Acción irreversible</p>
            <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
        </div>
        :null
    }
    return (
        <div className="component">
            <h1>USUARIOS</h1>
            <div className="options">
                <div><FormControlLabel control={<Checkbox/>} checked={abiertos} onChange={(e)=>{setAbiertos(!abiertos)}} label={"Abiertos"}/><FormControlLabel control={<Checkbox/>} checked={cerrados} onChange={(e)=>{setCerrados(!cerrados)}} label={"Cerrados"}/></div>
                <TextField label="Buscar..." onChange={(e)=>{setBusqueda(e.target.value)}}/>
            </div>
            <br/>
            <TableContainer component={Paper} sx={{width:'fit-content',maxWidth:'90%',margin:'0 auto'}}>
                <Table stickyHeader>
                    <Thead>
                        <Tr>
                            {columnas.map((x,i)=>{
                                let v=sin_acentos(x.toLowerCase())
                                if (v.includes("apellido")){
                                    v=v.split(' ').toReversed().reduce((x:string,y:string)=>x+y).slice(0,-1)
                                }
                                return <Td component={'th'} sortDirection={orden==v?sentido==1?'asc':'desc':false}>
                                    <div style={{display:'flex'}}>
                                        <TableSortLabel active={orden==v && sentido!=null} direction={sentido==-1?'desc':'asc'} onClick={()=>{
                                            orden==v?setSentido((sentido==null?1:sentido)*-1):setSentido(1);setOrden(v)
                                        }}>
                                            <a onClick={(e)=>{e.stopPropagation();setSentido(1);setOrden((prev)=>{
                                                return prev==v?null:v
                                            })}}>{x}</a>
                                        </TableSortLabel>
                                    </div>
                                </Td>
                            })}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {ordenados().map((x)=><Tr hover={true} selected={x.id==seleccion?.id} sx={{cursor:'pointer'}} className={x.id==usuario.id?'gold':!x.operativo?'aqua':''} onClick={()=>{setSeleccion(seleccion==null && x.id!=usuario.id?x:null)}}><Td style={{lineHeight:0}}><Perfil usuario={x}/></Td><Td>{x.nick}</Td><Td>{x.nombre}</Td><Td>{x.apellido1}</Td><Td>{x.apellido2}</Td><Td>{x.email}</Td><Td>{x.telefono}</Td><Td>{x.administrador?"Sí":"No"}</Td><Td>{x.operativo?"Sí":"No"}</Td></Tr>)}
                    </Tbody>
                </Table>
            </TableContainer>
            {/* <div className="table-container">
                <table>
                    <thead>
                        <tr>{columnas.map((x,i)=>{
                            let v=sin_acentos(x.toLowerCase())
                            if (v.includes("apellido")){
                                v=v.split(' ').toReversed().reduce((x:string,y:string)=>x+y).slice(0,-1)
                            }
                            return <td className={orden==v?"gold":""} style={{borderCollapse:'collapse'}}><div><a onClick={()=>{setSentido(1);setOrden(prev=>{
                                return prev==v?null:v
                            })}}>Ordenar</a>{orden==v?<a onClick={()=>{setSentido((sentido!=null?sentido:1)*-1)}}>{sentido==-1?<HiArrowLongDown />:<HiArrowLongUp />}</a>:null}</div></td>
                        })}</tr>
                        <tr>
                            {columnas.map((x)=><th>{x}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {ordenados().map((x)=><tr className={x.id==seleccion?.id?'selected':x.id==usuario.id?'gold':!x.operativo?'aqua':''} onClick={()=>{setSeleccion(seleccion==null && x.id!=usuario.id?x:null)}}><td style={{lineHeight:0}}><Perfil usuario={x}/></td><td>{x.nick}</td><td>{x.nombre}</td><td>{x.apellido1}</td><td>{x.apellido2}</td><td>{x.email}</td><td>{x.telefono}</td><td>{x.administrador?"Sí":"No"}</td><td>{x.operativo?"Sí":"No"}</td></tr>)}
                    </tbody>
                    <tfoot>
                        <tr><th colSpan={columnas.length}></th></tr>
                    </tfoot>
                </table>
            </div> */}
            <Dialog open={abierto} onClose={(event,reason)=>{
                if (reason && reason==='backdropClick' && ([2].includes(acciones.indexOf(accion)))){
                    return
                }
                setSeleccion(null)}} aria-labelledby='customized-dialog-title'>
                {
                    seleccion!=null?
                    <>
                    {[2].includes(acciones.indexOf(accion))?
                    <DialogTitle sx={{m:0,paddingBlock:0,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}} id="customized-dialog-title">
                        <p>ALERTA</p>
                        <IconButton onClick={()=>{setSeleccion(null)}} sx={{width:'fit-content'}}>
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    :null}
                    <DialogContent dividers={[2].includes(acciones.indexOf(accion))}>
                        {accion==acciones[2]?
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                            <p>Va a eliminar un usuario y con él sus registros. Acción irreversible</p>
                            <Button variant='outlined' onClick={()=>{setConfirmacion(true)}}>Confirmar</Button>
                        </div>
                        :<div style={{display:'flex',gap:'1rem'}}>
                        {acciones.map((x,i)=>{
                            let texto=(i==0 && seleccion.administrador?"Des":"")+x+(i==1?seleccion.operativo?"baja":"alta":"")
                            return <Button variant='outlined' onClick={()=>{setAccion(x)}}>{texto.charAt(0).toUpperCase()+texto.slice(1)}</Button>
                        })}</div>}
                    </DialogContent>
                    </>
                    :null
                }
            </Dialog>
        </div>
    )
}