import { readServerEnv } from "@/lib/env.server";

type OrderWhatsappItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type OrderWhatsappDetails = {
  orderId: string;
  trackingCode?: string | null;
  createdAt?: string | null;
  storeName: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentReference?: string | null;
  items: OrderWhatsappItem[];
};

function cleanPhoneNumber(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.endsWith("@c.us") || trimmed.endsWith("@g.us") || trimmed.endsWith("@lid")) {
    return trimmed;
  }

  return trimmed.replace(/\D/g, "");
}

function phoneToChatId(phone: string) {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return "";
  if (cleaned.includes("@")) return cleaned;

  return `${cleaned}@c.us`;
}

function openWaApiBaseUrl() {
  const raw = readServerEnv("OPENWA_API_URL")?.trim();
  if (!raw) return "";

  return raw.replace(/\/+$/, "").replace(/\/api$/, "");
}

function openWaSendTextPath(sessionId: string) {
  const pathTemplate =
    readServerEnv("OPENWA_SEND_TEXT_PATH") || "/api/sessions/{sessionId}/messages/send-text";

  return pathTemplate
    .replace("{sessionId}", encodeURIComponent(sessionId))
    .replace(/^\/*/, "/");
}

async function resolveOpenWaChatId({
  apiBaseUrl,
  apiKey,
  sessionId,
  phone,
}: {
  apiBaseUrl: string;
  apiKey: string;
  sessionId: string;
  phone: string;
}) {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned || cleaned.includes("@")) return phoneToChatId(phone);

  const response = await fetch(
    `${apiBaseUrl}/api/sessions/${encodeURIComponent(sessionId)}/contacts/check/${encodeURIComponent(
      cleaned,
    )}`,
    {
      headers: {
        "X-API-Key": apiKey,
      },
    },
  );

  if (!response.ok) return phoneToChatId(cleaned);

  const result = (await response.json().catch(() => null)) as {
    exists?: boolean;
    whatsappId?: string | null;
  } | null;

  return result?.whatsappId || phoneToChatId(cleaned);
}

function formatMoney(value: number) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function formatOrderDate(value?: string | null) {
  if (!value) return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function buildOrderWhatsappMessage(order: OrderWhatsappDetails) {
  const locationUrl =
    order.latitude != null && order.longitude != null
      ? `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
      : null;
  const itemLines = order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x ${item.quantity} = ${formatMoney(
          item.unitPrice * item.quantity,
        )}`,
    )
    .join("\n");

  return [
    "New order received",
    "",
    `Order: ${order.trackingCode || order.orderId.slice(0, 8)}`,
    `Date: ${formatOrderDate(order.createdAt)}`,
    `Store: ${order.storeName}`,
    "",
    "Customer",
    `Name: ${order.customerName || "Not added"}`,
    `Phone: ${order.customerPhone || "Not added"}`,
    `Email: ${order.customerEmail || "Not added"}`,
    "",
    "Items",
    itemLines || "No items found",
    "",
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Delivery: ${formatMoney(order.deliveryFee)}`,
    `Total: ${formatMoney(order.total)}`,
    `Payment: ${order.paymentMethod}`,
    order.paymentReference ? `Reference: ${order.paymentReference}` : null,
    "",
    "Delivery address",
    order.address,
    locationUrl ? `Map: ${locationUrl}` : "Map: Customer did not share GPS location",
    order.locationAccuracy != null ? `Location accuracy: about ${Math.round(order.locationAccuracy)}m` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendOrderWhatsappNotification(order: OrderWhatsappDetails) {
  const apiBaseUrl = openWaApiBaseUrl();
  const apiKey = readServerEnv("OPENWA_API_KEY")?.trim();
  const sessionId = readServerEnv("OPENWA_SESSION_ID")?.trim();
  const adminPhone = readServerEnv("ORDER_WHATSAPP_PHONE")?.trim();

  if (!apiBaseUrl || !apiKey || !sessionId || !adminPhone) return { skipped: true };

  const chatId = await resolveOpenWaChatId({ apiBaseUrl, apiKey, sessionId, phone: adminPhone });
  if (!chatId) return { skipped: true };

  const response = await fetch(
    `${apiBaseUrl}${openWaSendTextPath(sessionId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        chatId,
        text: buildOrderWhatsappMessage(order),
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenWA notification failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return { skipped: false };
}
