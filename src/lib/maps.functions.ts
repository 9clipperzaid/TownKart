import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const reverseCache = new Map<string, string>();

/**
 * Geocode a free-text address into latitude/longitude using the Google Maps
 * Platform connector gateway. Used by the admin store editor.
 */
export const geocodeAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { address: string }) =>
    z.object({ address: z.string().trim().min(3).max(300) }).parse(d),
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) {
      throw new Error("Maps service is not configured.");
    }

    const res = await fetch(
      `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(data.address)}`,
      {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": mapsKey,
        },
      },
    );
    if (!res.ok) {
      console.error("[geocode] gateway error", res.status, await res.text());
      throw new Error("Could not look up that address.");
    }
    const json = (await res.json()) as {
      status: string;
      results: {
        geometry: { location: { lat: number; lng: number } };
        formatted_address: string;
      }[];
    };
    if (json.status !== "OK" || !json.results.length) {
      throw new Error("No location found for that address.");
    }
    const top = json.results[0];
    return {
      latitude: top.geometry.location.lat,
      longitude: top.geometry.location.lng,
      formatted: top.formatted_address,
    };
  });

/** Convert device GPS coordinates into a readable delivery address. */
export const reverseGeocodeCoordinates = createServerFn({ method: "POST" })
  .inputValidator((d: { latitude: number; longitude: number }) =>
    z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const cacheKey = `${data.latitude.toFixed(4)},${data.longitude.toFixed(4)}`;
    const cached = reverseCache.get(cacheKey);
    if (cached) return { formatted: cached };

    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (lovableKey && mapsKey) {
      const response = await fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?latlng=${encodeURIComponent(`${data.latitude},${data.longitude}`)}`,
        {
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": mapsKey,
          },
        },
      );
      if (response.ok) {
        const json = (await response.json()) as {
          status: string;
          results?: { formatted_address: string }[];
        };
        const formatted = json.status === "OK" ? json.results?.[0]?.formatted_address : undefined;
        if (formatted) {
          reverseCache.set(cacheKey, formatted);
          return { formatted };
        }
      }
    }

    // OpenStreetMap fallback for occasional customer location lookups. Results
    // are cached and the identifying User-Agent is required by its usage policy.
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${data.latitude}&lon=${data.longitude}`,
      {
        headers: {
          "User-Agent": "TownKart/1.0 (townkart.help@gmail.com)",
          "Accept-Language": "en-IN,en;q=0.9",
        },
      },
    );
    if (!response.ok) throw new Error("Could not find an address for this location.");
    const result = (await response.json()) as { display_name?: string };
    if (!result.display_name) throw new Error("Could not find an address for this location.");
    reverseCache.set(cacheKey, result.display_name);
    return { formatted: result.display_name };
  });
