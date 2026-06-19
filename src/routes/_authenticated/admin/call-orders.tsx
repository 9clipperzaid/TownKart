import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { adminSaveCallOrderSettings, getCallOrderSettings } from "@/lib/admin.functions";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/call-orders")({
  component: CallOrdersPage,
});

type FormState = {
  primary_phone: string;
  secondary_phone: string;
  whatsapp_number: string;
  is_enabled: boolean;
  available_from: string;
  available_to: string;
  instructions: string;
};

const EMPTY: FormState = {
  primary_phone: "",
  secondary_phone: "",
  whatsapp_number: "",
  is_enabled: true,
  available_from: "09:00",
  available_to: "21:00",
  instructions: "",
};

function CallOrdersPage() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getCallOrderSettings);
  const saveSettings = useServerFn(adminSaveCallOrderSettings);
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["call-order-settings"],
    queryFn: () => getSettings(),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      primary_phone: data.primary_phone ?? "",
      secondary_phone: data.secondary_phone ?? "",
      whatsapp_number: data.whatsapp_number ?? "",
      is_enabled: data.is_enabled,
      available_from: data.available_from ?? "09:00",
      available_to: data.available_to ?? "21:00",
      instructions: data.instructions ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveSettings({ data: form }),
    onSuccess: () => {
      toast.success("Call order settings saved");
      qc.invalidateQueries({ queryKey: ["call-order-settings"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Call Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage phone and WhatsApp ordering availability.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        {isLoading ? (
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <p className="font-semibold">Enable Call Ordering</p>
                <p className="text-xs text-muted-foreground">
                  Show Call to Order buttons in the customer app.
                </p>
              </div>
              <Switch
                checked={form.is_enabled}
                onCheckedChange={(is_enabled) => setForm({ ...form, is_enabled })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Primary phone"
                value={form.primary_phone}
                onChange={(primary_phone) => setForm({ ...form, primary_phone })}
              />
              <Field
                label="Secondary phone"
                value={form.secondary_phone}
                onChange={(secondary_phone) => setForm({ ...form, secondary_phone })}
              />
              <Field
                label="WhatsApp number"
                value={form.whatsapp_number}
                onChange={(whatsapp_number) => setForm({ ...form, whatsapp_number })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Available from"
                  value={form.available_from}
                  onChange={(available_from) => setForm({ ...form, available_from })}
                  type="time"
                />
                <Field
                  label="Available to"
                  value={form.available_to}
                  onChange={(available_to) => setForm({ ...form, available_to })}
                  type="time"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Call order instructions</Label>
              <Textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                rows={4}
                placeholder="Ask customers for items, quantities, address and payment preference."
              />
            </div>

            <Button disabled={save.isPending || !form.primary_phone} onClick={() => save.mutate()}>
              {save.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save settings
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        {type === "text" && (
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={type === "text" ? "pl-9" : ""}
        />
      </div>
    </div>
  );
}
