import { cn } from "@/lib/utils"

/**
 * A placeholder component used to represent content while it's loading.
 * 
 * Features a subtle pulse animation and can be styled to match the 
 * dimensions of the expected content.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

