import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, ShoppingBasket, Store, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/Logo";

const SITE_URL = "https://www.townkart.store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Online Grocery & Food Delivery in Nehtaur | TownKart" },
      {
        name: "description",
        content:
          "Order groceries, food, medicines and daily essentials online from local stores in Nehtaur, Bijnor. Fast doorstep delivery with TownKart.",
      },
      { property: "og:title", content: "TownKart — Online Delivery in Nehtaur" },
      {
        property: "og:description",
        content: "Shop from trusted local stores in Nehtaur and get essentials delivered home.",
      },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: LandingPage,
});

const services = [
  {
    icon: ShoppingBasket,
    title: "Grocery delivery",
    text: "Daily groceries and household essentials from nearby shops.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food delivery",
    text: "Order food online from local restaurants in Nehtaur.",
  },
  {
    icon: Store,
    title: "Local stores",
    text: "Browse products and offers from trusted neighbourhood sellers.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo showTagline />
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-widest text-primary">
              Nehtaur&apos;s First Online Store
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">
              Online grocery, food and medicine delivery in Nehtaur
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              TownKart connects you with local shops and restaurants across Nehtaur, Bijnor. Order
              daily essentials online and get convenient doorstep delivery.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-extrabold text-primary-foreground shadow-card"
              >
                Browse products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/nearby"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 font-bold"
              >
                View nearby stores
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="services-heading" className="bg-secondary/40 px-5 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 id="services-heading" className="text-center text-3xl font-extrabold">
              What you can order on TownKart
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {services.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
                  <p className="mt-2 leading-6 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 text-center">
          <Bike className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-extrabold">Local shopping, delivered to your door</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-muted-foreground">
            Discover local products, compare available options and place your order online through
            TownKart. Delivery availability and timing are shown for each store.
          </p>
          <Link
            to="/home"
            className="mt-6 inline-flex items-center gap-2 font-extrabold text-primary"
          >
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-7 text-center text-sm text-muted-foreground">
        TownKart · Online local delivery in Nehtaur, Bijnor, Uttar Pradesh
      </footer>
    </div>
  );
}
