"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Stat, Action } from "@/pages/games/record"

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEditEvent: Stat | null
  setCurrentEditEvent: (event: Stat | null) => void
  handleEditEvent: () => void
  actions: Action[]
}

export function EditEventDialog({
  open,
  onOpenChange,
  currentEditEvent,
  setCurrentEditEvent,
  handleEditEvent,
  actions,
}: EditEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the details of this event.</DialogDescription>
        </DialogHeader>
        {currentEditEvent && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-action">Action</Label>
              <Select
                value={currentEditEvent.action_id?.toString() || ""}
                onValueChange={(value) =>
                  setCurrentEditEvent({
                    ...currentEditEvent,
                    action_id: Number(value),
                  })
                }
              >
                <SelectTrigger id="edit-action">
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
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add details about this event"
                value={currentEditEvent.description || ""}
                onChange={(e) =>
                  setCurrentEditEvent({
                    ...currentEditEvent,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-success-toggle">Successful Action</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={currentEditEvent.success ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setCurrentEditEvent({
                      ...currentEditEvent,
                      success: true,
                    })
                  }
                  className={currentEditEvent.success ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  Success
                </Button>
                <Button
                  type="button"
                  variant={currentEditEvent.success === false ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setCurrentEditEvent({
                      ...currentEditEvent,
                      success: false,
                    })
                  }
                  className={currentEditEvent.success === false ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  Failure
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditEvent}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

