import { NextResponse } from "next/server";
import { z } from "zod";

const Query = z.object({
  zip: z.string().trim().regex(/^\d{5}$/).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
});

async function geocodeZip(zip: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=us&postalcode=${encodeURIComponent(zip)}&limit=1`, {
      headers: { "User-Agent": "MYIN-Hackathon-Demo/1.0 (local prototype)" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Geocoder unavailable");
    const results = await response.json();
    if (!Array.isArray(results) || !results[0]) return null;
    return { lat: Number(results[0].lat), lon: Number(results[0].lon), label: results[0].display_name };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = Query.safeParse({
    zip: url.searchParams.get("zip") || undefined,
    lat: url.searchParams.get("lat") || undefined,
    lon: url.searchParams.get("lon") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid five-digit ZIP code or valid coordinates." }, { status: 400 });

  try {
    if (parsed.data.lat != null && parsed.data.lon != null) {
      return NextResponse.json({ source: "browser-location", center: { lat: parsed.data.lat, lon: parsed.data.lon }, label: "Browser-provided approximate location" });
    }
    if (!parsed.data.zip) return NextResponse.json({ error: "ZIP code or location is required." }, { status: 400 });
    const result = await geocodeZip(parsed.data.zip);
    if (!result) return NextResponse.json({ error: "No location was found for that ZIP code." }, { status: 404 });
    return NextResponse.json({ source: "OpenStreetMap Nominatim", center: { lat: result.lat, lon: result.lon }, label: result.label });
  } catch {
    return NextResponse.json({
      source: "demo-fallback",
      center: { lat: 39.04, lon: -77.11 },
      label: "Demo map center — location service unavailable",
      warning: "The external location service did not respond. Opportunity data remains demo data.",
    });
  }
}
