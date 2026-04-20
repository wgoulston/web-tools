"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, Loader2, Info } from "lucide-react";

type PassStyle = "generic" | "coupon" | "eventTicket" | "storeCard";

interface PassField {
  key: string;
  label: string;
  value: string;
}

interface PassData {
  style: PassStyle;
  description: string;
  organizationName: string;
  serialNumber: string;
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  logoText: string;
  // Barcode
  barcodeMessage: string;
  barcodeFormat: "PKBarcodeFormatQR" | "PKBarcodeFormatPDF417" | "PKBarcodeFormatAztec" | "PKBarcodeFormatCode128";
  // Fields
  headerFields: PassField[];
  primaryFields: PassField[];
  secondaryFields: PassField[];
  auxiliaryFields: PassField[];
}

const PASS_STYLES: { value: PassStyle; label: string; description: string }[] = [
  { value: "generic", label: "Generic", description: "Basic pass for membership cards, IDs" },
  { value: "coupon", label: "Coupon", description: "Discount or offer coupons" },
  { value: "eventTicket", label: "Event Ticket", description: "Concert, sports, or event tickets" },
  { value: "storeCard", label: "Store Card", description: "Loyalty cards, gift cards" },
];

const BARCODE_FORMATS = [
  { value: "PKBarcodeFormatQR", label: "QR Code" },
  { value: "PKBarcodeFormatPDF417", label: "PDF417" },
  { value: "PKBarcodeFormatAztec", label: "Aztec" },
  { value: "PKBarcodeFormatCode128", label: "Code 128" },
];

const defaultField = (): PassField => ({
  key: crypto.randomUUID().slice(0, 8),
  label: "",
  value: "",
});

const STYLE_COLORS: Record<PassStyle, { bg: string; fg: string; label: string }> = {
  generic: { bg: "#1c1c1e", fg: "#ffffff", label: "#adadad" },
  coupon: { bg: "#e74c3c", fg: "#ffffff", label: "#ffd0cd" },
  eventTicket: { bg: "#1a1a2e", fg: "#e0e0ff", label: "#9999cc" },
  storeCard: { bg: "#2eb872", fg: "#ffffff", label: "#c8ffe3" },
};

function FieldRow({
  field,
  onChange,
  onRemove,
}: {
  field: PassField;
  onChange: (f: PassField) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-2 items-start">
      <input
        placeholder="Label"
        value={field.label}
        onChange={(e) => onChange({ ...field, label: e.target.value })}
        className="flex-1 bg-white/5 border border-[#1e1e2e] rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#6c63ff]"
      />
      <input
        placeholder="Value"
        value={field.value}
        onChange={(e) => onChange({ ...field, value: e.target.value })}
        className="flex-1 bg-white/5 border border-[#1e1e2e] rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#6c63ff]"
      />
      <button
        onClick={onRemove}
        className="text-[#8888aa] hover:text-red-400 px-2 py-1.5 text-sm transition-colors"
      >
        ×
      </button>
    </div>
  );
}

function PassPreview({ data }: { data: PassData }) {
  const colors = STYLE_COLORS[data.style];
  const bg = data.backgroundColor || colors.bg;
  const fg = data.foregroundColor || colors.fg;
  const labelClr = data.labelColor || colors.label;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-xs mx-auto"
      style={{ background: bg, color: fg, fontFamily: "system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <span className="font-bold text-lg truncate">{data.logoText || "My Pass"}</span>
        {data.headerFields[0] && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: labelClr }}>
              {data.headerFields[0].label}
            </div>
            <div className="text-sm font-semibold">{data.headerFields[0].value}</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px mx-5" style={{ background: `${fg}20` }} />

      {/* Primary */}
      <div className="px-5 py-4">
        {data.primaryFields.map((f) => (
          <div key={f.key}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: labelClr }}>
              {f.label}
            </div>
            <div className="text-2xl font-bold truncate">{f.value || "–"}</div>
          </div>
        ))}
      </div>

      {/* Secondary */}
      {data.secondaryFields.some((f) => f.label || f.value) && (
        <div className="px-5 pb-3 flex gap-6">
          {data.secondaryFields.map((f) => (
            <div key={f.key}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: labelClr }}>
                {f.label}
              </div>
              <div className="text-sm font-medium">{f.value || "–"}</div>
            </div>
          ))}
        </div>
      )}

      {/* Auxiliary */}
      {data.auxiliaryFields.some((f) => f.label || f.value) && (
        <div className="px-5 pb-3 flex gap-6">
          {data.auxiliaryFields.map((f) => (
            <div key={f.key}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: labelClr }}>
                {f.label}
              </div>
              <div className="text-xs">{f.value || "–"}</div>
            </div>
          ))}
        </div>
      )}

      {/* Barcode placeholder */}
      {data.barcodeMessage && (
        <div className="mx-5 mb-5 bg-white rounded-xl p-3 flex flex-col items-center">
          <div className="w-full h-12 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,#fff_2px,#fff_6px)] rounded" />
          <p className="text-[10px] text-black mt-1 font-mono truncate max-w-full">
            {data.barcodeMessage}
          </p>
        </div>
      )}
    </div>
  );
}

