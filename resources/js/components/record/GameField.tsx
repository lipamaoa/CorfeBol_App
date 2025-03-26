'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Player } from '@/types/index';
import { Plus, Shield, Swords, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PlayerAvatarProps {
    player: { id: number, name: string; gender: string };
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    isSelected?: boolean;
}

interface FieldPositionProps {
    position: { top: string; left: string };
    positionIndex: number;
    zone: string;
    onSelect: (zone: string, positionIndex: number, player?: { name: string; gender: string }) => void;
    player?: { name: string; gender: string };
    isSelectable: boolean;
}

interface GameContext {
    game: { id: string };
    players: Player[];
    handlePlayerClick: (player: { id: string; name: string; gender: string }) => void;
    getAttackPlayers: () => Player[];
    getDefensePlayers: () => Player[];
    getSubstitutes: () => Player[];
    updatePlayerPosition: (playerId: string, zone: string, positionIndex?: number) => void;
    initialSetupComplete: boolean;
    toggleSetupMode: () => void;
}

// Player component
const PlayerAvatar = ({ player, onClick, isSelected = false }: PlayerAvatarProps) => {
    return (
        <div className={`cursor-pointer transition-all ${isSelected ? 'scale-110 ring-2 ring-yellow-400' : ''}`} onClick={onClick}>
            <div
                className={`flex items-center justify-center rounded-full font-bold text-white ${player.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'} transition-all hover:ring-2 hover:ring-yellow-400`}
                style={{ width: '3rem', height: '3rem' }}
            >
                {player.name.charAt(0)}
            </div>
            <div className="mt-1 rounded bg-white/80 px-1 text-center text-xs font-semibold">{player.name.split(' ')[0]}</div>
        </div>
    );
};

// Position on the field
const FieldPosition = ({ position, positionIndex, zone, onSelect, player, isSelectable }: FieldPositionProps) => {
    return (
        <div
            className={`absolute flex h-16 w-16 items-center justify-center rounded-lg ${isSelectable ? 'cursor-pointer bg-green-200/50 hover:bg-green-200/70' : ''} ${!player ? 'border-2 border-dashed border-gray-300' : ''} transition-colors`}
            style={{
                top: position.top,
                left: position.left,
            }}
            onClick={() => isSelectable && onSelect(zone, positionIndex)}
        >
            {!player && isSelectable && <Plus className="h-6 w-6 text-gray-400" />}
            {player && (
                <PlayerAvatar
                    player={{ ...player, id: positionIndex }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(zone, positionIndex, player);
                    }}
                />
            )}
        </div>
    );
};

