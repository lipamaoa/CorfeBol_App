"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Player } from "@/types"
import { calculatePlayerAttackStats, calculatePlayerDefenseStats } from "@/utils/stats-calculator"
import { useState, useEffect } from "react"

export function PlayerStats({ gameContext }) {
  const { players, events, actions, getAttackPlayers, getDefensePlayers } = gameContext
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [attackStats, setAttackStats] = useState(null)
  const [defenseStats, setDefenseStats] = useState(null)
  const [activeTab, setActiveTab] = useState("attack")

  useEffect(() => {
    if (selectedPlayer && events && actions) {
      // Calcular estatísticas de ataque
      const attack = calculatePlayerAttackStats(selectedPlayer.id, selectedPlayer.name, events, actions)
      setAttackStats(attack)

      // Calcular estatísticas de defesa
      const defense = calculatePlayerDefenseStats(selectedPlayer.id, selectedPlayer.name, events, actions)
      setDefenseStats(defense)
    }
  }, [selectedPlayer, events, actions])

  // Selecionar o primeiro jogador por padrão
  useEffect(() => {
    if (players && players.length > 0 && !selectedPlayer) {
      setSelectedPlayer(players[0])
    }
  }, [players, selectedPlayer])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Player Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Player</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedPlayer?.id || ""}
            onChange={(e) => {
              const playerId = Number(e.target.value)
              const player = players.find((p) => p.id === playerId)
              setSelectedPlayer(player)
            }}
          >
            {players.map((player: Player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.position})
              </option>
            ))}
          </select>
        </div>

        {selectedPlayer && (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="attack">Attack</TabsTrigger>
              <TabsTrigger value="defense">Defense</TabsTrigger>
            </TabsList>

            <TabsContent value="attack" className="space-y-4">
              {attackStats ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium">Goals</p>
                      <p className="text-2xl font-bold">{attackStats.goals}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium">Shots</p>
                      <p className="text-2xl font-bold">{attackStats.shots}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm font-medium">Shooting Efficiency</p>
                    <p className="text-2xl font-bold">{attackStats.shootingEfficiency}%</p>
                    <p className="text-xs text-gray-500">(Goals / Total Shots) × 100</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">Rebounds Won</p>
                      <p className="text-2xl font-bold">{attackStats.reboundsWon}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">Rebounds Lost</p>
                      <p className="text-2xl font-bold">{attackStats.reboundsLost}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm font-medium">Rebound Efficiency</p>
                    <p className="text-2xl font-bold">{attackStats.reboundEfficiency}%</p>
                    <p className="text-xs text-gray-500">(Rebounds Won / Total Rebounds) × 100</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-sm font-medium">Turnovers</p>
                    <p className="text-2xl font-bold">{attackStats.turnovers}</p>
                    <p className="text-xs text-gray-500">Bad Passes + Steps + Defended</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">No attack statistics available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="defense" className="space-y-4">
              {defenseStats ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm font-medium">Goals Allowed</p>
                      <p className="text-2xl font-bold">{defenseStats.goalsAllowed}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm font-medium">Shots Allowed</p>
                      <p className="text-2xl font-bold">{defenseStats.shotsAllowed}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm font-medium">Defensive Efficiency</p>
                    <p className="text-2xl font-bold">{defenseStats.defensiveEfficiency}%</p>
                    <p className="text-xs text-gray-500">100 - ((Goals Allowed / Shots Allowed) × 100)</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">No defense statistics available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

