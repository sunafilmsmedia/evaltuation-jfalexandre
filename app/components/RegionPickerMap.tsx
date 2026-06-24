"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Region = {
  value: string;
  label: string;
  lat: number;
  lng: number;
};

export const REGIONS: Region[] = [
  // Île de Montréal
  { value: "montreal-centre", label: "Montréal centre", lat: 45.5088, lng: -73.5878 },
  { value: "verdun-sud-ouest", label: "Verdun / Sud-Ouest", lat: 45.4540, lng: -73.5700 },
  { value: "ouest-ile", label: "Ouest-de-l'Île", lat: 45.4900, lng: -73.8200 },
  { value: "est-montreal", label: "Est de Montréal", lat: 45.6100, lng: -73.5500 },
  { value: "ahuntsic", label: "Ahuntsic / RDP", lat: 45.5700, lng: -73.6500 },

  // Laval
  { value: "laval", label: "Laval", lat: 45.6066, lng: -73.7124 },

  // Rive-Sud
  { value: "longueuil", label: "Longueuil", lat: 45.5400, lng: -73.5100 },
  { value: "brossard", label: "Brossard", lat: 45.4500, lng: -73.4700 },
  { value: "boucherville", label: "Boucherville", lat: 45.5950, lng: -73.4400 },
  { value: "chateauguay", label: "Châteauguay", lat: 45.3700, lng: -73.7500 },

  // Rive-Nord
  { value: "terrebonne", label: "Terrebonne", lat: 45.7000, lng: -73.6450 },
  { value: "repentigny", label: "Repentigny", lat: 45.7430, lng: -73.4500 },
  { value: "saint-eustache", label: "Saint-Eustache", lat: 45.5650, lng: -73.9000 },
  { value: "blainville", label: "Blainville", lat: 45.6700, lng: -73.8800 },
];

function nearestRegion(lat: number, lng: number): Region {
  const point = L.latLng(lat, lng);
  let best = REGIONS[0];
  let bestDist = point.distanceTo(L.latLng(best.lat, best.lng));
  for (let i = 1; i < REGIONS.length; i++) {
    const r = REGIONS[i];
    const d = point.distanceTo(L.latLng(r.lat, r.lng));
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }
  return best;
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      [
        [45.34, -73.95],
        [45.78, -73.40],
      ],
      { padding: [10, 10], maxZoom: 11 },
    );
    // Force layout after framer-motion finishes its slide
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function MapClickHandler({ onChange }: { onChange: (v: string) => void }) {
  useMapEvents({
    click(e) {
      const nearest = nearestRegion(e.latlng.lat, e.latlng.lng);
      onChange(nearest.value);
    },
  });
  return null;
}

type Props = {
  value: string | undefined;
  onChange: (v: string) => void;
};

export default function RegionPickerMap({ value, onChange }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-red-100 h-[360px] md:h-[400px] bg-white shadow-inner">
      <MapContainer
        center={[45.55, -73.7]}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%", background: "#f8fafc", cursor: "pointer" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />
        <FitBounds />
        <MapClickHandler onChange={onChange} />
        {REGIONS.map((r) => {
          const selected = value === r.value;
          return (
            <CircleMarker
              key={r.value}
              center={[r.lat, r.lng]}
              radius={selected ? 18 : 11}
              pathOptions={{
                color: "#DC2626",
                weight: selected ? 3 : 2,
                fillColor: selected ? "#DC2626" : "#EF4444",
                fillOpacity: selected ? 0.9 : 0.45,
              }}
              eventHandlers={{
                click: () => onChange(r.value),
              }}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, selected ? -16 : -12]}
                className={`region-tooltip ${selected ? "region-tooltip-selected" : ""}`}
              >
                {r.label}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
