import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({ className, checked, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-input ring-offset-background",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",
          "cursor-pointer transition-colors",
          className
        )}
        onClick={() => {
          const input = document.activeElement as HTMLInputElement
          if (input?.type !== "checkbox") {
            onCheckedChange?.(!checked)
          }
        }}
      >
        {checked && (
          <Check className="h-3 w-3 text-primary-foreground m-0.5" strokeWidth={3} />
        )}
      </div>
    </div>
  )
}

export { Checkbox }
