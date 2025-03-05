import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersRound, Trophy } from "lucide-react"

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

export default function StatsCard({
  stats = {
    total_teams: 0,
    total_players: 0,
    total_games: 0,
    goals_by_position: { attack: 0, defense: 0 },
    goals_by_gender: { male: 0, female: 0 },
    games_by_month: [],
  },
}: StatsCardProps) {
  return (
    <Card className="border-0 shadow-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <UsersRound className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium">Teams</p>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.total_teams}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-green-100 p-2 dark:bg-green-900">
                <UsersRound className="h-4 w-4 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium">Players</p>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.total_players}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                <Trophy className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-medium">Games</p>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.total_games}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

