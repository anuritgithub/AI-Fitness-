"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // Base styles
        "aspect-square size-5 shrink-0 rounded-full border-2 shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // Default state (unchecked)
        "border-neutral-400 dark:border-pink-400/40 bg-white dark:bg-neutral-800 hover:border-neutral-500 dark:hover:border-pink-400/60",
        // Focus state
        "focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-1 dark:focus-visible:ring-pink-400 dark:focus-visible:ring-offset-neutral-900",
        // Checked state
        "data-[state=checked]:border-pink-500 dark:data-[state=checked]:border-pink-400 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-pink-500 data-[state=checked]:to-pink-600 dark:data-[state=checked]:from-pink-500 dark:data-[state=checked]:to-pink-600 data-[state=checked]:shadow-md data-[state=checked]:shadow-pink-500/50 dark:data-[state=checked]:shadow-pink-400/30",
        // Invalid state
        "aria-invalid:border-red-500 dark:aria-invalid:border-red-400 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/20",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {/* White dot indicator for selected state */}
        <CircleIcon className="fill-white stroke-white absolute size-2 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 drop-shadow-md" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
