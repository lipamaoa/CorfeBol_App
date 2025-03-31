"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GameReport } from "@/components/record/GameReport"
import { Button } from "@/components/ui/button"
import { X, Loader2, Download, Printer } from "lucide-react"
import type { Game, Player, Stat, Action } from "@/types"

interface GameReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: Game | null
}

export function GameReportDialog({ open, onOpenChange, game }: GameReportDialogProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !game?.id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/games/${game.id}/report`)
        if (!res.ok) {
          throw new Error(`Error fetching game data: ${res.status}`)
        }
        const data = await res.json()
        console.log("Fetched game report data:", data)
        setPlayers(data.players || [])
        setStats(data.stats || [])
        setActions(data.actions || [])
      } catch (err) {
        console.error("Failed to fetch game report data", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching game data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, game?.id])

  // Function to handle printing the report
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir o relatório")
      return
    }

    // Get the report content
    const reportContent = document.getElementById("game-report-content")
    if (!reportContent) return

    // Write the HTML to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Jogo - ${game?.team_a.name} vs ${game?.team_b.name}</title>
          <link rel="stylesheet" href="/css/app.css">
          <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .score { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
            .team-score { text-align: center; }
            .team-name { font-weight: bold; }
            .score-value { font-size: 24px; font-weight: bold; }
            h2 { margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          </style>
        </head>
        <body>
          ${reportContent.innerHTML}
        </body>
      </html>
    `)

    // Wait for resources to load then print
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  // Substitua a função handleExport atual por esta versão que exporta para CSV
  const handleExport = () => {
    if (!game) return

    // Função auxiliar para escapar valores CSV
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return ""
      const stringValue = String(value)
      // Se o valor contém vírgula, aspas ou quebra de linha, envolva em aspas duplas
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        // Substitua aspas duplas por duas aspas duplas (padrão CSV)
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    // Função para converter array de objetos em CSV
    const objectsToCSV = (data: any[]) => {
      if (data.length === 0) return ""

      // Obter cabeçalhos das colunas (todas as chaves do primeiro objeto)
      const headers = Object.keys(data[0])

      // Criar linha de cabeçalho
      const headerRow = headers.map(escapeCSV).join(",")

      // Criar linhas de dados
      const rows = data.map((obj) => headers.map((header) => escapeCSV(obj[header])).join(","))

      // Juntar cabeçalho e linhas com quebras de linha
      return [headerRow, ...rows].join("\n")
    }

    // Preparar dados do jogo
    const gameData = [
      {
        id: game.id,
        date: game.date,
        teams: `${game.team_a.name} vs ${game.team_b.name}`,
        score_team_a: game.score_team_a,
        score_team_b: game.score_team_b,
        location: game.location || "",
      },
    ]

    // Preparar dados dos jogadores
    const playerData = players.map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position || "",
      team: player.team_id === game.team_a_id ? game.team_a.name : game.team_b.name,
    }))

    // Preparar dados das estatísticas
    const statData = stats.map((stat) => {
      const action = actions.find((a) => a.id === stat.action_id)
      return {
        id: stat.id,
        player: players.find((p) => p.id === stat.player_id)?.name || "Unknown",
        action: action?.description || "Unknown action",
        success: stat.success ? "Yes" : "No",
        time: stat.time || "",
        description: stat.description || "",
      }
    })

    // Criar conteúdo CSV para cada seção
    const gameCSV = objectsToCSV(gameData)
    const playerCSV = objectsToCSV(playerData)
    const statCSV = objectsToCSV(statData)

    // Combinar todas as seções com cabeçalhos
    const fullCSV = ["# GAME INFO", gameCSV, "", "# PLAYERS", playerCSV, "", "# STATISTICS", statCSV].join("\n")

    // Criar blob e download
    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `game_report_${game.id}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  const gameContext = {
    game,
    players,
    events: stats,
    actions,
    matchTime: 0, // pode deixar 0 para o relatório
    isRunning: false,
    period: 1,
    score: game?.score_team_a ?? 0,
    opponentScore: game?.score_team_b ?? 0,
    teamName: game?.team_a?.name ?? "Team A",
    teamALogo: game?.team_a?.logo_url ?? null,
    teamBLogo: game?.team_b?.logo_url ?? null,
    opponentName: game?.team_b?.name ?? "Team B",
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pt-3">
          <DialogTitle>Game Report</DialogTitle>
          <div className="flex gap-2">
            {!loading && !error && (
              <>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-1 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-1 h-4 w-4" />
                  Print
                </Button>
              </>
            )}
        
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <div id="game-report-content">
            {game && <GameReport gameContext={gameContext} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

