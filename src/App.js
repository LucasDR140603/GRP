import './App.css';
import Login from './Componentes/Login.tsx'
import Register from './Componentes/Register.tsx'
import Registros from './Componentes/Registros.tsx'
import Proyectos from './Componentes/Proyectos.tsx'
import Centros from './Componentes/Centros.tsx'
import Clientes from './Componentes/Clientes.tsx'
import Usuarios from './Componentes/Usuarios.tsx'
import DatosUsuario from './Componentes/DatosUsuario.tsx'
import {useData} from './DataContext.tsx';
import { useEffect,useState } from 'react';
import Cookies from 'js-cookie'
import api from './Api.tsx';
import { Route,Routes,Navigate,Link, useLocation } from 'react-router-dom';
import { BallTriangle } from 'react-loader-spinner';
import { fechaSQL,reemplazarAcentos, url } from './Funciones.tsx';
import Perfil from './Componentes/Perfil.tsx';
import logo from './logo.png'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { ThemeProvider,CssBaseline,Button,Stack } from '@mui/material';
import theme from './theme'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import * as React from 'react'
function App() {
  const id=React.useId()
  const buttonId=`${id}-button`
  const menuId=`${id}-menu`
  const [anchorEl,setAnchorEl]=useState(null)
  const open=Boolean(anchorEl)

  const ulr_datos_usuario='datos-usuario'
  const {deshacer_administrador,clientes,centros,proyectos,registros,usuario,usuarios,logout,cargando,prevuser}=useData()
  const enlaces=usuario==null?["Iniciar Sesión","Registrar"]:["Registros","Proyectos","Centros","Clientes"].concat(usuario.administrador?["Usuarios"]:[])
  const paginas=usuario==null?[<Login/>,<Register/>]:[<Registros/>,<Proyectos/>,<Centros/>,<Clientes/>].concat(usuario.administrador?[<Usuarios/>]:[])
  const location=useLocation().pathname.replace('/','')
  const [options,setOptions]=useState(false)
  return (
    <ThemeProvider theme={theme}>
      {/* <CssBaseline/> */}
      <div className="App" onClick={()=>{setOptions(false)}}>
        {cargando && Cookies.get('token')!=null?
          <div style={{margin:'0 auto',display:'flex',alignItems:'center',flex:'1'}}><BallTriangle
            height={100}
            width={100}
            radius={5}
            color="gold"
            ariaLabel="ball-triangle-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            />
          </div>:
          <>
          <header>
            <Tabs value={location} sx={{borderBottom:'1px solid rgba(255,255,255,0.25)','& .MuiTabs-indicator':{backgroundColor:'yellow'},'& .MuiTab-root':{'&.Mui-selected':{color:'yellow'}}}}>
              {enlaces.map((x,i)=><Tab label={x.toUpperCase()} value={i==0?'':url(x)} to={i==0?'':url(x)} component={Link}/>)}
            </Tabs>
            {/* <div className='enlaces'>
              {enlaces.map((x,i)=><Link className={location==url(x) || i==0 && location==""?'marcado':'enlace'} to={url(x)}>{x.toUpperCase()}</Link>)}
            </div> */}
            <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
              {usuario!=null?
              <>
              <Button aria-controls={options ? menuId : undefined} id={buttonId} aria-expanded={options} style={{display:'flex',gap:'0.5rem'}} aria-haspopup="true" onClick={(e)=>{e.stopPropagation();setOptions(!options);setAnchorEl(e.currentTarget)}}>
                <p>{usuario.nick}</p>
                <Perfil usuario={usuario}/>
              </Button>
              <Menu id={menuId} open={options} slotProps={{
                    list: {
                      'aria-labelledby': buttonId,
                    },
                    paper:{
                      sx:{
                        marginTop:'1rem'
                      }
                    }
                  }} anchorEl={anchorEl} open={open} onClose={()=>{setAnchorEl(null)}}>
                <MenuItem><Link to={ulr_datos_usuario}>Datos de Usuario</Link></MenuItem>
                <MenuItem onClick={(e)=>{setAnchorEl(null);logout()}}>Cerrar Sesión</MenuItem>
              </Menu>
                {/* {options && 
                <div className='desplegable useroptions' style={{top:'120%'}}>
                  <Link to={ulr_datos_usuario}>Datos de Usuario</Link>
                  <Link onClick={logout}>Cerrar Sesión</Link>
                </div>} */}
              </>
              :null}
              <Link to={'/'} style={{fontSize:0}}><Button style={{paddingBlock:0}}><img src={logo} className='logo'/></Button></Link>
            </div>
          </header>
          <main>
            <Routes>
              {paginas.map((x,i)=><Route path={i==0?'':`${url(enlaces[i])}`} element={x}/>)}
              <Route path='datos-usuario' element={usuario==null?<Navigate to='/' replace/>:<DatosUsuario/>}/>
              <Route path='*' element={<Navigate to='/' replace/>}/>
            </Routes>
          </main>
          </>}
      </div>
    </ThemeProvider>
  );
}
export default App;