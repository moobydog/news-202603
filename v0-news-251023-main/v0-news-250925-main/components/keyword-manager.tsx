"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Search, RefreshCw, CheckSquare, Square, Settings } from "lucide-react"

interface Keyword {
  id: string
  text: string
  active: boolean
}

interface KeywordManagerProps {
  keywords: Keyword[]
  setKeywords: (keywords: Keyword[]) => void
  onSearch: () => void
  isLoading: boolean
  newsCount: number
  setNewsCount: (count: number) => void
}

export function KeywordManager({
  keywords,
  setKeywords,
  onSearch,
  isLoading,
  newsCount,
  setNewsCount,
}: KeywordManagerProps) {
  const [newKeyword, setNewKeyword] = useState("")

  const addKeyword = () => {
    const trimmedKeyword = newKeyword.trim()
    if (trimmedKeyword && !keywords.some((k) => k.text === trimmedKeyword)) {
      // 모든 키워드 허용 - 제한 제거
      const newId = Date.now().toString()
      setKeywords([...keywords, { id: newId, text: trimmedKeyword, active: true }])
      setNewKeyword("")
    }
  }

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter((k) => k.id !== id))
  }

  const toggleKeyword = (id: string) => {
    setKeywords(keywords.map((k) => (k.id === id ? { ...k, active: !k.active } : k)))
  }

  const selectAll = () => {
    setKeywords(keywords.map((k) => ({ ...k, active: true })))
  }

  const deselectAll = () => {
    setKeywords(keywords.map((k) => ({ ...k, active: false })))
  }

  const allSelected = keywords.length > 0 && keywords.every((k) => k.active)
  const someSelected = keywords.some((k) => k.active)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addKeyword()
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Keyword Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />새 키워드 추가
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="새 키워드를 입력하세요 (예: LNG, 석탄, 발전소, ESG, 탄소중립 등)"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addKeyword} disabled={!newKeyword.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keywords List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>키워드 목록</CardTitle>
            <div className="flex items-center gap-3">
              {keywords.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={allSelected ? deselectAll : selectAll}
                    className="text-xs bg-transparent"
                  >
                    {allSelected ? (
                      <>
                        <Square className="w-3 h-3 mr-1" />
                        전체해제
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3 h-3 mr-1" />
                        전체선택
                      </>
                    )}
                  </Button>
                </div>
              )}
              <Badge variant="secondary">
                총 {keywords.length}개 (활성: {keywords.filter((k) => k.active).length}개)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 overflow-y-auto border rounded-lg bg-muted/20">
            <div className="p-3 space-y-3">
              {keywords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>등록된 키워드가 없습니다.</p>
                  <p className="text-sm">위에서 새 키워드를 추가해보세요.</p>
                </div>
              ) : (
                keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={keyword.active}
                        onCheckedChange={() => toggleKeyword(keyword.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className={`font-medium ${keyword.active ? "text-foreground" : "text-muted-foreground"}`}>
                        {keyword.text}
                      </span>
                      {keyword.active && (
                        <Badge variant="default" className="text-xs">
                          활성
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyword(keyword.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Action */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">뉴스 검색 실행</h3>
              <p className="text-sm text-muted-foreground">
                선택된 {keywords.filter((k) => k.active).length}개 키워드로 최신 뉴스를 검색합니다.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">추출할 뉴스 개수:</span>
              </div>
              <Select value={newsCount.toString()} onValueChange={(value) => setNewsCount(Number.parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5개</SelectItem>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="15">15개</SelectItem>
                  <SelectItem value="20">20개</SelectItem>
                  <SelectItem value="25">25개</SelectItem>
                  <SelectItem value="30">30개</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={onSearch}
              disabled={isLoading || keywords.filter((k) => k.active).length === 0}
              size="lg"
              className="w-full max-w-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  미소 API 검색 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  뉴스 검색 시작
                </>
              )}
            </Button>
            {keywords.filter((k) => k.active).length === 0 && (
              <p className="text-xs text-destructive">검색하려면 최소 1개의 키워드를 활성화해야 합니다.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
