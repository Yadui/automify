"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

interface ProfilePictureProps {
  userImage: string | null;
  onDelete?: () => void;
  onUpload: (file: File) => Promise<void> | void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userImage,
  onDelete,
  onUpload,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onRemoveProfileImage = async () => {
    if (onDelete) {
      onDelete();
      router.refresh();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const isValidImage =
    userImage && (userImage.startsWith("http") || userImage.startsWith("/"));

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
                  userImage.startsWith("http") && !userImage.includes("vercel")
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
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;
