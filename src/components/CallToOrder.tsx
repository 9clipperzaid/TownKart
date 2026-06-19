import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Phone, MessageCircle } from "lucide-react";
import { getCallOrderSettings } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function indianPhone(value: string) {
  const digits = onlyDigits(value);
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function CallToOrder({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const fetchSettings = useServerFn(getCallOrderSettings);
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["call-order-settings"],
    queryFn: () => fetchSettings(),
  });

  if (!data?.is_enabled) return null;

  const primary = data.primary_phone || data.secondary_phone || data.whatsapp_number;
  if (!primary) return null;

  const callNumber = indianPhone(primary);
  const whatsAppNumber = indianPhone(data.whatsapp_number || primary);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Phone className="h-4 w-4" />
          Call to Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call to Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Phone number</p>
            <p className="mt-1 text-xl font-extrabold">{primary}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.available_from} - {data.available_to}
            </p>
          </div>
          {data.instructions && (
            <p className="text-sm text-muted-foreground">{data.instructions}</p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild>
              <a href={`tel:+${callNumber}`}>
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Order
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
