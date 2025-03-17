"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Player, Action } from "@/pages/games/record"

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedPlayer ? `Record Event for ${selectedPlayer.name}` : "Record Match Event"}</DialogTitle>
          <DialogDescription>
            Record a new action or event for the current game. Select the action type and whether it was successful.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="action">Action</Label>
            <Select
              value={selectedActionId?.toString() || ""}
              onValueChange={(value) => setSelectedActionId(value ? Number(value) : null)}
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action.id} value={action.id.toString()}>
                    {action.code} - {action.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add details about this event"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="success-toggle">Successful Action</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={eventSuccess ? "default" : "outline"}
                size="sm"
                onClick={() => setEventSuccess(true)}
                className={eventSuccess ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Success
              </Button>
              <Button
                type="button"
                variant={eventSuccess === false ? "default" : "outline"}
                size="sm"
                onClick={() => setEventSuccess(false)}
                className={eventSuccess === false ? "bg-red-500 hover:bg-red-600" : ""}
              >
                Failure
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddEvent}>Add Event</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

