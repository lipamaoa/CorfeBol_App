import type { Stat, Player, Action } from "@/types/index"

// Interfaces para as estatísticas
export interface PlayerAttackStats {
  playerId: number
  playerName: string
  goals: number
  shots: number
  shootingEfficiency: number
  reboundsWon: number
  reboundsLost: number
  reboundEfficiency: number
  turnovers: number
}

export interface PlayerDefenseStats {
  playerId: number
  playerName: string
  goalsAllowed: number
  shotsAllowed: number
  defensiveEfficiency: number
}

export interface TeamStats {
  offensiveEfficiency: number
  defensiveEfficiency: number
  totalGoals: number
  totalShots: number
  totalReboundsWon: number
  totalReboundsLost: number
  totalTurnovers: number
}

export interface PositionStats {
  attack: PlayerAttackStats[]
  defense: PlayerDefenseStats[]
  team: TeamStats
}

/**
 * Calcula estatísticas de ataque para um jogador
 */
export function calculatePlayerAttackStats(
  playerId: number,
  playerName: string,
  stats: Stat[],
  actions: Action[],
): PlayerAttackStats {
  // Filtrar estatísticas do jogador
  const playerStats = stats.filter((s) => s.player_id === playerId)

  // Encontrar códigos de ação
  const shotActionIds = actions.filter((a) => ["LP", "LC", "LM", "LL", "L", "Pe"].includes(a.code)).map((a) => a.id)

  const goalActionId = actions.find((a) => a.code === "G")?.id
  const reboundWonActionId = actions.find((a) => a.code === "RG")?.id
  const reboundLostActionId = actions.find((a) => a.code === "RP")?.id

  // Turnover actions (Mau Passe, Passos, Defendido)
  const turnoverActionIds = actions.filter((a) => ["MP", "P", "D"].includes(a.code)).map((a) => a.id)

  // Calcular estatísticas
  const shots = playerStats.filter((s) => shotActionIds.includes(s.action_id)).length
  const goals = playerStats.filter((s) => s.action_id === goalActionId && s.success).length
  const reboundsWon = playerStats.filter((s) => s.action_id === reboundWonActionId).length
  const reboundsLost = playerStats.filter((s) => s.action_id === reboundLostActionId).length
  const turnovers = playerStats.filter((s) => turnoverActionIds.includes(s.action_id)).length

  // Calcular eficiências
  const shootingEfficiency = shots > 0 ? Math.round((goals / shots) * 100) : 0
  const reboundEfficiency =
    reboundsWon + reboundsLost > 0 ? Math.round((reboundsWon / (reboundsWon + reboundsLost)) * 100) : 0

  return {
    playerId,
    playerName,
    goals,
    shots,
    shootingEfficiency,
    reboundsWon,
    reboundsLost,
    reboundEfficiency,
    turnovers,
  }
}

/**
 * Calcula estatísticas de defesa para um jogador
 */
export function calculatePlayerDefenseStats(
  playerId: number,
  playerName: string,
  stats: Stat[],
  actions: Action[],
): PlayerDefenseStats {
  // Filtrar estatísticas do jogador
  const playerStats = stats.filter((s) => s.player_id === playerId)

  // Encontrar códigos de ação
  const shotAllowedActionIds = actions
    .filter((a) => ["LP", "LC", "LM", "LL", "L", "Pe"].includes(a.code))
    .map((a) => a.id)

  const goalAllowedActionId = actions.find((a) => a.code === "GS")?.id

  // Calcular estatísticas
  const shotsAllowed = playerStats.filter((s) => shotAllowedActionIds.includes(s.action_id)).length
  const goalsAllowed = playerStats.filter((s) => s.action_id === goalAllowedActionId).length

  // Calcular eficiência defensiva
  const defensiveEfficiency = shotsAllowed > 0 ? Math.round(100 - (goalsAllowed / shotsAllowed) * 100) : 100

  return {
    playerId,
    playerName,
    goalsAllowed,
    shotsAllowed,
    defensiveEfficiency,
  }
}

/**
 * Calcula estatísticas de equipe
 */
