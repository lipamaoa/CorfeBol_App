"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { Player } from "@/types/index"
import { CheckCircle, ArrowRightLeft } from "lucide-react"

interface SubstitutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlayer: Player | null
  players: Player[]
  onComplete: (substitutionPlayer: Player) => void
}

export function SubstitutionDialog({
  open,
  onOpenChange,
  selectedPlayer,
  players,
  onComplete,
}: SubstitutionDialogProps) {
  const [selectedSubstitutionPlayer, setSelectedSubstitutionPlayer] = useState<Player | null>(null)
  const [activeTab, setActiveTab] = useState<"bench" | "attack" | "defense">("bench")

  // Split out bench vs attack vs defense
  const benchPlayers = players.filter((p) => p.position === "bench")
  const attackPlayers = players.filter((p) => p.position === "attack")
  const defensePlayers = players.filter((p) => p.position === "defense")

  const handlePlayerSelect = (player: Player) => {
    setSelectedSubstitutionPlayer(player)
  }

  const handleComplete = () => {
    if (selectedSubstitutionPlayer) {
      onComplete(selectedSubstitutionPlayer)
      // Reset local state
      setSelectedSubstitutionPlayer(null)
      setActiveTab("bench")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedPlayer
              ? `Substitute ${selectedPlayer.name}`
              : "Select a player to substitute"}
          </DialogTitle>
          <DialogDescription>
            {selectedPlayer
              ? `Select a player to substitute in for ${selectedPlayer.name}`
              : "No player selected"}
          </DialogDescription>
        </DialogHeader>

        {selectedPlayer && (
          <div className="mb-4 bg-blue-50 p-2 rounded-md">
            <div className="text-sm font-semibold text-blue-600">
              {selectedPlayer.name} ({selectedPlayer.position})
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bench">Bench</TabsTrigger>
            <TabsTrigger value="attack">Attack</TabsTrigger>
            <TabsTrigger value="defense">Defense</TabsTrigger>
          </TabsList>

          <TabsContent value="bench" className="mt-2">
            {benchPlayers.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No bench players available</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {benchPlayers.map((p) => (
                <Button
                  key={p.id}
                  variant={
                    selectedSubstitutionPlayer?.id === p.id ? "default" : "outline"
                  }
                  className={`justify-start`}
                  onClick={() => handlePlayerSelect(p)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm">{p.name}</span>
                    <small className="text-gray-400 ml-auto">{p.position}</small>
                    {selectedSubstitutionPlayer?.id === p.id && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attack" className="mt-2">
            {attackPlayers.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No attack players</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {attackPlayers.map((p) => (
                <Button
                  key={p.id}
                  variant={
                    selectedSubstitutionPlayer?.id === p.id ? "default" : "outline"
                  }
                  className={`justify-start`}
                  onClick={() => handlePlayerSelect(p)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm">{p.name}</span>
                    <small className="text-gray-400 ml-auto">{p.position}</small>
                    {selectedSubstitutionPlayer?.id === p.id && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="defense" className="mt-2">
            {defensePlayers.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No defense players</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {defensePlayers.map((p) => (
                <Button
                  key={p.id}
                  variant={
                    selectedSubstitutionPlayer?.id === p.id ? "default" : "outline"
                  }
                  className={`justify-start`}
                  onClick={() => handlePlayerSelect(p)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm">{p.name}</span>
                    <small className="text-gray-400 ml-auto">{p.position}</small>
                    {selectedSubstitutionPlayer?.id === p.id && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* A little summary row if both players are selected */}
        {selectedPlayer && selectedSubstitutionPlayer && (
          <div className="my-2 flex items-center gap-2 rounded-md border p-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="font-semibold text-blue-600">
                {selectedPlayer.name}
              </div>
              <span className="text-gray-500">{selectedPlayer.position}</span>
            </div>
            <ArrowRightLeft className="h-4 w-4 text-gray-600" />
            <div className="flex items-center gap-1">
              <div className="font-semibold text-yellow-600">
                {selectedSubstitutionPlayer.name}
              </div>
              <span className="text-gray-500">{selectedSubstitutionPlayer.position}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!selectedSubstitutionPlayer}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Complete Substitution
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
