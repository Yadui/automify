import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#ebf5ff] text-[#0068d6] hover:bg-[#dceeff]",
        secondary:
          "bg-[#fafafa] text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px] hover:bg-white",
        destructive:
          "bg-[#fff1f0] text-[#d92d20] hover:bg-[#ffe4e2]",
        outline:
          "bg-white text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
