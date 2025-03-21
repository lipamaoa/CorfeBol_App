import axios from "axios"

/**
 * Update a player's position in a game
 */
export const updatePlayerPosition = async (gameId:number, playerId: number, zone: string) => {
  try {
    const response = await axios.post("/api/game-players/update-position", {
      game_id: gameId,
      player_id: playerId,
      initial_position: zone,
      
    })

    return response.data
  } catch (error) {
    console.error("Error updating player position:", error)
    throw error
  }
}

/**
 * Get all players for a game with their positions
 */
export const getGamePlayers = async (gameId: number) => {
  try {
    const response = await axios.get(`/api/games/${gameId}/players`)
    return response.data
  } catch (error) {
    console.error("Error fetching game players:", error)
    throw error
  }
}

