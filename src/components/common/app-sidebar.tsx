import {
  ChartBar,
  Users,
  FileText,
  Home,
  CalendarClock,
  SquareLibrary,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useAuthContext } from "@/context/auth-context";

export const menuItems = [
  {
    title: "Visão geral",
    icon: Home,
    url: "/",
  },
  {
    title: "Pacientes",
    icon: Users,
    url: "/pacientes",
  },
  {
    title: "Atendimentos",
    icon: CalendarClock,
    url: "/atendimentos",
  },
  {
    title: "Doações",
    icon: ChartBar,
    url: "/doacoes",
  },
  {
    title: "Empréstimos",
    icon: FileText,
    url: "/emprestimos",
  },
  {
    title: "Oficinas",
    icon: SquareLibrary,
    url: "/oficinas",
  },
];

export function AppSidebar() {
  const { logout } = useAuthContext();
  return (
    <Sidebar className="p-4 bg-sidebar">
      <SidebarHeader>
        <Image
          src="/assets/logo/logo-hospital.png"
          alt="Logo"
          width={180}
          height={50}
        />
      </SidebarHeader>
      <SidebarContent className="pt-6">
        <SidebarGroup className="flex justify-center gap-4">
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex justify-center gap-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex justify-center gap-4">
        <SidebarMenu className="flex justify-center gap-4">
          <SidebarMenuItem key={"Sair"}>
            <SidebarMenuButton asChild>
              <a href={"/auth"} onClick={logout}>
                <LogOut />
                <span>Sair</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
