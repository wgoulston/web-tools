import ColorTools from "@/components/ColorTools";
import { Palette } from "lucide-react";

export const metadata = { title: "Color Tools – Toolbox" };

export default function ColorsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#ec4899]/20 flex items-center justify-center">
          <Palette size={18} className="text-[#ec4899]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Color Tools</h1>
          <p className="text-sm text-[#8888aa]">Convert colors and generate palettes</p>
        </div>
      </div>
      <ColorTools />
    </div>
  );
}
