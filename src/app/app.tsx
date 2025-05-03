"use client";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Header } from "@/components/common/header";
import { WithAuthRedirect } from "@/components/hoc/with-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/auth-context";
import { useCurrentPageTitle } from "@/hooks/use-current-page-title";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function App({ children }: { children: React.ReactNode }) {
  const { hasMounted } = useHasMounted();

  const title = useCurrentPageTitle();
  const isAuthPath = usePathname().includes("/auth");

  if (!hasMounted) {
    return <LoadingScreen />;
  }

  function LoadingScreen() {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <span className="text-center text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <AuthProvider>
      <WithAuthRedirect>
        <SidebarProvider>
          {!isAuthPath && <AppSidebar />}
          <>
            {hasMounted ? (
              <>
                <div className={`flex-1 flex flex-col w-full`}>
                  <main className="flex-grow">
                    {!isAuthPath && <Header title={title} />}

                    <div className="w-full p-6">{children}</div>
                  </main>
                </div>
              </>
            ) : (
              <LoadingScreen />
            )}
          </>
        </SidebarProvider>
        <Toaster />
      </WithAuthRedirect>
    </AuthProvider>
  );
}
