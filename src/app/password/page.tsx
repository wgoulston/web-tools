import PasswordGenerator from "@/components/PasswordGenerator";
import { KeyRound } from "lucide-react";

export const metadata = { title: "Password Generator – Toolbox" };

export default function PasswordPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
          <KeyRound size={18} className="text-[#ef4444]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Password Generator</h1>
          <p className="text-sm text-[#8888aa]">Generate strong, random passwords</p>
        </div>
      </div>
      <PasswordGenerator />
    </div>
  );
}
