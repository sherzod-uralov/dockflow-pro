import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    Authorization: `Bearer ${Cookies?.get("accessToken")}`,
  },
});

export default axiosInstance;
