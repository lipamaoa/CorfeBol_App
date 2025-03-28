"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play, ArrowLeftRight, Shield, Target } from "lucide-react"
import type { Game, Player, Action, Stat, Event } from "@/types/index"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEvent, endEvent, getCurrentEvent } from "@/api/create-event"
import { toast } from "react-hot-toast"

interface Possession {
  type: "attack" | "defense"
}

interface GameHeaderProps {
  gameContext: {
    game?: Game | null
    matchTime: number
    isRunning: boolean
    period: number
    score: number
    opponentScore: number
    teamName: string
    teamALogo: string | null
    teamBLogo: string | null
    opponentName: string
    currentPossession?: Possession
    formatTime: (seconds: number) => string
    toggleTimer: () => void
    resetTimer: () => void
    changePeriod: () => void
    switchAttackDefense: () => void
    startNewPossession?: (type: "attack" | "defense") => void
    endCurrentPossession?: (reason: string) => void
    endGame: () => void
    incrementOpponentScore: () => void
    decrementOpponentScore: () => void
    actions: Action[]
    players: Player[]
    recordEvent: (eventData: Stat) => Promise<void>
    getAttackPlayers: () => Player[]
    getDefensePlayers: () => Player[]
    recordGameEvent: (eventData: Omit<Event, "id" | "created_at" | "updated_at">) => Promise<void>
    onPhaseChange?: () => void 
  }
}

