"use client"

import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { format, parseISO } from "date-fns"
import { ArrowRight, Calendar, Clock, MapPin, Trophy, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import {Game} from "@/types/index"



interface GamesProps {
  games: Game[]
  status?: string
}

export default function Games({ games: initialGames, status = "all" }: GamesProps) {
  const [activeTab, setActiveTab] = useState(status)
  const [games, setGames] = useState<Game[]>(initialGames)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredGames = activeTab === "all" ? games : games.filter((game) => game.status === activeTab)

  // Function to fetch games based on status
  const fetchGames = async (statusFilter: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/games?status=${statusFilter}`, {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching games: ${response.status}`)
      }

      const data = await response.json()

      // Detailed logging to debug team data
      console.log("Fetched games data:", data)
      if (data.length > 0) {
        console.log("First game:", data[0])
        console.log("Team A:", data[0].team_a.name)
        console.log("Team B:", data[0].team_b.name)
      }

      setGames(data)

      // Update URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.set("status", statusFilter)
      window.history.pushState({ path: url.toString() }, "", url.toString())
    } catch (err) {
      console.error("Failed to fetch games:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching games")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    fetchGames(value)
  }

  const handleRecordGame = (gameId: number) => {
    // Navigate to the record game page
    window.location.href = `/games/${gameId}/record/`
  }

  const navigateTo = (url: string) => {
    // Simple navigation function
    window.location.href = url
  }

  // Effect to update games when initial props change
  useEffect(() => {
    console.log("Initial games:", initialGames)
    if (initialGames.length > 0) {
      console.log("First initial game:", initialGames[0])
      console.log("Initial Team A:", initialGames[0].teamA.name
      )
      console.log("Initial Team B:", initialGames[0].teamB.name)
    }
    setGames(initialGames)
  }, [initialGames])

 

  return (
    <>
      <Navbar />
      <AppLayout breadcrumbs={[{ title: "Games", href: "/games" }]}>
        <Head title="Games" />

        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Games</h1>
                <p className="text-gray-500">View and manage your korfball games</p>
              </div>
              <Button onClick={() => navigateTo("/games/create")}>Schedule New Game</Button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Games</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredGames.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <p className="text-gray-500">No games found</p>
                      <Button className="mt-4" onClick={() => navigateTo("/games/create")}>
                        Schedule a Game
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGames.map((game) => (
                      <Card key={game.id} className="overflow-hidden">
                        <CardHeader className="bg-blue-50 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                            {game.teamA.name} vs {game.teamB.name}
                            </CardTitle>
                            <Badge
                              variant={
                                game.status === "complete"
                                  ? "success"
                                  : game.status === "in_progress"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {game.status === "scheduled"
                                ? "Scheduled"
                                : game.status === "in_progress"
                                  ? "In Progress"
                                  : "Completed"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                              {format(parseISO(game.date), "MMMM d, yyyy")}
                            </div>
                            {game.time && (
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                {game.time}
                              </div>
                            )}
                            {game.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                {game.location}
                              </div>
                            )}

                            {game.status === "complete" && (
                              <div className="mt-2 flex items-center justify-center rounded-md bg-gray-50 py-2">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-4">
                                    <div className="text-xl font-bold">{game.score_team_a || 0}</div>
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    <div className="text-xl font-bold">{game.score_team_b || 0}</div>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">Final Score</div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                              {game.status === "scheduled" && (
                                <Button onClick={() => handleRecordGame(game.id)} className="w-full">
                                  Record Game <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              )}

                              {game.status === "in_progress" && (
                                <Button onClick={() => handleRecordGame(game.id)} className="w-full">
                                  Continue Recording <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              )}

                              {game.status === "complete" && (
                                <Button
                                  variant="outline"
                                  onClick={() => navigateTo(`/stats?game_id=${game.id}`)}
                                  className="w-full"
                                >
                                  View Statistics
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Footer />
      </AppLayout>
    </>
  )
}

