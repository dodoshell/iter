import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Palette di stato: ogni variante è un colore semantico distinto e testato per
// contrasto ≥4.5:1 sia in light che dark (coppie bg-100/text-800 e bg-950/text-300).
const badgeVariants = cva('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      outline: 'border-border text-foreground',
      muted: 'border-transparent bg-secondary text-secondary-foreground',
      info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      warning: 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
})

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
