import React from "react";
import { cn } from "../../utils/cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-white/10 bg-card/60 backdrop-blur-xl text-white shadow-lg",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";
