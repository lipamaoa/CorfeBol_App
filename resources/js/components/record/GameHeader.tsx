"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play, ArrowLeftRight, Flag, Circle, Shield, Target } from "lucide-react"
// import type { Game, Possession } from "@/pages/games/record"
import type { Game, Player, Action, Stat, Event } from "@/types/index"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEvent } from "@/api/create-event"

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
    } = gameContext

    const [startType, setStartType] = useState<"attack" | "defense">("attack")
    const [gameStarted, setGameStarted] = useState(false)
    const [currentPossession, setCurrentPossession] = useState<{ type: "attack" | "defense" }>({ type: "attack" })

    // Function to start the game with the selected possession type
    const handleStartGame = async () => {
        if (!gameStarted) {
            if (!isRunning) toggleTimer()



            // Get a valid player ID - use the first player of the appropriate position
            const positionPlayers = startType === "attack" ? getAttackPlayers() : getDefensePlayers()
            const playerId = positionPlayers.length > 0 ? positionPlayers[0].id : players.length > 0 ? players[0].id : 1

            // First create the event
            const eventResponse = await createEvent({
                name: `Game Start - ${startType}`,
                player_id: playerId
            });

            // Get the created event ID
            const eventId = eventResponse.event.id;

            // Create a game start event before starting the possession
            const gameStartAction = actions.find((a) => a.code === "O")?.id || 0

            setGameStarted(true)

            // Create and record the game start event
            const gameStartEvent = {
                game_id: game?.id,
                player_id: playerId,
                action_id: gameStartAction,
                event_id: eventId,
                success: true,
                event_type: "game_start",
                description: `Game started with ${startType}`,
                time: formatTime(matchTime),
            }

            recordEvent(gameStartEvent)
            startNewPossession(startType)
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
                                <Button variant="primary" size="sm" onClick={handleStartGame}>
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
                                            Current: {currentPossession.type === "attack" ? "Attack" : "Defense"}
                                        </span>
                                    </div>

                                    {/* After 2 baskets, switch positions */}
                                    <Button variant="secondary" size="sm" onClick={switchAttackDefense} className="mt-2 w-full">
                                        <ArrowLeftRight className="mr-1 h-4 w-4" />
                                        Switch Attack/Defense
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={changePeriod} className="mt-1">
                                        Next Period
                                    </Button>
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