export default function WalletPassBuilder() {
  const [data, setData] = useState<PassData>({
    style: "generic",
    description: "My Pass",
    organizationName: "",
    serialNumber: "001",
    backgroundColor: "",
    foregroundColor: "",
    labelColor: "",
    logoText: "",
    barcodeMessage: "",
    barcodeFormat: "PKBarcodeFormatQR",
    headerFields: [defaultField()],
    primaryFields: [defaultField()],
    secondaryFields: [defaultField()],
    auxiliaryFields: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCertInfo, setShowCertInfo] = useState(false);

  const set = (key: keyof PassData, value: unknown) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const updateField = (
    group: "headerFields" | "primaryFields" | "secondaryFields" | "auxiliaryFields",
    idx: number,
    field: PassField
  ) =>
    setData((prev) => ({
      ...prev,
      [group]: prev[group].map((f, i) => (i === idx ? field : f)),
    }));

  const removeField = (
    group: "headerFields" | "primaryFields" | "secondaryFields" | "auxiliaryFields",
    idx: number
  ) =>
    setData((prev) => ({
      ...prev,
      [group]: prev[group].filter((_, i) => i !== idx),
    }));

  const addField = (
    group: "headerFields" | "primaryFields" | "secondaryFields" | "auxiliaryFields"
  ) =>
    setData((prev) => ({ ...prev, [group]: [...prev[group], defaultField()] }));

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate pass");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pass.pkpass";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* Form */}
      <div className="space-y-6">
        {/* Style */}
        <section className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Pass Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PASS_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => set("style", s.value)}
                className={cn(
                  "py-2 px-3 rounded-lg text-sm font-medium text-left transition-colors border",
                  data.style === s.value
                    ? "border-[#6c63ff] bg-[#6c63ff]/20 text-white"
                    : "border-[#1e1e2e] bg-white/3 text-[#8888aa] hover:text-white hover:border-white/20"
                )}
              >
                <div>{s.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{s.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Basic info */}
        <section className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "logoText", label: "Logo Text" },
              { key: "organizationName", label: "Organization Name" },
              { key: "description", label: "Description" },
              { key: "serialNumber", label: "Serial Number" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-[#8888aa] mb-1">{label}</label>
                <input
                  value={(data as unknown as Record<string, string>)[key]}
                  onChange={(e) => set(key as keyof PassData, e.target.value)}
                  className="w-full bg-white/5 border border-[#1e1e2e] rounded-md px-3 py-2 text-sm outline-none focus:border-[#6c63ff]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Colors</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "backgroundColor", label: "Background" },
              { key: "foregroundColor", label: "Text" },
              { key: "labelColor", label: "Labels" },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-[#8888aa]">{label}</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={(data as unknown as Record<string, string>)[key] || STYLE_COLORS[data.style][key === "backgroundColor" ? "bg" : key === "foregroundColor" ? "fg" : "label"]}
                    onChange={(e) => set(key as keyof PassData, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    value={(data as unknown as Record<string, string>)[key]}
                    onChange={(e) => set(key as keyof PassData, e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-white/5 border border-[#1e1e2e] rounded-md px-2 py-1 text-xs outline-none focus:border-[#6c63ff]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Barcode */}
        <section className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Barcode</h2>
          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Barcode Message</label>
            <input
              value={data.barcodeMessage}
              onChange={(e) => set("barcodeMessage", e.target.value)}
              placeholder="https://example.com or any text"
              className="w-full bg-white/5 border border-[#1e1e2e] rounded-md px-3 py-2 text-sm outline-none focus:border-[#6c63ff]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Format</label>
            <div className="flex gap-2 flex-wrap">
              {BARCODE_FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => set("barcodeFormat", f.value)}
                  className={cn(
                    "py-1 px-3 rounded-md text-xs font-medium transition-colors",
                    data.barcodeFormat === f.value
                      ? "bg-[#6c63ff] text-white"
                      : "bg-white/5 text-[#8888aa] hover:bg-white/10 hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Fields */}
        {(
          [
            { group: "headerFields", label: "Header Fields (top-right)" },
            { group: "primaryFields", label: "Primary Fields (main content)" },
            { group: "secondaryFields", label: "Secondary Fields" },
            { group: "auxiliaryFields", label: "Auxiliary Fields (small)" },
          ] as const
        ).map(({ group, label }) => (
          <section key={group} className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">{label}</h2>
              <button
                onClick={() => addField(group)}
                className="text-xs text-[#6c63ff] hover:underline"
              >
                + Add
              </button>
            </div>
            {data[group].length === 0 && (
              <p className="text-xs text-[#8888aa]">No fields. Click + Add.</p>
            )}
            {data[group].map((f, i) => (
              <FieldRow
                key={f.key}
                field={f}
                onChange={(updated) => updateField(group, i, updated)}
                onRemove={() => removeField(group, i)}
              />
            ))}
          </section>
        ))}
      </div>

      {/* Preview + download */}
      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa] mb-4">Preview</h2>
          <PassPreview data={data} />
        </div>

        {/* Cert info callout */}
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4">
          <button
            onClick={() => setShowCertInfo(!showCertInfo)}
            className="flex items-center gap-2 text-sm text-[#8888aa] hover:text-white w-full text-left"
          >
            <Info size={14} />
            Certificate setup required
          </button>
          {showCertInfo && (
            <div className="mt-3 text-xs text-[#8888aa] space-y-1.5 leading-relaxed">
              <p>To generate real <code>.pkpass</code> files, you need:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Apple Developer account</li>
                <li>A <strong>Pass Type ID</strong> certificate from Apple</li>
                <li>Export cert as <code>.p12</code> with a password</li>
                <li>Add to <code>/certs/</code> folder and set env vars</li>
              </ol>
              <p className="mt-2">
                Set <code>PASS_CERT_PATH</code>, <code>PASS_CERT_PASSWORD</code>, and <code>PASS_TYPE_ID</code> in your Vercel environment variables.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#2eb872] hover:bg-[#25a060] disabled:opacity-50 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {loading ? "Generating…" : "Download .pkpass"}
        </button>
      </div>
    </div>
  );
}
