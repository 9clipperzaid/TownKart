import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { getSupportSettings } from "@/lib/admin.functions";

export function FloatingContact() {
  const getSettings = useServerFn(getSupportSettings);
  const { data } = useQuery({
    queryKey: ["support-settings"],
    queryFn: () => getSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const phone = data?.phone ?? "+919999999999";
  const whatsapp = data?.whatsapp ?? phone;
  const email = data?.email ?? "support@townkart.app";
  const whatsappDigits = whatsapp.replace(/\D/g, "");

  return (
    <div className="fixed bottom-24 right-3 z-40 flex flex-col gap-2 lg:bottom-5">
      <a
        href={`tel:${phone}`}
        aria-label="Call support"
        title="Call support"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={`https://wa.me/${whatsappDigits}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp support"
        title="WhatsApp support"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-success text-success-foreground shadow-pop transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a
        href={`mailto:${email}`}
        aria-label="Email support"
        title="Email support"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-pop ring-1 ring-border transition-transform hover:scale-105"
      >
        <Mail className="h-5 w-5" />
      </a>
    </div>
  );
}
