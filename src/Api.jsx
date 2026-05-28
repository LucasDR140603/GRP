import axios from 'axios'
import Cookies from 'js-cookie'
export const secure=true
export const host=`http${secure?'s':''}://${secure?'www.asinova.es':'localhost:8080'}`
export const url=`${host}/webapi`
const api=axios.create({
    baseURL:url
})
api.interceptors.request.use((config)=>{
    const token=Cookies.get("token")
    //console.log(token)
    if (!(config.data instanceof FormData)){
        config.headers['Content-Type']='application/json'
    }
    if (token) config.headers.Authorization=`Bearer ${token}`
    return config
})
api.interceptors.response.use(
    (response)=>response,
    async (error)=>{
        if (error.response?.status===401){
            const refreshToken=Cookies.get("refreshToken")
            if (!refreshToken) return Promise.reject(error)
            try{
                const res=await axios.post(`${url}/refresh`,{
                    "refreshToken":refreshToken
                })
                Cookies.set("token",res.data.token,{expires:1})
                error.config.headers.Authorization=`Bearer ${res.data.token}`
                return axios(error.config)
            }
            catch{
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)
export default api;