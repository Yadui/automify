import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Props = {
  credits: string;
  tier: string;
};

const CreditTracker = ({ credits, tier }: Props) => {
  const numericCredits = Number.parseInt(credits, 10);
  const safeCredits = Number.isFinite(numericCredits) ? numericCredits : 0;
  const creditLimit = tier == "Free" ? "10" : tier == "Pro" ? "100" : "Unlimited";
  const progressValue = tier == "Free" ? safeCredits * 10 : tier == "Unlimited" ? 100 : safeCredits;

  return (
    <div className="pt-4">
      <Card className="p-6">
        <CardContent className="flex flex-col gap-6 p-0">
          <CardTitle>Credit Tracker</CardTitle>
          <Progress
            value={progressValue}
            className="w-full"
          />
          <div className="flex justify-end">
            <p className="text-sm font-medium text-[#4d4d4d]">
              {tier == "Unlimited" ? "Unlimited" : `${safeCredits}/${creditLimit}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditTracker;
