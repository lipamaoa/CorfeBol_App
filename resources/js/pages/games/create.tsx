'use client';

import React from 'react';

import { DatePicker } from '@/components/datePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head } from '@inertiajs/react';
import { eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, parseISO, startOfMonth } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/navbar';
import AppLayout from '@/layouts/app-layout';
import Footer from '@/components/footer';
import { router } from "@inertiajs/react"
import { DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';




interface Team {
    id: number;
    name: string;
}

interface Game {
    id: number;
    team_a_id: Team;
    team_b_id: Team;
    date: string;
    time: string;
    location: string;
}

interface FormData {
    team_a_id: number;
    team_b_id: number;
    date: string;
    //time: string;
    location: string;
}

interface CreateProps {
    game?: Game[];
}

export default function Create({ game }: CreateProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [formData, setFormData] = useState({
        team_a_id: '',
        team_b_id: '',
        date: format(date, 'yyyy-MM-dd'),
        //time: '19:00',
        location: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [isEditGameOpen, setIsEditGameOpen] = useState(false)
    const [isDeleteGameOpen, setIsDeleteGameOpen] = useState(false)


    const handleAddGame = () => {
        router.post("/games", formData, {
            onSuccess: () => {
                //setIsAddTeamOpen(false)
                setFormData({
                    team_a_id: '',
                    team_b_id: '',
                    date: format(date, 'yyyy-MM-dd'),
                    location: ''
                })
            },
        })
    }

    const handleEditGame = () => {
        if (!selectedGame) return

        router.put(`/games/${selectedGame.id}`, formData, {
            onSuccess: () => {
                setIsEditGameOpen(false)
                setSelectedGame(null)
            },
        })
    }

    const handleDeleteGame = () => {
        if (!selectedGame) return

        router.delete(`/games/${selectedGame.id}`, {
            onSuccess: () => {
                setIsDeleteGameOpen(false)
                setSelectedGame(null)
            },
        })
    }

    const openEditDialog = (game: Game) => {
        setSelectedGame(game)
        setFormData({
            team_a_id: "",
            team_b_id: "",
            date: format(date, 'yyyy-MM-dd'),
            location: "",
        })
        setIsEditGameOpen(true)
    }

    const openDeleteDialog = (game: Game) => {
        setSelectedGame(game)
        setIsDeleteGameOpen(true)
    }



    // Mock data for teams (would come from backend later)
    const teams: Team[] = [
        { id: 1, name: 'Sporting CP' },
        { id: 2, name: 'Benfica' },
        { id: 3, name: 'FC Porto' },
        { id: 4, name: 'Belenenses' },
    ];

    // Mock data for scheduled games
    const scheduledGames: Game[] = [
        {
            id: 1,
            team_a_id: teams[0],
            team_b_id: teams[1],
            date: '2025-03-10',
            time: '19:00',
            location: 'Lisbon Sports Arena',
        },
        {
            id: 2,
            team_a_id: teams[2],
            team_b_id: teams[3],
            date: '2025-03-15',
            time: '18:30',
            location: 'Porto Stadium',
        },
        {
            id: 3,
            team_a_id: teams[1],
            team_b_id: teams[2],
            date: '2025-03-20',
            time: '20:00',
            location: 'Benfica Arena',
        },
        {
            id: 4,
            team_a_id: teams[3],
            team_b_id: teams[0],
            date: '2025-03-25',
            time: '19:30',
            location: 'Belenenses Stadium',
        },
        {
            id: 5,
            team_a_id: teams[0],
            team_b_id: teams[2],
            date: '2025-04-05',
            time: '18:00',
            location: 'Lisbon Sports Arena',
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const team_a_id = parseInt(formData.team_a_id, 10);
        const team_b_id = parseInt(formData.team_b_id, 10);

        // Validate form
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.team_a_id) {
            newErrors.team_a_id = 'Home team is required';
        }

        if (!formData.team_b_id) {
            newErrors.team_b_id = 'Away team is required';
        }

        if (formData.team_a_id === formData.team_b_id && formData.team_a_id) {
            newErrors.team_a_id = 'Away team must be different from home team';
        }

        if (!formData.location) {
            newErrors.location = 'Location is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Handle form submission - would post to server in real app
            console.log('Form submitted:', formData);
        }
    };

    // Calendar navigation functions
    const nextMonth = () => {
        setCurrentMonth((month) => {
            const next = new Date(month);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    };

    const prevMonth = () => {
        setCurrentMonth((month) => {
            const prev = new Date(month);
            prev.setMonth(prev.getMonth() - 1);
            return prev;
        });
    };

    // Get days for current month view
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get games for selected date
    const getGamesForDate = (date: Date) => {
        return scheduledGames.filter((game) => {
            const gameDate = parseISO(game.date);
            return isSameDay(gameDate, date);
        });
    };

    // Check if a date has games
    const hasGames = (date: Date) => {
        return getGamesForDate(date).length > 0;
    };

    // Get all games for selected date
    const selectedDateGames = selectedDate ? getGamesForDate(selectedDate) : [];

    return (
        <>
            <Navbar />
            <AppLayout breadcrumbs={[{ title: "Schedule", href: "/dashboard" }]}>
                <Head title="Game Management" />

                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Game Management</h1>
                            <p className="text-gray-500">Schedule and manage your korfball games</p>
                        </div>

                        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="calendar" className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Game Calendar
                                </TabsTrigger>
                                <TabsTrigger value="create" className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create New Game
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="calendar" className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {/* Calendar */}
                                    <Card className="md:col-span-2">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Game Schedule</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={prevMonth}>
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
                                                    <Button variant="outline" size="icon" onClick={nextMonth}>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardDescription>Click on a date to view scheduled games</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Calendar grid */}
                                            <div className="grid grid-cols-7 gap-1 text-center">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                    <div key={day} className="py-2 text-sm font-medium text-gray-500">
                                                        {day}
                                                    </div>
                                                ))}

                                                {/* Fill in empty cells for days of week before the first of the month */}
                                                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                                                    <div key={`empty-start-${index}`} className="h-12 rounded-md p-1" />
                                                ))}

                                                {/* Calendar days */}
                                                {calendarDays.map((day) => {
                                                    const isToday = isSameDay(day, new Date());
                                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                                    const dayHasGames = hasGames(day);

                                                    return (
                                                        <button
                                                            key={day.toISOString()}
                                                            onClick={() => setSelectedDate(day)}
                                                            className={`relative h-12 rounded-md p-1 ${isToday ? 'bg-blue-50 text-blue-600' : ''} ${isSelected ? 'bg-blue-100 font-medium text-blue-700' : ''
                                                                } ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''} hover:bg-gray-100`}
                                                        >
                                                            <span className="block text-sm">{format(day, 'd')}</span>
                                                            {dayHasGames && (
                                                                <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-500"></div>
                                                            )}
                                                        </button>
                                                    );
                                                })}

                                                {/* Fill in empty cells for days of week after the last of the month */}
                                                {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                                                    <div key={`empty-end-${index}`} className="h-12 rounded-md p-1" />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Game details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {selectedDate ? `Games on ${format(selectedDate, 'MMMM d, yyyy')}` : 'Select a date'}
                                            </CardTitle>
                                            <CardDescription>
                                                {selectedDateGames.length
                                                    ? `${selectedDateGames.length} game(s) scheduled`
                                                    : 'No games scheduled for this date'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ScrollArea className="h-[400px] pr-4">
                                                {selectedDateGames.length === 0 && !selectedDate && (
                                                    <div className="flex h-32 items-center justify-center text-center">
                                                        <p className="text-sm text-gray-500">Select a date on the calendar to view scheduled games</p>
                                                    </div>
                                                )}

                                                {selectedDateGames.length === 0 && selectedDate && (
                                                    <div className="flex h-32 items-center justify-center text-center">
                                                        <div>
                                                            <p className="mb-4 text-sm text-gray-500">No games scheduled for this date</p>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setActiveTab('create');
                                                                    setDate(selectedDate);
                                                                    setFormData({
                                                                        ...formData,
                                                                        date: format(selectedDate, 'yyyy-MM-dd'),
                                                                    });
                                                                }}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Schedule Game
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/*Edit Game*/}
                                                <div className="space-y-4">
                                                    {selectedDateGames.map((game: Game) => (
                                                        <Card key={game.id} className="overflow-hidden">
                                                            <div className="flex items-center justify-between bg-blue-50 px-4 py-2">
                                                                <h3 className="font-medium">
                                                                    {game.team_a_id.name} vs {game.team_b_id.name}
                                                                </h3>
                                                                <Badge variant="outline" className="bg-white">
                                                                    Game #{game.id}
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-2 p-4">
                                                                <div className="flex items-center text-sm">
                                                                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                                                    {game.time}
                                                                </div>
                                                                <div className="flex items-center text-sm">
                                                                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                                                    {game.location}
                                                                </div>
                                                                <div className="mt-2 flex justify-end gap-2">
                                                                    <Button size="sm" variant="outline" onClick={() => openEditDialog(game)}>
                                                                        Edit
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" onClick={() => openDeleteDialog(game)} className="text-red-600">
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Edit Game Dialog */}
                            <Dialog open={isEditGameOpen} onOpenChange={setIsEditGameOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Game</DialogTitle>
                                        <DialogDescription>Update the game details.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-team-name">Home Team</Label>
                                            <Select
                                                value={formData.team_a_id}
                                                onValueChange={(value) => setFormData({ ...formData, team_a_id: value })}
                                            >
                                                <SelectTrigger id="home_team">
                                                    <SelectValue placeholder="Select home team" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teams.map((team) => (
                                                        <SelectItem key={team.id} value={team.id.toString()}>
                                                            {team.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.team_a_id && <p className="text-sm text-red-500">{errors.team_a_id}</p>}

                                            {/*<Input
                                                id="edit-team-name"
                                                value={formData.team_a_id}
                                                onChange={(e) => setFormData({ ...formData, team_a_id: e.target.value })}
                                            />*/}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-team-name">Team B</Label>
                                            <Select
                                                value={formData.team_b_id}
                                                onValueChange={(value) => setFormData({ ...formData, team_b_id: value })}
                                            >
                                                <SelectTrigger id="away_team">
                                                    <SelectValue placeholder="Select away team" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teams.map((team) => (
                                                        <SelectItem key={team.id} value={team.id.toString()}>
                                                            {team.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.team_b_id && <p className="text-sm text-red-500">{errors.team_b_id}</p>}

                                            {/*<Input
                                                id="edit-team-name"
                                                value={formData.team_b_id}
                                                onChange={(e) => setFormData({ ...formData, team_b_id: e.target.value })}
                                            />*/}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="date">Game Date</Label>
                                            <DatePicker
                                                date={date}
                                                onDateChange={(newDate) => {
                                                    if (newDate) {
                                                        setDate(newDate);
                                                        setFormData({ ...formData, date: format(newDate, 'yyyy-MM-dd') });
                                                    }
                                                }}
                                            />
                                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsEditGameOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleEditGame}>Save Changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Delete Game Confirmation Dialog */}
                            <Dialog open={isDeleteGameOpen} onOpenChange={setIsDeleteGameOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Game</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete the game on {selectedGame?.date}? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDeleteGameOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleDeleteGame}>
                                            Delete
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/*Create Game Dialog */}
                            <TabsContent value="create">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Create New Game</CardTitle>
                                        <CardDescription>Schedule a new korfball game by filling out the form below</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                {/* Home Team Select */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="home_team">Home Team</Label>
                                                    <Select
                                                        value={formData.team_a_id}
                                                        onValueChange={(value) => setFormData({ ...formData, team_a_id: value })}
                                                    >
                                                        <SelectTrigger id="home_team">
                                                            <SelectValue placeholder="Select home team" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {teams.map((team) => (
                                                                <SelectItem key={team.id} value={team.id.toString()}>
                                                                    {team.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.team_a_id && <p className="text-sm text-red-500">{errors.team_a_id}</p>}
                                                </div>

                                                {/* Away Team Select */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="away_team">Away Team</Label>
                                                    <Select
                                                        value={formData.team_b_id}
                                                        onValueChange={(value) => setFormData({ ...formData, team_b_id: value })}
                                                    >
                                                        <SelectTrigger id="away_team">
                                                            <SelectValue placeholder="Select away team" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {teams.map((team) => (
                                                                <SelectItem key={team.id} value={team.id.toString()}>
                                                                    {team.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.team_b_id && <p className="text-sm text-red-500">{errors.team_b_id}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                {/* Date Picker */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="date">Game Date</Label>
                                                    <DatePicker
                                                        date={date}
                                                        onDateChange={(newDate) => {
                                                            if (newDate) {
                                                                setDate(newDate);
                                                                setFormData({ ...formData, date: format(newDate, 'yyyy-MM-dd') });
                                                            }
                                                        }}
                                                    />
                                                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                                </div>

                                                {/* Time Input */}
                                                {/*<div className="space-y-2">
                                                    <Label htmlFor="time">Game Time</Label>
                                                    <Input
                                                        id="time"
                                                        type="time"
                                                        value={formData.time}
                                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                    />
                                                    {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                                                </div>*/}

                                                {/* Location Input */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="location">Location</Label>
                                                    <Input
                                                        id="location"
                                                        type="text"
                                                        placeholder="Enter game location"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    />
                                                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-4">
                                                <Button variant="outline" type="button" onClick={() => setActiveTab('calendar')}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleAddGame}>Create Game</Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <Footer />
            </AppLayout>
        </>
    );
}
