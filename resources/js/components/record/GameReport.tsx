import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface GameContext {
  game: { date?: string };
  players: { id: number; name: string }[];
  events: { player_id: number; action_id: number; success?: boolean; period?: number; time?: string }[];
  actions: { id: number; code: string }[];
  teamName: string;
  opponentName: string;
  score: number;
  opponentScore: number;
}

export function GameReport({ gameContext }: { gameContext: GameContext }) {
  const { game, players, events, actions, teamName, opponentName, score, opponentScore } = gameContext
  const [activeTab, setActiveTab] = useState("overview")
  const [playerStats, setPlayerStats] = useState<{ 
    id: number; 
    name: string; 
    shots: number; 
    goals: number; 
    shootingPercentage: number; 
    assists: number; 
    rebounds: number; 
    steals: number; 
    blocks: number; 
    turnovers: number; 
    efficiency: number; 
    totalActions: number; 
  }[]>([])


  const [teamStats, setTeamStats] = useState({
    totalShots: 0,
    madeShots: 0,
    shootingPercentage: 0,
    assists: 0,
    turnovers: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
  })
  const [periodStats, setPeriodStats] = useState<{ name: string; shots: number; goals: number; efficiency: number }[]>([])
  const [shotTypeStats, setShotTypeStats] = useState<{ name: string; attempts: number; makes: number; percentage: number }[]>([])

  useEffect(() => {
    if (players && events && actions) {
      calculateStats()
    }
  }, [players, events, actions])

  const calculateStats = () => {
    if (!players || !events || !actions) return

    // Encontrar IDs de ações relevantes
    const shotActionIds = actions.filter((a) => ["LP", "LC", "LM", "LL", "L", "Pe"].includes(a.code)).map((a) => a.id)
    const goalActionId = actions.find((a) => a.code === "G")?.id
    const assistActionId = actions.find((a) => a.code === "A")?.id
    const reboundActionId = actions.find((a) => a.code === "RG")?.id
    const stealActionId = actions.find((a) => a.code === "RB")?.id
    const blockActionId = actions.find((a) => a.code === "B")?.id
    const turnoverActionIds = actions.filter((a) => ["MP", "P", "D"].includes(a.code)).map((a) => a.id)

    // Calcular estatísticas por jogador
    const stats = players
      .map((player) => {
        const playerEvents = events.filter((e) => e.player_id === player.id)

        const shots = playerEvents.filter((e) => shotActionIds.includes(e.action_id)).length
        const goals = playerEvents.filter((e) => e.action_id === goalActionId && e.success).length
        const assists = playerEvents.filter((e) => e.action_id === assistActionId).length
        const rebounds = playerEvents.filter((e) => e.action_id === reboundActionId).length
        const steals = playerEvents.filter((e) => e.action_id === stealActionId).length
        const blocks = playerEvents.filter((e) => e.action_id === blockActionId).length
        const turnovers = playerEvents.filter((e) => turnoverActionIds.includes(e.action_id)).length

        return {
          id: player.id,
          name: player.name,
          shots,
          goals,
          shootingPercentage: shots > 0 ? Math.round((goals / shots) * 100) : 0,
          assists,
          rebounds,
          steals,
          blocks,
          turnovers,
          efficiency: goals + assists + rebounds + steals + blocks - turnovers,
          totalActions: playerEvents.length,
        }
      })
      .sort((a, b) => b.efficiency - a.efficiency)

    setPlayerStats(stats)

    // Calcular estatísticas da equipe
    const totalShots = events.filter((e) => shotActionIds.includes(e.action_id)).length
    const madeShots = events.filter((e) => e.action_id === goalActionId && e.success).length
    const assists = events.filter((e) => e.action_id === assistActionId).length
    const rebounds = events.filter((e) => e.action_id === reboundActionId).length
    const steals = events.filter((e) => e.action_id === stealActionId).length
    const blocks = events.filter((e) => e.action_id === blockActionId).length
    const turnovers = events.filter((e) => turnoverActionIds.includes(e.action_id)).length

    setTeamStats({
      totalShots,
      madeShots,
      shootingPercentage: totalShots > 0 ? Math.round((madeShots / totalShots) * 100) : 0,
      assists,
      rebounds,
      steals,
      blocks,
      turnovers,
    })

    // Estatísticas por período
    const periodData = []
    // Assumindo que temos eventos com informações de período
    const periods = [...new Set(events.filter((e) => e.period).map((e) => e.period))].sort()

    // Se não temos informações de período, criar períodos baseados no tempo
    if (periods.length === 0) {
      // Criar 4 períodos padrão
      for (let i = 1; i <= 4; i++) {
        const periodEvents = events.filter((e) => {
          // Dividir eventos em 4 partes iguais baseado no timestamp
          if (!e.time) return false
          const timeParts = e.time.split(":")
          if (timeParts.length !== 2) return false

          const totalSeconds = Number.parseInt(timeParts[0]) * 60 + Number.parseInt(timeParts[1])
          const periodLength = 10 * 60 // 10 minutos por período

          return Math.floor(totalSeconds / periodLength) + 1 === i
        })

        const periodShots = periodEvents.filter((e) => shotActionIds.includes(e.action_id)).length
        const periodGoals = periodEvents.filter((e) => e.action_id === goalActionId && e.success).length

        periodData.push({
          name: `Period ${i}`,
          shots: periodShots,
          goals: periodGoals,
          efficiency: periodShots > 0 ? Math.round((periodGoals / periodShots) * 100) : 0,
        })
      }
    } else {
      // Usar períodos dos eventos
      periods.forEach((period) => {
        const periodEvents = events.filter((e) => e.period === period)
        const periodShots = periodEvents.filter((e) => shotActionIds.includes(e.action_id)).length
        const periodGoals = periodEvents.filter((e) => e.action_id === goalActionId && e.success).length

        periodData.push({
          name: `Period ${period}`,
          shots: periodShots,
          goals: periodGoals,
          efficiency: periodShots > 0 ? Math.round((periodGoals / periodShots) * 100) : 0,
        })
      })
    }

    setPeriodStats(periodData)

    // Estatísticas por tipo de arremesso
    const shotTypes: ((prevState: never[]) => never[]) | { name: string; attempts: number; makes: number; percentage: number }[] = []

    // Mapeamento de códigos para tipos de arremesso
    const shotTypeMap = {
      LP: "Long Distance",
      LC: "Close Range",
      LM: "Mid Range",
      LL: "Layup",
      L: "Free Throw",
      Pe: "Penalty",
    }

    Object.entries(shotTypeMap).forEach(([code, label]) => {
      const actionId = actions.find((a) => a.code === code)?.id
      if (!actionId) return

      const shots = events.filter((e) => e.action_id === actionId).length
      const makes = events.filter((e) => e.action_id === actionId && e.success).length

      shotTypes.push({
        name: label,
        attempts: shots,
        makes: makes,
        percentage: shots > 0 ? Math.round((makes / shots) * 100) : 0,
      })
    })

    setShotTypeStats(shotTypes)
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader className="pb-2 print:pb-0">
        <CardTitle>Game Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Game Info */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">
              {teamName} vs {opponentName}
            </h2>
            <p className="text-gray-500">{game?.date ? new Date(game.date).toLocaleDateString() : "N/A"}</p>
            <div className="mt-2 flex justify-center items-center gap-4">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm">-</div>
              <div className="text-2xl font-bold">{opponentScore}</div>
            </div>
          </div>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="periods">Periods</TabsTrigger>
              <TabsTrigger value="shots">Shot Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                <div className="bg-blue-50 p-4 rounded-lg print:bg-white print:border">
                  <h3 className="font-semibold text-blue-700 print:text-black">Team Shooting</h3>
                  <p className="text-3xl font-bold">{teamStats.shootingPercentage}%</p>
                  <p className="text-sm text-gray-500">
                    {teamStats.madeShots} / {teamStats.totalShots} shots
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg print:bg-white print:border">
                  <h3 className="font-semibold text-green-700 print:text-black">Assist/Turnover Ratio</h3>
                  <p className="text-3xl font-bold">
                    {teamStats.turnovers > 0
                      ? (teamStats.assists / teamStats.turnovers).toFixed(1)
                      : teamStats.assists > 0
                        ? "∞"
                        : "0"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {teamStats.assists} assists, {teamStats.turnovers} turnovers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Goals</p>
                  <p className="text-xl font-bold">{teamStats.madeShots}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Assists</p>
                  <p className="text-xl font-bold">{teamStats.assists}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Rebounds</p>
                  <p className="text-xl font-bold">{teamStats.rebounds}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium">Steals</p>
                  <p className="text-xl font-bold">{teamStats.steals}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Top Performers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-2">Player</th>
                        <th className="p-2">Points</th>
                        <th className="p-2">Assists</th>
                        <th className="p-2">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.slice(0, 3).map((player) => (
                        <tr key={player.id} className="border-b">
                          <td className="p-2 font-medium">{player.name}</td>
                          <td className="p-2 text-center">{player.goals}</td>
                          <td className="p-2 text-center">{player.assists}</td>
                          <td className="p-2 text-center">{player.efficiency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Player</th>
                      <th className="p-2">Goals</th>
                      <th className="p-2">Shots</th>
                      <th className="p-2">%</th>
                      <th className="p-2">Assists</th>
                      <th className="p-2">Rebounds</th>
                      <th className="p-2">Steals</th>
                      <th className="p-2">Blocks</th>
                      <th className="p-2">Turnovers</th>
                      <th className="p-2">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.map((player) => (
                      <tr key={player.id} className="border-b">
                        <td className="p-2 font-medium">{player.name}</td>
                        <td className="p-2 text-center">{player.goals}</td>
                        <td className="p-2 text-center">{player.shots}</td>
                        <td className="p-2 text-center">{player.shootingPercentage}%</td>
                        <td className="p-2 text-center">{player.assists}</td>
                        <td className="p-2 text-center">{player.rebounds}</td>
                        <td className="p-2 text-center">{player.steals}</td>
                        <td className="p-2 text-center">{player.blocks}</td>
                        <td className="p-2 text-center">{player.turnovers}</td>
                        <td className="p-2 text-center">{player.efficiency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="periods" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="shots" name="Shots" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="goals" name="Goals" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="efficiency" name="Efficiency %" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Period</th>
                      <th className="p-2">Shots</th>
                      <th className="p-2">Goals</th>
                      <th className="p-2">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodStats.map((period, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{period.name}</td>
                        <td className="p-2 text-center">{period.shots}</td>
                        <td className="p-2 text-center">{period.goals}</td>
                        <td className="p-2 text-center">{period.efficiency}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="shots" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shotTypeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="attempts" name="Attempts" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="makes" name="Makes" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="percentage" name="Percentage %" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Shot Type</th>
                      <th className="p-2">Attempts</th>
                      <th className="p-2">Makes</th>
                      <th className="p-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shotTypeStats.map((type, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{type.name}</td>
                        <td className="p-2 text-center">{type.attempts}</td>
                        <td className="p-2 text-center">{type.makes}</td>
                        <td className="p-2 text-center">{type.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

