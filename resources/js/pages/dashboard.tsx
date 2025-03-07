import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import PlayersCard from "@/components/dashboard/players-card"
import TeamsCard from "@/components/dashboard/teams-card"
import StatsCard from "@/components/dashboard/stats-card"
import GameStatsVisualizations from "@/components/dashboard/game-stats-visualizations"
import { Clock, MapPin, CalendarDays, ArrowRight, ClipboardList } from "lucide-react"
import { Link } from "@inertiajs/react"
import Navbar from "@/components/navbar"

interface Team {
    id: number;
    name: string;
    logo?: string;
    created_at: string;
    players_count: number;
    games_count: number;
}

interface Player {
    id: number;
    name: string;
    number: number;
    position: 'attack' | 'defense';
    gender: 'male' | 'female';
    team_id: number;
    team_name: string;
}
interface DashboardProps {
    teams: Team[];
    players: Player[];
    stats: {
        total_teams: number;
        total_players: number;
        total_games: number;
        goals_by_position: {
            attack: number;
            defense: number;
        };
        goals_by_gender: {
            male: number;
            female: number;
        };
        games_by_month: {
            month: string;
            count: number;
        }[];
    };
}

// Mock data for the next scheduled game
const nextGame = {
    id: 1,
    date: "2025-03-10",
    time: "19:00",
    location: "Lisbon Sports Arena",
    home_team: {
        id: 1,
        name: "Sporting CP",
    },
    away_team: {
        id: 2,
        name: "Benfica",
    },
}

// Mock data for teams and players
// const mockTeams = [
//   { id: 1, name: "Sporting CP" },
//   { id: 2, name: "Benfica" },
//   { id: 3, name: "FC Porto" },
//   { id: 4, name: "Belenenses" },
// ]

const mockPlayers = [
    {
        id: 1,
        name: "João Silva",
        number: 7,
        position: "attack",
        gender: "male",
        team_id: 1,
        team_name: "Sporting CP",
    },
    {
        id: 2,
        name: "Maria Santos",
        number: 10,
        position: "defense",
        gender: "female",
        team_id: 1,
        team_name: "Sporting CP",
    },
    // More players would be here
]

// Mock stats data
const mockStats = {
    total_teams: 4,
    total_players: 16,
    total_games: 12,
    goals_by_position: { attack: 36, defense: 18 },
    goals_by_gender: { male: 32, female: 22 },
    games_by_month: [
        { month: "Jan", count: 2 },
        { month: "Feb", count: 3 },
        { month: "Mar", count: 2 },
        { month: "Apr", count: 4 },
        { month: "May", count: 1 },
    ],
}

export default function Dashboard({ teams, players, stats }: DashboardProps) {
    // Format date for display
    const formatDate = (dateString) => {
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    // Calculate days until the game
    const getDaysUntilGame = (dateString) => {
        const gameDate = new Date(dateString)
        const today = new Date()
        const diffTime = gameDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const daysUntilGame = getDaysUntilGame(nextGame.date)

    return (
        <>
            <Navbar />
            <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}>
                <Head title="Dashboard" />



                <div className="space-y-6">
                    {/* Next Game Card - Revised Design */}
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
                                                        {nextGame.home_team.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium">{nextGame.home_team.name}</span>
                                                    <span className="text-xs text-muted-foreground">Home</span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="text-sm font-medium text-muted-foreground">VS</div>
                                                </div>

                                                <div className="flex flex-col items-center space-y-1">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-xl font-bold">
                                                        {nextGame.away_team.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium">{nextGame.away_team.name}</span>
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
                                                    <span className="text-sm">{nextGame.time}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <span className="text-sm">{nextGame.location}</span>
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

                    {/* Teams and Players */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <TeamsCard teams={teams} />
                        <PlayersCard players={players} teams={teams} />
                        <StatsCard stats={stats} />
                    </div>

                    {/* Stats Overview */}
                    <div className="grid gap-6 ">
                        <GameStatsVisualizations stats={stats} />
                    </div>
                </div>
            </AppLayout>
        </>
    )
}