export function GameField({ gameContext }: { gameContext: GameContext }) {
    // Extract the toggleSetupMode function from gameContext
    const {
        game,
        players,
        handlePlayerClick,
        getAttackPlayers,
        getDefensePlayers,
        getSubstitutes,
        updatePlayerPosition,
        initialSetupComplete,
        toggleSetupMode,
    } = gameContext;

    // Referência para armazenar o estado anterior dos jogadores
    const prevPlayersRef = useRef(players);

    // Add logs for debugging
    console.log('GameField rendered with players:', players);
    console.log('Attack players:', getAttackPlayers());
    console.log('Defense players:', getDefensePlayers());
    console.log('Substitutes:', getSubstitutes());

    // State for selection mode
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showPositionDialog, setShowPositionDialog] = useState(false);
    const [showPlayerDialog, setShowPlayerDialog] = useState(false);
    const [dialogPosition, setDialogPosition] = useState(null);

    // Estado local para armazenar os jogadores posicionados
    const [localPlayers, setLocalPlayers] = useState(players);

    // Define positions for players in each zone
    const attackPositions = [
        { top: '15%', left: '15%' },
        { top: '15%', left: '60%' },
        { top: '65%', left: '15%' },
        { top: '65%', left: '60%' },
    ];

    const defensePositions = [
        { top: '15%', left: '15%' },
        { top: '15%', left: '60%' },
        { top: '65%', left: '15%' },
        { top: '65%', left: '60%' },
    ];

    // Atualizar o estado local quando os jogadores do contexto mudarem
    useEffect(() => {
        // Verificar se os jogadores realmente mudaram para evitar loops
        if (JSON.stringify(prevPlayersRef.current) !== JSON.stringify(players)) {
            console.log('Players updated from context:', players);
            setLocalPlayers(players);
            prevPlayersRef.current = players;
        }
    }, [players]);

    // Get attack players with their positions
    const attackPlayers = getAttackPlayers();

    // Get defense players with their positions
    const defensePlayers = getDefensePlayers();

    // Get substitutes
    const substitutes = getSubstitutes();

    // Monitor player changes
    useEffect(() => {
        console.log('Players changed:', players);
        console.log('Attack players:', getAttackPlayers());
        console.log('Defense players:', getDefensePlayers());
        console.log('Substitutes:', getSubstitutes());
    }, [players]);

    // Handle selecting a position on the field
    const handleSelectPosition = (zone, positionIndex, player) => {
        console.log(`Position selected: ${zone} at index ${positionIndex}, player: ${player?.name || 'none'}`);

        if (player) {
            // If a player was clicked, select that player
            setSelectedPlayer(player);
            setShowPlayerDialog(true);
        } else if (selectedPlayer) {
            // If a position was clicked and a player is already selected, move the player
            console.log(`Moving player ${selectedPlayer.id} to ${zone} at position ${positionIndex}`);

            // Update local players state for immediate visual feedback
            const updatedLocalPlayers = localPlayers.map((p) =>
                p.id === selectedPlayer.id ? { ...p, position: zone, positionIndex: positionIndex } : p,
            );
            setLocalPlayers(updatedLocalPlayers);

            // Use the updatePlayerPosition function which now handles the logic of when to update backend
            updatePlayerPosition(selectedPlayer.id, zone, positionIndex);

            setSelectedPlayer(null);
        } else {
            // If an empty position was clicked, show the dialog to select a player
            console.log(`Opening dialog to select player for ${zone} at position ${positionIndex}`);
            setDialogPosition({ zone, index: positionIndex });
            setShowPositionDialog(true);
        }
    };

    // Handle assigning a player to a position
    const handleAssignPlayer = (player) => {
        if (dialogPosition) {
            // Ensure we're passing the correct parameters
            console.log(`Assigning player ${player.id} to ${dialogPosition.zone} at position ${dialogPosition.index}`);

            try {
                // Update local players state for immediate visual feedback
                const updatedLocalPlayers = localPlayers.map((p) =>
                    p.id === player.id ? { ...p, position: dialogPosition.zone, positionIndex: dialogPosition.index } : p,
                );
                setLocalPlayers(updatedLocalPlayers);

                // Use the updatePlayerPosition function which now handles the logic of when to update backend
                updatePlayerPosition(player.id, dialogPosition.zone, dialogPosition.index);

                // Clear dialog state
                setDialogPosition(null);
                setShowPositionDialog(false);
            } catch (error) {
                console.error('Error assigning player:', error);
                alert('Error assigning player to position. See console for details.');
            }
        }
    };

    // Handle moving a player to the bench
    const handleMoveToBench = () => {
        if (selectedPlayer) {
            // Update local players state for immediate visual feedback
            const updatedLocalPlayers = localPlayers.map((p) =>
                p.id === selectedPlayer.id ? { ...p, position: 'bench', positionIndex: undefined } : p,
            );
            setLocalPlayers(updatedLocalPlayers);

            // Use the updatePlayerPosition function which now handles the logic of when to update backend
            updatePlayerPosition(selectedPlayer.id, 'bench');

            setSelectedPlayer(null);
            setShowPlayerDialog(false);
        }
    };

    const handleSelectBenchPlayer = (player) => {
        setSelectedPlayer(player);
    };

    // Funções auxiliares para usar o estado local em vez do contexto
    const getLocalAttackPlayers = () => {
        return localPlayers.filter((p) => p.position === 'attack');
    };

    const getLocalDefensePlayers = () => {
        return localPlayers.filter((p) => p.position === 'defense');
    };

    const getLocalSubstitutes = () => {
        return localPlayers.filter((p) => p.position === 'bench' || !p.position);
    };

    // Usar as funções locais para obter os jogadores
    const localAttackPlayers = getLocalAttackPlayers();
    const localDefensePlayers = getLocalDefensePlayers();
    const localSubstitutes = getLocalSubstitutes();

    return (
        <>
            <Card>
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-blue-600"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                        </svg>
                        Korfball Field
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* {selectedPlayer && (
                        <div className="mb-4 flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${selectedPlayer.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}
                                >
                                    {selectedPlayer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{selectedPlayer.name}</p>
                                    <p className="text-sm font-bold text-yellow-600">Click on a position on the field to place this player</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPlayer(null)}>
                                Cancelar
                            </Button>
                        </div>
                    )} */}

                    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border-2 border-green-300 bg-green-100">
                        {/* Center line */}
                        <div className="absolute top-0 left-1/2 h-full w-1 -translate-x-1/2 bg-white"></div>

                        {/* Attack zone */}
                        <div className="absolute top-0 left-0 flex h-full w-1/2 flex-col">
                            <div className="bg-green-200 py-2 text-center font-semibold">
                                <div className="flex items-center justify-center gap-1">
                                    <Swords className="h-4 w-4" /> Attack Zone
                                </div>
                            </div>

                            {/* Korf (basket) */}
                            <div className="absolute top-1/2 left-1/4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400">
                                <div className="h-4 w-4 rounded-full bg-white"></div>
                            </div>

                            {/* Attack positions */}
                            <div className="relative flex-1 p-4">
                                {attackPositions.map((position, index) => {
                                    // Find the player at this specific position using local state
                                    // Importante: Verifique se positionIndex é exatamente igual ao índice
                                    const playerAtPosition = attackPlayers.find((p) => Number(p.positionIndex) === index);

                                    console.log(`Attack position ${index}:`, position, 'Player:', playerAtPosition);

                                    return (
                                        <FieldPosition
                                            key={`attack-${index}`}
                                            position={position}
                                            zone="attack"
                                            positionIndex={index}
                                            player={playerAtPosition}
                                            isSelectable={true}
                                            onSelect={handleSelectPosition}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Defense zone */}
                        <div className="absolute top-0 right-0 flex h-full w-1/2 flex-col">
                            <div className="bg-green-200 py-2 text-center font-semibold">
                                <div className="flex items-center justify-center gap-1">
                                    <Shield className="h-4 w-4" /> Defense Zone
                                </div>
                            </div>

                            {/* Korf (basket) */}
                            <div className="absolute top-1/2 left-3/4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400">
                                <div className="h-4 w-4 rounded-full bg-white"></div>
                            </div>

                            {/* Defense positions */}
                            <div className="relative flex-1 p-4">
                                {defensePositions.map((position, index) => {
                                    // Find the player at this specific position using local state
                                    // Importante: Verifique se positionIndex é exatamente igual ao índice
                                    const playerAtPosition = defensePlayers.find((p) => Number(p.positionIndex) === index);

                                    console.log(`Defense position ${index}:`, position, 'Player:', playerAtPosition);

                                    return (
                                        <FieldPosition
                                            key={`defense-${index}`}
                                            position={position}
                                            zone="defense"
                                            positionIndex={index}
                                            player={playerAtPosition}
                                            isSelectable={true}
                                            onSelect={handleSelectPosition}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Substitutes bench */}
                    <div className="mt-6 rounded-lg border bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                                <path d="M9 2h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v3H4V7a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2z" />
                            </svg>
                            Substitutes Bench
                            <span className="ml-2 text-sm font-normal text-gray-500">(Select a player and then click on a position)</span>
                        </h3>

                        <div className="flex min-h-[100px] flex-wrap gap-3 rounded-md border border-dashed bg-white p-3">
                            {localSubstitutes.length === 0 ? (
                                <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                                    All players are on the field
                                </div>
                            ) : (
                                localSubstitutes.map((player) => (
                                    <PlayerAvatar
                                        key={player.id}
                                        player={player}
                                        onClick={() => handleSelectBenchPlayer(player)}
                                        isSelected={selectedPlayer?.id === player.id}
                                    />
                                ))
                            )}
                        </div>

                        {/* Add a "Complete Setup" button to the UI */}
                        {/* Add this after the "Auto-Assign Players" button */}
                        <div className="mt-4 flex justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                    // Reset all players to bench in local state
                                    const resetPlayers = localPlayers.map((player) => ({
                                        ...player,
                                        position: 'bench',
                                        positionIndex: undefined,
                                    }));
                                    setLocalPlayers(resetPlayers);

                                    // Reset all players to bench on server
                                    localPlayers.forEach((player) => updatePlayerPosition(player.id, 'bench'));
                                }}
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Clear Field
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                        // Auto-assign players based on gender balance (2 males, 2 females per zone)
                                        const availablePlayers = [...getLocalSubstitutes()];
                                        if (availablePlayers.length < 8) {
                                            alert('You need at least 8 players (4 males and 4 females) to auto-assign positions');
                                            return;
                                        }

                                        // Separate players by gender
                                        const malePlayers = availablePlayers.filter((p) => p.gender === 'male');
                                        const femalePlayers = availablePlayers.filter((p) => p.gender === 'female');

                                        if (malePlayers.length < 4 || femalePlayers.length < 4) {
                                            alert('You need at least 4 male and 4 female players to maintain gender balance');
                                            return;
                                        }

                                        // Criar uma cópia do estado local para atualização em lote
                                        let updatedPlayers = [...localPlayers];

                                        // Função auxiliar para atualizar um jogador na cópia
                                        const updatePlayerInBatch = (playerId, newPosition, newIndex) => {
                                            updatedPlayers = updatedPlayers.map((p) =>
                                                p.id === playerId ? { ...p, position: newPosition, positionIndex: newIndex } : p,
                                            );
                                        };

                                        // Assign 2 males and 2 females to attack zone
                                        for (let index = 0; index < 2; index++) {
                                            if (malePlayers.length > 0) {
                                                const player = malePlayers.shift();
                                                updatePlayerInBatch(player.id, 'attack', index);
                                                updatePlayerPosition(player.id, 'attack', index);
                                            }
                                        }
                                        for (let index = 2; index < 4; index++) {
                                            if (femalePlayers.length > 0) {
                                                const player = femalePlayers.shift();
                                                updatePlayerInBatch(player.id, 'attack', index);
                                                updatePlayerPosition(player.id, 'attack', index);
                                            }
                                        }

                                        // Assign 2 males and 2 females to defense zone
                                        for (let index = 0; index < 2; index++) {
                                            if (malePlayers.length > 0) {
                                                const player = malePlayers.shift();
                                                updatePlayerInBatch(player.id, 'defense', index);
                                                updatePlayerPosition(player.id, 'defense', index);
                                            }
                                        }
                                        for (let index = 2; index < 4; index++) {
                                            if (femalePlayers.length > 0) {
                                                const player = femalePlayers.shift();
                                                updatePlayerInBatch(player.id, 'defense', index);
                                                updatePlayerPosition(player.id, 'defense', index);
                                            }
                                        }

                                        // Atualizar o estado local com todas as mudanças
                                        setLocalPlayers(updatedPlayers);
                                    }}
                                >
                                    Auto-Assign Players
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Update the status indicator section to include a toggle button */}
            {!initialSetupComplete ? (
                <div className="mt-4 flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-3">
                    <div className="text-sm text-yellow-700">
                        <strong>Initial Setup Mode: </strong> Position the players in the field.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 bg-green-50 text-xs text-green-700 hover:bg-green-100"
                        onClick={toggleSetupMode}
                    >
                        Complete Setup
                    </Button>
                </div>
            ) : (
                <div className="mt-4 flex items-center justify-between rounded border border-green-200 bg-green-50 p-3">
                    <div className="text-sm text-green-700">
                        <strong>Game Mode</strong> 
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700 hover:bg-yellow-100"
                        onClick={toggleSetupMode}
                    >
                        Return to Setup Mode
                    </Button>
                </div>
            )}

            <div className="mt-4"></div>

            {/* Dialog for player actions */}
            <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Player Actions</DialogTitle>
                        <DialogDescription>What would you like to do with {selectedPlayer?.name}?</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="outline"
                            className="flex items-center justify-start gap-2"
                            onClick={() => {
                                handleMoveToBench();
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                                <path d="M9 2h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v3H4V7a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2z" />
                            </svg>
                            Move to Bench
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center justify-start gap-2"
                            onClick={() => {
                                handlePlayerClick(selectedPlayer);
                                setShowPlayerDialog(false);
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Record Stats
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowPlayerDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog for position selection */}
            <Dialog open={showPositionDialog} onOpenChange={setShowPositionDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Player</DialogTitle>
                        <DialogDescription>Choose a player to place in the {dialogPosition?.zone} zone.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid max-h-[300px] grid-cols-2 gap-4 overflow-y-auto">
                            {localSubstitutes.map((player) => (
                                <Button
                                    key={player.id}
                                    variant="outline"
                                    className="flex h-auto items-center justify-start gap-2 p-3"
                                    onClick={() => handleAssignPlayer(player)}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${player.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}
                                    >
                                        {player.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{player.name}</p>
                                        <p className="text-xs text-gray-500">{player.gender === 'male' ? 'Male' : 'Female'}</p>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowPositionDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
