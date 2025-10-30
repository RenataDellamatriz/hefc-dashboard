"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";
import { toast } from "sonner";

export function WithAdminAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      toast("Você precisa estar logado para acessar esta página.");
      return;
    }

    if (user && !isAdmin) {
      router.push("/");
      toast("Acesso negado. Apenas administradores podem acessar esta página.");
      return;
    }
  }, [isAuthenticated, isAdmin, user, router]);
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}


