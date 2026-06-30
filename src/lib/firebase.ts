import { createClientOnlyFn } from "@tanstack/react-start";

const firebaseConfig = {
  apiKey: "AIzaSyA1z3uHEoqLde7LZLkBTjczfpUXs7pzAw",
  authDomain: "town-kart.firebaseapp.com",
  projectId: "town-kart",
  storageBucket: "town-kart.firebasestorage.app",
  messagingSenderId: "5354559537",
  appId: "1:5354559537:web:80e6fdc61ca60b5841dd10",
  measurementId: "G-990NDKQJVX",
};

const VAPID_KEY =
  "BJm1PS1O2kSRmROv3xMPI9Pf4GB0IZIfamZZPg83WpJNOEXVh9eSR5jU1V6vfEVmpmg6U5xJfWWkgGEAie9wnw4";

export const setupFcmClient = createClientOnlyFn(
  async (callback: (payload: { title: string; body: string }) => void) => {
    if (typeof window === "undefined" || !("Notification" in window)) return null;

    const [{ initializeApp, getApps }, messagingModule] = await Promise.all([
      import("firebase/app"),
      import("firebase/messaging"),
    ]);
    const { getMessaging, getToken, isSupported, onMessage } = messagingModule;
    if (!(await isSupported())) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    const unsubscribe = onMessage(messaging, (payload) => {
      callback({
        title: payload.notification?.title || "TownKart",
        body: payload.notification?.body || "You have a new notification.",
      });
    });

    return { token, unsubscribe };
  },
);
