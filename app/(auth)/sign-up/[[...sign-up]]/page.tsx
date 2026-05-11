import Link from "next/link";
import OAuthLoginForm from "@/components/forms/oauth-login-form";
import { getConfiguredOAuthProviders } from "@/lib/oauth-provider-config";

type Props = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";
  const providers = getConfiguredOAuthProviders();

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <OAuthLoginForm providers={providers} callbackUrl={callbackUrl} />
      <Link href="/local-login" className="text-sm text-[#0072f5] underline-offset-4 hover:underline">
        Use local login instead
      </Link>
    </div>
  );
}
