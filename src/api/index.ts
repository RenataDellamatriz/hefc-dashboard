import { LoginFormValues } from "@/context/auth-context";

export async function signIn(data: LoginFormValues) {
  if (data.email === "admin@email.com" && data.password === "admin123") {
    return "token";
  }
  return "";
}

export async function signOut() {
  return true;
}
