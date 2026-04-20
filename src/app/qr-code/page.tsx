import QRGenerator from "@/components/QRGenerator";
import { QrCode } from "lucide-react";

export const metadata = { title: "QR Code – Toolbox" };

export default function QRCodePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
          <QrCode size={18} className="text-[#f59e0b]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
          <p className="text-sm text-[#8888aa]">Turn any text or URL into a scannable QR code</p>
        </div>
      </div>
      <QRGenerator />
    </div>
  );
}
