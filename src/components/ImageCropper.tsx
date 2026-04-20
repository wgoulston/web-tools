"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ASPECT_OPTIONS = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
];

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper() {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() ?? ""));
    reader.readAsDataURL(file);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() ?? ""));
    reader.readAsDataURL(file);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (aspect) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect));
      }
    },
    [aspect]
  );

  const handleAspectChange = (val: number | undefined) => {
    setAspect(val);
    if (imgRef.current && val) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, val));
    }
  };

  const handleDownload = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/webp" ? "webp" : "png";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cropped.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      outputFormat,
      0.92
    );
  }, [completedCrop, outputFormat]);

  const reset = () => {
    setImgSrc("");
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      {/* Canvas area */}
      <div className="space-y-4">
        {!imgSrc ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#1e1e2e] rounded-xl p-16 text-center cursor-pointer hover:border-[#6c63ff]/60 transition-colors flex flex-col items-center gap-3"
          >
            <Upload size={32} className="text-[#8888aa]" />
            <div>
              <p className="font-medium">Drop an image or click to upload</p>
              <p className="text-sm text-[#8888aa]">PNG, JPG, WebP supported</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl overflow-auto bg-[#13131a] border border-[#1e1e2e] p-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={10}
              minHeight={10}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop target"
                onLoad={onImageLoad}
                style={{ transform: `scale(${scale})`, transformOrigin: "top left", maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Aspect Ratio</h3>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleAspectChange(opt.value)}
                className={cn(
                  "py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
                  aspect === opt.value
                    ? "bg-[#6c63ff] text-white"
                    : "bg-white/5 text-[#8888aa] hover:bg-white/10 hover:text-white"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Zoom</h3>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full accent-[#6c63ff]"
          />
          <p className="text-xs text-[#8888aa] text-right">{Math.round(scale * 100)}%</p>
        </div>

        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa]">Output Format</h3>
          <div className="flex flex-col gap-2">
            {(["image/png", "image/jpeg", "image/webp"] as const).map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="format"
                  value={fmt}
                  checked={outputFormat === fmt}
                  onChange={() => setOutputFormat(fmt)}
                  className="accent-[#6c63ff]"
                />
                {fmt === "image/png" ? "PNG" : fmt === "image/jpeg" ? "JPEG" : "WebP"}
              </label>
            ))}
          </div>
        </div>

        {completedCrop && (
          <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 space-y-1">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[#8888aa] mb-2">Selection</h3>
            <p className="text-xs text-[#8888aa]">
              {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
            </p>
            <p className="text-xs text-[#8888aa]">
              x: {Math.round(completedCrop.x)}, y: {Math.round(completedCrop.y)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleDownload}
            disabled={!completedCrop}
            className="flex items-center justify-center gap-2 bg-[#6c63ff] hover:bg-[#5a52dd] disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg font-medium transition-colors text-sm"
          >
            <Download size={15} />
            Download Cropped
          </button>
          {imgSrc && (
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[#8888aa] hover:text-white py-2.5 px-4 rounded-lg font-medium transition-colors text-sm"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
