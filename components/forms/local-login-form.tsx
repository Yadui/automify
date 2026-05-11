"use client";

import React, { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { localLoginAction, type LocalLoginState } from "@/app/(auth)/_actions/local-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LocalLoginState = {};

export default function LocalLoginForm() {
  const [state, formAction, isPending] = useActionState(
    localLoginAction,
    initialState
  );

  return (
    <form action={formAction} className="ds-card flex w-full flex-col gap-4 p-6 text-left">
      <div>
        <p className="ds-eyebrow">Local fallback</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.96px] text-[#171717]">
          Local login
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
          Use this fallback in development. Any valid email and 4+ character password works unless local credentials are configured.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium text-[#171717]">
        Email
        <Input name="email" type="email" placeholder="you@example.com" required />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-[#171717]">
        Name
        <Input name="name" type="text" placeholder="Local User" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-[#171717]">
        Password
        <Input name="password" type="password" placeholder="At least 4 characters" required minLength={4} />
      </label>
      {state.error && (
        <p className="rounded-md bg-[#fff1f0] px-3 py-2 text-sm text-[#d92d20] shadow-[rgb(255,228,226)_0px_0px_0px_1px]">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
        Continue locally
      </Button>
    </form>
  );
}