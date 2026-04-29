"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { fetchCardsBySet, PokemonCard } from "@/lib/pokemonApi"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Search, Sun, Moon, Sparkles, Bot } from "lucide-react"
import { GeminiChatbot } from "@/components/GeminiChatbot"

export default function SetDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [cards, setCards] = React.useState<PokemonCard[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedRarity, setSelectedRarity] = React.useState<string>("All")

  React.useEffect(() => {
    setMounted(true)
    if (id) {
      fetchCardsBySet(id as string).then(data => {
        setCards(data)
        setLoading(false)
      }).catch(err => {
        console.error("Failed to load cards", err)
        setLoading(false)
      })
    }
  }, [id])

  if (!mounted) return null;

  const getPrice = (card: PokemonCard) => {
    if (!card.tcgplayer?.prices) return "N/A"
    const prices = card.tcgplayer.prices;
    const market = prices.holofoil?.market || prices.normal?.market || prices.reverseHolofoil?.market || prices['1stEditionHolofoil']?.market;
    if (market) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(market);
    }
    return "N/A"
  }

  const uniqueRarities = React.useMemo(() => {
    const rarities = new Set<string>();
    cards.forEach(card => {
      if (card.rarity) rarities.add(card.rarity);
    });
    return ["All", ...Array.from(rarities).sort()];
  }, [cards]);

  const filteredCards = React.useMemo(() => {
    if (selectedRarity === "All") return cards;
    return cards.filter(card => card.rarity === selectedRarity);
  }, [cards, selectedRarity]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Set Details {id && `(${id})`}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {uniqueRarities.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Rarity:</span>
                <select 
                  className="h-8 text-sm border bg-background rounded-md px-2 py-1 outline-none focus:border-primary"
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                >
                  {uniqueRarities.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-center space-x-2 border-l pl-4">
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
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="animate-pulse text-muted-foreground flex items-center">
                <Search className="h-5 w-5 mr-2 animate-spin" /> Loading Cards...
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pb-12">
              {filteredCards.map((card) => (
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
                    <div className="flex items-center justify-between">
                      {card.rarity ? (
                        <Badge variant="outline" className="text-[10px]">{card.rarity}</Badge>
                      ) : <div/>}
                      <div className="text-sm font-bold text-primary">
                        {getPrice(card)}
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
