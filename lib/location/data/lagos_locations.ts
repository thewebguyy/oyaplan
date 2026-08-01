import { Coordinates } from "../types";

export interface PlanningArea {
  id: string;
  name: string;
  coordinates: Coordinates;
  alias: string[];
}

export interface DisplayLocation {
  slug: string;
  name: string;
  coordinates: Coordinates;
}

/**
 * The six active planning areas that the PlanningEngine operates over.
 * Adding a new entry here automatically expands recommendation coverage.
 */
export const PLANNING_AREAS: PlanningArea[] = [
  {
    id: "lekki-phase-1",
    name: "Lekki Phase 1",
    coordinates: { lat: 6.4474, lng: 3.4723 },
    alias: ["lekki", "lekki phase 1", "lekki 1", "admiralty"],
  },
  {
    id: "yaba",
    name: "Yaba",
    coordinates: { lat: 6.5095, lng: 3.3711 },
    alias: ["yaba", "sabo", "akoka", "unilag"],
  },
  {
    id: "ikeja",
    name: "Ikeja",
    coordinates: { lat: 6.6018, lng: 3.3515 },
    alias: ["ikeja", "allen", "gra ikeja", "alausa"],
  },
  {
    id: "vi",
    name: "Victoria Island",
    coordinates: { lat: 6.4281, lng: 3.4219 },
    alias: ["vi", "victoria island"],
  },
  {
    id: "ikoyi",
    name: "Ikoyi",
    coordinates: { lat: 6.4549, lng: 3.4347 },
    alias: ["ikoyi", "banana island", "falomo"],
  },
  {
    id: "surulere",
    name: "Surulere",
    coordinates: { lat: 6.4969, lng: 3.354 },
    alias: ["surulere", "ojuelegba", "bode thomas"],
  },
];

/**
 * Comprehensive Lagos neighborhoods for honest GPS display resolution.
 * The first six entries are derived from PLANNING_AREAS to avoid duplication.
 * Add new entries here when expanding GPS display coverage — never inside service logic.
 *
 * NOTE: Display locations and planning areas are intentionally independent.
 * Display locations communicate where the user actually is.
 * Planning areas determine which dataset the Planning Engine uses.
 * These may differ while OyaPlan's geographic coverage is expanding.
 */
export const DISPLAY_LOCATIONS: DisplayLocation[] = [
  // Derived from PLANNING_AREAS — single source of truth for coordinates
  ...PLANNING_AREAS.map((a) => ({ slug: a.id, name: a.name, coordinates: a.coordinates })),

  // Extended Lagos neighborhoods
  { slug: "ikorodu",    name: "Ikorodu",    coordinates: { lat: 6.6194, lng: 3.5104 } },
  { slug: "agege",      name: "Agege",      coordinates: { lat: 6.6219, lng: 3.3229 } },
  { slug: "alimosho",   name: "Alimosho",   coordinates: { lat: 6.5800, lng: 3.2800 } },
  { slug: "oshodi",     name: "Oshodi",     coordinates: { lat: 6.5559, lng: 3.3381 } },
  { slug: "festac",     name: "Festac",     coordinates: { lat: 6.4688, lng: 3.2876 } },
  { slug: "apapa",      name: "Apapa",      coordinates: { lat: 6.4490, lng: 3.3597 } },
  { slug: "maryland",   name: "Maryland",   coordinates: { lat: 6.5629, lng: 3.3620 } },
  { slug: "gbagada",    name: "Gbagada",    coordinates: { lat: 6.5567, lng: 3.3850 } },
  { slug: "ajah",       name: "Ajah",       coordinates: { lat: 6.4698, lng: 3.5794 } },
  { slug: "ebute-metta",name: "Ebute Metta",coordinates: { lat: 6.4893, lng: 3.3740 } },
  { slug: "ogba",       name: "Ogba",       coordinates: { lat: 6.6079, lng: 3.3290 } },
  { slug: "ketu",       name: "Ketu",       coordinates: { lat: 6.5899, lng: 3.3975 } },
  { slug: "sangotedo",  name: "Sangotedo",  coordinates: { lat: 6.4406, lng: 3.6221 } },
  { slug: "ojodu",      name: "Ojodu",      coordinates: { lat: 6.6340, lng: 3.3550 } },
  { slug: "mushin",     name: "Mushin",     coordinates: { lat: 6.5253, lng: 3.3517 } },
  { slug: "isale-eko",  name: "Isale Eko",  coordinates: { lat: 6.4500, lng: 3.3900 } },
  { slug: "bariga",     name: "Bariga",     coordinates: { lat: 6.5358, lng: 3.3873 } },
  { slug: "shomolu",    name: "Shomolu",    coordinates: { lat: 6.5456, lng: 3.3846 } },
  { slug: "lekki-phase-2", name: "Lekki Phase 2", coordinates: { lat: 6.4619, lng: 3.5574 } },
  { slug: "chevron",    name: "Chevron",    coordinates: { lat: 6.4364, lng: 3.5248 } },
  { slug: "eti-osa",    name: "Eti-Osa",    coordinates: { lat: 6.4550, lng: 3.5000 } },
  { slug: "badagry",    name: "Badagry",    coordinates: { lat: 6.4163, lng: 2.8853 } },
  { slug: "epe",        name: "Epe",        coordinates: { lat: 6.5898, lng: 3.9817 } },
];
