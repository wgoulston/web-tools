"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Wrench } from "lucide-react";

const tools = [
  { href: "/", label: "Home" },
  { href: "/image-crop", label: "Image Crop" },
  { href: "/wallet-pass", label: "Wallet Pass" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-[#1e1e2e] bg-[#0d0d14] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#6c63ff]">
          <Wrench size={18} />
          Toolbox
        </Link>
        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === t.href
                  ? "bg-[#6c63ff]/20 text-[#6c63ff]"
                  : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
