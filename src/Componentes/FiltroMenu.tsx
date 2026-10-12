import {Button,MenuItem,Checkbox,FormControlLabel} from '@mui/material'
export type item=Record<"id" | "label" | "checked" | "visible",any>
interface Props{
    lista:item[]
    set:React.Dispatch<any>
}
export default function({lista,set}:Props){
    return <>
        {lista.filter((y)=>y.visible).map((y)=>{
            return <MenuItem onClick={()=>{
                set((prev: item[])=>{
                return prev.map((z:item)=>{
                    if (z.id==y.id){
                        z.checked=!y.checked
                    }
                    return z
                })
            })
            }}>
                <Checkbox checked={y.checked}/>
                <label>{y.label}</label>
            </MenuItem>
        })}
        <MenuItem style={{position:'sticky',bottom:0,zIndex:2,background:'black',display:'flex',gap:'1rem',borderTop:'0.5px solid #f0ffff69'}}>
            <Button variant='outlined' style={{borderRadius:'50px'}} onClick={()=>{set((prev: item[])=>{
                return prev.map((z)=>{
                    z.checked=!z.checked && z.visible
                    return z
                })
            })}}>Invertir</Button>
            <Button variant='outlined' style={{borderRadius:'50px'}} onClick={()=>{set((prev: item[])=>{
                return prev.map((z)=>{
                    z.checked=true && z.visible
                    return z
                })
            })}}>Todos</Button>
        </MenuItem>
    </>
}