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
function App() {
  const ulr_datos_usuario='datos-usuario'
  const {deshacer_administrador,clientes,centros,proyectos,registros,usuario,usuarios,logout,cargando,prevuser}=useData()
  const enlaces=usuario==null?["Iniciar Sesión","Registrar"]:["Registros","Proyectos","Centros","Clientes"].concat(usuario.administrador?["Usuarios"]:[])
  const paginas=usuario==null?[<Login/>,<Register/>]:[<Registros/>,<Proyectos/>,<Centros/>,<Clientes/>].concat(usuario.administrador?[<Usuarios/>]:[])
  const location=useLocation().pathname.replace('/','')
  const [options,setOptions]=useState(false)
  return (
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
            <div className='enlaces'>
              {enlaces.map((x,i)=><Link className={location==url(x) || i==0 && location==""?'marcado':'enlace'} to={url(x)}>{x.toUpperCase()}</Link>)}
            </div>
            <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
              {usuario!=null?
              <div className='userbox' onClick={(e)=>{e.stopPropagation();setOptions(!options)}}>
                <p>{usuario.nick}</p>
                <Perfil usuario={usuario}/>
                {options && 
                <div className='desplegable useroptions' style={{top:'120%'}}>
                  <Link to={ulr_datos_usuario}>Datos de Usuario</Link>
                  <Link onClick={logout}>Cerrar Sesión</Link>
                </div>}
              </div>
              :null}
              <Link to={'/'} style={{fontSize:0}}><img src={logo} className='logo'/></Link>
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
  );
}
export default App;