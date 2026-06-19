import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  adminSaveHomeBanners,
  adminSavePaymentSettings,
  adminSaveSupportSettings,
  getHomeBanners,
  getPaymentSettings,
  getSupportSettings,
} from "@/lib/admin.functions";
import { userErrorMessage } from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getSupportSettings);
  const getBanners = useServerFn(getHomeBanners);
  const getPayments = useServerFn(getPaymentSettings);
  const saveSettings = useServerFn(adminSaveSupportSettings);
  const saveBanners = useServerFn(adminSaveHomeBanners);
  const savePayments = useServerFn(adminSavePaymentSettings);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("TownKart");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [banners, setBanners] = useState<
    {
      id: string;
      title: string;
      subtitle: string;
      image_url: string;
      is_enabled: boolean;
      sort_order: number;
    }[]
  >([]);

  const { data } = useQuery({
    queryKey: ["support-settings"],
    queryFn: () => getSettings(),
  });

  const { data: bannerData } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => getBanners(),
  });

  const { data: paymentData } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => getPayments(),
  });

  useEffect(() => {
    if (!data) return;
    setPhone(data.phone);
    setWhatsapp(data.whatsapp);
    setEmail(data.email);
  }, [data]);

  useEffect(() => {
    if (!bannerData) return;
    setBanners(
      bannerData
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((banner, index) => ({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle ?? "",
          image_url: banner.image_url ?? "",
          is_enabled: banner.is_enabled,
          sort_order: banner.sort_order ?? index + 1,
        })),
    );
  }, [bannerData]);

  useEffect(() => {
    if (!paymentData) return;
    setCodEnabled(paymentData.cod_enabled);
    setOnlineEnabled(paymentData.online_enabled);
    setUpiId(paymentData.upi_id ?? "");
    setPayeeName(paymentData.payee_name ?? "TownKart");
    setPaymentInstructions(paymentData.instructions ?? "");
  }, [paymentData]);

  const save = useMutation({
    mutationFn: () => saveSettings({ data: { phone, whatsapp, email } }),
    onSuccess: () => {
      toast.success("Support settings saved");
      qc.invalidateQueries({ queryKey: ["support-settings"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const saveHomeBanners = useMutation({
    mutationFn: () =>
      saveBanners({
        data: {
          banners: banners.map((banner, index) => ({
            ...banner,
            sort_order: index + 1,
            subtitle: banner.subtitle || null,
            image_url: banner.image_url || null,
          })),
        },
      }),
    onSuccess: () => {
      toast.success("Home banners saved");
      qc.invalidateQueries({ queryKey: ["home-banners"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const savePaymentSettings = useMutation({
    mutationFn: () =>
      savePayments({
        data: {
          cod_enabled: codEnabled,
          online_enabled: onlineEnabled,
          upi_id: upiId || null,
          payee_name: payeeName || "TownKart",
          instructions: paymentInstructions || null,
        },
      }),
    onSuccess: () => {
      toast.success("Payment settings saved");
      qc.invalidateQueries({ queryKey: ["payment-settings"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  function addBanner() {
    setBanners((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: "Fresh offers from TownKart",
        subtitle: "Nehtaur's First Online Kart",
        image_url: "",
        is_enabled: true,
        sort_order: current.length + 1,
      },
    ]);
  }

  function updateBanner(index: number, patch: Partial<(typeof banners)[number]>) {
    setBanners((current) =>
      current.map((banner, currentIndex) =>
        currentIndex === index ? { ...banner, ...patch } : banner,
      ),
    );
  }

  function removeBanner(index: number) {
    setBanners((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage inquiry contact details shown on every page.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="space-y-1.5">
          <Label>Call number</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp number</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Support email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving..." : "Save settings"}
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div>
          <h2 className="text-lg font-bold">Payment settings</h2>
          <p className="text-sm text-muted-foreground">
            Enable COD or online UPI payment options shown on the cart page.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <span>Cash on delivery</span>
            <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
          </Label>
          <Label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <span>Online payment</span>
            <Switch checked={onlineEnabled} onCheckedChange={setOnlineEnabled} />
          </Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>UPI ID</Label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="townkart@upi"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Payee name</Label>
            <Input value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Customer instructions</Label>
          <Textarea
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            placeholder="Pay online and enter your UTR/reference number before placing the order."
            rows={3}
          />
        </div>

        <Button
          disabled={savePaymentSettings.isPending}
          onClick={() => savePaymentSettings.mutate()}
        >
          {savePaymentSettings.isPending ? "Saving..." : "Save payment settings"}
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Home moving banners</h2>
            <p className="text-sm text-muted-foreground">
              Add image banners that rotate after the default TownKart banner.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addBanner}>
            <Plus className="h-4 w-4" />
            Add banner
          </Button>
        </div>

        {banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
            No extra banners yet. The default TownKart banner will still show.
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <div key={banner.id} className="space-y-4 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold">Banner {index + 1}</div>
                  <div className="flex items-center gap-3">
                    <Label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={banner.is_enabled}
                        onCheckedChange={(is_enabled) => updateBanner(index, { is_enabled })}
                      />
                      Active
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBanner(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                  <ImageUpload
                    label="Banner image"
                    bucket="marketplace-banners"
                    value={banner.image_url}
                    onChange={(image_url) => updateBanner(index, { image_url })}
                  />
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Title</Label>
                      <Input
                        value={banner.title}
                        onChange={(e) => updateBanner(index, { title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tagline</Label>
                      <Input
                        value={banner.subtitle}
                        onChange={(e) => updateBanner(index, { subtitle: e.target.value })}
                        placeholder="Nehtaur's First Online Kart"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button disabled={saveHomeBanners.isPending} onClick={() => saveHomeBanners.mutate()}>
          {saveHomeBanners.isPending ? "Saving..." : "Save banners"}
        </Button>
      </div>
    </div>
  );
}
