import { MessageCircle, Phone } from "lucide-react";

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return <span className={`relative inline-flex aspect-square ${className}`} aria-hidden="true"><MessageCircle className="absolute inset-0 size-full" strokeWidth={2.2} /><Phone className="absolute left-[30%] top-[29%] size-[42%]" strokeWidth={2.8} /></span>;
}
