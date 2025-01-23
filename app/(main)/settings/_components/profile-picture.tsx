"use client";
import React from "react";
import UploadCareButton from "./uploadcare-button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Define a specific type for props instead of using any
interface ProfilePictureProps {
  userImage: string | null;
  onDelete?: () => void; // Optional delete handler
  onUpload: (file: File) => Promise<void> | void; // Upload handler with file parameter
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userImage,
  onDelete,
  onUpload,
}) => {
  const router = useRouter();

  const onRemoveProfileImage = async () => {
    if (onDelete) {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-lg text-white"> Profile Picture</p>
      <div className="flex h-[30vh] w-full flex-col items-center justify-center">
        {userImage ? (
          <>
            <div className="relative h-full w-full">
              <Image
                src={userImage}
                alt="User_Image"
                layout="fill" // Makes the image fill the parent div
                objectFit="contain" // Ensures the image covers the parent div
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
          <UploadCareButton
            onUpload={(url: string) => {
              // Convert URL to File object if needed
              return fetch(url)
                .then((res) => res.blob())
                .then((blob) =>
                  onUpload(
                    new File([blob], "profile-image", { type: blob.type })
                  )
                );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;
