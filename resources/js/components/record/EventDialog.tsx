"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Player, Action } from "@/pages/games/record"
import {
  Target,
  Heart,
  Shield,
  RefreshCcw,
  RotateCcw,
  X,
  AlertCircle,
  Plus,
  Award,
  Timer,
  Flag,
  BellIcon as Whistle,
  Zap,
  UserPlus,
  Repeat,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlayer: Player | null
  selectedActionId: number | null
  setSelectedActionId: (id: number | null) => void
  eventSuccess: boolean
  setEventSuccess: (success: boolean) => void
  eventDescription: string
  setEventDescription: (description: string) => void
  handleAddEvent: () => void
  actions: Action[]
}

export function EventDialog({
  open,
  onOpenChange,
  selectedPlayer,
  selectedActionId,
  setSelectedActionId,
  eventSuccess,
  setEventSuccess,
  eventDescription,
  setEventDescription,
  handleAddEvent,
  actions,
}: EventDialogProps) {
  const [showDescription, setShowDescription] = useState(false)

  // Define action button colors based on action type - simpler, more muted colors
  const getActionColor = (actionCode: string): string => {
    const colorMap: Record<string, string> = {
      G: "bg-orange-500", 
      A: "bg-emerald-600", 
      S: "bg-teal-500", 
      PS: "bg-amber-500", 
      D: "bg-indigo-600",
      RG: "bg-blue-600", 
      RP: "bg-sky-500", 
      LC: "bg-rose-500", 
      LM: "bg-red-600", 
      LL: "bg-red-700", 
      P: "bg-pink-500",
      MP: "bg-violet-500", 
      Pa: "bg-slate-600", 
      F: "bg-cyan-600", 
      Pe: "bg-green-700", 
      T: "bg-zinc-600", 
      O: "bg-neutral-500", 
    }

    for (const [key, color] of Object.entries(colorMap)) {
      if (actionCode === key) {
        return color
      }
    }

    return "bg-gray-500" 
  }

  // Map action codes to icons
  const getActionIcon = (actionCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      G: <Award className="h-4 w-4" />,
      A: <Heart className="h-4 w-4" />, 
      S: <UserPlus className="h-4 w-4" />, 
      PS: <Repeat className="h-4 w-4" />, 
      D: <Shield className="h-4 w-4" />, 
      RG: <RefreshCcw className="h-4 w-4" />, 
      RP: <RotateCcw className="h-4 w-4" />, 
      LC: <Target className="h-4 w-4" />, 
      LM: <Target className="h-4 w-4" />, 
      LL: <Target className="h-4 w-4" />, 
      P: <Target className="h-4 w-4" />, 
      MP: <X className="h-4 w-4" />, 
      Pa: <AlertCircle className="h-4 w-4" />, 
      F: <Whistle className="h-4 w-4" />, 
      Pe: <Flag className="h-4 w-4" />, 
      T: <Timer className="h-4 w-4" />, 
      O: <Plus className="h-4 w-4" />, 
    }

    for (const [key, icon] of Object.entries(iconMap)) {
      if (actionCode === key) {
        return icon
      }
    }

    return <Zap className="h-4 w-4" /> 
  }

  const handleActionClick = (actionId: number) => {
    setSelectedActionId(actionId)

    // If we don't need description, we can log the event immediately
    if (!showDescription) {
      // Small delay to show the selection visually before closing
      setTimeout(() => {
        handleAddEvent()
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            {selectedPlayer && (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${selectedPlayer.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`}
              >
                {selectedPlayer.name.charAt(0)}
              </div>
            )}
            <span>{selectedPlayer ? `${selectedPlayer.name}'s Action` : "Record Action"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">Click on an action to record it</DialogDescription>
        </DialogHeader>

        <div>
          {/* Success/Failure Toggle */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1.5 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setEventSuccess(true)}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs transition-colors ${
                  eventSuccess
                    ? "bg-green-500 text-white"
                    : "bg-transparent text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                <span>Success</span>
              </button>
              <button
                type="button"
                onClick={() => setEventSuccess(false)}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs transition-colors ${
                  eventSuccess === false
                    ? "bg-red-500 text-white"
                    : "bg-transparent text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <XCircle className="h-3 w-3" />
                <span>Failure</span>
              </button>
            </div>
          </div>

        
          <div className="grid grid-cols-4 gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
            {actions.map((action) => (
              <button
                key={action.id}
                className={`${getActionColor(action.code)} rounded-md p-2 text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none ${
                  selectedActionId === action.id ? "ring-2 ring-white ring-opacity-70 scale-105 shadow-md" : ""
                }`}
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white/20 rounded-full p-1 mb-1">{getActionIcon(action.code)}</div>
                  <div className="text-center text-[10px] font-medium leading-tight">{action.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Optional Description Toggle */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="text-xs py-1 h-7"
            >
              {showDescription ? "Hide Description" : "Add Description"}
            </Button>
          </div>

          {/* Description Field (Optional) */}
          {showDescription && (
            <div className="mt-2 space-y-2">
              <Textarea
                placeholder="Add details about this event (optional)"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="min-h-[60px] text-xs"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddEvent} disabled={!selectedActionId} size="sm" className="text-xs py-1 h-7">
                  Add Event
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

