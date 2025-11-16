import { cn } from "@/lib/utils"

export function Heading({ className, ...props }: React.ComponentProps<"h2">) {
    return (
        <h2 className={cn('font-nunit text-xl font-bold mb-2', className)} {...props} />
    )
}