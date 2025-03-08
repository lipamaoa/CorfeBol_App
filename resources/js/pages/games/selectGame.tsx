import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import Navbar from "@/components/navbar";




export default function SelectGame({ games }) {
  return (
    <>
    <Navbar/>
    <AppLayout breadcrumbs={[{ title: "Select Game", href: "/games/record" }]}>
      <Head title="Select Game to Record" />
      
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Select a Game to Record</CardTitle>
            </CardHeader>
            <CardContent>
              {games.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No games available to record.</p>
                  <Button asChild>
                    <Link href="/games/create">Create a New Game</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {games.map((game) => (
                    <Card key={game.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {game.teamA?.name || "Team A"} vs {game.teamB?.name || "Team B"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(game.date).toLocaleDateString()} • {game.location || "No location"}
                            </p>
                          </div>
                          <Button asChild>
                            <Link href={`/games/record?game=${game.id}`}>Record</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
    </>
  );
}