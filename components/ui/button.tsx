import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsla(212,100%,48%,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#171717] text-white shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px] hover:bg-black",
        destructive:
          "bg-[#ff5b4f] text-white shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px] hover:bg-[#e84f44]",
        outline:
          "bg-white text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px] hover:bg-[#171717] hover:text-white",
        secondary:
          "bg-[#ebf5ff] text-[#0068d6] shadow-[rgba(0,0,0,0.04)_0px_0px_0px_1px] hover:bg-[#dceeff]",
        ghost: "text-[#171717] hover:bg-[#fafafa] hover:text-[#171717]",
        link: "text-[#0072f5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
