
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid,  Users, Trophy, BarChart3,  UserPlus, BellIcon as  Medal, Calendar } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Schedule',
        url: '/games/create',
        icon: Calendar,
    },
    {
        title: 'Log Game',
        url: '/games/record',
        icon: Trophy,
        
    },
    {
        title: 'Teams',
        url: '/teams',
        icon: Medal,
    },
    {
        title: 'Players',
        url: '/players',
        icon: Users,
    },
    {
        title: 'Add Player',
        url: '/players/create',
        icon: UserPlus,
    },
    
    {
        title: 'Statistics',
        url: '/statistics',
        icon: BarChart3,
    },
    
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                {/* <AppLogo /> */}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}