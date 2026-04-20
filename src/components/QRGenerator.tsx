"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ERROR_LEVELS = ["L", "M", "Q", "H"] as const;
type ErrorLevel = (typeof ERROR_LEVELS)[number];

export default function QRGenerator() {
  const [text, setText] = useState("https://");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  }, []);

  const downloadSVG = useCallback(() => {
    const svg = document.querySelector("#qr-svg-export");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
      {/* Preview */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[#8888aa] mb-2">Text or URL</label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Enter any text or URL…"
              className="w-full bg-[#13131a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f59e0b] resize-none"
            />
            <button
              onClick={copyText}
              className="absolute top-2 right-2 p-1.5 rounded-md text-[#8888aa] hover:text-white hover:bg-white/10 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div
          className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-6 flex items-center justify-center"
          style={{ minHeight: 320 }}
        >
          {text ? (
            <>
              {/* Hidden canvas for PNG download */}
              <div ref={canvasRef} className="hidden">
                <QRCodeCanvas value={text} size={size} fgColor={fgColor} bgColor={bgColor} level={errorLevel} />
              </div>
              {/* Visible SVG */}
              <QRCodeSVG
                id="qr-svg-export"
                value={text}
                size={Math.min(size, 280)}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorLevel}
                style={{ borderRadius: 8 }}
              />
            </>
          ) : (
            <p className="text-[#8888aa] text-sm">Enter text above to generate</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadPNG}
            disabled={!text}
            className="flex-1 flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 text-black font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            <Download size={14} /> PNG
          </button>
          <button
            onClick={downloadSVG}
            disabled={!text}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            <Download size={14} /> SVG
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Size</h3>
          <input
            type="range"
            min={128}
            max={512}
            step={16}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full accent-[#f59e0b]"
          />
          <p className="text-xs text-[#8888aa] text-right">{size}px</p>
        </div>

        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Colors</h3>
          {[
            { label: "Foreground", val: fgColor, set: setFgColor },
            { label: "Background", val: bgColor, set: setBgColor },
          ].map(({ label, val, set }) => (
            <div key={label} className="flex items-center gap-3">
              <input
                type="color"
                value={val}
                onChange={(e) => set(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <div className="flex-1">
                <p className="text-xs text-[#8888aa]">{label}</p>
                <input
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-white/5 border border-[#1e1e2e] rounded px-2 py-1 text-xs font-mono outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Error Correction</h3>
          <div className="grid grid-cols-4 gap-1.5">
            {ERROR_LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setErrorLevel(lvl)}
                className={cn(
                  "py-1.5 rounded-md text-xs font-semibold transition-colors",
                  errorLevel === lvl
                    ? "bg-[#f59e0b] text-black"
                    : "bg-white/5 text-[#8888aa] hover:bg-white/10 hover:text-white"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#8888aa]">
            L=7% · M=15% · Q=25% · H=30% recovery
          </p>
        </div>
      </div>
    </div>
  );
}
