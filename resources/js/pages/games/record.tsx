"use client"

import { useState, useEffect } from "react"
import { Head, router } from "@inertiajs/react"
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


// Import the services
import { updatePlayerPosition as updatePlayerPositionAPI, getGamePlayers } from "@/api/player-api"
import { createStat, updateStat, deleteStat } from "@/api/create-stat"
import type {Player, Action, Team, Game} from "@/types/index"



interface RecordGameProps {
  game?: {
    id: number
    home_team: {
      id: number
      name: string
    }
    away_team: {
      id: number
      name: string
    }
    date: string
    time: string
    location: string
  }
  players: Player[]
  stats: any[]
  actions: any[]
}

const RecordGame = ({ game, players: initialPlayers, stats: initialStats, actions }: RecordGameProps) => {
  const [matchTime, setMatchTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [period, setPeriod] = useState(1)
  const [events, setEvents] = useState<Stat[]>(initialStats || [])
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [teamName, setTeamName] = useState(game?.teamA?.name || "Our Team")
  const [teamALogo, setTeamALogo] = useState(game?.teamA?.logo_url || null)
  const [teamBLogo, setTeamBLogo] = useState(game?.teamB?.logo_url || null)
  const [players, setPlayers] = useState<Player[]>(initialPlayers?.filter((p) => p.team_id === game.team_a_id) || [])
  const [opponentName, setOpponentName] = useState(game?.teamB?.name || "Opponent Team")

  console.log("Jogadores:" + players)

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

  // Mapa para armazenar os índices de posição localmente
  const [positionIndices, setPositionIndices] = useState<{ [key: number]: number }>({})

  // Timer functionality
  useEffect(() => {
    // Recuperar o tempo salvo no localStorage, se existir
    const savedTime = localStorage.getItem(`game_${game?.id}_time`)
    if (savedTime && matchTime === 0) {
      setMatchTime(Number.parseInt(savedTime, 10))
    }

    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setMatchTime((prevTime) => {
          const newTime = prevTime + 1
          // Salvar o tempo atual no localStorage
          localStorage.setItem(`game_${game?.id}_time`, newTime.toString())
          return newTime
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, game?.id, matchTime])

  // Persistir o período no localStorage
  useEffect(() => {
    const savedPeriod = localStorage.getItem(`game_${game?.id}_period`)
    if (savedPeriod && period === 1) {
      setPeriod(Number.parseInt(savedPeriod, 10))
    }
  }, [game?.id, period])

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
    const savedScore = localStorage.getItem(`game_${game?.id}_score`)
    if (savedScore && score === 0) {
      setScore(Number.parseInt(savedScore, 10))
    }

    const savedOpponentScore = localStorage.getItem(`game_${game?.id}_opponent_score`)
    if (savedOpponentScore && opponentScore === 0) {
      setOpponentScore(Number.parseInt(savedOpponentScore, 10))
    }
  }, [game?.id, score, opponentScore])

  // Adicione este useEffect após as declarações de estado
  useEffect(() => {
    // Carregar os índices de posição do localStorage
    const savedPositionIndices = localStorage.getItem(`game_${game?.id}_position_indices`)
    if (savedPositionIndices) {
      try {
        const indices = JSON.parse(savedPositionIndices)
        console.log("Índices carregados do localStorage:", indices)
        setPositionIndices(indices)
      } catch (e) {
        console.error("Erro ao carregar índices de posição:", e)
      }
    }
  }, [game?.id])

  // Adicione este useEffect para inicializar os índices de posição com base nos jogadores iniciais
  useEffect(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      // Inicializar o mapa de índices com base nos jogadores iniciais
      const initialIndices = {}

      // Para cada jogador de ataque, atribua um índice sequencial
      const attackPlayers = initialPlayers.filter((p) => p.position === "attack")
      attackPlayers.forEach((player, index) => {
        if (index < 4) {
          // Limite de 4 posições
          initialIndices[player.id] = index
        }
      })

      // Para cada jogador de defesa, atribua um índice sequencial
      const defensePlayers = initialPlayers.filter((p) => p.position === "defense")
      defensePlayers.forEach((player, index) => {
        if (index < 4) {
          // Limite de 4 posições
          initialIndices[player.id] = index
        }
      })

      // Atualizar o estado com os índices iniciais
      setPositionIndices((prev) => ({
        ...prev,
        ...initialIndices,
      }))

      console.log("Índices inicializados com base nos jogadores:", initialIndices)
    }
  }, [initialPlayers])

  // Adicione este useEffect para salvar os índices de posição no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem(`game_${game?.id}_position_indices`, JSON.stringify(positionIndices))
  }, [positionIndices, game?.id])

  // Adicione esta função ao componente Record
  const syncPositionIndices = () => {
    // Obter os índices atuais
    const currentIndices = {}

    // Para cada jogador de ataque, salvar seu índice
    players
      .filter((p) => p.position === "attack")
      .forEach((player) => {
        if (player.positionIndex !== undefined) {
          currentIndices[player.id] = player.positionIndex
        }
      })

    // Para cada jogador de defesa, salvar seu índice
    players
      .filter((p) => p.position === "defense")
      .forEach((player) => {
        if (player.positionIndex !== undefined) {
          currentIndices[player.id] = player.positionIndex
        }
      })

    // Atualizar o estado e o localStorage
    setPositionIndices(currentIndices)
    localStorage.setItem(`game_${game?.id}_position_indices`, JSON.stringify(currentIndices))

    console.log("Índices sincronizados:", currentIndices)
  }

  // Adicione este useEffect para sincronizar os índices periodicamente
  useEffect(() => {
    // Sincronizar os índices a cada 5 segundos
    const interval = setInterval(syncPositionIndices, 5000)

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [players])

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
    localStorage.setItem(`game_${game?.id}_period`, newPeriod.toString())

    // Record period change as an event
    const newEvent: Stat = {
      game_id: game?.id,
      player_id: null,
      action_id: actions.find((a) => a.code === "O")?.id || 0,
      success: null,
      event_id: "1", // Changed from 1 to "1"
      event_type: "period_change", // Add a default event_type
      description: `Period ${newPeriod} started`,
      time: formatTime(matchTime),
    }

    recordEvent(newEvent)
  }

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player)
    console.log("Player selected:", player)
    setEventDialogOpen(true)
  }




  const [positionedPlayers, setPositionedPlayers] = useState<Set<number>>(new Set())

  const [initialSetupComplete, setInitialSetupComplete] = useState<boolean>(false)

  // Add this function to toggle back to setup mode
  const toggleSetupMode = () => {
    if (initialSetupComplete) {
      // If we're in game mode, switch back to setup mode
      setInitialSetupComplete(false)
      localStorage.removeItem(`game_${game?.id}_setup_complete`)
      console.log("Switched back to Initial Setup Mode. Position changes will be saved to the server.")
    } else {
      // If we're in setup mode, switch to game mode
      setInitialSetupComplete(true)
      localStorage.setItem(`game_${game?.id}_setup_complete`, "true")
      console.log("Initial setup marked as complete. Further position changes will only update locally.")
    }
  }

  // Modify the updatePlayerPosition function
  const updatePlayerPosition = (playerId: number, zone: "attack" | "defense" | "bench", positionIndex?: number) => {
    console.log(`Updating player ${playerId} to zone ${zone} with position index ${positionIndex}`)

    // First, update local state for immediate feedback
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers]
      const playerIndex = updatedPlayers.findIndex((p) => p.id === playerId)

      if (playerIndex === -1) {
        console.error(`Player with ID ${playerId} not found`)
        return prevPlayers
      }

      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        position: zone,
        positionIndex: zone !== "bench" ? positionIndex : undefined,
        zone: zone,
      }

      console.log(`Player updated locally:`, updatedPlayers[playerIndex])
      return updatedPlayers
    })

    // Update position indices
    if (zone !== "bench" && positionIndex !== undefined) {
      setPositionIndices((prev) => {
        const newIndices = {
          ...prev,
          [playerId]: positionIndex,
        }
        localStorage.setItem(`game_${game?.id}_position_indices`, JSON.stringify(newIndices))
        return newIndices
      })
    } else {
      setPositionIndices((prev) => {
        const newIndices = { ...prev }
        delete newIndices[playerId]
        localStorage.setItem(`game_${game?.id}_position_indices`, JSON.stringify(newIndices))
        return newIndices
      })
    }

    // Check if this player has been positioned before
    const hasBeenPositionedBefore = positionedPlayers.has(playerId)

    // If we're in setup mode or moving to bench, update backend
    if (!initialSetupComplete || zone === "bench") {
      // If moving to field (attack/defense) and never positioned before, mark as positioned
      if ((zone === "attack" || zone === "defense") && !hasBeenPositionedBefore) {
        // Add to positioned players set
        setPositionedPlayers((prev) => {
          const newSet = new Set(prev)
          newSet.add(playerId)
          return newSet
        })
      }

      // Update backend
      updatePlayerPositionAPI(game?.id, playerId, zone)
        .then((response) => {
          console.log("Player position updated on server:", response)
        })
        .catch((error) => {
          console.error("Failed to update player position on server:", error)
          alert("Erro ao atualizar posição do jogador. Tentando novamente...")
          setTimeout(() => {
            updatePlayerPositionAPI(game?.id, playerId, zone).catch((e) => {
              console.error("Retry failed:", e)
              alert("Falha ao atualizar posição. Por favor, recarregue a página.")
            })
          }, 1000)
        })
    }
    // Otherwise, only local state was updated, no backend call needed
  }

  // Add a function to mark initial setup as complete
  const completeInitialSetup = () => {
    setInitialSetupComplete(true)
    localStorage.setItem(`game_${game?.id}_setup_complete`, "true")
    console.log("Initial setup marked as complete. Further position changes will only update locally.")
  }

  // Check if initial setup was already completed in a previous session
  useEffect(() => {
    const setupComplete = localStorage.getItem(`game_${game?.id}_setup_complete`) === "true"
    if (setupComplete) {
      setInitialSetupComplete(true)
    }
  }, [game?.id])

  // Adicione uma função para carregar os jogadores do servidor
  const loadGamePlayers = () => {
    getGamePlayers(game?.id)
      .then((data) => {
        console.log("Loaded players from server:", data)

        // Initialize positioned players set based on loaded data
        const newPositionedPlayers = new Set<number>()
        data.forEach((player) => {
          if (player.position === "attack" || player.position === "defense") {
            newPositionedPlayers.add(player.id)
          }
        })
        setPositionedPlayers(newPositionedPlayers)

        // Rest of the existing code...
        const savedPositionIndices = localStorage.getItem(`game_${game?.id}_position_indices`)
        let indices = positionIndices // Usar o estado atual como padrão

        if (savedPositionIndices) {
          try {
            indices = JSON.parse(savedPositionIndices)
            // Atualizar o estado dos índices
            setPositionIndices(indices)
          } catch (e) {
            console.error("Erro ao carregar índices de posição:", e)
          }
        }

        // Agora, vamos aplicar os índices aos jogadores
        const playersWithIndices = data.map((player) => {
          // Só aplicamos o índice se o jogador não estiver no banco
          if (player.position !== "bench" && indices[player.id] !== undefined) {
            return {
              ...player,
              positionIndex: indices[player.id],
            }
          }
          return player
        })

        console.log("Players with indices:", playersWithIndices)

        // Atualizar o estado dos jogadores
        setPlayers(playersWithIndices)
      })
      .catch((error) => {
        console.error("Failed to load game players:", error)
      })
  }

  // Adicione um useEffect para carregar os jogadores quando o componente montar
  useEffect(() => {
    loadGamePlayers()
  }, [game?.id]) // Recarregar quando o ID do jogo mudar

  // Function to record an event using fetch
  const recordEvent = async (eventData: Stat) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    // Create a copy of the event to avoid mutations to the original
    const eventToSend = { ...eventData }
    console.log("Sending event data:", eventToSend)

    // Create a temporary ID for immediate feedback in the frontend
    const tempEvent: Stat = {
      ...eventToSend,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    // Add temporary event for immediate feedback in the frontend
    setEvents((prevEvents) => [tempEvent, ...prevEvents])

    try {
      // Send the event to the backend using fetch
      const result = await createStat(eventToSend)

      if (result.success && result.event) {
        const newEvent = result.event

        // Replace the temporary event with the real saved event
        setEvents((prevEvents) => prevEvents.map((event) => (event.id === tempEvent.id ? newEvent : event)))

        // Update score if it's a goal
        const action = actions.find((a) => a.id === newEvent.action_id)
        if (action?.code === "G" && newEvent.success) {
          setScore((prevScore) => {
            const newScore = prevScore + 1
            localStorage.setItem(`game_${game?.id}_score`, newScore.toString())
            return newScore
          })
        }
      } else {
        // Handle error
        console.error("Error saving event:", result.message)
        alert(`Failed to save event: ${result.message || "Unknown error"}`)

        // Remove temporary event in case of error
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== tempEvent.id))
      }
    } catch (error) {
      console.error("Error in recordEvent:", error)
      alert(`Failed to save event: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Remove temporary event in case of error
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== tempEvent.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle editing an event
  const handleEditEvent = async () => {
    if (!currentEditEvent || isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await updateStat(currentEditEvent.id, currentEditEvent)

      if (result.success && result.event) {
        setEvents((prevEvents) => prevEvents.map((event) => (event.id === currentEditEvent.id ? result.event : event)))
        setEditEventDialogOpen(false)
        setCurrentEditEvent(null)
      } else {
        console.error("Error updating event:", result.message)
        alert(`Failed to update event: ${result.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error in handleEditEvent:", error)
      alert(`Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setIsSubmitting(true)

    try {
      const result = await deleteStat(eventId)

      if (result.success) {
        // Remove the event from the events list
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
      } else {
        console.error("Error deleting event:", result.message)
        alert(`Failed to delete event: ${result.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error in handleDeleteEvent:", error)
      alert(`Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
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
    // Check if player is selected
    if (!selectedPlayer) {
      console.error("No player selected for event")
      alert("Please select a player first")
      return
    }

    // Check if action is selected
    if (!selectedActionId) {
      console.error("No action selected for event")
      alert("Please select an action")
      return
    }

    const player = selectedPlayer
    const action = actions.find((a) => a.id === selectedActionId)

    // Create a description if none was provided
    const description = eventDescription || `${player.name} - ${action?.description || "Action"}`

    const eventData: Stat = {
      game_id: game?.id,
      player_id: player.id,
      action_id: selectedActionId,
      success: eventSuccess,
      event_id: "1", // Make sure this is included and is a string
      event_type: "player_action", // Add a default event_type
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

  // Modificar as funções de obtenção de jogadores para incluir o positionIndex do mapa local
  const getAttackPlayers = (): Player[] => {
    return players
      .filter((p) => p.position === "attack")
      .map((player) => ({
        ...player,
        positionIndex: positionIndices[player.id],
      }))
  }

  const getDefensePlayers = (): Player[] => {
    return players
      .filter((p) => p.position === "defense")
      .map((player) => ({
        ...player,
        positionIndex: positionIndices[player.id],
      }))
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
      game_id: game?.id,
      player_id: playerId,
      action_id: actions.find((a) => a.code === "PS")?.id || 0,
      success: true,
      event_id: "1", // Make sure this is included and is a string
      event_type: "position_switch", // Add a default event_type
      description: "Position switch: attack and defense",
      time: formatTime(matchTime),
    }

    recordEvent(eventData)
  }

  // Function to end the game
  const endGame = () => {
    if (!confirm("Are you sure you want to end this game? This action cannot be undone.")) return

    router.post(
      route("games.end", game?.id),
      {
        score_team_a: score,
        score_team_b: opponentScore,
        ended_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          // Limpar dados do localStorage
          localStorage.removeItem(`game_${game?.id}_time`)
          localStorage.removeItem(`game_${game?.id}_period`)
          localStorage.removeItem(`game_${game?.id}_score`)
          localStorage.removeItem(`game_${game?.id}_opponent_score`)
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
      localStorage.setItem(`game_${game?.id}_opponent_score`, newScore.toString())
      return newScore
    })
  }

  const decrementOpponentScore = () => {
    setOpponentScore((prevScore) => {
      const newScore = Math.max(0, prevScore - 1)
      localStorage.setItem(`game_${game?.id}_opponent_score`, newScore.toString())
      return newScore
    })
  }

  // Adicione esta função ao componente Record:
  const onPlayerPositionUpdated = (updatedPlayer) => {
    setPlayers((prevPlayers) => prevPlayers.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)))
  }

  // Function to update player position locally
  const updateLocalPlayerPosition = (
    playerId: number,
    zone: "attack" | "defense" | "bench",
    positionIndex?: number,
  ) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = prevPlayers.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            position: zone,
            positionIndex: zone !== "bench" ? positionIndex : undefined,
            zone: zone,
          }
        }
        return player
      })
      return updatedPlayers
    })
  }

  // Make sure to include positionedPlayers in the gameContext
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
    formatTime,
    toggleTimer,
    resetTimer,
    changePeriod,
    handlePlayerClick,
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
    updateLocalPlayerPosition,
    positionedPlayers,
    onPlayerPositionUpdated,
    initialSetupComplete,
    toggleSetupMode,
    completeInitialSetup,
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




