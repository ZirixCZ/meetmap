import L from "leaflet";

export type MarkerType =
  | "KLUBY_FESTIVALY"
  | "KINA"
  | "PIVOVARY"
  | "DIVADLA_FILHARMONIE"
  | "MUZEA_GALERIE"
  | "PAMATKY"
  | "SPORT"
  | "MĚŘÍCÍ STANICE";

export interface Marker {
  Name: string | null;
  Description: string | null;
  Accessibility: boolean | null;
  AccessibilityNote: string | null;
  Capacity: number | null;
  CapacityNote: string | null;
  Phones: string | null;
  Email: string | null;
  Web: string | null;
  Okres: string | null;
  Obce: string | null;
  Address: string | null;
  lat: number | null;
  lng: number | null;
  Type: MarkerType;
  Pollution: string | null;
}

export interface MarkerUpdateOptions {
  bounds: L.LatLngBounds;
  zoom: number;
}
