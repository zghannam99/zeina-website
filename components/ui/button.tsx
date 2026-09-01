import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Standard shadcn Button, with the variants mapped to this project's palette
// rather than the usual --primary / --accent token set, which isn't defined
// here. Colours come from globals.css: ink #2b2622, accent #b60d06, rule #e7ded2.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b60d06] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ee] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#b60d06] text-white hover:bg-[#8a0a04]",
        surface:
          "border border-[#e7ded2] bg-white text-[#2b2622] hover:bg-[#fffdfa]",
        outline:
          "border border-[#e7ded2] bg-transparent text-[#2b2622] hover:bg-[#efe8df]",
        ghost: "text-[#2b2622] hover:bg-[#efe8df]",
        link: "text-[#b60d06] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        /** Unpadded — for pill buttons that set their own asymmetric padding. */
        bare: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
