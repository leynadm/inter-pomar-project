import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Inter Pomar — Card
 *
 * A neutral surface with one piece of club identity: a short green rule
 * anchored to the top-left edge, which runs the full width of the card on
 * hover or keyboard focus. Everything else is deliberately quiet.
 *
 * Requires `--color-brand` in your `@theme inline` block. See notes at the
 * bottom of this file.
 */

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative isolate flex flex-col gap-(--card-spacing) overflow-hidden rounded-none bg-card py-(--card-spacing) text-xs/relaxed tabular-nums text-card-foreground",
        "ring-1 ring-foreground/10 transition-shadow duration-300 ease-out dark:ring-foreground/15",

        // Tokens. Override --card-accent per-instance to re-colour the rule.
        "[--card-accent-length:2.5rem] [--card-accent:var(--color-brand)] [--card-spacing:--spacing(4)]",

        // The touchline. Sits above media (z-20) so it still reads on cards
        // whose first child is an image.
        "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-20 before:h-0.5 before:w-(--card-accent-length) before:bg-(--card-accent) before:transition-[width] before:duration-500 before:ease-out before:content-['']",
        "hover:before:w-full hover:ring-brand/25",
        "has-[a:focus-visible]:before:w-full has-[a:focus-visible]:ring-brand/25",
        "motion-reduce:before:transition-none",

        // Structural rules (unchanged from the shadcn base).
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
        "data-[size=sm]:[--card-accent-length:1.75rem] data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        "*:[img:first-child]:rounded-none *:[img:last-child]:rounded-none",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-none px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:border-foreground/10 [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-display text-base font-medium uppercase leading-none tracking-[0.06em] text-balance group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-auto flex items-center rounded-none border-t border-foreground/10 bg-foreground/[0.02] p-(--card-spacing) dark:bg-foreground/[0.03]",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

/* ---------------------------------------------------------------------------
 * globals.css — add to your existing @theme inline block:
 *
 *   --color-brand: #1b6b33;
 *   --color-brand-foreground: #ffffff;
 *
 * ------------------------------------------------------------------------ */
