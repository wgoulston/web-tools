"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(
  length: number,
  opts: Record<keyof typeof CHARSETS, boolean>
): string {
  const pool = Object.entries(CHARSETS)
    .filter(([k]) => opts[k as keyof typeof CHARSETS])
    .map(([, v]) => v)
    .join("");
  if (!pool) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((n) => pool[n % pool.length])
    .join("");
}

function strength(pw: string): { label: string; color: string; pct: number } {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak", color: "#ef4444", pct: 25 };
  if (score <= 3) return { label: "Fair", color: "#f59e0b", pct: 50 };
  if (score <= 4) return { label: "Good", color: "#3b82f6", pct: 75 };
  return { label: "Strong", color: "#22c55e", pct: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState(() =>
    generatePassword(20, { uppercase: true, lowercase: true, numbers: true, symbols: true })
  );
  const [count, setCount] = useState(1);
  const [bulk, setBulk] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const regen = useCallback(
    (len = length, o = opts) => {
      setPassword(generatePassword(len, o));
      setBulk([]);
    },
    [length, opts]
  );

  const toggleOpt = (key: keyof typeof CHARSETS) => {
    const next = { ...opts, [key]: !opts[key] };
    // require at least one
    if (!Object.values(next).some(Boolean)) return;
    setOpts(next);
    regen(length, next);
  };

  const copy = async (pw: string) => {
    await navigator.clipboard.writeText(pw);
    setCopied(pw);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateBulk = () => {
    const passwords = Array.from({ length: count }, () => generatePassword(length, opts));
    setBulk(passwords);
    setPassword(passwords[0]);
  };

  const str = strength(password);

  return (
    <div className="space-y-6">
      {/* Main password display */}
      <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <code className="flex-1 text-lg font-mono break-all text-[#f0f0ff] select-all leading-relaxed">
            {password || <span className="text-[#8888aa]">Select at least one character type</span>}
          </code>
          <button
            onClick={() => copy(password)}
            className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8888aa] hover:text-white transition-colors"
          >
            {copied === password ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={() => regen()}
            className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8888aa] hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Strength bar */}
        {password && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#8888aa]">Strength</span>
              <span style={{ color: str.color }}>{str.label}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${str.pct}%`, background: str.color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Length</label>
            <span className="text-sm font-mono font-semibold">{length}</span>
          </div>
          <input
            type="range"
            min={6}
            max={128}
            value={length}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              setLength(n);
              regen(n, opts);
            }}
            className="w-full accent-[#ef4444]"
          />
          <div className="flex justify-between text-[10px] text-[#8888aa]">
            <span>6</span><span>128</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Characters</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CHARSETS) as Array<keyof typeof CHARSETS>).map((key) => (
              <button
                key={key}
                onClick={() => toggleOpt(key)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors",
                  opts[key]
                    ? "border-[#ef4444] bg-[#ef4444]/10 text-white"
                    : "border-[#1e1e2e] bg-white/3 text-[#8888aa] hover:border-white/20"
                )}
              >
                <span className="capitalize">{key}</span>
                <span className="text-[10px] font-mono opacity-60">
                  {key === "uppercase" ? "A-Z" : key === "lowercase" ? "a-z" : key === "numbers" ? "0-9" : "!@#"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk generate */}
      <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Bulk Generate</h3>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 bg-white/5 border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#ef4444]"
          />
          <span className="text-sm text-[#8888aa]">passwords</span>
          <button
            onClick={generateBulk}
            className="ml-auto flex items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <RefreshCw size={13} />
            Generate
          </button>
        </div>

        {bulk.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {bulk.map((pw, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2"
              >
                <code className="flex-1 text-xs font-mono break-all text-[#f0f0ff]">{pw}</code>
                <button
                  onClick={() => copy(pw)}
                  className="shrink-0 p-1 rounded text-[#8888aa] hover:text-white transition-colors"
                >
                  {copied === pw ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
