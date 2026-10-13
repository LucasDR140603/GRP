import { useData } from "../DataContext.tsx";
import { useEffect,useMemo,useState,useRef } from "react";
import { fechaSQL, inicio2000,actual, sumDias, formatear, sin_acentos, toExcel, inicio_mes_actual } from "../Funciones.tsx";
import Filtro,{item} from "./Filtro.tsx";
import { HiArrowLongDown,HiArrowLongUp } from "react-icons/hi2";
import { RxTriangleLeft,RxTriangleRight } from "react-icons/rx";
import { ImArrowLeft,ImArrowRight } from "react-icons/im";
import { format,formatDate,parse } from "date-fns";
import Close from "./Close.tsx";
import AddEditRegistro from "./AddEditRegistro.tsx";
import api from "../Api.tsx";
import { MaterialReactTable, MRT_TableHeadCellFilterLabel, MRT_TableHeadCellSortLabel, useMaterialReactTable } from "material-react-table";
import {Menu,Button,Dialog,DialogTitle,DialogContent,IconButton,TextField,FormControlLabel,Checkbox,TableContainer,Paper,Table,TableHead as Thead,TableBody as Tbody,TableRow as Tr,TableCell as Td,TableSortLabel} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'
import ArrowRightAlt from '@mui/icons-material/ArrowRightAlt'
import FilterListIcon from '@mui/icons-material/FilterList'
import FiltroMenu from './FiltroMenu.tsx'
export default function(){
    const [open,setOpen]=useState(-1)
    const {clientes,centros,proyectos,usuarios,registros,getClienteByCentro,getCentroByProyecto,getClienteByProyecto,usuario,clientes_con_proyecto}=useData()
    const [orden,setOrden]=useState<string | null>(null)
    const [sentido,setSentido]=useState<number | null>(null)
    const [terminados,setTerminados]=useState(true)
    const [enCurso,setEnCurso]=useState(true)
    const [begin,setBegin]=useState(inicio_mes_actual())
    const [end,setEnd]=useState(actual())
    const [busqueda,setBusqueda]=useState("")
    const [seleccion,setSeleccion]=useState<Record<string,any> | null>(null)
    const [accion,setAccion]=useState("")
    const acciones=["Terminar","Editar","Eliminar"]
    const [confirmacion,setConfirmacion]=useState(false)
    // const ventana=useRef<any>(null)
    const [abierto,setAbierto]=useState<boolean>(false)
    const [anchorEl,setAnchorEl]=useState<Element | null>(null)
    const menu_abierto=Boolean(anchorEl)
    const f:item[][]=[clientes,centros,proyectos,usuarios].map((x,i)=>{
        return x.filter((y:any)=>{
                    let campo=i==2?'fin':i==3?'operativo':'abierto'
                    return y[campo]==(i==2?null:true)
                }).map((z:any)=>{
                    let campo=i==3?'nick':'nombre'
                    return {
                        "id":z.id,
                        "label":z[campo],
                        "checked":true,
                        "visible":true,
                    }
                })
    })
    const [cli,setCli]=useState(f[0])
    const [cen,setCen]=useState(f[1])
    const [pro,setPro]=useState(f[2])
    const [usu,setUsu]=useState(f[3])
    const filtros=[cli,cen,pro,usu]
    const setsFiltros=[setCli,setCen,setPro,setUsu]
    const mostrables:any[]=registros.filter((x:any)=>{
        let i=parse(fechaSQL(x.inicio).split("T")[0],"yyyy-MM-dd",new Date())
        let inicio=new Date(i.getTime()-(i.getTimezoneOffset()*60000))
        return Object.values(x).map((y,i)=>y==null?Object.keys(x)[i]=='duracion'?'En Curso':"null":y.toString()).find((y)=>y.toLowerCase().includes(busqueda.toLowerCase()))!=null && inicio>=begin && inicio<=end && ((x.fin!=null && terminados) || (x.fin==null && enCurso)) && pro.find((y)=>y.id==x.id_proyecto && y.checked)!=null && usu.find((y)=>y.id==x.id_usuario && y.checked)!=null
    })
    useEffect(()=>{
        setCen(prev=>{
            return prev.map((x)=>{
                let checkeado=cli.find((y)=>y.id==centros.find((z:any)=>z.id==x.id).id_cliente)!.checked
                x.checked=checkeado
                x.visible=checkeado
                return x
            })
        })
    },[cli.filter((x)=>x.checked).length])
    useEffect(()=>{
        setPro(prev=>{
            return prev.map((x)=>{
                let checkeado=cen.find((y)=>y.id==proyectos.find((z:any)=>z.id==x.id).id_centro)!.checked
                x.checked=checkeado
                x.visible=checkeado
                return x
            })
        })
    },[cen.filter((x)=>x.checked).length])
    useEffect(()=>{
        if (orden==null){
            setSentido(null)
        }
    },[orden])
    const columnas=['Cliente','Centro','Proyecto','Usuario','Día de Inicio','Hora de Inicio','Día de Fin','Hora de Fin','Descripción','Observaciones','Duración Total']
    const ordenados=()=>{
        let lista:any[]=mostrables
        if (orden!=null && sentido!=null){
            lista.sort((x,y)=>{
                    let campo=orden
                    let array=orden==null?[]:orden.split(' ')
                    if (array.length>0){
                        campo=array[array.length-1]
                    }
                    let duracion=orden==sin_acentos(columnas[columnas.length-1]).toLowerCase()
                    function format(o:any){
                        let valor=duracion?o.fin==null?0:o.duracion:o[campo || "inicio"]
                        let defecto=duracion?0:"1"
                        let campos_fecha=['dia','hora']
                        if (["inicio","fin",null].includes(campo)){
                            valor=fechaSQL(valor)
                            if (array.length>0 && campos_fecha.includes(array[0])){
                                let indice=campos_fecha.indexOf(array[0])
                                valor=valor.split('T')[indice]
                                defecto=indice==0?"0000-00-00":"00:00"
                            }
                        }
                        if (typeof(valor)==typeof("texto")){
                            valor=valor.toLowerCase()
                        }
                        return valor || defecto
                    }
                    return (duracion?format(x)-format(y):format(x).localeCompare(format(y)))*sentido
                })
        }
        return lista
    }
    const ChangeBegin=(event:any)=>{
        let v=event.target.value
        const valores=v.split("-")
        if (v.length==0 || valores[0].length>4){
            setBegin(inicio2000())
        }
        else{
            let f=parse(v,"yyyy-MM-dd",new Date())
            setBegin(new Date(f.getTime()-(f.getTimezoneOffset()*60000)))
        }
    }
    const ChangeEnd=(event:any)=>{
        let v=event.target.value
        const valores=v.split("-")
        if (v.length==0 || valores[0].length>4){
            setEnd(actual())
        }
        else{
            let f=parse(v,"yyyy-MM-dd",new Date())
            setEnd(new Date(f.getTime()-(f.getTimezoneOffset()*60000)))
        }
    }
    useEffect(()=>{
        setAccion("")
        setConfirmacion(false)
        if (seleccion!=null){
            // ventana.current.showModal()
            setAbierto(true)
        }
        else{
            // ventana.current.close()
            setAbierto(false)
        }
    },[seleccion])
    useEffect(()=>{
        if (begin>end){
            setEnd(begin)
        }
    },[begin])
    useEffect(()=>{
        if (begin>end){
            setBegin(end)
        }
    },[end])
    useEffect(()=>{
        if (accion==acciones[0]){
            let x:Record<string,any>={...seleccion,inicio:seleccion!.inicio.split(' ')[0].split('/').reverse().reduce((x:string,y:string)=>x+"-"+y)+" "+seleccion!.inicio.split(' ')[1]}
            x.fin=formatear(new Date(),0,true)
            api.put('registros',x).then((res)=>{
                setSeleccion(null)
            })
        }
        else if (accion==acciones[2] && confirmacion){
            api.delete(`registros/${seleccion!.id}`).then((res)=>{
                setSeleccion(null)
            })
        }
    },[accion,confirmacion])
    const cambiarDia=(n:number)=>{
        setBegin(sumDias(begin,n))
        setEnd(sumDias(end,n))
    }
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
    const duracion_total=mostrables.filter((x)=>x.fin!=null).reduce((x,y)=>x+y.duracion,0.0).toFixed(1)
    return (
        <div className="component">
            <div className="btnbox">
                <Button variant='outlined' onClick={()=>{setSeleccion(seleccion==null?()=>{
                    let cliente=clientes_con_proyecto[0]
                    let centro=centros.find((x:any)=>x.id_cliente==cliente.id)
                    let proyecto=proyectos.find((x:any)=>x.id_centro==centro.id)
                    let ultimo=registros.find((x:any)=>x.id_usuario==usuario.id)??{
                        "cliente": cliente.nombre,
                        "centro": centro.nombre,
                        "proyecto": proyecto.nombre,
                        "usuario": usuario.nick,
                        "id_cliente": cliente.id,
                        "id_centro": centro.id,
                        "id_proyecto": proyecto.id,
                        "id_usuario": usuario.id,
                        "id": "",
                        "observaciones": null,
                        "km": 0,
                        "desplazamiento": 0,
                        "manutencion": 0,
                        "alojamiento": 0,
                    }
                    let nuevo={...ultimo,inicio:formatDate(new Date(),"dd/MM/yyyy HH:mm"),fin:null,descripcion:null}
                    delete nuevo.id
                    return nuevo
                }:null)}}>Añadir</Button>
                <Button variant='outlined' onClick={()=>{
                    toExcel(ordenados().map((x)=>{
                        let terminado=x.fin!=null
                        let campos_inicio=x.inicio.split(' ')
                        let campos_fin=terminado?x.fin.split(' '):Array(2).fill('En Curso')
                        let registro={...x}
                        delete registro.inicio
                        delete registro.fin
                        Array.from(Object.keys(registro).filter((y)=>y.includes("id"))).forEach(v=>{
                            delete registro[v]
                        })
                        registro["Día de Inicio"]=campos_inicio[0]
                        registro["Hora de Inicio"]=campos_inicio[1]
                        registro["Día de Fin"]=campos_fin[0]
                        registro["Hora de Fin"]=campos_fin[1]
                        registro["Duración Total: "+duracion_total]=x.duracion ?? 'En Curso'
                        return Object.keys(registro).map((y)=>({[y.charAt(0).toUpperCase() + y.slice(1)]:registro[y]})).reduce((y,z)=>({...y,...z}),{})
                    }))
                }}>Excel</Button>
                {cen.filter((x)=>x.checked).length==1?
                <Button variant='outlined' onClick={()=>{
                    let r=ordenados().toSorted((x,y)=>fechaSQL(x.inicio).localeCompare(fechaSQL(y.inicio))).filter((x)=>x.duracion!=null)
                    let centro_marcado=centros.find((x:any)=>x.id==cen.find((x)=>x.checked)!.id)
                    let cliente_marcado=getClienteByCentro.current(centro_marcado)
                    toExcel(r.map((x)=>{
                        let fecha=x.inicio.split(' ')[0]
                        let u=usuarios.filter((y:any)=>y.id==x.id_usuario)[0]
                        let d=x.duracion
                        let cifras=d.toString().split('.').map((x:string)=>parseInt(x))
                        let duracion_final=cifras[0]
                        let decimal=cifras.slice(-1)[0]
                        duracion_final+=decimal>5?1:decimal>0?0.5:0
                        return {
                            'FECHA':fecha,
                            'LUGAR':'',
                            'TRAB':u.nombre.charAt(0)+u.apellido1.charAt(0),
                            '':'',
                            'DURACION Dec.':duracion_final,
                            'D':x.desplazamiento>0?1:0,
                            'M':x.manutencion>0?1:0,
                            'IHE':duracion_final>8?(duracion_final-8):'',
                            ' ':'',
                            'DESCRIPCION':x.descripcion??'',
                            'PROYECTO':x.proyecto,
                            'Observaciones':x.observaciones??''
                        }
                    }),'PARTE TRABAJOS '+cliente_marcado.nombre+"_"+centro_marcado.nombre+" "+format(begin,'dd-MM-yyyy')+" - "+format(end,'dd-MM-yyyy')+".xlsx","TRABAJOS REALIZADOS POR ADMINISTRACION "+cliente_marcado.nombre+"_"+centro_marcado.nombre+" "+format(begin,'dd-MM-yyyy')+" - "+format(end,'dd-MM-yyyy'),['D: Desplazamientos, M: manutención, IHE: Incremento Horas Extra','Estado: PA: Pendiente albarán // PP: Pendiente pedido //PF: Pendiente facturar //SC: Sin cargo'],true)
                }}>
                    Parte de Trabajo
                </Button>
                :null}
            </div>
            <h1>REGISTROS</h1>
            {/* <DatePicker label="Desde" onChange={(newValue)=>{alert(newValue)}}/> */}
            <div className="options">
                <div>
                    <IconButton onClick={()=>{cambiarDia(-1)}}>
                        <RxTriangleLeft style={{cursor:'pointer'}} size={25}/>
                    </IconButton>
                    <TextField type="date" onChange={ChangeBegin} value={format(begin,'yyyy-MM-dd')}/>
                    <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                        <ArrowRightAlt onClick={()=>{setEnd(begin)}} cursor={'pointer'}/>
                        <ArrowRightAlt style={{transform:'rotate(-180deg)'}} onClick={()=>{setBegin(end)}} cursor={'pointer'}/>
                    </div>
                    <TextField type="date" onChange={ChangeEnd} value={format(end,'yyyy-MM-dd')}/>
                    <IconButton onClick={()=>{cambiarDia(1)}}>
                        <RxTriangleRight style={{cursor:'pointer'}} size={25}/>
                    </IconButton>
                </div>
                <div><FormControlLabel control={<Checkbox defaultChecked/>} label="Terminados" onChange={(e)=>{setTerminados(!terminados)}}/><FormControlLabel control={<Checkbox defaultChecked/>} label="En Curso" value={enCurso} onChange={(e)=>{setEnCurso(!enCurso)}}/></div>
                <TextField type='text' label={"Buscar"} value={busqueda} onChange={(e)=>{setBusqueda(e.target.value)}}/>
            </div>
            <br/>
            {
            <>
            <TableContainer sx={{width:'fit-content',maxWidth: '90%',margin:'0 auto'}} component={Paper}>
                <Table stickyHeader>
                    <Thead>
                        <Tr>{columnas.map((x,i)=>{
                            let v=sin_acentos(x.toLowerCase())
                            let nc=filtros.length>0 && filtros[i]!=null && filtros[i].length>0 && filtros[i].filter((y)=>!y.checked && y.visible).length>0
                            return <Td component='th' sortDirection={orden==v?sentido==1?'asc':'desc':false}>
                                <div style={{display:'flex'}}>
                                    <TableSortLabel active={orden==v && sentido!=null} direction={sentido==-1?'desc':'asc'} onClick={()=>{
                                        orden==v?setSentido((sentido==null?1:sentido)*-1):setSentido(1);setOrden(v)
                                    }}>
                                        <a onClick={(e)=>{e.stopPropagation();setSentido(1);setOrden((prev)=>{
                                            return prev==v?null:v
                                        })}}>{x}{i==columnas.length-1?": "+duracion_total:null}</a>
                                    </TableSortLabel>
                                    {i<4?
                                    <IconButton style={{width:'25px',height:'25px'}} size="small" aria-haspopup="true" aria-controls={"menu_proyectos"} id={"button_"+i} aria-expanded={open==i} onClick={(e)=>{setOpen(i);setAnchorEl(e.currentTarget)}}>
                                        <FilterListIcon style={{color:nc?'gold':'azure',scale:0.75}}/>
                                    </IconButton>
                                    :null}
                                </div>
                            </Td>
                        })}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {ordenados().map((x)=>{
                            let terminado=x.fin!=null
                            let campos_inicio=x.inicio.split(' ')
                            let campos_fin=terminado?x.fin.split(' '):'En Curso'
                        return <Tr hover={true} sx={{cursor:'pointer'}} selected={x.id==seleccion?.id} className={terminado?'':'gold'} onClick={()=>{setSeleccion(seleccion!=null?null:x)}}><Td>{x.cliente}</Td><Td>{x.centro}</Td><Td>{x.proyecto}</Td><Td>{x.usuario}</Td><Td>{campos_inicio[0]}</Td><Td>{campos_inicio[1]}</Td>{!terminado?<Td colSpan={2} style={{textAlign:'center'}}>{campos_fin}</Td>:<><Td>{campos_fin[0]}</Td><Td>{campos_fin[1]}</Td></>}<Td>{x.descripcion}</Td><Td>{x.observaciones}</Td><Td>{x.duracion??'En Curso'}</Td></Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
            <Menu id={"menu_centros"} open={menu_abierto && open!=-1} anchorEl={anchorEl!} onClose={()=>{setAnchorEl(null)}} slotProps={{
                    list:{
                        "aria-labelledby":"button_"+open
                    },
                    paper:{
                        sx:{
                            marginTop:'1rem',
                            maxHeight:'200px',
                        }
                    }
                }}>
                <FiltroMenu lista={filtros[open]} set={setsFiltros[open]}/>
            </Menu>
            {/* <div className="table-container">
                <table>
                    <thead>
                        <tr>{columnas.map((x,i)=>{
                            let v=sin_acentos(x.toLowerCase())
                            return <td className={orden==v?"gold":""} style={{borderCollapse:'collapse'}}><div><a onClick={()=>{setSentido(1);setOrden(prev=>{
                                return prev==v?null:v
                            })}}>Ordenar</a>{orden==v?<a onClick={()=>{setSentido((sentido!=null?sentido:1)*-1)}}>{sentido==-1?<HiArrowLongDown />:<HiArrowLongUp />}</a>:null}</div></td>
                        })}</tr>
                        <tr>{columnas.map((x,i)=>{
                            let nc=filtros.length>0 && filtros[i]!=null && filtros[i].length>0 && filtros[i].filter((y)=>!y.checked && y.visible).length>0
                            return <th className={nc?"bg-aqua":""} onClick={()=>{setOpen(open==i || i>3?-1:i)}}>
                                {x}{i==columnas.length-1?": "+duracion_total:null}
                                {open==i?
                                    <Filtro lista={filtros[i]} set={setsFiltros[i]}/>
                                :null}
                            </th>
                        })}</tr>
                    </thead>
                    <tbody>
                    {ordenados().map((x)=>{
                        let terminado=x.fin!=null
                        let campos_inicio=x.inicio.split(' ')
                        let campos_fin=terminado?x.fin.split(' '):'En Curso'
                        return <tr className={x.id==seleccion?.id?'selected':terminado?'':'gold'} onClick={()=>{setSeleccion(seleccion!=null?null:x)}}><td>{x.cliente}</td><td>{x.centro}</td><td>{x.proyecto}</td><td>{x.usuario}</td><td>{campos_inicio[0]}</td><td>{campos_inicio[1]}</td>{!terminado?<td colSpan={2} style={{textAlign:'center'}}>{campos_fin}</td>:<><td>{campos_fin[0]}</td><td>{campos_fin[1]}</td></>}<td>{x.descripcion}</td><td>{x.observaciones}</td><td>{x.duracion??'En Curso'}</td></tr>
                    })}
                    </tbody>
                    <tfoot>
                        <tr><th colSpan={columnas.length}></th></tr>
                    </tfoot>
                </table>
            </div> */}
            </>}
            <Dialog sx={{color:'#121212'}} onClose={(event,reason)=>{
                if (reason && reason==='backdropClick' && (seleccion?.id==null || [1].includes(acciones.indexOf(accion)))){
                    return
                }
                setSeleccion(null)}} open={abierto} aria-labelledby="customized-dialog-title">
                    {seleccion!=null?<>
                    {seleccion.id==null || [1,2].includes(acciones.indexOf(accion))?
                    <DialogTitle sx={{m:0,paddingBlock:0,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}} id="customized-dialog-title">
                        <p>{seleccion.id==null?"AÑADIR REGISTRO":accion==acciones[1]?"EDITAR REGISTRO":"ALERTA"}</p>
                        <IconButton onClick={()=>{setSeleccion(null)}} sx={{width:'fit-content'}}>
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>:null}
                    <DialogContent dividers={seleccion?.id==null || [1,2].includes(acciones.indexOf(accion))}>
                        {seleccion.id==null || accion==acciones[1]?
                        <AddEditRegistro x={seleccion.id==null?seleccion:registros.find((y:any)=>y.id==seleccion.id)} editar={accion==acciones[1]}/>
                        :accion==acciones[2]?
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <p>Va a eliminar un registro. Acción irreversible</p>
                        <Button variant='outlined' onClick={()=>{setConfirmacion(true)}}>Confirmar</Button>
                        </div>
                        :<div style={{display:'flex',gap:'1rem'}}>{acciones.map((x,i)=>(registros.filter((y:any)=>y.id==seleccion.id).length==0 || (i==0 && registros.find((y:any)=>y.id==seleccion.id).fin!=null))?null:<Button variant='outlined' onClick={()=>{setAccion(x)}}>{x}</Button>)}</div>
                        }
                    </DialogContent>
                    </>:null}
            </Dialog>
        </div>
    )
}