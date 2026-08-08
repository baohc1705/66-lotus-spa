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
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const gradientIcons: { icon: ElementType; gradient: string; name: string }[] = [
  { icon: Filter, gradient: "bg-[linear-gradient(45deg,#ff9a9e_0%,#fad0c4_100%)]", name: "warm-flame" },
  { icon: HelpCircle, gradient: "bg-[linear-gradient(to_top,#a18cd1_0%,#fbc2eb_100%)]", name: "night-fade" },
  { icon: Moon, gradient: "bg-[linear-gradient(120deg,#f6d365_0%,#fda085_100%)]", name: "sunny-morning" },
  { icon: Plane, gradient: "bg-[linear-gradient(120deg,#84fab0_0%,#8fd3f4_100%)]", name: "tempting-azure" },
  { icon: Box, gradient: "bg-[linear-gradient(120deg,#a6c0fe_0%,#f68084_100%)]", name: "amy-crisp" },
  { icon: Lock, gradient: "bg-[linear-gradient(to_right,#4facfe_0%,#00f2fe_100%)]", name: "malibu-beach" },
  { icon: Monitor, gradient: "bg-[linear-gradient(120deg,#fccb90_0%,#d57eeb_100%)]", name: "mean-fruit" },
  { icon: Mouse, gradient: "bg-[linear-gradient(to_top,#cfd9df_0%,#e2ebf0_100%)]", name: "heavy-rain" },
  { icon: Paintbrush, gradient: "bg-[radial-gradient(circle_248px_at_center,#16d9e3_0%,#30c7ec_47%,#46aef7_100%)]", name: "arielle-smile" },
  { icon: Menu, gradient: "bg-[linear-gradient(120deg,#f093fb_0%,#f5576c_100%)]", name: "ripe-malin" },
  { icon: Watch, gradient: "bg-[linear-gradient(120deg,#e0c3fc_0%,#8ec5fc_100%)]", name: "deep-blue" },
  { icon: Volume2, gradient: "bg-[linear-gradient(to_top,#96deda_0%,#50c9c3_100%)]", name: "happy-itmeo" },
  { icon: Video, gradient: "bg-[linear-gradient(120deg,#89f7fe_0%,#66a6ff_100%)]", name: "happy-fisher" },
  { icon: Wallet, gradient: "bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]", name: "plum-plate" },
  { icon: PaintBucket, gradient: "bg-[linear-gradient(to_top,#0ba360_0%,#3cba92_100%)]", name: "grow-early" },
  { icon: Diamond, gradient: "bg-[linear-gradient(to_right,#f78ca0_0%,#f9748f_19%,#fd868c_60%,#fe9a8b_100%)]", name: "strong-bliss" },
  { icon: Wand2, gradient: "bg-[linear-gradient(to_right,#c471f5_0%,#fa71cd_100%)]", name: "mixed-hopes" },
  { icon: Circle, gradient: "bg-[linear-gradient(to_right,#434343_0%,#000_100%)]", name: "premium-dark" },
  { icon: Hourglass, gradient: "bg-[linear-gradient(to_top,#ff0844_0%,#ffb199_100%)]", name: "love-kiss" },
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
  const [tab, setTab] = useState<"gradient" | "catalog">("gradient");

  return (
    <DemoPageShell
      title="Icons"
      subtitle="Lucide icons styled like Architect Pe7 / FontAwesome demos (gradient + catalog)."
    >
      <div className="mb-4 flex gap-2 border-b border-gray-200 text-sm">
        <button
          type="button"
          onClick={() => setTab("gradient")}
          className={
            "px-4 py-2 font-normal " +
            (tab === "gradient"
              ? "border-b-2 border-[#3f6ad8] text-[#3f6ad8]"
              : "text-[#6c757d]")
          }
        >
          Gradient Icons
        </button>
        <button
          type="button"
          onClick={() => setTab("catalog")}
          className={
            "px-4 py-2 font-normal " +
            (tab === "catalog"
              ? "border-b-2 border-[#3f6ad8] text-[#3f6ad8]"
              : "text-[#6c757d]")
          }
        >
          Icon Catalog
        </button>
      </div>

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
                  className="flex flex-col items-center rounded border border-gray-100 bg-white p-4 text-center"
                >
                  <IconComp className="mb-2 h-6 w-6 text-[#3f6ad8]" />
                  <p className="text-sm text-[#6c757d]">{item.name}</p>
                </div>
              );
            })}
          </div>
        </DemoSection>
      )}
    </DemoPageShell>
  );
}
