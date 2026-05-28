import { useData } from "../DataContext";
import { useEffect,useMemo,useState,useRef } from "react";
import { fechaSQL, inicio2000,actual, sumDias, campos, formatear, sin_acentos, toExcel } from "../Funciones";
import Filtro from "./Filtro";
import Checkbox from "./Checkbox"
import { HiArrowLongDown,HiArrowLongUp } from "react-icons/hi2";
import { RxTriangleLeft,RxTriangleRight } from "react-icons/rx";
import { ImArrowLeft,ImArrowRight } from "react-icons/im";
import { format,formatDate,parse } from "date-fns";
import Close from "./Close";
import AddEditRegistro from "./AddEditRegistro";
import api from "../Api";
import { MaterialReactTable, MRT_TableHeadCellFilterLabel, MRT_TableHeadCellSortLabel, useMaterialReactTable } from "material-react-table";
import { Box, Button } from "@mui/material";
export default function(){
    const [open,setOpen]=useState(-1)
    const {clientes,centros,proyectos,usuarios,registros,getClienteByCentro,getCentroByProyecto,getClienteByProyecto,usuario}=useData()
    const [orden,setOrden]=useState(null)
    const [sentido,setSentido]=useState(null)
    const [terminados,setTerminados]=useState(true)
    const [enCurso,setEnCurso]=useState(true)
    const [begin,setBegin]=useState(inicio2000())
    const [end,setEnd]=useState(actual())
    const [busqueda,setBusqueda]=useState("")
    const [seleccion,setSeleccion]=useState(null)
    const [accion,setAccion]=useState("")
    const acciones=["Terminar","Editar","Eliminar"]
    const [confirmacion,setConfirmacion]=useState(false)
    const ventana=useRef(null)
    const f=[clientes,centros,proyectos,usuarios].map((x,i)=>{
        return x.filter((y)=>{
                    let campo=i==2?'fin':i==3?'operativo':'abierto'
                    return y[campo]==(i==2?null:true)
                }).map((z)=>{
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
    const mostrables=registros.filter((x)=>{
        let i=parse(fechaSQL(x.inicio).split("T")[0],"yyyy-MM-dd",new Date())
        let inicio=new Date(i.getTime()-(i.getTimezoneOffset()*60000))
        return Object.values(x).map((y,i)=>y==null?Object.keys(x)[i]=='duracion'?'En Curso':"null":y.toString()).find((y)=>y.toLowerCase().includes(busqueda.toLowerCase()))!=null && inicio>=begin && inicio<=end && ((x.fin!=null && terminados) || (x.fin==null && enCurso)) && pro.find((y)=>y.id==x.id_proyecto && y.checked)!=null && usu.find((y)=>y.id==x.id_usuario && y.checked)!=null
    })
    useEffect(()=>{
        setCen(prev=>{
            return prev.map((x)=>{
                let checkeado=cli.find((y)=>y.id==centros.find(z=>z.id==x.id).id_cliente).checked
                x.checked=checkeado
                x.visible=checkeado
                return x
            })
        })
    },[cli.filter((x)=>x.checked).length])
    useEffect(()=>{
        setPro(prev=>{
            return prev.map((x)=>{
                let checkeado=cen.find((y)=>y.id==proyectos.find(z=>z.id==x.id).id_centro).checked
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
        let lista=mostrables
        if (orden!=null && sentido!=null){
            lista.sort((x,y)=>{
                    let campo=orden
                    let array=orden==null?[]:orden.split(' ')
                    if (array.length>0){
                        campo=array[array.length-1]
                    }
                    let duracion=orden==columnas[columnas.length-1].toLowerCase()
                    function format(o){
                        let valor=duracion?o.fin==null?0:o.duracion:o[campo || "inicio"]
                        let defecto=duracion?0:"1"
                        let campos_fecha=['día','hora']
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
    const ChangeBegin=(event)=>{
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
    const ChangeEnd=(event)=>{
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
            ventana.current.showModal()
        }
        else{
            ventana.current.close()
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
            let x={...seleccion,inicio:seleccion.inicio.split(' ')[0].split('/').reverse().reduce((x,y)=>x+"-"+y)+" "+seleccion.inicio.split(' ')[1]}
            x.fin=formatear(new Date(),0,true)
            api.put('registros',x).then((res)=>{
                setSeleccion(null)
            })
        }
        else if (accion==acciones[2] && confirmacion){
            api.delete(`registros/${seleccion.id}`).then((res)=>{
                setSeleccion(null)
            })
        }
    },[accion,confirmacion])
    const cambiarDia=(n)=>{
        setBegin(sumDias(begin,n))
        setEnd(sumDias(end,n))
    }
    useEffect(()=>{
        if (seleccion!=null && seleccion.id!=null && mostrables.find((x)=>x.id==seleccion.id)==null){
            setSeleccion(null)
        }
    })
    useEffect(()=>{
        const handleKeyDown=(e)=>{
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
                {seleccion.id==null || accion==acciones[1]?
                <AddEditRegistro x={seleccion.id==null?seleccion:registros.find((y)=>y.id==seleccion.id)} editar={accion==acciones[1]}/>
                :
                <>{acciones.map((x,i)=>(registros.filter((y)=>y.id==seleccion.id).length==0 || (i==0 && registros.find((y)=>y.id==seleccion.id).fin!=null))?null:<a className="btn" onClick={()=>{setAccion(x)}}>{x}</a>)}</>
                }
                <Close onClick={()=>{setSeleccion(null)}} absolute={seleccion.id==null || accion==acciones[1]}/>
            </div>
            :null
    }
    const confirmar=()=>{
        return accion==acciones[2]?
        <div className="ventana-emergente">
            <Close onClick={()=>{setAccion("")}} absolute={true}/>
            <h1 style={{marginBlock:0}}>ALERTA</h1>
            <p>Va a eliminar un registro. Acción irreversible</p>
            <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
        </div>
        :null
    }
    const duracion_total=mostrables.filter((x)=>x.fin!=null).reduce((x,y)=>x+y.duracion,0.0).toFixed(1)
    const columns=useMemo(
        ()=>columnas.map((x)=>{
            return {
                accessorKey:x.toLocaleLowerCase(),
                header: x,
            }
        })
    )
    return (
        <div className="component">
            <div className="btnbox">
                <a className="btn" onClick={()=>{setSeleccion(seleccion==null?()=>{
                    let ultimo={...registros.find((x)=>x.id_usuario==usuario.id),inicio:formatDate(new Date(),"dd/MM/yyyy HH:mm"),fin:null,descripcion:null}
                    delete ultimo.id
                    return ultimo
                }:null)}}>Añadir</a>
                <a className="btn" onClick={()=>{
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
                }}>Excel</a>
            </div>
            <h1>REGISTROS</h1>
            <div className="options">
                <div>
                    <RxTriangleLeft style={{cursor:'pointer'}} size={25} onClick={()=>{cambiarDia(-1)}}/>
                    <input type="date" onChange={ChangeBegin} value={format(begin,'yyyy-MM-dd')}/>
                    <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                        <ImArrowRight onClick={()=>{setEnd(begin)}} cursor={'pointer'}/>
                        <ImArrowLeft onClick={()=>{setBegin(end)}} cursor={'pointer'}/>
                    </div>
                    <input type="date" onChange={ChangeEnd} value={format(end,'yyyy-MM-dd')}/>
                    <RxTriangleRight style={{cursor:'pointer'}} size={25} onClick={()=>{cambiarDia(1)}}/>
                </div>
                <div><Checkbox val={terminados} setVal={setTerminados} title={"Terminados"}/><Checkbox val={enCurso} setVal={setEnCurso} title={"En Curso"}/></div>
                <input type="text" placeholder="Buscar..." onChange={(e)=>{setBusqueda(e.target.value)}} style={{borderColor:'gold'}}/>
            </div>
            <br/>
            {
            <div className="table-container">
                <table>
                    <thead>
                        <tr>{columnas.map((x,i)=>{
                            let v=sin_acentos(x.toLowerCase())
                            return <td className={orden==v?"gold":""} style={{borderCollapse:'collapse'}}><div><a onClick={()=>{setSentido(1);setOrden(prev=>{
                                return prev==v?null:v
                            })}}>Ordenar</a>{orden==v?<a onClick={()=>{setSentido(sentido*-1)}}>{sentido==-1?<HiArrowLongDown />:<HiArrowLongUp />}</a>:null}</div></td>
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
            </div>}
            <dialog ref={ventana} onClose={()=>{setSeleccion(null)}}>
                {seleccion!=null?<div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                {seleccion.id==null || accion==acciones[1]?
                <AddEditRegistro x={seleccion.id==null?seleccion:registros.find((y)=>y.id==seleccion.id)} editar={accion==acciones[1]}/>
                :accion==acciones[2]?
                <div><h1 style={{marginBlock:0}}>ALERTA</h1>
                <p>Va a eliminar un registro. Acción irreversible</p>
                <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a></div>
                :<>{acciones.map((x,i)=>(registros.filter((y)=>y.id==seleccion.id).length==0 || (i==0 && registros.find((y)=>y.id==seleccion.id).fin!=null))?null:<a className="btn" onClick={()=>{setAccion(x)}}>{x}</a>)}</>
                }
                <Close onClick={()=>{setSeleccion(null)}} absolute={seleccion.id==null || [1,2].includes(acciones.indexOf(accion))}/>
                </div>:null}
            </dialog>
        </div>
    )
}