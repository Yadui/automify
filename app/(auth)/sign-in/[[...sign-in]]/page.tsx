import LocalLoginForm from "@/components/forms/local-login-form";
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
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <OAuthLoginForm providers={providers} callbackUrl={callbackUrl} />
      <div className="ds-card flex flex-col items-center justify-center gap-4 p-6">
        <LocalLoginForm />
      </div>
    </div>
  );
}
