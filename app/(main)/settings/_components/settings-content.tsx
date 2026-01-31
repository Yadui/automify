import React from "react";
import ProfileForm from "@/components/forms/profile-form";
import ProfilePicture from "./profile-picture";
import SettingsTabs from "./settings-tabs";
import db from "@/lib/db";

interface SettingsContentProps {
  userId: number;
  userEmail: string;
}

const SettingsContent = async ({ userId, userEmail }: SettingsContentProps) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { connections: true },
  });

  const removeProfileImage = async () => {
    "use server";
    const response = await db.user.update({
      where: { id: userId },
      data: { profileImage: "" },
    });
    return response;
  };

  const uploadProfileImage = async (file: File) => {
    "use server";
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/png";
      const dataUrl = `data:${mimeType};base64,${base64}`;

      await db.user.update({
        where: { id: userId },
        data: { profileImage: dataUrl },
      });

      return { success: true };
    } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error: "Failed to upload image" };
    }
  };

  const updateUserInfo = async (name: string) => {
    "use server";
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { name },
    });
    return updatedUser;
  };

  const updateProfileImage = async (image: string) => {
    "use server";
    const response = await db.user.update({
      where: { id: userId },
      data: { profileImage: image },
    });
    return response;
  };

  const profileContent = (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile picture and personal information
        </p>
      </div>
      <ProfilePicture
        onDelete={removeProfileImage}
        userImage={user?.profileImage || ""}
        onUpload={uploadProfileImage}
        onUpdateImage={updateProfileImage}
      />
      <ProfileForm user={user} onUpdate={updateUserInfo} />
    </section>
  );

  return (
    <SettingsTabs
      profileContent={profileContent}
      connections={user?.connections || []}
      userEmail={userEmail}
    />
  );
};

export default SettingsContent;
