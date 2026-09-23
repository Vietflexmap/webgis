export interface LatLng {
  lat: number;
  lng: number;
}

export function parseGoogleMapsUrl(input: string): LatLng | null {
  const value = input.trim();
  if (!value) return null;

  const direct = parseDirectCoordinate(value);
  if (direct) return direct;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|z|\/)/i,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      const result = normalize(Number(match[1]), Number(match[2]));
      if (result) return result;
    }
  }

  try {
    const url = new URL(value);
    for (const key of ["query", "destination", "q", "ll"]) {
      const candidate = url.searchParams.get(key);
      if (!candidate) continue;
      const parsed = parseDirectCoordinate(candidate);
      if (parsed) return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export async function resolveGoogleMapsUrl(
  input: string,
  resolver: (url: string) => Promise<string>
): Promise<LatLng | null> {
  const parsed = parseGoogleMapsUrl(input);
  if (parsed) return parsed;
  return parseGoogleMapsUrl(await resolver(input));
}

function parseDirectCoordinate(value: string): LatLng | null {
  const match = value.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/
  );
  return match ? normalize(Number(match[1]), Number(match[2])) : null;
}

function normalize(lat: number, lng: number): LatLng | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}
