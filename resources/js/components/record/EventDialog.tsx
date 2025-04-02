"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Player, Action } from "@/types/index"
import {
  Target,
  Heart,
  Shield,
  RefreshCcw,
  RotateCcw,
  X,
  AlertCircle,
  Plus,
  Award,
  Timer,
  Flag,
  BellIcon as Whistle,
  Zap,
  UserPlus,
  Repeat,
  CheckCircle,
  XCircle,
  User,
  ChevronRight,
} from "lucide-react"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  selectedPlayer: Player | null
  setSelectedPlayer: (player: Player | null) => void

  selectedActionId: number | null
  setSelectedActionId: (id: number | null) => void

  eventSuccess: boolean
  setEventSuccess: (success: boolean) => void

  eventDescription: string
  setEventDescription: (desc: string) => void

  /** Agora handleAddEvent recebe o actionId diretamente. */
  handleAddEvent: (actionId: number, success?: boolean) => void

  actions: Action[]
  players: Player[]
}

export function EventDialog({
  open,
  onOpenChange,
  selectedPlayer,
  setSelectedPlayer,
  selectedActionId,
  setSelectedActionId,
  eventSuccess,
  setEventSuccess,
  eventDescription,
  setEventDescription,
  handleAddEvent,
  actions,
  players,
}: EventDialogProps) {
  const [showDescription, setShowDescription] = useState(false)
  const [activeTab, setActiveTab] = useState("players")

  // Se já temos um jogador selecionado, muda para a aba "actions"
  useEffect(() => {
    if (selectedPlayer) {
      setActiveTab("actions")
    } else {
      setActiveTab("players")
    }
  }, [selectedPlayer])

  /** Cores de fundo das ações */
  function getActionColor(code: string): string {
    const colorMap: Record<string, string> = {
      G: "bg-orange-500",
      A: "bg-emerald-600",
      S: "bg-teal-500",
      PS: "bg-amber-500",
      D: "bg-indigo-600",
      RG: "bg-blue-600",
      RP: "bg-sky-500",
      LC: "bg-rose-500",
      LM: "bg-red-600",
      LL: "bg-red-700",
      P: "bg-pink-500",
      MP: "bg-violet-500",
      Pa: "bg-slate-600",
      F: "bg-cyan-600",
      Pe: "bg-green-700",
      T: "bg-zinc-600",
      O: "bg-neutral-500",
      GS: "bg-red-500", // Adicionado para Gol Sofrido
    }
    return colorMap[code] || "bg-gray-500"
  }

  /** Ícones das ações */
  function getActionIcon(code: string) {
    const iconMap: Record<string, React.ReactNode> = {
      G: <Award className="h-4 w-4" />,
      A: <Heart className="h-4 w-4" />,
      S: <UserPlus className="h-4 w-4" />,
      PS: <Repeat className="h-4 w-4" />,
      D: <Shield className="h-4 w-4" />,
      RG: <RefreshCcw className="h-4 w-4" />,
      RP: <RotateCcw className="h-4 w-4" />,
      LC: <Target className="h-4 w-4" />,
      LM: <Target className="h-4 w-4" />,
      LL: <Target className="h-4 w-4" />,
      P: <Target className="h-4 w-4" />,
      MP: <X className="h-4 w-4" />,
      Pa: <AlertCircle className="h-4 w-4" />,
      F: <Whistle className="h-4 w-4" />,
      Pe: <Flag className="h-4 w-4" />,
      T: <Timer className="h-4 w-4" />,
      O: <Plus className="h-4 w-4" />,
      GS: <Target className="h-4 w-4" />, // Adicionado para Gol Sofrido
    }
    return iconMap[code] || <Zap className="h-4 w-4" />
  }

  /** Clique no jogador */
  function handlePlayerSelect(player: Player) {
    setSelectedPlayer(player)
  }

  /**
   * Quando o usuário clica na ação,
   * chamamos diretamente handleAddEvent(actionId).
   */
  function handleActionClick(actionId: number) {
    setSelectedActionId(actionId)

    const action = actions.find((a) => a.id === actionId)
    if (!action || !selectedPlayer) return

    // Passamos actionId pro pai
    handleAddEvent(actionId, eventSuccess)
  }

  // Separa jogadores por posição
  const attackPlayers = players.filter((p) => p.position === "attack")
  const defensePlayers = players.filter((p) => p.position === "defense")
  const benchPlayers = players.filter((p) => p.position === "bench" || !p.position)

  // Filtra ações com base na posição do jogador selecionado
  const getFilteredActions = () => {
    if (!selectedPlayer) return actions

    // Códigos de ações para cada posição
    const attackActionCodes = ["G", "A", "LC", "LM", "LL", "L", "Pe", "MP", "Pa", "RP", "S", "PS", "O"]
    const defenseActionCodes = ["D", "RG", "GS", "F", "RB", "I", "B", "S", "PS", "O"]

    // Se o jogador está na defesa, mostrar apenas ações defensivas
    if (selectedPlayer.position === "defense") {
      return actions.filter((action) => defenseActionCodes.includes(action.code))
    }

    // Se o jogador está no ataque, mostrar apenas ações ofensivas
    if (selectedPlayer.position === "attack") {
      return actions.filter((action) => attackActionCodes.includes(action.code))
    }

    // Para jogadores no banco ou sem posição definida, mostrar todas as ações
    return actions
  }

  const filteredActions = getFilteredActions()

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // Reset quando fechar
          setSelectedPlayer(null)
          setSelectedActionId(null)
          setEventDescription("")
          setEventSuccess(true)
          setShowDescription(false)
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            {selectedPlayer && (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                  selectedPlayer.gender === "male" ? "bg-blue-500" : "bg-pink-500"
                }`}
              >
                {selectedPlayer.name.charAt(0)}
              </div>
            )}
            <span>{selectedPlayer ? `${selectedPlayer.name}'s Action` : "Record Action"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {selectedPlayer ? "Click on an action to record it" : "Select a player first, then choose an action"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="actions" disabled={!selectedPlayer}>
              Actions
            </TabsTrigger>
          </TabsList>

          {/* TAB: Players */}
          <TabsContent value="players">
            {!players.length && <div className="text-center text-gray-500">No players available.</div>}
            <ScrollArea className="h-[300px] pr-4">
              {/* Attack */}
              {attackPlayers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-blue-500" />
                    Attack Players
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {attackPlayers.map((player) => (
                      <Button
                        key={player.id}
                        variant="outline"
                        className="justify-start h-auto py-2"
                        onClick={() => handlePlayerSelect(player)}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white font-bold ${
                            player.gender === "male" ? "bg-blue-400" : "bg-pink-400"
                          }`}
                        >
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-sm truncate">{player.name}</span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Defense */}
              {defensePlayers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-indigo-500" />
                    Defense Players
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {defensePlayers.map((player) => (
                      <Button
                        key={player.id}
                        variant="outline"
                        className="justify-start h-auto py-2"
                        onClick={() => handlePlayerSelect(player)}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white font-bold ${
                            player.gender === "male" ? "bg-blue-400" : "bg-pink-400"
                          }`}
                        >
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-sm truncate">{player.name}</span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bench */}
              {benchPlayers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    Bench Players
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {benchPlayers.map((player) => (
                      <Button
                        key={player.id}
                        variant="outline"
                        className="justify-start h-auto py-2"
                        onClick={() => handlePlayerSelect(player)}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white font-bold ${
                            player.gender === "male" ? "bg-blue-400" : "bg-pink-400"
                          }`}
                        >
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-sm truncate">{player.name}</span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* TAB: Actions */}
          <TabsContent value="actions">
            <div>
              {/* Success/Failure Toggle */}
              <div className="mb-4 flex justify-center">
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1.5 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setEventSuccess(true)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs transition-colors ${
                      eventSuccess
                        ? "bg-green-500 text-white"
                        : "bg-transparent text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Success</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventSuccess(false)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs transition-colors ${
                      !eventSuccess
                        ? "bg-red-500 text-white"
                        : "bg-transparent text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Failure</span>
                  </button>
                </div>
              </div>

              {/* Selected Player Info */}
              {selectedPlayer && (
                <div className="mb-3 p-2 bg-blue-50 rounded-md flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white font-bold ${
                      selectedPlayer.gender === "male" ? "bg-blue-400" : "bg-pink-400"
                    }`}
                  >
                    {selectedPlayer.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    Recording for: {selectedPlayer.name} ({selectedPlayer.position})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 text-xs text-blue-600"
                    onClick={() => setSelectedPlayer(null)}
                  >
                    Change
                  </Button>
                </div>
              )}

              {/* Actions Grid */}
              <div className="grid grid-cols-4 gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                {filteredActions.map((action) => {
                  const isSelected = action.id === selectedActionId
                  return (
                    <button
                      key={action.id}
                      className={`${getActionColor(action.code)} rounded-md p-2 text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none ${
                        isSelected ? "ring-2 ring-white ring-opacity-70 scale-105 shadow-md" : ""
                      }`}
                      onClick={() => handleActionClick(action.id)}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-white/20 rounded-full p-1 mb-1">{getActionIcon(action.code)}</div>
                        <div className="text-center text-[10px] font-medium leading-tight">{action.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Optional Description Toggle */}
              <div className="mt-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-xs py-1 h-7"
                >
                  {showDescription ? "Hide Description" : "Add Description"}
                </Button>
              </div>

              {/* Description Field (Optional) */}
              {showDescription && (
                <div className="mt-2 space-y-2">
                  <Textarea
                    placeholder="Add details about this event (optional)"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="min-h-[60px] text-xs"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (!selectedActionId) {
                          alert("Please select an action first.")
                          return
                        }
                        handleAddEvent(selectedActionId, eventSuccess)
                      }}
                      disabled={!selectedActionId}
                      size="sm"
                      className="text-xs py-1 h-7"
                    >
                      Add Event
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

