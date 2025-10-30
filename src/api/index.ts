import { LoginFormValues } from "@/context/auth-context";
import axios, { AxiosRequestConfig } from "axios";
import { User } from "@/types/user";

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

export async function signIn(data: any) {
  const { data: token } = await apiRequest<string>({
    method: "POST",
    url: "/user/signin",
    data,
  });

  return token;
}

export async function getUserData() {
  const { data: user } = await apiRequest<User>({
    method: "GET",
    url: `/user`,
  });

  return user
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> {
  const response = await apiRequest<User>({
    method: "POST",
    url: "/user/signup",
    data: userData,
  });

  return response.data;
}

export async function signOut() {
  return true;
}

// ADMIN: listar todos os usuários
export async function getAllUsers(): Promise<User[]> {
  const response = await apiRequest<User[]>({
    method: "GET",
    url: "/users",
  });

  return response.data;
}

// ADMIN: remover usuário colaborador por id (nunca admins)
export async function deleteUser(userId: string): Promise<void> {
  await apiRequest<void>({
    method: "DELETE",
    url: `/user/${userId}`,
  });
}
