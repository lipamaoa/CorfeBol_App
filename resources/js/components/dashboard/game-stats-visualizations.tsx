"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface GameStatsVisualizationsProps {
  stats?: {
    total_teams: number
    total_players: number
    total_games: number
    goals_by_position?: {
      attack: number
      defense: number
    }
    goals_by_gender?: {
      male: number
      female: number
    }
    games_by_month?: {
      month: string
      count: number
    }[]
  }
}

export default function GameStatsVisualizations({
  stats = {
    total_teams: 0,
    total_players: 0,
    total_games: 0,
    goals_by_position: { attack: 0, defense: 0 },
    goals_by_gender: { male: 0, female: 0 },
    games_by_month: [],
  },
}: GameStatsVisualizationsProps) {
  const [activeTab, setActiveTab] = useState("games")

  // Prepare data for position pie chart
  const positionData = [
    { name: "Attack", value: stats.goals_by_position?.attack || 0 },
    { name: "Defense", value: stats.goals_by_position?.defense || 0 },
  ]

  // Prepare data for gender pie chart
  const genderData = [
    { name: "Male", value: stats.goals_by_gender?.male || 0 },
    { name: "Female", value: stats.goals_by_gender?.female || 0 },
  ]

  // Ensure games_by_month is an array
  const gamesByMonth = stats.games_by_month || []

  // Colors for pie charts
  const POSITION_COLORS = ["#4ade80", "#60a5fa"]
  const GENDER_COLORS = ["#60a5fa", "#f472b6"]

  return (
    <Card className="border-0 shadow-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Game Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="games">Games by Month</TabsTrigger>
            <TabsTrigger value="goals">Goals Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="h-[400px]">
            <ChartContainer
              config={{
                games: {
                  label: "Games",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gamesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" name="Games" fill="var(--color-games)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="goals" className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div>
                <h3 className="text-center font-medium mb-4">Goals by Position</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={positionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {positionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={POSITION_COLORS[index % POSITION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} goals`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-center font-medium mb-4">Goals by Gender</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} goals`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

