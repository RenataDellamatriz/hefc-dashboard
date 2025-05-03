"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";
import { toast } from "sonner";

export function WithAuthRedirect({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && !pathname.includes("auth")) {
      router.push("/auth");
      toast("Sessão expirada.");
    }
  }, [isAuthenticated, router, pathname]);
  return children;
}
