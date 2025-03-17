"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords, Shield, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player, Game } from "@/pages/games/record"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface GameFieldProps {
  gameContext: {
    game: Game
    players: Player[]
    handlePlayerClick: (player: Player) => void
    getAttackPlayers: () => Player[]
    getDefensePlayers: () => Player[]
    getSubstitutes: () => Player[]
    updatePlayerPosition: (playerId: number, position: string, index: number) => void;
  }
}




// Player component
const PlayerAvatar = ({ player, onClick, isSelected = false }) => {
  return (
    <div
      className={`cursor-pointer transition-all ${isSelected ? "scale-110 ring-2 ring-yellow-400" : ""}`}
      onClick={onClick}
    >
      <div
        className={`flex items-center justify-center rounded-full font-bold text-white
          ${player.gender === "male" ? "bg-blue-400" : "bg-pink-400"}
          hover:ring-2 hover:ring-yellow-400 transition-all`}
        style={{ width: "3rem", height: "3rem" }}
      >
        {player.name.charAt(0)}
      </div>
      <div className="mt-1 rounded bg-white/80 px-1 text-center text-xs font-semibold">{player.name.split(" ")[0]}</div>
    </div>
  )
}

// Position on the field
const FieldPosition = ({ position, positionIndex, zone, onSelect, player, isSelectable }) => {
  return (
    <div
      className={`absolute w-16 h-16 flex items-center justify-center rounded-lg
        ${isSelectable ? "cursor-pointer bg-green-200/50 hover:bg-green-200/70" : ""}
        ${!player ? "border-2 border-dashed border-gray-300" : ""}
        transition-colors`}
      style={{
        top: position.top,
        left: position.left,
      }}
      onClick={() => isSelectable && onSelect(zone, positionIndex)}
    >
      {!player && isSelectable && <Plus className="h-6 w-6 text-gray-400" />}
      {player && (
        <PlayerAvatar
          player={player}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(zone, positionIndex, player)
          }}
        />
      )}
    </div>
  )
}

