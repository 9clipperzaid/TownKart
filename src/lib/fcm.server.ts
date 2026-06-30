import { sendFcmToTokens } from "@/lib/firebase-admin.server";

async function getAdmin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export async function sendNewOrderPushNotification({
  orderId,
  storeId,
  storeName,
  total,
}: {
  orderId: string;
  storeId: string | null;
  storeName: string;
  total: number;
}) {
  const supabaseAdmin = await getAdmin();
  const recipientIds = new Set<string>();

  const { data: adminRoles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .in("role", ["admin", "super_admin"]);

  for (const row of adminRoles ?? []) {
    if (row.user_id) recipientIds.add(row.user_id);
  }

  if (storeId) {
    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("owner_id")
      .eq("id", storeId)
      .maybeSingle();
    if (store?.owner_id) recipientIds.add(store.owner_id);
  }

  if (recipientIds.size === 0) return;

  const { data: tokenRows } = await supabaseAdmin
    .from("fcm_push_tokens")
    .select("token")
    .in("user_id", [...recipientIds]);

  const tokens = (tokenRows ?? []).map((row) => row.token).filter(Boolean);
  if (tokens.length === 0) return;

  const result = await sendFcmToTokens({
    tokens,
    title: "New TownKart order",
    body: `${storeName} - Rs ${Number(total).toFixed(0)}`,
    url: `/admin/orders?orderId=${encodeURIComponent(orderId)}`,
  });

  const invalidTokens =
    result.responses
      ?.map((response, index) => ({ response, token: tokens[index] }))
      .filter(({ response }) => {
        const code = response.error?.code;
        return (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        );
      })
      .map(({ token }) => token) ?? [];

  if (invalidTokens.length) {
    await supabaseAdmin.from("fcm_push_tokens").delete().in("token", invalidTokens);
  }
}
