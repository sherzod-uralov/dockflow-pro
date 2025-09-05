import axios from "axios";
import Cookie from "js-cookie";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookie.get("access_token");
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default axiosInstance;