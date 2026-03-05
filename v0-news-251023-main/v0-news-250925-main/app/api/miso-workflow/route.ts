import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log("[v0] 받은 전체 요청 데이터:", JSON.stringify(requestBody, null, 2))
    
    const { keywords, newsCount = 20 } = requestBody

    console.log("[v0] 받은 키워드 배열:", keywords)
    console.log("[v0] 키워드 타입:", typeof keywords)
    console.log("[v0] 키워드 개수:", keywords?.length || 0)
    console.log("[v0] 키워드 배열 상세:", JSON.stringify(keywords, null, 2))
    console.log("[v0] 요청된 뉴스 개수:", newsCount)
    
    // 각 키워드를 개별적으로 로그 출력
    if (Array.isArray(keywords)) {
      keywords.forEach((keyword, index) => {
        console.log(`[v0] 키워드 ${index + 1}: "${keyword}" (길이: ${keyword.length})`)
      })
    }
    
    // 키워드 유효성 검사
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      console.log("[v0] 키워드가 유효하지 않음:", keywords)
      return NextResponse.json({
        success: false,
        error: "뉴스 수집에 실패하였습니다.",
        message: "유효한 키워드가 제공되지 않았습니다.",
        news: [],
        total: 0,
        keywords: keywords || [],
        timestamp: new Date().toISOString(),
      })
    }

  // 사용자가 활성화한 키워드만 전송 (필터링 없음)
  // MISO API는 모든 키워드를 허용하므로 필터링하지 않음
  const misoKeywordsString = keywords.join(", ")

  console.log("[v0] 활성화된 키워드 전송:")
  console.log("[v0] 키워드 개수:", keywords.length)
  console.log("[v0] MISO API에 전송할 키워드 문자열:", misoKeywordsString)

    // 환경변수 또는 하드코딩된 값 사용
    const MISO_WORKFLOW_URL = process.env.MISO_WORKFLOW_URL || "https://api.holdings.miso.gs/ext/v1"
    const MISO_API_KEY = process.env.MISO_API_KEY || "app-CmnYSIcPDf4SBPs2ARvfdPcx"

    console.log("[v0] 환경변수 확인:")
    console.log("[v0] MISO_WORKFLOW_URL:", MISO_WORKFLOW_URL)
    console.log("[v0] MISO_API_KEY:", MISO_API_KEY ? "설정됨" : "누락")

    if (!MISO_WORKFLOW_URL || !MISO_API_KEY) {
      console.log("[v0] 환경변수 누락 - 목업 데이터 반환")
      return getMockDataResponse(keywords, newsCount, "환경변수가 설정되지 않아 샘플 데이터를 표시합니다.")
    }

    // MISO API 엔드포인트에 /workflows/run 추가
    const apiEndpoint = MISO_WORKFLOW_URL.endsWith('/workflows/run') 
      ? MISO_WORKFLOW_URL 
      : `${MISO_WORKFLOW_URL}/workflows/run`

    console.log("[v0] 최종 API 엔드포인트:", apiEndpoint)

    if (!apiEndpoint.startsWith("http")) {
      console.log("[v0] 잘못된 URL 형식")
      return NextResponse.json({
        success: false,
        error: "뉴스 수집에 실패하였습니다.",
        message: "API URL이 올바르지 않습니다.",
        news: [],
        total: 0,
        keywords: keywords,
        timestamp: new Date().toISOString(),
      })
    }

    console.log("[v0] 사용자 입력 키워드 개수:", keywords.length)
    console.log("[v0] 사용자 입력 키워드 배열:", JSON.stringify(keywords))
    console.log("[v0] 요청된 뉴스 개수:", newsCount)

    // MISO API 가이드에 따른 정확한 요청 형식
    const misoInputData = {
      inputs: {
        input: misoKeywordsString, // 키워드 문자열
        number: newsCount, // 뉴스 개수
      },
      mode: "blocking", // blocking 모드 사용
      user: "gs-er-news-scraper", // 사용자 식별자
    }

    console.log("[v0] 미소 API 요청 데이터:", JSON.stringify(misoInputData, null, 2))
    console.log("[v0] 미소 API 요청 데이터의 input 필드:", misoInputData.inputs.input)
    console.log("[v0] 미소 API 요청 데이터의 input 필드 길이:", misoInputData.inputs.input.length)

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(misoInputData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] 미소 API 성공 응답:", JSON.stringify(data, null, 2))

        const workflowData = data.data || data
        const outputs = workflowData.outputs || {}

        console.log("[v0] 워크플로우 출력:", JSON.stringify(outputs, null, 2))
        console.log("[v0] 워크플로우 상태:", workflowData.status)
        console.log("[v0] 워크플로우 ID:", workflowData.id)

        // MISO API 응답에서 뉴스 데이터 추출 (사용자가 설정한 출력 변수에서 추출)
        const rawNewsData =
          outputs.RESULT2 ||
          outputs.news ||
          outputs.articles ||
          outputs.result ||
          outputs.data ||
          outputs.뉴스 ||
          outputs.결과 ||
          outputs.output ||
          outputs.news_data ||
          outputs.news_list ||
          []

        console.log("[v0] 추출된 뉴스 데이터:", rawNewsData)

        const transformedNews = Array.isArray(rawNewsData)
          ? rawNewsData.map((item, index) => ({
              id: `miso-${index}`,
              title: item.title || item.제목 || `뉴스 ${index + 1}`,
              summary: item.summary || item.content || item.description || "",
              url: item.link || item.url || item.링크 || "#",
              publishedAt: item.pub_date || item.publishedAt || item.date || item.날짜 || new Date().toISOString(),
              source: item.press || item.source || item.publisher || item.출처 || "미소 뉴스",
              selected: false,
              keywords: keywords,
              score: item.score || item.점수 || 0,
              category: item.category || item.카테고리 || "일반",
              press: item.press || item.언론사 || "",
            }))
          : []

        return NextResponse.json({
          success: true,
          news: transformedNews,
          total: transformedNews.length,
          keywords: keywords,
          timestamp: new Date().toISOString(),
          workflowRunId: workflowData.workflow_run_id || workflowData.id,
          taskId: data.task_id,
          misoResponse: data, // 디버깅을 위한 원본 응답 포함
        })
      } else {
        const errorText = await response.text().catch(() => "응답 읽기 실패")
        const errorMessage = `미소 API 오류 - 상태: ${response.status}, 응답: ${errorText}`
        console.log(`[v0] ${errorMessage}`)
        return NextResponse.json({
          success: false,
          error: "뉴스 수집에 실패하였습니다.",
          message: errorMessage,
          news: [],
          total: 0,
          keywords: keywords,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      const errorMessage = `미소 API 연결 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      console.log(`[v0] ${errorMessage}`)
      return NextResponse.json({
        success: false,
        error: "뉴스 수집에 실패하였습니다.",
        message: errorMessage,
        news: [],
        total: 0,
        keywords: keywords,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("[v0] 미소 워크플로우 API 오류:", error)
    return NextResponse.json({
      success: false,
      error: "뉴스 수집에 실패하였습니다.",
      message: error instanceof Error ? error.message : "알 수 없는 오류",
      news: [],
      total: 0,
      keywords: [],
      timestamp: new Date().toISOString(),
    })
  }
}

function getMockDataResponse(keywords: string[] = [], newsCount = 20, errorDetails?: string) {
  const mockNews = [
    {
      id: "mock-1",
      title: "GS E&R, LNG 발전소 신규 건설 계획 발표",
      summary: "GS E&R이 LNG 발전소 신규 건설을 위한 구체적인 계획을 발표했습니다. 이번 계획은 국내 에너지 안정성 확보와 탄소중립 목표 달성에 기여할 것으로 예상됩니다.",
      url: "https://example.com/news/1",
      publishedAt: "2024-01-15T09:30:00Z",
      source: "에너지경제",
      selected: false,
      keywords: keywords,
      score: 95,
      category: "발전",
      press: "에너지경제",
    },
    {
      id: "mock-2",
      title: "국내 전력 수급 안정화를 위한 ESG 경영 강화",
      summary: "국내 전력 수급 안정화를 위해 ESG 경영을 강화하는 방안이 논의되고 있습니다. 지속가능한 에너지 정책과 기업의 사회적 책임을 강조하는 내용입니다.",
      url: "https://example.com/news/2",
      publishedAt: "2024-01-14T14:20:00Z",
      source: "한국경제",
      selected: false,
      keywords: keywords,
      score: 88,
      category: "정책",
      press: "한국경제",
    },
    {
      id: "mock-3",
      title: "탄소중립 실현을 위한 배출권 거래제 개선 방안",
      summary: "탄소중립 실현을 위한 배출권 거래제 개선 방안이 제시되었습니다. 기존 제도의 한계를 극복하고 더욱 효과적인 탄소 감축을 위한 정책입니다.",
      url: "https://example.com/news/3",
      publishedAt: "2024-01-13T16:45:00Z",
      source: "환경일보",
      selected: false,
      keywords: keywords,
      score: 92,
      category: "환경",
      press: "환경일보",
    },
    {
      id: "mock-4",
      title: "신재생에너지 RPS 제도 개선으로 발전사업 활성화",
      summary: "신재생에너지 RPS 제도 개선을 통해 발전사업이 활성화될 것으로 전망됩니다. 재생에너지 확산과 관련 산업 발전에 긍정적인 영향을 미칠 것으로 예상됩니다.",
      url: "https://example.com/news/4",
      publishedAt: "2024-01-12T11:15:00Z",
      source: "전력신문",
      selected: false,
      keywords: keywords,
      score: 90,
      category: "정책",
      press: "전력신문",
    },
    {
      id: "mock-5",
      title: "바이오매스 발전소 운영 효율성 향상 방안",
      summary: "바이오매스 발전소의 운영 효율성을 향상시키는 방안이 제시되었습니다. 신재생에너지 분야의 기술 혁신과 운영 최적화를 통한 발전 효율 개선에 초점을 맞춘 내용입니다.",
      url: "https://example.com/news/5",
      publishedAt: "2024-01-11T15:30:00Z",
      source: "그린에너지",
      selected: false,
      keywords: keywords,
      score: 87,
      category: "발전",
      press: "그린에너지",
    },
  ]

  const extendedMockNews = []
  for (let i = 0; i < newsCount; i++) {
    const baseNews = mockNews[i % mockNews.length]
    extendedMockNews.push({
      ...baseNews,
      id: `mock-${i + 1}`,
      title: `${baseNews.title} (${i + 1})`,
      url: `${baseNews.url}?id=${i + 1}`,
    })
  }

  console.log("[v0] 목업 데이터 반환:", extendedMockNews.length, "개 뉴스")

  return NextResponse.json({
    success: true,
    message: errorDetails ? "API 연결 문제로 샘플 데이터를 표시합니다." : "샘플 데이터를 표시합니다.",
    news: extendedMockNews,
    total: extendedMockNews.length,
    keywords: keywords,
    timestamp: new Date().toISOString(),
    isMockData: true,
    errorDetails: errorDetails,
  })
}
