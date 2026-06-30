const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { dirname, join } = require("node:path");

const root = join(__dirname, "..");
const envPath = join(root, ".env");

function readDotEnv() {
  if (!existsSync(envPath)) return {};

  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

const dotEnv = readDotEnv();
const env = (key, fallback = "") => process.env[key] || dotEnv[key] || fallback;

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY", "AIzaSyA1z3uHEoqLde7LZLkBTjczfpUXs7pzAw"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN", "town-kart.firebaseapp.com"),
  projectId: env("VITE_FIREBASE_PROJECT_ID", "town-kart"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET", "town-kart.firebasestorage.app"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID", "5354559537"),
  appId: env("VITE_FIREBASE_APP_ID", "1:5354559537:web:80e6fdc61ca60b5841dd10"),
  measurementId: env("VITE_FIREBASE_MEASUREMENT_ID", "G-990NDKQJVX"),
};

const swPath = join(root, "public", "firebase-messaging-sw.js");
mkdirSync(dirname(swPath), { recursive: true });
writeFileSync(
  swPath,
  `importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;

  const title = payload.data?.title || "New TownKart order";
  const body = payload.data?.body || "A new order was placed.";
  const url = payload.fcmOptions?.link || payload.data?.url || "/admin/orders";

  self.registration.showNotification(title, {
    body,
    icon: "/townkart-logo.png",
    badge: "/favicon-192.png",
    requireInteraction: true,
    data: { url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/orders";
  event.waitUntil(clients.openWindow(url));
});
`,
);

console.log(`Generated ${swPath}`);
