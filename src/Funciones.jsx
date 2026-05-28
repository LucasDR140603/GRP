import { parse } from "date-fns"
import * as xlsx from 'xlsx'
import {saveAs} from 'file-saver'
const dmaString="00/00/0000 00:00"
const dateString="0000-00-00T00:00"
const rango=Array.from({length:10},(_,i)=>""+i)
export function fechaSQL(str,dma=true){
    let string=str || (dma?dmaString:dateString)
    let campos=string.split(dma?' ':'T')
    let campos_dia=campos[0].split(dma?'/':'-')
    if (!dma){
        campos_dia.reverse()
    }
    return `${campos_dia[2]}-${campos_dia[1]}-${campos_dia[0]}T${campos[1]}`
}
export function numeros(str){
    return str.split('').filter((x)=>rango.includes(x)).reduce((x,y)=>x+y,"")
}
export function reemplazarAcentos(url) {
  return url
    .replace(/%C3%A1/g, 'á')
    .replace(/%C3%A9/g, 'é')
    .replace(/%C3%AD/g, 'í')
    .replace(/%C3%B3/g, 'ó')
    .replace(/%C3%BA/g, 'ú')
    .replace(/%C3%91/g, 'Ñ')
    .replace(/%C3%B1/g, 'ñ');
}
export function sin_acentos(str){
    let minuscula=str.toLowerCase()
    let indices=minuscula.split('').map((x,i)=>i).filter((x)=>minuscula[x]!=str[x])
    let no_acentos=minuscula.replaceAll('á','a').replaceAll('é','e').replaceAll('í','i').replaceAll('ó','o').replaceAll('ú','u')
    let transformado=str.length>0?no_acentos.split('').map((x,i)=>{
        let letra=x
        if (indices.includes(i)){
            letra=letra.toUpperCase()
        }
        return letra
    }).reduce((x,y)=>x+y):""
    return transformado
}
export function url(str){
    return str.toLowerCase().replaceAll(" ","-")
}
export function vacio(str){
    return str==null || str.replaceAll(" ","").length==0
}
export function inicio2000(){
    let fecha=new Date()
    fecha.setUTCFullYear(2000)
    fecha.setMonth(0)
    fecha.setDate(1)
    fecha.setUTCHours(0)
    fecha.setMinutes(0)
    fecha.setSeconds(0)
    fecha.setMilliseconds(0)
    return fecha
}
export function actual(){
    let fecha=new Date()
    fecha.setUTCHours(0)
    fecha.setMinutes(0)
    fecha.setSeconds(0)
    fecha.setMilliseconds(0)
    return fecha
}
export function bisiesto(y){
    return y%4==0 && !(y%100==0 && !y%400==0)
}
export function formatear(fecha,dias=0,hora=false){
    let d=fecha.getDate()+dias
    let m=fecha.getMonth()+1
    let y=fecha.getFullYear()
    if (d>31 || (d>(bisiesto(y)?29:28) && m==2)){
        d=1
        m+=1
        if (m>12){
            m=1
            y+=1
        }
    }
    else if (d==0){
        m-=1
        if (m==0){
            m=12
            y-=1
        }
        d=m==2?bisiesto(y)?29:28:(m%2==0 && m<8)?30:31
    }
    return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}${hora?`T${fecha.getHours().toString().padStart(2,'0')}:${fecha.getMinutes().toString().padStart(2,'0')}`:''}`
}
export function sumDias(fecha,dias){
    let f=parse(formatear(fecha,dias),'yyyy-MM-dd',new Date())
    return new Date(f.getTime()-f.getTimezoneOffset()*60000);
}
export function toExcel(data,fileName='registros.xlsx'){
    const worksheet=xlsx.utils.json_to_sheet(data)
    const workbook=xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook,worksheet,'Hoja1')
    const buffer=xlsx.write(workbook,{
        bookType:'xlsx',
        type:'array'
    })
    const blob=new Blob([buffer],{
        type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob,fileName)
}
export function comprobar(str){
    var notrim=str
    str=str.replaceAll(" ","")
    return notrim==str && str.length>=8 && str.toUpperCase()!=str && str.toLowerCase()!=str && /\d/.test(str) && /[^a-zA-Z0-9\s]/.test(str)
}
export function comprobar_telefono(telefono){
    return telefono.replaceAll(" ","").length==9 && telefono.toUpperCase()==telefono && telefono.toLowerCase()==telefono && !/[^a-zA-Z0-9\s]/.test(telefono)
}