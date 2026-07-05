export const DELIVERY_BASE_DISTANCE_KM = 1.5;
export const DELIVERY_BASE_FEE = 33;
export const DELIVERY_EXTRA_FEE_PER_KM = 8;

// Fixed rider dispatch point: 29°19'09.3"N 78°23'16.9"E, Nethaur, Uttar Pradesh.
export const RIDER_HOME_LOCATION = {
  latitude: 29.31925,
  longitude: 78.388028,
} as const;

type Coordinates = { latitude: number; longitude: number };

/** Straight-line distance between two GPS points. */
export function distanceInKm(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rs 33 through 1.5 km, then Rs 8 for each additional km (pro-rated, rounded up). */
export function calculateDeliveryFee(distanceKm: number) {
  const additionalKm = Math.max(0, distanceKm - DELIVERY_BASE_DISTANCE_KM);
  return Math.ceil(DELIVERY_BASE_FEE + additionalKm * DELIVERY_EXTRA_FEE_PER_KM);
}
