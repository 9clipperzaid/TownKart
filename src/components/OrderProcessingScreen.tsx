import { Check, PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react";

export function OrderProcessingScreen() {
  return (
    <div className="tk-order-processing" role="status" aria-live="polite">
      <div className="tk-order-processing__brand">
        Town<span>Kart</span>
      </div>

      <div className="tk-order-processing__visual" aria-hidden="true">
        <div className="tk-order-processing__ring" />
        <div className="tk-order-processing__bag">
          <ShoppingBag />
          <PackageCheck />
        </div>
      </div>

      <h1>Confirming your order...</h1>
      <p>Please wait while we connect with the store. This may take a few moments.</p>

      <div className="tk-order-processing__steps">
        <div className="tk-order-processing__step tk-order-processing__step--done">
          <span>
            <Check />
          </span>
          <strong>Order received</strong>
        </div>
        <div className="tk-order-processing__step tk-order-processing__step--active">
          <span>
            <i />
          </span>
          <div>
            <strong>Confirming with store</strong>
            <small>In progress</small>
          </div>
        </div>
        <div className="tk-order-processing__step">
          <span />
          <strong>Order confirmed</strong>
        </div>
      </div>

      <div className="tk-order-processing__safe">
        <ShieldCheck />
        <span>Your payment and cart are safe</span>
      </div>
      <div className="tk-order-processing__bar">
        <i />
      </div>
    </div>
  );
}
