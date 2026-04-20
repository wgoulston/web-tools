import Link from "next/link";
import { Crop, Wallet } from "lucide-react";

const tools = [
  {
    href: "/image-crop",
    icon: Crop,
    title: "Image Crop",
    description: "Interactively crop, resize, and export images with pixel-perfect control.",
    color: "#6c63ff",
  },
  {
    href: "/wallet-pass",
    icon: Wallet,
    title: "Wallet Pass",
    description: "Create custom Apple Wallet passes — loyalty cards, coupons, event tickets, and more.",
    color: "#2eb872",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Your Toolbox</h1>
        <p className="text-[#8888aa] text-lg">Personal collection of web tools.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(({ href, icon: Icon, title, description, color }) => (
          <Link
            key={href}
            href={href}
            className="tool-card rounded-xl p-6 flex flex-col gap-4 group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${color}22` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1 group-hover:text-[#6c63ff] transition-colors">
                {title}
              </h2>
              <p className="text-sm text-[#8888aa] leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
