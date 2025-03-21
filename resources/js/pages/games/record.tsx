"use client"

import { useState, useEffect } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import Navbar from "@/components/navbar"
import { GameHeader } from "@/components/record/GameHeader"
import { GameField } from "@/components/record/GameField"
import { EventLog } from "@/components/record/EventLog"
import { TeamStats } from "@/components/record/TeamStats"
import { PlayerStats } from "@/components/record/PlayerStats"
import { EventDialog } from "@/components/record/EventDialog"
import { EditEventDialog } from "@/components/record/EditEventDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Importe o serviço no topo do arquivo
import { updatePlayerPosition as updatePlayerPositionAPI, getGamePlayers } from "@/api/player-api"

// Define interfaces for our data types
interface Player {
  id: number
  name: string
  gender: "male" | "female"
  position: "attack" | "defense"| "bench" 
  team_id: number
  positionIndex?: number // Make positionIndex optional
  zone?: "attack" | "defense" | "bench" // Add zone as an optional property
}

interface Action {
  id: number
  code: string
  description: string
}

interface Team {
  id: number
  name: string
  logo_url: string | null
}

interface Game {
  id: number
  team_a_id: number
  team_b_id: number
  teamA: Team
  teamB: Team
  score_team_a?: number | null
  score_team_b?: number | null
}

interface Stat {
  id: number | string
  game_id: number
  player_id: number | null
  action_id: number
  success: boolean | null
  event_type: string
  possession_id?: number
  possession_type?: string
  description?: string
  time: string
  created_at?: string
  player?: Player
  action?: Action
}

interface Possession {
  type: "attack" | "defense"
  id: number
  startTime: number
  events: Stat[]
}

// Export interfaces for use in other components
export type { Player, Action, Team, Game, Stat, Possession }

