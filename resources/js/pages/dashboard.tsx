import GameStatsVisualizations from '@/components/dashboard/game-stats-visualizations';
import PlayersCard from '@/components/dashboard/players-card';
import StatsCard from '@/components/dashboard/stats-card';
import TeamsCard from '@/components/dashboard/teams-card';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Game, Stat } from '@/types/index';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, ClipboardList, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardProps {
    nextGame: Game | null;
    stats: Stat;
}

export default function Dashboard({ nextGame, stats }: DashboardProps) {
    // State variables for teams and players
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState<Game[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [gameStats, setGameStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

        // Function to update teams
    const updateEvents = async () => {
        try {
            const response = await fetch('api/events', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Error events Server: ' + response.status);
            }

            const eventsData = await response.json();
            setEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Function to update teams
    const updateTeams = async () => {
        try {
            const response = await fetch('api/teams', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Error Teams Server: ' + response.status);
            }

            const teamData = await response.json();
            setTeams(teamData);
        } catch (error) {
            console.error('Error fetching Teams:', error);
        }
    };

    // Function to update players
    const updatePlayers = async () => {
        try {
            const response = await fetch('api/players', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Error Players Server: ' + response.status);
            }

            const playerData = await response.json();
            setPlayers(playerData);
        } catch (error) {
            console.error('Error fetching Players:', error);
        }
    };

    const updateGames = async () => {
        try {
            const response = await fetch('/api/games/', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();

            //Filtrar apenas os próximos jogos
            const upcomingGames = data
                .filter((game: Game) => new Date(game.date) > new Date())
                .sort((a: Game, b: Game) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setGames(upcomingGames);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        updateTeams();
        updatePlayers();
        updateGames();
        updateEvents();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'No date available';
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Calculate days until the game
    const getDaysUntilGame = (dateString: string) => {
        if (!dateString) return 0;
        const gameDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); //ignora horas, considerar apenas data
        const diffTime = gameDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Only calculate if nextGame exists
    nextGame = games.length > 0 ? games[0] : null;
    const daysUntilGame = nextGame ? getDaysUntilGame(nextGame.date) : 0;

    useEffect(() => {
        // Fetch stats from your API
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/stats');
                const data = await response.json();
                setGameStats(data);
                console.log('Game Stats:', data);
                // Also fetch game-specific data for the coach stats card
                // const gameResponse = await fetch('/api/games/latest/stats');
                // const gameData = await gameResponse.json();
                // setGameStats(gameData);
                // console.log('Game Stats:', gameData);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <>
            <Navbar />
            <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
                <Head title="Dashboard" />

                {/* Next Game Card */}
                <div className="space-y-6">
                    {nextGame ? (
                        <div className="bg-card text-card-foreground rounded-lg border shadow">
                            <div className="p-4">
                                <div className="flex flex-col space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                        {/* Left side - Match countdown */}
                                        <div className="bg-primary/10 flex flex-col items-center justify-center space-y-1 rounded-lg p-3 md:col-span-2">
                                            <span className="text-primary text-2xl font-bold">{daysUntilGame}</span>
                                            <span className="text-muted-foreground text-xs font-medium uppercase">
                                                {daysUntilGame === 1 ? 'Day' : 'Days'} Left
                                            </span>
                                        </div>

                                        {/* Middle - Teams */}
                                        <div className="md:col-span-10">
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-center gap-12">
                                                    <div className="flex flex-col items-center space-y-1">
                                                        {nextGame?.team_a?.photo ? (
                                                            <div className="h-15 w-15 rounded-full overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={`/storage/${nextGame?.team_a?.photo}`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-15 w-15 items-center justify-center rounded-full font-semibold bg-gray-300 text-black-700">
                                                                {nextGame?.team_a?.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium">{nextGame?.team_a?.name || 'Unknown Team'}</span>
                                                        <span className="text-muted-foreground text-xs">Home</span>
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <div className="text-muted-foreground text-sm font-medium">VS</div>
                                                    </div>

                                                    <div className="flex flex-col items-center space-y-1">
                                                        {nextGame?.team_b?.photo ? (
                                                            <div className="h-15 w-15 rounded-full overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={`/storage/${nextGame?.team_b?.photo}`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-15 w-15 items-center justify-center rounded-full font-semibold bg-gray-300 text-black-700">
                                                                {nextGame?.team_b?.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium">{nextGame?.team_b?.name || 'Unknown Team'}</span>
                                                        <span className="text-muted-foreground text-xs">Away</span>
                                                    </div>
                                                </div>

                                                {/* Game details in a row */}
                                                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-b py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="text-primary h-4 w-4" />
                                                        <span className="text-sm">{formatDate(nextGame?.date)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="text-primary h-4 w-4" />
                                                        <span className="text-sm">{nextGame?.date.substring(11, 16) || 'Time not set'}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="text-primary h-4 w-4" />
                                                        <span className="text-sm">{nextGame?.location || 'Location not set'}</span>
                                                    </div>
                                                </div>

                                                {/* Action buttons in a row */}
                                                <div className="mt-3 flex items-center justify-center gap-3">
                                                    <Button asChild size="sm">
                                                        <Link href={`/games/${nextGame?.id}/record`} className="flex items-center gap-1.5">
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
                                <div className="bg-primary/10 mb-4 rounded-full p-3">
                                    <CalendarDays className="text-primary h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium">No upcoming games</h3>
                                <p className="text-muted-foreground mb-4 text-sm">There are no upcoming games scheduled at the moment.</p>
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
                            gameId={games[games.length - 1]?.id}
                            stats={gameStats}
                            events={events}
                            players={players}
                        />
                    </div>

                    {/* Stats Overview */}
                    <div className="grid gap-6">
                        <GameStatsVisualizations
                            stats={
                                gameStats?.stats}
                        />
                    </div>
                </div>
            </AppLayout >
        </>
    );
}
