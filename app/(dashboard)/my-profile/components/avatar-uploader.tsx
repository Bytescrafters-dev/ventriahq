"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

async function getCroppedImg(
  imageSrc: string,
  crop: Area,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const scale = image.naturalWidth / image.width;

  const croppedWidth = crop.width * scale;
  const croppedHeight = crop.height * scale;

  canvas.width = croppedWidth;
  canvas.height = croppedHeight;

  ctx.drawImage(
    image,
    crop.x * scale,
    crop.y * scale,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: () => void;
  uploadAvatar: (
    formData: FormData,
  ) => Promise<{ success: true; avatar: string } | undefined>;
  loadingAvatar: boolean;
  error: string | null;
};

export function AvatarUploader({
  open,
  onOpenChange,
  onUploaded,
  uploadAvatar,
  loadingAvatar,
  error,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadCropped() {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const formData = new FormData();
    formData.append("avatar", croppedBlob, "avatar.jpg");

    try {
      const res = await uploadAvatar(formData);
      if (res?.success) {
        onUploaded();
      }
    } catch {
      toast.error("Failed to upload avatar!");
    } finally {
      onOpenChange(false);
    }
  }

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Avatar</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          <div className="p-6 text-center">
            <label
              htmlFor="avatar-upload"
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/40 px-6 py-4 text-sm font-medium text-muted-foreground transition hover:border-muted-foreground/50 hover:bg-muted"
            >
              <span>📁 Choose an image</span>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              PNG, JPG, JPEG – up to 5 MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full h-[300px] bg-muted overflow-hidden rounded-md">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-16">Zoom</span>
              <Slider
                value={[zoom]}
                onValueChange={(v) => setZoom(v[0])}
                min={1}
                max={3}
                step={0.1}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {imageSrc && (
            <>
              <Button
                variant="outline"
                onClick={() => setImageSrc(null)}
                disabled={loadingAvatar}
              >
                Choose another
              </Button>
              <Button onClick={uploadCropped} disabled={loadingAvatar}>
                {loadingAvatar ? "Uploading..." : "Save"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
