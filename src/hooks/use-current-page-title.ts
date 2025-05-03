import { menuItems } from "@/components/common/app-sidebar";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useCurrentPageTitle() {
  const pathname = usePathname();

  const title = useMemo(() => {
    const currentItem = menuItems.find((item) => item.url === pathname);
    return currentItem?.title || "";
  }, [pathname]);

  return title;
}
