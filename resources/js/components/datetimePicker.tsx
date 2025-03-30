"use client"

import * as React from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date: Date
  setDate: (date: Date) => void
  className?: string
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const formatForDateTimeLocal = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm")
  }

  const [dateTimeValue, setDateTimeValue] = React.useState<string>(formatForDateTimeLocal(date))

  React.useEffect(() => {
    setDateTimeValue(formatForDateTimeLocal(date))
  }, [date])

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setDateTimeValue(newValue)

    if (newValue) {
      const newDate = new Date(newValue)
      setDate(newDate)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input type="datetime-local" value={dateTimeValue} onChange={handleDateTimeChange} className="w-full" />
    </div>
  )
}

