import type { Stat } from "@/pages/games/record"

interface ApiResponse {
  success: boolean
  event?: Stat
  message?: string
}

export async function createStat(eventData: Omit<Stat, "id" | "created_at">): Promise<ApiResponse> {
  try {
    // Get the CSRF token from the meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

    const response = await fetch("/api/stats", {
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
    console.error("Error creating stat:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updateStat(id: number, eventData: Partial<Stat>): Promise<ApiResponse> {
  try {
   
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

    const response = await fetch(`/api/stats/${id}`, {
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
    console.error("Error updating stat:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deleteStat(id: number): Promise<ApiResponse> {
  try {
   
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

    const response = await fetch(`/api/stats/${id}`, {
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
    console.error("Error deleting stat:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
