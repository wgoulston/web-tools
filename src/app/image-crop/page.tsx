import ImageCropper from "@/components/ImageCropper";
import { Crop } from "lucide-react";

export const metadata = { title: "Image Crop – Toolbox" };

export default function ImageCropPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center">
          <Crop size={18} className="text-[#6c63ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Image Crop</h1>
          <p className="text-sm text-[#8888aa]">Upload an image and crop it interactively</p>
        </div>
      </div>
      <ImageCropper />
    </div>
  );
}
