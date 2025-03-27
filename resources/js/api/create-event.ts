import type { Event } from "@/pages/games/record"

interface ApiResponse {
  success: boolean
  event?: Event
  message?: string
}

export async function createEvent(eventData: Omit<Event, "id" | "created_at" | "updated_at">): Promise<ApiResponse> {
  try {
    // Get the CSRF token from the meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

    const response = await fetch("/api/events", {
      method: "POST",
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
    console.error("Error creating event:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
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
