import PageHeader from "@/components/page-header";
import { Suspense } from "react";
import ConnectionList from "./_components/connection-list";
import { ConnectionsSkeleton } from "./_components/connections-skeleton";
import { validateRequest } from "@/lib/auth";

const Connections = async () => {
  const { user } = await validateRequest();
  if (!user) return null;

  return (
    <div className="flex flex-col h-[90vh] w-[92vw]">
      <PageHeader
        title="Connections"
        description="Connect all your apps directly from here. You may need to reconnect to refresh verification."
      />
      <div className="flex-1 p-6">
        <Suspense fallback={<ConnectionsSkeleton />}>
          <ConnectionList userId={Number(user.id)} />
        </Suspense>
      </div>
    </div>
  );
};

export default Connections;
