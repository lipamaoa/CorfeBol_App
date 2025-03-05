"use client"

import { useState } from "react"
import { router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react"

interface Team {
  id: number
  name: string
}

interface Player {
  id: number
  name: string
  number: number
  position: "attack" | "defense"
  gender: "male" | "female"
  team_id: number
  team_name: string
}

interface PlayersCardProps {
  players?: Player[]
  teams?: Team[]
}

export default function PlayersCard({ players = [], teams = [] }: PlayersCardProps) {
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false)
  const [isEditPlayerOpen, setIsEditPlayerOpen] = useState(false)
  const [isDeletePlayerOpen, setIsDeletePlayerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "attack",
    gender: "male",
    team_id: "",
  })

  const handleAddPlayer = () => {
    router.post(
      "/players",
      {
        ...formData,
        number: Number.parseInt(formData.number),
        team_id: Number.parseInt(formData.team_id),
      },
      {
        onSuccess: () => {
          setIsAddPlayerOpen(false)
          resetForm()
        },
      },
    )
  }

  const handleEditPlayer = () => {
    if (!selectedPlayer) return

    router.put(
      `/players/${selectedPlayer.id}`,
      {
        ...formData,
        number: Number.parseInt(formData.number),
        team_id: Number.parseInt(formData.team_id),
      },
      {
        onSuccess: () => {
          setIsEditPlayerOpen(false)
          setSelectedPlayer(null)
        },
      },
    )
  }

  const handleDeletePlayer = () => {
    if (!selectedPlayer) return

    router.delete(`/players/${selectedPlayer.id}`, {
      onSuccess: () => {
        setIsDeletePlayerOpen(false)
        setSelectedPlayer(null)
      },
    })
  }

  const openEditDialog = (player: Player) => {
    setSelectedPlayer(player)
    setFormData({
      name: player.name,
      number: player.number.toString(),
      position: player.position,
      gender: player.gender,
      team_id: player.team_id.toString(),
    })
    setIsEditPlayerOpen(true)
  }

  const openDeleteDialog = (player: Player) => {
    setSelectedPlayer(player)
    setIsDeletePlayerOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      number: "",
      position: "attack",
      gender: "male",
      team_id: "",
    })
  }

  const getPositionBadge = (position: string) => {
    return position === "attack" ? (
      <Badge variant="outline" className="bg-green-50">
        Attack
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50">
        Defense
      </Badge>
    )
  }

  const getGenderBadge = (gender: string) => {
    return gender === "male" ? (
      <Badge variant="outline" className="bg-blue-50">
        M
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-pink-50">
        F
      </Badge>
    )
  }

  return (
    <>
      <Card className="border-0 shadow-none h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Players</CardTitle>
          <Button size="sm" onClick={() => setIsAddPlayerOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[220px] pr-4">
            {players.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No players added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                        {player.number}
                      </div>
                      <div>
                        <h3 className="font-medium">{player.name}</h3>
                        <div className="flex gap-1 text-xs">
                          {getPositionBadge(player.position)}
                          {getGenderBadge(player.gender)}
                          <span className="text-muted-foreground">{player.team_name}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(player)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(player)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>Enter the details for the new player.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player-number">Jersey Number</Label>
              <Input
                id="player-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player-position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value as "attack" | "defense" })}
              >
                <SelectTrigger id="player-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attack">Attack</SelectItem>
                  <SelectItem value="defense">Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player-gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
              >
                <SelectTrigger id="player-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player-team">Team</Label>
              <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
                <SelectTrigger id="player-team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Player Dialog */}
      <Dialog open={isEditPlayerOpen} onOpenChange={setIsEditPlayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>Update the player details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-player-name">Player Name</Label>
              <Input
                id="edit-player-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-player-number">Jersey Number</Label>
              <Input
                id="edit-player-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-player-position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value as "attack" | "defense" })}
              >
                <SelectTrigger id="edit-player-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attack">Attack</SelectItem>
                  <SelectItem value="defense">Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-player-gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
              >
                <SelectTrigger id="edit-player-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-player-team">Team</Label>
              <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
                <SelectTrigger id="edit-player-team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlayerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlayer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Player Confirmation Dialog */}
      <Dialog open={isDeletePlayerOpen} onOpenChange={setIsDeletePlayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPlayer?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePlayerOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlayer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

