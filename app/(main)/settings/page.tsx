import ProfileForm from "@/components/forms/profile-form";
import React from "react";
import ProfilePicture from "./_components/profile-picture";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import PageHeader from "@/components/page-header";
import SettingsTabs from "./_components/settings-tabs";

const Settings = async () => {
  const { user: authUser } = await validateRequest();
  if (!authUser) return null;

  const userId = Number(authUser.id);

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { connections: true },
  });

  const removeProfileImage = async () => {
    "use server";
    const response = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        profileImage: "",
      },
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
      where: {
        id: userId,
      },
      data: {
        name,
      },
    });
    return updatedUser;
  };

  // Profile content to pass to tabs
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
      />
      <ProfileForm user={user} onUpdate={updateUserInfo} />
    </section>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      <div className="flex-1 p-6">
        <SettingsTabs
          profileContent={profileContent}
          connections={user?.connections || []}
          userEmail={user?.email || authUser.email || ""}
        />
      </div>
    </div>
  );
};

export default Settings;
