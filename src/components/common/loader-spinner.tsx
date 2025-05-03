import { Loader } from "lucide-react";

export function LoaderSpinner({color = 'black'}: {color?: string}) {
  return (
    <Loader className="animate-spin" size={20} strokeWidth={2} color={color} />
  );
}
