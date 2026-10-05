import { parse } from "date-fns"
import * as xlsx from 'xlsx-js-style'
import {saveAs} from 'file-saver'
const dmaString="00/00/0000 00:00"
const dateString="0000-00-00T00:00"
const rango=Array.from({length:10},(_,i)=>""+i)
export function fechaSQL(str:string,dma=true):string{
    let string=str || (dma?dmaString:dateString)
    let campos=string.split(dma?' ':'T')
    let campos_dia=campos[0].split(dma?'/':'-')
    if (!dma){
        campos_dia.reverse()
    }
    return `${campos_dia[2]}-${campos_dia[1]}-${campos_dia[0]}T${campos[1]}`
}
export function numeros(str:string):string{
    return str.split('').filter((x)=>rango.includes(x)).reduce((x,y)=>x+y,"")
}
export function reemplazarAcentos(url:string):string{
  return url
    .replace(/%C3%A1/g, 'á')
    .replace(/%C3%A9/g, 'é')
    .replace(/%C3%AD/g, 'í')
    .replace(/%C3%B3/g, 'ó')
    .replace(/%C3%BA/g, 'ú')
    .replace(/%C3%91/g, 'Ñ')
    .replace(/%C3%B1/g, 'ñ');
}
export function sin_acentos(str:string):string{
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
export function url(str:string):string{
    return str.toLowerCase().replaceAll(" ","-")
}
export function vacio(str:string):boolean{
    return str==null || str.replaceAll(" ","").length==0
}
export function inicio2000():Date{
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
export function inicio_mes_actual():Date{
    let fecha=new Date()
    fecha.setDate(1)
    fecha.setUTCHours(0)
    fecha.setMinutes(0)
    fecha.setSeconds(0)
    fecha.setMilliseconds(0)
    return fecha
}
export function actual():Date{
    let fecha=new Date()
    fecha.setUTCHours(0)
    fecha.setMinutes(0)
    fecha.setSeconds(0)
    fecha.setMilliseconds(0)
    return fecha
}
export function bisiesto(y:number):boolean{
    return y%4==0 && !(y%100==0 && !(y%400==0))
}
export function formatear(fecha:Date,dias:number=0,hora:boolean=false){
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
        d=m==2?bisiesto(y)?29:28:((m%2==0 && m<8) || (m%2==1 && m>8))?30:31
    }
    return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}${hora?`T${fecha.getHours().toString().padStart(2,'0')}:${fecha.getMinutes().toString().padStart(2,'0')}`:''}`
}
export function sumDias(fecha:Date,dias:number){
    let f=parse(formatear(fecha,dias),'yyyy-MM-dd',new Date())
    return new Date(f.getTime()-f.getTimezoneOffset()*60000);
}
export function toExcel(data:any[],fileName='registros.xlsx',title='',subtitles:string[]=[],parte_trabajo:boolean=false){
    const worksheet=xlsx.utils.aoa_to_sheet([])
    xlsx.utils.sheet_add_aoa(worksheet,[[title]],{origin:'A2'})
    worksheet['A2'].s={
        font:{bold:true}
    }
    subtitles.forEach((element,i) => {
        let fila='A'+(i+3)
        xlsx.utils.sheet_add_aoa(worksheet,[[element]],{origin:fila})
        worksheet[fila].s={
            font:{sz:9,italic:true}
        }
    });
    xlsx.utils.sheet_add_json(worksheet,data,{origin:'A6'})
    const borderStyle={style:'thin',color:{rgb:'000000'}}
    const borderStyle2={style:'medium',color:{rgb:'000000'}}
    const borde={
        top:borderStyle,
        bottom:borderStyle,
        left:borderStyle,
        right:borderStyle
    }
    const borde2={
        top:borderStyle2,
        bottom:borderStyle2,
        left:borderStyle2,
        right:borderStyle2
    }
    if (data && data.length>0){
        const keys=Object.keys(data[0])
        keys.forEach((key,i)=>{
            const cellAddress=xlsx.utils.encode_cell({r:5,c:i})
            worksheet[cellAddress].s={
                font:{bold:true,color:{rgb:key.toLowerCase()=='ihe'?'FF0000':'000000'}},
                fill:{fgColor:{rgb:'E7E6E6'},},
                border:borde,
                alignment:{
                    wrapText:true,
                    vertical: 'top',
                }
            }
        })
        data.forEach((x,i)=>{
            keys.forEach((key,j)=>{
                const cellAddress=xlsx.utils.encode_cell({
                    r:6+i,
                    c:j
                })
                worksheet[cellAddress].s={
                    border:borde,
                    alignment:{
                        wrapText:true,
                        vertical: 'top',
                    }
                }
            })
        })
        if (parte_trabajo){
            let ultimo_dato=6+data.length
            let fila_sumas=ultimo_dato+2
            let indice_sumas=fila_sumas-1
            for(let i=4;i<8;i++){
                const cellAddress=xlsx.utils.encode_cell({r:indice_sumas,c:i})
                const letraColumna=xlsx.utils.encode_col(i)
                worksheet[cellAddress]={
                    t:'n',
                    f:`SUM(${letraColumna}7:${letraColumna}${ultimo_dato})`,
                    v:0,
                    s:{
                        font:{bold:true,color:{rgb:i==7?'FF0000':'000000'}},
                        fill:{fgColor:{rgb:'E7E6E6'}},
                        border:borde
                    }
                }
                const tarifaAddress=xlsx.utils.encode_cell({r:indice_sumas+1,c:i})
                const totalAddress=xlsx.utils.encode_cell({r:indice_sumas+2,c:i})
                if (i==4){
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+1,c:3})]={
                        v:'TARIFA',
                        s:{
                            fill:{fgColor:{rgb:'D9E1F2'}},
                            border:borde
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+2,c:3})]={
                        v:'TOTAL',
                        s:{
                            fill:{fgColor:{rgb:'D9E1F2'}},
                            border:borde
                        }
                    }
                }
                worksheet[tarifaAddress]={
                    t:'n',
                    v:0,
                    s:{
                        fill:{fgColor:{rgb:'D9E1F2'}},
                        border:borde
                    }
                }
                worksheet[totalAddress]={
                    t:'n',
                    v:0,
                    f:`${cellAddress}*${tarifaAddress}`,
                    s:{
                        fill:{fgColor:{rgb:'D9E1F2'}},
                        border:borde
                    }
                }
                worksheet[xlsx.utils.encode_cell({r:indice_sumas+5,c:i})]={
                    v:i==4?'TOTAL':'',
                    s:{
                        font:{bold:true},
                        fill:{fgColor:{rgb:'FCE4D6'}}
                    }
                }
                if (i==7){
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+2,c:8})]={
                        t:'n',
                        v:0,
                        f:`SUM(E${fila_sumas+2}:H${fila_sumas+2})`,
                        s:{
                            fill:{fgColor:{rgb:'D9E1F2'}},
                            border:borde
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+5,c:8})]={
                        t:'n',
                        v:0,
                        f:`SUM(I${fila_sumas}:I${fila_sumas+2})`,
                        s:{
                            font:{bold:true},
                            fill:{fgColor:{rgb:'FCE4D6'}},
                            border:borde2
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+5,c:9})]={
                        v:'€ + IVA',
                        s:{
                            font:{bold:true},
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+4,c:11})]={
                        v:'IVA',
                        s:{
                            border:borde2
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+4,c:12})]={
                        v:'TOTAL+IVA',
                        s:{
                            border:borde2
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+5,c:11})]={
                        t:'n',
                        v:0,
                        f:`I${fila_sumas+5}*0.21`,
                        s:{
                            fill:{fgColor:{rgb:'FCE4D6'}},
                            border:borde2
                        }
                    }
                    worksheet[xlsx.utils.encode_cell({r:indice_sumas+5,c:12})]={
                        t:'n',
                        v:0,
                        f:`SUM(I${fila_sumas+5}:L${fila_sumas+5})`,
                        s:{
                            fill:{fgColor:{rgb:'FCE4D6'}},
                            border:borde2
                        }
                    }
                }
            }
            // Volvemos a codificar el rango y lo guardamos en la hoja (ejemplo actualizado: "A2:H18")
            worksheet['!ref'] = `A1:M${fila_sumas+5}`
        }
    }
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
export function comprobar(str:string){
    var notrim=str
    str=str.replaceAll(" ","")
    return notrim==str && str.length>=8 && str.toUpperCase()!=str && str.toLowerCase()!=str && /\d/.test(str) && /[^a-zA-Z0-9\s]/.test(str)
}
export function comprobar_telefono(telefono:string){
    return telefono.replaceAll(" ","").length==9 && telefono.toUpperCase()==telefono && telefono.toLowerCase()==telefono && !/[^a-zA-Z0-9\s]/.test(telefono)
}