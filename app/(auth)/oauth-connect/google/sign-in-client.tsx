"use client";

import { signIn } from "next-auth/react";
import { useEffect, useRef } from "react";

type GoogleConnectorSignInProps = {
  callbackUrl: string;
  connectorTitle: string;
  scopes: string;
};

const GoogleConnectorSignIn = ({ callbackUrl, connectorTitle, scopes }: GoogleConnectorSignInProps) => {
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    void signIn(
      "google",
      { callbackUrl },
      {
        access_type: "offline",
        include_granted_scopes: "true",
        prompt: "consent",
        response_type: "code",
        scope: scopes,
      }
    );
  }, [callbackUrl, scopes]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <div>
        <h1 className="text-lg font-semibold text-[#171717]">Connecting {connectorTitle}</h1>
        <p className="mt-2 text-sm text-[#666666]">Redirecting to Google...</p>
      </div>
    </div>
  );
};

export default GoogleConnectorSignIn;