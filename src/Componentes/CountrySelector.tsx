import {useState,useMemo, ChangeEvent} from 'react'
import {getCountries,CountryCode} from 'libphonenumber-js'
import ReactContryFlag from 'react-country-flag'
import {Select,MenuItem,ListSubheader,TextField,SelectProps} from '@mui/material'
interface Props{
    value:CountryCode,
    onChange:SelectProps<CountryCode>['onChange']

}
const nombresPaises=new Intl.DisplayNames(['en'],{type:'region'})
export default function({value,onChange}:Props){
    const [busqueda,setBusqueda]=useState('')
    const filtrados=useMemo(()=>getCountries().filter((x)=>
        (nombresPaises.of(x) ?? '').toLowerCase().includes(busqueda.toLowerCase()) || x.toLowerCase().includes(busqueda.toLowerCase())
    ),[busqueda])
    return <Select<CountryCode> value={value} onChange={onChange} style={{width:'fit-content'}}
            MenuProps={{autoFocus:false,slotProps:{paper:{sx:{maxHeight:150}}}}}
            onClose={()=>setBusqueda('')}
            >
            <ListSubheader style={{padding:'0.5rem'}}>
                <TextField margin='none' size='small' autoFocus fullWidth label='Buscar' value={busqueda}
                    onChange={(e)=>setBusqueda(e.target.value)}
                    onKeyDown={(e)=>{if(e.key!=='Escape') e.stopPropagation()}}/>
            </ListSubheader>
            {filtrados.map((x)=>{
                return <MenuItem key={x} value={x}><div style={{display:'flex',gap:'0.25rem',alignItems:'center'}}><ReactContryFlag countryCode={x} svg/><a>{nombresPaises.of(x)}</a></div></MenuItem>
            })}
        </Select>
}