"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePictureProps {
  userImage: string | null;
  onDelete?: () => Promise<unknown> | void;
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userImage,
  onDelete,
  onUpload,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const onRemoveProfileImage = async () => {
    if (onDelete) {
      await onDelete();
      router.refresh();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const isValidImage =
    userImage &&
    (userImage.startsWith("http") ||
      userImage.startsWith("/") ||
      userImage.startsWith("data:"));

  return (
    <div className="flex flex-col">
      <p className="text-lg text-white">Profile Picture</p>
      <div className="flex h-[30vh] w-full flex-col items-center justify-center">
        {isValidImage ? (
          <>
            <div className="relative h-full w-full">
              <Image
                src={userImage}
                alt="User_Image"
                fill
                className="object-contain"
                unoptimized={
                  userImage.startsWith("data:") ||
                  (userImage.startsWith("http") &&
                    !userImage.includes("vercel"))
                }
              />
            </div>
            <Button
              onClick={onRemoveProfileImage}
              className="bg-transparent text-white/70 hover:bg-transparent hover:text-white"
            >
              <X /> Remove Logo
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;
