
import { useState, useEffect } from "react"
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
    total_teams?: number
    total_players?: number
    total_games?: number
    goals_by_gender?: {
      male: number
      female: number
    }
    goals_by_type?: Array<{
      name: string
      value: number
      code: string
    }>
    goals_by_period?: Array<{
      name: string
      value: number
    }>
    games_by_month?: {
      month: string
      count: number
    }[]
  }
}

export default function GameStatsVisualizations({ stats: propStats }: GameStatsVisualizationsProps) {
  const [activeTab, setActiveTab] = useState("games")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statsData, setStatsData] = useState(propStats)


  useEffect(() => {
    const fetchStats = async () => {
      if (propStats) {
        setStatsData(propStats)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/dashboard/stats")

        if (!response.ok) {
          throw new Error(`Error fetching stats: ${response.status}`)
        }

        const data = await response.json()
        setStatsData(data)
      } catch (err) {
        console.error("Failed to fetch stats:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [propStats])

 
  const genderData = [
    { name: "Male", value: statsData?.goals_by_gender?.male || 0 },
    { name: "Female", value: statsData?.goals_by_gender?.female || 0 },
  ]

  
  const shotTypeData = statsData?.goals_by_type || []

 
  const periodData = statsData?.goals_by_period || []


  const gamesByMonth = statsData?.games_by_month || []


  const GENDER_COLORS = ["#0d9488", "#d97706"] 
  const TYPE_COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#d97706", "#f59e0b", "#fbbf24"] 

  
  const BAR_COLOR = "#0d9488" 

  if (loading) {
    return (
      <Card className="border shadow-sm h-full overflow-hidden">
        <CardHeader className="bg-gray-50 border-b pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            Loading Statistics...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-[400px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full bg-gray-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border shadow-sm h-full overflow-hidden">
        <CardHeader className="bg-gray-50 border-b pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            Error Loading Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-[400px]">
          <div className="text-center text-red-500">
            <p>Failed to load statistics data.</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }


  const totalGoals = genderData.reduce((sum, item) => sum + item.value, 0)

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
                  color: "hsl(171, 83%, 32%)", 
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
                  <Bar dataKey="count" name="Games" fill={BAR_COLOR} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="goals" className="h-[350px] mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
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
                      innerRadius={30} 
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      paddingAngle={2} 
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

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                {shotTypeData.length > 0 ? (
                  <>
                    <h3 className="text-center font-medium mb-4 text-gray-700">Goals by Shot Type</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={shotTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={30}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          paddingAngle={2}
                        >
                          {shotTypeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={TYPE_COLORS[index % TYPE_COLORS.length]}
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
                  </>
                ) : periodData.length > 0 ? (
                  <>
                    <h3 className="text-center font-medium mb-4 text-gray-700">Goals by Period</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={periodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                        <YAxis tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                        <Tooltip
                          formatter={(value) => [`${value} goals`, "Count"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          }}
                        />
                        <Bar dataKey="value" name="Goals" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">No shot type or period data available</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary stats at the bottom */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Games</p>
            <p className="text-2xl font-bold">{statsData?.total_games || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Goals</p>
            <p className="text-2xl font-bold">{totalGoals}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Avg Goals/Game</p>
            <p className="text-2xl font-bold">
              {statsData?.total_games && statsData.total_games > 0 && totalGoals > 0
                ? (totalGoals / statsData.total_games).toFixed(1)
                : "0.0"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

