
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, Trash2} from "lucide-react"
import type { Player, Game, Stat, Action } from "@/types/index"
import { getEventIcon, getEventColor } from "@/utils/eventHelpers"


interface EventLogProps {
  gameContext: {
    game?: Game
    events: Stat[]
    players: Player[]
    actions: Action[]
    openEditDialog: (event: Stat) => void
    handleDeleteEvent: (eventId: number | string) => void
  }
  setEventDialogOpen: (open: boolean) => void
}

export function EventLog({ gameContext, setEventDialogOpen }: EventLogProps) {
  const { events, players, actions, openEditDialog, handleDeleteEvent } = gameContext

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button className="w-full" onClick={() => setEventDialogOpen(true)}>
            Record New Event
          </Button>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          {events.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No events recorded yet. Click on a player or "Record New Event" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const player = players.find((p) => p.id === event.player_id)
                const action = actions.find((a) => a.id === event.action_id)

                return (
                  <div key={event.id} className={`flex items-start gap-3 rounded-lg border p-3`}>
                    <div className={`rounded-full p-2 ${getEventColor(event.description, event.success)}`}>
                      {getEventIcon(event.description)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.time}</span>
                        {action && (
                          <Badge variant="outline">
                            {action.code} - {action.description}
                          </Badge>
                        )}
                        {player && (
                          <Badge variant="outline" className="bg-blue-50">
                            {player.name}
                          </Badge>
                        )}
                        {event.success !== null && (
                          <Badge variant={event.success ? "success" : "destructive"} className="ml-auto">
                            {event.success ? "Success" : "Failed"}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm">{event.description}</p>
                      <div className="mt-2 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(event)} className="h-7 px-2">
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id as number)}
                          className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

