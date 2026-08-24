export function getSpotPublicUrl(spot: { slug?: string; id?: string; area_name?: string; area_slug?: string }): string {
  const areaSlug = (spot.area_slug || spot.area_name || "lagos").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (spot.id) {
    return `/explore/${areaSlug}?pinned=${spot.id}`;
  }
  if (spot.slug) {
    return `/explore/${areaSlug}?spot=${spot.slug}`;
  }
  return `/explore/${areaSlug}`;
}
