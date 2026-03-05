"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, BookmarkCheck } from "lucide-react"
import { KeywordManager } from "@/components/keyword-manager"
import { NewsResults } from "@/components/news-results"
import { SelectedNews } from "@/components/selected-news"

interface Keyword {
  id: string
  text: string
  active: boolean
}

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: string
  selected: boolean
  keywords: string[]
  score?: number
  category?: string
  press?: string // Added press field to NewsItem interface
}

export default function NewsScrapingApp() {
  const [keywords, setKeywords] = useState<Keyword[]>([
    { id: "1", text: "LNG", active: true },
    { id: "2", text: "석탄", active: true },
    { id: "3", text: "발전소", active: true },
    { id: "4", text: "ESG", active: true },
    { id: "5", text: "탄소중립", active: true },
    { id: "6", text: "배출권", active: true },
    { id: "7", text: "전력", active: true },
    { id: "8", text: "집단에너지", active: true },
    { id: "9", text: "분산에너지", active: true },
    { id: "10", text: "열병합", active: true },
    { id: "11", text: "전력수급기본계획", active: true },
    { id: "12", text: "전력거래소", active: true },
    { id: "13", text: "RPS", active: true },
    { id: "14", text: "바이오매스", active: true },
    { id: "15", text: "GS", active: true },
    { id: "16", text: "NDC", active: true },
    { id: "17", text: "SMR", active: true },
    { id: "18", text: "송전", active: true },
    { id: "19", text: "연료전환", active: true },
    { id: "20", text: "수소발전", active: true },
  ])

  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("keywords")
  const [newsCount, setNewsCount] = useState(20)

  const handleSearch = async () => {
    setIsLoading(true)
    
    // 키워드 상태를 즉시 로그로 확인
    console.log("=== [v0] 검색 시작 시점 키워드 상태 ===")
    console.log("[v0] 현재 keywords 상태:", keywords)
    console.log("[v0] keywords.length:", keywords.length)
    console.log("[v0] 수소발전 존재 여부:", keywords.some(k => k.text === "수소발전"))
    
    const activeKeywords = keywords.filter((k) => k.active)

    try {
      console.log("=== [v0] 프론트엔드 키워드 처리 ===")
      console.log("[v0] 전체 키워드 개수:", keywords.length)
      console.log("[v0] 전체 키워드 목록:", keywords.map((k) => `${k.text}(${k.active ? "활성" : "비활성"})`))
      console.log("[v0] 활성 키워드 객체:", activeKeywords)
      console.log("[v0] 활성 키워드 텍스트:", activeKeywords.map((k) => k.text))
      console.log("[v0] 활성 키워드 개수:", activeKeywords.length)
      console.log("[v0] 요청할 뉴스 개수:", newsCount)
      console.log("[v0] 키워드 배열 타입:", typeof activeKeywords.map((k) => k.text))
      console.log("[v0] 키워드 배열 내용:", JSON.stringify(activeKeywords.map((k) => k.text)))
      console.log("[v0] 수소발전 포함 여부:", activeKeywords.some(k => k.text === "수소발전"))
      console.log("=====================================")

      const response = await fetch("/api/miso-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: activeKeywords.map((k) => k.text),
          newsCount: newsCount,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }

      const data = await response.json()
      console.log("=== [v0] API 응답 처리 ===")
      console.log("[v0] 받은 응답 데이터:", data)
      console.log("[v0] 뉴스 개수:", data.news?.length || 0)
      console.log("========================")

      if (data.isMockData && data.message) {
        console.log("[v0] 사용자 알림:", data.message)
      }

      const transformedNews: NewsItem[] =
        data.news?.map((item: any, index: number) => ({
          id: `news-${Date.now()}-${index}`,
          title: item.title || "",
          summary: item.summary || item.content || "",
          url: item.url || "#",
          publishedAt: item.publishedAt || item.date || new Date().toISOString(),
          source: item.source || "",
          selected: false,
          keywords: item.keywords || activeKeywords.map((k) => k.text),
          score: item.score,
          category: item.category,
          press: item.press, // Added press field from Miso API response
        })) || []

      setNewsItems(transformedNews)
      setActiveTab("results")
    } catch (error) {
      console.error("[v0] 미소 API 호출 오류:", error)

      setNewsItems([])
      setActiveTab("results")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedNewsCount = newsItems.filter((item) => item.selected).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-40 h-8 rounded-lg flex items-center justify-center overflow-hidden px-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-klLMMXfSOnkkezmvnDTtTSyVbVeg7P.png"
                  alt="GS E&R Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">GS E&R 뉴스 모니터링</h1>
                <p className="text-sm text-muted-foreground">실시간 뉴스 스크래핑 및 분석 도구</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                활성 키워드: {keywords.filter((k) => k.active).length}개
              </Badge>
              <Badge variant="outline" className="text-xs">
                추출 개수: {newsCount}개
              </Badge>
              {selectedNewsCount > 0 && (
                <Badge variant="default" className="text-xs">
                  선택된 뉴스: {selectedNewsCount}개
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              키워드 관리
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              검색 결과
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              선택된 뉴스 ({selectedNewsCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordManager
              keywords={keywords}
              setKeywords={setKeywords}
              onSearch={handleSearch}
              isLoading={isLoading}
              newsCount={newsCount}
              setNewsCount={setNewsCount}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <NewsResults
              newsItems={newsItems}
              setNewsItems={setNewsItems}
              isLoading={isLoading}
              onRefresh={handleSearch}
            />
          </TabsContent>

          <TabsContent value="selected" className="space-y-6">
            <SelectedNews newsItems={newsItems} setNewsItems={setNewsItems} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
