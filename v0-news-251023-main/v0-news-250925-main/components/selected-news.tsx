"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookmarkCheck, Download, X, GripVertical, ChevronUp, ChevronDown, Copy } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: string
  selected: boolean
  keywords: string[]
  press?: string
}

interface SelectedNewsProps {
  newsItems: NewsItem[]
  setNewsItems: (items: NewsItem[]) => void
}

// 드래그 가능한 뉴스 아이템 컴포넌트
function SortableNewsItem({ 
  item, 
  index, 
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: { 
  item: NewsItem
  index: number
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  isFirst: boolean
  isLast: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }


  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`border-l-4 border-l-primary ${isDragging ? 'shadow-lg' : ''}`}
    >
      <Card>
        <CardContent className="pt-1 px-2 pb-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                #{index + 1}
              </Badge>
              {item.title && (
                <h3 className="font-semibold text-base leading-tight text-balance flex-1">
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
            </div>
            <div className="flex items-center gap-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-2 rounded hover:bg-gray-100 transition-colors select-none touch-none"
                title="드래그하여 순서 변경"
                style={{ touchAction: 'none' }}
              >
                <GripVertical className="w-4 h-4" />
              </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(item.id)}
              disabled={isFirst}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="위로 이동"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(item.id)}
              disabled={isLast}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="아래로 이동"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-muted-foreground hover:text-destructive"
              title="선택 해제"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  )
}

