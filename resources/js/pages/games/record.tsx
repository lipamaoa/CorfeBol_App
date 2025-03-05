'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    ShoppingBasketIcon as Basketball,
    Clock,
    MoreHorizontal,
    Pause,
    Play,
    RotateCcw,
    Shield,
    Swords,
    Target,
    Trophy,
    UserPlus,
    BellIcon as Whistle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type PlayerPosition = 'attack' | 'defense';
type PlayerGender = 'male' | 'female';

interface Player {
    id: number;
    name: string;
    number: number;
    position: PlayerPosition;
    gender: PlayerGender;
    avatar?: string;
}

type EventType =
    | 'RG'
    | 'RP'
    | 'MP'
    | 'D'
    | 'Pa'
    | 'LC'
    | 'LM'
    | 'LL'
    | 'P'
    | 'L'
    | 'Pe'
    | 'goal'
    | 'other'
    | 'assist'
    | 'foul'
    | 'substitution'
    | 'position_switch'
    | 'timeout';

interface MatchEvent {
    id: number;
    type: EventType;
    time: string;
    playerId?: number;
    playerIdSecondary?: number; // For substitutions, assists, etc.
    description: string;
    success?: boolean; // Add this field to track success/failure
    isOffensive?: boolean; // Indica se é uma ação ofensiva ou defensiva
    quadrant?: 1 | 2; // Indica em qual quadrado ocorreu a ação (ataque ou defesa)
}

interface RecordGameProps {
    game?: {
        id: number;
        home_team: {
            id: number;
            name: string;
        };
        away_team: {
            id: number;
            name: string;
        };
        date: string;
        time: string;
        location: string;
    };
}

