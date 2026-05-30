"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  currentImage?: string | null;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSizeMB = 5,
  label = "Subir imagen",
  currentImage,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen no debe superar los ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer",
          "hover:border-primary-container/50 hover:bg-surface-container-low transition-all",
          preview && "border-primary-container/50",
        )}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
            >
              <span className="material-symbols-outlined text-[14px]">
                close
              </span>
            </button>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <span className="material-symbols-outlined text-[32px] text-secondary block">
              add_photo_alternate
            </span>
            <p className="text-body-sm text-secondary font-body-sm">{label}</p>
            <p className="text-label-sm text-secondary font-label-sm">
              PNG, JPG hasta {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && (
        <p className="text-body-sm text-error font-body-sm">{error}</p>
      )}
    </div>
  );
}
