import React from "react";
import { cn } from "../../utils/cn";

export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src?: string; fallback?: string }
>(({ className, src, fallback, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800 border border-white/20",
      className,
    )}
    {...props}
  >
    {src ? (
      <img
        src={src}
        className="aspect-square h-full w-full object-cover"
        alt="Avatar"
      />
    ) : (
      <span className="flex h-full w-full items-center justify-center text-sm font-medium">
        {fallback}
      </span>
    )}
  </div>
));
Avatar.displayName = "Avatar";
