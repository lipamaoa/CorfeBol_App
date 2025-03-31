import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; 
}


export interface Player {
    id: number
    name: string
    gender: "male" | "female"
    position: "attack" | "defense" | "bench"
    team_id: number
    positionIndex?: number
    zone?: "attack" | "defense" | "bench"
  }
  
  export interface Action {
    id: number
    code: string
    description: string
  }
  
  export interface Team {
    id: number
    name: string
    logo_url: string | null
  }
  
  export interface Game {
    team_b: Team;
    team_a: Team;
    id: number
    team_a_id: number
    team_b_id: number
    teamA: Team
    teamB: Team
    score_team_a?: number | null
    score_team_b?: number | null
    status: "scheduled" | "in_progress" | "complete"
  }


  export interface Stat {
    id?: number
    game_id: number
    player_id: number | null
    action_id: number
    success: boolean | null
    event_id: number
    description: string
    time: string
  }


  export interface Event {
    id: number
    name: string
    player_id: number
    
  }

  