import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import PlayersCard from "@/components/dashboard/players-card"
import TeamsCard from "@/components/dashboard/teams-card"
import StatsCard from "@/components/dashboard/stats-card"
import GameStatsVisualizations from "@/components/dashboard/game-stats-visualizations"
import {
    Clock,
    MapPin,
    CalendarDays,
    ArrowRight,
    ClipboardList,
    Trophy,
    Users,
    Activity,
    TrendingUp,
} from "lucide-react"
import { Link } from "@inertiajs/react"
import Navbar from "@/components/navbar"
import { useEffect, useState } from "react"

export default function Dashboard({ nextGame, stats }) {
    // State variables for teams and players
    const [teams, setTeams] = useState([])
    const [players, setPlayers] = useState([])
    const [selectedTeamId, setSelectedTeamId] = useState(null)

    // Function to update teams
    const updateTeams = async () => {
        try {
            const response = await fetch("api/teams", {
                method: "GET",
            })

            if (!response.ok) {
                throw new Error("Error Teams Server: " + response.status)
            }

            const teamData = await response.json()
            setTeams(teamData)
        } catch (error) {
            console.error("Error fetching Teams:", error)
        }
    }

    // Function to update players
    const updatePlayers = async () => {
        try {
            const response = await fetch("api/players", {
                method: "GET",
            })

            if (!response.ok) {
                throw new Error("Error Players Server: " + response.status)
            }

            const playerData = await response.json()
            setPlayers(playerData)
        } catch (error) {
            console.error("Error fetching Players:", error)
        }
    }

    useEffect(() => {
        updateTeams()
        updatePlayers()
    }
    , [])

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "No date available"
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    // Calculate days until the game
    const getDaysUntilGame = (dateString) => {
        if (!dateString) return 0
        const gameDate = new Date(dateString)
        const today = new Date()
        const diffTime = gameDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    // Only calculate if nextGame exists
    const daysUntilGame = nextGame ? getDaysUntilGame(nextGame.date) : 0
    const hasNextGame = nextGame && Object.keys(nextGame).length > 0

    // Quick stats for the dashboard
    const quickStats = [
        {
            title: "Teams",
            value: stats?.total_teams || 0,
            icon: <Trophy className="h-5 w-5 text-primary" />,
        },
        {
            title: "Players",
            value: stats?.total_players || 0,
            icon: <Users className="h-5 w-5 text-primary" />,
        },
        {
            title: "Games",
            value: stats?.total_games || 0,
            icon: <Activity className="h-5 w-5 text-primary" />,
        },
        {
            title: "Goals",
            value: (stats?.goals_by_position?.attack || 0) + (stats?.goals_by_position?.defense || 0),
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
        },
    ]

    return (
        <>
            <Navbar />
            <AppLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }]}>
                <Head title="Dashboard" />

                {/* Quick Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    {quickStats.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-primary/10 p-2">{stat.icon}</div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Next Game Card */}
                <div className="space-y-6">
                    {hasNextGame ? (
                        <div className="rounded-lg border bg-card text-card-foreground shadow">
                            <div className="p-4">
                                <div className="flex flex-col space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                        {/* Left side - Match countdown */}
                                        <div className="flex flex-col items-center justify-center space-y-1 rounded-lg bg-primary/10 p-3 md:col-span-2">
                                            <span className="text-2xl font-bold text-primary">{daysUntilGame}</span>
                                            <span className="text-xs font-medium uppercase text-muted-foreground">
                                                {daysUntilGame === 1 ? "Day" : "Days"} Left
                                            </span>
                                        </div>

                                        {/* Middle - Teams */}
                                        <div className="md:col-span-10">
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-center gap-12">
                                                    <div className="flex flex-col items-center space-y-1">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-xl font-bold">
                                                            {nextGame.home_team?.name?.charAt(0) || "?"}
                                                        </div>
                                                        <span className="text-sm font-medium">{nextGame.home_team?.name || "Unknown Team"}</span>
                                                        <span className="text-xs text-muted-foreground">Home</span>
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <div className="text-sm font-medium text-muted-foreground">VS</div>
                                                    </div>

                                                    <div className="flex flex-col items-center space-y-1">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-xl font-bold">
                                                            {nextGame.away_team?.name?.charAt(0) || "?"}
                                                        </div>
                                                        <span className="text-sm font-medium">{nextGame.away_team?.name || "Unknown Team"}</span>
                                                        <span className="text-xs text-muted-foreground">Away</span>
                                                    </div>
                                                </div>

                                                {/* Game details in a row */}
                                                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-b py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-4 w-4 text-primary" />
                                                        <span className="text-sm">{formatDate(nextGame.date)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4 text-primary" />
                                                        <span className="text-sm">{nextGame.time || "Time not set"}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                        <span className="text-sm">{nextGame.location || "Location not set"}</span>
                                                    </div>
                                                </div>

                                                {/* Action buttons in a row */}
                                                <div className="mt-3 flex items-center justify-center gap-3">
                                                    <Button asChild size="sm">
                                                        <Link href={`/games/record?game=${nextGame.id}`} className="flex items-center gap-1.5">
                                                            <ClipboardList className="h-3.5 w-3.5" />
                                                            Record Game
                                                        </Link>
                                                    </Button>

                                                    <Button variant="outline" asChild size="sm">
                                                        <Link href={`/games/create`} className="flex items-center gap-1.5">
                                                            <span>All Games</span>
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="mb-4 rounded-full bg-primary/10 p-3">
                                    <CalendarDays className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium">No upcoming games</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    There are no upcoming games scheduled at the moment.
                                </p>
                                <Button asChild>
                                    <Link href="/games/create">Schedule a Game</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Teams and Players */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <TeamsCard
                            teams={teams}
                            onTeamsChange={updateTeams}
                            onPlayersChange={updatePlayers}
                            selectedTeamId={selectedTeamId}
                            onSelectTeam={setSelectedTeamId}
                        />
                        <PlayersCard
                            players={players}
                            teams={teams}
                            onPlayersChange={updatePlayers}
                            onTeamsChange={updateTeams}
                            selectedTeamId={selectedTeamId}
                            onClearTeamFilter={() => setSelectedTeamId(null)}
                        />
                        <StatsCard
                            stats={
                                stats || {
                                    total_teams: 0,
                                    total_players: 0,
                                    total_games: 0,
                                    goals_by_position: { attack: 0, defense: 0 },
                                    goals_by_gender: { male: 0, female: 0 },
                                    games_by_month: [],
                                }
                            }
                        />
                    </div>

                    {/* Stats Overview */}
                    <div className="grid gap-6">
                        <GameStatsVisualizations
                            stats={
                                stats || {
                                    total_teams: 0,
                                    total_players: 0,
                                    total_games: 0,
                                    goals_by_position: { attack: 0, defense: 0 },
                                    goals_by_gender: { male: 0, female: 0 },
                                    games_by_month: [],
                                }
                            }
                        />
                    </div>
                </div>
            </AppLayout>
        </>
    )
}

