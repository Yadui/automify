import ProfileForm from "@/components/forms/profile-form";
import React from "react";
import ProfilePicture from "./_components/profile-picture";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

const Settings = async () => {
  const { user: authUser } = await validateRequest();
  if (!authUser) return null;

  const userId = Number(authUser.id);

  const user = await db.user.findUnique({ where: { id: userId } });

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
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    return response.json();
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="sticky top-0 z-[10] pt-20 flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg">
        <span>Settings</span>
      </h1>
      <div className="flex flex-col gap-10 p-6">
        <div>
          <h2 className="text-2xl font-bold">User Profile</h2>
          <p className="text-base text-white/50">
            Add or update your information
          </p>
        </div>
        <ProfilePicture
          onDelete={removeProfileImage}
          userImage={user?.profileImage || ""}
          onUpload={uploadProfileImage}
        />
        <ProfileForm user={user} onUpdate={updateUserInfo} />
      </div>
    </div>
  );
};

export default Settings;
