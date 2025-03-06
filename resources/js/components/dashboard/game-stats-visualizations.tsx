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
import { BarChart3, PieChartIcon } from "lucide-react"

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

// Mock data for development
const mockStats = {
  total_teams: 3,
  total_players: 12,
  total_games: 8,
  goals_by_position: { attack: 24, defense: 12 },
  goals_by_gender: { male: 20, female: 16 },
  games_by_month: [
    { month: "Jan", count: 1 },
    { month: "Feb", count: 2 },
    { month: "Mar", count: 1 },
    { month: "Apr", count: 3 },
    { month: "May", count: 1 },
    { month: "Jun", count: 0 },
  ],
}

export default function GameStatsVisualizations({ stats: propStats }: GameStatsVisualizationsProps) {
  // Use mock data if no stats are provided
  const stats = propStats || mockStats
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

  // Colors for pie charts - using the app's color scheme
  const POSITION_COLORS = ["#4ade80", "#60a5fa"] // Green for attack, blue for defense
  const GENDER_COLORS = ["#60a5fa", "#f472b6"] // Blue for male, pink for female

  return (
    <Card className="border shadow-sm h-full overflow-hidden">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          Game Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-2">
            <TabsTrigger value="games" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>Games by Month</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" />
              <span>Goals Distribution</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="h-[350px] mt-2">
            <ChartContainer
              config={{
                games: {
                  label: "Games",
                  color: "hsl(215, 70%, 60%)", // Blue color for bars
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gamesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <YAxis tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar dataKey="count" name="Games" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="goals" className="h-[350px] mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-center font-medium mb-4 text-gray-700">Goals by Position</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={positionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      innerRadius={30} // Adding a donut hole
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      paddingAngle={2} // Small gap between segments
                    >
                      {positionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={POSITION_COLORS[index % POSITION_COLORS.length]}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} goals`, "Count"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-center font-medium mb-4 text-gray-700">Goals by Gender</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      innerRadius={30} // Adding a donut hole
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      paddingAngle={2} // Small gap between segments
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} goals`, "Count"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary stats at the bottom */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Games</p>
            <p className="text-2xl font-bold">{stats.total_games}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Goals</p>
            <p className="text-2xl font-bold">
              {(stats.goals_by_position?.attack || 0) + (stats.goals_by_position?.defense || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Avg Goals/Game</p>
            <p className="text-2xl font-bold">
              {stats.total_games > 0
                ? (
                    ((stats.goals_by_position?.attack || 0) + (stats.goals_by_position?.defense || 0)) /
                    stats.total_games
                  ).toFixed(1)
                : "0.0"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

