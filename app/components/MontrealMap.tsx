"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MontrealMap() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      {/* The map itself — greyscale tiles, opacity low */}
      <div
        className="absolute inset-0"
        style={{
          // greyscale → sepia → boost saturation → flip to blue → fade
          filter:
            "grayscale(1) brightness(1.1) sepia(1) saturate(4) hue-rotate(175deg) opacity(0.35)",
        }}
      >
        <MapContainer
          center={[45.5088, -73.5878]}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%", background: "#ffffff" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c", "d"]}
            // free OSM/CartoDB tiles — no API key needed
          />
        </MapContainer>
      </div>

      {/* Soft blue wash on top to reinforce the brand color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1000px 600px at 50% 30%, rgba(29,78,216,0.06), transparent 70%), radial-gradient(800px 500px at 80% 90%, rgba(59,130,246,0.05), transparent 70%)",
        }}
      />
    </div>
  );
}
