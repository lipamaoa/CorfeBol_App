"use client"

import Navbar from "@/components/navbar"
import { EditEventDialog } from "@/components/record/EditEventDialog"
import { EventDialog } from "@/components/record/EventDialog"
import { EventLog } from "@/components/record/EventLog"
import { GameField } from "@/components/record/GameField"
import { GameHeader } from "@/components/record/GameHeader"
import { PlayerStats } from "@/components/record/PlayerStats"
import { TeamStats } from "@/components/record/TeamStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/layouts/app-layout"
import { Head, router, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"

// Import the services
import { createStat, deleteStat, updateStat } from "@/api/create-stat"
import { getGamePlayers, updatePlayerPosition as updatePlayerPositionAPI } from "@/api/player-api"
import { SubstitutionDialog } from "@/components/record/SubstitutionDialog"
import type { Stat, Team, Action, Player } from "@/types/index"
import { getCurrentEvent } from "@/api/create-event"
import { toast } from "react-hot-toast"

interface RecordGameProps {
  game?: {
    score_team_b: undefined
    score_team_a: undefined
    id: number
    teamA: Team
    teamB: Team
    date: string
    time: string
    location: string
  }
  players: Player[]
  stats: Stat[]
  actions: Action[]
}

const RecordGame = ({ game, players: initialPlayers, stats: initialStats, actions }: RecordGameProps) => {
  // ==============================
  //  Main States
  // ==============================
  const [matchTime, setMatchTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [period, setPeriod] = useState(1)
  const [events, setEvents] = useState<Stat[]>(initialStats || [])
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)

  const [teamName, setTeamName] = useState(game?.teamA?.name || "Our Team")
  const [teamALogo, setTeamALogo] = useState(game?.teamA?.logo_url || null)
  const [teamBLogo, setTeamBLogo] = useState(game?.teamB?.logo_url || null)
  const [opponentName, setOpponentName] = useState(game?.teamB?.name || "Opponent Team")

  // Filter players to only our team
  const [players, setPlayers] = useState<Player[]>(initialPlayers?.filter((p) => p.team_id === game?.teamA?.id) || [])

  // For toggling the "Field View" / "Event Log" / "Stats"
  const [activeTab, setActiveTab] = useState("field")

  // ==============================
  //  Event Dialog States
  // ==============================
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  // Observação: O *actionId* não é mais armazenado no pai
  // (opcional: se quiser armazenar, tudo bem, mas não usaremos para handleAddEvent)

  const [eventSuccess, setEventSuccess] = useState(true)
  const [eventDescription, setEventDescription] = useState("")

  // ==============================
  //  Edit Event Dialog
  // ==============================
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false)
  const [currentEditEvent, setCurrentEditEvent] = useState<Stat | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ==============================
  //  Substitution Dialog States
  // ==============================
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [subDialogPlayer, setSubDialogPlayer] = useState<Player | null>(null)

  // ==============================
  //  Phase Event State
  // ==============================
  const [currentPhaseEvent, setCurrentPhaseEvent] = useState<any>(null)

  // Mapeamento local de índices de posição
  const [positionIndices, setPositionIndices] = useState<{ [key: number]: number }>({})

  // ==============================
  //  Timer Logic
  // ==============================
  useEffect(() => {
    const savedTime = localStorage.getItem(`game_${game?.id}_time`)
    if (savedTime && matchTime === 0) {
      setMatchTime(Number.parseInt(savedTime, 10))
    }

    let interval: ReturnType<typeof setInterval> | null = null
    if (isRunning) {
      interval = setInterval(() => {
        setMatchTime((prevTime) => {
          const newTime = prevTime + 1
          localStorage.setItem(`game_${game?.id}_time`, newTime.toString())
          return newTime
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, game?.id, matchTime])

  // ============ Period Persistence ============
  useEffect(() => {
    const savedPeriod = localStorage.getItem(`game_${game?.id}_period`)
    if (savedPeriod && period === 1) {
      setPeriod(Number.parseInt(savedPeriod, 10))
    }
  }, [game?.id, period])

  // ==============================
  //  Initialize Score from Game
  // ==============================
  useEffect(() => {
    if (game) {
      if (game.score_team_a !== undefined && game.score_team_a !== null) {
        setScore(game.score_team_a)
      }
      if (game.score_team_b !== undefined && game.score_team_b !== null) {
        setOpponentScore(game.score_team_b)
      }
    }
  }, [game])

  // ==============================
  //  Initialize Score from Past Events
  // ==============================
  useEffect(() => {
    if (initialStats && initialStats.length > 0) {
      const goalEvents = initialStats.filter((e) => {
        const action = actions.find((a) => a.id === e.action_id)
        return action?.code === "G" && e.success
      })
      setScore(goalEvents.length)
    }
  }, [initialStats, actions])

  // ==============================
  //  Score Persistence
  // ==============================
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

  // ============ Position Indices Persistence ============
  useEffect(() => {
    const savedPositionIndices = localStorage.getItem(`game_${game?.id}_position_indices`)
    if (savedPositionIndices) {
      try {
        const indices = JSON.parse(savedPositionIndices)
        setPositionIndices(indices)
      } catch (e) {
        console.error("Erro ao carregar índices de posição:", e)
      }
    }
  }, [game?.id])

  // Initialize local positionIndex for the initial players
  useEffect(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      const initialIndices: { [key: number]: number } = {}

      // Attack
      const attackPlayers = initialPlayers.filter((p) => p.position === "attack")
      attackPlayers.forEach((player, index) => {
        if (index < 4) {
          initialIndices[player.id] = index
        }
      })

      // Defense
      const defensePlayers = initialPlayers.filter((p) => p.position === "defense")
      defensePlayers.forEach((player, index) => {
        if (index < 4) {
          initialIndices[player.id] = index
        }
      })

      setPositionIndices((prev) => ({
        ...prev,
        ...initialIndices,
      }))
    }
  }, [initialPlayers])

  // Save positionIndices if changed
  useEffect(() => {
    localStorage.setItem(`game_${game?.id}_position_indices`, JSON.stringify(positionIndices))
  }, [positionIndices, game?.id])

  // Sync positionIndices every 5s
  const syncPositionIndices = () => {
    const currentIndices: { [key: number]: number } = {}

    // Attack
    players
      .filter((p) => p.position === "attack")
      .forEach((player) => {
        if (player.positionIndex !== undefined) {
          currentIndices[player.id] = player.positionIndex
        }
      })

    // Defense
    players
      .filter((p) => p.position === "defense")
      .forEach((player) => {
        if (player.positionIndex !== undefined) {
          currentIndices[player.id] = player.positionIndex
        }
      })

    setPositionIndices(currentIndices)
    localStorage.setItem(`game_${game?.id}_position_indices`, JSON.stringify(currentIndices))
  }

  useEffect(() => {
    const interval = setInterval(syncPositionIndices, 5000)
    return () => clearInterval(interval)
  }, [players])

  // ============ Timer Helpers ============
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setMatchTime(0)
    setIsRunning(false)
  }

  // ============ Period Change ============
  const changePeriod = () => {
    const newPeriod = period + 1
    setPeriod(newPeriod)
    localStorage.setItem(`game_${game?.id}_period`, newPeriod.toString())

    // Record "period_change"
    const newEvent: Stat = {
      game_id: game?.id ?? 0,
      player_id: null,
      action_id: actions.find((a) => a.code === "O")?.id || 0,
      success: null,
      event_id: currentPhaseEvent?.id || "1", // Usar o ID do evento atual ou fallback para "1"
      event_type: "period_change",
      description: `Period ${newPeriod} started`,
      time: formatTime(matchTime),
    }
    recordEvent(newEvent)
  }

  // ============ Setup Mode vs Game Mode ============
  const [positionedPlayers, setPositionedPlayers] = useState<Set<number>>(new Set())
  const [initialSetupComplete, setInitialSetupComplete] = useState(false)

  const toggleSetupMode = () => {
    if (initialSetupComplete) {
      setInitialSetupComplete(false)
      localStorage.removeItem(`game_${game?.id}_setup_complete`)
    } else {
      setInitialSetupComplete(true)
      localStorage.setItem(`game_${game?.id}_setup_complete`, "true")
    }
  }

  const completeInitialSetup = () => {
    setInitialSetupComplete(true)
    localStorage.setItem(`game_${game?.id}_setup_complete`, "true")
  }

  useEffect(() => {
    const setupComplete = localStorage.getItem(`game_${game?.id}_setup_complete`) === "true"
    if (setupComplete) {
      setInitialSetupComplete(true)
    }
  }, [game?.id])

  // ============ updatePlayerPosition (Backend + local) ============
  const updatePlayerPosition = (playerId: number, zone: "attack" | "defense" | "bench", positionIndex?: number) => {
    // immediate local update
    setPlayers((prev) => {
      const updated = [...prev]
      const i = updated.findIndex((p) => p.id === playerId)
      if (i === -1) return prev

      updated[i] = {
        ...updated[i],
        position: zone,
        positionIndex: zone !== "bench" ? positionIndex : undefined,
        zone,
      }
      return updated
    })

    // also update local indices
    if (zone !== "bench" && positionIndex !== undefined) {
      setPositionIndices((prev) => {
        const newIndices = { ...prev, [playerId]: positionIndex }
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

    // If in setup or bench => also update server
    const hasBeenPositionedBefore = positionedPlayers.has(playerId)
    if (!initialSetupComplete || zone === "bench") {
      if ((zone === "attack" || zone === "defense") && !hasBeenPositionedBefore) {
        setPositionedPlayers((prev) => {
          const newSet = new Set(prev)
          newSet.add(playerId)
          return newSet
        })
      }
      updatePlayerPositionAPI(game?.id, playerId, zone).catch((error) => {
        alert("Erro ao atualizar jogador no servidor.")
      })
    }
  }

  // ============ updateLocalPlayerPosition (Local only) ============
  const updateLocalPlayerPosition = (
    playerId: number,
    zone: "attack" | "defense" | "bench",
    positionIndex?: number,
  ) => {
    setPlayers((prev) => {
      const updated = [...prev]
      const i = updated.findIndex((p) => p.id === playerId)
      if (i === -1) return prev

      updated[i] = {
        ...updated[i],
        position: zone,
        positionIndex: zone !== "bench" ? positionIndex : undefined,
        zone,
      }
      return updated
    })

    if (zone !== "bench" && positionIndex !== undefined) {
      setPositionIndices((prev) => {
        const newIndices = { ...prev, [playerId]: positionIndex }
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
  }

  // ============ Load players from server on mount ============
  const loadGamePlayers = () => {
    if (!game?.id) return
    getGamePlayers(game.id)
      .then((data) => {
        const newPositioned = new Set<number>()
        data.forEach((p: Player) => {
          if (p.position === "attack" || p.position === "defense") {
            newPositioned.add(p.id)
          }
        })
        setPositionedPlayers(newPositioned)

        const saved = localStorage.getItem(`game_${game.id}_position_indices`)
        let indices = positionIndices
        if (saved) {
          try {
            indices = JSON.parse(saved)
            setPositionIndices(indices)
          } catch (e) {
            console.error("Erro ao carregar índices:", e)
          }
        }

        // apply positionIndex
        const playersWithIndices = data.map((p: Player) => {
          if (p.position !== "bench" && indices[p.id] !== undefined) {
            return { ...p, positionIndex: indices[p.id] }
          }
          return p
        })

        setPlayers(playersWithIndices)
      })
      .catch((error) => {
        console.error("Failed to load game players:", error)
      })
  }

  // ============ Verificar fase ativa ao carregar o componente ============
  const fetchCurrentPhase = async () => {
    if (!game?.id) return

    try {
      const response = await getCurrentEvent(game.id)
      console.log("Current phase event:", response)
      if (response.success) {
        setCurrentPhaseEvent(response.event)
      }
    } catch (error) {
      console.error("Erro ao buscar fase atual:", error)
    }
  }

  useEffect(() => {
    loadGamePlayers()
    // Verificar se há uma fase ativa ao carregar o componente
    if (game?.id) {
      fetchCurrentPhase()
    }
  }, [game?.id])

  // ============ recordEvent (createStat => backend) ============
  const recordEvent = async (eventData: Stat) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    const eventToSend = { ...eventData }
    console.log("Sending event data:", eventToSend)

    // Temp event for immediate UI feedback
    const tempEvent: Stat = {
      ...eventToSend,
      id: -Date.now(),
      created_at: new Date().toISOString(),
    }
    setEvents((prev) => [tempEvent, ...prev])

    try {
      const result = await createStat(eventToSend)
      if (result.success && result.event) {
        const newEvent = result.event
        setEvents((prev) => prev.map((ev) => (ev.id === tempEvent.id ? newEvent : ev)))

        // if it's a successful goal => increment score
        const action = actions.find((a) => a.id === newEvent.action_id)
        if (action?.code === "G" && newEvent.success) {
          setScore((prevScore) => {
            const newScore = prevScore + 1
            localStorage.setItem(`game_${game?.id}_score`, newScore.toString())
            return newScore
          })
        }
      } else {
        alert(`Failed to save event: ${result.message || "Unknown error"}`)
        setEvents((prev) => prev.filter((ev) => ev.id !== tempEvent.id))
      }
    } catch (error) {
      alert(`Failed to save event: ${error instanceof Error ? error.message : "Unknown error"}`)
      setEvents((prev) => prev.filter((ev) => ev.id !== tempEvent.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============ handleEditEvent / handleDeleteEvent ============
  const handleEditEvent = async () => {
    if (!currentEditEvent || isSubmitting) return
    setIsSubmitting(true)

    try {
      const result = await updateStat(currentEditEvent.id, currentEditEvent)
      if (result.success && result.event) {
        setEvents((prev) => prev.map((ev) => (ev.id === currentEditEvent.id ? result.event : ev)))
        setEditEventDialogOpen(false)
        setCurrentEditEvent(null)
      } else {
        alert(`Failed to update event: ${result.message || "Unknown error"}`)
      }
    } catch (error) {
      alert(`Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    setIsSubmitting(true)

    try {
      const result = await deleteStat(eventId as number)
      if (result.success) {
        setEvents((prev) => prev.filter((ev) => ev.id !== eventId))
      } else {
        alert(`Failed to delete event: ${result.message || "Unknown error"}`)
      }
    } catch (error) {
      alert(`Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (ev: Stat) => {
    setCurrentEditEvent(ev)
    setEditEventDialogOpen(true)
  }

  // ===================================================
  // =============== handleAddEvent (Opção A) ===========
  // ===================================================
  /**
   * handleAddEvent recebe actionId como parâmetro,
   * em vez de depender de selectedActionId do state
   */
  const handleAddEvent = async (actionId: number) => {
    if (!selectedPlayer) {
      alert("Please select a player first.")
      return
    }

    const action = actions.find((a) => a.id === actionId)
    if (!action) {
      alert("Invalid action selected.")
      return
    }

    // Se for Substitution
    if (action.code === "S") {
      setSubDialogPlayer(selectedPlayer)
      setShowSubDialog(true)
      setEventDialogOpen(false)
      // limpar states do EventDialog
      setEventSuccess(true)
      setEventDescription("")
      return
    }

    // Se for Position Switch
    if (action.code === "PS") {
      switchAttackDefense()
      setEventDialogOpen(false)
      setEventSuccess(true)
      setSelectedPlayer(null)
      setEventDescription("")
      return
    }

    try {
      // Verificar se há um evento ativo, se não, buscar novamente
      if (!currentPhaseEvent) {
        await fetchCurrentPhase()
      }

      // Se ainda não houver evento ativo, alertar o usuário
      if (!currentPhaseEvent) {
        alert("Nenhum evento ativo encontrado. Por favor, inicie um evento de ataque ou defesa primeiro.")
        setEventDialogOpen(false)
        return
      }

      // Caso padrão => evento normal
      const description = eventDescription || `${selectedPlayer.name} - ${action.description || "Action"}`

      const eventData: Stat = {
        game_id: game?.id,
        player_id: selectedPlayer.id,
        action_id: actionId,
        success: eventSuccess,
        event_id: currentPhaseEvent.id, // Usar o ID do evento atual
        event_type: "player_action",
        description,
        time: formatTime(matchTime),
      }

      recordEvent(eventData)
      setEventDialogOpen(false)

      // reset
      setEventSuccess(true)
      setSelectedPlayer(null)
      setEventDescription("")
    } catch (error) {
      console.error("Erro ao adicionar evento:", error)
      toast.error("Erro ao adicionar evento. Verifique se há um evento ativo.")
    }
  }

  // ============ handleSubstitutionComplete ============
  const handleSubstitutionComplete = (incoming: Player) => {
    if (!subDialogPlayer) return
    const outgoing = subDialogPlayer

    const oldZone = outgoing.position
    const oldIndex = outgoing.positionIndex

    if (incoming.position !== "bench") {
      // swap
      const incZone = incoming.position
      const incIndex = incoming.positionIndex

      updateLocalPlayerPosition(outgoing.id, incZone, incIndex)
      updateLocalPlayerPosition(incoming.id, oldZone, oldIndex)

      const eventData: Stat = {
        game_id: game?.id,
        player_id: outgoing.id,
        action_id: actions.find((a) => a.code === "S")?.id || 0,
        success: true,
        event_id: currentPhaseEvent?.id || "1", // Usar o ID do evento atual ou fallback para "1"
        event_type: "player_action",
        description: `${outgoing.name} substituted by ${incoming.name} (${oldZone} ↔ ${incZone})`,
        time: formatTime(matchTime),
      }
      recordEvent(eventData)
    } else {
      // bench -> field
      updateLocalPlayerPosition(outgoing.id, "bench", undefined)
      updateLocalPlayerPosition(incoming.id, oldZone, oldIndex)

      const eventData: Stat = {
        game_id: game?.id,
        player_id: outgoing.id,
        action_id: actions.find((a) => a.code === "S")?.id || 0,
        success: true,
        event_id: currentPhaseEvent?.id || "1", // Usar o ID do evento atual ou fallback para "1"
        event_type: "player_action",
        description: `${outgoing.name} substituted by ${incoming.name} (${oldZone})`,
        time: formatTime(matchTime),
      }
      recordEvent(eventData)
    }

    setShowSubDialog(false)
    setSubDialogPlayer(null)
    setEventDialogOpen(false)
  }

  // ============ Partition players (for GameField usage) ============
  function getAttackPlayers(): Player[] {
    return players
      .filter((p) => p.position === "attack")
      .map((p) => ({
        ...p,
        positionIndex: positionIndices[p.id],
      }))
  }

  function getDefensePlayers(): Player[] {
    return players
      .filter((p) => p.position === "defense")
      .map((p) => ({
        ...p,
        positionIndex: positionIndices[p.id],
      }))
  }

  function getSubstitutes(): Player[] {
    return players.filter((p) => p.position === "bench" || !p.position)
  }

  // ============ Switch Attack/Defense in Bulk ============
  const switchAttackDefense = async() => {
    const attackPlayers = getAttackPlayers()
    const defensePlayers = getDefensePlayers()

    const updated = players.map((pl) => {
      if (attackPlayers.some((ap) => ap.id === pl.id)) {
        return { ...pl, position: "defense", zone: "defense" }
      }
      if (defensePlayers.some((dp) => dp.id === pl.id)) {
        return { ...pl, position: "attack", zone: "attack" }
      }
      return pl
    })

    setPlayers(updated)


    // Se existe uma fase ativa, finalize-a e registre no log
    if (currentPhaseEvent) {
      try {
        // Registrar evento de finalização no log
        const endEventData: Stat = {
          game_id: game?.id,
          player_id: null,
          action_id: actions.find((a) => a.code === "O")?.id || 0,
          success: null,
          event_id: currentPhaseEvent.id,
          event_type: "phase_end",
          description: `Fase de ${currentPhaseEvent.name === "attack" ? "ataque" : "defesa"} finalizada (troca de posições)`,
          time: formatTime(matchTime),
        }
        await recordEvent(endEventData)
      } catch (error) {
        console.error("Erro ao registrar finalização de fase:", error)
      }
    }

    // gravar no backend
    const playerId =
      attackPlayers.length > 0
        ? attackPlayers[0].id
        : defensePlayers.length > 0
          ? defensePlayers[0].id
          : players.length > 0
            ? players[0].id
            : 1

    const eventData: Stat = {
      game_id: game?.id,
      player_id: playerId,
      action_id: actions.find((a) => a.code === "PS")?.id || 0,
      success: true,
      event_id: currentPhaseEvent?.id || "1", // Usar o ID do evento atual ou fallback para "1"
      event_type: "position_switch",
      description: "Position switch: attack and defense",
      time: formatTime(matchTime),
    }
    recordEvent(eventData)
  }

  // ============ End Game ============
  function endGame() {
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
          localStorage.removeItem(`game_${game?.id}_time`)
          localStorage.removeItem(`game_${game?.id}_period`)
          localStorage.removeItem(`game_${game?.id}_score`)
          localStorage.removeItem(`game_${game?.id}_opponent_score`)
        },
        onError: (errors) => {
          alert(`Falha ao encerrar o jogo: ${errors.message || "Erro desconhecido"}`)
        },
      },
    )
  }

  // ============ Opponent Score ============
  function incrementOpponentScore() {
    setOpponentScore((prev) => {
      const newScore = prev + 1
      localStorage.setItem(`game_${game?.id}_opponent_score`, newScore.toString())
      return newScore
    })
  }

  function decrementOpponentScore() {
    setOpponentScore((prev) => {
      const newScore = Math.max(0, prev - 1)
      localStorage.setItem(`game_${game?.id}_opponent_score`, newScore.toString())
      return newScore
    })
  }

  // Se o GameField/child atualiza localmente a posição de um player
  function onPlayerPositionUpdated(updatedPlayer: Player) {
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)))
  }

  // Build the game context to pass down
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
    currentPhaseEvent, // Adicione o currentPhaseEvent ao contexto

    formatTime,
    toggleTimer,
    resetTimer,
    changePeriod,
    switchAttackDefense,
    endGame,
    incrementOpponentScore,
    decrementOpponentScore,

    // partition
    getAttackPlayers,
    getDefensePlayers,
    getSubstitutes,

    // events
    openEditDialog,
    handleDeleteEvent,
    recordEvent, // Adicione a função recordEvent ao contexto

    // positions
    updatePlayerPosition,
    updateLocalPlayerPosition,
    positionedPlayers,
    onPlayerPositionUpdated,
    initialSetupComplete,
    toggleSetupMode,
    completeInitialSetup,

    // for the field, if you want a click => open event dialog
    handlePlayerClick: (player: Player) => {
      setSelectedPlayer(player)
      setEventDialogOpen(true)
    },

    onPhaseChange: () => {
      fetchCurrentPhase()
    },
  }

  const { route } = usePage().props

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
                setSelectedPlayer={setSelectedPlayer}
                // Removemos o selectedActionId, pois passamos o actionId direto
                // Se quiser manter, tudo bem, mas não é mais essencial pro handleAddEvent
                selectedActionId={null}
                setSelectedActionId={() => {}}
                eventSuccess={eventSuccess}
                setEventSuccess={setEventSuccess}
                eventDescription={eventDescription}
                setEventDescription={setEventDescription}
                // Passamos handleAddEvent mas agora com "actionId"
                handleAddEvent={(actionId) => handleAddEvent(actionId)}
                actions={actions}
                players={players}
              />

              {/* SubstitutionDialog */}
              <SubstitutionDialog
                open={showSubDialog}
                onOpenChange={setShowSubDialog}
                selectedPlayer={subDialogPlayer}
                players={players}
                onComplete={handleSubstitutionComplete}
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

