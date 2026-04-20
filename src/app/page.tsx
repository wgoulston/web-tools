import Link from "next/link";
import { Crop, QrCode, Braces, KeyRound, Palette, FileCode2 } from "lucide-react";

const tools = [
  {
    href: "/image-crop",
    icon: Crop,
    title: "Image Crop",
    description: "Interactively crop and export images. Free-form or locked aspect ratios.",
    color: "#6c63ff",
  },
  {
    href: "/qr-code",
    icon: QrCode,
    title: "QR Code Generator",
    description: "Turn any URL or text into a scannable QR code. Download as PNG or SVG.",
    color: "#f59e0b",
  },
  {
    href: "/json-format",
    icon: Braces,
    title: "JSON Formatter",
    description: "Format, validate, and minify JSON. Highlights errors and pretty-prints.",
    color: "#3b82f6",
  },
  {
    href: "/password",
    icon: KeyRound,
    title: "Password Generator",
    description: "Generate strong passwords with custom length and character sets.",
    color: "#ef4444",
  },
  {
    href: "/colors",
    icon: Palette,
    title: "Color Tools",
    description: "Pick colors, convert between HEX/RGB/HSL, and generate palettes.",
    color: "#ec4899",
  },
  {
    href: "/base64",
    icon: FileCode2,
    title: "Base64",
    description: "Encode or decode text and files to/from Base64.",
    color: "#14b8a6",
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
