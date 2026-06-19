import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { verifyOtp, sendOtp } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { userErrorMessage } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const searchSchema = z.object({
  phone: z.string(),
  name: z.string().optional(),
  dev: z.string().optional(),
});

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Verify - TownKart" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { phone, name, dev } = Route.useSearch();
  const verify = useServerFn(verifyOtp);
  const resend = useServerFn(sendOtp);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(value: string) {
    setLoading(true);
    try {
      const { email, password } = await verify({
        data: { phone, code: value, fullName: name },
      });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries();
      toast.success("You're in!");
      navigate({ to: "/home", replace: true });
    } catch (err) {
      toast.error(userErrorMessage(err, "Verification failed"));
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      const res = await resend({ data: { phone } });
      toast.success("New code sent");
      if (res.devMode) {
        navigate({ to: "/auth/verify", search: { phone, name, dev: res.devCode } });
      }
    } catch (err) {
      toast.error(userErrorMessage(err, "Could not resend"));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5">
      <div className="flex items-center gap-3 pt-5">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/auth/login">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Logo showText={false} />
      </div>

      <div className="flex flex-1 flex-col justify-center pb-16">
        <h1 className="text-3xl font-extrabold">Enter code</h1>
        <p className="mt-2 text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-foreground">{phone}</span>
        </p>

        {dev && (
          <div className="mt-5 rounded-2xl border border-dashed border-accent bg-accent/10 p-3 text-sm">
            <span className="font-semibold text-accent-foreground">
              Dev mode:
            </span>{" "}
            no SMS provider connected yet — your code is{" "}
            <span className="font-mono font-bold">{dev}</span>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) submit(v);
            }}
            disabled={loading}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          size="lg"
          className="mt-8 h-13 w-full text-base"
          disabled={code.length !== 6 || loading}
          onClick={() => submit(code)}
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>

        <button
          onClick={handleResend}
          className="mt-5 text-center text-sm font-medium text-primary"
        >
          Didn't get it? Resend code
        </button>
      </div>
    </div>
  );
}
