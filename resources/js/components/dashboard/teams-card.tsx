"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, MoreHorizontal, PlusCircle, Trash2, Users } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface Team {
    id: number
    name: string
    photo?: string
    created_at: string
    players_count: number
    games_count: number
}

export default function TeamsCard() {
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
    const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
    const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        photo: null as File | null,
    })

    const [teams, setTeams] = useState<Team[]>([])
    useEffect(() => {
        handleIndex()
    }, [])

    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null

        if (file) {
            setFormData((prev) => ({ ...prev, photo: file }))

            const objectUrl = URL.createObjectURL(file)
            setPhotoPreview(objectUrl)
        }
    }

    const handleIndex = async () => {
        try {
            const response = await fetch("api/teams", {
                method: "GET",
            })

            if (!response.ok) {
                throw new Error("Error Server: " + response.status)
            }

            const teamData = await response.json()
            setTeams(teamData)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            errors.name = "Team name is required"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleAddTeam = async () => {
        if (!validateForm()) return

        try {
            const data = new FormData()
            data.append("name", formData.name)

            if (formData.photo) data.append("photo", formData.photo)

            const response = await fetch("api/teams", {
                method: "POST",
                body: data,
            })

            if (!response.ok) {
                throw new Error("Error Server: " + response.status)
            }

            const teamData = await response.json()
            setTeams(teamData)

            setIsAddTeamOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const handleEditTeam = async () => {
        if (!selectedTeam || !validateForm()) return

        try {
            const data = new FormData()
            data.append("name", formData.name)
            data.append("_method", "PUT")

            if (formData.photo) data.append("photo", formData.photo)

            const response = await fetch(`/api/teams/${selectedTeam.id}`, {
                method: "POST",
                body: data,
            })

            if (!response.ok) {
                throw new Error("Error Server: " + response.status)
            }

            const updatedTeam = await response.json()

            setTeams((prevTeams) => prevTeams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))

            setIsEditTeamOpen(false)
            setSelectedTeam(null)
            setPhotoPreview(null)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const handleDeleteTeam = async () => {
        if (!selectedTeam) return

        try {
            const response = await fetch(`/api/teams/${selectedTeam.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Error Server: " + response.status)
            }

            setTeams((prevTeams) => prevTeams.filter((team) => team.id !== selectedTeam.id))

            setIsDeleteTeamOpen(false)
            setSelectedTeam(null)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    const openEditDialog = (team: Team) => {
        setSelectedTeam(team)
        setFormData({
            name: team.name,
            photo: null,
        })
        setPhotoPreview(team.photo || null)
        setFormErrors({})
        setIsEditTeamOpen(true)
    }

    const openDeleteDialog = (team: Team) => {
        setSelectedTeam(team)
        setIsDeleteTeamOpen(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            photo: null,
        })
        setPhotoPreview(null)
        setFormErrors({})
        if (fileRef.current) {
            fileRef.current.value = ""
        }
    }

    return (
        <>
            <Card className="border shadow-sm h-[500px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50 border-b">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        Teams
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsAddTeamOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Team
                    </Button>
                </CardHeader>
                <CardContent className="p-4">
                    <ScrollArea className="h-[400px] pr-4">
                        {teams.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-muted-foreground text-sm">No teams added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {teams.map((team) => (
                                    <div key={team.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                                    >

                                        <div className="flex items-center gap-3">
                                            {team.photo ? (
                                                <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={`/storage/${team.photo}`}
                                                        alt={team.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full font-semibold bg-gray-300 text-black-700">
                                                    {team.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-medium">{team.name}</h3>
                                                {/* <p className="text-muted-foreground text-xs">
                                                    {team.players_count} players • {team.games_count} games
                                                </p> */}
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

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
                                className={formErrors.name ? "border-red-500" : ""}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="team-photo">Team Photo (optional)</Label>
                            <div className="flex flex-col gap-2">
                                <Input id="team-photo" type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} />
                                {photoPreview && (
                                    <div className="mt-2 max-w-xs">
                                        <img
                                            src={photoPreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="rounded-md max-h-32 object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddTeamOpen(false)
                                resetForm()
                            }}
                        >
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
                                className={formErrors.name ? "border-red-500" : ""}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-team-photo">Team Photo (optional)</Label>
                            <div className="flex flex-col gap-2">
                                <Input id="edit-team-photo" type="file" accept="image/*" onChange={handleFileChange} />
                                {photoPreview && (
                                    <div className="mt-2 max-w-xs">
                                        {photoPreview.startsWith("blob:") ? (
                                            <img
                                                src={photoPreview || "/placeholder.svg"}
                                                alt="New preview"
                                                className="rounded-md max-h-32 object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={`/storage/${photoPreview}`}
                                                alt="Current photo"
                                                className="rounded-md max-h-32 object-cover"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditTeamOpen(false)
                                resetForm()
                            }}
                        >
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
