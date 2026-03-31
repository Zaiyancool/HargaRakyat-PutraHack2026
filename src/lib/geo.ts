// State centroids for Malaysia (approximate lat/lng)
export const STATE_COORDS: Record<string, [number, number]> = {
  "Johor": [1.4854, 103.7618],
  "Kedah": [6.1184, 100.3685],
  "Kelantan": [5.3117, 102.1324],
  "Melaka": [2.1896, 102.2501],
  "Negeri Sembilan": [2.7258, 101.9424],
  "Pahang": [3.8126, 103.3256],
  "Perak": [4.5921, 101.0901],
  "Perlis": [6.4449, 100.2048],
  "Pulau Pinang": [5.4164, 100.3327],
  "Sabah": [5.9788, 116.0753],
  "Sarawak": [2.4894, 111.8463],
  "Selangor": [3.0738, 101.5183],
  "Terengganu": [5.3117, 103.1324],
  "W.P. Kuala Lumpur": [3.1390, 101.6869],
  "W.P. Labuan": [5.2831, 115.2308],
  "W.P. Putrajaya": [2.9264, 101.6964],
};

// District-level jitter to spread pins within a state
export function jitterCoords(base: [number, number], seed: number): [number, number] {
  const jitterLat = (((seed * 2654435761) % 1000) / 1000 - 0.5) * 0.15;
  const jitterLng = (((seed * 2246822519) % 1000) / 1000 - 0.5) * 0.15;
  return [base[0] + jitterLat, base[1] + jitterLng];
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
