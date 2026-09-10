import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-transparent bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
      outline: 'border-border text-foreground',
      success: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      warning: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
