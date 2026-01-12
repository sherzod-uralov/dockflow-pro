import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authService } from "@/features/login/service/login.service";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  timeout: 30000,
});

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    const isAuthRoute = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
    ].some(route => originalRequest.url?.includes(route));
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Agar logout jarayonida bo'lsa, barcha so'rovlarni bekor qilamiz
    if (isLoggingOut) {
      return Promise.reject(new Error('Logout in progress'));
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await authService.refreshToken();

        if (!newAccessToken) {
          throw new Error("Token yangilash muvaffaqiyatsiz");
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);

        // Refresh token ham muddati tugagan bo'lsa, xabar ko'rsatmasdan logout qilamiz
        // logout() funksiyasi o'zi login sahifasiga yo'naltiradi
        if (typeof window !== 'undefined' && !isLoggingOut) {
          isLoggingOut = true;
          authService.logout().finally(() => {
            isLoggingOut = false;
          });
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