export function GameField({ gameContext }: GameFieldProps) {
  // Adicionar logs para depuração
  console.log("GameField received gameContext:", gameContext);
  console.log("updatePlayerPosition type:", typeof gameContext.updatePlayerPosition);
  const { 
    game, 
    players, 
    handlePlayerClick, 
    getAttackPlayers, 
    getDefensePlayers, 
    getSubstitutes,
    updatePlayerPosition 
  } = gameContext
  

  // Adicionar logs para depuração
  console.log("GameField rendered with players:", players);
  console.log("Attack players:", getAttackPlayers());
  console.log("Defense players:", getDefensePlayers());
  console.log("Substitutes:", getSubstitutes());

  // State for selection mode
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<{zone: 'attack' | 'defense' | 'bench', index?: number} | null>(null)
  const [showPositionDialog, setShowPositionDialog] = useState(false)
  const [showPlayerDialog, setShowPlayerDialog] = useState(false)
  const [dialogPosition, setDialogPosition] = useState<{zone: 'attack' | 'defense', index: number} | null>(null)

  // Define positions for players in each zone
  const attackPositions = [
    { top: "15%", left: "15%" },
    { top: "15%", left: "60%" },
    { top: "65%", left: "15%" },
    { top: "65%", left: "60%" },
  ]

  const defensePositions = [
    { top: "15%", left: "15%" },
    { top: "15%", left: "60%" },
    { top: "65%", left: "15%" },
    { top: "65%", left: "60%" },
  ]

  // Get attack players with their positions
  const attackPlayers = getAttackPlayers()
  
  // Get defense players with their positions
  const defensePlayers = getDefensePlayers()
  
  // Get substitutes
  const substitutes = getSubstitutes()

  // Handle selecting a position on the field
  const handleSelectPosition = (zone: 'attack' | 'defense', positionIndex: number, player?: Player) => {
    console.log(`Position selected: ${zone} at index ${positionIndex}, player: ${player?.name || 'none'}`);
  
    if (player) {
      // Se um jogador foi clicado, selecione esse jogador
      setSelectedPlayer(player);
      setSelectedPosition({ zone, index: positionIndex });
      setShowPlayerDialog(true);
    } else if (selectedPlayer) {
      // Se uma posição foi clicada e um jogador já está selecionado, mova o jogador
      console.log(`Moving player ${selectedPlayer.id} to ${zone} at position ${positionIndex}`);
      updatePlayerPosition(selectedPlayer.id, zone, positionIndex);
      setSelectedPlayer(null);
    } else {
      // Se uma posição vazia foi clicada, mostre o diálogo para selecionar um jogador
      console.log(`Opening dialog to select player for ${zone} at position ${positionIndex}`);
      setDialogPosition({ zone, index: positionIndex });
      setShowPositionDialog(true);
    }
  }

  // Handle selecting a player from the bench
  const handleSelectBenchPlayer = (player: Player) => {
    // Seleciona o jogador e mostra uma mensagem indicando que o usuário deve clicar em uma posição
    setSelectedPlayer(player);
    // Limpa qualquer posição selecionada anteriormente
    setSelectedPosition(null);
  };

  // Handle moving a player to the bench
  const handleMoveToBench = () => {
    if (selectedPlayer) {
      updatePlayerPosition(selectedPlayer.id, 'bench')
      setSelectedPlayer(null)
      setShowPlayerDialog(false)
    }
  }

  // Handle assigning a player to a position
  const handleAssignPlayer = (player: Player) => {
    if (dialogPosition) {
      // Vamos garantir que estamos passando os parâmetros corretos
      console.log(`Assigning player ${player.id} to ${dialogPosition.zone} at position ${dialogPosition.index}`);
      
      // Verificar se updatePlayerPosition é uma função
      if (typeof updatePlayerPosition !== 'function') {
        console.error('updatePlayerPosition is not a function', updatePlayerPosition);
        alert('Erro ao atualizar a posição do jogador. Veja o console para mais detalhes.');
        return;
      }
      
      // Chama a função do contexto para atualizar a posição do jogador
      updatePlayerPosition(player.id, dialogPosition.zone, dialogPosition.index);
      
      // Limpa o estado do diálogo
      setDialogPosition(null);
      setShowPositionDialog(false);
    }
  }

  // Handle swapping two players
  const handleSwapPlayers = (player1: Player, player2: Player) => {
    // Get current positions
    const player1Zone = player1.zone
    const player1Index = player1.positionIndex
    const player2Zone = player2.zone
    const player2Index = player2.positionIndex

    // Swap positions
    updatePlayerPosition(player1.id, player2Zone, player2Index)
    updatePlayerPosition(player2.id, player1Zone, player1Index)
  }

  return (
    <>
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Korfball Field Setup
          </CardTitle>
        </CardHeader>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-1">Como usar:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-5">
            <li>Selecione um jogador do banco de reservas</li>
            <li>Clique em uma posição vazia no campo para colocá-lo</li>
            <li>Para mover um jogador, clique nele e depois clique em uma nova posição</li>
            <li>Para remover um jogador do campo, clique nele e selecione "Mover para o Banco"</li>
          </ol>
        </div>
        <CardContent className="p-6">
          {selectedPlayer && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${selectedPlayer.gender === "male" ? "bg-blue-400" : "bg-pink-400"}`}>
                  {selectedPlayer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{selectedPlayer.name}</p>
                  <p className="text-sm font-bold text-yellow-600">Clique em uma posição no campo para colocar este jogador</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedPlayer(null)}>
                Cancelar
              </Button>
            </div>
          )}

          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border-2 border-green-300 bg-green-100">
            {/* Center line */}
            <div className="absolute top-0 left-1/2 h-full w-1 -translate-x-1/2 bg-white"></div>

            {/* Attack zone */}
            <div className="absolute top-0 left-0 flex h-full w-1/2 flex-col">
              <div className="py-2 text-center font-semibold bg-green-200">
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
                  // Encontre o jogador nesta posição específica
                  const playerAtPosition = attackPlayers.find(p => p.positionIndex === index);
                  
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
                  )
                })}
              </div>
            </div>

            {/* Defense zone */}
            <div className="absolute top-0 right-0 flex h-full w-1/2 flex-col">
              <div className="py-2 text-center font-semibold bg-green-200">
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
                  // Encontre o jogador nesta posição específica
                  const playerAtPosition = defensePlayers.find(p => p.positionIndex === index);
                  
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
                  )
                })}
              </div>
            </div>
          </div>

          {/* Substitutes bench */}
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="mb-3 font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                <path d="M9 2h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v3H4V7a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2z" />
              </svg>
              Substitutes Bench
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Select a player and then click on a position)
              </span>
            </h3>
            
            <div className="flex flex-wrap gap-3 p-3 min-h-[100px] rounded-md bg-white border border-dashed">
              {substitutes.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  All players are on the field
                </div>
              ) : (
                substitutes.map((player) => (
                  <PlayerAvatar 
                    key={player.id} 
                    player={player} 
                    onClick={() => handleSelectBenchPlayer(player)}
                    isSelected={selectedPlayer?.id === player.id}
                  />
                ))
              )}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  // Reset all players to bench
                  players.forEach(player => updatePlayerPosition(player.id, 'bench'))
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear Field
              </Button>
              
              <Button 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  // Auto-assign players based on gender balance (2 males, 2 females per zone)
                  const availablePlayers = [...getSubstitutes()];
                  if (availablePlayers.length < 8) {
                    alert("You need at least 8 players (4 males and 4 females) to auto-assign positions");
                    return;
                  }
                  
                  // Separate players by gender
                  const malePlayers = availablePlayers.filter(p => p.gender === "male");
                  const femalePlayers = availablePlayers.filter(p => p.gender === "female");
                  
                  if (malePlayers.length < 4 || femalePlayers.length < 4) {
                    alert("You need at least 4 male and 4 female players to maintain gender balance");
                    return;
                  }
                  
                  // Assign 2 males and 2 females to attack zone
                  for (let index = 0; index < 2; index++) {
                    if (malePlayers.length > 0) {
                      updatePlayerPosition(malePlayers.shift().id, 'attack', index);
                    }
                  }
                  for (let index = 2; index < 4; index++) {
                    if (femalePlayers.length > 0) {
                      updatePlayerPosition(femalePlayers.shift().id, 'attack', index);
                    }
                  }
                  
                  // Assign 2 males and 2 females to defense zone
                  for (let index = 0; index < 2; index++) {
                    if (malePlayers.length > 0) {
                      updatePlayerPosition(malePlayers.shift().id, 'defense', index);
                    }
                  }
                  for (let index = 2; index < 4; index++) {
                    if (femalePlayers.length > 0) {
                      updatePlayerPosition(femalePlayers.shift().id, 'defense', index);
                    }
                  }
                }}
              >
                Auto-Assign Players
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for player actions */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Player Actions</DialogTitle>
            <DialogDescription>
              What would you like to do with {selectedPlayer?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-2"
              onClick={() => {
                handleMoveToBench();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
            <DialogDescription>
              Choose a player to place in the {dialogPosition?.zone} zone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
              {substitutes.map((player) => (
                <Button 
                  key={player.id}
                  variant="outline" 
                  className="flex items-center justify-start gap-2 h-auto p-3"
                  onClick={() => handleAssignPlayer(player)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${player.gender === "male" ? "bg-blue-400" : "bg-pink-400"}`}>
                    {player.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{player.name}</p>
                    <p className="text-xs text-gray-500">{player.gender === "male" ? "Male" : "Female"}</p>
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
  )
}

