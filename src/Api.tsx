import axios,{AxiosInstance,InternalAxiosRequestConfig,AxiosResponse,AxiosError} from 'axios'

export const secure:boolean=true
export const host:string=`http${secure?'s':''}://${secure?'www.asinova.es':'localhost:8080'}`
export const url:string=`${host}/webapi`
const api:AxiosInstance=axios.create({
    baseURL:url,
    withCredentials:true
})
api.interceptors.request.use((config:InternalAxiosRequestConfig)=>{
    if (!(config.data instanceof FormData)){
        config.headers['Content-Type']='application/json'
    }
    return config
})
api.interceptors.response.use(
    (response:AxiosResponse)=>response,
    async (error:AxiosError)=>{
        const original:any=error.config
        if (error.response?.status===401 && original && !original._retry && !original.url?.includes('refresh')){
            original._retry=true
            try{
                await api.post(`refresh`)
                return api(original)
            }
            catch{
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)
export default api;