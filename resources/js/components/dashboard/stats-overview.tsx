import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersRound, Trophy, CalendarDays } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    total_teams: number
    total_players: number
    total_games: number
    recent_games: Array<{
      id: number
      date: string
      home_team: string
      away_team: string
      home_score: number
      away_score: number
    }>
  }
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          <UsersRound className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_teams}</div>
          <p className="text-xs text-muted-foreground">Teams registered in the system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          <UsersRound className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_players}</div>
          <p className="text-xs text-muted-foreground">Players registered in the system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Games</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_games}</div>
          <p className="text-xs text-muted-foreground">Games recorded in the system</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
          <CardDescription>The most recent games recorded in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recent_games.length === 0 ? (
            <p className="text-sm text-muted-foreground">No games recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recent_games.map((game) => (
                <div key={game.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {game.home_team} vs {game.away_team}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(game.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {game.home_score} - {game.away_score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

