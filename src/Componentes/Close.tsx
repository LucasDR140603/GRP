import {IoMdCloseCircle} from 'react-icons/io'
interface Props{
    onClick:React.MouseEventHandler
    absolute?:boolean
    color?:string
}
export default function({onClick,absolute=false,color='azure'}:Props){
    return <IoMdCloseCircle cursor={'pointer'} size={25} onClick={onClick} style={{...(absolute?{position:'absolute',right:'1rem',top:'1rem'}:{}),color:color}}/>
}