export function calculateTeamStats(stats: Stat[], actions: Action[]): TeamStats {
  // Encontrar códigos de ação
  const attackEventIds = stats
    .filter((s) => {
      const event = s.event_type === "phase_start" && s.description?.includes("attack")
      return event
    })
    .map((s) => s.event_id)

  const defenseEventIds = stats
    .filter((s) => {
      const event = s.event_type === "phase_start" && s.description?.includes("defense")
      return event
    })
    .map((s) => s.event_id)

  // Estatísticas de ataque
  const attackStats = stats.filter((s) => attackEventIds.includes(s.event_id))
  const goalActionId = actions.find((a) => a.code === "G")?.id
  const totalAttacks = attackEventIds.length
  const totalGoals = attackStats.filter((s) => s.action_id === goalActionId && s.success).length

  // Estatísticas de defesa
  const defenseStats = stats.filter((s) => defenseEventIds.includes(s.event_id))
  const goalAllowedActionId = actions.find((a) => a.code === "GS")?.id
  const totalDefenses = defenseEventIds.length
  const totalGoalsAllowed = defenseStats.filter((s) => s.action_id === goalAllowedActionId).length

  // Calcular eficiências
  const offensiveEfficiency = totalAttacks > 0 ? Math.round((totalGoals / totalAttacks) * 100) : 0

  const defensiveEfficiency = totalDefenses > 0 ? Math.round(100 - (totalGoalsAllowed / totalDefenses) * 100) : 100

  // Outras estatísticas de equipe
  const shotActionIds = actions.filter((a) => ["LP", "LC", "LM", "LL", "L", "Pe"].includes(a.code)).map((a) => a.id)

  const reboundWonActionId = actions.find((a) => a.code === "RG")?.id
  const reboundLostActionId = actions.find((a) => a.code === "RP")?.id

  const turnoverActionIds = actions.filter((a) => ["MP", "P", "D"].includes(a.code)).map((a) => a.id)

  const totalShots = stats.filter((s) => shotActionIds.includes(s.action_id)).length
  const totalReboundsWon = stats.filter((s) => s.action_id === reboundWonActionId).length
  const totalReboundsLost = stats.filter((s) => s.action_id === reboundLostActionId).length
  const totalTurnovers = stats.filter((s) => turnoverActionIds.includes(s.action_id)).length

  return {
    offensiveEfficiency,
    defensiveEfficiency,
    totalGoals,
    totalShots,
    totalReboundsWon,
    totalReboundsLost,
    totalTurnovers,
  }
}

/**
 * Calcula todas as estatísticas para jogadores e equipe
 */
export function calculateAllStats(players: Player[], stats: Stat[], actions: Action[]): PositionStats {
  console.log("calculateAllStats input:", {
    playersCount: players.length,
    statsCount: stats.length,
    actionsCount: actions.length,
  })

  // Verificar se temos dados válidos
  if (!players || !stats || !actions || players.length === 0 || actions.length === 0) {
    console.warn("Missing data for stats calculation")
    // Retornar estatísticas vazias em vez de falhar
    return {
      attack: [],
      defense: [],
      team: {
        offensiveEfficiency: 0,
        defensiveEfficiency: 100,
        totalGoals: 0,
        totalShots: 0,
        totalReboundsWon: 0,
        totalReboundsLost: 0,
        totalTurnovers: 0,
      },
    }
  }

  try {
    // Filtrar jogadores por posição
    const attackPlayers = players.filter((p) => p.position === "attack")
    const defensePlayers = players.filter((p) => p.position === "defense")

    console.log("Players by position:", {
      attackPlayers: attackPlayers.length,
      defensePlayers: defensePlayers.length,
    })

    // Calcular estatísticas para cada jogador
    const attackStats = attackPlayers.map((player) =>
      calculatePlayerAttackStats(player.id, player.name, stats, actions),
    )

    const defenseStats = defensePlayers.map((player) =>
      calculatePlayerDefenseStats(player.id, player.name, stats, actions),
    )

    // Calcular estatísticas da equipe
    const teamStats = calculateTeamStats(stats, actions)

    return {
      attack: attackStats,
      defense: defenseStats,
      team: teamStats,
    }
  } catch (error) {
    console.error("Error in calculateAllStats:", error)
    // Retornar estatísticas vazias em caso de erro
    return {
      attack: [],
      defense: [],
      team: {
        offensiveEfficiency: 0,
        defensiveEfficiency: 100,
        totalGoals: 0,
        totalShots: 0,
        totalReboundsWon: 0,
        totalReboundsLost: 0,
        totalTurnovers: 0,
      },
    }
  }
}

