import axios from "axios";
import Cookies from "js-cookie";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  timeout: 300000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

if (typeof window !== "undefined") {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const is401 = error.response?.status === 401;

      if (is401) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
}

export default axiosInstance;