export function GameHeader({ gameContext }: GameHeaderProps) {
  const {
    game,
    actions,
    players,
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
    switchAttackDefense,
    endGame,
    startNewPossession,
    incrementOpponentScore,
    decrementOpponentScore,
    getAttackPlayers,
    getDefensePlayers,
    recordEvent,
    onPhaseChange,
  } = gameContext

  const [startType, setStartType] = useState<"attack" | "defense">("attack")
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPossession, setCurrentPossession] = useState<{ type: "attack" | "defense" }>({ type: "attack" })

  // Novo estado para controlar o evento de fase atual
  const [currentPhaseEvent, setCurrentPhaseEvent] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Verificar se há uma fase ativa ao carregar o componente
  useEffect(() => {
    if (game?.id) {
      fetchCurrentPhase()
    }
  }, [game?.id])

  // Função para buscar a fase atual
  const fetchCurrentPhase = async () => {
    if (!game?.id) return

    try {
      const response = await getCurrentEvent(game.id)
      if (response.success) {
        setCurrentPhaseEvent(response.event)
        setGameStarted(true)
        // Atualizar a posse atual com base no tipo do evento
        if (response.event.name === "attack") {
          setCurrentPossession({ type: "attack" })
        } else if (response.event.name === "defense") {
          setCurrentPossession({ type: "defense" })
        }
      }
    } catch (error) {
      console.error("Erro ao buscar fase atual:", error)
    }
  }

  // Função para obter um player_id válido com base no tipo de fase
  const getValidPlayerId = (phaseType: "attack" | "defense"): number => {
    // Obter jogadores da posição apropriada
    const positionPlayers = phaseType === "attack" ? getAttackPlayers() : getDefensePlayers()

    // Se temos jogadores na posição, use o primeiro
    if (positionPlayers.length > 0) {
      return positionPlayers[0].id
    }

    // Caso contrário, use qualquer jogador disponível
    if (players.length > 0) {
      return players[0].id
    }

    // Se não temos jogadores, retorne um ID padrão (isso deve ser evitado)
    console.warn("Nenhum jogador encontrado para associar ao evento")
    return 1 // ID padrão, mas isso deve ser evitado
  }

  // Função para iniciar uma nova fase
  const startPhase = async (phaseName: "attack" | "defense") => {
    if (!game?.id) {
      toast.error("ID do jogo não encontrado")
      return
    }

    setLoading(true)
    try {
      // Se já existe uma fase ativa, finalize-a primeiro
      if (currentPhaseEvent) {
        await endEvent(currentPhaseEvent.id)


        // Registrar evento de finalização no log
        const endEventData: Stat = {
          game_id: game.id,
          player_id: null,
          action_id: actions.find((a) => a.code === "O")?.id || 0, // Usar código "O" para outros eventos
          success: null,
          event_id: currentPhaseEvent.id,
          event_type: "phase_end",
          description: `Fase de ${currentPhaseEvent.name === "attack" ? "ataque" : "defesa"} finalizada`,
          time: formatTime(matchTime),
        }
        await recordEvent(endEventData)
      
      }

      // Obter um player_id válido
      const playerId = getValidPlayerId(phaseName)

      const response = await createEvent({
        name: phaseName,
        game_id: game.id,
        player_id: playerId, 
      })

      console.log("Hello", response)

      if (response.success) {
        setCurrentPhaseEvent(response.event)
        setCurrentPossession({ type: phaseName })
        toast.success(`Fase de ${phaseName === "attack" ? "ataque" : "defesa"} iniciada!`)

        // Se o jogo ainda não começou, marcar como iniciado
        if (!gameStarted) {
          setGameStarted(true)
          if (!isRunning) toggleTimer()
        }

        const startEventData: Stat = {
          game_id: game.id,
          player_id: null,
          action_id: actions.find((a) => a.code === "O")?.id || 0, // Usar código "O" para outros eventos
          success: null,
          event_id: response.event.id,
          event_type: "phase_start",
          description: `Fase de ${phaseName === "attack" ? "ataque" : "defesa"} iniciada`,
          time: formatTime(matchTime),
        }
        await recordEvent(startEventData)

        if (gameContext.onPhaseChange) {
          gameContext.onPhaseChange()
        }
      }
    } catch (error) {
      console.error("Erro ao iniciar fase:", error)
      toast.error("Erro ao iniciar fase: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  // Função para finalizar a fase atual
  const endPhase = async () => {
    if (!currentPhaseEvent) return

    setLoading(true)
    try {
      const response = await endEvent(currentPhaseEvent.id)

      if (response.success) {

         // Registrar evento de finalização no log
         const endEventData: Stat = {
          game_id: game.id,
          player_id: null,
          action_id: actions.find((a) => a.code === "O")?.id || 0, // Usar código "O" para outros eventos
          success: null,
          event_id: currentPhaseEvent.id,
          event_type: "phase_end",
          description: `Fase de ${currentPhaseEvent.name === "attack" ? "ataque" : "defesa"} finalizada`,
          time: formatTime(matchTime),
        }
        await recordEvent(endEventData)

        setCurrentPhaseEvent(null)
        toast.success("Fase finalizada!")
      }

      if (gameContext.onPhaseChange) {
        gameContext.onPhaseChange()
      }
    } catch (error) {
      console.error("Erro ao finalizar fase:", error)
      toast.error("Erro ao finalizar fase")
    } finally {
      setLoading(false)
    }
  }

  // Function to start the game with the selected possession type
  const handleStartGame = async () => {
    if (!gameStarted) {
      await startPhase(startType)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>
              Korfball Match Recorder - {teamName} vs {opponentName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!gameStarted ? (
              <>
                <Select value={startType} onValueChange={(value) => setStartType(value as "attack" | "defense")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Start with" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attack">Start Attack</SelectItem>
                    <SelectItem value="defense">Start Defense</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="primary" size="sm" onClick={handleStartGame} disabled={loading}>
                  Start Game
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={toggleTimer}>
                  {isRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                  {isRunning ? "Pause" : "Resume"}
                </Button>
                <Button variant="outline" size="sm" onClick={resetTimer}>
                  Reset
                </Button>
                <Button variant="destructive" size="sm" onClick={endGame}>
                  End Game
                </Button>
              </>
            )}
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
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {gameStarted && (
                <>
                  <div className="w-full text-center mb-1">
                    <span className="px-2 py-1 bg-primary/10 rounded-md text-sm font-medium">
                      Current:{" "}
                      {currentPhaseEvent
                        ? currentPhaseEvent.name === "attack"
                          ? "Attack"
                          : "Defense"
                        : "No Active Phase"}
                    </span>
                  </div>

                  {/* Botões de controle de fase */}
                  {currentPhaseEvent ? (
                    <div className="flex flex-col w-full gap-2">
                      <Button onClick={endPhase} variant="default" size="sm" disabled={loading} className="w-full">
                        End {currentPhaseEvent.name === "attack" ? "Attack" : "Defense"}
                      </Button>
                      <div className="flex gap-2 w-full">
                        <Button variant="secondary" size="sm" onClick={switchAttackDefense} className="flex-1">
                          <ArrowLeftRight className="mr-1 h-4 w-4" />
                          Switch
                        </Button>
                        <Button variant="outline" size="sm" onClick={changePeriod} className="flex-1">
                          Next Period
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => startPhase("attack")}
                          variant="default"
                          size="sm"
                          disabled={loading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Target className="mr-1 h-4 w-4" />
                          Start Attack
                        </Button>
                        <Button
                          onClick={() => startPhase("defense")}
                          variant="default"
                          size="sm"
                          disabled={loading}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          <Shield className="mr-1 h-4 w-4" />
                          Start Defense
                        </Button>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button variant="secondary" size="sm" onClick={switchAttackDefense} className="flex-1">
                          <ArrowLeftRight className="mr-1 h-4 w-4" />
                          Switch
                        </Button>
                        <Button variant="outline" size="sm" onClick={changePeriod} className="flex-1">
                          Next Period
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
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
  )
}

