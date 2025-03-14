'use client';

import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { useState } from 'react';

interface Team {
    id: number;
    name: string;
    logo_url?: string | null;
}

interface Game {
    id: number;
    team_a_id: number;
    team_b_id: number;
    teamA: Team;
    teamB: Team;
    date: string;
    time?: string;
    location?: string;
    status: string;
    score_team_a?: number;
    score_team_b?: number;
}

interface GamesProps {
    games: Game[];
    status?: string;
}

export default function Games({ games, status = 'all' }: GamesProps) {
    const [activeTab, setActiveTab] = useState(status);

    const filteredGames = activeTab === 'all' ? games : games.filter((game) => game.status === activeTab);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        Inertia.visit(`/games?status=${value}`, { preserveState: true });
    };

    const handleRecordGame = (gameId: number) => {
        Inertia.visit(`/games/${gameId}/record/`);
    };

    return (
        <>
            <Navbar />
            <AppLayout breadcrumbs={[{ title: 'Games', href: '/games' }]}>
                <Head title="Games" />

                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Games</h1>
                                <p className="text-gray-500">View and manage your korfball games</p>
                            </div>
                            <Button onClick={() => Inertia.visit('/games/create')}>Schedule New Game</Button>
                        </div>

                        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="all">All Games</TabsTrigger>
                                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="space-y-4">
                                {filteredGames.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-10 text-center">
                                            <p className="text-gray-500">No games found</p>
                                            <Button className="mt-4" onClick={() => Inertia.visit('/games/create')}>
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
                                                            {game.teamA?.name || 'Team A'} vs {game.teamB?.name || 'Team B'}
                                                        </CardTitle>
                                                        <Badge
                                                            variant={
                                                                game.status === 'completed'
                                                                    ? 'success'
                                                                    : game.status === 'in_progress'
                                                                      ? 'default'
                                                                      : 'outline'
                                                            }
                                                        >
                                                            {game.status === 'scheduled'
                                                                ? 'Scheduled'
                                                                : game.status === 'in_progress'
                                                                  ? 'In Progress'
                                                                  : 'Completed'}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center text-sm">
                                                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                                            {format(parseISO(game.date), 'MMMM d, yyyy')}
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

                                                        {game.status === 'completed' && (
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
                                                            {game.status === 'scheduled' && (
                                                                <Button onClick={() => handleRecordGame(game.id)} className="w-full">
                                                                    Record Game <ArrowRight className="ml-2 h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {game.status === 'in_progress' && (
                                                                <Button onClick={() => handleRecordGame(game.id)} className="w-full">
                                                                    Continue Recording <ArrowRight className="ml-2 h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {game.status === 'completed' && (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => Inertia.visit(`/stats?game_id=${game.id}`)}
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
    );
}
