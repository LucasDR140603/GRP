interface Props{
    val:boolean
    setVal:React.Dispatch<any>
    title:string
    title2?:string
}
export default function({val,setVal,title,title2=""}:Props){
    return( 
        <div style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
            <input type="checkbox" id={title} checked={val} onChange={(e)=>{setVal(!val);}}/>
            <label htmlFor={title} style={{margin:'0 0.2rem'}}>{title}</label>
            <label htmlFor={title} style={{margin:'0 0.2rem',cursor:'pointer'}}>{title2}</label>
        </div>
    )
}