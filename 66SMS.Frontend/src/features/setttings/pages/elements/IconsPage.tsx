import { useState } from "react";
import type { ElementType } from "react";
import {
  Filter,
  HelpCircle,
  Moon,
  Plane,
  Box,
  Lock,
  Monitor,
  Mouse,
  Paintbrush,
  Menu,
  Watch,
  Volume2,
  Video,
  Wallet,
  PaintBucket,
  Diamond,
  Wand2,
  Circle,
  Hourglass,
  Home,
  User,
  Settings,
  Bell,
  Search,
  Calendar,
  Heart,
  Star,
  Car,
  Camera,
  Mail,
  Phone,
  MapPin,
  Music,
  Cloud,
  Sun,
} from "lucide-react";
import { BodyTabs } from "@/shared/components/Tabs";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const gradientIcons: { icon: ElementType; gradient: string; name: string }[] = [
  { icon: Filter, gradient: "gradient-warm-flame", name: "warm-flame" },
  { icon: HelpCircle, gradient: "gradient-night-fade", name: "night-fade" },
  { icon: Moon, gradient: "gradient-sunny-morning", name: "sunny-morning" },
  { icon: Plane, gradient: "gradient-tempting-azure", name: "tempting-azure" },
  { icon: Box, gradient: "gradient-amy-crisp", name: "amy-crisp" },
  { icon: Lock, gradient: "gradient-malibu-beach", name: "malibu-beach" },
  { icon: Monitor, gradient: "gradient-mean-fruit", name: "mean-fruit" },
  { icon: Mouse, gradient: "gradient-heavy-rain", name: "heavy-rain" },
  { icon: Paintbrush, gradient: "gradient-arielle-smile", name: "arielle-smile" },
  { icon: Menu, gradient: "gradient-ripe-malin", name: "ripe-malin" },
  { icon: Watch, gradient: "gradient-deep-blue", name: "deep-blue" },
  { icon: Volume2, gradient: "gradient-happy-itmeo", name: "happy-itmeo" },
  { icon: Video, gradient: "gradient-happy-fisher", name: "happy-fisher" },
  { icon: Wallet, gradient: "gradient-plum-plate", name: "plum-plate" },
  { icon: PaintBucket, gradient: "gradient-grow-early", name: "grow-early" },
  { icon: Diamond, gradient: "gradient-strong-bliss", name: "strong-bliss" },
  { icon: Wand2, gradient: "gradient-mixed-hopes", name: "mixed-hopes" },
  { icon: Circle, gradient: "gradient-premium-dark", name: "premium-dark" },
  { icon: Hourglass, gradient: "gradient-love-kiss", name: "love-kiss" },
];

const catalogIcons: { icon: ElementType; name: string }[] = [
  { icon: Home, name: "home" },
  { icon: User, name: "user" },
  { icon: Settings, name: "settings" },
  { icon: Bell, name: "bell" },
  { icon: Search, name: "search" },
  { icon: Calendar, name: "calendar" },
  { icon: Heart, name: "heart" },
  { icon: Star, name: "star" },
  { icon: Car, name: "car" },
  { icon: Camera, name: "camera" },
  { icon: Mail, name: "mail" },
  { icon: Phone, name: "phone" },
  { icon: MapPin, name: "map-pin" },
  { icon: Music, name: "music" },
  { icon: Cloud, name: "cloud" },
  { icon: Sun, name: "sun" },
  { icon: Filter, name: "filter" },
  { icon: Lock, name: "lock" },
  { icon: Monitor, name: "monitor" },
  { icon: Diamond, name: "diamond" },
  { icon: Wallet, name: "wallet" },
  { icon: Box, name: "box" },
  { icon: Plane, name: "plane" },
  { icon: Moon, name: "moon" },
];

export function IconsPage() {
  const [tab, setTab] = useState("gradient");

  return (
    <DemoPageShell
      title="Icons"
      subtitle="Lucide icons styled like Architect Pe7 / FontAwesome demos (gradient + catalog)."
    >
      <BodyTabs
        items={[
          { id: "gradient", label: "Gradient Icons" },
          { id: "catalog", label: "Icon Catalog" },
        ]}
        activeId={tab}
        onChange={setTab}
      />

      {tab === "gradient" ? (
        <DemoSection title="Gradient Icons">
          <div className="flex flex-wrap gap-3">
            {gradientIcons.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.name}
                  title={item.name}
                  className={
                    "flex h-16 w-16 items-center justify-center rounded text-white " +
                    item.gradient
                  }
                >
                  <IconComp className="h-7 w-7" />
                </div>
              );
            })}
          </div>
        </DemoSection>
      ) : (
        <DemoSection title="Lucide Catalog">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {catalogIcons.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center rounded border border-kit bg-kit-white p-4 text-center"
                >
                  <IconComp className="mb-2 h-6 w-6 text-kit-primary" />
                  <p className="text-sm text-kit-muted">{item.name}</p>
                </div>
              );
            })}
          </div>
        </DemoSection>
      )}
    </DemoPageShell>
  );
}
