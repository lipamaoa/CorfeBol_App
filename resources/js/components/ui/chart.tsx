"use client"

import type * as React from "react"
import { Tooltip, type TooltipProps } from "recharts"

import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  // Create CSS variables for chart colors
  const style = Object.entries(config).reduce(
    (acc, [key, value]) => {
      acc[`--color-${key}`] = value.color
      return acc
    },
    {} as Record<string, string>,
  )

  return (
    <div
      className={cn("chart-container", className)}
      style={
        {
          "--chart-1": "215 25% 27%",
          "--chart-2": "142 72% 29%",
          "--chart-3": "198 93% 60%",
          "--chart-4": "254 75% 57%",
          "--chart-5": "43 96% 56%",
          "--chart-6": "339 90% 51%",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string, props: any) => React.ReactNode
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>
      <div className="grid gap-2">
        {label && (
          <div className="text-xs text-muted-foreground">{labelFormatter ? labelFormatter(label, payload) : label}</div>
        )}
        <div className="grid gap-1">
          {payload.map((item, index) => {
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
                <span className="font-medium">
                  {formatter ? formatter(item.value, item.name, item) : `${item.name}: ${item.value}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ChartTooltip({ className, ...props }: TooltipProps<any, any>) {
  return <Tooltip content={<ChartTooltipContent {...props} />} cursor={{ opacity: 0.2 }} {...props} />
}

