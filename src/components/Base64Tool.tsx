"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Check, Upload, Trash2, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Direction = "encode" | "decode";

function encode(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    throw new Error("Cannot encode input");
  }
}

function decode(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text.trim())));
  } catch {
    throw new Error("Invalid Base64 input");
  }
}

export default function Base64Tool() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const process = useCallback(
    (val: string, dir: Direction = direction) => {
      setInput(val);
      if (!val) { setOutput(""); setError(""); return; }
      try {
        setOutput(dir === "encode" ? encode(val) : decode(val));
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
        setOutput("");
      }
    },
    [direction]
  );

  const flip = () => {
    const next: Direction = direction === "encode" ? "decode" : "encode";
    setDirection(next);
    // swap input/output
    const newInput = output;
    setInput(newInput);
    process(newInput, next);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput(""); setOutput(""); setError("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    if (direction === "encode") {
      reader.onload = () => {
        const result = reader.result as string;
        // data URL -> strip prefix
        const base64 = result.split(",")[1] ?? result;
        setInput(`[File: ${file.name}]`);
        setOutput(base64);
        setError("");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        process(text, direction);
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-[#1e1e2e]">
          {(["encode", "decode"] as const).map((d) => (
            <button
              key={d}
              onClick={() => { setDirection(d); process(input, d); }}
              className={cn(
                "px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                direction === d
                  ? "bg-[#14b8a6] text-white"
                  : "bg-[#13131a] text-[#8888aa] hover:text-white"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={flip}
          title="Swap input/output"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8888aa] hover:text-white transition-colors"
        >
          <ArrowLeftRight size={14} />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-[#8888aa] hover:text-white transition-colors"
        >
          <Upload size={13} />
          {direction === "encode" ? "Encode file" : "Load file"}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />

        <div className="ml-auto flex gap-2">
          <button
            onClick={copy}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-sm text-[#8888aa] hover:text-white transition-colors"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy output"}
          </button>
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-[#8888aa] hover:text-white transition-colors"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs text-[#8888aa] font-medium">
              {direction === "encode" ? "Plain text" : "Base64"}
            </span>
            <span className="text-xs text-[#8888aa]">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => process(e.target.value)}
            placeholder={direction === "encode" ? "Type or paste plain text…" : "Paste Base64 string…"}
            spellCheck={false}
            className="w-full h-[380px] bg-[#13131a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#14b8a6] resize-none leading-relaxed"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs text-[#8888aa] font-medium">
              {direction === "encode" ? "Base64" : "Plain text"}
            </span>
            <span className="text-xs text-[#8888aa]">{output.length > 0 ? `${output.length} chars` : ""}</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output appears here…"
            spellCheck={false}
            className="w-full h-[380px] bg-[#0d0d14] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm font-mono outline-none resize-none leading-relaxed text-[#a0f0a0]"
          />
        </div>
      </div>

      {output && direction === "encode" && (
        <div className="text-xs text-[#8888aa]">
          {input.length} chars → {output.length} Base64 chars ({Math.round((output.length / (input.length || 1)) * 100)}% of original size in this encoding)
        </div>
      )}
    </div>
  );
}
