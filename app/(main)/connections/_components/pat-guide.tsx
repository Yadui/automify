"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Hover-triggered guide for creating a GitHub Personal Access Token.
 * Self-contained: wraps its own TooltipProvider.
 */
export function PatGuide() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="How to create a GitHub Personal Access Token"
            className="inline-flex items-center justify-center rounded-full text-[#666666] transition-colors hover:text-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsla(212,100%,48%,1)]"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          align="start"
          sideOffset={10}
          className="max-w-72 whitespace-normal p-0 text-xs leading-relaxed"
        >
          <div className="flex flex-col gap-3 p-4">

            {/* How to create */}
            <div>
              <p className="mb-1.5 font-semibold text-[#171717]">
                How to create a GitHub PAT
              </p>
              <ol className="flex flex-col gap-1 pl-4 text-[#4d4d4d]" style={{ listStyleType: "decimal" }}>
                <li>
                  Go to{" "}
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0969da] underline-offset-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    github.com → Settings
                  </a>
                </li>
                <li>Developer settings → Personal access tokens</li>
                <li>
                  Choose <strong>Fine-grained tokens</strong>{" "}
                  <span className="text-[#666666]">(recommended)</span> or
                  Tokens (classic)
                </li>
                <li>Set an expiration, select your repos, add permissions below</li>
                <li>Generate and copy the token here</li>
              </ol>
            </div>

            <div className="border-t border-[#ebebeb]" />

            {/* Required permissions */}
            <div>
              <p className="mb-1.5 font-semibold text-[#171717]">
                Required permissions
              </p>

              {/* Fine-grained */}
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
                Fine-grained PAT
              </p>
              <ul className="mb-2.5 flex flex-col gap-0.5 text-[#4d4d4d]">
                {[
                  ["Contents", "Read"],
                  ["Issues", "Read and write"],
                  ["Pull requests", "Read"],
                  ["Metadata", "Read (mandatory)"],
                ].map(([perm, level]) => (
                  <li key={perm} className="flex items-baseline gap-1.5">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>
                      <strong>{perm}</strong>
                      <span className="text-[#666666]"> — {level}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Classic */}
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
                Classic PAT
              </p>
              <ul className="flex flex-col gap-0.5 text-[#4d4d4d]">
                <li className="flex items-baseline gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>
                    <strong>repo</strong>
                    <span className="text-[#666666]"> — full repository access</span>
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
