import axios from "axios";
import Cookies from "js-cookie";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
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
        console.log("401 detected, redirecting to signin");

        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        window.location.replace("/login");

        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
}

export default axiosInstance;
