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
import { 
  Bot, Database, LayoutDashboard, Settings, 
  RefreshCcw, ShieldCheck, Sun, Moon, Sparkles, Zap, Activity
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
  }
]

export default function DashboardPage() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [data, setData] = React.useState<PokemonCard[]>([])

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
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR: Navigation */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-4 border-b flex items-center space-x-2 bg-gradient-to-r from-red-500/10 to-transparent">
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Pokémin</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform</h4>
            <Button variant="secondary" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" /> Portfolios
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" /> Market Pulse
            </Button>
          </div>
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Instructions</h4>
            <Button variant="ghost" className="w-full justify-start text-xs h-8">
              <ShieldCheck className="mr-2 h-3 w-3" /> Strict Grading Mode
            </Button>
            <Button variant="ghost" className="w-full justify-start text-xs h-8">
              <ShieldCheck className="mr-2 h-3 w-3" /> EU Market Only
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs h-8 mt-2 border-dashed">
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <h1 className="text-xl font-bold tracking-tight">Market Intelligence</h1>
          
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

        <ScrollArea className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value (EUR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€351,845.50</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tracked Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14,203</div>
                <p className="text-xs text-muted-foreground">Across JP & EN Sets</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Bullish</div>
                <p className="text-xs text-muted-foreground">Vintage PSA 10 leading</p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
              <Card className="border-primary/50 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    PriceCharting Sync
                    <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20">Running</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs space-y-2 bg-muted p-2 rounded-md font-mono text-muted-foreground">
                    <div>{">"} Fetching PSA 10 slabs...</div>
                    <div className="text-primary">{">"} Found 24 updates.</div>
                    <div>{">"} Merging TimescaleDB...</div>
                  </div>
                  <Button size="sm" variant="secondary" className="w-full">
                    <RefreshCcw className="h-3 w-3 mr-2 animate-spin-slow" /> Pause Sync
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-75">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    eBay Sold API
                    <Badge variant="secondary">Idle</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full">
                    Run Agent
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-75">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    Cardmarket EU Scraper
                    <Badge variant="secondary">Scheduled</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground">Runs daily at 02:00 UTC to fetch EU raw prices.</div>
                  <Button size="sm" variant="outline" className="w-full">
                    Force Run Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-75">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    PSA Pop Report API
                    <Badge variant="secondary">Idle</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full">
                    Run Agent
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-75">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    Discord Alert Webhook
                    <Badge variant="default" className="bg-blue-500/20 text-blue-500 border-blue-500/20">Listening</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground">Pushes major price movements to #TECH.</div>
                  <Button size="sm" variant="outline" className="w-full">
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

    </div>
  )
}