export default function RecordGame({ game }: RecordGameProps) {
    const [matchTime, setMatchTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [period, setPeriod] = useState(1);
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [score, setScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [teamName, setTeamName] = useState(game?.home_team?.name || 'Our Team');
    const [opponentName, setOpponentName] = useState(game?.away_team?.name || 'Opponent');

    const [players, setPlayers] = useState<Player[]>([
        { id: 1, name: 'Alex Smith', number: 4, position: 'attack', gender: 'male' },
        { id: 2, name: 'Jamie Taylor', number: 7, position: 'attack', gender: 'female' },
        { id: 3, name: 'Sam Johnson', number: 10, position: 'attack', gender: 'male' },
        { id: 4, name: 'Jordan Lee', number: 13, position: 'attack', gender: 'female' },
        { id: 5, name: 'Casey Brown', number: 16, position: 'defense', gender: 'male' },
        { id: 6, name: 'Riley Green', number: 19, position: 'defense', gender: 'female' },
        { id: 7, name: 'Taylor White', number: 22, position: 'defense', gender: 'male' },
        { id: 8, name: 'Morgan Black', number: 25, position: 'defense', gender: 'female' },
        { id: 9, name: 'Chris Davis', number: 5, position: 'attack', gender: 'male' }, // Substitutes
        { id: 10, name: 'Pat Wilson', number: 8, position: 'defense', gender: 'female' },
    ]);

    const [selectedEventType, setSelectedEventType] = useState<EventType>('goal');
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(undefined);
    const [selectedPlayerIdSecondary, setSelectedPlayerIdSecondary] = useState<number | undefined>(undefined);
    const [eventDescription, setEventDescription] = useState('');
    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeTab, setActiveTab] = useState('field');
    const [eventSuccess, setEventSuccess] = useState<boolean | undefined>(undefined);

    // Add a visual indicator for recent substitutions or position changes
    const [recentlyChanged, setRecentlyChanged] = useState<number[]>([]);

    // Add a new state to track the team's position (attack or defense)
    const [teamPosition, setTeamPosition] = useState<'attack' | 'defense'>('attack');
    const [goalsSinceLastSwitch, setGoalsSinceLastSwitch] = useState(0);

    // Add this state
    const [selectedGoalEvent, setSelectedGoalEvent] = useState<MatchEvent | null>(null);

    // Define which event types have predetermined success/failure states
    const predeterminedSuccessEvents: EventType[] = ['goal', 'assist'];
    const predeterminedFailureEvents: EventType[] = ['RP', 'MP', 'Pa', 'foul'];

    // Add new states for reports and comparisons
    const [showReports, setShowReports] = useState(false);
    const [activeReportTab, setActiveReportTab] = useState('offensive');
    const [playerComparisonData, setPlayerComparisonData] = useState<any[]>([]);
    const [detailedReports, setDetailedReports] = useState<{
        offensiveStats: any;
        defensiveStats: any;
    }>({ offensiveStats: {}, defensiveStats: {} });

    // Update event success when event type changes
    useEffect(() => {
        if (predeterminedSuccessEvents.includes(selectedEventType)) {
            setEventSuccess(true);
        } else if (predeterminedFailureEvents.includes(selectedEventType)) {
            setEventSuccess(false);
        } else {
            setEventSuccess(undefined);
        }
    }, [selectedEventType]);

    // Timer functionality
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (isRunning) {
            interval = setInterval(() => {
                setMatchTime((prevTime) => prevTime + 1);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setMatchTime(0);
        setIsRunning(false);
    };

    const changePeriod = () => {
        const newPeriod = period + 1;
        setPeriod(newPeriod);

        addEvent({
            id: events.length + 1,
            type: 'other',
            time: formatTime(matchTime),
            description: `Period ${newPeriod} started`,
        });
    };

    // Modify the addEvent function to handle zone switching after 2 goals
    const addEvent = (event: MatchEvent) => {
        setEvents((prevEvents) => [event, ...prevEvents]);

        // Update score if it's a goal
        if (event.type === 'goal') {
            setScore((prevScore) => prevScore + 1);

            // Increment the goal counter since the last switch
            const newGoalCount = goalsSinceLastSwitch + 1;
            setGoalsSinceLastSwitch(newGoalCount);

            // If reached 2 goals, switch zones
            if (newGoalCount >= 2) {
                switchZones();
                setGoalsSinceLastSwitch(0);
            }
        }
    };

    const switchHighlith = () => {
        const newPosition = teamPosition === 'attack' ? 'defense' : 'attack';
        setTeamPosition(newPosition);

        // Add event to the log
        const switchEvent: MatchEvent = {
            id: events.length + 1,
            type: 'other',
            time: formatTime(matchTime),
            description: `Zone switch: team is now on ${newPosition}`,
        };

        setEvents((prevEvents) => [switchEvent, ...prevEvents]);
    };

    // Add function to switch zones (attack/defense)
    const switchZones = () => {
        // Switch the team's position
        const newPosition = teamPosition === 'attack' ? 'defense' : 'attack';
        setTeamPosition(newPosition);

        // Switch all players' positions
        setPlayers((prevPlayers) => {
            return prevPlayers.map((player) => ({
                ...player,
                position: player.position === 'attack' ? 'defense' : 'attack',
            }));
        });

        // Add event to the log
        const switchEvent: MatchEvent = {
            id: events.length + 1,
            type: 'other',
            time: formatTime(matchTime),
            description: `Zone switch: team is now on ${newPosition}`,
        };

        setEvents((prevEvents) => [switchEvent, ...prevEvents]);
    };

    // Add function to manually record the team's position
    const recordTeamPosition = () => {
        const positionEvent: MatchEvent = {
            id: events.length + 1,
            type: 'other',
            time: formatTime(matchTime),
            description: `Team is on ${teamPosition}`,
        };

        setEvents((prevEvents) => [positionEvent, ...prevEvents]);
    };

    const handlePlayerClick = (player: Player) => {
        setSelectedPlayer(player);
        setSelectedPlayerId(player.id);
        setEventDialogOpen(true);
    };

    // Helper function to check gender balance in a zone
    const checkGenderBalance = (players: Player[], position: PlayerPosition) => {
        const playersInZone = players.filter((p) => p.position === position).slice(0, 4);
        const maleCount = playersInZone.filter((p) => p.gender === 'male').length;
        const femaleCount = playersInZone.filter((p) => p.gender === 'female').length;

        return maleCount === 2 && femaleCount === 2;
    };

    // Update the handlePositionSwitch function to enforce gender balance
    const handlePositionSwitch = (player1Id: number, player2Id: number) => {
        // First, check if the switch would maintain gender balance
        const player1 = players.find((p) => p.id === player1Id);
        const player2 = players.find((p) => p.id === player2Id);

        if (!player1 || !player2) return;

        // Simulate the switch to check if it maintains balance
        const simulatedPlayers = [...players];
        const player1Index = simulatedPlayers.findIndex((p) => p.id === player1Id);
        const player2Index = simulatedPlayers.findIndex((p) => p.id === player2Id);

        // Switch positions in the simulation
        const tempPosition = simulatedPlayers[player1Index].position;
        simulatedPlayers[player1Index].position = simulatedPlayers[player2Index].position;
        simulatedPlayers[player2Index].position = tempPosition;

        // Check if gender balance is maintained after the switch
        const attackBalanced = checkGenderBalance(simulatedPlayers, 'attack');
        const defenseBalanced = checkGenderBalance(simulatedPlayers, 'defense');

        if (!attackBalanced || !defenseBalanced) {
            // Show alert if the switch would violate gender balance
            alert('This position switch would violate the rule of 2 men and 2 women in each zone!');
            return;
        }

        // If we got here, the switch is valid, so apply the actual change
        setPlayers(simulatedPlayers);

        // Mark both players as recently changed
        setRecentlyChanged([player1Id, player2Id]);

        // Clear the highlight after 3 seconds
        setTimeout(() => {
            setRecentlyChanged((prev) => prev.filter((id) => id !== player1Id && id !== player2Id));
        }, 3000);

        // Add the event to the log
        const newEvent: MatchEvent = {
            id: events.length + 1,
            type: 'position_switch',
            time: formatTime(matchTime),
            playerId: player1Id,
            playerIdSecondary: player2Id,
            description: `${player1.name} (#${player1.number}) switched positions with ${player2.name} (#${player2.number})`,
        };

        addEvent(newEvent);
    };

    // Update the handleSubstitution function to enforce gender balance
    const handleSubstitution = (outPlayerId: number, inPlayerId: number) => {
        const outPlayer = players.find((p) => p.id === outPlayerId);
        const inPlayer = players.find((p) => p.id === inPlayerId);

        if (!outPlayer || !inPlayer) return;

        // Check if players have the same gender
        if (outPlayer.gender !== inPlayer.gender) {
            alert('Substitution must be made between players of the same gender!');
            return;
        }

        // Simulate the substitution to check if it maintains balance
        const simulatedPlayers = [...players];
        const outPlayerIndex = simulatedPlayers.findIndex((p) => p.id === outPlayerId);
        const inPlayerIndex = simulatedPlayers.findIndex((p) => p.id === inPlayerId);

        // Apply the substitution in the simulation
        const outPlayerPosition = simulatedPlayers[outPlayerIndex].position;
        simulatedPlayers[inPlayerIndex].position = outPlayerPosition;

        // Mark the outgoing player as being on the bench (opposite position)
        simulatedPlayers[outPlayerIndex].position = outPlayerPosition === 'attack' ? 'defense' : 'attack';

        // Check if gender balance is maintained after the substitution
        const attackBalanced = checkGenderBalance(simulatedPlayers, 'attack');
        const defenseBalanced = checkGenderBalance(simulatedPlayers, 'defense');

        if (!attackBalanced || !defenseBalanced) {
            // Show alert if the substitution would violate gender balance
            alert('This substitution would violate the rule of 2 men and 2 women in each zone!');
            return;
        }

        // If we got here, the substitution is valid, so apply the actual change
        setPlayers(simulatedPlayers);

        // Mark the incoming player as recently changed
        setRecentlyChanged([inPlayerId]);

        // Clear the highlight after 3 seconds
        setTimeout(() => {
            setRecentlyChanged((prev) => prev.filter((id) => id !== inPlayerId));
        }, 3000);

        // Add the event to the log
        const newEvent: MatchEvent = {
            id: events.length + 1,
            type: 'substitution',
            time: formatTime(matchTime),
            playerId: inPlayerId,
            playerIdSecondary: outPlayerId,
            description: `${inPlayer.name} (#${inPlayer.number}) substituted for ${outPlayer.name} (#${outPlayer.number})`,
        };

        addEvent(newEvent);
    };

    // We also need to update the handleAddEvent function to use the new functions
    const handleAddEvent = () => {
        // Primeiro, execute ações específicas baseadas no tipo de evento
        if (selectedEventType === 'substitution' && selectedPlayerId && selectedPlayerIdSecondary) {
            // Execute a substituição
            handleSubstitution(selectedPlayerIdSecondary, selectedPlayerId);
            setEventDialogOpen(false);
            resetEventForm();
            return; // Importante: retorne aqui para evitar adicionar o evento duas vezes
        } else if (selectedEventType === 'position_switch' && selectedPlayerId && selectedPlayerIdSecondary) {
            // Execute a troca de posição
            handlePositionSwitch(selectedPlayerId, selectedPlayerIdSecondary);
            setEventDialogOpen(false);
            resetEventForm();
            return; // Importante: retorne aqui para evitar adicionar o evento duas vezes
        }

        // Determine se é um evento ofensivo ou defensivo
        const player = selectedPlayerId ? players.find((p) => p.id === selectedPlayerId) : undefined;
        const isOffensive = player ? player.position === 'attack' : undefined;

        // Para outros tipos de evento, apenas crie o evento sem ações adicionais
        const newEvent: MatchEvent = {
            id: events.length + 1,
            type: selectedEventType,
            time: formatTime(matchTime),
            playerId: selectedPlayerId,
            playerIdSecondary: selectedPlayerIdSecondary,
            description: eventDescription || getDefaultDescription(),
            success: eventSuccess,
            isOffensive,
            quadrant: player ? (player.position === 'attack' ? 1 : 2) : undefined,
        };

        addEvent(newEvent);

        // Verificar se é uma ação defensiva que falhou e deve resultar em gol para o oponente
        if (player && player.position === 'defense' && eventSuccess === false) {
            // Tipos de ações defensivas que, quando falham, resultam em gol para o oponente
            const defensiveActions = ['D', 'RG'];

            if (defensiveActions.includes(selectedEventType)) {
                // Registrar gol do oponente com a razão
                recordOpponentGoal(`Failed ${selectedEventType === 'D' ? 'defense' : 'rebound'} by ${player.name}`);
            }
        }

        setEventDialogOpen(false);
        resetEventForm();
    };

    // Adicione esta função após a função addEvent
    const recordOpponentGoal = (reason: string) => {
        setOpponentScore((prev) => prev + 1);

        const opponentGoalEvent: MatchEvent = {
            id: events.length + 1,
            type: 'other',
            time: formatTime(matchTime),
            description: `Opponent scored: ${reason}`,
            isOffensive: false,
            quadrant: 2,
        };

        setEvents((prev) => [opponentGoalEvent, ...prev]);
    };

    const resetEventForm = () => {
        setSelectedEventType('goal');
        setEventDescription('');
        setSelectedPlayerId(undefined);
        setSelectedPlayerIdSecondary(undefined);
        setSelectedPlayer(null);
        setEventSuccess(undefined);
    };

    const getDefaultDescription = () => {
        const player = selectedPlayerId ? players.find((p) => p.id === selectedPlayerId) : undefined;
        const secondaryPlayer = selectedPlayerIdSecondary ? players.find((p) => p.id === selectedPlayerIdSecondary) : undefined;

        const successText = eventSuccess === true ? 'successfully' : eventSuccess === false ? 'unsuccessfully' : '';

        switch (selectedEventType) {
            case 'RG':
                return player ? `${player.name} (#${player.number}) ${successText} won a rebound` : '';
            case 'RP':
                return player ? `${player.name} (#${player.number}) lost a rebound` : '';
            case 'MP':
                return player ? `Bad pass by ${player.name} (#${player.number})` : '';
            case 'D':
                return player ? `${player.name} (#${player.number}) ${successText} defended` : '';
            case 'Pa':
                return player ? `${player.name} (#${player.number}) committed traveling` : '';
            case 'LC':
                return player ? `${player.name} (#${player.number}) ${successText} attempted a short-range shot` : '';
            case 'LM':
                return player ? `${player.name} (#${player.number}) ${successText} attempted a mid-range shot` : '';
            case 'LL':
                return player ? `${player.name} (#${player.number}) ${successText} attempted a long-range shot` : '';
            case 'P':
                return player ? `${player.name} (#${player.number}) ${successText} attempted a layup` : '';
            case 'L':
                return player ? `${player.name} (#${player.number}) ${successText} attempted a free throw` : '';
            case 'Pe':
                return player ? `${player.name} (#${player.number}) ${successText} attempted a penalty` : '';
            case 'goal':
                return player ? `${player.name} (#${player.number}) scored` : '';
            case 'assist':
                return player && secondaryPlayer
                    ? `${player.name} (#${player.number}) assisted ${secondaryPlayer.name} (#${secondaryPlayer.number})`
                    : '';
            case 'foul':
                return player ? `Foul committed by ${player.name} (#${player.number})` : '';
            case 'substitution':
                return player && secondaryPlayer
                    ? `${player.name} (#${player.number}) substituted for ${secondaryPlayer.name} (#${secondaryPlayer.number})`
                    : '';
            case 'position_switch':
                return player && secondaryPlayer
                    ? `${player.name} (#${player.number}) switched positions with ${secondaryPlayer.name} (#${secondaryPlayer.number})`
                    : '';
            case 'timeout':
                return `Timeout called`;
            case 'other':
                return player ? `Custom event: ${player.name} (#${player.number})` : '';
            default:
                return '';
        }
    };

    const getEventIcon = (type: EventType) => {
        switch (type) {
            case 'RG':
            case 'RP':
                return <Basketball className="h-4 w-4" />;
            case 'MP':
            case 'D':
            case 'Pa':
                return <AlertTriangle className="h-4 w-4" />;
            case 'LC':
            case 'LM':
            case 'LL':
            case 'P':
            case 'L':
            case 'Pe':
                return <Target className="h-4 w-4" />;
            case 'goal':
                return <Trophy className="h-4 w-4" />;
            case 'assist':
                return <Trophy className="h-4 w-4" />;
            case 'foul':
                return <Whistle className="h-4 w-4" />;
            case 'substitution':
                return <UserPlus className="h-4 w-4" />;
            case 'position_switch':
                return <ArrowLeftRight className="h-4 w-4" />;
            case 'timeout':
                return <Clock className="h-4 w-4" />;
            case 'other':
                return <MoreHorizontal className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getEventColor = (type: EventType, success?: boolean) => {
        // If success is defined, override colors based on success/failure
        if (success === true) {
            return 'bg-green-100 text-green-800';
        } else if (success === false) {
            return 'bg-red-100 text-red-800';
        }

        // Default colors by event type
        switch (type) {
            case 'RG':
                return 'bg-green-100 text-green-800'; // Rebound Won
            case 'RP':
                return 'bg-red-100 text-red-800'; // Rebound Lost
            case 'MP':
                return 'bg-yellow-100 text-yellow-800'; // Bad Pass
            case 'D':
                return 'bg-gray-100 text-gray-800'; // Defended
            case 'Pa':
                return 'bg-orange-100 text-orange-800'; // Traveling Violation
            case 'LC':
            case 'LM':
            case 'LL':
                return 'bg-blue-100 text-blue-800'; // Shot Attempt (Short, Medium, Long)
            case 'P':
            case 'L':
            case 'Pe':
                return 'bg-indigo-100 text-indigo-800'; // Layup, Free Throw, Penalty
            case 'goal':
                return 'bg-green-100 text-green-800';
            case 'assist':
                return 'bg-emerald-100 text-emerald-800';
            case 'foul':
                return 'bg-red-100 text-red-800';
            case 'substitution':
                return 'bg-blue-100 text-blue-800';
            case 'position_switch':
                return 'bg-indigo-100 text-indigo-800';
            case 'timeout':
                return 'bg-yellow-100 text-yellow-800';
            case 'other':
                return 'bg-gray-200 text-gray-900';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPlayerStats = (playerId: number) => {
        const reboundsWon = events.filter((e) => e.type === 'RG' && e.playerId === playerId && e.success === true).length;
        const reboundsLost = events.filter(
            (e) => (e.type === 'RP' && e.playerId === playerId) || (e.type === 'RG' && e.playerId === playerId && e.success === false),
        ).length;
        const badPasses = events.filter((e) => e.type === 'MP' && e.playerId === playerId).length;
        const defended = events.filter((e) => e.type === 'D' && e.playerId === playerId).length;
        const successfulDefense = events.filter((e) => e.type === 'D' && e.playerId === playerId && e.success === true).length;
        const traveling = events.filter((e) => e.type === 'Pa' && e.playerId === playerId).length;

        // All shot attempts
        const shots = events.filter((e) => ['LC', 'LM', 'LL', 'P', 'L', 'Pe'].includes(e.type) && e.playerId === playerId).length;

        // Successful shot attempts
        const successfulShots = events.filter(
            (e) => ['LC', 'LM', 'LL', 'P', 'L', 'Pe'].includes(e.type) && e.playerId === playerId && e.success === true,
        ).length;

        const goals = events.filter((e) => e.type === 'goal' && e.playerId === playerId).length;
        const assists = events.filter((e) => e.type === 'assist' && e.playerId === playerId).length;
        const fouls = events.filter((e) => e.type === 'foul' && e.playerId === playerId).length;

        return {
            reboundsWon,
            reboundsLost,
            badPasses,
            defended,
            successfulDefense,
            traveling,
            shots,
            successfulShots,
            shootingPercentage: shots > 0 ? Math.round((successfulShots / shots) * 100) : 0,
            goals,
            assists,
            fouls,
        };
    };

    // Função para gerar relatórios específicos de ataque e defesa
    const generateDetailedReports = () => {
        // Estatísticas ofensivas
        const offensiveStats = {
            shots: {
                LC: { attempts: 0, made: 0, percentage: 0 },
                LM: { attempts: 0, made: 0, percentage: 0 },
                LL: { attempts: 0, made: 0, percentage: 0 },
                P: { attempts: 0, made: 0, percentage: 0 },
                L: { attempts: 0, made: 0, percentage: 0 },
                Pe: { attempts: 0, made: 0, percentage: 0 },
            },
            rebounds: { gained: 0, lost: 0, percentage: 0 },
            badPasses: 0,
            steps: 0,
            defendedByOpponent: 0,
            other: 0,
        };

        // Estatísticas defensivas
        const defensiveStats = {
            shotsAgainst: {
                LC: { attempts: 0, made: 0, percentage: 0 },
                LM: { attempts: 0, made: 0, percentage: 0 },
                LL: { attempts: 0, made: 0, percentage: 0 },
                P: { attempts: 0, made: 0, percentage: 0 },
                L: { attempts: 0, made: 0, percentage: 0 },
                Pe: { attempts: 0, made: 0, percentage: 0 },
            },
            rebounds: { gained: 0, lost: 0, percentage: 0 },
            badPassesByOpponent: 0,
            defensesMade: 0,
            foulsCommitted: 0,
            other: 0,
        };

        // Processar todos os eventos para preencher as estatísticas
        events.forEach((event) => {
            // Processar eventos ofensivos
            if (event.isOffensive || (event.playerId && players.find((p) => p.id === event.playerId)?.position === 'attack')) {
                if (['LC', 'LM', 'LL', 'P', 'L', 'Pe'].includes(event.type)) {
                    offensiveStats.shots[event.type as keyof typeof offensiveStats.shots].attempts++;
                    if (event.success) {
                        offensiveStats.shots[event.type as keyof typeof offensiveStats.shots].made++;
                    }
                } else if (event.type === 'RG') {
                    offensiveStats.rebounds.gained++;
                } else if (event.type === 'RP') {
                    offensiveStats.rebounds.lost++;
                } else if (event.type === 'MP') {
                    offensiveStats.badPasses++;
                } else if (event.type === 'Pa') {
                    offensiveStats.steps++;
                } else if (event.type === 'D') {
                    offensiveStats.defendedByOpponent++;
                } else if (event.type === 'other') {
                    offensiveStats.other++;
                }
            }
            // Processar eventos defensivos
            else if (!event.isOffensive || (event.playerId && players.find((p) => p.id === event.playerId)?.position === 'defense')) {
                if (['LC', 'LM', 'LL', 'P', 'L', 'Pe'].includes(event.type)) {
                    defensiveStats.shotsAgainst[event.type as keyof typeof defensiveStats.shotsAgainst].attempts++;
                    if (event.success) {
                        defensiveStats.shotsAgainst[event.type as keyof typeof defensiveStats.shotsAgainst].made++;
                    }
                } else if (event.type === 'RG') {
                    defensiveStats.rebounds.gained++;
                } else if (event.type === 'RP') {
                    defensiveStats.rebounds.lost++;
                } else if (event.type === 'MP') {
                    defensiveStats.badPassesByOpponent++;
                } else if (event.type === 'D') {
                    defensiveStats.defensesMade++;
                } else if (event.type === 'foul') {
                    defensiveStats.foulsCommitted++;
                } else if (event.type === 'other') {
                    defensiveStats.other++;
                }
            }
        });

        // Calcular percentagens
        for (const shotType in offensiveStats.shots) {
            const type = shotType as keyof typeof offensiveStats.shots;
            const { attempts, made } = offensiveStats.shots[type];
            offensiveStats.shots[type].percentage = attempts > 0 ? Math.round((made / attempts) * 100) : 0;
        }

        for (const shotType in defensiveStats.shotsAgainst) {
            const type = shotType as keyof typeof defensiveStats.shotsAgainst;
            const { attempts, made } = defensiveStats.shotsAgainst[type];
            defensiveStats.shotsAgainst[type].percentage = attempts > 0 ? Math.round((made / attempts) * 100) : 0;
        }

        const totalOffensiveRebounds = offensiveStats.rebounds.gained + offensiveStats.rebounds.lost;
        offensiveStats.rebounds.percentage =
            totalOffensiveRebounds > 0 ? Math.round((offensiveStats.rebounds.gained / totalOffensiveRebounds) * 100) : 0;

        const totalDefensiveRebounds = defensiveStats.rebounds.gained + defensiveStats.rebounds.lost;
        defensiveStats.rebounds.percentage =
            totalDefensiveRebounds > 0 ? Math.round((defensiveStats.rebounds.gained / totalDefensiveRebounds) * 100) : 0;

        return { offensiveStats, defensiveStats };
    };

    // Função para gerar análise comparativa entre jogadores
    const generatePlayerComparison = () => {
        const playerStats = players.map((player) => {
            const stats = getPlayerStats(player.id);

            // Calcular eficiência por tipo de lançamento
            const shotTypes = ['LC', 'LM', 'LL', 'P', 'L', 'Pe'];
            const shotEfficiency: Record<string, { attempts: number; made: number; percentage: number }> = {};

            shotTypes.forEach((type) => {
                const attempts = events.filter((e) => e.type === type && e.playerId === player.id).length;

                const made = events.filter((e) => e.type === type && e.playerId === player.id && e.success === true).length;

                shotEfficiency[type] = {
                    attempts,
                    made,
                    percentage: attempts > 0 ? Math.round((made / attempts) * 100) : 0,
                };
            });

            return {
                id: player.id,
                name: player.name,
                number: player.number,
                position: player.position,
                gender: player.gender,
                stats,
                shotEfficiency,
            };
        });

        return playerStats;
    };

    // Add function to generate and show reports
    const handleGenerateReports = () => {
        const reports = generateDetailedReports();
        const comparison = generatePlayerComparison();

        setDetailedReports(reports);
        setPlayerComparisonData(comparison);
        setShowReports(true);
    };

    const getActivePlayers = () => {
        const attackers = players.filter((p) => p.position === 'attack').slice(0, 4);
        const defenders = players.filter((p) => p.position === 'defense').slice(0, 4);
        return [...attackers, ...defenders];
    };

    // Get substitute players
    const getSubstitutes = () => {
        const activePlayerIds = getActivePlayers().map((p) => p.id);
        return players.filter((p) => !activePlayerIds.includes(p.id));
    };

    // Add this function to track action sequences
    const getActionSequence = (goalEventId: number) => {
        // Find the goal event
        const goalEvent = events.find((e) => e.id === goalEventId);
        if (!goalEvent || goalEvent.type !== 'goal') return [];

        // Get all events in the last 30 seconds before the goal
        const goalTime = formatTimeToSeconds(goalEvent.time);
        const relevantEvents = events.filter((e) => {
            const eventTime = formatTimeToSeconds(e.time);
            return (
                e.id < goalEventId && // Must be before the goal
                goalTime - eventTime <= 30 && // Within 30 seconds
                e.id !== goalEventId
            ); // Not the goal itself
        });

        // Sort by time (most recent first)
        return relevantEvents.sort((a, b) => formatTimeToSeconds(b.time) - formatTimeToSeconds(a.time));
    };

    // Helper function to convert formatted time to seconds
    const formatTimeToSeconds = (formattedTime: string) => {
        const [minutes, seconds] = formattedTime.split(':').map(Number);
        return minutes * 60 + seconds;
    };

    // Function to determine if success selection should be shown
    const shouldShowSuccessSelection = (eventType: EventType) => {
        // Don't show for predetermined success/failure events
        if (predeterminedSuccessEvents.includes(eventType) || predeterminedFailureEvents.includes(eventType)) {
            return false;
        }

        // Only show for events where success/failure is relevant
        return ['LC', 'LM', 'LL', 'P', 'L', 'Pe', 'RG', 'D', 'MP'].includes(eventType);
    };

    return (
        <AppLayout title="Record Game Statistics">
            <Head title="Record Game" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-6xl p-4">
                        <Card className="mb-6">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <CardTitle>Korfball Match Recorder - {teamName}</CardTitle>
                                        <Badge variant={teamPosition === 'attack' ? 'success' : 'secondary'} className="flex items-center gap-1">
                                            {teamPosition === 'attack' ? (
                                                <>
                                                    <Swords className="h-3 w-3" /> Attack
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-3 w-3" /> Defense
                                                </>
                                            )}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={recordTeamPosition}
                                            className={teamPosition === 'attack' ? 'bg-green-100' : 'bg-blue-100'}
                                        >
                                            Record Position
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={toggleTimer}>
                                            {isRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                                            {isRunning ? 'Pause' : 'Start'}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={resetTimer}>
                                            <RotateCcw className="mr-1 h-4 w-4" />
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold">{teamName}</div>
                                        <div className="mt-2 text-5xl font-bold">{score}</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-2 text-xl font-semibold">Period {period}</div>
                                        <div className="text-4xl font-bold">{formatTime(matchTime)}</div>
                                        <div className="mt-2 flex gap-2">
                                            <Button variant="outline" size="sm" onClick={changePeriod}>
                                                Next Period
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={switchZones} className="bg-yellow-100">
                                                Switch Zones
                                            </Button>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <span className="font-medium">{goalsSinceLastSwitch}/2</span> goals until zone switch
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold">{opponentName}</div>
                                        <div className="mt-2 text-5xl font-bold">{opponentScore}</div>
                                        <div className="mt-2 flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setOpponentScore((prev) => prev + 1)}>
                                                +1
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setOpponentScore((prev) => Math.max(0, prev - 1))}>
                                                -1
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="mb-4 grid grid-cols-3">
                                        <TabsTrigger value="field">Field View</TabsTrigger>
                                        <TabsTrigger value="events">Event Log</TabsTrigger>
                                        <TabsTrigger value="reports">Reports</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="field">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Korfball Field</CardTitle>
                                            </CardHeader>
                                            <Button variant="" onClick={switchHighlith}>
                                                Change
                                            </Button>
                                            <CardContent>
                                                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border-2 border-green-300 bg-green-100">
                                                    {/* Center line */}
                                                    <div className="absolute top-0 left-1/2 h-full w-1 -translate-x-1/2 bg-white"></div>

                                                    {/* Attack zone */}
                                                    <div className="absolute top-0 left-0 flex h-full w-1/2 flex-col">
                                                        <div
                                                            className={`py-2 text-center font-semibold ${teamPosition === 'attack' ? 'bg-green-300' : 'bg-green-200'}`}
                                                        >
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Swords className="h-4 w-4" /> Attack
                                                            </div>
                                                        </div>

                                                        {/* Korf (basket) */}
                                                        <div className="absolute top-1/2 left-1/4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400">
                                                            <div className="h-4 w-4 rounded-full bg-white"></div>
                                                        </div>

                                                        {/* Attack players - Quadrado 1: A, B, C, D */}
                                                        <div className="relative flex-1 p-4">
                                                            <div className="absolute top-2 left-2 rounded bg-white/80 px-1 text-xs font-bold">
                                                                Quadrado 1
                                                            </div>
                                                            {players
                                                                .filter((p) => p.position === 'attack')
                                                                .slice(0, 4)
                                                                .map((player, index) => {
                                                                    // Posicionar jogadores em um quadrado
                                                                    const positions = [
                                                                        { top: '20%', left: '20%' }, // Top-left
                                                                        { top: '20%', left: '60%' }, // Top-right
                                                                        { top: '70%', left: '20%' }, // Bottom-left
                                                                        { top: '70%', left: '60%' }, // Bottom-right
                                                                    ];

                                                                    const isRecentlyChanged = recentlyChanged.includes(player.id);

                                                                    return (
                                                                        <div
                                                                            key={player.id}
                                                                            className="absolute cursor-pointer"
                                                                            style={{
                                                                                top: positions[index].top,
                                                                                left: positions[index].left,
                                                                            }}
                                                                            onClick={() => handlePlayerClick(player)}
                                                                        >
                                                                            <div
                                                                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                                                    player.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'
                                                                                } font-bold text-white ${
                                                                                    isRecentlyChanged ? 'animate-pulse ring-4 ring-yellow-300' : ''
                                                                                }`}
                                                                            >
                                                                                {player.number}
                                                                            </div>
                                                                            <div className="mt-1 rounded bg-white/80 px-1 text-center text-xs font-semibold">
                                                                                {player.name.split(' ')[0]}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>

                                                    {/* Defense zone */}
                                                    <div className="absolute top-0 right-0 flex h-full w-1/2 flex-col">
                                                        <div
                                                            className={`py-2 text-center font-semibold ${teamPosition === 'defense' ? 'bg-green-300' : 'bg-green-200'}`}
                                                        >
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Shield className="h-4 w-4" /> Defense
                                                            </div>
                                                        </div>

                                                        {/* Korf (basket) */}
                                                        <div className="absolute top-1/2 left-3/4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400">
                                                            <div className="h-4 w-4 rounded-full bg-white"></div>
                                                        </div>

                                                        {/* Defense players - Quadrado 2: E, F, G, H */}
                                                        <div className="relative flex-1 p-4">
                                                            <div className="absolute top-2 left-2 rounded bg-white/80 px-1 text-xs font-bold">
                                                                Quadrado 2
                                                            </div>
                                                            {players
                                                                .filter((p) => p.position === 'defense')
                                                                .slice(0, 4)
                                                                .map((player, index) => {
                                                                    // Posicionar jogadores em um quadrado
                                                                    const positions = [
                                                                        { top: '20%', left: '20%' }, // Top-left
                                                                        { top: '20%', left: '60%' }, // Top-right
                                                                        { top: '70%', left: '20%' }, // Bottom-left
                                                                        { top: '70%', left: '60%' }, // Bottom-right
                                                                    ];

                                                                    const isRecentlyChanged = recentlyChanged.includes(player.id);

                                                                    return (
                                                                        <div
                                                                            key={player.id}
                                                                            className="absolute cursor-pointer"
                                                                            style={{
                                                                                top: positions[index].top,
                                                                                left: positions[index].left,
                                                                            }}
                                                                            onClick={() => handlePlayerClick(player)}
                                                                        >
                                                                            <div
                                                                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                                                    player.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'
                                                                                } font-bold text-white ${
                                                                                    isRecentlyChanged ? 'animate-pulse ring-4 ring-yellow-300' : ''
                                                                                }`}
                                                                            >
                                                                                {player.number}
                                                                            </div>
                                                                            <div className="mt-1 rounded bg-white/80 px-1 text-center text-xs font-semibold">
                                                                                {player.name.split(' ')[0]}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Substitutes bench */}
                                                <div className="mt-4">
                                                    <h3 className="mb-2 font-semibold">Substitutes</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getSubstitutes().map((player) => (
                                                            <div key={player.id} className="cursor-pointer" onClick={() => handlePlayerClick(player)}>
                                                                <div
                                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${player.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'} font-bold text-white`}
                                                                >
                                                                    {player.number}
                                                                </div>
                                                                <div className="mt-1 text-center text-xs font-semibold">
                                                                    {player.name.split(' ')[0]}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="events">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Match Events</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="mb-4 flex gap-2">
                                                    <Button className="w-full" onClick={() => setEventDialogOpen(true)}>
                                                        Record New Event
                                                    </Button>
                                                    <Button className="w-full" variant="outline" onClick={handleGenerateReports}>
                                                        Generate Reports
                                                    </Button>
                                                </div>

                                                <ScrollArea className="h-[400px] rounded-md border p-4">
                                                    {events.length === 0 ? (
                                                        <div className="text-muted-foreground py-8 text-center">
                                                            No events recorded yet. Click on a player or "Record New Event" to get started.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {events.map((event) => {
                                                                const player = event.playerId
                                                                    ? players.find((p) => p.id === event.playerId)
                                                                    : undefined;
                                                                const isAttackEvent = player && player.position === 'attack';

                                                                return (
                                                                    <div
                                                                        key={event.id}
                                                                        className={`flex items-start gap-3 rounded-lg border p-3 ${
                                                                            isAttackEvent
                                                                                ? 'border-l-4 border-l-green-500'
                                                                                : player
                                                                                  ? 'border-l-4 border-l-blue-500'
                                                                                  : ''
                                                                        }`}
                                                                    >
                                                                        <div
                                                                            className={`rounded-full p-2 ${getEventColor(event.type, event.success)}`}
                                                                        >
                                                                            {getEventIcon(event.type)}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium">{event.time}</span>
                                                                                <Badge variant="outline">
                                                                                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                                                                </Badge>
                                                                                {isAttackEvent && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="flex items-center gap-1 bg-green-50"
                                                                                    >
                                                                                        <Swords className="h-3 w-3" /> Attack
                                                                                    </Badge>
                                                                                )}
                                                                                {player && !isAttackEvent && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="flex items-center gap-1 bg-blue-50"
                                                                                    >
                                                                                        <Shield className="h-3 w-3" /> Defense
                                                                                    </Badge>
                                                                                )}
                                                                                {event.success !== undefined && (
                                                                                    <Badge
                                                                                        variant={event.success ? 'success' : 'destructive'}
                                                                                        className="ml-auto"
                                                                                    >
                                                                                        {event.success ? 'Success' : 'Failed'}
                                                                                    </Badge>
                                                                                )}
                                                                                {event.type === 'goal' && (
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="ml-auto"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedGoalEvent(event);
                                                                                        }}
                                                                                    >
                                                                                        View Sequence
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                            <p className="mt-1 text-sm">{event.description}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="reports">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Detailed Reports</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
                                                    <TabsList className="mb-4">
                                                        <TabsTrigger value="offensive">Offensive Stats</TabsTrigger>
                                                        <TabsTrigger value="defensive">Defensive Stats</TabsTrigger>
                                                        <TabsTrigger value="comparison">Player Comparison</TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="offensive">
                                                        {Object.keys(detailedReports.offensiveStats).length > 0 ? (
                                                            <div className="space-y-6">
                                                                <div>
                                                                    <h3 className="mb-2 text-lg font-semibold">Shooting Efficiency</h3>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        {Object.entries(detailedReports.offensiveStats.shots).map(
                                                                            ([type, data]: [string, any]) => (
                                                                                <div key={type} className="rounded-lg border p-3">
                                                                                    <div className="font-medium">{getFullShotTypeName(type)}</div>
                                                                                    <div className="text-2xl font-bold">{data.percentage}%</div>
                                                                                    <div className="text-muted-foreground text-sm">
                                                                                        {data.made}/{data.attempts} made
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h3 className="mb-2 text-lg font-semibold">Rebounds</h3>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Gained</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.rebounds.gained}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Lost</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.rebounds.lost}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Efficiency</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.rebounds.percentage}%
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h3 className="mb-2 text-lg font-semibold">Other Offensive Stats</h3>
                                                                    <div className="grid grid-cols-4 gap-4">
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Bad Passes</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.badPasses}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Steps</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.steps}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Defended</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.defendedByOpponent}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Other</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.offensiveStats.other}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground py-8 text-center">
                                                                No offensive data available. Generate reports first.
                                                            </div>
                                                        )}
                                                    </TabsContent>

                                                    <TabsContent value="defensive">
                                                        {Object.keys(detailedReports.defensiveStats).length > 0 ? (
                                                            <div className="space-y-6">
                                                                <div>
                                                                    <h3 className="mb-2 text-lg font-semibold">Shots Against</h3>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        {Object.entries(detailedReports.defensiveStats.shotsAgainst).map(
                                                                            ([type, data]: [string, any]) => (
                                                                                <div key={type} className="rounded-lg border p-3">
                                                                                    <div className="font-medium">{getFullShotTypeName(type)}</div>
                                                                                    <div className="text-2xl font-bold">{data.percentage}%</div>
                                                                                    <div className="text-muted-foreground text-sm">
                                                                                        {data.made}/{data.attempts} made
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h3 className="mb-2 text-lg font-semibold">Defensive Rebounds</h3>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Gained</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.rebounds.gained}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Lost</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.rebounds.lost}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Efficiency</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.rebounds.percentage}%
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h3 className="mb-2 text-lg font-semibold">Other Defensive Stats</h3>
                                                                    <div className="grid grid-cols-4 gap-4">
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Opponent Bad Passes</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.badPassesByOpponent}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Defenses Made</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.defensesMade}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Fouls</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.foulsCommitted}
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-lg border p-3">
                                                                            <div className="font-medium">Other</div>
                                                                            <div className="text-2xl font-bold">
                                                                                {detailedReports.defensiveStats.other}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground py-8 text-center">
                                                                No defensive data available. Generate reports first.
                                                            </div>
                                                        )}
                                                    </TabsContent>

                                                    <TabsContent value="comparison">
                                                        {playerComparisonData.length > 0 ? (
                                                            <div className="space-y-6">
                                                                <h3 className="mb-2 text-lg font-semibold">Player Shooting Efficiency</h3>
                                                                <ScrollArea className="h-[400px]">
                                                                    <div className="space-y-4">
                                                                        {playerComparisonData.map((player) => (
                                                                            <div key={player.id} className="rounded-lg border p-4">
                                                                                <div className="mb-3 flex items-center gap-2">
                                                                                    <Avatar>
                                                                                        <AvatarFallback
                                                                                            className={
                                                                                                player.gender === 'male'
                                                                                                    ? 'bg-blue-100'
                                                                                                    : 'bg-pink-100'
                                                                                            }
                                                                                        >
                                                                                            {player.name
                                                                                                .split(' ')
                                                                                                .map((n) => n[0])
                                                                                                .join('')}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    <div>
                                                                                        <div className="font-medium">{player.name}</div>
                                                                                        <div className="text-muted-foreground text-xs">
                                                                                            #{player.number} •{' '}
                                                                                            {player.position.charAt(0).toUpperCase() +
                                                                                                player.position.slice(1)}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-3 gap-3">
                                                                                    {Object.entries(player.shotEfficiency).map(
                                                                                        ([type, data]: [string, any]) => (
                                                                                            <div key={type} className="rounded border p-2">
                                                                                                <div className="text-xs font-medium">
                                                                                                    {getFullShotTypeName(type)}
                                                                                                </div>
                                                                                                <div className="text-lg font-bold">
                                                                                                    {data.percentage}%
                                                                                                </div>
                                                                                                <div className="text-muted-foreground text-xs">
                                                                                                    {data.made}/{data.attempts}
                                                                                                </div>
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>

                                                                                <div className="mt-3 grid grid-cols-4 gap-2">
                                                                                    <div className="rounded border p-2">
                                                                                        <div className="text-xs font-medium">Goals</div>
                                                                                        <div className="text-lg font-bold">{player.stats.goals}</div>
                                                                                    </div>
                                                                                    <div className="rounded border p-2">
                                                                                        <div className="text-xs font-medium">Assists</div>
                                                                                        <div className="text-lg font-bold">
                                                                                            {player.stats.assists}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="rounded border p-2">
                                                                                        <div className="text-xs font-medium">Rebounds</div>
                                                                                        <div className="text-lg font-bold">
                                                                                            {player.stats.reboundsWon}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="rounded border p-2">
                                                                                        <div className="text-xs font-medium">Defenses</div>
                                                                                        <div className="text-lg font-bold">
                                                                                            {player.stats.successfulDefense}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </ScrollArea>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground py-8 text-center">
                                                                No player comparison data available. Generate reports first.
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                </Tabs>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Player Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[500px]">
                                            <div className="space-y-4">
                                                {players.map((player) => {
                                                    const stats = getPlayerStats(player.id);
                                                    const isActive = getActivePlayers().some((p) => p.id === player.id);

                                                    return (
                                                        <div
                                                            key={player.id}
                                                            className={`flex items-center gap-3 rounded-lg border p-2 ${
                                                                isActive ? (player.position === 'attack' ? 'bg-green-50' : 'bg-blue-50') : ''
                                                            }`}
                                                        >
                                                            <Avatar>
                                                                <AvatarFallback className={player.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}>
                                                                    {player.name
                                                                        .split(' ')
                                                                        .map((n) => n[0])
                                                                        .join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{player.name}</div>
                                                                <div className="text-muted-foreground text-xs">
                                                                    #{player.number} •{' '}
                                                                    <span
                                                                        className={player.position === 'attack' ? 'text-green-600' : 'text-blue-600'}
                                                                    >
                                                                        {player.position.charAt(0).toUpperCase() + player.position.slice(1)}
                                                                    </span>{' '}
                                                                    • {player.gender.charAt(0).toUpperCase() + player.gender.slice(1)}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Badge variant="outline" className="bg-green-50">
                                                                    {stats.goals} G
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-blue-50">
                                                                    {stats.assists} A
                                                                </Badge>
                                                                {stats.shots > 0 && (
                                                                    <Badge variant="outline" className="bg-purple-50">
                                                                        {stats.shootingPercentage}% ({stats.successfulShots}/{stats.shots})
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Event Dialog */}
                        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedPlayer
                                            ? `Record Event for ${selectedPlayer.name} (#${selectedPlayer.number})`
                                            : 'Record Match Event'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="event-type">Event Type</Label>
                                        <Select value={selectedEventType} onValueChange={(value) => setSelectedEventType(value as EventType)}>
                                            <SelectTrigger id="event-type">
                                                <SelectValue placeholder="Select event type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedPlayer?.position == 'attack' ? <SelectItem value="goal">Goal</SelectItem> : <></>}
                                                <SelectItem value="assist">Assist</SelectItem>
                                                <SelectItem value="foul">Foul</SelectItem>
                                                <SelectItem value="substitution">Substitution</SelectItem>
                                                <SelectItem value="position_switch">Position Switch</SelectItem>
                                                <SelectItem value="timeout">Timeout</SelectItem>
                                                <SelectItem value="RG">Rebound Won</SelectItem>
                                                <SelectItem value="RP">Rebound Lost</SelectItem>
                                                <SelectItem value="MP">Bad Pass</SelectItem>
                                                <SelectItem value="D">Defended</SelectItem>
                                                <SelectItem value="Pa">Traveling</SelectItem>
                                                <SelectItem value="LC">Short Shot</SelectItem>
                                                <SelectItem value="LM">Mid Shot</SelectItem>
                                                <SelectItem value="LL">Long Shot</SelectItem>
                                                <SelectItem value="P">Layup</SelectItem>
                                                <SelectItem value="L">Free Throw</SelectItem>
                                                <SelectItem value="Pe">Penalty</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {!selectedPlayer && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="player">Player</Label>
                                            <Select
                                                value={selectedPlayerId?.toString() || ''}
                                                onValueChange={(value) => setSelectedPlayerId(value ? Number.parseInt(value) : undefined)}
                                            >
                                                <SelectTrigger id="player">
                                                    <SelectValue placeholder="Select player" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {players.map((player) => (
                                                        <SelectItem key={player.id} value={player.id.toString()}>
                                                            {player.name} (#{player.number}) - {player.position}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {(selectedEventType === 'assist' ||
                                        selectedEventType === 'substitution' ||
                                        selectedEventType === 'position_switch') && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="player-secondary">
                                                {selectedEventType === 'assist'
                                                    ? 'Scorer'
                                                    : selectedEventType === 'substitution'
                                                      ? 'Player Coming Off'
                                                      : 'Player to Switch With'}
                                            </Label>
                                            <Select
                                                value={selectedPlayerIdSecondary?.toString() || ''}
                                                onValueChange={(value) => setSelectedPlayerIdSecondary(value ? Number.parseInt(value) : undefined)}
                                            >
                                                <SelectTrigger id="player-secondary">
                                                    <SelectValue placeholder="Select player" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {players
                                                        .filter((p) => p.id !== selectedPlayerId)
                                                        .map((player) => (
                                                            <SelectItem key={player.id} value={player.id.toString()}>
                                                                {player.name} (#{player.number}) - {player.position}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Only show success toggle for relevant event types that aren't predetermined */}
                                    {shouldShowSuccessSelection(selectedEventType) && (
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="success-toggle">Successful Action</Label>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    type="button"
                                                    variant={eventSuccess ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setEventSuccess(true)}
                                                    className={eventSuccess ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                    Success
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={eventSuccess === false ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setEventSuccess(false)}
                                                    className={eventSuccess === false ? 'bg-red-500 hover:bg-red-600' : ''}
                                                >
                                                    Failure
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input
                                            id="description"
                                            placeholder="Enter event description"
                                            value={eventDescription}
                                            onChange={(e) => setEventDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddEvent}>Add Event</Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={!!selectedGoalEvent} onOpenChange={(open) => !open && setSelectedGoalEvent(null)}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Goal Sequence Analysis</DialogTitle>
                                </DialogHeader>
                                {selectedGoalEvent && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-3">
                                            <div className="rounded-full bg-green-100 p-2 text-green-800">
                                                <Trophy className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{selectedGoalEvent.time}</span>
                                                    <Badge variant="outline">Goal</Badge>
                                                </div>
                                                <p className="mt-1 text-sm font-medium">{selectedGoalEvent.description}</p>
                                            </div>
                                        </div>

                                        <h3 className="text-sm font-medium">Actions leading to this goal:</h3>

                                        <div className="space-y-2">
                                            {getActionSequence(selectedGoalEvent.id).map((event) => {
                                                const player = event.playerId ? players.find((p) => p.id === event.playerId) : undefined;
                                                const isAttackEvent = player && player.position === 'attack';

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`flex items-start gap-3 rounded-lg border p-2 ${
                                                            isAttackEvent
                                                                ? 'border-l-4 border-l-green-500'
                                                                : player
                                                                  ? 'border-l-4 border-l-blue-500'
                                                                  : ''
                                                        }`}
                                                    >
                                                        <div className={`rounded-full p-1.5 ${getEventColor(event.type, event.success)}`}>
                                                            {getEventIcon(event.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium">{event.time}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                                                </Badge>
                                                                {isAttackEvent && (
                                                                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-xs">
                                                                        <Swords className="h-2 w-2" /> Attack
                                                                    </Badge>
                                                                )}
                                                                {player && !isAttackEvent && (
                                                                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-xs">
                                                                        <Shield className="h-2 w-2" /> Defense
                                                                    </Badge>
                                                                )}
                                                                {event.success !== undefined && (
                                                                    <Badge variant={event.success ? 'success' : 'destructive'} className="text-xs">
                                                                        {event.success ? 'Success' : 'Failed'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 text-xs">{event.description}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {getActionSequence(selectedGoalEvent.id).length === 0 && (
                                                <p className="text-muted-foreground text-sm">
                                                    No actions recorded in the 30 seconds before this goal.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Função auxiliar para obter o nome completo do tipo de lançamento
const getFullShotTypeName = (type: string) => {
    switch (type) {
        case 'LC':
            return 'Short Range';
        case 'LM':
            return 'Medium Range';
        case 'LL':
            return 'Long Range';
        case 'P':
            return 'Layup';
        case 'L':
            return 'Free Throw';
        case 'Pe':
            return 'Penalty';
        default:
            return type;
    }
};
