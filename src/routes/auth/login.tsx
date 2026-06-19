import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  isValidPhoneNumber,
  clearPendingGooglePhone,
  storePendingGooglePhone,
} from "@/lib/auth-profile";
import { userErrorMessage } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/login")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      throw redirect({ to: "/home" });
    }
  },
  head: () => ({
    meta: [
      { title: "Log in - TownKart" },
      { name: "description", content: "Sign in to TownKart with Google." },
    ],
  }),
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  async function handleGoogleLogin() {
    if (!isValidPhoneNumber(phone)) {
      toast.error("Enter a valid phone number before continuing");
      return;
    }

    setLoading(true);
    try {
      storePendingGooglePhone(phone);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err) {
      clearPendingGooglePhone();
      setLoading(false);
      toast.error(userErrorMessage(err, "Google sign-in failed"));
    }
  }

  /*
   * Future Phone OTP Login
   * Re-enable the phone state, submit handler, and verify route link when SMS
   * auth is ready for production.
   *
   * // Future Phone OTP Login
   * // await supabase.auth.signInWithOtp({
   * //   phone: phoneNumber,
   * // });
   *
   * // Future OTP Verification
   * // await supabase.auth.verifyOtp({
   * //   phone: phoneNumber,
   * //   token: otp,
   * //   type: "sms",
   * // });
   */

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5">
      <div className="flex items-center gap-3 pt-5">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Logo showText={false} />
      </div>

      <div className="flex flex-1 flex-col justify-center pb-16">
        <p className="mb-6 font-display text-4xl font-extrabold tracking-tight">
          Town<span className="text-primary">Kart</span>
        </p>
        <h1 className="text-3xl font-extrabold">Welcome 👋</h1>
        <p className="mt-2 text-muted-foreground">Sign in to continue with TownKart</p>

        <div className="mt-8 space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-muted/35 p-4">
            <div>
              <h2 className="text-sm font-bold">Add your phone number</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll save it with your Google account for order updates.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-12 pl-9"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-13 w-full justify-center gap-3 rounded-2xl border-border bg-white text-base font-bold text-foreground shadow-card hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              onClick={handleGoogleLogin}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              <span>{loading ? "Connecting..." : "Continue with Google"}</span>
            </Button>
          </section>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold uppercase text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <section
            className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/25 p-4 opacity-70"
            aria-disabled="true"
          >
            <div>
              <h2 className="text-sm font-bold">Phone OTP Login (Coming Soon)</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                OTP verification is kept in the codebase and can be enabled later.
              </p>
            </div>
            <Button type="button" size="lg" className="h-13 w-full text-base" disabled>
              Send OTP
            </Button>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to TownKart&apos;s Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
