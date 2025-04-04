import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart4, BarChartIcon as ChartBar, ChevronRight, Layers, Trophy, Users, BellIcon as Whistle, Zap } from 'lucide-react';

declare global {
    interface Window {
        route: any;
    }
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Korfball Manager">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18]">
                <Navbar />

                <main className="flex-1">
                    {/* Hero Section - Light Tech Style */}
                    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
                        {/* Background grid pattern */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlNWU3ZWIiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0yNCAzNGgtMnYtNGgydjR6bTAtNnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

                        {/* Glowing orbs */}
                        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-gray-200 opacity-20 blur-3xl"></div>
                        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-gray-200 opacity-20 blur-3xl"></div>

                        <div className="relative container mx-auto px-4">
                            <div className="mx-auto max-w-4xl">
                                <div className="mb-8 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-black shadow-lg">
                                        <Trophy className="h-8 w-8 text-white" />
                                    </div>
                                </div>

                                <h1 className="mb-6 bg-gradient-to-r from-gray-700 via-gray-800 to-black bg-clip-text text-center text-5xl leading-tight font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl">
                                    Korfball Analytics Platform
                                </h1>

                                <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-gray-700">
                                    A powerful, data-driven platform for korfball teams to track performance, analyze statistics, and gain competitive
                                    advantage.
                                </p>

                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={window.route('register')}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-800 to-black px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:from-black hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Get Started <ArrowRight size={18} />
                                    </Link>
                                    <Link
                                        href="#features"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Explore Features
                                    </Link>
                                </div>

                                {/* Tech-style decorative code block */}
                                <div className="absolute -right-4 bottom-0 hidden w-64 rounded-lg bg-white/80 p-4 font-mono text-xs text-gray-800 shadow-lg backdrop-blur-sm lg:block">
                                    <div className="mb-2 text-gray-600">{'// Korfball Manager API'}</div>
                                    <div>
                                        <span className="text-gray-800">const</span> <span className="text-gray-600">stats</span> ={' '}
                                        <span className="text-gray-800">await</span> <span className="text-gray-600">getTeamStats</span>(
                                        <span className="text-gray-500">'teamId'</span>);
                                    </div>
                                    <div>
                                        <span className="text-gray-800">const</span> <span className="text-gray-600">efficiency</span> = stats.
                                        <span className="text-gray-600">calculateEfficiency</span>();
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section - Tech Cards */}
                    <section id="features" className="bg-white py-20">
                        <div className="container mx-auto px-4">
                            <div className="mb-16 text-center">
                                <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-gray-700 to-black bg-clip-text px-3 py-1 text-sm font-medium text-transparent">
                                    POWERFUL FEATURES
                                </div>
                                <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to excel</h2>
                                <p className="mx-auto max-w-2xl text-lg text-gray-700">
                                    Advanced tools designed specifically for korfball teams and coaches
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {/* Feature Card 1 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <div className="relative h-full rounded-xl bg-white p-6">
                                        <div className="mb-4 inline-flex rounded-xl bg-gray-50 p-3 text-gray-700">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900">Team Management</h3>
                                        <p className="text-gray-700">
                                            Create and manage multiple teams with detailed profiles and performance tracking.
                                        </p>
                                        <div className="mt-4 flex items-center text-gray-600">
                                            <span className="text-sm font-medium">Learn more</span>
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Card 2 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <div className="relative h-full rounded-xl bg-white p-6">
                                        <div className="mb-4 inline-flex rounded-xl bg-gray-50 p-3 text-gray-700">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900">Player Tracking</h3>
                                        <p className="text-gray-700">Monitor individual player statistics, development, and performance metrics.</p>
                                        <div className="mt-4 flex items-center text-gray-600">
                                            <span className="text-sm font-medium">Learn more</span>
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Card 3 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <div className="relative h-full rounded-xl bg-white p-6">
                                        <div className="mb-4 inline-flex rounded-xl bg-gray-50 p-3 text-gray-700">
                                            <ChartBar className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900">Advanced Analytics</h3>
                                        <p className="text-gray-700">Gain insights with detailed performance statistics and visual reports.</p>
                                        <div className="mt-4 flex items-center text-gray-600">
                                            <span className="text-sm font-medium">Learn more</span>
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Card 4 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <div className="relative h-full rounded-xl bg-white p-6">
                                        <div className="mb-4 inline-flex rounded-xl bg-gray-50 p-3 text-gray-700">
                                            <Whistle className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900">Game Recording</h3>
                                        <p className="text-gray-700">Record live game events with our intuitive interface designed for korfball.</p>
                                        <div className="mt-4 flex items-center text-gray-600">
                                            <span className="text-sm font-medium">Learn more</span>
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Dashboard Preview Section */}
                    <section className="bg-gray-50 py-20">
                        <div className="container mx-auto px-4">
                            <div className="grid items-center gap-12 md:grid-cols-2">
                                <div>
                                    <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-gray-700 to-black bg-clip-text px-3 py-1 text-sm font-medium text-transparent">
                                        POWERFUL DASHBOARD
                                    </div>
                                    <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                        Data-driven insights at your fingertips
                                    </h2>
                                    <p className="mb-8 text-lg text-gray-700">
                                        Our intuitive dashboard gives you real-time access to all the metrics that matter for your team's success.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="inline-flex rounded-lg bg-gray-100 p-3 text-gray-700">
                                                <Layers className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="mb-1 text-xl font-medium text-gray-900">Comprehensive Data</h3>
                                                <p className="text-gray-700">
                                                    Track every aspect of your team's performance with detailed metrics and visualizations.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="inline-flex rounded-lg bg-gray-100 p-3 text-gray-700">
                                                <BarChart4 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="mb-1 text-xl font-medium text-gray-900">Visual Reports</h3>
                                                <p className="text-gray-700">
                                                    Transform complex data into clear, actionable insights with beautiful charts and graphs.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="inline-flex rounded-lg bg-gray-100 p-3 text-gray-700">
                                                <Zap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="mb-1 text-xl font-medium text-gray-900">Real-time Updates</h3>
                                                <p className="text-gray-700">
                                                    See stats update in real-time during games to make informed coaching decisions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    {/* Dashboard mockup with glassmorphism effect */}
                                    <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-gray-900">Team Performance</h3>
                                            <div className="rounded-lg bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700">Last 5 Games</div>
                                        </div>

                                        {/* Stat cards */}
                                        <div className="mb-6 grid grid-cols-3 gap-4">
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="text-sm text-gray-700">Goals</div>
                                                <div className="text-2xl font-bold text-gray-900">42</div>
                                                <div className="mt-1 text-xs text-green-600">+12% ↑</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="text-sm text-gray-700">Shooting %</div>
                                                <div className="text-2xl font-bold text-gray-900">68%</div>
                                                <div className="mt-1 text-xs text-green-600">+5% ↑</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="text-sm text-gray-700">Rebounds</div>
                                                <div className="text-2xl font-bold text-gray-900">37</div>
                                                <div className="mt-1 text-xs text-red-600">-3% ↓</div>
                                            </div>
                                        </div>

                                        {/* Chart mockup */}
                                        <div className="mb-6 h-48 rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="text-sm font-medium text-gray-900">Performance Trend</div>
                                                <div className="flex gap-2">
                                                    <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                                                    <div className="h-3 w-3 rounded-full bg-gray-600"></div>
                                                    <div className="h-3 w-3 rounded-full bg-gray-800"></div>
                                                </div>
                                            </div>

                                            {/* Fake chart bars */}
                                            <div className="mt-6 flex h-24 items-end justify-between gap-2">
                                                <div className="w-1/6 bg-gray-700" style={{ height: '40%' }}></div>
                                                <div className="w-1/6 bg-gray-700" style={{ height: '60%' }}></div>
                                                <div className="w-1/6 bg-gray-700" style={{ height: '30%' }}></div>
                                                <div className="w-1/6 bg-gray-700" style={{ height: '80%' }}></div>
                                                <div className="w-1/6 bg-gray-700" style={{ height: '50%' }}></div>
                                                <div className="w-1/6 bg-gray-700" style={{ height: '70%' }}></div>
                                            </div>
                                        </div>

                                        {/* Player stats */}
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-3 text-sm font-medium text-gray-900">Top Performers</div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                                        <div className="text-sm font-medium text-gray-900">Alex Johnson</div>
                                                    </div>
                                                    <div className="text-sm text-gray-700">12 goals</div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                                        <div className="text-sm font-medium text-gray-900">Sam Williams</div>
                                                    </div>
                                                    <div className="text-sm text-gray-700">8 assists</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative elements */}
                                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gray-200 opacity-20 blur-2xl"></div>
                                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gray-200 opacity-20 blur-2xl"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section - Minimalist */}
                    <section className="bg-white py-20">
                        <div className="container mx-auto px-4">
                            <div className="mb-16 text-center">
                                <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-gray-700 to-black bg-clip-text px-3 py-1 text-sm font-medium text-transparent">
                                    SIMPLE PROCESS
                                </div>
                                <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Get started in minutes</h2>
                                <p className="mx-auto max-w-2xl text-lg text-gray-700">
                                    Our streamlined setup process gets you up and running quickly
                                </p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-3">
                                <div className="relative">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-black text-white">
                                        <span className="text-xl font-bold">1</span>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">Request Your Account</h3>
                                    <p className="text-gray-700">Ask an administrator to create your account and set up your team profile.</p>
                                </div>

                                <div className="relative">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-black text-white">
                                        <span className="text-xl font-bold">2</span>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">Add Your Players</h3>
                                    <p className="text-gray-700">Create player profiles with positions, numbers, and stats.</p>
                                </div>

                                <div className="relative">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-black text-white">
                                        <span className="text-xl font-bold">3</span>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">Start Recording Games</h3>
                                    <p className="text-gray-700">Use our intuitive interface to track game events in real-time.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section - Glassmorphism */}
                    <section className="relative bg-gradient-to-b from-white to-gray-50 py-20">
                        {/* Glowing orbs */}
                        <div className="absolute top-1/2 left-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-200 opacity-20 blur-3xl"></div>
                        <div className="absolute top-1/2 right-1/4 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-200 opacity-20 blur-3xl"></div>

                        <div className="relative container mx-auto px-4">
                            <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white/80 p-8 text-center shadow-xl backdrop-blur-lg">
                                <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    Ready to transform your korfball team?
                                </h2>
                                <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-700">
                                    Join teams already using Korfball Manager to improve performance and win more games.
                                </p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href="/request-access"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-800 to-black px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:from-black hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Request Access <ArrowRight size={18} />
                                    </Link>
                                    <Link
                                        href="#contact"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Contact Admin
                                    </Link>
                                </div>
                                <p className="mt-6 text-sm text-gray-500">
                                    Access to Korfball Manager is managed by team administrators. Request access above or contact your team's admin to
                                    get started.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
