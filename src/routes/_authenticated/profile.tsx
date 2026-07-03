import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldX,
  LayoutDashboard,
  Store,
  Bike,
  ClipboardList,
  FileText,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { userErrorMessage } from "@/lib/utils";
import { signOutClean } from "./route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth/login", search: { redirectTo: "/profile" } });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, email, address, is_verified, provider")
        .maybeSingle();
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      return (data ?? []).map((r) => r.role);
    },
  });

  const isAdmin = roles.some((r) => r === "admin" || r === "super_admin");
  const isVendor = roles.some((r) => r === "vendor" || r === "store_manager");
  const isDelivery = roles.some((r) => r === "delivery_partner" || r === "rider");
  const displayPhone = profile?.phone ? `+${profile.phone}` : "Not added";
  const displayEmail = profile?.email || "Not added";
  const isPhoneVerified = Boolean(profile?.is_verified);

  useEffect(() => {
    if (profile && !loaded) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ? `+${profile.phone}` : "");
      setAddress(profile.address ?? "");
      setLoaded(true);
    }
  }, [profile, loaded]);

  const save = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          address: address.trim() || null,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-address"] });
      toast.success("Profile saved");
    },
    onError: (e) => toast.error(userErrorMessage(e, "Could not save")),
  });

  const quickAction =
    "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-2 text-center text-xs font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-primary sm:p-3 sm:text-sm";
  const scrollToAddress = () =>
    document.getElementById("saved-address")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-secondary/70 to-primary/10" />
        <div className="-mt-9 flex items-end gap-4 px-5 pb-5 sm:px-7">
          <div className="bg-brand-gradient flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-4 border-card text-2xl font-extrabold text-primary-foreground shadow-card">
            {(fullName || "K").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pb-1">
            <h1 className="truncate text-xl font-extrabold sm:text-2xl">
              {fullName || "TownKart Customer"}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{displayPhone}</span>
            </p>
          </div>
        </div>
      </section>

      <div
        className={
          isPhoneVerified
            ? "mt-4 flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm text-success"
            : "mt-4 flex items-center gap-2 rounded-2xl bg-warning/15 px-4 py-3 text-sm text-warning-foreground"
        }
      >
        {isPhoneVerified ? (
          <ShieldCheck className="h-5 w-5 shrink-0" />
        ) : (
          <ShieldX className="h-5 w-5 shrink-0" />
        )}
        <span className="font-semibold">
          {isPhoneVerified ? "Phone verified" : "Phone not verified"} · Customer account
        </span>
      </div>

      <section className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
        <Link to="/orders" className={quickAction}>
          <QuickIcon icon={<ClipboardList className="h-5 w-5" />} /> My Orders
        </Link>
        <button type="button" onClick={scrollToAddress} className={quickAction}>
          <QuickIcon icon={<MapPin className="h-5 w-5" />} /> Saved Address
        </button>
        <button type="button" onClick={() => setLegalOpen((open) => !open)} className={quickAction}>
          <QuickIcon icon={<FileText className="h-5 w-5" />} /> Help & Legal
        </button>
      </section>

      <section className="mt-7">
        <SectionTitle>Profile details</SectionTitle>
        <div className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
          <Field label="Full name" icon={<User className="h-3.5 w-3.5" />} htmlFor="name">
            <Input
              id="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your name"
              className="h-12 bg-background"
            />
          </Field>
          <Field label="Phone number" icon={<Phone className="h-3.5 w-3.5" />} htmlFor="phone">
            <Input id="phone" type="tel" value={phone} className="h-12 bg-muted/50" readOnly />
            <p className="text-xs text-primary">This number is linked to your account.</p>
          </Field>
          <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />} htmlFor="email">
            <Input id="email" value={displayEmail} className="h-12 bg-muted/50" readOnly />
          </Field>
          <Field label="Default address" icon={<MapPin className="h-3.5 w-3.5" />} htmlFor="addr">
            <Textarea
              id="addr"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Flat / house no, street, area..."
              rows={3}
              className="bg-background"
            />
          </Field>
          <Button
            className="h-12 w-full rounded-xl"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </section>

      <section id="saved-address" className="mt-7 scroll-mt-24">
        <SectionTitle>Saved address</SectionTitle>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                Default
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {address.trim() || "No delivery address saved yet."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("addr")?.focus()}
              className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <SectionTitle>Help & legal</SectionTitle>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <button
            type="button"
            onClick={() => setLegalOpen((open) => !open)}
            aria-expanded={legalOpen}
            className="flex w-full items-center justify-between gap-3 p-4 text-left font-bold"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Terms & Privacy
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${legalOpen ? "rotate-180" : ""}`}
            />
          </button>
          {legalOpen && (
            <div className="border-t px-4 py-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                By using TownKart, you agree to provide accurate delivery details and pay for
                confirmed orders. Sellers are responsible for their listed products.
              </p>
              <p className="mt-2">
                TownKart connects customers, local sellers and delivery partners. Delivery timings
                may change because of factors outside our control.
              </p>
            </div>
          )}
        </div>
      </section>

      {isAdmin && (
        <DashboardButton to="/admin" className="mt-7" icon={<LayoutDashboard />}>
          Open Admin Panel
        </DashboardButton>
      )}
      {isVendor && (
        <DashboardButton to="/vendor" className="mt-3" icon={<Store />}>
          Open Vendor Dashboard
        </DashboardButton>
      )}
      {isDelivery && (
        <DashboardButton to="/delivery" className="mt-3" icon={<Bike />}>
          Open Delivery Dashboard
        </DashboardButton>
      )}

      <Button
        variant="ghost"
        className="mt-7 h-12 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => signOutClean(queryClient, navigate)}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function QuickIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function Field({
  label,
  icon,
  htmlFor,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-1.5">
        {icon} {label}
      </Label>
      {children}
    </div>
  );
}

function DashboardButton({
  to,
  className,
  icon,
  children,
}: {
  to: "/admin" | "/vendor" | "/delivery";
  className: string;
  icon: React.ReactElement<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant="outline" className={`${className} h-12 w-full rounded-xl`}>
      <Link to={to}>
        <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">{icon}</span> {children}
      </Link>
    </Button>
  );
}
