import { useData } from "../DataContext"
import api from "../Api"
import Close from "./Close"
import Checkbox from "./Checkbox"
import { useEffect,useState,useRef } from "react"
import { HiArrowLongDown,HiArrowLongUp } from "react-icons/hi2"
import { sin_acentos } from "../Funciones"
import AddEditCliente from "./AddEditCliente"
export default function(){
    const {clientes,usuario}=useData()
    const [orden,setOrden]=useState(null)
    const [sentido,setSentido]=useState(null)
    const [abiertos,setAbiertos]=useState(true)
    const [cerrados,setCerrados]=useState(true)
    const [busqueda,setBusqueda]=useState("")
    const [seleccion,setSeleccion]=useState(null)
    const [accion,setAccion]=useState("")
    const acciones=["Editar","Eliminar"]
    const [confirmacion,setConfirmacion]=useState(false)
    const ventana=useRef(null)
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
    const mostrables=clientes.filter((x)=>{
        return Object.values(x).map((y)=>y==true?"abierto":y==false?"cerrado":y).find((y)=>y.toLowerCase().includes(busqueda.toLowerCase()))!=null &&  ((!x.abierto && cerrados) || (x.abierto && abiertos))
    })
    const columnas=['Nombre','Estado']
    const ordenados=()=>{
        let lista=mostrables
        if (orden!=null && sentido!=null){
            lista.sort((x,y)=>{
                    let campo=orden
                    function format(o){
                        let indice_columna=columnas.map((z)=>sin_acentos(z.toLowerCase())).indexOf(orden)
                        let valor=o[indice_columna==columnas.length-1?'abierto':campo]
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
        if (accion==acciones[1] && confirmacion){
            api.delete(`clientes/${seleccion.id}`).then((res)=>{
                setSeleccion(null)
            })
        }
    },[accion,confirmacion])
    useEffect(()=>{
        if (seleccion!=null && seleccion.id!=null && mostrables.find((x)=>x.id==seleccion.id)==null){
            setSeleccion(null)
        }
    })
    useEffect(()=>{
        const handleKeyDown=(e)=>{
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
                <AddEditCliente x={seleccion.id==null?seleccion:clientes.find((y)=>y.id==seleccion.id)} editar={accion==acciones[0]}/>
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
            <p>Va a eliminar un cliente y con él sus centros, proyectos y registros. Acción irreversible</p>
            <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
        </div>
        :null
    }
    return (
        <div className="component">
            {usuario.administrador?<div className="btnbox">
                <a className="btn" onClick={()=>{
                    setSeleccion(seleccion==null?()=>{
                        let ultimo={nombre:"",abierto:true}
                        return ultimo
                    }:null)
                }}>Añadir</a>
            </div>:null}
            <h1>CLIENTES</h1>
            <div className="options">
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
                            })}}>Ordenar</a>{orden==v?<a onClick={()=>{setSentido(sentido*-1)}}>{sentido==-1?<HiArrowLongDown />:<HiArrowLongUp />}</a>:null}</div></td>
                        })}</tr>
                        <tr>{columnas.map((x,i)=>{
                            return <th>
                                {x}
                                </th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {ordenados().map((x)=>{
                            return <tr className={x.id==seleccion?.id?'selected':!x.abierto?'aqua':''} onClick={()=>{if(usuario.administrador){setSeleccion(seleccion!=null?null:x)}}}><td>{x.nombre}</td><td>{x.abierto?"Abierto":"Cerrado"}</td></tr>
                        })}
                    </tbody>
                    <tfoot>
                        <tr><th colSpan={columnas.length}></th></tr>
                    </tfoot>
                </table>
            </div>
            <dialog ref={ventana} onClose={()=>{setSeleccion(null)}}>
                {
                    seleccion!=null?
                    <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                        {seleccion.id==null || accion==acciones[0]?
                        <AddEditCliente x={seleccion.id==null?seleccion:clientes.find((y)=>y.id==seleccion.id)} editar={accion==acciones[0]}/>
                        :accion==acciones[1]?
                        <div>
                            <h1 style={{marginBlock:0}}>ALERTA</h1>
                            <p>Va a eliminar un cliente y con él sus centros, proyectos y registros. Acción irreversible</p>
                            <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
                        </div>
                        :<>{acciones.map((x,i)=><a className="btn" onClick={()=>{setAccion(x)}}>{x}</a>)}</>
                        }
                        <Close onClick={()=>{setSeleccion(null)}} absolute={seleccion.id==null || [0,1].includes(acciones.indexOf(accion))}/>
                    </div>
                    :null
                }
            </dialog>
        </div>
    )
}