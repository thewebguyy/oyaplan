import { Spot } from '../types';

export function normalizeAreaSlug(input: string): string {
  if (!input) return "";
  const s = input.toLowerCase().trim();
  if (s === "lekki" || s === "lekki 1" || s === "lekki-phase-1" || s === "77777777-7777-7777-7777-777777777777") return "lekki-phase-1";
  if (s === "vi" || s === "victoria island" || s === "victoria-island" || s === "88888888-8888-8888-8888-888888888888") return "vi";
  if (s === "yaba" || s === "33333333-3333-3333-3333-333333333333") return "yaba";
  if (s === "ikeja" || s === "11111111-1111-1111-1111-111111111111") return "ikeja";
  if (s === "surulere" || s === "44444444-4444-4444-4444-444444444444") return "surulere";
  if (s === "ikoyi" || s === "99999999-9999-9999-9999-999911111111") return "ikoyi";
  if (s === "gbagada" || s === "22222222-2222-2222-2222-222222222222") return "gbagada";
  if (s === "agege" || s === "66666666-6666-6666-6666-666666666666") return "agege";
  if (s === "ogudu" || s === "55555555-5555-5555-5555-555555555555") return "ogudu";
  return s;
}

export function isSpotInArea(spot: Spot, targetArea: string): boolean {
  if (!targetArea || targetArea === "Anywhere" || targetArea === "anywhere") return true;
  
  const normalizedTarget = normalizeAreaSlug(targetArea);
  const spotAreaSlug = normalizeAreaSlug(spot.areas?.slug || spot.address_slug || spot.area_id || "");

  return spotAreaSlug === normalizedTarget;
}

const ZONES: Record<string, string> = {
  ikeja: "mainland",
  gbagada: "mainland",
  ogudu: "mainland",
  agege: "mainland",
  maryland: "mainland",
  yaba: "central",
  surulere: "central",
  "ebute-metta": "central",
  "lekki-phase-1": "island",
  vi: "island",
  ikoyi: "island",
  apapa: "other"
};

export function getZoneForArea(areaStr: string): string {
  if (!areaStr) return "other";
  const slug = areaStr.toLowerCase().trim();
  if (ZONES[slug]) return ZONES[slug];
  if (slug.includes("yaba") || slug.includes("surulere") || slug.includes("ebute")) return "central";
  if (slug.includes("lekki") || slug.includes("vi") || slug.includes("victoria") || slug.includes("ikoyi")) return "island";
  if (slug.includes("ikeja") || slug.includes("gbagada") || slug.includes("ogudu") || slug.includes("maryland") || slug.includes("agege")) return "mainland";
  if (slug.includes("apapa")) return "other";
  return "other";
}

