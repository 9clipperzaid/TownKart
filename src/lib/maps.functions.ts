import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

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
