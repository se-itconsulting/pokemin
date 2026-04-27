"use client"

import * as React from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PokemonCard = {
  id: string
  name: string
  set: string
  grade: string
  price: number
  trend: "up" | "down" | "neutral"
}

const data: PokemonCard[] = [
  {
    id: "base1-4",
    name: "Charizard",
    set: "Base Set",
    grade: "PSA 10",
    price: 350000.00,
    trend: "up",
  },
  {
    id: "swsh7-215",
    name: "Umbreon VMAX (Alt Art)",
    set: "Evolving Skies",
    grade: "PSA 10",
    price: 1250.00,
    trend: "up",
  },
  {
    id: "sm11b-68",
    name: "Rosa (Full Art)",
    set: "Dream League",
    grade: "PSA 9",
    price: 250.00,
    trend: "down",
  },
  {
    id: "swsh12pt5-160",
    name: "Pikachu (Secret Rare)",
    set: "Crown Zenith",
    grade: "Raw",
    price: 25.50,
    trend: "neutral",
  },
  {
    id: "sv2a-201",
    name: "Charizard ex (SAR)",
    set: "Pokemon Card 151",
    grade: "PSA 10",
    price: 320.00,
    trend: "down",
  },
]

export const columns: ColumnDef<PokemonCard>[] = [
  {
    accessorKey: "name",
    header: "Card Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
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
      return (
        <Badge variant={grade === "PSA 10" ? "default" : "secondary"}>
          {grade}
        </Badge>
      )
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pokémin Terminal</h1>
        <p className="text-muted-foreground">
          Global Market Intelligence & Portfolio Tracking
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
