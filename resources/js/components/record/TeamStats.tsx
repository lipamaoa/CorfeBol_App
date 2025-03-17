import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Player, Game, Stat, Action, Possession } from "@/pages/games/record"

interface TeamStatsProps {
  gameContext: {
    game: Game
    events: Stat[]
    players: Player[]
    actions: Action[]
    possessions: Possession[]
    opponentScore: number
  }
}

export function TeamStats({ gameContext }: TeamStatsProps) {
  const { events, players, actions, possessions, opponentScore } = gameContext

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="team">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="position">By Position</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            {/* Team statistics */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Offensive Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const attackPossessions = possessions.filter((p) => p.type === "attack")
                      const goalsScored = events.filter((e) => {
                        const action = actions.find((a) => a.id === e.action_id)
                        return action?.code === "G" && e.success
                      }).length

                      const efficiency =
                        attackPossessions.length > 0 ? Math.round((goalsScored / attackPossessions.length) * 100) : 0

                      return (
                        <div className="text-2xl font-bold">
                          {efficiency}%
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({goalsScored}/{attackPossessions.length} attacks)
                          </span>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Defensive Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const defensePossessions = possessions.filter((p) => p.type === "defense")
                      const goalsAllowed = opponentScore

                      const efficiency =
                        defensePossessions.length > 0
                          ? 100 - Math.round((goalsAllowed / defensePossessions.length) * 100)
                          : 0

                      return (
                        <div className="text-2xl font-bold">
                          {efficiency}%
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({defensePossessions.length - goalsAllowed}/{defensePossessions.length} defenses)
                          </span>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Action Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">Attacks</h4>
                      <p className="text-2xl font-bold">{possessions.filter((p) => p.type === "attack").length}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Shots</h4>
                      <p className="text-2xl font-bold">
                        {
                          events.filter((e) => {
                            const action = actions.find((a) => a.id === e.action_id)
                            return (
                              action?.code === "LC" ||
                              action?.code === "LM" ||
                              action?.code === "LL" ||
                              action?.code === "P" ||
                              action?.code === "G"
                            )
                          }).length
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Turnovers</h4>
                      <p className="text-2xl font-bold">
                        {
                          events.filter((e) => {
                            const action = actions.find((a) => a.id === e.action_id)
                            return action?.code === "MP" || action?.code === "Pa"
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="position">
            {/* Statistics by position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attack</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const attackPlayers = players.filter((p) => p.position === "attack")

                    const attackEvents = events.filter((e) => attackPlayers.some((p) => p.id === e.player_id))

                    const goals = attackEvents.filter((e) => {
                      const action = actions.find((a) => a.id === e.action_id)
                      return action?.code === "G" && e.success
                    }).length

                    const shots = attackEvents.filter((e) => {
                      const action = actions.find((a) => a.id === e.action_id)
                      return (
                        action?.code === "LC" ||
                        action?.code === "LM" ||
                        action?.code === "LL" ||
                        action?.code === "P" ||
                        action?.code === "G"
                      )
                    }).length

                    const efficiency = shots > 0 ? Math.round((goals / shots) * 100) : 0

                    const turnovers = attackEvents.filter((e) => {
                      const action = actions.find((a) => a.id === e.action_id)
                      return action?.code === "MP" || action?.code === "Pa"
                    }).length

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Goals</h4>
                            <p className="text-2xl font-bold">{goals}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Efficiency</h4>
                            <p className="text-2xl font-bold">{efficiency}%</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Shots</h4>
                            <p className="text-2xl font-bold">{shots}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Turnovers</h4>
                            <p className="text-2xl font-bold">{turnovers}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Defense</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const defensePlayers = players.filter((p) => p.position === "defense")

                    const defenseEvents = events.filter((e) => defensePlayers.some((p) => p.id === e.player_id))

                    const defensiveActions = defenseEvents.filter((e) => {
                      const action = actions.find((a) => a.id === e.action_id)
                      return action?.code === "D" || action?.code === "RG" || action?.code === "RP"
                    })

                    const successfulDefense = defensiveActions.filter((e) => e.success).length

                    const efficiency =
                      defensiveActions.length > 0 ? Math.round((successfulDefense / defensiveActions.length) * 100) : 0

                    const rebounds = defenseEvents.filter((e) => {
                      const action = actions.find((a) => a.id === e.action_id)
                      return action?.code === "RG" || action?.code === "RP"
                    }).length

                    const blocks = defenseEvents.filter((e) => {
                      const action = actions.find((a) => a.id === e.action_id)
                      return action?.code === "D" && e.success
                    }).length

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Efficiency</h4>
                            <p className="text-2xl font-bold">{efficiency}%</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
                            <p className="text-2xl font-bold">{defensiveActions.length}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Rebounds</h4>
                            <p className="text-2xl font-bold">{rebounds}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Blocks</h4>
                            <p className="text-2xl font-bold">{blocks}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

