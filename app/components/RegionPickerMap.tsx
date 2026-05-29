"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Region = {
  value: string;
  label: string;
  lat: number;
  lng: number;
};

export const REGIONS: Region[] = [
  { value: "montreal-centre", label: "Montréal centre", lat: 45.5088, lng: -73.5878 },
  { value: "ouest-ile", label: "Ouest-de-l'Île", lat: 45.4633, lng: -73.823 },
  { value: "est-montreal", label: "Est de Montréal", lat: 45.5828, lng: -73.5495 },
  { value: "laval", label: "Laval", lat: 45.6066, lng: -73.7124 },
  { value: "rive-sud", label: "Rive-Sud", lat: 45.5312, lng: -73.4583 },
  { value: "rive-nord", label: "Rive-Nord", lat: 45.6963, lng: -73.6379 },
];

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      [
        [45.36, -74.05],
        [45.78, -73.32],
      ],
      { padding: [20, 20] },
    );
    // Force layout after framer-motion finishes its slide
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

type Props = {
  value: string | undefined;
  onChange: (v: string) => void;
};

export default function RegionPickerMap({ value, onChange }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 h-[360px] md:h-[400px] bg-white shadow-inner">
      <MapContainer
        center={[45.55, -73.7]}
        zoom={10}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%", background: "#f8fafc" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />
        <FitBounds />
        {REGIONS.map((r) => {
          const selected = value === r.value;
          return (
            <CircleMarker
              key={r.value}
              center={[r.lat, r.lng]}
              radius={selected ? 24 : 17}
              pathOptions={{
                color: "#1d4ed8",
                weight: selected ? 4 : 2,
                fillColor: selected ? "#1d4ed8" : "#3b82f6",
                fillOpacity: selected ? 0.85 : 0.45,
              }}
              eventHandlers={{
                click: () => onChange(r.value),
              }}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, selected ? -22 : -16]}
                className="region-tooltip"
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
