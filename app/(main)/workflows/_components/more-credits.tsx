"use client";
import React from "react";
import { useBilling } from "@/providers/billing-provider";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

// Replace empty interface with proper type

// Remove unused props parameter if not needed
export default function MoreCredits() {
  const { credits } = useBilling();
  return credits !== "0" ? (
    <></>
  ) : (
    <Card>
      <CardContent className="p-6">
        <CardDescription>You are out of credits</CardDescription>
      </CardContent>
    </Card>
  );
}
