# Korfball Manager App

## Overview

Korfball Manager is a comprehensive web application for managing teams, players, and game statistics for Korfball. Designed for coaches, team managers, and sports enthusiasts, this tool allows for detailed game recording, player positioning, and performance analysis.

## Key Features

### Team Management
- Create, edit, and delete teams
- View team statistics
- Manage players by team

### Player Management
- Complete player registration with personal information
- Position assignment (attack/defense)
- Individual statistics tracking

### Game Recording
- Creation of new games with date, location, and teams
- Interactive interface for player positioning on the field
- Recording of events during the game (goals, assists, etc.)

### Interactive Korfball Field
- Visual positioning of players in attack and defense zones
- Movement of players between positions
- Substitutions during the game

### Statistics and Analysis
- View statistics by player, team, and game
- Performance charts and visualizations
- Detailed game reports

## Technologies Used

### Frontend
- **React** - JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Reusable UI components
- **Lucide Icons** - Icon library
- **Recharts** - Data visualization library

### Backend
- **Laravel** - PHP web development framework
- **MySQL/PostgreSQL** - Database management system
- **Eloquent ORM** - Laravel's ORM for database interaction

## Project Structure

```
korfball-manager/
├── app/                      # Laravel backend code
│   ├── Http/
│   │   ├── Controllers/      # Application controllers
│   │   └── Middleware/       # Middlewares
│   └── Models/               # Eloquent models
├── database/
│   ├── migrations/           # Database migrations
│   └── seeders/              # Seeders for initial data
├── resources/
│   ├── js/
│   │   ├── Components/       # Reusable React components
│   │   │   ├── Dashboard/    # Dashboard-specific components
│   │   │   └── KorfballField.jsx # Interactive Korfball field
│   │   ├── Layouts/          # Application layouts
│   │   ├── Pages/            # Application pages
│   │   │   ├── Dashboard.tsx # Main dashboard page
│   │   │   ├── Games/        # Game-related pages
│   │   │   ├── Teams/        # Team-related pages
│   │   │   └── Statistics/   # Statistics pages
│   │   └── api/              # API functions for backend communication
│   └── css/                  # CSS files
└── routes/                   # Route definitions
```

## Installation and Setup

### Requirements
- PHP 8.1 or higher
- Composer
- Node.js 16 or higher
- NPM or Yarn
- MySQL/PostgreSQL

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/korfball-stats.git
   cd korfball-stats