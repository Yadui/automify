import { validateRequest } from "@/lib/auth";
import PageHeader from "@/components/page-header";
import BillingContent from "./_components/billing-content";
import { Suspense } from "react";
import { BillingSkeleton } from "./_components/billing-skeleton";

type Props = {
  searchParams?: { [key: string]: string | undefined };
};

const Billing = async (props: Props) => {
  const { session_id } = props.searchParams ?? {
    session_id: "",
  };

  const { user } = await validateRequest();
  if (!user) return null;

  return (
    <div className="flex flex-col h-[90vh] w-[92vw]">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment methods"
      />
      <div className="flex-1 p-6">
        <Suspense fallback={<BillingSkeleton />}>
          <BillingContent userId={Number(user.id)} session_id={session_id} />
        </Suspense>
      </div>
    </div>
  );
};

export default Billing;
