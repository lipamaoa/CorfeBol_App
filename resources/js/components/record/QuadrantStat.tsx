"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"

export function QuadrantStats({ gameContext }) {
  const { players, events, actions } = gameContext
  const [activeTab, setActiveTab] = useState("q1")
  const [quadrantStats, setQuadrantStats] = useState({
    q1: { goals: 0, shots: 0, efficiency: 0 },
    q2: { goals: 0, shots: 0, efficiency: 0 },
    q3: { goals: 0, shots: 0, efficiency: 0 },
    q4: { goals: 0, shots: 0, efficiency: 0 },
  })

  useEffect(() => {
    if (events && actions) {
      // Filtrar eventos por quadrante (baseado no positionIndex)
      const attackPlayers = players.filter((p) => p.position === "attack")

      // Mapear jogadores para quadrantes
      const quadrantPlayers = {
        q1: attackPlayers.filter((p) => p.positionIndex === 0).map((p) => p.id),
        q2: attackPlayers.filter((p) => p.positionIndex === 1).map((p) => p.id),
        q3: attackPlayers.filter((p) => p.positionIndex === 2).map((p) => p.id),
        q4: attackPlayers.filter((p) => p.positionIndex === 3).map((p) => p.id),
      }

      // Encontrar códigos de ação
      const shotActionIds = actions.filter((a) => ["LP", "LC", "LM", "LL", "L", "Pe"].includes(a.code)).map((a) => a.id)

      const goalActionId = actions.find((a) => a.code === "G")?.id

      // Calcular estatísticas por quadrante
      const stats = {}

      Object.keys(quadrantPlayers).forEach((quadrant) => {
        const playerIds = quadrantPlayers[quadrant]
        const quadrantEvents = events.filter((e) => playerIds.includes(e.player_id))

        const shots = quadrantEvents.filter((e) => shotActionIds.includes(e.action_id)).length
        const goals = quadrantEvents.filter((e) => e.action_id === goalActionId && e.success).length
        const efficiency = shots > 0 ? Math.round((goals / shots) * 100) : 0

        stats[quadrant] = { goals, shots, efficiency }
      })

      setQuadrantStats(stats)
    }
  }, [players, events, actions])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Quadrant Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="q1">Q1</TabsTrigger>
            <TabsTrigger value="q2">Q2</TabsTrigger>
            <TabsTrigger value="q3">Q3</TabsTrigger>
            <TabsTrigger value="q4">Q4</TabsTrigger>
          </TabsList>

          {Object.keys(quadrantStats).map((quadrant) => (
            <TabsContent key={quadrant} value={quadrant} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium">Goals</p>
                  <p className="text-2xl font-bold">{quadrantStats[quadrant].goals}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium">Shots</p>
                  <p className="text-2xl font-bold">{quadrantStats[quadrant].shots}</p>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm font-medium">Shooting Efficiency</p>
                <p className="text-2xl font-bold">{quadrantStats[quadrant].efficiency}%</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

