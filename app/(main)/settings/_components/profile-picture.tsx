"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfilePictureProps {
  userImage: string | null;
  onDelete?: () => Promise<unknown> | void;
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>;
  onUpdateImage: (image: string) => Promise<unknown>;
}

const PRESETS = [
  "https://api.dicebear.com/9.x/notionists/svg?seed=Felix",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Milo",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Tech",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Cyber",
  "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract",
];

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userImage,
  onDelete,
  onUpload,
  onUpdateImage,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileHistory, setProfileHistory] = useState<string[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("profileImageHistory");
    if (saved) {
      setProfileHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (image: string) => {
    if (!image) return;
    const newHistory = [
      image,
      ...profileHistory.filter((h) => h !== image),
    ].slice(0, 3);
    setProfileHistory(newHistory);
    localStorage.setItem("profileImageHistory", JSON.stringify(newHistory));
  };

  const onRemoveProfileImage = async () => {
    if (onDelete) {
      if (userImage) addToHistory(userImage);
      setIsUploading(true);
      await onDelete();
      setIsUploading(false);
      router.refresh();
      toast.success("Profile image removed");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Image too large. Please select an image under 3MB.");
        return;
      }
      if (userImage) addToHistory(userImage);
      setIsUploading(true);
      try {
        const result = await onUpload(file);
        if (result.success) {
          toast.success("Profile image updated!");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to upload image");
        }
      } catch {
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePresetSelect = async (url: string) => {
    if (userImage) addToHistory(userImage);
    setIsUploading(true);
    try {
      await onUpdateImage(url);
      toast.success("Profile style updated!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile style");
    } finally {
      setIsUploading(false);
    }
  };

  const isValidImage =
    userImage &&
    (userImage.startsWith("http") ||
      userImage.startsWith("/") ||
      userImage.startsWith("data:"));

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Main Preview */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted relative bg-muted flex items-center justify-center">
            {isValidImage ? (
              <Image
                src={userImage!}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="text-4xl">👤</div>
            )}

            {/* Overlay for upload */}
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-white" />
              <span className="text-xs text-white font-medium">Upload</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Actions & Presets */}
        <div className="flex-1 w-full space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Upload a custom image or choose from our curated presets.
            </p>
          </div>

          {/* History Section */}
          {profileHistory.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> Recent
              </label>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {profileHistory.map((historyImg, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetSelect(historyImg)}
                    className="w-10 h-10 rounded-full overflow-hidden border border-border hover:scale-110 hover:border-primary transition-all relative"
                    title="Use recent"
                    disabled={isUploading}
                  >
                    <Image
                      src={historyImg}
                      alt="Recent"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Presets
            </label>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:scale-110 hover:border-primary transition-all relative",
                    userImage === preset &&
                      "border-primary ring-2 ring-primary/20 scale-110",
                  )}
                  disabled={isUploading}
                >
                  <Image
                    src={preset}
                    alt={`Preset ${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}

              {/* Upload Button as a tile */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                title="Upload Custom"
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 justify-center sm:justify-start">
            {isUploading && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Updating...
              </span>
            )}

            {!isUploading && isValidImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveProfileImage}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-2" /> Remove Picture
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;
