export default function({val,setVal,title,title2,onChange=(v)=>{},enabled=true}){
    return( 
        <div style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
            <input type="checkbox" disabled={!enabled} id={title} checked={val} onChange={(e)=>{setVal(!val);onChange(!val)}}/>
            <label htmlFor={title} style={{margin:'0 0.2rem'}}>{title}</label>
            <label htmlFor={title} style={{margin:'0 0.2rem',cursor:'pointer'}}>{title2}</label>
        </div>
    )
}