const RecordGame = ({
  game,
  players: initialPlayers,
  stats: initialStats,
  actions,
}: {
  game: Game;
  players: Player[];
  stats: Stat[];
  actions: Action[];
}) => {
  const [matchTime, setMatchTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [period, setPeriod] = useState(1)
  const [events, setEvents] = useState<Stat[]>(initialStats || [])
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [teamName, setTeamName] = useState(game.teamA || "Our Team")
  const [teamALogo, setTeamALogo] = useState(game.teamA?.logo_url || null)
  const [teamBLogo, setTeamBLogo] = useState(game.teamB?.logo_url || null)
  const [opponentName, setOpponentName] = useState(game.teamB || "Opponent")
  const [players, setPlayers] = useState<Player[]>(initialPlayers?.filter((p) => p.team_id === game?.team_a_id) || [])

 

  // State for tracking possessions
  const [currentPossession, setCurrentPossession] = useState<Possession>({
    type: "attack", // 'attack' or 'defense'
    id: 1,
    startTime: 0,
    events: [],
  })
  const [possessions, setPossessions] = useState<Possession[]>([])
  const [possessionCount, setPossessionCount] = useState(1)

  // State for event recording
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null)
  const [eventSuccess, setEventSuccess] = useState<boolean>(true)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [activeTab, setActiveTab] = useState("field")
  const [eventDescription, setEventDescription] = useState("")

  // Add these to the existing state declarations
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false)
  const [currentEditEvent, setCurrentEditEvent] = useState<Stat | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Timer functionality
  useEffect(() => {
    // Recuperar o tempo salvo no localStorage, se existir
    const savedTime = localStorage.getItem(`game_${game.id}_time`)
    if (savedTime && matchTime === 0) {
      setMatchTime(Number.parseInt(savedTime, 10))
    }

    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setMatchTime((prevTime) => {
          const newTime = prevTime + 1
          // Salvar o tempo atual no localStorage
          localStorage.setItem(`game_${game.id}_time`, newTime.toString())
          return newTime
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, game.id, matchTime])

  // Persistir o período no localStorage
  useEffect(() => {
    const savedPeriod = localStorage.getItem(`game_${game.id}_period`)
    if (savedPeriod && period === 1) {
      setPeriod(Number.parseInt(savedPeriod, 10))
    }
  }, [game.id, period])

  // Adicione este useEffect após as declarações de estado
  useEffect(() => {
    // Inicializa os scores com base no jogo
    if (game) {
      if (game.score_team_a !== undefined && game.score_team_a !== null) {
        setScore(game.score_team_a)
      }

      if (game.score_team_b !== undefined && game.score_team_b !== null) {
        setOpponentScore(game.score_team_b)
      }
    }
  }, [game])

  // Adicione este useEffect após as declarações de estado
  useEffect(() => {
    // Inicializa o score com base nos eventos existentes
    if (initialStats && initialStats.length > 0) {
      const goalEvents = initialStats.filter((e) => {
        const action = actions.find((a) => a.id === e.action_id)
        return action?.code === "G" && e.success
      })

      setScore(goalEvents.length)
    }
  }, [initialStats, actions])

  // Persistir o score no localStorage
  useEffect(() => {
    const savedScore = localStorage.getItem(`game_${game.id}_score`)
    if (savedScore && score === 0) {
      setScore(Number.parseInt(savedScore, 10))
    }

    const savedOpponentScore = localStorage.getItem(`game_${game.id}_opponent_score`)
    if (savedOpponentScore && opponentScore === 0) {
      setOpponentScore(Number.parseInt(savedOpponentScore, 10))
    }
  }, [game.id, score, opponentScore])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setMatchTime(0)
    setIsRunning(false)
  }

  // Modificar a função changePeriod para salvar no localStorage
  const changePeriod = () => {
    const newPeriod = period + 1
    setPeriod(newPeriod)
    localStorage.setItem(`game_${game.id}_period`, newPeriod.toString())

    // Record period change as an event
    const newEvent: Stat = {
      game_id: game.id,
      player_id: null,
      action_id: actions.find((a) => a.code === "O")?.id || 0,
      success: null,
      event_type: "period_change",
      description: `Period ${newPeriod} started`,
      time: formatTime(matchTime),
    }

    recordEvent(newEvent)
  }

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player)
    setEventDialogOpen(true)
  }

  // Start a new possession
  const startNewPossession = (type: "attack" | "defense") => {
    // Finalize the current possession
    if (currentPossession.events.length > 0) {
      setPossessions((prev) => [...prev, currentPossession])
    }

    // Start new possession
    const newPossessionId = possessionCount + 1
    setPossessionCount(newPossessionId)

    setCurrentPossession({
      type,
      id: newPossessionId,
      startTime: matchTime,
      events: [],
    })

    // Get a valid player ID - use the first player of the appropriate position
    const positionPlayers = type === "attack" ? getAttackPlayers() : getDefensePlayers()

    const playerId = positionPlayers.length > 0 ? positionPlayers[0].id : players.length > 0 ? players[0].id : 1

    // Record possession change event
    const eventData: Stat = {
      game_id: game.id,
      player_id: playerId, 
      action_id: actions.find((a) => a.code === "O")?.id || 0,
      success: true,
      event_type: type === "attack" ? "start_attack" : "start_defense",
      possession_id: newPossessionId,
      possession_type: type,
      description: `Start of ${type === "attack" ? "attack" : "defense"}`,
      time: formatTime(matchTime),
    }

    recordEvent(eventData)
  }



  // Update player position
  const updatePlayerPosition = (playerId: number, zone: "attack" | "defense" | "bench", positionIndex?: number) => {
    console.log(`Updating player ${playerId} to zone ${zone} with position index ${positionIndex}`)

    // Primeiro, atualize o estado local para feedback imediato
    setPlayers((prevPlayers) => {
      // Cria uma cópia do array de jogadores
      const updatedPlayers = [...prevPlayers]

      // Encontra o índice do jogador que queremos atualizar
      const playerIndex = updatedPlayers.findIndex((p) => p.id === playerId)

      if (playerIndex === -1) {
        console.error(`Player with ID ${playerId} not found`)
        return prevPlayers
      }

      // Atualiza a zona e o índice de posição do jogador
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        position: zone, // Atualiza a posição principal (attack/defense/bench)
        positionIndex: positionIndex, // Mantém o índice da posição
      }

      console.log(`Player updated locally:`, updatedPlayers[playerIndex])

      return updatedPlayers
    })

    // Em seguida, envie a atualização para o backend
    updatePlayerPositionAPI(game.id, playerId, zone)
      .then((response) => {
        console.log("Player position updated on server:", response)
      })
      .catch((error) => {
        console.error("Failed to update player position on server:", error)
        // Opcionalmente, você pode reverter a mudança local se a atualização do servidor falhar
        // ou implementar uma fila de tentativas
      })
  }

  // Adicione uma função para carregar os jogadores do servidor
  const loadGamePlayers = () => {
    getGamePlayers(game.id)
      .then((data) => {
        console.log("Loaded players from server:", data)
        // Atualizar o estado dos jogadores com os dados do servidor
        setPlayers(data)
      })
      .catch((error) => {
        console.error("Failed to load game players:", error)
      })
  }

  // Adicione um useEffect para carregar os jogadores quando o componente montar
  useEffect(() => {
    loadGamePlayers()
  }, [game.id]) // Recarregar quando o ID do jogo mudar

  // Add event to current possession
  const addEventToPossession = (event: Stat) => {
    setCurrentPossession((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }))
  }

  // End current possession
  const endCurrentPossession = (reason: string, playerId?: number) => {
    // Record end of possession event
    const eventData: Stat = {
      game_id: game.id,
      player_id: playerId || (players.length > 0 ? players[0].id : 1),
      action_id: actions.find((a) => a.code === "O")?.id || 0,
      success: true,
      event_type: currentPossession.type === "attack" ? "end_attack" : "end_defense",
      possession_id: currentPossession.id,
      possession_type: currentPossession.type,
      description: `End of ${currentPossession.type === "attack" ? "attack" : "defense"}: ${reason}`,
      time: formatTime(matchTime),
    }

    recordEvent(eventData)

    // Save current possession
    setPossessions((prev) => [...prev, currentPossession])

    // Start new possession of opposite type
    startNewPossession(currentPossession.type === "attack" ? "defense" : "attack")
  }

  const { route } = usePage().props

  // Função para registrar um evento usando apenas Inertia
  const recordEvent = (eventData: Stat) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    // Criar uma cópia do evento para evitar mutações no original
    const eventToSend = { ...eventData }

    // Criar um ID temporário para feedback imediato no frontend
    const tempEvent: Stat = {
      ...eventToSend,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    // Adicionar evento temporário para feedback imediato no frontend
    setEvents((prevEvents) => [tempEvent, ...prevEvents])

    // Usar Inertia.post para enviar o evento ao backend
    router.post(route("stats.store"), eventToSend, {
      onSuccess: ({ props }) => {
        const newEvent = props.event as Stat | undefined

        if (newEvent) {
          // Substituir o evento temporário pelo evento real salvo
          setEvents((prevEvents) => prevEvents.map((event) => (event.id === tempEvent.id ? newEvent : event)))

          // Adicionar evento à posse atual, se for válido
          if (
            newEvent.event_type !== "start_attack" &&
            newEvent.event_type !== "end_attack" &&
            newEvent.event_type !== "start_defense" &&
            newEvent.event_type !== "end_defense"
          ) {
            addEventToPossession(newEvent)
          }

          // Atualizar placar se for um gol
          const action = actions.find((a) => a.id === newEvent.action_id)
          if (action?.code === "G" && newEvent.success) {
            setScore((prevScore) => {
              const newScore = prevScore + 1
              localStorage.setItem(`game_${game.id}_score`, newScore.toString())
              return newScore
            })

            // Se for um gol, encerrar a posse de ataque
            if (currentPossession.type === "attack") {
              endCurrentPossession("Goal scored", newEvent.player_id || undefined)
            }
          }

          // Verificar eventos que encerram posses
          if (["LC", "LM", "LL"].includes(action?.code || "")) {
            if (!newEvent.success && currentPossession.type === "attack") {
              endCurrentPossession("Shot missed", newEvent.player_id || undefined)
            }
          }

          if (["MP", "Pa"].includes(action?.code || "")) {
            if (currentPossession.type === "attack") {
              endCurrentPossession("Turnover", newEvent.player_id || undefined)
            }
          }

          if (action?.code === "RG" && newEvent.success && currentPossession.type === "defense") {
            endCurrentPossession("Rebound recovered", newEvent.player_id || undefined)
          }
        }
      },
      onError: (errors) => {
        console.error("Erro ao salvar evento:", errors)
        alert(`Falha ao salvar evento: ${errors.message || "Erro desconhecido"}`)

        // Remover evento temporário em caso de erro
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== tempEvent.id))
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  // Function to handle editing an event
  const handleEditEvent = () => {
    if (!currentEditEvent || isSubmitting) return

    setIsSubmitting(true)

    router.put(route("stats.update", currentEditEvent.id), currentEditEvent, {
      onSuccess: () => {
        setEvents((prevEvents) =>
          prevEvents.map((event) => (event.id === currentEditEvent.id ? currentEditEvent : event)),
        )
        setEditEventDialogOpen(false)
        setCurrentEditEvent(null)
      },
      onError: (errors) => {
        console.error("Erro ao atualizar evento:", errors)
        alert(`Falha ao atualizar evento: ${errors.message || "Erro desconhecido"}`)
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setIsSubmitting(true)

    try {
      // Encontrar o evento antes de excluí-lo para referência
      const eventToDelete = events.find((e) => e.id === eventId)
      if (!eventToDelete) {
        throw new Error("Event not found in local state")
      }

      console.log("Deleting event:", eventToDelete)

      router.delete(`/stats/${eventId}`, {
        onSuccess: () => {
          console.log("Event deleted successfully")

          // Remove the event from the events list
          setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
        },
        onError: (errors) => {
          console.error("Error deleting event:", errors)
          alert(`Failed to delete event: ${errors.message || "Unknown error"}`)
        },
        onFinish: () => {
          setIsSubmitting(false)
        },
      })
    } catch (error: any) {
      console.error("Error in handleDeleteEvent:", error)
      alert(`Failed to delete event: ${error.message || "Unknown error"}`)
      setIsSubmitting(false)
    }
  }

  // Function to open the edit dialog
  const openEditDialog = (event: Stat) => {
    setCurrentEditEvent(event)
    setEditEventDialogOpen(true)
  }

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!selectedPlayer || !selectedActionId) {
      alert("Please select a player and an action")
      return
    }

    const player = selectedPlayer
    const action = actions.find((a) => a.id === selectedActionId)

    // Create a description if none was provided
    const description = eventDescription || `${player.name} - ${action?.description || "Action"}`

    // Determine event type based on action code
    let eventType = "other"
    if (action?.code === "G") eventType = "goal"
    else if (action?.code === "A") eventType = "assist"
    else if (action?.code === "RG" || action?.code === "RP") eventType = "rebound"
    else if (action?.code === "D") eventType = "defense"
    else if (action?.code === "MP") eventType = "bad_pass"
    else if (action?.code === "Pa") eventType = "traveling"
    else if (action?.code === "LC" || action?.code === "LM" || action?.code === "LL" || action?.code === "P")
      eventType = "shot"
    else if (action?.code === "F" || action?.code === "Pe") eventType = "foul"
    else if (action?.code === "S") eventType = "substitution"
    else if (action?.code === "PS") eventType = "position_switch"
    else if (action?.code === "T") eventType = "timeout"

    const eventData: Stat = {
      game_id: game.id,
      player_id: player.id,
      action_id: selectedActionId,
      success: eventSuccess,
      event_type: eventType,
      possession_id: currentPossession.id,
      possession_type: currentPossession.type,
      description: description,
      time: formatTime(matchTime),
    }

    recordEvent(eventData)
    setEventDialogOpen(false)

    // Reset form
    setSelectedActionId(null)
    setEventSuccess(true)
    setSelectedPlayer(null)
    setEventDescription("")
  }

  // Get attack players
  const getAttackPlayers = (): Player[] => {
    return players.filter((p) => p.position === "attack")
  }

  // Get defense players
  const getDefensePlayers = (): Player[] => {
    return players.filter((p) => p.position === "defense")
  }

  // Get substitute players
  const getSubstitutes = (): Player[] => {
    return players.filter((p) => p.position === "bench" || !p.position)
  }

  // Function to switch attack and defense players
  const switchAttackDefense = async () => {
    // Separate attack and defense players
    const attackPlayers = getAttackPlayers()
    const defensePlayers = getDefensePlayers()

    // Update positions locally
    const updatedPlayers = players.map((player) => {
      if (attackPlayers.some((p) => p.id === player.id)) {
        return {
          ...player,
          position: "defense" as const,
          zone: "defense" as const,
        }
      } else if (defensePlayers.some((p) => p.id === player.id)) {
        return {
          ...player,
          position: "attack" as const,
          zone: "attack" as const,
        }
      }
      return player
    })

    setPlayers(updatedPlayers)

    // Get a valid player ID - use the first player from attack players if available
    const playerId =
      attackPlayers.length > 0
        ? attackPlayers[0].id
        : defensePlayers.length > 0
          ? defensePlayers[0].id
          : players.length > 0
            ? players[0].id
            : 1

    // Record position switch event
    const eventData: Stat = {
      game_id: game.id,
      player_id: playerId,
      action_id: actions.find((a) => a.code === "PS")?.id || 0,
      success: true,
      event_type: "position_switch",
      possession_id: currentPossession.id,
      possession_type: currentPossession.type,
      description: "Position switch: attack and defense",
      time: formatTime(matchTime),
    }

    recordEvent(eventData)
  }

  // Function to end the game
  const endGame = () => {
    if (!confirm("Are you sure you want to end this game? This action cannot be undone.")) return

    router.post(
      route("games.end", game.id),
      {
        score_team_a: score,
        score_team_b: opponentScore,
        ended_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          // Limpar dados do localStorage
          localStorage.removeItem(`game_${game.id}_time`)
          localStorage.removeItem(`game_${game.id}_period`)
          localStorage.removeItem(`game_${game.id}_score`)
          localStorage.removeItem(`game_${game.id}_opponent_score`)
        },
        onError: (errors) => {
          console.error("Erro ao encerrar o jogo:", errors)
          alert(`Falha ao encerrar o jogo: ${errors.message || "Erro desconhecido"}`)
        },
        onFinish: () => {
          // Inertia automaticamente redireciona caso a resposta do backend contenha um redirecionamento
        },
      },
    )
  }

  // Modificar as funções de atualização de score do oponente
  const incrementOpponentScore = () => {
    setOpponentScore((prevScore) => {
      const newScore = prevScore + 1
      localStorage.setItem(`game_${game.id}_opponent_score`, newScore.toString())
      return newScore
    })
  }

  const decrementOpponentScore = () => {
    setOpponentScore((prevScore) => {
      const newScore = Math.max(0, prevScore - 1)
      localStorage.setItem(`game_${game.id}_opponent_score`, newScore.toString())
      return newScore
    })
  }

  // Adicione esta função ao componente Record:
  const onPlayerPositionUpdated = (updatedPlayer) => {
    setPlayers((prevPlayers) => prevPlayers.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)))
  }

  // Create a context object with all the state and functions we need to pass down
  const gameContext = {
    game,
    actions,
    players,
    events,
    matchTime,
    isRunning,
    period,
    score,
    opponentScore,
    teamName,
    teamALogo,
    teamBLogo,
    opponentName,
    currentPossession,
    possessions,
    formatTime,
    toggleTimer,
    resetTimer,
    changePeriod,
    handlePlayerClick,
    startNewPossession,
    endCurrentPossession,
    switchAttackDefense,
    endGame,
    incrementOpponentScore,
    decrementOpponentScore,
    getAttackPlayers,
    getDefensePlayers,
    getSubstitutes,
    openEditDialog,
    handleDeleteEvent,
    updatePlayerPosition,
    // ... outros valores
    onPlayerPositionUpdated,
  }

  return (
    <>
      <Navbar />
      <AppLayout breadcrumbs={[{ title: "Log Game", href: "/dashboard" }]}>
        <Head title="Record Game">
          <meta
            name="csrf-token"
            content={document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""}
          />
        </Head>

        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl p-4">
              <GameHeader gameContext={gameContext} />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 grid grid-cols-3">
                      <TabsTrigger value="field">Field View</TabsTrigger>
                      <TabsTrigger value="events">Event Log</TabsTrigger>
                      <TabsTrigger value="stats">Team Stats</TabsTrigger>
                    </TabsList>

                    <TabsContent value="field">
                      <GameField gameContext={gameContext} />
                    </TabsContent>

                    <TabsContent value="events">
                      <EventLog gameContext={gameContext} setEventDialogOpen={setEventDialogOpen} />
                    </TabsContent>

                    <TabsContent value="stats">
                      <TeamStats gameContext={gameContext} />
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <PlayerStats gameContext={gameContext} />
                </div>
              </div>

              {/* Event Dialog */}
              <EventDialog
                open={eventDialogOpen}
                onOpenChange={setEventDialogOpen}
                selectedPlayer={selectedPlayer}
                selectedActionId={selectedActionId}
                setSelectedActionId={setSelectedActionId}
                eventSuccess={eventSuccess}
                setEventSuccess={setEventSuccess}
                eventDescription={eventDescription}
                setEventDescription={setEventDescription}
                handleAddEvent={handleAddEvent}
                actions={actions}
              />

              {/* Edit Event Dialog */}
              <EditEventDialog
                open={editEventDialogOpen}
                onOpenChange={setEditEventDialogOpen}
                currentEditEvent={currentEditEvent}
                setCurrentEditEvent={setCurrentEditEvent}
                handleEditEvent={handleEditEvent}
                actions={actions}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}

export default RecordGame

// Função auxiliar para obter o nome completo do tipo de lançamento
const getFullShotTypeName = (type: string) => {
  switch (type) {
    case "LC":
      return "Short Range"
    case "LM":
      return "Medium Range"
    case "LL":
      return "Long Range"
    case "P":
      return "Layup"
    case "L":
      return "Free Throw"
    case "Pe":
      return "Penalty"
    default:
      return type
  }
}

