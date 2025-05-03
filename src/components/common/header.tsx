import { SidebarTrigger } from "../ui/sidebar";

export function Header({ title }: { title: string }) {
  return (
    <header className="p-6 border-b flex items-center px-6 sticky top-0 z-10 bg-white">
      <SidebarTrigger className="w-10 h-10 flex items-center justify-center rounded-md border cursor-pointer" />
      <div className="ml-4">
        <h2 className="font-semibold text-2xl">{title}</h2>
      </div>
    </header>
  );
}
