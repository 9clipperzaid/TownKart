import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/auth-profile";
import { userErrorMessage } from "@/lib/utils";
import { signOutClean } from "./route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loaded, setLoaded] = useState(false);

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

      const normalizedPhone = phone.trim() ? normalizePhoneNumber(phone) : null;
      if (phone.trim() && !isValidPhoneNumber(phone)) {
        throw new Error("Enter a valid phone number");
      }

      const phoneChanged = normalizedPhone !== (profile?.phone ?? null);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: normalizedPhone,
          address: address.trim() || null,
          is_verified: phoneChanged ? false : profile?.is_verified,
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

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3">
        <div className="bg-brand-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-primary-foreground shadow-card">
          {(fullName || "K").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold">{fullName || "TownKart Customer"}</h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{displayPhone}</span>
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{displayEmail}</span>
          </p>
        </div>
      </div>

      <div
        className={
          isPhoneVerified
            ? "mt-5 flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-sm text-success"
            : "mt-5 flex items-center gap-2 rounded-2xl bg-warning/15 p-3 text-sm text-warning-foreground"
        }
      >
        {isPhoneVerified ? (
          <ShieldCheck className="h-5 w-5 shrink-0" />
        ) : (
          <ShieldX className="h-5 w-5 shrink-0" />
        )}
        <span className="font-medium">
          {isPhoneVerified ? "Phone verified" : "Phone not verified"} - Customer account
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            <User className="mr-1 inline h-3.5 w-3.5" /> Full name
          </Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            <Phone className="mr-1 inline h-3.5 w-3.5" /> Phone number
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            <Mail className="mr-1 inline h-3.5 w-3.5" /> Email
          </Label>
          <Input id="email" value={displayEmail} className="h-12" readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr">
            <MapPin className="mr-1 inline h-3.5 w-3.5" /> Default address
          </Label>
          <Textarea
            id="addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Flat / house no, street, area..."
            rows={3}
          />
        </div>
        <Button className="h-12 w-full" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {isAdmin && (
        <Button asChild variant="outline" className="mt-6 h-12 w-full">
          <Link to="/admin">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Open Admin Panel
          </Link>
        </Button>
      )}

      {isVendor && (
        <Button asChild variant="outline" className="mt-3 h-12 w-full">
          <Link to="/vendor">
            <Store className="mr-2 h-4 w-4" /> Open Vendor Dashboard
          </Link>
        </Button>
      )}

      {isDelivery && (
        <Button asChild variant="outline" className="mt-3 h-12 w-full">
          <Link to="/delivery">
            <Bike className="mr-2 h-4 w-4" /> Open Delivery Dashboard
          </Link>
        </Button>
      )}

      <Button
        variant="ghost"
        className="mt-8 h-12 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => signOutClean(queryClient, navigate)}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}
