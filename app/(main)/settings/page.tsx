import ProfileForm from "@/components/forms/profile-form";
import React from "react";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";

const Settings = async () => {
  const authUser = await getAppUser();
  if (!authUser) return null;

  // authUser already carries name + email from the cached auth round-trip.
  // A separate db.user.findUnique for the same row is redundant — ProfileForm
  // only needs { name, email } which AppAuthUser already provides.
  const displayName = authUser.name || authUser.email;
  const initial = displayName?.trim()?.[0]?.toUpperCase() || "A";

  const updateUserInfo = async (name: string) => {
    "use server";

    const updateUser = await db.user.update({
      where: {
        appId: authUser.id,
      },
      data: {
        name,
      },
    });
    return updateUser;
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Account</p>
          <h1 className="ds-page-title mt-3">Settings</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Update profile information and keep workspace identity current.
          </p>
        </div>
      </header>
      <section className="ds-card grid gap-10 p-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-[#171717]">Profile Initial</p>
          <div className="mt-4 flex min-h-64 w-full flex-col items-center justify-center rounded-lg bg-[#fafafa] p-6 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ebf5ff] text-4xl font-semibold text-[#0068d6] shadow-[rgba(0,104,214,0.18)_0px_0px_0px_1px]">
              {initial}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#4d4d4d]">
              Profile images are disabled for this workspace.
            </p>
          </div>
        </div>
        <div>
          <h2 className="ds-card-title">User Profile</h2>
          <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
            Add or update your information.
          </p>
          <div className="mt-8">
            <ProfileForm user={authUser} onUpdate={updateUserInfo} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;

