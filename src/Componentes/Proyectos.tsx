import { RxTriangleLeft,RxTriangleRight } from "react-icons/rx"
import { HiArrowLongDown,HiArrowLongUp } from "react-icons/hi2";
import { ImArrowLeft,ImArrowRight } from "react-icons/im";
import { format,formatDate,parse } from "date-fns";
import Close from "./Close.tsx";
import api from "../Api.tsx";
import Filtro,{item} from "./Filtro.tsx";
import Checkbox from "./Checkbox.tsx"
import { useData } from "../DataContext.tsx";
import { useEffect,useState,useRef } from "react";
import { inicio2000,actual, sumDias, sin_acentos } from "../Funciones.tsx";
import AddEditProyecto from "./AddEditProyecto.tsx";
export default function(){
    const [open,setOpen]=useState(-1)
    const {clientes,centros,proyectos,usuarios,getClienteByCentro,getCentroByProyecto,getClienteByProyecto,usuario}=useData()
    const [orden,setOrden]=useState<string | null>(null)
    const [sentido,setSentido]=useState<number | null>(null)
    const [abiertos,setAbiertos]=useState(true)
    const [cerrados,setCerrados]=useState(true)
    const [begin,setBegin]=useState(inicio2000())
    const [end,setEnd]=useState(actual())
    const [busqueda,setBusqueda]=useState("")
    const [seleccion,setSeleccion]=useState<any>(null)
    const [accion,setAccion]=useState("")
    const acciones=["Editar","Eliminar"]
    const [confirmacion,setConfirmacion]=useState(false)
    const ventana=useRef<any>(null)
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
    const cambiarDia=(n:number)=>{
        setBegin(sumDias(begin,n))
        setEnd(sumDias(end,n))
    }
    const f:item[][]=[clientes,centros].map((x)=>{
        return x.map((z:any)=>{
            return {
                "id":z.id,
                "label":z.nombre,
                "checked":true,
                "visible":true,
            }
        })
    })
    const [cli,setCli]=useState(f[0])
    const [cen,setCen]=useState(f[1])
    const filtros:item[][]=[cli,cen]
    const setsFiltros=[setCli,setCen]
    const mostrables:any[]=proyectos.filter((x:any)=>{
        let i=parse(x.inicio.split("T")[0],"yyyy-MM-dd",new Date())
        let inicio=new Date(i.getTime()-(i.getTimezoneOffset()*60000))
        return Object.values(x).concat([getCentroByProyecto.current(x).nombre,getClienteByProyecto.current(x).nombre]).map((y)=>y==null?"null":y.toString()).find((y)=>y.toLowerCase().includes(busqueda.toLowerCase()))!=null && inicio>=begin && inicio<=end && ((x.fin!=null && cerrados) || (x.fin==null && abiertos)) && cen.find((y:any)=>y.id==x.id_centro && y.checked)!=null
    })
    const columnas=['Cliente','Centro','Nombre','Descripción','Día de Inicio','Hora de Inicio','Día de Fin','Hora de Fin']
    const ordenados:(()=>any[])=()=>{
        let lista=mostrables
        if (orden!=null && sentido!=null){
            lista.sort((x,y)=>{
                    let campo=orden
                    let array=orden==null?[]:orden.split(' ')
                    if (array.length>0){
                        campo=array[array.length-1]
                    }
                    function format(o:any){
                        let indice_columna=columnas.map((z)=>sin_acentos(z.toLowerCase())).indexOf(orden!)
                        const gets=[getClienteByProyecto,getCentroByProyecto]
                        let valor=indice_columna<2?gets[indice_columna].current(o).nombre:o[campo || "inicio"]
                        let defecto="1"
                        let campos_fecha=['día','hora']
                        if (["inicio","fin",null].includes(campo)){
                            if (array.length>0 && campos_fecha.includes(array[0])){
                                let indice=campos_fecha.indexOf(array[0])
                                defecto=indice==0?"0000-00-00":"00:00"
                                if (valor!=null){
                                    valor=valor.split('T')[indice]
                                }
                            }
                        }
                        if (typeof(valor)==typeof("texto")){
                            valor=valor.toLowerCase()
                        }
                        return valor || defecto
                    }
                    return (format(x).localeCompare(format(y)))*sentido
                })
        }
        return lista
    }
    useEffect(()=>{
        if (accion==acciones[1] && confirmacion){
            api.delete(`proyectos/${seleccion.id}`).then((res)=>{
                setSeleccion(null)
            })
        }
    },[accion,confirmacion])
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
        if (orden==null){
            setSentido(null)
        }
    },[orden])
    useEffect(()=>{
        if (seleccion!=null && seleccion.id!=null && mostrables.find((x)=>x.id==seleccion.id)==null){
            setSeleccion(null)
        }
    })
    useEffect(()=>{
        const handleKeyDown=(e:any)=>{
            if (e.key=="Enter" && accion==acciones[1]){
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
                {seleccion.id==null || accion==acciones[0]?
                <AddEditProyecto x={seleccion.id==null?seleccion:proyectos.find((y:any)=>y.id==seleccion.id)} editar={accion==acciones[0]}/>
                :
                <>{acciones.map((x,i)=><a className="btn" onClick={()=>{setAccion(x)}}>{x}</a>)}</>
                }
                <Close onClick={()=>{setSeleccion(null)}} absolute={seleccion.id==null || accion==acciones[0]}/>
            </div>
            :null
    }
    const confirmar=()=>{
        return accion==acciones[1]?
        <div className="ventana-emergente">
            <Close onClick={()=>{setAccion("")}} absolute={true}/>
            <h1 style={{marginBlock:0}}>ALERTA</h1>
            <p>Va a eliminar un proyecto y con él sus registros. Acción irreversible</p>
            <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
        </div>
        :null
    }
    return (
        <div className="component">
            {usuario.administrador?<div className="btnbox">
                <a className="btn" onClick={()=>{
                    setSeleccion(seleccion==null?()=>{
                    let ultimo={nombre:"",id_centro:proyectos[0].id_centro,inicio:formatDate(new Date(),"yyyy-MM-dd HH:mm").replace(' ','T'),fin:null,descripcion:null}
                    return ultimo
                }:null)
                }}>Añadir</a>
            </div>:null}
            <h1>PROYECTOS</h1>
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
                <div><Checkbox val={abiertos} setVal={setAbiertos} title={"Abiertos"}/><Checkbox val={cerrados} setVal={setCerrados} title={"Cerrados"}/></div>
                <input type="text" placeholder="Buscar..." onChange={(e)=>{setBusqueda(e.target.value)}} style={{borderColor:'gold'}}/>
            </div>
            <br/>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>{columnas.map((x,i)=>{
                            let v=sin_acentos(x.toLowerCase())
                            return <td className={orden==v?"gold":""} style={{borderCollapse:'collapse'}}><div><a onClick={()=>{setSentido(1);setOrden(prev=>{
                                return prev==v?null:v
                            })}}>Ordenar</a>{orden==v?<a onClick={()=>{setSentido((sentido==null?1:sentido)*-1)}}>{sentido==-1?<HiArrowLongDown />:<HiArrowLongUp />}</a>:null}</div></td>
                        })}</tr>
                        <tr>{columnas.map((x,i)=>{
                            let nc=filtros.length>0 && filtros[i]!=null && filtros[i].length>0 && filtros[i].filter((y)=>!y.checked && y.visible).length>0
                            return <th className={nc?"bg-aqua":""} onClick={()=>{setOpen(open==i || i>1?-1:i)}}>
                                {x}
                                {open==i?
                                    <Filtro lista={filtros[i]} set={setsFiltros[i]}/>
                                :null}
                            </th>
                        })}</tr>
                    </thead>
                    <tbody>
                    {ordenados().map((x)=>{
                        let terminado=x.fin!=null
                        let campos_inicio:string[]=x.inicio.split('T')
                        let campos_fin=terminado?x.fin.split('T'):'En Curso'
                        campos_inicio[0]=campos_inicio[0].split('-').toReversed().reduce((x,y)=>x+"/"+y)
                        if (terminado){
                            campos_fin[0]=campos_fin[0].split('-').toReversed().reduce((x:string,y:string)=>x+"/"+y)
                        }
                        return <tr className={x.id==seleccion?.id?'selected':terminado?'aqua':''} onClick={()=>{if(usuario.administrador){setSeleccion(seleccion!=null?null:x)}}}><td>{getClienteByProyecto.current(x).nombre}</td><td>{getCentroByProyecto.current(x).nombre}</td><td>{x.nombre}</td><td>{x.descripcion}</td><td>{campos_inicio[0]}</td><td>{campos_inicio[1]}</td>{!terminado?<td colSpan={2} style={{textAlign:'center'}}>{campos_fin}</td>:<><td>{campos_fin[0]}</td><td>{campos_fin[1]}</td></>}</tr>
                    })}
                    </tbody>
                    <tfoot>
                        <tr><th colSpan={columnas.length}></th></tr>
                    </tfoot>
                </table>
            </div>
            <dialog ref={ventana} onClose={()=>{setSeleccion(null)}}>
                {seleccion!=null?<div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                {seleccion.id==null || accion==acciones[0]?
                <AddEditProyecto x={seleccion.id==null?seleccion:proyectos.find((y:any)=>y.id==seleccion.id)} editar={accion==acciones[0]}/>
                :accion==acciones[1]?
                <div>
                    <h1 style={{marginBlock:0}}>ALERTA</h1>
                    <p>Va a eliminar un proyecto y con él sus registros. Acción irreversible</p>
                    <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
                </div>
                :<>{acciones.map((x,i)=><a className="btn" onClick={()=>{setAccion(x)}}>{x}</a>)}</>
                }
                <Close onClick={()=>{setSeleccion(null)}} absolute={seleccion.id==null || [0,1].includes(acciones.indexOf(accion))}/>
                </div>:null}
            </dialog>
        </div>
    )
}