import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { readServerEnv } from "@/lib/env.server";

function getFirebaseAdminApp() {
  const projectId = readServerEnv("FIREBASE_PROJECT_ID");
  const clientEmail = readServerEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = readServerEnv("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  );
}

export async function sendFcmToTokens({
  tokens,
  title,
  body,
  url,
}: {
  tokens: string[];
  title: string;
  body: string;
  url?: string;
}) {
  const app = getFirebaseAdminApp();
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  if (!app || uniqueTokens.length === 0) return { successCount: 0, failureCount: 0 };

  return getMessaging(app).sendEachForMulticast({
    tokens: uniqueTokens,
    notification: { title, body },
    webpush: {
      fcmOptions: {
        link: url || "/admin/orders",
      },
      notification: {
        icon: "/townkart-logo.png",
        badge: "/favicon-192.png",
        requireInteraction: true,
      },
    },
  });
}
