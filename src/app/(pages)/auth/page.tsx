"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoginFormValues, useAuthContext } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/schema";
import { LoaderSpinner } from "@/components/common/loader-spinner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = useCallback(
    async ({ email, password }: LoginFormValues) => {
      try {
        setIsLoading(true);
        const token = await login({ email, password });

        if (!token) {
          throw new Error("Login failed");
        }
        toast("Login realizado com sucesso.");
        router.push("/");
      } catch (error) {
        toast(`Email ou senha incorretos. ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [login, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-4 text-white">
              <Lock size={24} />
            </div>
          </div>
          <CardTitle className="text-2xl">
            HEFC - Hospital Espirita Fabiano de Cristo
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Entre com suas credenciais para acessar o sistema
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(handleLogin)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nome@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="bg-blue-800 hover:bg-blue-800/90"
                disabled={isLoading}
              >
                {isLoading && <LoaderSpinner />}
                Entrar
              </Button>
            </form>
          </Form>

          <div className="text-sm text-muted-foreground mt-2 text-center">
            email: admin@email.com <br />
            senha: admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
