import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tabsListVariants = cva("flex items-center gap-2 overflow-x-auto pb-1");

const tabsTriggerVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 data-[state=active]:bg-red-500 data-[state=active]:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(tabsListVariants(), className)} {...props} />;
}

function TabsTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(tabsTriggerVariants(), className)}
      type="button"
      {...props}
    />
  );
}

export { TabsList, TabsTrigger };
