"use client"

import { useState } from "react"
import { router } from "@inertiajs/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"

interface Team {
  id: number
  name: string
  logo?: string
  created_at: string
  players_count: number
  games_count: number
}

interface TeamsManagementProps {
  teams: Team[]
}

export default function TeamsManagement({ teams }: TeamsManagementProps) {
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
  })

  const handleAddTeam = () => {
    router.post("/teams", formData, {
      onSuccess: () => {
        setIsAddTeamOpen(false)
        setFormData({ name: "", logo: "" })
      },
    })
  }

  const handleEditTeam = () => {
    if (!selectedTeam) return

    router.put(`/teams/${selectedTeam.id}`, formData, {
      onSuccess: () => {
        setIsEditTeamOpen(false)
        setSelectedTeam(null)
      },
    })
  }

  const handleDeleteTeam = () => {
    if (!selectedTeam) return

    router.delete(`/teams/${selectedTeam.id}`, {
      onSuccess: () => {
        setIsDeleteTeamOpen(false)
        setSelectedTeam(null)
      },
    })
  }

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team)
    setFormData({
      name: team.name,
      logo: team.logo || "",
    })
    setIsEditTeamOpen(true)
  }

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team)
    setIsDeleteTeamOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Games</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.players_count}</TableCell>
                  <TableCell>{team.games_count}</TableCell>
                  <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(team)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(team)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Add Team Dialog */}
      <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Enter the details for the new team.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team-logo">Logo URL (optional)</Label>
              <Input
                id="team-logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam}>Add Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update the team details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-logo">Logo URL (optional)</Label>
              <Input
                id="edit-team-logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTeamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={isDeleteTeamOpen} onOpenChange={setIsDeleteTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTeam?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTeamOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

