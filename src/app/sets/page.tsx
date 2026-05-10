"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { fetchSets, PokemonSet } from "@/lib/pokemonApi"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, Database, LayoutDashboard, Settings, 
  ShieldCheck, Sun, Moon, Sparkles, Zap, Activity, Search
} from "lucide-react"

export default function SetsPage() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [sets, setSets] = React.useState<PokemonSet[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
    fetchSets().then(data => {
      setSets(data)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to load sets", err)
      setLoading(false)
    })
  }, [])

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-4 border-b flex items-center space-x-2 bg-gradient-to-r from-red-500/10 to-transparent">
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent drop-shadow-md">Pokémin</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform</h4>
            <Link href="/search" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" /> Global Search
              </Button>
            </Link>
            <Button variant="secondary" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Sets
            </Button>
            <Link href="/portfolio" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" /> Portfolios
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" /> Market Pulse
              </Button>
            </Link>
          </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </div>
      </aside>

      {/* CENTER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <h1 className="text-xl font-bold tracking-tight">Pokémon TCG Sets</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground mr-2">Theme:</span>
            <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("light")} className="transition-all duration-200 hover:scale-105 rounded-full">
              <Sun className="h-4 w-4 mr-1 text-yellow-500" /> Clean
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("dark")} className="transition-all duration-200 hover:scale-105 rounded-full">
              <Moon className="h-4 w-4 mr-1 text-indigo-400" /> Quant
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="animate-pulse text-muted-foreground flex items-center">
                <Search className="h-5 w-5 mr-2 animate-spin" /> Loading Sets...
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
              {sets.map((set) => (
                <Card key={set.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 group hover:border-primary/50">
                  <div className="h-32 bg-secondary/50 flex items-center justify-center p-6 relative overflow-hidden group-hover:bg-secondary/70 transition-colors">
                    <img src={set.images.logo} alt={set.name} className="max-h-full max-w-full object-contain relative z-10 filter drop-shadow-md" />
                    <img src={set.images.symbol} alt="" className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 filter blur-sm grayscale" />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base line-clamp-1" title={set.name}>{set.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{set.series}</p>
                      </div>
                      <img src={set.images.symbol} alt="symbol" className="h-6 w-6 object-contain drop-shadow-sm" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {set.printedTotal} Cards
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Released: {new Date(set.releaseDate).getFullYear()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t bg-muted/10 mt-2">
                    <Link href={`/sets/${set.id}`} className="w-full">
                      <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-primary/10 hover:text-primary">
                        View Products & Cards
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  )
}
