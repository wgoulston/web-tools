import JSONFormatter from "@/components/JSONFormatter";
import { Braces } from "lucide-react";

export const metadata = { title: "JSON Formatter – Toolbox" };

export default function JSONPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
          <Braces size={18} className="text-[#3b82f6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">JSON Formatter</h1>
          <p className="text-sm text-[#8888aa]">Format, validate, and minify JSON</p>
        </div>
      </div>
      <JSONFormatter />
    </div>
  );
}
