importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  "apiKey": "AIzaSyA1z3uHEoqLde7LZLkBTjczfpUXs7pzAw",
  "authDomain": "town-kart.firebaseapp.com",
  "projectId": "town-kart",
  "storageBucket": "town-kart.firebasestorage.app",
  "messagingSenderId": "5354559537",
  "appId": "1:5354559537:web:80e6fdc61ca60b5841dd10",
  "measurementId": "G-990NDKQJVX"
});

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
