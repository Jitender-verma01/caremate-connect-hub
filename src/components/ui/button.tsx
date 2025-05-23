
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
    const buttonClassName = cn(buttonVariants({ variant, size }), className);
    
    // SAFETY CHECK: Don't use Slot if:
    // 1. asChild is false
    // 2. Button is disabled
    // 3. There are no children
    // 4. There are multiple children
    // 5. The child is not a valid React element
    if (
      !asChild || 
      props.disabled || 
      !children || 
      React.Children.count(children) !== 1 || 
      !React.isValidElement(children)
    ) {
      return (
        <button 
          className={buttonClassName}
          ref={ref}
          {...props}
        >
          {children}
        </button>
      );
    }
    
    // At this point we're certain we can safely use Slot with exactly one React element child
    return (
      <Slot 
        className={buttonClassName}
        ref={ref}
        {...props}
      >
        {children}
      </Slot>
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
