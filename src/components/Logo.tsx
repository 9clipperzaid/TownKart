import townKartLogo from "@/assets/townkart-logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  showTagline = false,
}: {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label="TownKart">
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-card ring-1 ring-border">
        <img src={townKartLogo} alt="" className="h-full w-full object-cover" loading="eager" />
      </span>
      {showText && (
        <span className="font-display text-xl font-extrabold tracking-tight">
          Town<span className="text-primary">Kart</span>
        </span>
      )}
      {showTagline && (
        <span className="whitespace-nowrap border-l border-border pl-2 text-[9px] font-semibold leading-3 text-muted-foreground sm:text-[10px]">
          Nehtaur&apos;s First Online Store
        </span>
      )}
    </span>
  );
}
