import {
    Trophy,
    BellIcon as Whistle,
    UserPlus,
    ArrowLeftRight,
    Clock,
    ShoppingBasketIcon as Basketball,
    Shield,
    Target,
    MoreHorizontal,
  } from "lucide-react"
  
  // Get event icon based on event type
  export const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return <Trophy className="h-4 w-4" />
      case "assist":
        return <Trophy className="h-4 w-4" />
      case "foul":
        return <Whistle className="h-4 w-4" />
      case "substitution":
        return <UserPlus className="h-4 w-4" />
      case "position_switch":
        return <ArrowLeftRight className="h-4 w-4" />
      case "timeout":
        return <Clock className="h-4 w-4" />
      case "rebound":
        return <Basketball className="h-4 w-4" />
      case "defense":
        return <Shield className="h-4 w-4" />
      case "shot":
        return <Target className="h-4 w-4" />
      default:
        return <MoreHorizontal className="h-4 w-4" />
    }
  }
  
  // Get event color based on event type and success
  export const getEventColor = (eventType: string, success: boolean | null) => {
    // If success is defined, override colors based on success/failure
    if (success === true) {
      return "bg-green-100 text-green-800"
    } else if (success === false) {
      return "bg-red-100 text-red-800"
    }
  
    // Default colors by event type
    switch (eventType) {
      case "goal":
        return "bg-green-100 text-green-800"
      case "assist":
        return "bg-emerald-100 text-emerald-800"
      case "foul":
        return "bg-red-100 text-red-800"
      case "substitution":
        return "bg-blue-100 text-blue-800"
      case "position_switch":
        return "bg-indigo-100 text-indigo-800"
      case "timeout":
        return "bg-yellow-100 text-yellow-800"
      case "rebound":
        return "bg-purple-100 text-purple-800"
      case "defense":
        return "bg-blue-100 text-blue-800"
      case "shot":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-200 text-gray-900"
    }
  }
  
  