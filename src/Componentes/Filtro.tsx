export type item=Record<"id" | "label" | "checked" | "visible",any>
interface Props{
    lista:item[]
    set:React.Dispatch<any>
}
export default function({lista,set}:Props){
    return <div className="desplegable" onClick={(e)=>{e.stopPropagation();}}>
                <div className="lista">
                    {lista.filter((y)=>y.visible).map((y)=>{
                        return <div onClick={()=>{set((prev: item[])=>{
                                    return prev.map((z:item)=>{
                                        if (z.id==y.id){
                                            z.checked=!y.checked
                                        }
                                        return z
                                    })
                                })}}><input type="checkbox" checked={y.checked}/>{y.label}</div>
                            })}
                </div>
                <div className="botones-filtrado">
                    <a className="btn" onClick={()=>{set((prev: item[])=>{
                        return prev.map((z)=>{
                            z.checked=!z.checked && z.visible
                            return z
                        })
                    })}}>Invertir</a>
                    <a className="btn" onClick={()=>{set((prev: item[])=>{
                        return prev.map((z)=>{
                            z.checked=true && z.visible
                            return z
                        })
                    })}}>Todos</a>
                </div>
            </div>
}