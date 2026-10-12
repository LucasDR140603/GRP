import { useData } from "../DataContext.tsx"
import Perfil from "./Perfil.tsx"
import {MdMail,MdPhone,MdVerified} from 'react-icons/md'
import { useState,useEffect } from 'react'
import {parsePhoneNumberFromString,getCountryCallingCode} from 'libphonenumber-js'
import api from "../Api.tsx"
import Input from "./Input.tsx"
import { comprobar, sin_acentos, vacio } from "../Funciones.tsx"
import ReactFlagsSelect from 'react-flags-select'
import {TextField,Button,Dialog,DialogTitle,DialogContent,IconButton,Paper,Table,TableBody as Tbody,TableCell as Td,TableRow as Tr,TableContainer,Typography} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import {styled} from '@mui/material/styles'
const VisuallyHiddenInput=styled('input')({
    clipPath:'inset(50%)',
    height:1,
    overflow:'hidden',
    position:'absolute',
    bottom:0,
    left:0,
    whiteSpace:'nowrap',
    width:1
})
export default function(){
    const {usuario}=useData()
    const [edicion,setEdicion]=useState<string | null>(null)
    const [nuevo,setNuevo]=useState<any>(null)
    const [error,setError]=useState(false)
    const [acierto,setAcierto]=useState(false)
    const [mensaje,setMensaje]=useState('')
    const Editar=(campo:string)=>{
        let c=sin_acentos(campo.toLowerCase())
        let campos=[...(c=="nombre completo"?["nombre","apellido1","apellido2"]:c=="contraseña"?["clave","clave_repe"]:c=="telefono"?["pais","telefono"]:[c])]
        return <>
            <DialogTitle sx={{m:0,paddingBlock:0,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}} id='customized-dialog-title'>
                <p>EDITAR {campo.toUpperCase()}</p>
                <IconButton onClick={()=>{setEdicion(null)}}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers={true} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{display:'flex',flexDirection:c=="telefono"?'row':'column',gap:'0.5rem',alignItems:'center'}}>
                {campos.map((x,i)=>{
                    return x=="pais"?<ReactFlagsSelect className="banderas" searchable={true} selected={nuevo.pais} onSelect={(e)=>{setNuevo({...nuevo,pais:e})}}/>:<Input value={nuevo[x]} type={x=="telefono"?"tel":x.includes("clave")?"password":"text"} onChange={(e)=>{setNuevo({...nuevo,[x]:e})}} label={c=="contraseña"?i==0?"Contraseña":"Repetir contraseña":x} error={c=='contraseña' && i!=0?nuevo['clave_repe']!=nuevo['clave']:false}/>
                })}
                </div>
                <Button variant="outlined" style={{margin:'0rem auto',marginTop:'0.75rem',}} onClick={()=>{
                    let n={...nuevo,telefono:`+${getCountryCallingCode('ES')}${nuevo.telefono}`}
                    let e=false
                    if (c=="contraseña"){
                        if (vacio(n[campos[0]]) || n[campos[0]]!=n[campos[1]] || !comprobar(n[campos[0]])){
                            e=true
                            setError(true)
                            if (vacio(n[campos[0]])){
                                setMensaje("Contraseña vacía")
                            }
                            else if (n[campos[0]]!=n[campos[1]]){
                                setMensaje("Las contraseñas no coinciden")
                            }
                            else{
                                setMensaje("La contraseña debe tener como mínimo 8 caracteres, una mayúscula, una minúscula, un nº y un símbolo")
                            }
                        }
                    }
                    else{
                        if (c=="telefono"){
                            if (nuevo["telefono"].length<9){
                                e=true
                                setError(true)
                                setMensaje("El teléfono debe tener 9 dígitos")
                            }
                        }
                        delete n.clave
                    }
                    if (!e){
                        api.put('usuarios',n).then((res)=>{
                            setAcierto(true)
                            setMensaje(`${campo} editad${c=="contraseña"?"a":"o"} con éxito`)
                        }).catch((error)=>{
                            setMensaje("Campo repetido")
                            setError(true)
                        })
                    }
                }}>Confirmar</Button>
                
                {error || acierto?<p className={error?'red':'aqua'} style={{marginBottom:'0',textAlign:'center'}}>{mensaje}</p>:null}
            </DialogContent>
        </>
    }
    useEffect(()=>{
        if (edicion==null){
            setNuevo({...usuario,clave:"",clave_repe:"",telefono:usuario.telefono.slice(-9),pais:`${parsePhoneNumberFromString(usuario.telefono)!.country}`})
        }
    },[edicion])
    useEffect(()=>{
        setError(false)
        setAcierto(false)
        setMensaje('')
    },[nuevo])
    return (
        <div className="component">
            <h1>DATOS DE USUARIO</h1>
            <div className="column">
                <Perfil usuario={usuario} size={192}/>
                <input type="file" accept="image/*" onChange={(e:any)=>{
                    const file=e.target.files[0]
                    if (!file) return;
                    const formData=new FormData()
                    formData.append("foto",file)
                    api.put('usuarios/perfil',formData)
                }}/>
                {/* <Button
                    component='label'
                    role={undefined}
                    variant='contained'
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon/>}
                >
                    Upload files
                    <VisuallyHiddenInput

                    />
                </Button> */}
                <TableContainer sx={{width:'fit-content'}} component={Paper}>
                    <Table aria-label="tabla vertical de detalles">
                        <Tbody>
                            <Tr><Td component="th">Nick</Td><Td>{usuario.nick}</Td><Td><IconButton onClick={()=>{setEdicion("Nick")}}><EditIcon/></IconButton></Td></Tr>
                            <Tr><Td component="th">Nombre completo</Td><Td>{usuario.nombre} {usuario.apellido1} {usuario.apellido2}</Td><Td><IconButton onClick={()=>{setEdicion("Nombre completo")}}><EditIcon/></IconButton></Td></Tr>
                            <Tr><Td component="th"><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MdMail/>Email</div></Td><Td>{usuario.email}</Td><Td><IconButton onClick={()=>{setEdicion("Email")}}><EditIcon/></IconButton></Td></Tr>
                            <Tr><Td component="th"><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MdPhone/>Teléfono</div></Td><Td>{usuario.telefono}</Td><Td><IconButton onClick={()=>{setEdicion("Teléfono")}}><EditIcon/></IconButton></Td></Tr>
                            <Tr><Td component="th"><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MdVerified/>Administrador</div></Td><Td colSpan={2}>{usuario.administrador?"Sí":"No"}</Td></Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
                <Button variant='outlined' onClick={()=>{setEdicion("Contraseña")}}>Cambiar Contraseña</Button>
                <p></p>
            </div>
            <Dialog aria-labelledby="customized-dialog-title" open={edicion!=null} onClose={(event,reason)=>{
                if (reason && reason==='backdropClick'){
                    return;
                }
                setEdicion(null)
            }}>
                {edicion!=null?Editar(edicion!):null}
            </Dialog>
        </div>
    )
}