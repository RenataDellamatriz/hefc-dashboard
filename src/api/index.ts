import { LoginFormValues } from "@/context/auth-context";
import axios, { AxiosRequestConfig } from "axios";

export async function apiRequest<ResponseType>(config: AxiosRequestConfig) {
  const token = localStorage.getItem("bearerToken");

  const instance = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("bearerToken");

        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return;
      }

      return Promise.reject(error);
    }
  );

  return await instance<ResponseType>(config);
}

export async function signIn(data: LoginFormValues) {
  if (data.email === "admin@email.com" && data.password === "admin123") {
    return "token";
  }
  return "";
}

export async function signOut() {
  return true;
}
