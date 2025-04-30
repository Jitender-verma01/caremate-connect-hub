import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
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
    // The issue appears to be related to how we're handling the Slot component
    // When asChild is true but the child isn't a valid React element
    // So we need to be more careful about when to use Slot
    
    // Only use Slot when asChild is true AND we're sure we have a valid child element
    const Comp = asChild ? Slot : "button"
    
    // We need to ensure the component works properly even when disabled
    const buttonProps = {
      className: cn(buttonVariants({ variant, size }), className),
      ref,
      ...props
    }
    
    // If it's disabled, always use a regular button to avoid Slot issues
    if (props.disabled) {
      return <button {...buttonProps} />
    }
    
    // Otherwise, use the chosen component (Slot or button)
    return <Comp {...buttonProps} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
