"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(hex: string): { label: string; color: string }[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [
    { label: "Complementary", color: hslToHex((h + 180) % 360, s, l) },
    { label: "Split 1", color: hslToHex((h + 150) % 360, s, l) },
    { label: "Split 2", color: hslToHex((h + 210) % 360, s, l) },
    { label: "Triadic 1", color: hslToHex((h + 120) % 360, s, l) },
    { label: "Triadic 2", color: hslToHex((h + 240) % 360, s, l) },
    { label: "Analogous 1", color: hslToHex((h + 30) % 360, s, l) },
    { label: "Analogous 2", color: hslToHex((h - 30 + 360) % 360, s, l) },
  ];
}

function generateShades(hex: string): { label: string; color: string }[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [10, 20, 30, 40, 50, 60, 70, 80, 90].map((l) => ({
    label: `${l * 10 === 500 ? "Base" : l < 50 ? `${(10 - l) * 100}` : `${l * 10}`}`,
    color: hslToHex(h, s, l),
  }));
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1 rounded text-[#8888aa] hover:text-white transition-colors">
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
}

function ColorSwatch({ color, label }: { color: string; label?: string }) {
  return (
    <div className="space-y-1.5">
      <div
        className="w-full h-12 rounded-lg cursor-pointer border border-white/10"
        style={{ background: color }}
        title={color}
        onClick={() => navigator.clipboard.writeText(color)}
      />
      {label && <p className="text-[10px] text-[#8888aa] text-center truncate">{label}</p>}
      <p className="text-[10px] font-mono text-center text-[#f0f0ff]">{color}</p>
    </div>
  );
}

export default function ColorTools() {
  const [hex, setHex] = useState("#6c63ff");
  const [rawInput, setRawInput] = useState("#6c63ff");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const palette = generatePalette(hex);
  const shades = generateShades(hex);

  const handleHexInput = (val: string) => {
    setRawInput(val);
    const cleaned = val.startsWith("#") ? val : `#${val}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      setHex(cleaned);
    }
  };

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const formats = rgb && hsl ? [
    { label: "HEX", value: hex },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "HSL (CSS)", value: `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)` },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Picker + conversions */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
        <div className="space-y-3">
          <input
            type="color"
            value={hex}
            onChange={(e) => {
              setHex(e.target.value);
              setRawInput(e.target.value);
            }}
            className="w-32 h-32 rounded-2xl cursor-pointer border-0 bg-transparent p-0"
            style={{ borderRadius: 16 }}
          />
          <input
            value={rawInput}
            onChange={(e) => handleHexInput(e.target.value)}
            placeholder="#6c63ff"
            className="w-32 bg-white/5 border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm font-mono text-center outline-none focus:border-[#ec4899]"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Formats</h3>
          <div className="space-y-2">
            {formats.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-[#13131a] border border-[#1e1e2e] rounded-lg px-4 py-2.5">
                <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
                <code className="flex-1 text-sm font-mono">{value}</code>
                <button
                  onClick={() => copy(value)}
                  className="p-1 rounded text-[#8888aa] hover:text-white transition-colors"
                >
                  {copied === value ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>

          {rgb && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "R", val: rgb.r, setter: (v: number) => { const next = `#${v.toString(16).padStart(2,"0")}${rgb.g.toString(16).padStart(2,"0")}${rgb.b.toString(16).padStart(2,"0")}`; setHex(next); setRawInput(next); } },
                { label: "G", val: rgb.g, setter: (v: number) => { const next = `#${rgb.r.toString(16).padStart(2,"0")}${v.toString(16).padStart(2,"0")}${rgb.b.toString(16).padStart(2,"0")}`; setHex(next); setRawInput(next); } },
                { label: "B", val: rgb.b, setter: (v: number) => { const next = `#${rgb.r.toString(16).padStart(2,"0")}${rgb.g.toString(16).padStart(2,"0")}${v.toString(16).padStart(2,"0")}`; setHex(next); setRawInput(next); } },
              ].map(({ label, val, setter }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs text-[#8888aa]">
                    <span>{label}</span><span>{val}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={val}
                    onChange={(e) => setter(parseInt(e.target.value))}
                    className="w-full accent-[#ec4899]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Palette */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Harmony Palette</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          <ColorSwatch color={hex} label="Base" />
          {palette.map((p) => (
            <ColorSwatch key={p.label} color={p.color} label={p.label} />
          ))}
        </div>
      </div>

      {/* Shades */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Tints & Shades</h3>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
          {shades.map((s) => (
            <ColorSwatch key={s.label} color={s.color} label={s.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
