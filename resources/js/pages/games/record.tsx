"use client"

import { useState, useEffect } from "react"
import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeftRight,
  ShoppingBasketIcon as Basketball,
  Clock,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Swords,
  Target,
  Trophy,
  UserPlus,
  BellIcon as Whistle,
  Pencil,
  Trash2,
} from "lucide-react"
import { Inertia } from "@inertiajs/inertia"

// Define interfaces for our data types
interface Player {
  id: number
  name: string
  gender: "male" | "female"
  position: "attack" | "defense"
  team_id: number
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

interface RecordGameProps {
  game: Game
  players: Player[]
  stats: Stat[]
  actions: Action[]
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
  const [opponentName, setOpponentName] = useState(game?.teamB?.name || "Opponent")
  const [players, setPlayers] = useState<Player[]>(initialPlayers?.filter((p) => p.team_id === game.team_a_id) || [])

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
      player_id: playerId, // Use a valid player ID instead of null
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
    Inertia.post(route("stats.store"), eventToSend, {
      onSuccess: ({ props }) => {
        const newEvent = props.event as Stat | undefined;
  
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
  
    Inertia.put(route("stats.update", currentEditEvent.id), currentEditEvent, {
      onSuccess: () => {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === currentEditEvent.id ? currentEditEvent : event
          )
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
      }
    })
  }

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    setIsSubmitting(true);

    try {
      // Encontrar o evento antes de excluí-lo para referência
      const eventToDelete = events.find(e => e.id === eventId);
      if (!eventToDelete) {
        throw new Error("Event not found in local state");
      }
      
      console.log("Deleting event:", eventToDelete);

     
      Inertia.delete(`/stats/${eventId}`, {
        onSuccess: () => {
          console.log("Event deleted successfully");
          
          // Remove the event from the events list
          setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
          
         
        },
        onError: (errors) => {
          console.error("Error deleting event:", errors);
          alert(`Failed to delete event: ${errors.message || "Unknown error"}`);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error: any) {
      console.error("Error in handleDeleteEvent:", error);
      alert(`Failed to delete event: ${error.message || "Unknown error"}`);
      setIsSubmitting(false);
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
    return players.filter((p) => p.position === "attack").slice(0, 4)
  }

  // Get defense players
  const getDefensePlayers = (): Player[] => {
    return players.filter((p) => p.position === "defense").slice(0, 4)
  }

  // Get substitute players
  const getSubstitutes = (): Player[] => {
    const activePlayers = [...getAttackPlayers(), ...getDefensePlayers()]
    const activePlayerIds = activePlayers.map((p) => p.id)
    return players.filter((p) => !activePlayerIds.includes(p.id))
  }

  // Function to switch attack and defense players
  const switchAttackDefense = async () => {
    // Separate attack and defense players
    const attackPlayers = players.filter((p) => p.position === "attack")
    const defensePlayers = players.filter((p) => p.position === "defense")

    // Update positions locally
    const updatedPlayers = players.map((player) => {
      if (attackPlayers.some((p) => p.id === player.id)) {
        return { ...player, position: "defense" as const }
      } else if (defensePlayers.some((p) => p.id === player.id)) {
        return { ...player, position: "attack" as const }
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
  
    Inertia.post(route("games.end", game.id), {
      score_team_a: score,
      score_team_b: opponentScore,
      ended_at: new Date().toISOString(),
    }, {
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
      }
    })
  }
  

  // Get event icon based on event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return <Trophy className="h-4 w-4" />
      case "assist":
        return <Trophy className="h-4 w-4" />
      case "foul":
        return <Whistle className="h-4 w-4" />
      case "substitution":
        return <UserPlus className="h-4 w-4" />
      case "position_switch":
        return <ArrowLeftRight className="h-4 w-4" />
      case "timeout":
        return <Clock className="h-4 w-4" />
      case "rebound":
        return <Basketball className="h-4 w-4" />
      case "defense":
        return <Shield className="h-4 w-4" />
      case "shot":
        return <Target className="h-4 w-4" />
      default:
        return <MoreHorizontal className="h-4 w-4" />
    }
  }

  // Get event color based on event type and success
  const getEventColor = (eventType: string, success: boolean | null) => {
    // If success is defined, override colors based on success/failure
    if (success === true) {
      return "bg-green-100 text-green-800"
    } else if (success === false) {
      return "bg-red-100 text-red-800"
    }

    // Default colors by event type
    switch (eventType) {
      case "goal":
        return "bg-green-100 text-green-800"
      case "assist":
        return "bg-emerald-100 text-emerald-800"
      case "foul":
        return "bg-red-100 text-red-800"
      case "substitution":
        return "bg-blue-100 text-blue-800"
      case "position_switch":
        return "bg-indigo-100 text-indigo-800"
      case "timeout":
        return "bg-yellow-100 text-yellow-800"
      case "rebound":
        return "bg-purple-100 text-purple-800"
      case "defense":
        return "bg-blue-100 text-blue-800"
      case "shot":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-200 text-gray-900"
    }
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
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle>
                        Korfball Match Recorder - {teamName} vs {opponentName}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={toggleTimer}>
                        {isRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                        {isRunning ? "Pause" : "Start"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetTimer}>
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Reset
                      </Button>
                      <Button variant="destructive" size="sm" onClick={endGame}>
                        End Game
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">{teamName}</div>
                      {teamALogo && (
                        <img
                          src={teamALogo || "/placeholder.svg"}
                          alt={`${teamName} Logo`}
                          className="h-16 w-16 object-contain"
                        />
                      )}
                      <div className="mt-2 text-5xl font-bold">{score}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-2 text-xl font-semibold">Period {period}</div>
                      <div className="text-4xl font-bold">{formatTime(matchTime)}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={changePeriod}>
                          Next Period
                        </Button>
                        <Button variant="outline" size="sm" onClick={switchAttackDefense}>
                          <ArrowLeftRight className="mr-1 h-4 w-4" />
                          Switch Attack/Defense
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => startNewPossession("attack")}>
                          Start Attack
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => endCurrentPossession("Manual")}>
                          End Possession
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => startNewPossession("defense")}>
                          Start Defense
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">{opponentName}</div>
                      {teamBLogo && (
                        <img
                          src={teamBLogo || "/placeholder.svg"}
                          alt={`${opponentName} Logo`}
                          className="h-16 w-16 object-contain"
                        />
                      )}
                      <div className="mt-2 text-5xl font-bold">{opponentScore}</div>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={incrementOpponentScore}>
                          +1
                        </Button>
                        <Button variant="outline" size="sm" onClick={decrementOpponentScore}>
                          -1
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 grid grid-cols-3">
                      <TabsTrigger value="field">Field View</TabsTrigger>
                      <TabsTrigger value="events">Event Log</TabsTrigger>
                      <TabsTrigger value="stats">Team Stats</TabsTrigger>
                    </TabsList>

                    <TabsContent value="field">
                      <Card>
                        <CardHeader>
                          <CardTitle>Korfball Field</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border-2 border-green-300 bg-green-100">
                            {/* Center line */}
                            <div className="absolute top-0 left-1/2 h-full w-1 -translate-x-1/2 bg-white"></div>

                            {/* Attack zone */}
                            <div className="absolute top-0 left-0 flex h-full w-1/2 flex-col">
                              <div className="py-2 text-center font-semibold bg-green-200">
                                <div className="flex items-center justify-center gap-1">
                                  <Swords className="h-4 w-4" /> Attack Zone
                                </div>
                              </div>

                              {/* Korf (basket) */}
                              <div className="absolute top-1/2 left-1/4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400">
                                <div className="h-4 w-4 rounded-full bg-white"></div>
                              </div>

                              {/* Attack players */}
                              <div className="relative flex-1 p-4">
                                {getAttackPlayers().map((player, index) => {
                                  // Position players in a square
                                  const positions = [
                                    { top: "20%", left: "20%" }, // Top-left
                                    { top: "20%", left: "60%" }, // Top-right
                                    { top: "70%", left: "20%" }, // Bottom-left
                                    { top: "70%", left: "60%" }, // Bottom-right
                                  ]
                                  console.log("All Players:", players)
console.log("Attack Players:", getAttackPlayers())
console.log("Defense Players:", getDefensePlayers())
console.log("Substitutes:", getSubstitutes())


                                  return (
                                    <div
                                      key={player.id}
                                      className="absolute cursor-pointer"
                                      style={{
                                        top: positions[index].top,
                                        left: positions[index].left,
                                      }}
                                      onClick={() => handlePlayerClick(player)}
                                    >
                                      <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                          player.gender === "male" ? "bg-blue-400" : "bg-pink-400"
                                        } font-bold text-white`}
                                      >
                                        {player.name.charAt(0)}
                                      </div>
                                      <div className="mt-1 rounded bg-white/80 px-1 text-center text-xs font-semibold">
                                        {player.name.split(" ")[0]}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Defense zone */}
                            <div className="absolute top-0 right-0 flex h-full w-1/2 flex-col">
                              <div className="py-2 text-center font-semibold bg-green-200">
                                <div className="flex items-center justify-center gap-1">
                                  <Shield className="h-4 w-4" /> Defense Zone
                                </div>
                              </div>

                              {/* Korf (basket) */}
                              <div className="absolute top-1/2 left-3/4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400">
                                <div className="h-4 w-4 rounded-full bg-white"></div>
                              </div>

                              {/* Defense players */}
                              <div className="relative flex-1 p-4">
                                {getDefensePlayers().map((player, index) => {
                                  // Position players in a square
                                  const positions = [
                                    { top: "20%", left: "20%" }, // Top-left
                                    { top: "20%", left: "60%" }, // Top-right
                                    { top: "70%", left: "20%" }, // Bottom-left
                                    { top: "70%", left: "60%" }, // Bottom-right
                                  ]

                                  return (
                                    <div
                                      key={player.id}
                                      className="absolute cursor-pointer"
                                      style={{
                                        top: positions[index].top,
                                        left: positions[index].left,
                                      }}
                                      onClick={() => handlePlayerClick(player)}
                                    >
                                      <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                          player.gender === "male" ? "bg-blue-400" : "bg-pink-400"
                                        } font-bold text-white`}
                                      >
                                        {player.name.charAt(0)}
                                      </div>
                                      <div className="mt-1 rounded bg-white/80 px-1 text-center text-xs font-semibold">
                                        {player.name.split(" ")[0]}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Substitutes bench */}
                          <div className="mt-4">
                            <h3 className="mb-2 font-semibold">Substitutes</h3>
                            <div className="flex flex-wrap gap-2">
                              {getSubstitutes().map((player) => (
                                <div
                                  key={player.id}
                                  className="cursor-pointer"
                                  onClick={() => handlePlayerClick(player)}
                                >
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${player.gender === "male" ? "bg-blue-400" : "bg-pink-400"} font-bold text-white`}
                                  >
                                    {player.name.charAt(0)}
                                  </div>
                                  <div className="mt-1 text-center text-xs font-semibold">
                                    {player.name.split(" ")[0]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="events">
                      <Card>
                        <CardHeader>
                          <CardTitle>Match Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <Button className="w-full" onClick={() => setEventDialogOpen(true)}>
                              Record New Event
                            </Button>
                          </div>

                          <ScrollArea className="h-[400px] rounded-md border p-4">
                            {events.length === 0 ? (
                              <div className="text-muted-foreground py-8 text-center">
                                No events recorded yet. Click on a player or "Record New Event" to get started.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {events.map((event) => {
                                  const player = players.find((p) => p.id === event.player_id)
                                  const action = actions.find((a) => a.id === event.action_id)

                                  return (
                                    <div key={event.id} className={`flex items-start gap-3 rounded-lg border p-3`}>
                                      <div
                                        className={`rounded-full p-2 ${getEventColor(event.event_type, event.success)}`}
                                      >
                                        {getEventIcon(event.event_type)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{event.time}</span>
                                          {action && (
                                            <Badge variant="outline">
                                              {action.code} - {action.description}
                                            </Badge>
                                          )}
                                          {player && (
                                            <Badge variant="outline" className="bg-blue-50">
                                              {player.name}
                                            </Badge>
                                          )}
                                          {event.success !== null && (
                                            <Badge
                                              variant={event.success ? "success" : "destructive"}
                                              className="ml-auto"
                                            >
                                              {event.success ? "Success" : "Failed"}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="mt-1 text-sm">{event.description}</p>
                                        <div className="mt-2 flex justify-end gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(event)}
                                            className="h-7 px-2"
                                          >
                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="stats">
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
                                          attackPossessions.length > 0
                                            ? Math.round((goalsScored / attackPossessions.length) * 100)
                                            : 0

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
                                              ({defensePossessions.length - goalsAllowed}/{defensePossessions.length}{" "}
                                              defenses)
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
                                        <p className="text-2xl font-bold">
                                          {possessions.filter((p) => p.type === "attack").length}
                                        </p>
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

                                      const attackEvents = events.filter((e) =>
                                        attackPlayers.some((p) => p.id === e.player_id),
                                      )

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

                                      const defenseEvents = events.filter((e) =>
                                        defensePlayers.some((p) => p.id === e.player_id),
                                      )

                                      const defensiveActions = defenseEvents.filter((e) => {
                                        const action = actions.find((a) => a.id === e.action_id)
                                        return action?.code === "D" || action?.code === "RG" || action?.code === "RP"
                                      })

                                      const successfulDefense = defensiveActions.filter((e) => e.success).length

                                      const efficiency =
                                        defensiveActions.length > 0
                                          ? Math.round((successfulDefense / defensiveActions.length) * 100)
                                          : 0

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
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Player Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {players.map((player) => {
                            // Calculate player stats from events
                            const playerEvents = events.filter((e) => e.player_id === player.id)

                            // Goals
                            const goals = playerEvents.filter((e) => {
                              const action = actions.find((a) => a.id === e.action_id)
                              return action?.code === "G" && e.success
                            }).length

                            // Shots
                            const shots = playerEvents.filter((e) => {
                              const action = actions.find((a) => a.id === e.action_id)
                              return (
                                action?.code === "LC" ||
                                action?.code === "LM" ||
                                action?.code === "LL" ||
                                action?.code === "P" ||
                                action?.code === "G"
                              )
                            }).length

                            // Offensive efficiency
                            const offensiveEfficiency = shots > 0 ? Math.round((goals / shots) * 100) : 0

                            // Turnovers
                            const turnovers = playerEvents.filter((e) => {
                              const action = actions.find((a) => a.id === e.action_id)
                              return action?.code === "MP" || action?.code === "Pa"
                            }).length

                            // Defensive statistics
                            const defensiveActions = playerEvents.filter((e) => {
                              const action = actions.find((a) => a.id === e.action_id)
                              return (
                                action?.code === "D" ||
                                ((action?.code === "RG" || action?.code === "RP") && player.position === "defense")
                              )
                            })

                            const successfulDefense = defensiveActions.filter((e) => e.success).length
                            const defensiveEfficiency =
                              defensiveActions.length > 0
                                ? Math.round((successfulDefense / defensiveActions.length) * 100)
                                : 0

                            return (
                              <div
                                key={player.id}
                                className="flex flex-col gap-2 rounded-lg border p-3"
                                onClick={() => handlePlayerClick(player)}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                      player.gender === "male" ? "bg-blue-100" : "bg-pink-100"
                                    }`}
                                  >
                                    {player.name.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{player.name}</div>
                                    <div className="text-muted-foreground text-xs">
                                      <span
                                        className={player.position === "attack" ? "text-green-600" : "text-blue-600"}
                                      >
                                        {player.position.charAt(0).toUpperCase() + player.position.slice(1)}
                                      </span>{" "}
                                      • {player.gender.charAt(0).toUpperCase() + player.gender.slice(1)}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">Goals</span>
                                    <span className="font-medium">{goals}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">Offensive Efficiency</span>
                                    <span className="font-medium">{offensiveEfficiency}%</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">Defensive Efficiency</span>
                                    <span className="font-medium">{defensiveEfficiency}%</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">Turnovers</span>
                                    <span className="font-medium">{turnovers}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="bg-green-50">
                                    {goals} G
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50">
                                    {shots} S
                                  </Badge>
                                  <Badge variant="outline" className="bg-red-50">
                                    {turnovers} T
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Event Dialog */}
              <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedPlayer ? `Record Event for ${selectedPlayer.name}` : "Record Match Event"}
                    </DialogTitle>
                    <DialogDescription>
                      Record a new action or event for the current game. Select the action type and whether it was
                      successful.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="action">Action</Label>
                      <Select
                        value={selectedActionId?.toString() || ""}
                        onValueChange={(value) => setSelectedActionId(value ? Number(value) : null)}
                      >
                        <SelectTrigger id="action">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          {actions.map((action) => (
                            <SelectItem key={action.id} value={action.id.toString()}>
                              {action.code} - {action.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <textarea
                        id="description"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add details about this event"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label htmlFor="success-toggle">Successful Action</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant={eventSuccess ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEventSuccess(true)}
                          className={eventSuccess ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          Success
                        </Button>
                        <Button
                          type="button"
                          variant={eventSuccess === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEventSuccess(false)}
                          className={eventSuccess === false ? "bg-red-500 hover:bg-red-600" : ""}
                        >
                          Failure
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Event Dialog */}
              <Dialog open={editEventDialogOpen} onOpenChange={setEditEventDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                    <DialogDescription>Update the details of this event.</DialogDescription>
                  </DialogHeader>
                  {currentEditEvent && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-action">Action</Label>
                        <Select
                          value={currentEditEvent.action_id?.toString() || ""}
                          onValueChange={(value) =>
                            setCurrentEditEvent({
                              ...currentEditEvent,
                              action_id: Number(value),
                            })
                          }
                        >
                          <SelectTrigger id="edit-action">
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            {actions.map((action) => (
                              <SelectItem key={action.id} value={action.id.toString()}>
                                {action.code} - {action.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <textarea
                          id="edit-description"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Add details about this event"
                          value={currentEditEvent.description || ""}
                          onChange={(e) =>
                            setCurrentEditEvent({
                              ...currentEditEvent,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="edit-success-toggle">Successful Action</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant={currentEditEvent.success ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setCurrentEditEvent({
                                ...currentEditEvent,
                                success: true,
                              })
                            }
                            className={currentEditEvent.success ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            Success
                          </Button>
                          <Button
                            type="button"
                            variant={currentEditEvent.success === false ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setCurrentEditEvent({
                                ...currentEditEvent,
                                success: false,
                              })
                            }
                            className={currentEditEvent.success === false ? "bg-red-500 hover:bg-red-600" : ""}
                          >
                            Failure
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditEventDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditEvent}>Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}

export default RecordGame

