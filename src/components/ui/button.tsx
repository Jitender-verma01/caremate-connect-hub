
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
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    // Create a robust solution that handles all edge cases:
    // 1. Check if the component is disabled - always use button
    // 2. Check if asChild is true and children exists - only then use Slot
    // 3. Default to button element in all other cases

    // Prepare common props for either component
    const buttonProps = {
      className: cn(buttonVariants({ variant, size }), className),
      ref,
      ...props
    }
    
    // Always use regular button for disabled state
    if (props.disabled) {
      return <button {...buttonProps}>{children}</button>
    }
    
    // Use Slot only when asChild is true AND we have children
    if (asChild && React.Children.count(children) > 0) {
      // Ensure there's a single valid element child for Slot
      try {
        return <Slot {...buttonProps}>{children}</Slot>
      } catch (error) {
        // Fallback to button if Slot fails
        console.warn("Button with asChild failed, falling back to regular button", error)
        return <button {...buttonProps}>{children}</button>
      }
    }
    
    // Default case: use standard button
    return <button {...buttonProps}>{children}</button>
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