export function SelectedNews({ newsItems, setNewsItems }: SelectedNewsProps) {
  // 선택된 뉴스만 필터링
  const selectedNewsItems = newsItems.filter((item) => item.selected)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const removeFromSelected = (id: string) => {
    // 선택된 뉴스에서 제거 (체크박스 해제)
    setNewsItems(newsItems.map((item) => 
      item.id === id ? { ...item, selected: false } : item
    ))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log("[v0] 드래그 이벤트:", { activeId: active.id, overId: over?.id })

    if (over && active.id !== over.id) {
      // 선택된 뉴스에서만 인덱스 찾기
      const oldIndex = selectedNewsItems.findIndex((item) => item.id === active.id)
      const newIndex = selectedNewsItems.findIndex((item) => item.id === over.id)

      console.log("[v0] 선택된 뉴스 드래그 인덱스:", { oldIndex, newIndex })

      if (oldIndex !== -1 && newIndex !== -1) {
        // 선택된 뉴스들만 재정렬
        const newSelectedItems = arrayMove(selectedNewsItems, oldIndex, newIndex)
        
        console.log("[v0] 선택된 뉴스 재정렬 후:", newSelectedItems.map(item => item.title))
        
        // 전체 newsItems에서 선택된 뉴스들을 새로운 순서로 업데이트
        const unselectedItems = newsItems.filter(item => !item.selected)
        const reorderedItems = [...unselectedItems, ...newSelectedItems]
        
        console.log("[v0] 최종 순서:", reorderedItems.map(item => item.title))
        
        setNewsItems(reorderedItems)
      }
    }
  }

  const moveUp = (id: string) => {
    console.log("[v0] 위로 이동 버튼 클릭:", id)
    
    // 선택된 뉴스에서 현재 아이템의 인덱스 찾기
    const currentIndex = selectedNewsItems.findIndex((item) => item.id === id)
    console.log("[v0] 선택된 뉴스에서 현재 인덱스:", currentIndex)
    
    if (currentIndex > 0) {
      // 선택된 뉴스들만 재정렬
      const newSelectedItems = arrayMove(selectedNewsItems, currentIndex, currentIndex - 1)
      console.log("[v0] 위로 이동 후 선택된 뉴스 순서:", newSelectedItems.map(item => item.title))
      
      // 전체 newsItems에서 선택된 뉴스들을 새로운 순서로 업데이트
      const unselectedItems = newsItems.filter(item => !item.selected)
      const reorderedItems = [...unselectedItems, ...newSelectedItems]
      
      setNewsItems(reorderedItems)
    }
  }

  const moveDown = (id: string) => {
    console.log("[v0] 아래로 이동 버튼 클릭:", id)
    
    // 선택된 뉴스에서 현재 아이템의 인덱스 찾기
    const currentIndex = selectedNewsItems.findIndex((item) => item.id === id)
    console.log("[v0] 선택된 뉴스에서 현재 인덱스:", currentIndex)
    
    if (currentIndex < selectedNewsItems.length - 1) {
      // 선택된 뉴스들만 재정렬
      const newSelectedItems = arrayMove(selectedNewsItems, currentIndex, currentIndex + 1)
      console.log("[v0] 아래로 이동 후 선택된 뉴스 순서:", newSelectedItems.map(item => item.title))
      
      // 전체 newsItems에서 선택된 뉴스들을 새로운 순서로 업데이트
      const unselectedItems = newsItems.filter(item => !item.selected)
      const reorderedItems = [...unselectedItems, ...newSelectedItems]
      
      setNewsItems(reorderedItems)
    }
  }

  const exportSelected = () => {
    const exportData = selectedNewsItems.map((item) => ({
      title: item.title,
      summary: item.summary,
      url: item.url,
      publishedAt: item.publishedAt,
      source: item.source,
      keywords: item.keywords,
    }))

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `selected-news-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyAsHTML = () => {
    // 언론사명 변환 함수
    const convertPressName = (press: string) => {
      const pressMap: { [key: string]: string } = {
        'ebn.co.kr': 'EBN',
        'news.sbs.co.kr': 'SBS',
        'news.kbs.co.kr': 'KBS',
        'news.mbc.co.kr': 'MBC',
        'news.jtbc.co.kr': 'JTBC',
        'news.chosun.com': '조선일보',
        'news.hankookilbo.com': '한국일보',
        'news.donga.com': '동아일보',
        'news.joins.com': '중앙일보',
        'news.hani.co.kr': '한겨레',
        'news.khan.co.kr': '경향신문',
        'news.mk.co.kr': '매일경제',
        'news.etoday.co.kr': '이투데이',
        'news.heraldcorp.com': '헤럴드경제',
        'news.asiae.co.kr': '아시아경제',
        'news.mt.co.kr': '머니투데이',
        'news.edaily.co.kr': '이데일리',
        'news.fnnews.com': '파이낸셜뉴스',
        'news.sedaily.com': '서울경제',
        'news.newsis.com': '뉴시스',
        'news.yna.co.kr': '연합뉴스',
        'news.yonhapnews.co.kr': '연합뉴스',
        'news.newstapa.org': '뉴스타파',
        'news.ohmynews.com': '오마이뉴스',
        'news.pressian.com': '프레시안',
        'news.huffingtonpost.kr': '허핑턴포스트',
        'news.bbc.com': 'BBC',
        'news.cnn.com': 'CNN',
        'news.reuters.com': '로이터',
        'news.ap.org': 'AP',
        'news.afp.com': 'AFP'
      }
      
      // 정확한 매칭 시도
      if (pressMap[press]) {
        return pressMap[press]
      }
      
      // 도메인에서 언론사명 추출 시도
      const domain = press.toLowerCase()
      for (const [key, value] of Object.entries(pressMap)) {
        if (domain.includes(key)) {
          return value
        }
      }
      
      // 매칭되지 않으면 원본 반환
      return press
    }

    const htmlContent = `안녕하십니까.<br>
<strong>미래전략부문 대외협력팀</strong> 입니다.<br>
<br>
${selectedNewsItems.map((item, index) => {
  const category = item.category ? `[${item.category.replace(/[\[\]]/g, '')}]` : ''
  const source = convertPressName(item.press || item.source || '출처미상')
  return `<a href="${item.url}" target="_blank" style="color: black; text-decoration: underline;"><strong>${index + 1}. ${category} ${item.title}  (${source})</strong></a>`
}).join('<br><br>')}`

    navigator.clipboard.writeText(htmlContent).then(() => {
      alert('HTML 형태로 클립보드에 복사되었습니다!')
    }).catch((err) => {
      console.error('복사 실패:', err)
      // fallback: 텍스트 영역을 만들어서 복사
      const textArea = document.createElement('textarea')
      textArea.value = htmlContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('HTML 형태로 클립보드에 복사되었습니다!')
    })
  }

  return (
    <div className="space-y-6">
      {/* Selected News Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5" />
              선택된 뉴스
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="default">{selectedNewsItems.length}개 선택됨</Badge>
              {selectedNewsItems.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={copyAsHTML}>
                    <Copy className="w-4 h-4 mr-2" />
                    HTML 복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportSelected}>
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Selected News Items */}
      {selectedNewsItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <BookmarkCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold mb-2">선택된 뉴스가 없습니다</h3>
              <p className="text-sm">검색 결과에서 관심 있는 뉴스를 선택해보세요.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={selectedNewsItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {selectedNewsItems.map((item, index) => (
                <SortableNewsItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={removeFromSelected}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  isFirst={index === 0}
                  isLast={index === selectedNewsItems.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
