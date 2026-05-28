import './App.css';
import Login from './Componentes/Login.jsx'
import Register from './Componentes/Register.jsx'
import Registros from './Componentes/Registros.jsx'
import Proyectos from './Componentes/Proyectos.jsx'
import Centros from './Componentes/Centros.jsx'
import Clientes from './Componentes/Clientes.jsx'
import Usuarios from './Componentes/Usuarios.jsx'
import DatosUsuario from './Componentes/DatosUsuario.jsx'
import {useData} from './DataContext.jsx';
import { useEffect,useState } from 'react';
import Cookies from 'js-cookie'
import api from './Api.jsx';
import { Route,Routes,Navigate,Link, useLocation } from 'react-router-dom';
import { BallTriangle } from 'react-loader-spinner';
import { fechaSQL,reemplazarAcentos, url } from './Funciones.jsx';
import Perfil from './Componentes/Perfil.jsx';
import logo from './logo.png'
function App() {
  const ulr_datos_usuario='datos-usuario'
  const {deshacer_administrador,clientes,centros,proyectos,registros,usuario,usuarios,logout,cargando,prevuser}=useData()
  const enlaces=usuario==null?["Iniciar Sesión","Registrar"]:["Registros","Proyectos","Centros","Clientes"].concat(usuario.administrador?["Usuarios"]:[])
  const paginas=usuario==null?[<Login/>,<Register/>]:[<Registros/>,<Proyectos/>,<Centros/>,<Clientes/>].concat(usuario.administrador?[<Usuarios/>]:[])
  const location=useLocation().pathname.replace('/','')
  const [options,setOptions]=useState(false)
  return (
      <div className="App">
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
              <div className='userbox' onClick={()=>{setOptions(!options)}}>
                <p>{usuario.nick}</p>
                <Perfil usuario={usuario}/>
                {options?
                  <div className='desplegable useroptions' style={{top:'120%'}}>
                    <Link to={ulr_datos_usuario}>Datos de Usuario</Link>
                    <Link onClick={logout}>Cerrar Sesión</Link>
                  </div>
                :null}
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
