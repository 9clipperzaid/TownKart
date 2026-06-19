import townKartLogo from "@/assets/townkart-logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
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
    </span>
  );
}
