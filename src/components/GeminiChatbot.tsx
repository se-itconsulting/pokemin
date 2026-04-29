"use client"

import * as React from "react"
import { Bot, Key, Send, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  role: "user" | "model"
  content: string
}

export function GeminiChatbot() {
  const [apiKey, setApiKey] = React.useState("")
  const [isKeySet, setIsKeySet] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  // Load API key from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("gemini_api_key")
    if (saved) {
      setApiKey(saved)
      setIsKeySet(true)
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim())
      setIsKeySet(true)
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem("gemini_api_key")
    setApiKey("")
    setIsKeySet(false)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return

    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })), {
            role: "user",
            parts: [{ text: userMessage.content }]
          }],
          systemInstruction: {
            parts: [{ text: "You are Pokémin, an expert Pokémon TCG assistant. You help users value their cards, understand sets, and track market prices. Be concise, friendly, and highly knowledgeable about Pokémon TCG." }]
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response from Gemini")
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response."
      
      setMessages(prev => [...prev, { role: "model", content: text }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: "model", content: "Error: Could not connect to Gemini. Please check your API key." }])
    } finally {
      setLoading(false)
    }
  }

  if (!isKeySet) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Connect Gemini</h3>
          <p className="text-xs text-muted-foreground mt-1 px-4">
            Enter your Google Gemini API key to activate the intelligent TCG Assistant.
          </p>
        </div>
        <div className="w-full space-y-2 mt-4">
          <Input 
            type="password" 
            placeholder="AIzaSy..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
          <Button className="w-full" onClick={saveApiKey}>Save API Key</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b">
        <Badge variant="outline" className="text-[10px] text-green-500 bg-green-500/10 border-green-500/20">Online</Badge>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={clearApiKey} title="Clear API Key">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full opacity-50 pt-20">
            <Bot className="h-10 w-10 mb-3" />
            <p className="text-sm">Hi! I am the Pokémin Assistant.<br/>Ask me about any card or set.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`text-xs mb-1 text-muted-foreground`}>{msg.role === "user" ? "You" : "Pokémin"}</div>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="text-xs mb-1 text-muted-foreground">Pokémin</div>
                <div className="px-3 py-2 rounded-lg bg-muted flex space-x-1 items-center h-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t bg-background mt-auto">
        <div className="flex items-center space-x-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about prices..."
            className="h-9"
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
