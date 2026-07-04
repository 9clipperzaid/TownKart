import { useEffect, useState } from "react";
import { MapPin, Pill, ShoppingBasket, UtensilsCrossed } from "lucide-react";

const SPLASH_KEY = "townkart_splash_seen_v2";

export function AppSplash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1650);
    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setVisible(false);
    }, 2050);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`tk-splash ${leaving ? "tk-splash--leaving" : ""}`}
      role="status"
      aria-label="TownKart is loading"
    >
      <div className="tk-splash__route tk-splash__route--one" />
      <div className="tk-splash__route tk-splash__route--two" />
      <MapPin className="tk-splash__pin tk-splash__pin--one" />
      <MapPin className="tk-splash__pin tk-splash__pin--two" />

      <div className="tk-splash__content">
        <div className="tk-splash__mark">
          <MapPin className="tk-splash__mark-pin" />
          <ShoppingBasket className="tk-splash__basket" />
          <span className="tk-splash__spark" />
        </div>
        <div className="tk-splash__wordmark">
          Town<span>Kart</span>
        </div>
        <p>Nehtaur&apos;s First Online Store</p>
        <div className="tk-splash__services" aria-hidden="true">
          <span>
            <ShoppingBasket />
          </span>
          <span>
            <UtensilsCrossed />
          </span>
          <span>
            <Pill />
          </span>
        </div>
        <div className="tk-splash__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
