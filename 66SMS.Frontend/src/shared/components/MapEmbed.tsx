import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapEmbedProps = {
  lat?: number;
  lng?: number;
  zoom?: number;
  title?: string;
  className?: string;
  height?: number | string;
  src?: string;
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapEmbed({
  lat = 35.6895,
  lng = 139.6917,
  zoom = 12,
  title = "Map",
  className = "",
  height = 300,
  src,
}: MapEmbedProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!rootRef.current || mapRef.current) return;

    const map = L.map(rootRef.current).setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);
    L.marker([lat, lng], { icon: markerIcon }).addTo(map).bindPopup(title);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, zoom, title, src]);

  const h = typeof height === "number" ? height + "px" : height;

  return (
    <div
      ref={rootRef}
      className={"map-container w-full overflow-hidden rounded " + className}
      style={{ height: h }}
      title={title}
    />
  );
}
