'use client';

import { DatePicker } from '@/components/datePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';

interface Team {
    id: number;
    name: string;
}

interface FormData {
    home_team_id: string;
    away_team_id: string;
    date: string;
    time: string;
    location: string;
}

export default function Create() {
    const [date, setDate] = useState<Date>(new Date());
    const [formData, setFormData] = useState<FormData>({
        home_team_id: '',
        away_team_id: '',
        date: format(date, 'yyyy-MM-dd'),
        time: '19:00',
        location: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    // Mock data for teams (would come from backend later)
    const teams: Team[] = [
        { id: 1, name: 'Sporting CP' },
        { id: 2, name: 'Benfica' },
        { id: 3, name: 'FC Porto' },
        { id: 4, name: 'Belenenses' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate form
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.home_team_id) {
            newErrors.home_team_id = 'Home team is required';
        }

        if (!formData.away_team_id) {
            newErrors.away_team_id = 'Away team is required';
        }

        if (formData.home_team_id === formData.away_team_id && formData.home_team_id) {
            newErrors.away_team_id = 'Away team must be different from home team';
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

    return (
        <>
            <Head title="Create New Game" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Home Team Select */}
                                <div className="space-y-2">
                                    <Label htmlFor="home_team">Home Team</Label>
                                    <Select
                                        value={formData.home_team_id}
                                        onValueChange={(value) => setFormData({ ...formData, home_team_id: value })}
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
                                    {errors.home_team_id && <p className="text-sm text-red-500">{errors.home_team_id}</p>}
                                </div>

                                {/* Away Team Select */}
                                <div className="space-y-2">
                                    <Label htmlFor="away_team">Away Team</Label>
                                    <Select
                                        value={formData.away_team_id}
                                        onValueChange={(value) => setFormData({ ...formData, away_team_id: value })}
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
                                    {errors.away_team_id && <p className="text-sm text-red-500">{errors.away_team_id}</p>}
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
                                <div className="space-y-2">
                                    <Label htmlFor="time">Game Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                    {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                                </div>

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
                                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Game</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
