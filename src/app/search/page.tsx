"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { searchCards, PokemonCard } from "@/lib/pokemonApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Search as SearchIcon, Sun, Moon, Sparkles, Bot, Loader2 } from "lucide-react"
import { GeminiChatbot } from "@/components/GeminiChatbot"

export default function SearchPage() {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [cards, setCards] = React.useState<PokemonCard[]>([])
  const [loading, setLoading] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)
    try {
      const results = await searchCards(query)
      setCards(results)
    } catch (err) {
      console.error("Search failed:", err)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const getPrice = (card: PokemonCard) => {
    if (!card.tcgplayer?.prices) return "N/A"
    const prices = card.tcgplayer.prices;
    const market = prices.holofoil?.market || prices.normal?.market || prices.reverseHolofoil?.market || prices['1stEditionHolofoil']?.market;
    if (market) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(market);
    }
    return "N/A"
  }

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Card Database</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground mr-2">Theme:</span>
            <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-1" /> Clean
            </Button>
            <Button variant={theme === 'theme-warm' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("theme-warm")}>
              <Sparkles className="h-4 w-4 mr-1" /> Premium
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-1" /> Quant
            </Button>
          </div>
        </header>

        <div className="p-6 border-b bg-muted/10">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for any card (e.g., Charizard, Pikachu)..." 
                className="pl-10 h-12 text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="h-12 px-8" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>

        <ScrollArea className="flex-1 p-6">
          {!hasSearched && !loading && (
            <div className="flex flex-col h-64 items-center justify-center text-muted-foreground">
              <SearchIcon className="h-12 w-12 mb-4 opacity-20" />
              <p>Type a Pokemon name above to search across all sets.</p>
            </div>
          )}

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="animate-pulse text-muted-foreground flex items-center">
                <SearchIcon className="h-5 w-5 mr-2 animate-spin" /> Searching Database...
              </div>
            </div>
          ) : hasSearched && cards.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No cards found for "{query}". Try a different name.
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pb-12">
              {cards.map((card) => (
                <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 group">
                  <div className="bg-secondary/20 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-secondary/40 transition-colors">
                    <img src={card.images.small} alt={card.name} className="h-64 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1" />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm line-clamp-1" title={card.name}>{card.name}</CardTitle>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{card.supertype} {card.subtypes?.length ? `- ${card.subtypes.join(', ')}` : ''}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        {card.rarity ? (
                          <Badge variant="outline" className="text-[10px] truncate max-w-[100px]" title={card.rarity}>{card.rarity}</Badge>
                        ) : <div/>}
                        <div className="text-sm font-bold text-primary">
                          {getPrice(card)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>

      {/* RIGHT SIDEBAR: Chatbot Base */}
      <aside className="w-80 border-l bg-muted/20 flex flex-col hidden xl:flex">
        <div className="p-4 border-b bg-primary/5">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-primary">Gemini Assistant</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ask me about card prices and trends</p>
        </div>
        
        <div className="flex-1 p-0 flex flex-col min-h-0">
          <GeminiChatbot />
        </div>
      </aside>
    </div>
  )
}
