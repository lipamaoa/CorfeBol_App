'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Action, Game, Player, Stat } from '@/pages/games/record';

interface PlayerStatsProps {
    gameContext: {
        game: Game;
        events: Stat[];
        players: Player[];
        actions: Action[];
        handlePlayerClick: (player: Player) => void;
    };
}

export function PlayerStats({ gameContext }: PlayerStatsProps) {
    const { events, players, actions, handlePlayerClick } = gameContext;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Player Stats</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                        {players.filter(player=>player).map((player) => {

                           
                            // Calculate player stats from events

                            const playerEvents = events.filter((e) => e.player_id === player.id);
                            console.log(player);

                            // Goals
                            const goals = playerEvents.filter((e) => {
                                const action = actions.find((a) => a.id === e.action_id);
                                return action?.code === 'G' && e.success;
                            }).length;

                            // Shots
                            const shots = playerEvents.filter((e) => {
                                const action = actions.find((a) => a.id === e.action_id);
                                return (
                                    action?.code === 'LC' ||
                                    action?.code === 'LM' ||
                                    action?.code === 'LL' ||
                                    action?.code === 'P' ||
                                    action?.code === 'G'
                                );
                            }).length;

                            // Offensive efficiency
                            const offensiveEfficiency = shots > 0 ? Math.round((goals / shots) * 100) : 0;

                            // Turnovers
                            const turnovers = playerEvents.filter((e) => {
                                const action = actions.find((a) => a.id === e.action_id);
                                return action?.code === 'MP' || action?.code === 'Pa';
                            }).length;

                            // Defensive statistics
                            const defensiveActions = playerEvents.filter((e) => {
                                const action = actions.find((a) => a.id === e.action_id);
                                return action?.code === 'D' || ((action?.code === 'RG' || action?.code === 'RP') && player.position === 'defense');
                            });

                            const successfulDefense = defensiveActions.filter((e) => e.success).length;
                            const defensiveEfficiency =
                                defensiveActions.length > 0 ? Math.round((successfulDefense / defensiveActions.length) * 100) : 0;

                            return (
                                <div key={player.id} className="flex flex-col gap-2 rounded-lg border p-3" onClick={() => handlePlayerClick(player)}>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                player.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'
                                            }`}
                                        >
                                            {player.name ? player.name.charAt(0) : '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{player.name}</div>
                                            <div className="text-muted-foreground text-xs">
                                                <span className={player.position === 'attack' ? 'text-green-600' : 'text-blue-600'}>
                                                    {/* {player.position.charAt(0).toUpperCase() + player.position.slice(1)} */}
                                                </span>{' '}
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

                                    <div className="mt-1 flex gap-2">
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
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
