"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderSpinner } from "@/components/common/loader-spinner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/api";
import { toast } from "sonner";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = useCallback(
    async ({ email }: ForgotFormValues) => {
      try {
        setIsLoading(true);
        await forgotPassword(email);
        toast("Se o email existir, enviaremos instruções de recuperação.");
      } catch (e) {
        toast("Não foi possível solicitar a recuperação de senha.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Recuperar senha</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Informe seu email para enviarmos o link de recuperação
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="nome@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isLoading} className="bg-blue-800 hover:bg-blue-800/90">
                {isLoading && <LoaderSpinner />} Enviar
              </Button>
              <div className="text-center text-sm">
                <Link href="/auth" className="underline">Voltar ao login</Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;


