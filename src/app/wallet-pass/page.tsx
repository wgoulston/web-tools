import WalletPassBuilder from "@/components/WalletPassBuilder";
import { Wallet } from "lucide-react";

export const metadata = { title: "Wallet Pass – Toolbox" };

export default function WalletPassPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#2eb872]/20 flex items-center justify-center">
          <Wallet size={18} className="text-[#2eb872]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Wallet Pass Builder</h1>
          <p className="text-sm text-[#8888aa]">Design and generate Apple Wallet passes</p>
        </div>
      </div>
      <WalletPassBuilder />
    </div>
  );
}
