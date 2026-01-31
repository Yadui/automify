import { validateRequest } from "@/lib/auth";
import PageHeader from "@/components/page-header";
import SettingsContent from "./_components/settings-content";
import { Suspense } from "react";
import { SettingsSkeleton } from "./_components/settings-skeleton";

const Settings = async () => {
  const { user: authUser } = await validateRequest();
  if (!authUser) return null;

  return (
    <div className="flex flex-col h-[90vh] w-[92vw]">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      <div className="flex-1 p-6">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent
            userId={Number(authUser.id)}
            userEmail={authUser.email || ""}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Settings;
