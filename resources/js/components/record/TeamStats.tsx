"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateAllStats } from "@/utils/stats-calculator"
import { useEffect, useState } from "react"

export function TeamStats({ gameContext }) {
  const { players, events, actions } = gameContext
  const [activeTab, setActiveTab] = useState("team")
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (players && events && actions) {
      const calculatedStats = calculateAllStats(players, events, actions)
      setStats(calculatedStats)
    }
  }, [players, events, actions])

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">Loading statistics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Team Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="attack">Attack</TabsTrigger>
            <TabsTrigger value="defense">Defense</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700">Offensive Efficiency</h3>
                <p className="text-3xl font-bold">{stats.team.offensiveEfficiency}%</p>
                <p className="text-sm text-gray-500">Goals: {stats.team.totalGoals}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700">Defensive Efficiency</h3>
                <p className="text-3xl font-bold">{stats.team.defensiveEfficiency}%</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Team Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Total Shots</p>
                  <p className="text-xl font-bold">{stats.team.totalShots}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Total Goals</p>
                  <p className="text-xl font-bold">{stats.team.totalGoals}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Rebounds Won</p>
                  <p className="text-xl font-bold">{stats.team.totalReboundsWon}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Turnovers</p>
                  <p className="text-xl font-bold">{stats.team.totalTurnovers}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attack" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Player</th>
                    <th className="p-2">Goals</th>
                    <th className="p-2">Shots</th>
                    <th className="p-2">Efficiency</th>
                    <th className="p-2">Rebounds</th>
                    <th className="p-2">Turnovers</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.attack.map((player) => (
                    <tr key={player.playerId} className="border-b">
                      <td className="p-2 font-medium">{player.playerName}</td>
                      <td className="p-2 text-center">{player.goals}</td>
                      <td className="p-2 text-center">{player.shots}</td>
                      <td className="p-2 text-center">{player.shootingEfficiency}%</td>
                      <td className="p-2 text-center">{player.reboundsWon}</td>
                      <td className="p-2 text-center">{player.turnovers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="defense" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Player</th>
                    <th className="p-2">Goals Allowed</th>
                    <th className="p-2">Shots Allowed</th>
                    <th className="p-2">Defensive Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.defense.map((player) => (
                    <tr key={player.playerId} className="border-b">
                      <td className="p-2 font-medium">{player.playerName}</td>
                      <td className="p-2 text-center">{player.goalsAllowed}</td>
                      <td className="p-2 text-center">{player.shotsAllowed}</td>
                      <td className="p-2 text-center">{player.defensiveEfficiency}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

