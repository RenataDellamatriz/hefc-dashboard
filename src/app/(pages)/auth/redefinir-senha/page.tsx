"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderSpinner } from "@/components/common/loader-spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/api";
import Link from "next/link";

const schema = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof schema>;

const RedefinirSenhaPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = useCallback(
    async ({ password }: ResetFormValues) => {
      if (!token) {
        toast("Token inválido ou ausente.");
        return;
      }
      try {
        setIsLoading(true);
        await resetPassword(password, token);
        toast("Senha redefinida com sucesso. Faça login novamente.");
        router.push("/auth");
      } catch {
        toast("Não foi possível redefinir sua senha.");
      } finally {
        setIsLoading(false);
      }
    },
    [router, token]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Redefinir senha</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Defina uma nova senha para sua conta
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirme sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={isLoading}
                className="bg-blue-800 hover:bg-blue-800/90"
              >
                {isLoading && <LoaderSpinner />} Redefinir senha
              </Button>
              <div className="text-center text-sm">
                <Link href="/auth" className="underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedefinirSenhaPage;
