import Base64Tool from "@/components/Base64Tool";
import { FileCode2 } from "lucide-react";

export const metadata = { title: "Base64 – Toolbox" };

export default function Base64Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#14b8a6]/20 flex items-center justify-center">
          <FileCode2 size={18} className="text-[#14b8a6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Base64</h1>
          <p className="text-sm text-[#8888aa]">Encode or decode text and files</p>
        </div>
      </div>
      <Base64Tool />
    </div>
  );
}
