import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersRound, Trophy, Users, Target, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

interface StatsCardProps {
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

export default function StatsCard({ stats: propStats }: StatsCardProps) {
  // Use mock data if no stats are provided
  const stats = propStats || mockStats

  // Calculate total goals
  const totalGoals = (stats.goals_by_position?.attack || 0) + (stats.goals_by_position?.defense || 0)

  // Calculate average goals per game
  const avgGoalsPerGame = stats.total_games > 0 ? (totalGoals / stats.total_games).toFixed(1) : "0.0"

  return (
    <Card className="border-0 shadow-md h-full bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Teams stat */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UsersRound className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex items-center text-xs font-medium text-indigo-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+2 this month</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total_teams}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Teams</p>
            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, stats.total_teams * 10)}%` }}
              ></div>
            </div>
          </div>

          {/* Players stat */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex items-center text-xs font-medium text-emerald-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+5 this month</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total_players}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Players</p>
            <div className="flex gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${((stats.goals_by_gender?.male || 0) / stats.total_players) * 100}%` }}
                ></div>
              </div>
              <div className="flex-1 h-1.5 bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${((stats.goals_by_gender?.female || 0) / stats.total_players) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-blue-600">{stats.goals_by_gender?.male || 0} male</span>
              <span className="text-xs text-pink-600">{stats.goals_by_gender?.female || 0} female</span>
            </div>
          </div>

          {/* Games stat */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex items-center text-xs font-medium text-amber-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+3 this month</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total_games}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Games</p>
            <div className="flex items-center mt-3">
              <div className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                {avgGoalsPerGame} goals/game
              </div>
              <div className="ml-auto text-xs text-gray-500">Last game: Apr 15</div>
            </div>
          </div>

          {/* Goals stat */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center text-xs font-medium text-purple-600">
                <ArrowDown className="h-3 w-3 mr-1" />
                <span>-2 vs last month</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalGoals}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Goals</p>
            <div className="flex gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${((stats.goals_by_position?.attack || 0) / totalGoals) * 100}%` }}
                ></div>
              </div>
              <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${((stats.goals_by_position?.defense || 0) / totalGoals) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-green-600">{stats.goals_by_position?.attack || 0} attack</span>
              <span className="text-xs text-blue-600">{stats.goals_by_position?.defense || 0} defense</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

