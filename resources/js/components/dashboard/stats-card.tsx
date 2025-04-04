
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Repeat, TrendingUp, Target, Users, ArrowRight, BarChart3, Hourglass } from "lucide-react"
import type { Player, Action,Stat, Event } from "@/types/index"



interface CoachStatsCardProps {
  gameId?: number
  stats?: Stat[]
  events?: Event[]
  players?: Player[]
  actions?: Action[]
}

export default function StatsCard({
  gameId,
  stats = [],
  events = [],
  players = [],
  actions = [],
}: CoachStatsCardProps) {
  const [activeTab, setActiveTab] = useState("phases")

  // Filter stats for the current game if gameId is provided
  const gameStats = gameId ? stats.filter((stat) => stat.game_id === gameId) : stats
  const gameEvents = gameId ? events.filter((event) => event.game_id === gameId) : events

  // Calculate phase statistics
  const phaseStats = calculatePhaseStats(gameEvents, gameStats)
  console.log("Phase Stats:", phaseStats)

  // Calculate player efficiency
  const playerEfficiency = calculatePlayerEfficiency(gameStats, players, actions)

  // Calculate possession metrics
  const possessionMetrics = calculatePossessionMetrics(gameStats, gameEvents, actions)

  // Calculate gender balance
  const genderBalance = calculateGenderBalance(gameStats, players, actions)

  return (
    <Card className="border-0 shadow-md h-full bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          Tactical Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="phases">Phase Efficiency</TabsTrigger>
            <TabsTrigger value="players">Player Impact</TabsTrigger>
            <TabsTrigger value="possession">Possession</TabsTrigger>
            <TabsTrigger value="balance">Gender Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="phases" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-xs font-medium text-blue-600">{phaseStats.attackCount} phases</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{phaseStats.attackEfficiency}%</h3>
                <p className="text-sm text-gray-500 mt-1">Attack Efficiency</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-blue-600">{phaseStats.attackGoals}</span> goals in{" "}
                    <span className="font-medium text-blue-600">{formatTime(phaseStats.attackDuration)}</span>
                  </div>
                  <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {phaseStats.goalsPerMinuteAttack.toFixed(2)} goals/min
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-red-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-xs font-medium text-red-600">{phaseStats.defenseCount} phases</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{phaseStats.defenseEfficiency}%</h3>
                <p className="text-sm text-gray-500 mt-1">Defense Efficiency</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-red-600">{phaseStats.defenseSteals}</span> steals in{" "}
                    <span className="font-medium text-red-600">{formatTime(phaseStats.defenseDuration)}</span>
                  </div>
                  <div className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full">
                    {phaseStats.stealsPerMinuteDefense.toFixed(2)} steals/min
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Hourglass className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-xs font-medium text-purple-600">{phaseStats.totalPhases} total phases</div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{formatTime(phaseStats.averagePhaseDuration)}</h3>
              <p className="text-sm text-gray-500 mt-1">Average Phase Duration</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Attack Avg</span>
                  <span className="text-sm font-medium">{formatTime(phaseStats.averageAttackDuration)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Defense Avg</span>
                  <span className="text-sm font-medium">{formatTime(phaseStats.averageDefenseDuration)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-xs font-medium text-green-600">Top Performers</div>
              </div>
              <div className="mt-2 space-y-3">
                {playerEfficiency.slice(0, 3).map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-xs text-gray-500">({player.gender === "male" ? "M" : "F"})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">Goals</span>
                        <span className="font-medium">{player.goals}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">Efficiency</span>
                        <span className="font-medium">{player.efficiency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-50 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Attack Contribution</h3>
                <div className="space-y-2">
                  {playerEfficiency
                    .filter((p) => p.attackContribution > 0)
                    .slice(0, 3)
                    .map((player, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{player.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{player.attackContribution}%</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${player.attackContribution}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Defense Contribution</h3>
                <div className="space-y-2">
                  {playerEfficiency
                    .filter((p) => p.defenseContribution > 0)
                    .slice(0, 3)
                    .map((player, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{player.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{player.defenseContribution}%</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${player.defenseContribution}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="possession" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-xs font-medium text-indigo-600">Possession Time</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${possessionMetrics.attackPossessionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{possessionMetrics.attackPossessionPercentage}%</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Attack</span>
                    <span className="text-sm font-medium">{formatTime(possessionMetrics.attackPossessionTime)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Defense</span>
                    <span className="text-sm font-medium">{formatTime(possessionMetrics.defensePossessionTime)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Repeat className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-xs font-medium text-orange-600">Possession Efficiency</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{possessionMetrics.possessionEfficiency}%</h3>
                <p className="text-sm text-gray-500 mt-1">Successful Possessions</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-orange-600">{possessionMetrics.successfulPossessions}</span> of{" "}
                    <span className="font-medium text-orange-600">{possessionMetrics.totalPossessions}</span>{" "}
                    possessions
                  </div>
                  <div className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">
                    {possessionMetrics.pointsPerPossession.toFixed(2)} pts/poss
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-teal-600" />
                </div>
                <div className="text-xs font-medium text-teal-600">Possession Flow</div>
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Turnovers</span>
                  <span className="text-sm font-medium">{possessionMetrics.turnovers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Steals</span>
                  <span className="text-sm font-medium">{possessionMetrics.steals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Position Switches</span>
                  <span className="text-sm font-medium">{possessionMetrics.positionSwitches}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg. Possessions per Goal</span>
                  <span className="text-sm font-medium">{possessionMetrics.possessionsPerGoal.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-xs font-medium text-blue-600">Male Contribution</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{genderBalance.maleContribution}%</h3>
                <p className="text-sm text-gray-500 mt-1">of Total Goals</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Goals</span>
                    <span className="text-sm font-medium">{genderBalance.maleGoals}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Efficiency</span>
                    <span className="text-sm font-medium">{genderBalance.maleEfficiency}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="text-xs font-medium text-pink-600">Female Contribution</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{genderBalance.femaleContribution}%</h3>
                <p className="text-sm text-gray-500 mt-1">of Total Goals</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Goals</span>
                    <span className="text-sm font-medium">{genderBalance.femaleGoals}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Efficiency</span>
                    <span className="text-sm font-medium">{genderBalance.femaleEfficiency}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-xs font-medium text-purple-600">Gender Balance</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-blue-100 rounded-l-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-l-full"
                    style={{ width: `${genderBalance.maleContribution}%` }}
                  ></div>
                </div>
                <div className="flex-1 h-2.5 bg-pink-100 rounded-r-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-r-full"
                    style={{ width: `${genderBalance.femaleContribution}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-xs text-blue-600">{genderBalance.maleContribution}% male</span>
                <span className="text-xs text-pink-600">{genderBalance.femaleContribution}% female</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attack Balance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600">{genderBalance.maleAttackContribution}%</span>
                    <span className="text-xs text-gray-400">:</span>
                    <span className="text-xs text-pink-600">{genderBalance.femaleAttackContribution}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Defense Balance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600">{genderBalance.maleDefenseContribution}%</span>
                    <span className="text-xs text-gray-400">:</span>
                    <span className="text-xs text-pink-600">{genderBalance.femaleDefenseContribution}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ideal Balance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">50%</span>
                    <span className="text-xs text-gray-400">:</span>
                    <span className="text-xs text-gray-600">50%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper functions

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function calculatePhaseStats(events: Event[], stats: Stat[]) {
  // Default values
  const defaultStats = {
    attackCount: 0,
    defenseCount: 0,
    totalPhases: 0,
    attackDuration: 0,
    defenseDuration: 0,
    averagePhaseDuration: 0,
    averageAttackDuration: 0,
    averageDefenseDuration: 0,
    attackGoals: 0,
    defenseSteals: 0,
    attackEfficiency: 0,
    defenseEfficiency: 0,
    goalsPerMinuteAttack: 0,
    stealsPerMinuteDefense: 0,
  }

  if (!events.length) return defaultStats

  // Count phases
  const attackEvents = events.filter((e) => e.name === "attack")
  const defenseEvents = events.filter((e) => e.name === "defense")

  // Calculate durations
  let totalAttackDuration = 0
  let totalDefenseDuration = 0

  attackEvents.forEach((event) => {
    if (event.start_time && event.end_time) {
      const start = new Date(event.start_time).getTime()
      const end = new Date(event.end_time).getTime()
      totalAttackDuration += (end - start) / 1000 
    }
  })

  defenseEvents.forEach((event) => {
    if (event.start_time && event.end_time) {
      const start = new Date(event.start_time).getTime()
      const end = new Date(event.end_time).getTime()
      totalDefenseDuration += (end - start) / 1000 
    }
  })

  // Count goals and steals
  const attackGoals = stats.filter(
    (s) =>
      s.action_id === 1 && 
      s.success === true &&
      attackEvents.some((e) => e.id === s.event_id),
  ).length

  const defenseSteals = stats.filter(
    (s) =>
      s.action_id === 15 && 
      s.success === true &&
      defenseEvents.some((e) => e.id === s.event_id),
  ).length

  // Calculate efficiencies
  const attackEfficiency = attackEvents.length > 0 ? Math.round((attackGoals / attackEvents.length) * 100) : 0

  const defenseEfficiency = defenseEvents.length > 0 ? Math.round((defenseSteals / defenseEvents.length) * 100) : 0

  // Calculate averages
  const avgAttackDuration = attackEvents.length > 0 ? totalAttackDuration / attackEvents.length : 0

  const avgDefenseDuration = defenseEvents.length > 0 ? totalDefenseDuration / defenseEvents.length : 0

  const totalPhases = attackEvents.length + defenseEvents.length
  const avgPhaseDuration = totalPhases > 0 ? (totalAttackDuration + totalDefenseDuration) / totalPhases : 0

  // Calculate rates
  const goalsPerMinute = totalAttackDuration > 0 ? (attackGoals / totalAttackDuration) * 60 : 0

  const stealsPerMinute = totalDefenseDuration > 0 ? (defenseSteals / totalDefenseDuration) * 60 : 0

  return {
    attackCount: attackEvents.length,
    defenseCount: defenseEvents.length,
    totalPhases,
    attackDuration: totalAttackDuration,
    defenseDuration: totalDefenseDuration,
    averagePhaseDuration: avgPhaseDuration,
    averageAttackDuration: avgAttackDuration,
    averageDefenseDuration: avgDefenseDuration,
    attackGoals,
    defenseSteals,
    attackEfficiency,
    defenseEfficiency,
    goalsPerMinuteAttack: goalsPerMinute,
    stealsPerMinuteDefense: stealsPerMinute,
  }
}

function calculatePlayerEfficiency(stats: Stat[], players: Player[], actions: Action[]) {
  if (!players.length || !stats.length) return []

  const playerStats = players.map((player) => {
    // Get all stats for this player
    const playerStats = stats.filter((s) => s.player_id === player.id)

    // Count goals (assuming action_id 1 is for goals)
    const goals = playerStats.filter((s) => s.action_id === 1 && s.success === true).length

    // Count shots (assuming action_ids for shots are 1)
    const shots = playerStats.filter((s) => s.action_id === 1).length

    // Calculate efficiency
    const efficiency = shots > 0 ? Math.round((goals / shots) * 100) : 0

    // Calculate attack contribution
    const attackActions = playerStats.filter((s) => {
      const eventId = s.event_id
      return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("attack"))
    }).length

    const totalAttackActions = stats.filter((s) => {
      const eventId = s.event_id
      return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("attack"))
    }).length

    const attackContribution = totalAttackActions > 0 ? Math.round((attackActions / totalAttackActions) * 100) : 0

    // Calculate defense contribution
    const defenseActions = playerStats.filter((s) => {
      const eventId = s.event_id
      return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("defense"))
    }).length

    const totalDefenseActions = stats.filter((s) => {
      const eventId = s.event_id
      return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("defense"))
    }).length

    const defenseContribution = totalDefenseActions > 0 ? Math.round((defenseActions / totalDefenseActions) * 100) : 0

    return {
      id: player.id,
      name: player.name,
      gender: player.gender,
      goals,
      shots,
      efficiency,
      attackContribution,
      defenseContribution,
    }
  })

  // Sort by efficiency
  return playerStats.sort((a, b) => b.efficiency - a.efficiency)
}

function calculatePossessionMetrics(stats: Stat[], events: Event[], actions: Action[]) {
  // Default values
  const defaultMetrics = {
    attackPossessionTime: 0,
    defensePossessionTime: 0,
    attackPossessionPercentage: 50,
    defensePossessionPercentage: 50,
    totalPossessions: 0,
    successfulPossessions: 0,
    possessionEfficiency: 0,
    turnovers: 0,
    steals: 0,
    positionSwitches: 0,
    pointsPerPossession: 0,
    possessionsPerGoal: 0,
  }

  if (!events.length) return defaultMetrics

  // Calculate possession time
  const attackEvents = events.filter((e) => e.name === "attack")
  const defenseEvents = events.filter((e) => e.name === "defense")

  let attackPossessionTime = 0
  let defensePossessionTime = 0

  attackEvents.forEach((event) => {
    if (event.start_time && event.end_time) {
      const start = new Date(event.start_time).getTime()
      const end = new Date(event.end_time).getTime()
      attackPossessionTime += (end - start) / 1000 
    }
  })

  defenseEvents.forEach((event) => {
    if (event.start_time && event.end_time) {
      const start = new Date(event.start_time).getTime()
      const end = new Date(event.end_time).getTime()
      defensePossessionTime += (end - start) / 1000 
    }
  })

  const totalPossessionTime = attackPossessionTime + defensePossessionTime

  const attackPossessionPercentage =
    totalPossessionTime > 0 ? Math.round((attackPossessionTime / totalPossessionTime) * 100) : 50

  const defensePossessionPercentage =
    totalPossessionTime > 0 ? Math.round((defensePossessionTime / totalPossessionTime) * 100) : 50

  // Count possessions
  const totalPossessions = attackEvents.length

  // Count successful possessions (with goals)
  const successfulPossessions = attackEvents.filter((event) =>
    stats.some(
      (s) =>
        s.event_id === event.id &&
        s.action_id === 1 && // Assuming action_id 1 is for goals
        s.success === true,
    ),
  ).length

  const possessionEfficiency = totalPossessions > 0 ? Math.round((successfulPossessions / totalPossessions) * 100) : 0

  // Count turnovers (assuming action_id for turnovers is 16)
  const turnovers = stats.filter((s) => s.action_id === 16).length

  // Count steals (assuming action_id for steals is 15)
  const steals = stats.filter((s) => s.action_id === 15 && s.success === true).length

  // Count position switches (assuming action_id for position switches is 16)
  const positionSwitches = stats.filter(
    (s) =>
      s.description?.toLowerCase().includes("position switch") ||
      s.description?.toLowerCase().includes("troca de posições"),
  ).length

  // Calculate points per possession
  const totalGoals = stats.filter((s) => s.action_id === 1 && s.success === true).length
  const pointsPerPossession = totalPossessions > 0 ? totalGoals / totalPossessions : 0

  // Calculate possessions per goal
  const possessionsPerGoal = totalGoals > 0 ? totalPossessions / totalGoals : 0

  return {
    attackPossessionTime,
    defensePossessionTime,
    attackPossessionPercentage,
    defensePossessionPercentage,
    totalPossessions,
    successfulPossessions,
    possessionEfficiency,
    turnovers,
    steals,
    positionSwitches,
    pointsPerPossession,
    possessionsPerGoal,
  }
}

function calculateGenderBalance(stats: Stat[], players: Player[], actions: Action[]) {
  // Default values
  const defaultBalance = {
    maleGoals: 0,
    femaleGoals: 0,
    maleContribution: 50,
    femaleContribution: 50,
    maleEfficiency: 0,
    femaleEfficiency: 0,
    maleAttackContribution: 50,
    femaleAttackContribution: 50,
    maleDefenseContribution: 50,
    femaleDefenseContribution: 50,
  }

  if (!players.length || !stats.length) return defaultBalance

  // Get male and female players
  const malePlayers = players.filter((p) => p.gender === "male").map((p) => p.id)
  const femalePlayers = players.filter((p) => p.gender === "female").map((p) => p.id)

  // Count goals by gender
  const maleGoals = stats.filter(
    (s) =>
      malePlayers.includes(s.player_id) &&
      s.action_id === 1 && // Assuming action_id 1 is for goals
      s.success === true,
  ).length

  const femaleGoals = stats.filter(
    (s) =>
      femalePlayers.includes(s.player_id) &&
      s.action_id === 1 && // Assuming action_id 1 is for goals
      s.success === true,
  ).length

  const totalGoals = maleGoals + femaleGoals

  // Calculate contribution percentages
  const maleContribution = totalGoals > 0 ? Math.round((maleGoals / totalGoals) * 100) : 50

  const femaleContribution = totalGoals > 0 ? Math.round((femaleGoals / totalGoals) * 100) : 50

  // Calculate efficiency
  const maleShots = stats.filter(
    (s) => malePlayers.includes(s.player_id) && s.action_id === 1, // Assuming action_id 1 is for shots/goals
  ).length

  const femaleShots = stats.filter(
    (s) => femalePlayers.includes(s.player_id) && s.action_id === 1, // Assuming action_id 1 is for shots/goals
  ).length

  const maleEfficiency = maleShots > 0 ? Math.round((maleGoals / maleShots) * 100) : 0

  const femaleEfficiency = femaleShots > 0 ? Math.round((femaleGoals / femaleShots) * 100) : 0

  // Calculate attack contribution by gender
  const maleAttackActions = stats.filter((s) => {
    if (!malePlayers.includes(s.player_id)) return false

    const eventId = s.event_id
    return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("attack"))
  }).length

  const femaleAttackActions = stats.filter((s) => {
    if (!femalePlayers.includes(s.player_id)) return false

    const eventId = s.event_id
    return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("attack"))
  }).length

  const totalAttackActions = maleAttackActions + femaleAttackActions

  const maleAttackContribution =
    totalAttackActions > 0 ? Math.round((maleAttackActions / totalAttackActions) * 100) : 50

  const femaleAttackContribution =
    totalAttackActions > 0 ? Math.round((femaleAttackActions / totalAttackActions) * 100) : 50

  // Calculate defense contribution by gender
  const maleDefenseActions = stats.filter((s) => {
    if (!malePlayers.includes(s.player_id)) return false

    const eventId = s.event_id
    return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("defense"))
  }).length

  const femaleDefenseActions = stats.filter((s) => {
    if (!femalePlayers.includes(s.player_id)) return false

    const eventId = s.event_id
    return stats.some((stat) => stat.event_id === eventId && stat.description?.toLowerCase().includes("defense"))
  }).length

  const totalDefenseActions = maleDefenseActions + femaleDefenseActions

  const maleDefenseContribution =
    totalDefenseActions > 0 ? Math.round((maleDefenseActions / totalDefenseActions) * 100) : 50

  const femaleDefenseContribution =
    totalDefenseActions > 0 ? Math.round((femaleDefenseActions / totalDefenseActions) * 100) : 50

  return {
    maleGoals,
    femaleGoals,
    maleContribution,
    femaleContribution,
    maleEfficiency,
    femaleEfficiency,
    maleAttackContribution,
    femaleAttackContribution,
    maleDefenseContribution,
    femaleDefenseContribution,
  }
}

