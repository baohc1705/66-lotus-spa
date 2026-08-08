import { MapEmbed } from "@/shared/components/MapEmbed";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const maps = [
  { title: "Satellite Map - Tokyo, Japan", lat: 35.6895, lng: 139.6917, zoom: 12 },
  { title: "Standard Map - New York, USA", lat: 40.7128, lng: -74.006, zoom: 12 },
  { title: "City Map - London, UK", lat: 51.5074, lng: -0.1278, zoom: 12 },
  { title: "Location Map - Paris, France", lat: 48.8566, lng: 2.3522, zoom: 12 },
];

export function MapsPage() {
  return (
    <DemoPageShell
      title="Maps"
      subtitle="Integrate beautiful maps into your application with ease."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {maps.map((item) => (
          <DemoSection key={item.title} title={item.title}>
            <MapEmbed
              title={item.title}
              lat={item.lat}
              lng={item.lng}
              zoom={item.zoom}
            />
          </DemoSection>
        ))}
      </div>

      <DemoSection title="City Map - San Francisco, USA">
        <MapEmbed title="San Francisco" lat={37.7749} lng={-122.4194} zoom={12} />
      </DemoSection>
    </DemoPageShell>
  );
}
