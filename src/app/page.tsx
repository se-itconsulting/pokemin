"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { GeminiChatbot } from "@/components/GeminiChatbot"
import { 
  Bot, Database, LayoutDashboard, Settings, 
  RefreshCcw, ShieldCheck, Sun, Moon, Sparkles, Zap, Activity,
  Search, ExternalLink, ShoppingCart, Filter,
  MessageSquare, Send, X
} from "lucide-react"

// Types & Data
export type PokemonCard = {
  id: string
  name: string
  set: string
  grade: string
  price: number
  trend: "up" | "down" | "neutral"
  image?: string
  types?: string[]
  allPrices?: any
}

// We will fetch data instead of hardcoding
// const data: PokemonCard[] = [...]


const columns: ColumnDef<PokemonCard>[] = [
  {
    accessorKey: "name",
    header: "Card",
    cell: ({ row }) => {
      const img = row.original.image;
      return (
        <div className="flex items-center space-x-3">
          {img && (
            <div className="h-12 w-9 shrink-0 overflow-hidden rounded-sm border shadow-sm">
              <img src={img} alt={row.getValue("name")} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-sm">{row.getValue("name")}</span>
            {row.original.types && row.original.types.length > 0 && (
              <div className="flex gap-1 mt-1">
                {row.original.types.map((t: string) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "set",
    header: "Set",
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => {
      const grade = row.getValue("grade") as string
      return <Badge variant={grade === "PSA 10" ? "default" : "secondary"}>{grade}</Badge>
    }
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price (EUR)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "trend",
    header: "Trend",
    cell: ({ row }) => {
      const trend = row.getValue("trend") as string
      return (
        <div className="flex items-center space-x-1">
          {trend === "up" && <span className="text-green-500">↗</span>}
          {trend === "down" && <span className="text-red-500">↘</span>}
          {trend === "neutral" && <span className="text-gray-500">→</span>}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors rounded-full" title="View on Cardmarket">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 transition-colors rounded-full" title="View on eBay">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  }
]

export default function DashboardPage() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [data, setData] = React.useState<PokemonCard[]>([])
  
  // Chat Bot State
  const [isChatOpen, setIsChatOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Fetch live data
    fetch('/api/cards')
      .then(res => res.json())
      .then(json => {
        if(Array.isArray(json)) setData(json)
      })
      .catch(err => console.error("Error fetching cards:", err))
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-[#0B0B0B] text-foreground">
      
      {/* LEFT SIDEBAR: Navigation */}
      <aside className="w-64 border-r border-white/5 bg-card/20 backdrop-blur-3xl hidden md:flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-4 border-b border-white/5 flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent drop-shadow-md">Pokémin</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform</h4>
            <Link href="/" className="w-full block">
              <Button variant="secondary" className="w-full justify-start transition-all duration-200 hover:translate-x-1 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/sets" className="w-full block">
              <Button variant="ghost" className="w-full justify-start transition-all duration-200 hover:translate-x-1 hover:bg-primary/5">
                <Database className="mr-2 h-4 w-4" /> Sets
              </Button>
            </Link>
            <Link href="/portfolio" className="w-full block">
              <Button variant="ghost" className="w-full justify-start transition-all duration-200 hover:translate-x-1 hover:bg-primary/5">
                <Database className="mr-2 h-4 w-4" /> Portfolios
              </Button>
            </Link>
            <Link href="/search" className="w-full block">
              <Button variant="ghost" className="w-full justify-start transition-all duration-200 hover:translate-x-1 hover:bg-primary/5">
                <Search className="mr-2 h-4 w-4" /> Global Search
              </Button>
            </Link>
          </div>
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Instructions</h4>
            <Button variant="ghost" className="w-full justify-start text-xs h-8 transition-all duration-200 hover:translate-x-1">
              <ShieldCheck className="mr-2 h-3 w-3 text-green-500" /> Strict Grading Mode
            </Button>
            <Button variant="ghost" className="w-full justify-start text-xs h-8 transition-all duration-200 hover:translate-x-1">
              <ShieldCheck className="mr-2 h-3 w-3 text-blue-500" /> EU Market Only
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs h-8 mt-2 border-dashed transition-all duration-200 hover:border-primary hover:text-primary">
              + Add Directive
            </Button>
          </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </div>
      </aside>

      {/* CENTER: Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Web3 Neon Background Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-fuchsia-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-background/40 backdrop-blur-xl relative z-20">
          <div className="flex items-center space-x-6 flex-1">
            <h1 className="text-xl font-bold tracking-tight">Market Intelligence</h1>
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search for cards, sets, or IDs..." className="w-full bg-muted/50 pl-9 rounded-full border-transparent focus-visible:border-primary transition-all duration-200" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground mr-2">Theme:</span>
            <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("light")} className="transition-all duration-200 hover:scale-105 rounded-full">
              <Sun className="h-4 w-4 mr-1 text-yellow-500" /> Clean
            </Button>
            <Button variant={theme === 'theme-warm' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("theme-warm")} className="transition-all duration-200 hover:scale-105 rounded-full">
              <Sparkles className="h-4 w-4 mr-1 text-orange-400" /> Premium
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme("dark")} className="transition-all duration-200 hover:scale-105 rounded-full">
              <Moon className="h-4 w-4 mr-1 text-indigo-400" /> Quant
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-3 mb-6 relative z-10">
            <Card className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.3)] group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-400/30 transition-all duration-500 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">Total Value (EUR)</CardTitle>
                <Database className="h-4 w-4 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">€351,845.50</div>
                <p className="text-xs font-medium text-green-400 mt-1 flex items-center drop-shadow-[0_0_5px_rgba(74,222,128,0.4)]">↗ +2.1% <span className="text-muted-foreground/70 font-normal ml-1 drop-shadow-none">from last month</span></p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(192,132,252,0.3)] group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-400/30 transition-all duration-500 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">Tracked Assets</CardTitle>
                <Activity className="h-4 w-4 text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] transition-all" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">14,203</div>
                <p className="text-xs text-muted-foreground/70 mt-1">Across JP & EN Sets</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(74,222,128,0.3)] group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-400/30 transition-all duration-500 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">Market Pulse</CardTitle>
                <Activity className="h-4 w-4 text-green-400 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">Bullish</div>
                <p className="text-xs text-muted-foreground/70 mt-1">Vintage PSA 10 leading</p>
              </CardContent>
            </Card>
          </div>

          {/* PLAYFUL: Hot Right Now Section */}
          <div className="mb-8 relative z-10">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-500 animate-pulse" /> 
              Hot Right Now
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {data.slice(0, 5).map((card, i) => (
                <div key={card.id || i} className="snap-start min-w-[220px] bg-card/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-yellow-500/30 text-yellow-600 shadow-sm">
                      #{i+1} Trending
                    </Badge>
                    <span className="text-xs font-bold text-green-500 flex items-center bg-green-500/10 px-2 py-1 rounded-full">
                      ↗ +{(Math.random() * 15 + 5).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="h-40 w-full flex items-center justify-center mb-4 relative z-10">
                    {card.image ? (
                      <img src={card.image} alt={card.name} className="max-h-full drop-shadow-2xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-500" />
                    ) : (
                      <div className="w-24 h-32 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed"><Activity className="h-8 w-8 text-muted-foreground/30" /></div>
                    )}
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="font-bold text-base truncate">{card.name}</h3>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{card.set}</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">€{card.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">All Tracked Assets</h2>
              <Badge variant="secondary" className="rounded-full">14,203 Total</Badge>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 border-dashed rounded-full text-muted-foreground hover:text-foreground">
                <Filter className="mr-2 h-3 w-3" /> Filters
              </Button>
              <select className="h-8 text-xs rounded-full border bg-card/60 backdrop-blur-sm px-3 py-1 outline-none cursor-pointer hover:bg-muted/50 transition-colors">
                <option>All Sets</option>
                <option>Base Set (1999)</option>
                <option>Evolving Skies</option>
                <option>Scarlet & Violet: 151</option>
              </select>
              <select className="h-8 text-xs rounded-full border bg-card/60 backdrop-blur-sm px-3 py-1 outline-none cursor-pointer hover:bg-muted/50 transition-colors">
                <option>All Conditions</option>
                <option>PSA 10 (Gem Mint)</option>
                <option>PSA 9 (Mint)</option>
                <option>Raw / Ungraded</option>
                <option>Sealed Product</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow relative z-10">
            <Table>
              <TableHeader className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold text-muted-foreground">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="group hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </main>

      {/* RIGHT SIDEBAR: AI Agents */}
      <aside className="w-80 border-l bg-muted/20 flex flex-col hidden lg:flex">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">AI Agents</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Autonomous workflows</p>
        </div>
        
        <Tabs defaultValue="sync" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-10 px-4 bg-transparent">
            <TabsTrigger value="sync" className="text-xs">Price Sync</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">Audit Trail</TabsTrigger>
            <TabsTrigger value="clean" className="text-xs">Cleanup</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="sync" className="p-4 space-y-4 m-0">
              <Card className="rounded-xl border-primary/50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    PriceCharting Sync
                    <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20 px-2 py-0.5 rounded-full">Running</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs space-y-2 bg-muted/80 p-3 rounded-lg font-mono text-muted-foreground">
                    <div>{">"} Fetching PSA 10 slabs...</div>
                    <div className="text-primary font-medium">{">"} Found 24 updates.</div>
                    <div>{">"} Merging TimescaleDB...</div>
                  </div>
                  <Button size="sm" variant="secondary" className="w-full rounded-lg hover:bg-secondary/80 transition-colors">
                    <RefreshCcw className="h-3 w-3 mr-2 animate-spin-slow" /> Pause Sync
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl opacity-80 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    eBay Sold API
                    <Badge variant="secondary" className="rounded-full">Idle</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full rounded-lg transition-colors hover:bg-primary/5">
                    Run Agent
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl opacity-80 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    Cardmarket EU Scraper
                    <Badge variant="secondary" className="rounded-full">Scheduled</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground">Runs daily at 02:00 UTC to fetch EU raw prices.</div>
                  <Button size="sm" variant="outline" className="w-full rounded-lg transition-colors hover:bg-primary/5">
                    Force Run Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl opacity-80 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    PSA Pop Report API
                    <Badge variant="secondary" className="rounded-full">Idle</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full rounded-lg transition-colors hover:bg-primary/5">
                    Run Agent
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl opacity-80 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    Whatnot Live Scanner
                    <Badge variant="secondary" className="rounded-full">Beta</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground">Scans active streams for below-market deals.</div>
                  <Button size="sm" variant="outline" className="w-full rounded-lg transition-colors hover:bg-primary/5">
                    Configure Agent
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl opacity-80 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    Discord Alert Webhook
                    <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full">Listening</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground">Pushes major price movements to #TECH.</div>
                  <Button size="sm" variant="outline" className="w-full rounded-lg transition-colors hover:bg-primary/5">
                    Send Test Alert
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="p-4 text-sm text-muted-foreground">
              Audit logs will appear here.
            </TabsContent>
            
            <TabsContent value="clean" className="p-4 text-sm text-muted-foreground">
              Data cleanup agent controls.
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </aside>

      {/* FLOATING CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <div className={`transition-all duration-300 origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0'}`}>
          <Card className="w-80 md:w-96 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">Market Assistant (J.A.R.V.I.S.)</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20 rounded-full" onClick={() => setIsChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 bg-background/50">
              <GeminiChatbot />
            </div>
          </Card>
        </div>

        {/* Chat Toggle Button */}
        <Button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white/20 ${isChatOpen ? 'bg-secondary text-secondary-foreground rotate-90' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </div>

    </div>
  )
}
