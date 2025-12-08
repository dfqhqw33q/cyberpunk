"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
    ultrawide?: number
  }
  gap?: "sm" | "md" | "lg"
  density?: "compact" | "standard" | "expanded"
}

export function ResponsiveGrid({
  children,
  className,
  columns = { mobile: 4, tablet: 8, desktop: 12, ultrawide: 12 },
  gap = "md",
  density = "standard",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2 md:gap-3 lg:gap-4",
    md: "gap-3 md:gap-4 lg:gap-6",
    lg: "gap-4 md:gap-6 lg:gap-8",
  }

  const densityClasses = {
    compact: "p-2 md:p-3 lg:p-4",
    standard: "p-4 md:p-6 lg:p-8",
    expanded: "p-6 md:p-8 lg:p-12",
  }

  return (
    <div
      className={cn("grid", gapClasses[gap], densityClasses[density], className)}
      style={{
        gridTemplateColumns: `repeat(${columns.mobile}, minmax(0, 1fr))`,
      }}
    >
      <style jsx>{`
        @media (min-width: 768px) {
          div {
            grid-template-columns: repeat(${columns.tablet}, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          div {
            grid-template-columns: repeat(${columns.desktop}, minmax(0, 1fr));
          }
        }
        @media (min-width: 1920px) {
          div {
            grid-template-columns: repeat(${columns.ultrawide}, minmax(0, 1fr));
          }
        }
      `}</style>
      {children}
    </div>
  )
}

// Grid item with responsive column spanning
interface GridItemProps {
  children: ReactNode
  className?: string
  span?: {
    mobile?: number
    tablet?: number
    desktop?: number
    ultrawide?: number
  }
}

export function GridItem({ children, className, span = {} }: GridItemProps) {
  const { mobile = 4, tablet = 4, desktop = 4, ultrawide = 4 } = span

  return (
    <div
      className={cn("col-span-full", className)}
      style={{
        gridColumn: `span ${mobile} / span ${mobile}`,
      }}
    >
      <style jsx>{`
        @media (min-width: 768px) {
          div {
            grid-column: span ${tablet} / span ${tablet};
          }
        }
        @media (min-width: 1024px) {
          div {
            grid-column: span ${desktop} / span ${desktop};
          }
        }
        @media (min-width: 1920px) {
          div {
            grid-column: span ${ultrawide} / span ${ultrawide};
          }
        }
      `}</style>
      {children}
    </div>
  )
}
