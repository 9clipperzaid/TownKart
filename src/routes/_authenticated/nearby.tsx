import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Clock, Navigation, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMaps, distanceKm } from "@/lib/google-maps";
import { categoryLabel } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/nearby")({
  component: NearbyPage,
});

type Store = {
  id: string;
  name: string;
  category: string;
  rating: number;
  delivery_minutes: number;
  delivery_available: boolean;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 }; // Mumbai fallback

function NearbyPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [maxKm, setMaxKm] = useState("all");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"distance" | "rating">("distance");
  const [onlyDelivery, setOnlyDelivery] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapObj = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers = useRef<any[]>([]);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  const { data: stores = [] } = useQuery({
    queryKey: ["nearby-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select(
          "id, name, category, rating, delivery_minutes, delivery_available, address, latitude, longitude",
        )
        .eq("is_active", true);
      if (error) throw error;
      return data as Store[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("key, label")
        .eq("is_enabled", true)
        .order("sort_order");
      return (data ?? []) as { key: string; label: string }[];
    },
  });

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    locate();
  }, []);

  const center = coords ?? DEFAULT_CENTER;

  const ranked = useMemo(() => {
    let list = stores
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        ...s,
        distance: distanceKm(center.lat, center.lng, s.latitude!, s.longitude!),
      }));
    if (cat !== "all") list = list.filter((s) => s.category === cat);
    if (onlyDelivery) list = list.filter((s) => s.delivery_available);
    if (maxKm !== "all") list = list.filter((s) => s.distance <= Number(maxKm));
    list.sort((a, b) =>
      sort === "distance" ? a.distance - b.distance : b.rating - a.rating,
    );
    return list;
  }, [stores, center.lat, center.lng, cat, onlyDelivery, maxKm, sort]);

  // Load the map.
  useEffect(() => {
    loadGoogleMaps()
      .then((maps) => {
        if (!mapRef.current) return;
        mapObj.current = new maps.Map(mapRef.current, {
          center,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
        });
        setMapsReady(true);
      })
      .catch(() => setMapsError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers + center when data/location changes.
  useEffect(() => {
    if (!mapsReady || !mapObj.current || !window.google) return;
    const maps = window.google.maps;
    mapObj.current.setCenter(center);
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    // User marker
    markers.current.push(
      new maps.Marker({
        position: center,
        map: mapObj.current,
        title: "You",
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      }),
    );

    ranked.forEach((s) => {
      markers.current.push(
        new maps.Marker({
          position: { lat: s.latitude!, lng: s.longitude! },
          map: mapObj.current,
          title: `${s.name} · ${s.distance.toFixed(1)} km`,
        }),
      );
    });
  }, [mapsReady, ranked, center.lat, center.lng]);

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Stores near you</h1>
          <p className="text-sm text-muted-foreground">
            {coords ? "Sorted by distance from your location" : "Using a default area"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={locate} disabled={locating}>
          <LocateFixed className="h-4 w-4" />
          {locating ? "Locating…" : "My location"}
        </Button>
      </div>

      {!mapsError && (
        <div
          ref={mapRef}
          className="h-56 w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-card"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={maxKm} onValueChange={setMaxKm}>
          <SelectTrigger className="h-9 w-28">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any distance</SelectItem>
            <SelectItem value="2">Within 2 km</SelectItem>
            <SelectItem value="5">Within 5 km</SelectItem>
            <SelectItem value="10">Within 10 km</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Nearest</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={onlyDelivery ? "default" : "outline"}
          size="sm"
          className="h-9"
          onClick={() => setOnlyDelivery((v) => !v)}
        >
          Delivers now
        </Button>
      </div>

      <div className="space-y-3 pb-6">
        {ranked.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No stores match these filters. Add coordinates to stores in the admin
            panel to see them here.
          </p>
        )}
        {ranked.map((s) => (
          <Link
            key={s.id}
            to="/store/$storeId"
            params={{ storeId: s.id }}
            className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition-transform active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-bold">{s.name}</h3>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                  <Navigation className="h-3 w-3" />
                  {s.distance.toFixed(1)} km
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> {s.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {s.delivery_minutes} min
                </span>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                  {categoryLabel(s.category)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
