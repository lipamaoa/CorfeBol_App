'use client';

import GameStatsVisualizations from '@/components/dashboard/game-stats-visualizations';
import PlayersCard from '@/components/dashboard/players-card';
import StatsCard from '@/components/dashboard/stats-card';
import TeamsCard from '@/components/dashboard/teams-card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

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

const gameStatsData = {
    total_teams: 8,
    total_players: 64,
    total_games: 20,
    goals_by_position: {
        attack: 120,
        defense: 80,
    },
    goals_by_gender: {
        male: 110,
        female: 90,
    },
    games_by_month: [
        { month: 'Jan', count: 3 },
        { month: 'Feb', count: 5 },
        { month: 'Mar', count: 2 },
        { month: 'Apr', count: 6 },
        { month: 'May', count: 4 },
        { month: 'Jun', count: 8 },
        { month: 'Jul', count: 7 },
        { month: 'Aug', count: 5 },
        { month: 'Sep', count: 9 },
        { month: 'Oct', count: 6 },
        { month: 'Nov', count: 4 },
        { month: 'Dec', count: 3 },
    ],
};

export default function Dashboard({ teams, players, stats }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Teams Management Card */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <TeamsCard teams={teams} />
                    </div>

                    {/* Players Management Card */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <PlayersCard players={players} teams={teams} />
                    </div>

                    {/* Stats Overview Card */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <StatsCard stats={stats} />
                    </div>
                </div>

                {/* Game Statistics Visualizations */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border md:min-h-min">
                    <GameStatsVisualizations stats={gameStatsData} />
                </div>
            </div>
        </AppLayout>
    );
}
