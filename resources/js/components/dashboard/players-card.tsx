"use client"

import { useState, useRef } from "react"
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
import { PlusCircle, Edit, Trash2, MoreHorizontal, Users } from "lucide-react"

interface Team {
    id: number
    name: string
}

interface Player {
    id: number
    name: string
    position: "attack" | "defense"
    gender: "male" | "female"
    team_id: number
    team_name: string
    photo?: string
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
        position: "attack",
        gender: "male",
        team_id: "",
        photo: null as File | null,
    })

    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null

        if (file) {
            setFormData(prev => ({ ...prev, photo: file }))

            const objectUrl = URL.createObjectURL(file)
            setPhotoPreview(objectUrl)
        }
    }

    const handleAddPlayer = () => {
        const data = new FormData()
        data.append('name', formData.name)
        data.append('position', formData.position)
        data.append('gender', formData.gender)
        data.append('team_id', formData.team_id)
        if (formData.photo) data.append('photo', formData.photo)

        router.post("/players", data, {
            onSuccess: () => {
                setIsAddPlayerOpen(false)
                resetForm()
            },
            preserveScroll: true,
        },
        )
    }

    const handleEditPlayer = () => {
        if (!selectedPlayer) return

        const data = new FormData()
        data.append('name', formData.name)
        data.append('position', formData.position)
        data.append('gender', formData.gender)
        data.append('team_id', formData.team_id)
        data.append('_method', 'PUT')
        if (formData.photo) data.append('photo', formData.photo)

        router.post(`/players/${selectedPlayer.id}`, data,
            {
                onSuccess: () => {
                    setIsEditPlayerOpen(false)
                    setSelectedPlayer(null)
                    setPhotoPreview(null)
                },
                preserveScroll: true,
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
            preserveScroll: true,
        })
    }

    const openEditDialog = (player: Player) => {
        setSelectedPlayer(player)
        setFormData({
            name: player.name,
            position: player.position,
            gender: player.gender,
            team_id: player.team_id.toString(),
            photo: null,
        })
        setPhotoPreview(player.photo || null)
        setIsEditPlayerOpen(true)
    }

    const openDeleteDialog = (player: Player) => {
        setSelectedPlayer(player)
        setIsDeletePlayerOpen(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            position: "attack",
            gender: "male",
            team_id: "",
            photo: null,
        })
        setPhotoPreview(null)
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
            <Card className="border shadow-sm h-[500px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50 border-b">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        Players
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsAddPlayerOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Player
                    </Button>
                </CardHeader>
                <CardContent className="p-4">
                    <ScrollArea className="h-[400px] pr-4">
                        {players.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">No players added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {players.map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {player.photo && (
                                                <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={`/storage/${player.photo}`}
                                                        alt={player.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${player.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                                                    }`}
                                            >
                                                {/* {player.number} */}
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
                        <div className="grid gap-2">
                            <Label htmlFor="player-team">Photo</Label>
                            <div className="flex flex-col gap-2">
                                <Input
                                    id="team-photo"
                                    type="file"
                                    accept="image/*"
                                    ref={fileRef}
                                    onChange={handleFileChange}
                                />
                                {photoPreview && (
                                    <div className="mt-2 max-w-xs">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="rounded-md max-h-32 object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddPlayerOpen(false)
                            setPhotoPreview(null)
                            resetForm()
                        }}>
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
                        <div className="grid gap-2">
                            <Label htmlFor="player-team">Photo</Label>
                            <div className="flex flex-col gap-2">
                                <Input
                                    id="team-photo"
                                    type="file"
                                    accept="image/*"
                                    ref={fileRef}
                                    onChange={handleFileChange}
                                />
                                {photoPreview && (
                                    <div className="mt-2 max-w-xs">
                                        {photoPreview.startsWith('blob:') ? (
                                            <img
                                                src={photoPreview}
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
                        <Button variant="outline" onClick={() => {
                            setIsAddPlayerOpen(false)
                            setPhotoPreview(null)
                            resetForm()
                        }}>
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

