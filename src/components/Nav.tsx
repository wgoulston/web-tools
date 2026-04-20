"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Wrench, Search, X } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const tools = [
  { href: "/", label: "Home" },
  { href: "/image-crop", label: "Image Crop" },
  { href: "/qr-code", label: "QR Code" },
  { href: "/json-format", label: "JSON" },
  { href: "/password", label: "Password" },
  { href: "/colors", label: "Colors" },
  { href: "/base64", label: "Base64" },
];

const SEARCHABLE = [
  { href: "/image-crop", label: "Image Crop", keywords: ["crop", "image", "photo", "resize", "cut"] },
  { href: "/qr-code", label: "QR Code Generator", keywords: ["qr", "barcode", "scan", "url", "link"] },
  { href: "/json-format", label: "JSON Formatter", keywords: ["json", "format", "minify", "validate", "pretty"] },
  { href: "/password", label: "Password Generator", keywords: ["password", "passphrase", "secure", "random", "key"] },
  { href: "/colors", label: "Color Tools", keywords: ["color", "hex", "rgb", "hsl", "palette", "picker"] },
  { href: "/base64", label: "Base64", keywords: ["base64", "encode", "decode", "convert"] },
];

function useSearch() {
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? SEARCHABLE.filter((t) =>
        [t.label.toLowerCase(), ...t.keywords].some((k) => k.includes(query.toLowerCase()))
      )
    : [];
  return { query, setQuery, results };
}

export default function Nav({ session }: { session?: Session | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery, results } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close on route change
  useEffect(() => { setSearchOpen(false); setQuery(""); }, [pathname, setQuery]);

  // Keyboard shortcut: /
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setQuery]);

  return (
    <nav className="border-b border-[#1e1e2e] bg-[#0d0d14] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#6c63ff] shrink-0">
          <Wrench size={18} />
          Toolbox
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                pathname === t.href
                  ? "bg-[#6c63ff]/20 text-[#6c63ff]"
                  : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8888aa] hover:text-white text-sm transition-colors"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline text-[10px] px-1 py-0.5 rounded bg-white/10">/</kbd>
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#13131a] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e1e2e]">
                  <Search size={14} className="text-[#8888aa]" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tools…"
                    className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-[#8888aa]"
                  />
                  <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
                    <X size={14} className="text-[#8888aa] hover:text-white" />
                  </button>
                </div>
                {results.length > 0 ? (
                  <div className="py-1">
                    {results.map((r) => (
                      <button
                        key={r.href}
                        onClick={() => router.push(r.href)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <p className="px-4 py-3 text-sm text-[#8888aa]">No tools found</p>
                ) : (
                  <div className="py-1">
                    {SEARCHABLE.map((r) => (
                      <button
                        key={r.href}
                        onClick={() => router.push(r.href)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#8888aa] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User */}
          {session?.user && (
            <div className="flex items-center gap-2">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  className="w-7 h-7 rounded-full"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs text-[#8888aa] hover:text-white transition-colors hidden sm:block"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
