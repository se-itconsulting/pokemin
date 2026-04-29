"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { 
  Bot, LayoutDashboard, ChevronLeft, Sun, Moon, Sparkles, Image as ImageIcon, Loader2, Upload, Camera, Package
} from "lucide-react"

interface PortfolioItem {
  id: string;
  name: string;
  set: string;
  condition: string;
  estimatedValueUSD: number;
  reasoning: string;
  imagePreview: string;
  type: "Card" | "Sealed Product" | "Unknown";
}

export default function PortfolioPage() {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisResult, setAnalysisResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([])

  React.useEffect(() => {
    const savedPortfolio = localStorage.getItem("pokemon_portfolio")
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setAnalysisResult(null)
      setError(null)
    }
  }

  const analyzeImage = async () => {
    if (!imagePreview) return;
    const apiKey = localStorage.getItem("gemini_api_key")
    if (!apiKey) {
      setError("Please set your Gemini API Key in the Chatbot first.")
      return;
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Extract base64 part
      const base64Data = imagePreview.split(',')[1]
      
      const model = localStorage.getItem("gemini_model") || "gemini-2.5-flash"
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: "You are an expert Pokemon TCG appraiser. Identify the item in the image. It can be a Single Pokemon Card or a Sealed Product (like a Booster Box, Elite Trainer Box, Blister, Tin, etc.). Please reply ONLY with a JSON object in exactly this format: {\"name\": \"Item Name\", \"set\": \"Set Name (if applicable)\", \"type\": \"Card\" or \"Sealed Product\", \"condition\": \"Estimated Condition (e.g. Near Mint, Lightly Played, Factory Sealed, Damaged)\", \"estimatedValueUSD\": 150.50, \"reasoning\": \"A short explanation of why and what specific details you noticed\"}" },
              { inlineData: { mimeType: imageFile?.type || "image/jpeg", data: base64Data } }
            ]
          }]
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response from Gemini API.")
      }

      const data = await response.json()
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      // Clean up markdown json formatting if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim()
      
      const parsed = JSON.parse(text)
      setAnalysisResult(parsed)
      
    } catch (err: any) {
      console.error(err)
      setError("Could not analyze image. Make sure it's a valid Pokémon card and your API key is correct.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addToPortfolio = () => {
    if (analysisResult && imagePreview) {
      const newItem: PortfolioItem = {
        ...analysisResult,
        id: Date.now().toString(),
        imagePreview
      }
      const updatedPortfolio = [newItem, ...portfolio]
      setPortfolio(updatedPortfolio)
      localStorage.setItem("pokemon_portfolio", JSON.stringify(updatedPortfolio))
      // Reset scanner
      setImageFile(null)
      setImagePreview(null)
      setAnalysisResult(null)
    }
  }

  const removeFromPortfolio = (id: string) => {
    const updated = portfolio.filter(item => item.id !== id)
    setPortfolio(updated)
    localStorage.setItem("pokemon_portfolio", JSON.stringify(updated))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">AI Portfolio Scanning</h1>
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

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 pt-8">
            
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle>1. Upload Card Photo</CardTitle>
                <CardDescription>Upload a clear photo of your Pokémon card for AI analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors border-muted-foreground/30">
                    {imagePreview ? (
                      <div className="w-full h-full p-2 flex items-center justify-center relative">
                        <img src={imagePreview} alt="Preview" className="max-h-full rounded-md object-contain" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md space-y-2">
                          <p className="text-white font-semibold flex items-center"><Camera className="mr-2 h-4 w-4"/> Retake Photo</p>
                          <p className="text-white text-xs flex items-center"><Upload className="mr-2 h-3 w-3"/> Upload New</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        <div className="flex space-x-4 mb-3">
                          <Camera className="w-8 h-8 text-muted-foreground" />
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Tap to scan</span> with camera</p>
                        <p className="text-xs text-muted-foreground">or choose a file from your device</p>
                      </div>
                    )}
                    {/* The capture="environment" attribute defaults to the back camera on mobile */}
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                  </label>
                </div>
                
                <Button 
                  className="w-full h-12 text-lg" 
                  onClick={analyzeImage}
                  disabled={!imagePreview || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing with Gemini...</>
                  ) : (
                    <><Bot className="mr-2 h-5 w-5" /> Evaluate Card</>
                  )}
                </Button>
                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary"/> AI Evaluation Results</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!analysisResult ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Upload an image and evaluate to see results here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{analysisResult.name}</h3>
                        <p className="text-muted-foreground flex items-center">
                          {analysisResult.type === "Sealed Product" ? <Package className="h-4 w-4 mr-1" /> : <ImageIcon className="h-4 w-4 mr-1" />}
                          {analysisResult.set} &bull; {analysisResult.type}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Est. Condition</p>
                          <p className="font-semibold">{analysisResult.condition}</p>
                        </div>
                        <div className="p-4 bg-green-500/10 border-green-500/30 border rounded-lg">
                          <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Est. Value (Raw)</p>
                          <p className="font-bold text-xl text-green-600">${analysisResult.estimatedValueUSD}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-secondary/20 rounded-lg border">
                        <p className="text-xs font-semibold mb-2 flex items-center"><Bot className="mr-2 h-3 w-3"/> AI Reasoning</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {analysisResult.reasoning}
                        </p>
                      </div>

                      <Button className="w-full" variant="default" onClick={addToPortfolio}>
                        + Save to My Portfolio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="max-w-4xl mx-auto mt-12 mb-12">
            <h2 className="text-2xl font-bold mb-6">My Collection</h2>
            {portfolio.length === 0 ? (
              <div className="border border-dashed rounded-lg h-32 flex items-center justify-center text-muted-foreground bg-muted/10">
                You haven't added any items to your portfolio yet.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map(item => (
                  <Card key={item.id} className="overflow-hidden group">
                    <div className="h-40 bg-secondary/20 p-2 relative">
                      <img src={item.imagePreview} alt={item.name} className="h-full w-full object-contain" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => removeFromPortfolio(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-1">{item.set}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-end mt-2">
                        <Badge variant="outline" className="text-[10px]">{item.condition}</Badge>
                        <span className="font-bold text-primary">${item.estimatedValueUSD}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
