"use client";

import { useState, useCallback } from "react";
import { Check, Copy, Minimize2, Maximize2, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "format" | "minify";

function countLines(s: string) {
  return s ? s.split("\n").length : 0;
}

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<Mode>("format");

  const process = useCallback(
    (raw: string, m: Mode = mode, ind: number = indent) => {
      if (!raw.trim()) {
        setOutput("");
        setError("");
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (m === "minify") {
          setOutput(JSON.stringify(parsed));
        } else {
          setOutput(JSON.stringify(parsed, null, ind));
        }
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid JSON");
        setOutput("");
      }
    },
    [mode, indent]
  );

  const handleInput = (val: string) => {
    setInput(val);
    process(val);
  };

  const handleMode = (m: Mode) => {
    setMode(m);
    process(input, m, indent);
  };

  const handleIndent = (n: number) => {
    setIndent(n);
    process(input, mode, n);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const inputLines = countLines(input);
  const outputLines = countLines(output);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-[#1e1e2e]">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleMode(m)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors",
                mode === m
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#13131a] text-[#8888aa] hover:text-white"
              )}
            >
              {m === "format" ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              {m === "format" ? "Format" : "Minify"}
            </button>
          ))}
        </div>

        {mode === "format" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8888aa]">Indent:</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => handleIndent(n)}
                className={cn(
                  "w-7 h-7 rounded-md text-xs font-semibold transition-colors",
                  indent === n
                    ? "bg-[#3b82f6] text-white"
                    : "bg-white/5 text-[#8888aa] hover:bg-white/10 hover:text-white"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={copy}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-sm text-[#8888aa] hover:text-white transition-colors"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
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

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <code className="text-xs break-all">{error}</code>
        </div>
      )}

      {/* Editor panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8888aa] font-medium">Input</span>
            <span className="text-xs text-[#8888aa]">{inputLines} lines</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={'{\n  "paste": "your JSON here"\n}'}
            spellCheck={false}
            className="w-full h-[480px] bg-[#13131a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#3b82f6] resize-none leading-relaxed"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8888aa] font-medium">Output</span>
            <span className="text-xs text-[#8888aa]">{outputLines > 0 ? `${outputLines} lines` : ""}</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output appears here…"
            spellCheck={false}
            className="w-full h-[480px] bg-[#0d0d14] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm font-mono outline-none resize-none leading-relaxed text-[#a0f0a0]"
          />
        </div>
      </div>
    </div>
  );
}
