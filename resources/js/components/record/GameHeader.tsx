"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play, RotateCcw, ArrowLeftRight } from "lucide-react"
import type { Game, Possession } from "@/pages/games/record"

interface GameHeaderProps {
  gameContext: {
    game: Game
    matchTime: number
    isRunning: boolean
    period: number
    score: number
    opponentScore: number
    teamName: string
    teamALogo: string | null
    teamBLogo: string | null
    opponentName: string
    currentPossession: Possession
    formatTime: (seconds: number) => string
    toggleTimer: () => void
    resetTimer: () => void
    changePeriod: () => void
    switchAttackDefense: () => void
    startNewPossession: (type: "attack" | "defense") => void
    endCurrentPossession: (reason: string) => void
    endGame: () => void
    incrementOpponentScore: () => void
    decrementOpponentScore: () => void
  }
}

export function GameHeader({ gameContext }: GameHeaderProps) {
  const {
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
    startNewPossession,
    endCurrentPossession,
    endGame,
    incrementOpponentScore,
    decrementOpponentScore,
  } = gameContext

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
  )
}

