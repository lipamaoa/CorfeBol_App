import type { Event } from "@/pages/games/record"

interface ApiResponse {
  success: boolean
  event?: Event
  message?: string
}

interface EventData {
  game_id: number
  name: string
  start_time?: string
  player_id: number
}

interface CreateEventResponse {
  success?: boolean
  message?: string
  error?: string
  [key: string]: unknown
}

export async function createEvent(data: EventData): Promise<CreateEventResponse> {
  if (!data.player_id) {
    throw new Error("The player_id field is required.")
  }

  const response = await fetch("/api/events/start-phase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_id: data.game_id,
      name: data.name === "attack" || data.name === "defense" ? data.name : "attack",
      start_time: data.start_time || new Date().toLocaleTimeString(),
      player_id: data.player_id
    })
  })

  if (!response.ok) {
    throw new Error(`Error creating event: ${response.statusText}`)
  }

  return await response.json()
}




export async function endEvent(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/end-phase`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        end_time: new Date().toLocaleTimeString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error ending event:", error);
    throw error;
  }
}

export async function getCurrentEvent(gameId) {
  try {
    const response = await fetch(`/api/games/${gameId}/current-phase`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting current event:", error);
    throw error;
  }
}

export async function updateEvent(id: number, eventData: Partial<Event>): Promise<ApiResponse> {
  try {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

    const response = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-TOKEN": csrfToken,
        credentials: "include",
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      event: data.event,
    }
  } catch (error) {
    console.error("Error updating event:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deleteEvent(id: number): Promise<ApiResponse> {
  try {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-TOKEN": csrfToken,
        credentials: "include",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error: ${response.status}`)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting event:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch("/api/events", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching events:", error)
    throw error
  }
}

export async function getEvent(id: number): Promise<Event> {
  try {
    const response = await fetch(`/api/events/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching event:", error)
    throw error
  }
}
