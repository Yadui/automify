"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Chrome, Github } from "@/components/icons/brand-icons";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { OAuthProviderId } from "@/lib/oauth-provider-config";

type Provider = {
  id: OAuthProviderId;
  name: string;
};

type Props = {
  providers: Provider[];
  callbackUrl?: string;
};

const providerIcons = {
  google: Chrome,
  github: Github,
} satisfies Record<OAuthProviderId, React.ComponentType<{ className?: string }>>;

export default function OAuthLoginForm({ providers, callbackUrl = "/dashboard" }: Props) {
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);

  return (
    <div className="ds-card flex w-full flex-col gap-4 p-6 text-left">
      <div>
        <p className="ds-eyebrow">OAuth login</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.96px] text-[#171717]">
          Sign in to Automify
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => {
          const Icon = providerIcons[provider.id];
          const isPending = pendingProvider === provider.id;

          return (
            <Button
              key={provider.id}
              type="button"
              variant="outline"
              disabled={Boolean(pendingProvider)}
              onClick={() => {
                setPendingProvider(provider.id);
                void signIn(provider.id, { callbackUrl });
              }}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Icon />}
              Continue with {provider.name}
            </Button>
          );
        })}
        {providers.length === 0 && (
          <p className="rounded-md bg-[#fff7ed] px-3 py-2 text-sm text-[#9a3412] shadow-[rgb(255,237,213)_0px_0px_0px_1px]">
            No OAuth providers are configured yet.
          </p>
        )}
      </div>
    </div>
  );
}