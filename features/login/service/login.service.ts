import { LoginBody } from "@/features/login/type/login.type";
import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface RefreshTokenResponse {
  accessToken: string;
}

const tokenUtils = {
  ACCESS_TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",
  USER_KEY: "user",

  setTokens(accessToken: string, refreshToken: string, user: any): void {
    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: 15 / (24 * 60),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  },

  setAccessToken(accessToken: string): void {
    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: 15 / (24 * 60),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  getAccessToken(): string | undefined {
    return Cookies.get(this.ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | undefined {
    return Cookies.get(this.REFRESH_TOKEN_KEY);
  },

  getUser(): any {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  clearTokens(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.USER_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

export const authService = {
  login: async (data: LoginBody): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
        endpoints.auth.login,
        data
      );

      if (response.data.accessToken && response.data.refreshToken) {
        tokenUtils.setTokens(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = tokenUtils.getRefreshToken();

      if (!refreshToken) {
        throw new Error("Refresh token topilmadi");
      }

      const response = await axiosInstance.post<RefreshTokenResponse>(
        endpoints.auth.refreshToken,
        { refreshToken }
      );

      if (response.data.accessToken) {
        tokenUtils.setAccessToken(response.data.accessToken);
        return response.data.accessToken;
      }

      throw new Error("Token yangilash muvaffaqiyatsiz");
    } catch (error) {
      tokenUtils.clearTokens();
      throw error;
    }
  },

  getProfile: async () => {
    const { data } = await axiosInstance.get(endpoints.auth.profile.list);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenUtils.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  updateProfile: async (payload: any): Promise<any> => {
    const { data } = await axiosInstance.patch(endpoints.auth.profile.update, payload);
    return data;
  },

  getAccessToken: (): string | undefined => {
    return tokenUtils.getAccessToken();
  },

  getRefreshToken: (): string | undefined => {
    return tokenUtils.getRefreshToken();
  },

  getUser: (): any => {
    return tokenUtils.getUser();
  },

  isAuthenticated: (): boolean => {
    return tokenUtils.isAuthenticated();
  },

  clearTokens: (): void => {
    tokenUtils.clearTokens();
  },
};

export interface ProfileBody { }
