"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Calendar, Building2, Search } from "lucide-react"

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
  press?: string // Added press field to interface
}

interface NewsResultsProps {
  newsItems: NewsItem[]
  setNewsItems: (items: NewsItem[]) => void
  isLoading: boolean
  onRefresh: () => void
}

export function NewsResults({ newsItems, setNewsItems, isLoading, onRefresh }: NewsResultsProps) {
  const toggleNewsSelection = (id: string) => {
    setNewsItems(newsItems.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="font-semibold mb-2">뉴스를 검색하고 있습니다...</h3>
            <p className="text-sm text-muted-foreground">워크플로우에서 최신 뉴스를 수집 중입니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              검색 결과
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">총 {newsItems.length}개 뉴스</Badge>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* News Items */}
      {newsItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-sm">키워드를 확인하고 다시 검색해보세요.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {newsItems.map((item) => (
            <Card key={item.id} className={`transition-all ${item.selected ? "ring-2 ring-primary" : ""}`}>
              <CardContent className="pt-1 px-2 pb-1.5">
                <div className="flex gap-2">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleNewsSelection(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="space-y-1">
                      {item.title && (
                        <h3 className="font-semibold text-base leading-tight text-balance">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors cursor-pointer"
                          >
                            {item.title}
                          </a>
                        </h3>
                      )}
                      {item.summary && (
                        <p className="text-muted-foreground text-xs leading-relaxed">{item.summary}</p>
                      )}
                      {(item.score || item.category) && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.score && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-2 py-1">
                              점수 {item.score}
                            </Badge>
                          )}
                          {item.category && (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs px-2 py-1">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {(item.press || item.source) && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {item.press || item.source}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
