import { useData } from "../DataContext"
import Perfil from "./Perfil"
import api from "../Api"
import Close from "./Close"
import Checkbox from "./Checkbox"
import { useEffect,useState,useRef } from "react"
import Filtro from "./Filtro"
import { HiArrowLongDown,HiArrowLongUp } from "react-icons/hi2"
import { sin_acentos } from "../Funciones"
export default function(){
    const {usuarios,usuario}=useData()
    const columnas=["Perfil","Nick","Nombre","1º Apellido","2º Apellido","Email","Teléfono","Administrador","Operativo"]
    const [orden,setOrden]=useState(null)
    const [sentido,setSentido]=useState(null)
    const [abiertos,setAbiertos]=useState(true)
    const [cerrados,setCerrados]=useState(true)
    const [busqueda,setBusqueda]=useState("")
    const [seleccion,setSeleccion]=useState(null)
    const [accion,setAccion]=useState("")
    const acciones=["hacer administrador","Dar de ","Eliminar"]
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
    const mostrables=usuarios.filter((x)=>{
        let sin_perfil={...x}
        delete sin_perfil.perfil
        return Object.values(sin_perfil).map((y)=>y==true?"sí":y==false?"no":y).find((y)=>sin_acentos(y.toLowerCase()).includes(sin_acentos(busqueda.toLowerCase())))!=null &&  ((!x.operativo && cerrados) || (x.operativo && abiertos))
    })
    const ordenados=()=>{
        let lista=mostrables
        if (orden!=null && sentido!=null){
            lista.sort((x,y)=>{
                    let campo=orden
                    function format(o){
                        let indice_columna=columnas.map((z)=>sin_acentos(z.toLowerCase())).indexOf(orden)
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
                    [campo]:!seleccion[campo]
                }
                api.put(`usuarios`,nuevo).then((res)=>{
                    setSeleccion(null)
                })
            }
            else if (confirmacion){
                api.delete(`usuarios/${seleccion.id}`).then((res)=>{
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
                <div><Checkbox val={abiertos} setVal={setAbiertos} title={"Abiertos"}/><Checkbox val={cerrados} setVal={setCerrados} title={"Cerrados"}/></div>
                <input type="text" placeholder="Buscar..." onChange={(e)=>{setBusqueda(e.target.value)}} style={{borderColor:'gold'}}/>
            </div>
            <br/>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>{columnas.map((x,i)=>{
                            let v=sin_acentos(x.toLowerCase())
                            if (v.includes("apellido")){
                                v=v.split(' ').toReversed().reduce((x,y)=>x+y).slice(0,-1)
                            }
                            return <td className={orden==v?"gold":""} style={{borderCollapse:'collapse'}}><div><a onClick={()=>{setSentido(1);setOrden(prev=>{
                                return prev==v?null:v
                            })}}>Ordenar</a>{orden==v?<a onClick={()=>{setSentido(sentido*-1)}}>{sentido==-1?<HiArrowLongDown />:<HiArrowLongUp />}</a>:null}</div></td>
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
            </div>
            <dialog ref={ventana} onClose={()=>{setSeleccion(null)}}>
                {
                    seleccion!=null?
                    <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                        {accion==acciones[2]?
                        <div>
                            <h1 style={{marginBlock:0}}>ALERTA</h1>
                            <p>Va a eliminar un usuario y con él sus registros. Acción irreversible</p>
                            <a className="btn" onClick={()=>{setConfirmacion(true)}} style={{margin:'0 auto'}}>Confirmar</a>
                        </div>
                        :acciones.map((x,i)=>{
                            let texto=(i==0 && seleccion.administrador?"Des":"")+x+(i==1?seleccion.operativo?"baja":"alta":"")
                            return <a className="btn" onClick={()=>{setAccion(x)}}>{texto.charAt(0).toUpperCase()+texto.slice(1)}</a>
                        })}
                        <Close onClick={()=>{setSeleccion(null)}} absolute={accion==acciones[2]}/>
                    </div>
                    :null
                }
            </dialog>
        </div>
    )
}