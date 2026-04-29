"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, ChevronLeft, Sun, Moon, Sparkles, Image as ImageIcon, Loader2, Upload, Camera, Package, X
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

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  isHeic: boolean;
  result?: Partial<PortfolioItem>;
  status: "pending" | "analyzing" | "done" | "error";
  errorMsg?: string;
}

export default function PortfolioPage() {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  
  const [uploads, setUploads] = React.useState<UploadedImage[]>([])
  const [isAnalyzingAll, setIsAnalyzingAll] = React.useState(false)
  const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedPortfolio = localStorage.getItem("pokemon_portfolio")
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newUploads: UploadedImage[] = []

    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic'
      let previewUrl = ""

      if (isHeic) {
        try {
          const heic2any = (await import("heic2any")).default;
          const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" }) as Blob;
          file = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: "image/jpeg" });
        } catch (err) {
          console.error("HEIC conversion failed:", err)
        }
      }

      previewUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      newUploads.push({
        id: Date.now().toString() + i,
        file,
        preview: previewUrl,
        isHeic,
        status: "pending"
      })
    }

    setUploads(prev => [...prev, ...newUploads])
    // Clear input
    e.target.value = ""
  }

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id))
  }

  const analyzeAll = async () => {
    const apiKey = localStorage.getItem("gemini_api_key")
    if (!apiKey) {
      alert("Please set your Gemini API Key in the Chatbot first.")
      return;
    }

    setIsAnalyzingAll(true)
    const model = localStorage.getItem("gemini_model") || "gemini-2.5-flash"

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i]
      if (upload.status === "done" || upload.status === "analyzing") continue;

      setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: "analyzing" } : u))

      try {
        const base64Data = upload.preview.split(',')[1]
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [
                { text: "You are an expert Pokemon TCG appraiser. Identify the item in the image. It can be a Single Pokemon Card or a Sealed Product (like a Booster Box, Elite Trainer Box, Blister, Tin, etc.). Please reply ONLY with a JSON object in exactly this format: {\"name\": \"Item Name\", \"set\": \"Set Name (if applicable)\", \"type\": \"Card\" or \"Sealed Product\", \"condition\": \"Estimated Condition (e.g. Near Mint, Lightly Played, Factory Sealed, Damaged)\", \"estimatedValueUSD\": 150.50, \"reasoning\": \"A short explanation of why and what specific details you noticed\"}" },
                { inlineData: { mimeType: upload.file.type || "image/jpeg", data: base64Data } }
              ]
            }]
          })
        })

        if (!response.ok) throw new Error("API Error")
        
        const data = await response.json()
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        
        const parsed = JSON.parse(text)
        setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: "done", result: parsed } : u))
        
      } catch (err: any) {
        setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: "error", errorMsg: "Analysis failed" } : u))
      }
    }

    setIsAnalyzingAll(false)
  }

  const saveAllToPortfolio = () => {
    const newItems: PortfolioItem[] = uploads
      .filter(u => u.status === "done" && u.result)
      .map(u => ({
        ...u.result,
        id: Date.now().toString() + Math.random(),
        imagePreview: u.preview
      } as PortfolioItem))

    if (newItems.length > 0) {
      const updatedPortfolio = [...newItems, ...portfolio]
      setPortfolio(updatedPortfolio)
      localStorage.setItem("pokemon_portfolio", JSON.stringify(updatedPortfolio))
      // Remove the successfully saved ones from the upload list
      setUploads(prev => prev.filter(u => u.status !== "done"))
    }
  }

  const removeFromPortfolio = (id: string) => {
    const updated = portfolio.filter(item => item.id !== id)
    setPortfolio(updated)
    localStorage.setItem("pokemon_portfolio", JSON.stringify(updated))
  }

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background shrink-0">
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
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* UPLOAD SECTION */}
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle>1. Upload Cards / Sealed Products</CardTitle>
                <CardDescription>Upload multiple photos (JPG, PNG, HEIC). HEIC files will be converted automatically.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors border-muted-foreground/30">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <div className="flex space-x-4 mb-2">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Tap to scan</span> or select files</p>
                    </div>
                    {/* accept image/* and multiple to allow bulk select */}
                    <input type="file" className="hidden" accept="image/*,.heic" capture="environment" multiple onChange={handleImageUpload} />
                  </label>
                </div>

                {uploads.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Pending Analysis ({uploads.length})</h3>
                      <div className="space-x-2">
                        <Button onClick={analyzeAll} disabled={isAnalyzingAll || uploads.every(u => u.status === 'done')}>
                          {isAnalyzingAll ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Bot className="mr-2 h-4 w-4" /> Analyze All</>}
                        </Button>
                        {uploads.some(u => u.status === 'done') && (
                          <Button variant="secondary" onClick={saveAllToPortfolio}>
                            Save Finished to Portfolio
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploads.map(upload => (
                        <div key={upload.id} className="border rounded-lg p-3 flex flex-col space-y-3 relative group">
                          <button onClick={() => removeUpload(upload.id)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <X className="h-3 w-3" />
                          </button>
                          
                          <div className="h-32 bg-black/5 rounded flex items-center justify-center overflow-hidden">
                            <img src={upload.preview} alt="preview" className="h-full object-contain" />
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center">
                            {upload.status === "pending" && <Badge variant="outline" className="w-fit self-center">Waiting</Badge>}
                            {upload.status === "analyzing" && <Badge className="w-fit self-center bg-blue-500"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Analyzing</Badge>}
                            {upload.status === "error" && <Badge variant="destructive" className="w-fit self-center">Error</Badge>}
                            
                            {upload.status === "done" && upload.result && (
                              <div className="space-y-1 text-center">
                                <div className="font-bold text-sm line-clamp-1" title={upload.result.name}>{upload.result.name}</div>
                                <div className="text-xs text-muted-foreground">{upload.result.set}</div>
                                <div className="flex justify-center items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-[10px]">{upload.result.condition}</Badge>
                                  <span className="text-sm font-bold text-green-600">${upload.result.estimatedValueUSD}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PORTFOLIO GRID */}
            <div className="pt-8 mb-12">
              <h2 className="text-2xl font-bold mb-6">My Collection ({portfolio.length})</h2>
              {portfolio.length === 0 ? (
                <div className="border border-dashed rounded-lg h-32 flex items-center justify-center text-muted-foreground bg-muted/10">
                  You haven't added any items to your portfolio yet.
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {portfolio.map(item => (
                    <Card key={item.id} className="overflow-hidden group flex flex-col">
                      <div className="h-40 bg-secondary/20 p-2 relative shrink-0">
                        <img src={item.imagePreview} alt={item.name} className="h-full w-full object-contain" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="destructive" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => removeFromPortfolio(item.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="p-3 pb-0 shrink-0">
                        <CardTitle className="text-sm line-clamp-1" title={item.name}>{item.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-1">{item.set}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-2 mt-auto">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-[9px] px-1">{item.condition}</Badge>
                            <span className="font-bold text-sm text-primary">${item.estimatedValueUSD}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
