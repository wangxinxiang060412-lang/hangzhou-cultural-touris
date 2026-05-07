import { ref } from 'vue'

export type SiteLocale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'

export type LocalizedText = Record<SiteLocale, string>
export type LocalizedList = Record<SiteLocale, string[]>

const STORAGE_KEY = 'hangzhou-site-locale'

const defaultLocale: SiteLocale = 'zh-CN'

const localeLabels: Record<SiteLocale, string> = {
  'zh-CN': '中文',
  'en-US': 'EN',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
}

const localeNames: Record<SiteLocale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
}

type BrowserStorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

type BrowserDocumentLike = {
  documentElement: {
    lang: string
  }
}

const getBrowserStorage = () => {
  const candidate = globalThis as { localStorage?: BrowserStorageLike }
  return candidate.localStorage ?? null
}

const getBrowserDocument = () => {
  const candidate = globalThis as { document?: BrowserDocumentLike }
  return candidate.document ?? null
}

const readStoredLocale = (): SiteLocale => {
  const storage = getBrowserStorage()
  if (!storage) return defaultLocale

  const value = storage.getItem(STORAGE_KEY)
  if (value === 'zh-CN' || value === 'en-US' || value === 'ja-JP' || value === 'ko-KR') {
    return value
  }

  return defaultLocale
}

export const siteLocale = ref<SiteLocale>(readStoredLocale())

export const localeOptions = (Object.keys(localeLabels) as SiteLocale[]).map((code) => ({
  code,
  label: localeLabels[code],
  name: localeNames[code],
}))

export const setSiteLocale = (locale: SiteLocale) => {
  siteLocale.value = locale
  getBrowserStorage()?.setItem(STORAGE_KEY, locale)
  const documentRef = getBrowserDocument()
  if (documentRef) {
    documentRef.documentElement.lang = locale
  }
}

export const pickLocalized = (value: LocalizedText) => value[siteLocale.value] ?? value[defaultLocale]
export const pickLocalizedList = (value: LocalizedList) =>
  value[siteLocale.value] ?? value[defaultLocale]

const messages: Record<string, LocalizedText> = {
  'nav.home': {
    'zh-CN': '杭州',
    'en-US': 'Hangzhou',
    'ja-JP': '杭州',
    'ko-KR': '항저우',
  },
  'nav.reservations': {
    'zh-CN': '票务导览',
    'en-US': 'Tickets & Visits',
    'ja-JP': 'チケット・訪問案内',
    'ko-KR': '티켓·방문 안내',
  },
  'nav.routes': {
    'zh-CN': '路线',
    'en-US': 'Routes',
    'ja-JP': 'ルート',
    'ko-KR': '루트',
  },
  'nav.archive': {
    'zh-CN': '档案',
    'en-US': 'Archive',
    'ja-JP': 'アーカイブ',
    'ko-KR': '아카이브',
  },
  'nav.about': {
    'zh-CN': '关于',
    'en-US': 'About',
    'ja-JP': '案内',
    'ko-KR': '소개',
  },
  'nav.orders': {
    'zh-CN': '我的预约',
    'en-US': 'My Orders',
    'ja-JP': '予約記録',
    'ko-KR': '예약 내역',
  },
  'nav.menu': {
    'zh-CN': '菜单',
    'en-US': 'Menu',
    'ja-JP': 'メニュー',
    'ko-KR': '메뉴',
  },
  'nav.close': {
    'zh-CN': '收起',
    'en-US': 'Close',
    'ja-JP': '閉じる',
    'ko-KR': '닫기',
  },
  'nav.backToOpening': {
    'zh-CN': '回到开场',
    'en-US': 'Back to Opening',
    'ja-JP': '冒頭へ戻る',
    'ko-KR': '첫 화면으로',
  },
  'nav.note.home': {
    'zh-CN': '首页',
    'en-US': 'Home',
    'ja-JP': 'ホーム',
    'ko-KR': '홈',
  },
  'nav.note.reservations': {
    'zh-CN': '开放与票务',
    'en-US': 'Entry & Tickets',
    'ja-JP': '入場とチケット',
    'ko-KR': '입장 및 티켓',
  },
  'nav.note.orders': {
    'zh-CN': '预约记录',
    'en-US': 'Reservations',
    'ja-JP': '予約記録',
    'ko-KR': '예약 기록',
  },
  'nav.note.routes': {
    'zh-CN': '慢游路线',
    'en-US': 'Slow Routes',
    'ja-JP': '周遊ルート',
    'ko-KR': '추천 루트',
  },
  'nav.note.visitGuide': {
    'zh-CN': '访前须知',
    'en-US': 'Plan Your Visit',
    'ja-JP': '訪問前ガイド',
    'ko-KR': '방문 전 안내',
  },
  'nav.note.about': {
    'zh-CN': '关于本站',
    'en-US': 'About Site',
    'ja-JP': 'サイト案内',
    'ko-KR': '사이트 안내',
  },
  'nav.menuLabel': {
    'zh-CN': '主导航',
    'en-US': 'Primary Navigation',
    'ja-JP': 'メインナビゲーション',
    'ko-KR': '주요 메뉴',
  },
  'nav.mobileMenuLabel': {
    'zh-CN': '移动主导航',
    'en-US': 'Mobile Navigation',
    'ja-JP': 'モバイルメニュー',
    'ko-KR': '모바일 메뉴',
  },
  'nav.brandAria': {
    'zh-CN': '回到首页',
    'en-US': 'Back to home',
    'ja-JP': 'ホームへ戻る',
    'ko-KR': '홈으로 돌아가기',
  },
  'nav.languageLabel': {
    'zh-CN': '语言',
    'en-US': 'Language',
    'ja-JP': '言語',
    'ko-KR': '언어',
  },
  'nav.languageAria': {
    'zh-CN': '语言切换',
    'en-US': 'Language switcher',
    'ja-JP': '言語切替',
    'ko-KR': '언어 선택',
  },

  'footer.section': {
    'zh-CN': '章节',
    'en-US': 'Sections',
    'ja-JP': '章立て',
    'ko-KR': '섹션',
  },
  'footer.pages': {
    'zh-CN': '页面',
    'en-US': 'Pages',
    'ja-JP': 'ページ',
    'ko-KR': '페이지',
  },
  'footer.opening': {
    'zh-CN': '00 — 开场',
    'en-US': '00 — Opening',
    'ja-JP': '00 — オープニング',
    'ko-KR': '00 — 오프닝',
  },
  'footer.notices': {
    'zh-CN': '01 — 公告',
    'en-US': '01 — Notices',
    'ja-JP': '01 — 告知',
    'ko-KR': '01 — 공지',
  },
  'footer.intro': {
    'zh-CN': '02 — 总述',
    'en-US': '02 — Overview',
    'ja-JP': '02 — 概要',
    'ko-KR': '02 — 개요',
  },
  'footer.weather': {
    'zh-CN': '03 — 天气',
    'en-US': '03 — Weather',
    'ja-JP': '03 — 天気',
    'ko-KR': '03 — 날씨',
  },
  'footer.seasons': {
    'zh-CN': '05 — 四时',
    'en-US': '05 — Seasons',
    'ja-JP': '05 — 四季',
    'ko-KR': '05 — 사계',
  },
  'footer.reservations': {
    'zh-CN': '04 — 票务',
    'en-US': '04 — Tickets',
    'ja-JP': '04 — チケット',
    'ko-KR': '04 — 티켓',
  },
  'footer.reveal': {
    'zh-CN': '04 — 显影',
    'en-US': '04 — Reveal',
    'ja-JP': '04 — レイヤー',
    'ko-KR': '04 — 레이어',
  },
  'footer.places': {
    'zh-CN': '06 — 景点',
    'en-US': '06 — Places',
    'ja-JP': '06 — 見どころ',
    'ko-KR': '06 — 명소',
  },
  'footer.routes': {
    'zh-CN': '07 — 漫游',
    'en-US': '07 — Routes',
    'ja-JP': '07 — 周遊',
    'ko-KR': '07 — 루트',
  },
  'footer.impressions': {
    'zh-CN': '08 — 意象',
    'en-US': '08 — Impressions',
    'ja-JP': '08 — 印象',
    'ko-KR': '08 — 인상',
  },
  'footer.brandLine': {
    'zh-CN': '杭州文旅',
    'en-US': 'Hangzhou Travel',
    'ja-JP': '杭州観光',
    'ko-KR': '항저우 관광',
  },
  'footer.bottomLine': {
    'zh-CN': '湖山 · 文脉 · 烟火 · 杭州文旅',
    'en-US': 'Lake · Heritage · Daily Life · Hangzhou Travel',
    'ja-JP': '湖山・文脈・暮らし・杭州観光',
    'ko-KR': '호수와 산 · 문맥 · 일상 · 항저우 관광',
  },
  'footer.contact': {
    'zh-CN': '联络与服务',
    'en-US': 'Contact & Service',
    'ja-JP': 'お問い合わせ',
    'ko-KR': '문의 및 지원',
  },
  'footer.contactAria': {
    'zh-CN': '联络与服务信息',
    'en-US': 'Contact and service information',
    'ja-JP': 'お問い合わせ・サービス情報',
    'ko-KR': '문의 및 서비스 정보',
  },
  'footer.contactTourismHotline': {
    'zh-CN': '全国旅游服务热线',
    'en-US': 'National Tourism Hotline',
    'ja-JP': '全国観光ホットライン',
    'ko-KR': '전국 관광 콜센터',
  },
  'footer.contactCityHotline': {
    'zh-CN': '杭州市民服务热线',
    'en-US': 'Hangzhou Citizen Hotline',
    'ja-JP': '杭州市民サービスホットライン',
    'ko-KR': '항저우 시민 콜센터',
  },
  'footer.contactEmail': {
    'zh-CN': '游客服务邮箱',
    'en-US': 'Visitor Service Email',
    'ja-JP': '旅客サービスメール',
    'ko-KR': '방문자 서비스 이메일',
  },
  'footer.contactHours': {
    'zh-CN': '服务时间',
    'en-US': 'Service Hours',
    'ja-JP': '対応時間',
    'ko-KR': '서비스 시간',
  },
  'footer.contactHoursValue': {
    'zh-CN': '全年 · 09:00–21:00 (UTC+08:00)',
    'en-US': 'Year-round · 09:00–21:00 (UTC+08:00)',
    'ja-JP': '通年 · 09:00〜21:00 (UTC+08:00)',
    'ko-KR': '연중 · 09:00–21:00 (UTC+08:00)',
  },
  'footer.legalNote': {
    'zh-CN': '本站为杭州文旅形象与预约服务原型站点，所列价格、政策与联络方式仅作展示之用，正式接入时以官方公告为准。',
    'en-US': 'This is a prototype of a Hangzhou cultural-tourism and reservation service site. Prices, policies and contacts are illustrative; refer to official notices for live operations.',
    'ja-JP': '本サイトは杭州文化観光と予約サービスのプロトタイプです。価格・ポリシー・連絡先は参考表示で、本番運用時は公式告知が優先されます。',
    'ko-KR': '본 사이트는 항저우 문화관광·예약 서비스의 프로토타입입니다. 가격·정책·연락처는 예시이며 실제 운영 시에는 공식 공지를 따릅니다.',
  },
  'footer.aria': {
    'zh-CN': '站点页脚',
    'en-US': 'Site footer',
    'ja-JP': 'サイトフッター',
    'ko-KR': '사이트 푸터',
  },
  'footer.sectionAria': {
    'zh-CN': '章节索引',
    'en-US': 'Sections',
    'ja-JP': '章立てインデックス',
    'ko-KR': '섹션 색인',
  },
  'footer.pagesAria': {
    'zh-CN': '页面导航',
    'en-US': 'Pages navigation',
    'ja-JP': 'ページ案内',
    'ko-KR': '페이지 안내',
  },
  'footer.copyrightSuffix': {
    'zh-CN': '杭州市文化广电旅游局指导',
    'en-US': 'Guided by Hangzhou Culture, Radio, TV & Tourism Bureau',
    'ja-JP': '杭州市文化放送観光局 監修',
    'ko-KR': '항저우시 문화방송관광국 지도',
  },

  'page.home': {
    'zh-CN': '首页',
    'en-US': 'Home',
    'ja-JP': 'ホーム',
    'ko-KR': '홈',
  },
  'page.orders': {
    'zh-CN': '我的预约',
    'en-US': 'My Orders',
    'ja-JP': '予約記録',
    'ko-KR': '예약 내역',
  },
  'page.about': {
    'zh-CN': '关于',
    'en-US': 'About',
    'ja-JP': '案内',
    'ko-KR': '소개',
  },
  'page.visitGuide': {
    'zh-CN': '访前须知',
    'en-US': 'Visit Guide',
    'ja-JP': '訪問ガイド',
    'ko-KR': '방문 안내',
  },
  'page.routes': {
    'zh-CN': '漫游路线',
    'en-US': 'Slow Routes',
    'ja-JP': '周遊ルート',
    'ko-KR': '추천 루트',
  },
  'page.search': {
    'zh-CN': '站内搜索',
    'en-US': 'Search',
    'ja-JP': '検索',
    'ko-KR': '검색',
  },
  'page.cityPasses': {
    'zh-CN': '城市组合票',
    'en-US': 'City Passes',
    'ja-JP': 'シティパス',
    'ko-KR': '시티 패스',
  },
  'page.neighborhoods': {
    'zh-CN': '街区与区域',
    'en-US': 'Neighbourhoods',
    'ja-JP': '街区とエリア',
    'ko-KR': '구역과 동네',
  },
  'page.events': {
    'zh-CN': '活动日历',
    'en-US': 'What’s On',
    'ja-JP': 'イベント日程',
    'ko-KR': '이벤트 캘린더',
  },
  'page.archive': {
    'zh-CN': '旅行档案',
    'en-US': 'Travel Archive',
    'ja-JP': '旅行アーカイブ',
    'ko-KR': '여행 아카이브',
  },
  'page.crumbsAria': {
    'zh-CN': '页面路径',
    'en-US': 'Breadcrumb',
    'ja-JP': 'パンくず',
    'ko-KR': '페이지 경로',
  },

  'site.brandLong': {
    'zh-CN': '杭州文旅 · 官方导览与票务',
    'en-US': 'Hangzhou Travel · Official Guide & Tickets',
    'ja-JP': '杭州観光 · 公式ガイド＆チケット',
    'ko-KR': '항저우 관광 · 공식 안내 및 티켓',
  },
  'site.travelLabel': {
    'zh-CN': '杭州文旅 · 官方导览',
    'en-US': 'Hangzhou Travel · Official Guide',
    'ja-JP': '杭州観光 · 公式ガイド',
    'ko-KR': '항저우 관광 · 공식 안내',
  },
  'site.subtitle': {
    'zh-CN': 'Hangzhou Travel',
    'en-US': 'Hangzhou Travel',
    'ja-JP': 'Hangzhou Travel',
    'ko-KR': 'Hangzhou Travel',
  },
  'site.concept': {
    'zh-CN': '在山水、宋韵与日常生活之间，慢慢抵达杭州。',
    'en-US': 'Arrive in Hangzhou through landscape, heritage and daily life.',
    'ja-JP': '山水と宋韻、暮らしのあいだを通って杭州へ。',
    'ko-KR': '풍경과 송풍, 생활의 결 사이로 항저우에 닿습니다.',
  },
  'site.descriptionLine': {
    'zh-CN': '杭州城市旅行官方导览、开放信息与票务入口。',
    'en-US': 'The official guide, entry information and ticketing portal for Hangzhou.',
    'ja-JP': '杭州の公式観光ガイド、入場情報、チケットポータル。',
    'ko-KR': '항저우 공식 관광 안내, 입장 정보 및 티켓 포털.',
  },
  'site.coordinates': {
    'zh-CN': '30.27° N · 120.15° E',
    'en-US': '30.27° N · 120.15° E',
    'ja-JP': '30.27° N · 120.15° E',
    'ko-KR': '30.27° N · 120.15° E',
  },

  'hero.aria': {
    'zh-CN': '杭州旅行开场',
    'en-US': 'Hangzhou opening',
    'ja-JP': '杭州・旅のはじまり',
    'ko-KR': '항저우 오프닝',
  },
  'hero.arrive': {
    'zh-CN': '慢慢抵达杭州',
    'en-US': 'Arrive in Hangzhou',
    'ja-JP': 'ゆっくり杭州へ',
    'ko-KR': '천천히 항저우로',
  },
  'hero.caption': {
    'zh-CN': '湖山 · 宋韵 · 城市日常',
    'en-US': 'Lake · Song Spirit · Daily City Life',
    'ja-JP': '湖山・宋韻・日々のまち',
    'ko-KR': '호수와 산 · 송풍 · 도시의 일상',
  },
  'hero.note': {
    'zh-CN': '在山水、宋韵与烟火之间，慢慢抵达杭州。',
    'en-US': 'Arrive in Hangzhou through landscape, heritage, and daily life.',
    'ja-JP': '山水と宋韻、暮らしのあいだを通って杭州へ。',
    'ko-KR': '풍경과 송풍, 생활의 결 사이로 항저우에 닿습니다.',
  },
  'hero.cta': {
    'zh-CN': '展开旅程',
    'en-US': 'Start the Journey',
    'ja-JP': '旅をひらく',
    'ko-KR': '여행 열기',
  },
  'hero.titleAlt': {
    'zh-CN': '西湖与雷峰塔的纸雕主视觉',
    'en-US': 'Paper-cut artwork of West Lake and Leifeng Pagoda',
    'ja-JP': '西湖と雷峰塔の切り紙ビジュアル',
    'ko-KR': '시후와 레이펑타의 종이 컷 이미지',
  },
  'hero.foot.next': {
    'zh-CN': '前往下一章节',
    'en-US': 'Go to next chapter',
    'ja-JP': '次の章へ',
    'ko-KR': '다음 장으로',
  },
  'hero.foot.index': {
    'zh-CN': '01 / 07 — 旅行开场',
    'en-US': '01 / 07 — Opening',
    'ja-JP': '01 / 07 — オープニング',
    'ko-KR': '01 / 07 — 오프닝',
  },

  'intro.eyebrow': {
    'zh-CN': '第一层 / 总述',
    'en-US': 'I / Overview',
    'ja-JP': '第一章 / 概要',
    'ko-KR': '제1장 / 개요',
  },
  'intro.title': {
    'zh-CN': '杭州的山水叙事，与一套清楚可信的开放和票务服务并行。',
    'en-US': "Hangzhou's landscape story, alongside clear and reliable entry and ticketing service.",
    'ja-JP': '杭州の山水の物語と、わかりやすく信頼できる入場・チケットサービスをひとつに。',
    'ko-KR': '항저우의 산수 이야기와 분명하고 신뢰할 수 있는 입장·티켓 서비스를 함께.',
  },
  'intro.body': {
    'zh-CN':
      '杭州的旅行，不只在西湖的一面水光里，也在苏堤的柳色、满觉陇的桂香、良渚的文明印记、大运河的生活流动，以及钱塘江畔不断生长的城市天际线之间。本站把官方导览、景区导引、开放信息与票务服务收束到同一个体验里。',
    'en-US':
      "Hangzhou is more than the surface of West Lake—it lives in the willows along Su Causeway, the osmanthus of Manjuelong, the deep time of Liangzhu, the daily flow of the Grand Canal, and the rising skyline along the Qiantang. This portal brings official guidance, on-site wayfinding, entry information and ticketing into a single experience.",
    'ja-JP':
      '杭州の旅は西湖の水面だけにあるのではありません。蘇堤の柳、満覚隴の桂花、良渚の文明、大運河の暮らし、銭塘江の都市スカイライン——その全てをひとつのサイトで案内し、予約まで完結できるようにしています。',
    'ko-KR':
      '항저우 여행은 시후의 수면뿐 아니라 쑤디의 버드나무, 만쥐에룽의 계화 향, 량주의 문명, 대운하의 일상, 첸탕장의 스카이라인까지 함께합니다. 공식 안내와 예약 입구를 한곳에 모아 두었습니다.',
  },
  'intro.serviceEyebrow': {
    'zh-CN': 'Visit Guide',
    'en-US': 'Visit Guide',
    'ja-JP': 'Visit Guide',
    'ko-KR': 'Visit Guide',
  },
  'intro.serviceTitle': {
    'zh-CN': '先看须知，再安心出发。',
    'en-US': 'Read the essentials first, then travel with peace of mind.',
    'ja-JP': '先にご案内を確認し、安心してご出発を。',
    'ko-KR': '먼저 안내를 확인하고 안심하고 떠나세요.',
  },
  'intro.viewGuide': {
    'zh-CN': '查看访前须知',
    'en-US': 'Read Visit Guide',
    'ja-JP': '訪問ガイドへ',
    'ko-KR': '방문 안내 보기',
  },
  'intro.openReservations': {
    'zh-CN': '进入票务导览',
    'en-US': 'Open Tickets & Visits',
    'ja-JP': 'チケット案内へ',
    'ko-KR': '티켓 안내로',
  },

  'weather.aria': {
    'zh-CN': '杭州实时天气',
    'en-US': 'Hangzhou real-time weather',
    'ja-JP': '杭州リアルタイム天気',
    'ko-KR': '항저우 실시간 날씨',
  },
  'weather.eyebrow': {
    'zh-CN': '实时同步 / 杭州天气',
    'en-US': 'Live Sync / Hangzhou Weather',
    'ja-JP': 'リアルタイム同期 / 杭州天気',
    'ko-KR': '실시간 동기화 / 항저우 날씨',
  },
  'weather.title': {
    'zh-CN': '出发前，看一眼真实天气。',
    'en-US': 'Check live weather before you go.',
    'ja-JP': '出発前にリアルタイム天気を確認。',
    'ko-KR': '출발 전 실시간 날씨를 확인하세요.',
  },
  'weather.description': {
    'zh-CN': '同步杭州当前气温、降水、风速与未来三天预报，用于判断湖区慢行、湿地步道、夜间演艺与船班体验。',
    'en-US': 'Live Hangzhou temperature, precipitation, wind and three-day forecast for lake walks, wetland trails, night shows and boat services.',
    'ja-JP': '杭州の現在気温、降水、風速、3日予報を同期し、湖畔散策、湿地歩道、夜公演、船便の判断に役立てます。',
    'ko-KR': '항저우 현재 기온, 강수, 풍속, 3일 예보를 동기화해 호수 산책, 습지길, 야간 공연, 선박 이용 판단에 활용합니다.',
  },
  'weather.now': {
    'zh-CN': '现在',
    'en-US': 'Now',
    'ja-JP': '現在',
    'ko-KR': '현재',
  },
  'weather.feelsLike': {
    'zh-CN': '体感',
    'en-US': 'Feels',
    'ja-JP': '体感',
    'ko-KR': '체감',
  },
  'weather.humidity': {
    'zh-CN': '湿度',
    'en-US': 'Humidity',
    'ja-JP': '湿度',
    'ko-KR': '습도',
  },
  'weather.wind': {
    'zh-CN': '风速',
    'en-US': 'Wind',
    'ja-JP': '風速',
    'ko-KR': '풍속',
  },
  'weather.precipitation': {
    'zh-CN': '降水',
    'en-US': 'Precip.',
    'ja-JP': '降水',
    'ko-KR': '강수',
  },
  'weather.rainChance': {
    'zh-CN': '降水概率',
    'en-US': 'Rain Chance',
    'ja-JP': '降水確率',
    'ko-KR': '강수 확률',
  },
  'weather.travelIndex': {
    'zh-CN': '出行提示',
    'en-US': 'Travel Note',
    'ja-JP': '訪問メモ',
    'ko-KR': '방문 안내',
  },
  'weather.risk.low': {
    'zh-CN': '天气平稳，适合湖区慢行与城市漫游。',
    'en-US': 'Settled weather for lake walks and city routes.',
    'ja-JP': '天候は安定。湖畔散策と市内周遊に適しています。',
    'ko-KR': '날씨가 안정적이며 호수 산책과 도시 코스에 적합합니다.',
  },
  'weather.risk.medium': {
    'zh-CN': '天气有变化，建议携带雨具并关注景区现场公告。',
    'en-US': 'Changing weather: bring rain gear and check venue notices.',
    'ja-JP': '天候変化があります。雨具を携帯し、現地告知をご確認ください。',
    'ko-KR': '날씨 변화가 있습니다. 우비를 챙기고 현장 공지를 확인하세요.',
  },
  'weather.risk.high': {
    'zh-CN': '存在明显降水、大风或高温风险，船班、夜游和山林步道请以官方公告为准。',
    'en-US': 'Rain, wind or heat risk is elevated; boats, night tours and hill trails should follow official notices.',
    'ja-JP': '強い雨・風・高温の可能性があります。船便、夜間観光、山林歩道は公式告知に従ってください。',
    'ko-KR': '강수, 강풍 또는 고온 위험이 높습니다. 선박, 야간 관광, 산림 산책로는 공식 공지를 따르세요.',
  },
  'weather.forecast': {
    'zh-CN': '三日预报',
    'en-US': 'Three-Day Forecast',
    'ja-JP': '3日予報',
    'ko-KR': '3일 예보',
  },
  'weather.sync': {
    'zh-CN': '同步天气',
    'en-US': 'Sync Weather',
    'ja-JP': '天気を同期',
    'ko-KR': '날씨 동기화',
  },
  'weather.syncing': {
    'zh-CN': '同步中',
    'en-US': 'Syncing',
    'ja-JP': '同期中',
    'ko-KR': '동기화 중',
  },
  'weather.syncedAt': {
    'zh-CN': '同步时间：{time}',
    'en-US': 'Synced: {time}',
    'ja-JP': '同期：{time}',
    'ko-KR': '동기화: {time}',
  },
  'weather.source': {
    'zh-CN': '天气源：{source}',
    'en-US': 'Source: {source}',
    'ja-JP': '情報源：{source}',
    'ko-KR': '출처: {source}',
  },
  'weather.loading': {
    'zh-CN': '正在同步杭州实时天气',
    'en-US': 'Syncing live Hangzhou weather',
    'ja-JP': '杭州のリアルタイム天気を同期中',
    'ko-KR': '항저우 실시간 날씨 동기화 중',
  },
  'weather.error': {
    'zh-CN': '天气同步失败，请稍后重试。',
    'en-US': 'Weather sync failed. Try again later.',
    'ja-JP': '天気同期に失敗しました。後ほどお試しください。',
    'ko-KR': '날씨 동기화에 실패했습니다. 잠시 후 다시 시도하세요.',
  },
  'weather.clear': {
    'zh-CN': '晴',
    'en-US': 'Clear',
    'ja-JP': '晴れ',
    'ko-KR': '맑음',
  },
  'weather.cloudy': {
    'zh-CN': '多云',
    'en-US': 'Cloudy',
    'ja-JP': '曇り',
    'ko-KR': '흐림',
  },
  'weather.fog': {
    'zh-CN': '雾',
    'en-US': 'Fog',
    'ja-JP': '霧',
    'ko-KR': '안개',
  },
  'weather.drizzle': {
    'zh-CN': '小雨',
    'en-US': 'Drizzle',
    'ja-JP': '小雨',
    'ko-KR': '이슬비',
  },
  'weather.rain': {
    'zh-CN': '降雨',
    'en-US': 'Rain',
    'ja-JP': '雨',
    'ko-KR': '비',
  },
  'weather.snow': {
    'zh-CN': '降雪',
    'en-US': 'Snow',
    'ja-JP': '雪',
    'ko-KR': '눈',
  },
  'weather.thunder': {
    'zh-CN': '雷雨',
    'en-US': 'Thunderstorm',
    'ja-JP': '雷雨',
    'ko-KR': '뇌우',
  },
  'weather.unknown': {
    'zh-CN': '天气更新中',
    'en-US': 'Updating',
    'ja-JP': '更新中',
    'ko-KR': '업데이트 중',
  },

  'featured.eyebrow': {
    'zh-CN': '第二层 / 开放与票务',
    'en-US': 'II / Entry & Tickets',
    'ja-JP': '第二章 / 入場とチケット',
    'ko-KR': '제2장 / 입장 및 티켓',
  },
  'featured.unit': {
    'zh-CN': '处',
    'en-US': 'spots',
    'ja-JP': '件',
    'ko-KR': '곳',
  },
  'featured.titleZh': {
    'zh-CN': '重点景点',
    'en-US': 'Featured',
    'ja-JP': '主要スポット',
    'ko-KR': '주요 명소',
  },
  'featured.titleEn': {
    'zh-CN': 'Featured Visits',
    'en-US': 'Featured Visits',
    'ja-JP': 'Featured Visits',
    'ko-KR': 'Featured Visits',
  },
  'featured.description': {
    'zh-CN': '把热门景点的开放状态、票务说明与分时服务收纳为更清楚的官方入口。先看景点详情，再按需要购票、登记或选择到访时段。',
    'en-US': 'Bring opening status, ticket notes and timed-entry services for key Hangzhou spots into one clear official entry point.',
    'ja-JP': '主要スポットの開放状況、チケット案内、時間帯サービスを公式入口として整理しました。',
    'ko-KR': '주요 명소의 개방 상태, 티켓 안내, 시간대 서비스를 공식 입구로 정리했습니다.',
  },
  'featured.viewSpot': {
    'zh-CN': '查看景点',
    'en-US': 'View Spot',
    'ja-JP': '詳細を見る',
    'ko-KR': '명소 보기',
  },
  'featured.book': {
    'zh-CN': '办理',
    'en-US': 'Book',
    'ja-JP': '手続き',
    'ko-KR': '진행',
  },
  'featured.viewSpotAria': {
    'zh-CN': '查看{name}',
    'en-US': 'View {name}',
    'ja-JP': '{name}の詳細を見る',
    'ko-KR': '{name} 보기',
  },
  'featured.moreLink': {
    'zh-CN': '查看全部开放与票务',
    'en-US': 'See All Tickets & Visits',
    'ja-JP': 'すべての入場・チケット案内へ',
    'ko-KR': '전체 입장·티켓 보기',
  },

  'state.reservationRequired': {
    'zh-CN': '购票/分时',
    'en-US': 'Ticket / Timed Entry',
    'ja-JP': 'チケット/時間帯',
    'ko-KR': '티켓/시간대',
  },
  'state.openVisit': {
    'zh-CN': '开放参观',
    'en-US': 'Open Access',
    'ja-JP': '入場自由',
    'ko-KR': '자유 입장',
  },
  'state.todayAvailable': {
    'zh-CN': '今日可约',
    'en-US': 'Available Today',
    'ja-JP': '本日予約可',
    'ko-KR': '오늘 예약 가능',
  },
  'state.todayFull': {
    'zh-CN': '今日约满',
    'en-US': 'Fully Booked',
    'ja-JP': '本日満員',
    'ko-KR': '오늘 매진',
  },
  'state.notReleased': {
    'zh-CN': '暂未放号',
    'en-US': 'Slots Not Released',
    'ja-JP': '未発行',
    'ko-KR': '미오픈',
  },
  'state.openVisitShort': {
    'zh-CN': '开放参观',
    'en-US': 'Open',
    'ja-JP': '開放',
    'ko-KR': '개방',
  },
  'state.containsTickets': {
    'zh-CN': '含票种',
    'en-US': 'Tickets',
    'ja-JP': '券種あり',
    'ko-KR': '티켓 있음',
  },
  'state.freeOpen': {
    'zh-CN': '免费开放',
    'en-US': 'Free Entry',
    'ja-JP': '入場無料',
    'ko-KR': '무료 입장',
  },

  'season.eyebrow': {
    'zh-CN': '第三层 / 四季杭州',
    'en-US': 'III / Seasonal Hangzhou',
    'ja-JP': '第三章 / 四季の杭州',
    'ko-KR': '제3장 / 사계의 항저우',
  },
  'season.title': {
    'zh-CN': '四季杭州',
    'en-US': 'Seasonal Hangzhou',
    'ja-JP': '四季の杭州',
    'ko-KR': '사계의 항저우',
  },
  'season.titleEn': {
    'zh-CN': 'Seasonal Hangzhou',
    'en-US': 'Seasonal Hangzhou',
    'ja-JP': 'Seasonal Hangzhou',
    'ko-KR': 'Seasonal Hangzhou',
  },
  'season.description': {
    'zh-CN': '每一个季节，都有抵达杭州的理由。',
    'en-US': 'Every season offers its own reason to come to Hangzhou.',
    'ja-JP': 'どの季節にも、杭州を訪れる理由があります。',
    'ko-KR': '계절마다 항저우를 찾을 이유가 있습니다.',
  },
  'season.note': {
    'zh-CN': '春柳、夏荷、秋桂、冬雪，把杭州的旅行节奏写成四页缓慢展开的风景。',
    'en-US': 'Willows in spring, lotus in summer, osmanthus in autumn, snow in winter—four slowly unfolding pages of Hangzhou.',
    'ja-JP': '春の柳、夏の蓮、秋の金木犀、冬の雪——杭州の旅は四つの風景となってゆっくり開きます。',
    'ko-KR': '봄의 버드나무, 여름의 연꽃, 가을의 계화, 겨울의 눈—네 장면으로 천천히 열리는 항저우.',
  },
  'season.aria': {
    'zh-CN': '四季杭州',
    'en-US': 'Seasonal Hangzhou',
    'ja-JP': '四季の杭州',
    'ko-KR': '사계의 항저우',
  },
  'season.chaptersAria': {
    'zh-CN': '杭州四时',
    'en-US': 'Four Seasons',
    'ja-JP': '杭州の四時',
    'ko-KR': '항저우의 사계',
  },
  'season.imageAlt': {
    'zh-CN': '{title}时节图像',
    'en-US': '{title} season image',
    'ja-JP': '{title}の季節イメージ',
    'ko-KR': '{title} 계절 이미지',
  },

  'reveal.eyebrow': {
    'zh-CN': '第四层 / 风景显影',
    'en-US': 'IV / Scenery Revealed',
    'ja-JP': '第四章 / 風景の顕影',
    'ko-KR': '제4장 / 풍경의 드러남',
  },
  'reveal.kickerPrefix': {
    'zh-CN': '风景',
    'en-US': 'Scenery',
    'ja-JP': '風景',
    'ko-KR': '풍경',
  },
  'reveal.metaRight': {
    'zh-CN': '西湖 · 文化记忆',
    'en-US': 'West Lake · Cultural Memory',
    'ja-JP': '西湖 · 文化の記憶',
    'ko-KR': '시후 · 문화 기억',
  },
  'reveal.paperAlt': {
    'zh-CN': '杭州断桥的纸雕风景',
    'en-US': 'Paper-cut scenery of the Broken Bridge in Hangzhou',
    'ja-JP': '断橋の切り紙風景',
    'ko-KR': '단교의 종이 컷 풍경',
  },

  'places.eyebrow': {
    'zh-CN': '第五层 / 城市景点索引',
    'en-US': 'V / City Spots Index',
    'ja-JP': '第五章 / 市内見どころ',
    'ko-KR': '제5장 / 도시 명소 색인',
  },
  'places.unit': {
    'zh-CN': '处',
    'en-US': 'spots',
    'ja-JP': '件',
    'ko-KR': '곳',
  },
  'places.titleZh': {
    'zh-CN': '抵达',
    'en-US': 'Arrive',
    'ja-JP': '到着',
    'ko-KR': '도착',
  },
  'places.titleEn': {
    'zh-CN': 'Places Archive',
    'en-US': 'Places Archive',
    'ja-JP': 'Places Archive',
    'ko-KR': 'Places Archive',
  },
  'places.description': {
    'zh-CN': '在城市景点索引中浏览全市开放的景区与文化空间，并直接进入开放信息与票务入口。',
    'en-US': 'Browse the full index of Hangzhou scenic and cultural sites, and step straight into entry information and ticketing.',
    'ja-JP': '杭州市内の主要景勝地を一覧で確認し、そのまま入場情報とチケット案内へ進めます。',
    'ko-KR': '항저우의 명소와 문화 공간을 한눈에 보고 곧바로 입장 정보와 티켓 안내로 이어집니다.',
  },

  'routes.eyebrow': {
    'zh-CN': '第六层 / 漫游杭州',
    'en-US': 'VI / Slow Routes',
    'ja-JP': '第六章 / 杭州を巡る',
    'ko-KR': '제6장 / 항저우 산책',
  },
  'routes.unit': {
    'zh-CN': '条',
    'en-US': 'routes',
    'ja-JP': '本',
    'ko-KR': '코스',
  },
  'routes.titleZh': {
    'zh-CN': '漫游杭州',
    'en-US': 'Slow Routes',
    'ja-JP': '杭州周遊',
    'ko-KR': '항저우 산책',
  },
  'routes.titleEn': {
    'zh-CN': 'Slow Routes',
    'en-US': 'Slow Routes',
    'ja-JP': 'Slow Routes',
    'ko-KR': 'Slow Routes',
  },
  'routes.descriptionShort': {
    'zh-CN': '用更慢的速度，进入杭州的山水、人文与城市日常。',
    'en-US': 'Move at a gentler pace through landscape, heritage and daily city life.',
    'ja-JP': 'ゆっくりとしたテンポで、山水・人文・都市の日常を歩きます。',
    'ko-KR': '느린 속도로 풍경과 문화, 도시의 일상을 둘러봅니다.',
  },
  'routes.descriptionLong': {
    'zh-CN': '不追求赶路，也不把城市拆成攻略。三条慢游路线，分别通往湖山、文脉与水岸生活。',
    'en-US': "Three unhurried routes that lead to the lake and hills, the heritage core, and the canal-side daily life of Hangzhou.",
    'ja-JP': '急がず、攻略にしすぎず。湖山・文脈・水辺の暮らしへ、三つの周遊ルートをご用意しました。',
    'ko-KR': '서두르지 않고 도시를 단순한 공략으로 만들지도 않는, 호수와 산·문맥·수변 일상으로 향하는 세 가지 코스.',
  },
  'routes.preview.cta': {
    'zh-CN': '查看三条漫游路线',
    'en-US': 'View All Slow Routes',
    'ja-JP': '三つの周遊ルートを見る',
    'ko-KR': '세 가지 코스 모두 보기',
  },
  'routes.aria': {
    'zh-CN': '杭州漫游路线',
    'en-US': 'Hangzhou slow routes',
    'ja-JP': '杭州周遊ルート',
    'ko-KR': '항저우 산책 코스',
  },
  'routes.heroMeta.left': {
    'zh-CN': '漫游杭州',
    'en-US': 'Slow Routes',
    'ja-JP': '杭州周遊',
    'ko-KR': '항저우 산책',
  },
  'routes.heroMeta.right': {
    'zh-CN': '{count} 条慢游路线',
    'en-US': '{count} slow routes',
    'ja-JP': '{count}本の周遊ルート',
    'ko-KR': '{count}개 코스',
  },
  'routes.audiencePrefix': {
    'zh-CN': '适合：',
    'en-US': 'Suitable for: ',
    'ja-JP': 'おすすめ：',
    'ko-KR': '추천 대상: ',
  },
  'routes.openLinkAria': {
    'zh-CN': '打开{title}',
    'en-US': 'Open {title}',
    'ja-JP': '{title}を開く',
    'ko-KR': '{title} 열기',
  },
  'routes.stopsAria': {
    'zh-CN': '{title}停留点',
    'en-US': '{title} stops',
    'ja-JP': '{title}の立ち寄り',
    'ko-KR': '{title} 정류',
  },
  'routes.viewSpot': {
    'zh-CN': '查看关联景点',
    'en-US': 'View Linked Spot',
    'ja-JP': '関連景点を見る',
    'ko-KR': '연관 명소 보기',
  },
  'routes.bookDirect': {
    'zh-CN': '查看票务',
    'en-US': 'View Tickets',
    'ja-JP': 'チケットを見る',
    'ko-KR': '티켓 보기',
  },
  'routes.gotoArchive': {
    'zh-CN': '查看旅行档案',
    'en-US': 'Open Travel Archive',
    'ja-JP': '旅行アーカイブへ',
    'ko-KR': '여행 아카이브 열기',
  },
  'routes.gotoReservations': {
    'zh-CN': '前往票务导览',
    'en-US': 'Go to Tickets & Visits',
    'ja-JP': 'チケット案内へ',
    'ko-KR': '티켓 안내로',
  },
  'routes.gotoHome': {
    'zh-CN': '回到首页',
    'en-US': 'Back Home',
    'ja-JP': 'ホームへ戻る',
    'ko-KR': '홈으로',
  },
  'routes.pace.label': {
    'zh-CN': '节奏',
    'en-US': 'Pace',
    'ja-JP': 'テンポ',
    'ko-KR': '속도',
  },
  'routes.duration.label': {
    'zh-CN': '时长',
    'en-US': 'Duration',
    'ja-JP': '所要',
    'ko-KR': '소요',
  },

  'visual.eyebrow': {
    'zh-CN': '第七层 / 旅行意象',
    'en-US': 'VII / Travel Impressions',
    'ja-JP': '第七章 / 旅の印象',
    'ko-KR': '제7장 / 여행의 인상',
  },
  'visual.unit': {
    'zh-CN': '组',
    'en-US': 'sets',
    'ja-JP': '組',
    'ko-KR': '세트',
  },
  'visual.titleZh': {
    'zh-CN': '旅行意象',
    'en-US': 'Travel Impressions',
    'ja-JP': '旅の印象',
    'ko-KR': '여행의 인상',
  },
  'visual.titleEn': {
    'zh-CN': 'Travel Impressions',
    'en-US': 'Travel Impressions',
    'ja-JP': 'Travel Impressions',
    'ko-KR': 'Travel Impressions',
  },
  'visual.description': {
    'zh-CN': '把湖山、文脉、茶山、水岸、四季与夜色，收纳成杭州的旅行情绪索引。',
    'en-US': "Lake, heritage, tea hills, canalside, seasons and night—an index of Hangzhou's travel moods.",
    'ja-JP': '湖山・文脈・茶山・水辺・四季・夜——杭州の旅情を一覧にまとめました。',
    'ko-KR': '호수와 산, 문맥, 차 산지, 수변, 사계, 밤—항저우 여행의 감정 색인.',
  },
  'visual.indexAria': {
    'zh-CN': '杭州旅行意象索引',
    'en-US': 'Hangzhou travel impressions index',
    'ja-JP': '杭州の旅情インデックス',
    'ko-KR': '항저우 여행 감정 색인',
  },
  'visual.panelLabel': {
    'zh-CN': '城市印象',
    'en-US': 'City Impression',
    'ja-JP': '街の印象',
    'ko-KR': '도시 인상',
  },
  'visual.sampleAlt': {
    'zh-CN': '{name}意象材质',
    'en-US': '{name} mood texture',
    'ja-JP': '{name}の素材イメージ',
    'ko-KR': '{name} 감성 텍스처',
  },
  'visual.moreLink': {
    'zh-CN': '查看完整旅行档案',
    'en-US': 'Open Full Archive',
    'ja-JP': 'アーカイブの全体を見る',
    'ko-KR': '전체 아카이브 보기',
  },

  'chapter.opening': {
    'zh-CN': '开场',
    'en-US': 'Opening',
    'ja-JP': 'オープニング',
    'ko-KR': '오프닝',
  },
  'chapter.intro': {
    'zh-CN': '总述',
    'en-US': 'Overview',
    'ja-JP': '概要',
    'ko-KR': '개요',
  },
  'chapter.reservations': {
    'zh-CN': '票务',
    'en-US': 'Tickets',
    'ja-JP': 'チケット',
    'ko-KR': '티켓',
  },
  'chapter.seasons': {
    'zh-CN': '四时',
    'en-US': 'Seasons',
    'ja-JP': '四季',
    'ko-KR': '사계',
  },
  'chapter.reveal': {
    'zh-CN': '显影',
    'en-US': 'Reveal',
    'ja-JP': '顕影',
    'ko-KR': '드러남',
  },
  'chapter.places': {
    'zh-CN': '景点',
    'en-US': 'Places',
    'ja-JP': '見どころ',
    'ko-KR': '명소',
  },
  'chapter.routes': {
    'zh-CN': '漫游',
    'en-US': 'Routes',
    'ja-JP': '周遊',
    'ko-KR': '루트',
  },
  'chapter.impressions': {
    'zh-CN': '意象',
    'en-US': 'Impressions',
    'ja-JP': '印象',
    'ko-KR': '인상',
  },
  'chapter.railAria': {
    'zh-CN': '首页章节导航',
    'en-US': 'Home chapter navigation',
    'ja-JP': 'ホームの章ナビ',
    'ko-KR': '홈 챕터 내비게이션',
  },

  'archive.heroMeta.left': {
    'zh-CN': '杭州旅行档案',
    'en-US': 'Hangzhou Travel Archive',
    'ja-JP': '杭州・旅のアーカイブ',
    'ko-KR': '항저우 여행 아카이브',
  },
  'archive.heroMeta.right': {
    'zh-CN': '目的地 · 意象',
    'en-US': 'Destinations · Impressions',
    'ja-JP': '目的地・印象',
    'ko-KR': '목적지 · 인상',
  },
  'archive.title': {
    'zh-CN': '旅行档案',
    'en-US': 'Travel Archive',
    'ja-JP': '旅のアーカイブ',
    'ko-KR': '여행 아카이브',
  },
  'archive.titleEn': {
    'zh-CN': 'Travel Archive',
    'en-US': 'Travel Archive',
    'ja-JP': 'Travel Archive',
    'ko-KR': 'Travel Archive',
  },
  'archive.description': {
    'zh-CN': '把杭州的旅行线索整理成两组档案：值得抵达的目的地，以及构成城市气质的旅行意象。',
    'en-US': 'A two-part archive of Hangzhou: destinations worth visiting, and the impressions that shape the city.',
    'ja-JP': '杭州の旅の手がかりを二つに整理したアーカイブ。訪れるべき目的地と、街の印象。',
    'ko-KR': '항저우 여행을 두 가지로 정리한 아카이브—가볼 만한 목적지와 도시의 인상.',
  },
  'archive.section1.eyebrow': {
    'zh-CN': '一 / 值得抵达',
    'en-US': 'I / Destinations',
    'ja-JP': '一 / 目的地',
    'ko-KR': '一 / 목적지',
  },
  'archive.section1.count': {
    'zh-CN': '{count} 处',
    'en-US': '{count} places',
    'ja-JP': '{count}件',
    'ko-KR': '{count}곳',
  },
  'archive.section1.title': {
    'zh-CN': '目的地索引 · Places to Arrive',
    'en-US': 'Destinations · Places to Arrive',
    'ja-JP': '目的地一覧 · Places to Arrive',
    'ko-KR': '목적지 색인 · Places to Arrive',
  },
  'archive.section2.eyebrow': {
    'zh-CN': '二 / 旅行意象',
    'en-US': 'II / Impressions',
    'ja-JP': '二 / 旅の印象',
    'ko-KR': '二 / 인상',
  },
  'archive.section2.count': {
    'zh-CN': '{count} 组',
    'en-US': '{count} sets',
    'ja-JP': '{count}組',
    'ko-KR': '{count}세트',
  },
  'archive.section2.title': {
    'zh-CN': '城市印象 · Travel Impressions',
    'en-US': 'City Impressions · Travel Impressions',
    'ja-JP': '街の印象 · Travel Impressions',
    'ko-KR': '도시 인상 · Travel Impressions',
  },
  'archive.gotoReservations': {
    'zh-CN': '前往票务导览',
    'en-US': 'Go to Tickets & Visits',
    'ja-JP': 'チケット案内へ',
    'ko-KR': '티켓 안내로',
  },
  'archive.gotoRoutes': {
    'zh-CN': '查看漫游路线',
    'en-US': 'View Slow Routes',
    'ja-JP': '周遊ルートへ',
    'ko-KR': '추천 코스 보기',
  },
  'archive.gotoHome': {
    'zh-CN': '回到首页',
    'en-US': 'Back Home',
    'ja-JP': 'ホームへ戻る',
    'ko-KR': '홈으로',
  },

  'about.heroMeta.left': {
    'zh-CN': '关于 · 杭州文旅',
    'en-US': 'About · Hangzhou Travel',
    'ja-JP': 'About · 杭州観光',
    'ko-KR': 'About · 항저우 관광',
  },
  'about.heroMeta.right': {
    'zh-CN': '站点说明 · 一至五',
    'en-US': 'Site Notes · I–V',
    'ja-JP': 'サイト説明 · 一〜五',
    'ko-KR': '사이트 안내 · 1~5',
  },
  'about.title': {
    'zh-CN': '关于本站',
    'en-US': 'About This Site',
    'ja-JP': '本サイトについて',
    'ko-KR': '사이트 소개',
  },
  'about.titleEn': {
    'zh-CN': 'About Hangzhou Travel',
    'en-US': 'About Hangzhou Travel',
    'ja-JP': 'About Hangzhou Travel',
    'ko-KR': 'About Hangzhou Travel',
  },
  'about.description': {
    'zh-CN': '面向城市旅行者与本地市民的官方导览、开放信息与票务入口。',
    'en-US': 'An official guide, entry-information and ticketing portal for visitors and residents of Hangzhou.',
    'ja-JP': '訪問者と市民のための公式ガイド、入場情報、チケットポータル。',
    'ko-KR': '방문객과 시민을 위한 공식 안내, 입장 정보 및 티켓 포털.',
  },
  'about.lede': {
    'zh-CN':
      '本站是杭州文旅形象传播与开放票务服务的统一入口。我们用更安静的方式呈现湖山、宋韵、良渚、运河与钱塘江——把官方导览、景区导引、开放信息与票务服务收束在同一段访问体验里，方便初次到访的旅人，也照顾反复使用本站的杭州市民。',
    'en-US':
      "This is the unified entry point for Hangzhou's official travel guidance, entry information and ticketing service. We present West Lake, Song heritage, Liangzhu, the Grand Canal and the Qiantang River with a quieter voice, bringing introduction, on-site wayfinding and booking together for first-time travellers and returning residents alike.",
    'ja-JP':
      '本サイトは杭州の観光案内、入場情報、チケットサービスをひとつにまとめた公式入口です。西湖・宋韻・良渚・運河・銭塘江を落ち着いたトーンで紹介し、初めての方にも、何度も訪れる市民の方にも使いやすいよう、案内と手続きをひとつの体験として整えています。',
    'ko-KR':
      '본 사이트는 항저우 관광 안내, 입장 정보, 티켓 서비스를 한곳에 모은 공식 입구입니다. 시후·송풍·량주·대운하·첸탕장을 절제된 어조로 소개하며, 처음 방문하는 여행자와 자주 이용하는 시민 모두에게 안내와 처리를 하나의 흐름으로 제공합니다.',
  },
  'about.chaptersAria': {
    'zh-CN': '站点章节',
    'en-US': 'Site sections',
    'ja-JP': 'サイト構成',
    'ko-KR': '사이트 섹션',
  },
  'about.creditsAria': {
    'zh-CN': '站点信息',
    'en-US': 'Site information',
    'ja-JP': 'サイト情報',
    'ko-KR': '사이트 정보',
  },
  'about.creditsEyebrow': {
    'zh-CN': '六 / 站点档案',
    'en-US': 'VI / Site Card',
    'ja-JP': '六 / サイト概要',
    'ko-KR': '六 / 사이트 개요',
  },
  'about.creditsTitle': {
    'zh-CN': '站点信息',
    'en-US': 'Site Information',
    'ja-JP': 'サイト情報',
    'ko-KR': '사이트 정보',
  },
  'about.action.reservations': {
    'zh-CN': '前往票务导览',
    'en-US': 'Open Tickets & Visits',
    'ja-JP': 'チケット案内へ',
    'ko-KR': '티켓 안내로',
  },
  'about.action.routes': {
    'zh-CN': '查看漫游路线',
    'en-US': 'View Slow Routes',
    'ja-JP': '周遊ルートへ',
    'ko-KR': '추천 코스 보기',
  },
  'about.action.orders': {
    'zh-CN': '查看我的预约',
    'en-US': 'View My Orders',
    'ja-JP': '予約記録を見る',
    'ko-KR': '내 예약 보기',
  },
  'about.action.home': {
    'zh-CN': '回到首页',
    'en-US': 'Back Home',
    'ja-JP': 'ホームへ戻る',
    'ko-KR': '홈으로',
  },

  'scenic.title': {
    'zh-CN': '票务导览',
    'en-US': 'Tickets & Visits',
    'ja-JP': 'チケット・訪問案内',
    'ko-KR': '티켓·방문 안내',
  },
  'scenic.description': {
    'zh-CN': '从湖山到运河，从宋韵到江岸，选择你的杭州抵达方式。',
    'en-US': 'From lakes and hills to the canal and riverfront, choose how you arrive in Hangzhou.',
    'ja-JP': '湖山から運河へ、宋韻から水辺へ。杭州への入り口を選んでください。',
    'ko-KR': '호수와 산에서 운하와 강변까지, 항저우에 닿는 방식을 고르세요.',
  },
  'scenic.heroCount': {
    'zh-CN': '{count} 处景点',
    'en-US': '{count} spots',
    'ja-JP': '{count}件',
    'ko-KR': '{count}곳',
  },
  'scenic.searchPlaceholder': {
    'zh-CN': '输入景点中英文名',
    'en-US': 'Search by Chinese or English name',
    'ja-JP': '中国語・英語の名称で検索',
    'ko-KR': '중·영문 명칭으로 검색',
  },
  'scenic.allOption': {
    'zh-CN': '全部',
    'en-US': 'All',
    'ja-JP': 'すべて',
    'ko-KR': '전체',
  },
  'scenic.option.required': {
    'zh-CN': '购票/分时',
    'en-US': 'Ticket / Timed Entry',
    'ja-JP': 'チケット/時間帯',
    'ko-KR': '티켓/시간대',
  },
  'scenic.option.openVisit': {
    'zh-CN': '开放参观',
    'en-US': 'Open Access',
    'ja-JP': '入場自由',
    'ko-KR': '자유 입장',
  },
  'scenic.option.paid': {
    'zh-CN': '收费',
    'en-US': 'Paid',
    'ja-JP': '有料',
    'ko-KR': '유료',
  },
  'scenic.option.free': {
    'zh-CN': '免费',
    'en-US': 'Free',
    'ja-JP': '無料',
    'ko-KR': '무료',
  },
  'scenic.notice': {
    'zh-CN': '杭州全市 A 级旅游景区已取消统一入园预约要求。请先按区域、分类与开放方式检索，再进入详情确认当日开放时间、票种、安检与现场限流规则。',
    'en-US': 'Hangzhou has cancelled the unified entry-reservation requirement for A-level scenic areas. Filter by area, category and entry mode, then confirm daily hours, tickets, security checks and crowd-control rules.',
    'ja-JP': '杭州では A 級観光地の一律入場予約要件が廃止されています。エリア・分類・入場方式で絞り込み、当日の営業時間、券種、手荷物検査、入場制限をご確認ください。',
    'ko-KR': '항저우는 A급 관광지의 통합 입장 예약 요건을 취소했습니다. 지역, 분류, 입장 방식으로 검색한 뒤 당일 운영 시간, 권종, 보안 검사와 현장 제한 규정을 확인하세요.',
  },
  'scenic.empty': {
    'zh-CN': '没有找到匹配的景点。',
    'en-US': 'No spots match the current filters.',
    'ja-JP': '条件に合う景点が見つかりません。',
    'ko-KR': '조건에 맞는 명소가 없습니다.',
  },
  'scenic.filterAria': {
    'zh-CN': '景点筛选',
    'en-US': 'Spot filters',
    'ja-JP': '景点の絞り込み',
    'ko-KR': '명소 필터',
  },
  'scenic.listAria': {
    'zh-CN': '景点列表',
    'en-US': 'Spot list',
    'ja-JP': '景点一覧',
    'ko-KR': '명소 목록',
  },
  'scenic.noticeAria': {
    'zh-CN': '开放与票务提示',
    'en-US': 'Entry and ticketing notice',
    'ja-JP': '入場・チケット案内',
    'ko-KR': '입장 및 티켓 안내',
  },

  'scenic.card.viewDetailAria': {
    'zh-CN': '查看{name}详情',
    'en-US': 'View details for {name}',
    'ja-JP': '{name}の詳細を見る',
    'ko-KR': '{name} 상세 보기',
  },

  'detail.eyebrow': {
    'zh-CN': 'Scenic Visit',
    'en-US': 'Scenic Visit',
    'ja-JP': 'Scenic Visit',
    'ko-KR': 'Scenic Visit',
  },
  'detail.tagsAria': {
    'zh-CN': '景点标签',
    'en-US': 'Spot tags',
    'ja-JP': '景点タグ',
    'ko-KR': '명소 태그',
  },
  'detail.infoAria': {
    'zh-CN': '景点信息',
    'en-US': 'Spot information',
    'ja-JP': '景点情報',
    'ko-KR': '명소 정보',
  },
  'detail.guidanceAria': {
    'zh-CN': '开放与票务说明',
    'en-US': 'Entry and ticketing guidance',
    'ja-JP': '入場・チケット案内',
    'ko-KR': '입장 및 티켓 안내',
  },
  'detail.field.address': {
    'zh-CN': '地址',
    'en-US': 'Address',
    'ja-JP': '所在地',
    'ko-KR': '주소',
  },
  'detail.field.openingHours': {
    'zh-CN': '开放时间',
    'en-US': 'Opening Hours',
    'ja-JP': '営業時間',
    'ko-KR': '운영 시간',
  },
  'detail.field.reservation': {
    'zh-CN': '开放方式',
    'en-US': 'Entry Mode',
    'ja-JP': '入場方式',
    'ko-KR': '입장 방식',
  },
  'detail.field.ticketing': {
    'zh-CN': '票务说明',
    'en-US': 'Ticketing Notes',
    'ja-JP': 'チケット案内',
    'ko-KR': '티켓 안내',
  },
  'detail.reservationRequired': {
    'zh-CN': '涉及购票、演出、船班或场馆容量管理，建议提前确认票务与到访时段。',
    'en-US': 'Ticketing, performances, boats or venue capacity may apply; confirm tickets and visit time in advance.',
    'ja-JP': 'チケット、公演、船便、施設容量管理がある場合があります。事前にチケットと訪問時間をご確認ください。',
    'ko-KR': '티켓, 공연, 선박, 시설 수용 인원 관리가 적용될 수 있으니 사전에 티켓과 방문 시간을 확인하세요.',
  },
  'detail.reservationOpen': {
    'zh-CN': '通常开放参观；节假日、活动、安检与安全限流以官方或现场公告为准。',
    'en-US': 'Usually open access; holidays, events, security checks and safety crowd control follow official or on-site notices.',
    'ja-JP': '通常は自由に見学できます。祝休日・催事・手荷物検査・安全上の入場制限は公式または現地告知に準じます。',
    'ko-KR': '일반적으로 자유 관람입니다. 공휴일, 행사, 보안 검사, 안전상 인원 제한은 공식 또는 현장 공지를 따릅니다.',
  },
  'detail.ticketPaid': {
    'zh-CN': '含票种、场次或时段信息，请以官方票务渠道的实时价格、余量与退改规则为准。',
    'en-US': 'Ticket types, show times or slots may apply; real-time price, availability and refund rules follow the official ticketing channel.',
    'ja-JP': '券種、公演回、時間帯があります。価格・残数・変更払戻規則は公式チケット窓口に準じます。',
    'ko-KR': '권종, 공연 회차, 시간대가 적용될 수 있습니다. 실시간 가격, 잔여, 환불 규정은 공식 티켓 채널을 따릅니다.',
  },
  'detail.ticketFree': {
    'zh-CN': '以免费开放或免费登记为主，安检、客流组织与特殊活动以现场规则为准。',
    'en-US': 'Mostly free entry or free registration; security checks, crowd flow and special events follow on-site rules.',
    'ja-JP': '原則無料入場または無料登録。手荷物検査、混雑管理、特別催事は現地規則に準じます。',
    'ko-KR': '대부분 무료 입장 또는 무료 등록이며, 보안 검사, 동선 관리, 특별 행사는 현장 규정을 따릅니다.',
  },
  'detail.guidance': {
    'zh-CN': '访前建议：先确认当日开放、最后入园、票务渠道、安检规则与交通管制，再根据人数办理购票或到访登记。',
    'en-US': 'Before visiting, confirm daily opening, last entry, ticketing channel, security rules and traffic controls, then book tickets or register the visit as needed.',
    'ja-JP': '訪問前に当日の開放、最終入場、チケット窓口、手荷物検査、交通規制を確認し、人数に応じて購入または登録してください。',
    'ko-KR': '방문 전 당일 개방, 마지막 입장, 티켓 채널, 보안 규정, 교통 통제를 확인한 뒤 인원에 맞게 구매 또는 방문 등록을 진행하세요.',
  },
  'detail.gotoGuide': {
    'zh-CN': '查看完整访前须知',
    'en-US': 'Read full Visit Guide',
    'ja-JP': '訪問ガイド全文へ',
    'ko-KR': '전체 방문 안내 보기',
  },
  'detail.rules.eyebrow': {
    'zh-CN': '三 / 官方规则',
    'en-US': 'III / Official Rules',
    'ja-JP': '三 / 公式規則',
    'ko-KR': '三 / 공식 규정',
  },
  'detail.rules.title': {
    'zh-CN': '票务规则',
    'en-US': 'Ticketing Rules',
    'ja-JP': 'チケット規則',
    'ko-KR': '티켓 규정',
  },
  'detail.section.tickets.label': {
    'zh-CN': '四 / 票种',
    'en-US': 'IV / Tickets',
    'ja-JP': '四 / 券種',
    'ko-KR': '四 / 권종',
  },
  'detail.section.slots.label': {
    'zh-CN': '五 / 时间段',
    'en-US': 'V / Time Slots',
    'ja-JP': '五 / 時間帯',
    'ko-KR': '五 / 시간대',
  },
  'detail.section.tickets.title': {
    'zh-CN': '票种',
    'en-US': 'Ticket Types',
    'ja-JP': '券種',
    'ko-KR': '권종',
  },
  'detail.section.slots.title': {
    'zh-CN': '可办理时段',
    'en-US': 'Available Visit Slots',
    'ja-JP': '利用可能時間',
    'ko-KR': '가능 시간대',
  },
  'detail.ticketsEmpty': {
    'zh-CN': '当前景点仅展示开放信息入口，暂无票种。',
    'en-US': 'Only the entry-information flow is shown; no ticket types yet.',
    'ja-JP': '現在は入場情報のみ。券種は未設定です。',
    'ko-KR': '현재 입장 정보만 표시되며 권종은 아직 없습니다.',
  },
  'detail.slotsEmpty': {
    'zh-CN': '当前暂无可办理的未来时段，请返回票务导览选择其他景点或稍后再试。',
    'en-US': 'No upcoming visit slots are available. Choose another spot or check back later.',
    'ja-JP': '現在利用可能な今後の時間帯はありません。別の景点を選ぶか、後ほどご確認ください。',
    'ko-KR': '현재 이용 가능한 향후 시간대가 없습니다. 다른 명소를 선택하거나 나중에 다시 확인하세요.',
  },
  'detail.slotRemaining': {
    'zh-CN': '剩余 {remaining} / {capacity}',
    'en-US': '{remaining} / {capacity} left',
    'ja-JP': '残 {remaining} / {capacity}',
    'ko-KR': '잔여 {remaining} / {capacity}',
  },
  'detail.empty': {
    'zh-CN': '没有找到这处景点。',
    'en-US': 'This spot could not be found.',
    'ja-JP': 'この景点は見つかりませんでした。',
    'ko-KR': '해당 명소를 찾을 수 없습니다.',
  },
  'detail.dataLoadError': {
    'zh-CN': '景点数据加载失败',
    'en-US': 'Failed to load spot data',
    'ja-JP': '景点データの読み込みに失敗しました',
    'ko-KR': '명소 데이터를 불러오지 못했습니다',
  },

  'common.search': {
    'zh-CN': '搜索',
    'en-US': 'Search',
    'ja-JP': '検索',
    'ko-KR': '검색',
  },
  'common.category': {
    'zh-CN': '分类',
    'en-US': 'Category',
    'ja-JP': '分類',
    'ko-KR': '분류',
  },
  'common.area': {
    'zh-CN': '区域',
    'en-US': 'Area',
    'ja-JP': 'エリア',
    'ko-KR': '지역',
  },
  'common.reservation': {
    'zh-CN': '开放方式',
    'en-US': 'Entry Mode',
    'ja-JP': '入場方式',
    'ko-KR': '입장 방식',
  },
  'common.ticketing': {
    'zh-CN': '票务',
    'en-US': 'Ticketing',
    'ja-JP': 'チケット',
    'ko-KR': '티켓',
  },
  'common.clearFilters': {
    'zh-CN': '清空筛选',
    'en-US': 'Clear Filters',
    'ja-JP': '条件をリセット',
    'ko-KR': '필터 초기화',
  },
  'common.backToReservations': {
    'zh-CN': '返回票务导览',
    'en-US': 'Back to Tickets & Visits',
    'ja-JP': 'チケット案内へ戻る',
    'ko-KR': '티켓 안내로 돌아가기',
  },
  'common.back': {
    'zh-CN': '返回上一页',
    'en-US': 'Back',
    'ja-JP': '戻る',
    'ko-KR': '뒤로',
  },
  'common.startReservation': {
    'zh-CN': '开始办理',
    'en-US': 'Start Booking',
    'ja-JP': '手続きを始める',
    'ko-KR': '처리 시작',
  },
  'common.ticketTypes': {
    'zh-CN': '票种',
    'en-US': 'Ticket Types',
    'ja-JP': '券種',
    'ko-KR': '권종',
  },
  'common.availableSlots': {
    'zh-CN': '可办理时段',
    'en-US': 'Available Visit Slots',
    'ja-JP': '利用可能時間',
    'ko-KR': '가능 시간대',
  },
  'common.persons': {
    'zh-CN': '{count} 人',
    'en-US': '{count} pax',
    'ja-JP': '{count}名',
    'ko-KR': '{count}인',
  },
  'common.viewSpotDetail': {
    'zh-CN': '景点详情',
    'en-US': 'Spot Detail',
    'ja-JP': '景点詳細',
    'ko-KR': '명소 상세',
  },
  'common.skipToContent': {
    'zh-CN': '跳到正文',
    'en-US': 'Skip to content',
    'ja-JP': '本文へ移動',
    'ko-KR': '본문으로 건너뛰기',
  },

  'guide.title': {
    'zh-CN': '访前须知',
    'en-US': 'Visit Guide',
    'ja-JP': '訪問ガイド',
    'ko-KR': '방문 안내',
  },
  'guide.meta': {
    'zh-CN': '开放、票务、到达与服务说明',
    'en-US': 'Planning, Arrival and Service Notes',
    'ja-JP': '開放・チケット・来場・サービス案内',
    'ko-KR': '개방, 티켓, 도착 및 서비스 안내',
  },
  'guide.description': {
    'zh-CN': '把开放时间、票务规则、分时服务、支付方式、到达建议、安检、无障碍与常见问题集中整理，为第一次来杭州的人，也为反复使用本站的市民游客。',
    'en-US': 'A single place for opening hours, ticketing rules, timed-entry services, payment methods, arrival tips, security checks, accessibility and common questions.',
    'ja-JP': '営業時間、チケット規則、時間帯サービス、支払方法、アクセス、手荷物検査、バリアフリー、よくある質問をひとつにまとめました。',
    'ko-KR': '운영 시간, 티켓 규정, 시간대 서비스, 결제 수단, 이동 안내, 보안 검사, 접근성, 자주 묻는 질문을 한곳에 정리했습니다.',
  },
  'guide.eyebrow': {
    'zh-CN': 'Visit Guide',
    'en-US': 'Visit Guide',
    'ja-JP': 'Visit Guide',
    'ko-KR': 'Visit Guide',
  },
  'guide.section.essentials': {
    'zh-CN': '访前要点',
    'en-US': 'Essentials',
    'ja-JP': '訪問の要点',
    'ko-KR': '핵심 안내',
  },
  'guide.section.flow': {
    'zh-CN': '票务与出行流程',
    'en-US': 'Ticketing Flow',
    'ja-JP': 'チケットと訪問の流れ',
    'ko-KR': '티켓 및 방문 흐름',
  },
  'guide.section.policy': {
    'zh-CN': '入园与票务须知',
    'en-US': 'Entry & Ticketing Policy',
    'ja-JP': '入場・チケット案内',
    'ko-KR': '입장 및 티켓 정책',
  },
  'guide.section.ticketRules': {
    'zh-CN': '官方票务规则',
    'en-US': 'Official Ticketing Rules',
    'ja-JP': '公式チケット規則',
    'ko-KR': '공식 티켓 규정',
  },
  'guide.section.transport': {
    'zh-CN': '交通到达',
    'en-US': 'Getting to Hangzhou',
    'ja-JP': '交通アクセス',
    'ko-KR': '교통 안내',
  },
  'guide.section.emergency': {
    'zh-CN': '应急联络',
    'en-US': 'Emergency Contacts',
    'ja-JP': '緊急連絡先',
    'ko-KR': '긴급 연락처',
  },
  'guide.section.support': {
    'zh-CN': '服务支持',
    'en-US': 'Service Support',
    'ja-JP': 'サービスサポート',
    'ko-KR': '서비스 지원',
  },
  'guide.section.faq': {
    'zh-CN': '常见问题',
    'en-US': 'FAQ',
    'ja-JP': 'よくある質問',
    'ko-KR': '자주 묻는 질문',
  },

  'booking.title': {
    'zh-CN': '票务办理',
    'en-US': 'Ticketing Form',
    'ja-JP': 'チケット手続き',
    'ko-KR': '티켓 처리',
  },
  'booking.changeSpot': {
    'zh-CN': '更换景点',
    'en-US': 'Change Spot',
    'ja-JP': '景点を変更',
    'ko-KR': '명소 변경',
  },
  'booking.step1': {
    'zh-CN': '01 选择票种与时间',
    'en-US': '01 Ticket and Time',
    'ja-JP': '01 券種と時間',
    'ko-KR': '01 권종과 시간',
  },
  'booking.step2': {
    'zh-CN': '02 填写游客信息',
    'en-US': '02 Visitor Details',
    'ja-JP': '02 来訪者情報',
    'ko-KR': '02 방문자 정보',
  },
  'booking.step3': {
    'zh-CN': '03 确认办理',
    'en-US': '03 Confirmation',
    'ja-JP': '03 確認',
    'ko-KR': '03 확인',
  },
  'booking.spot': {
    'zh-CN': '办理景点',
    'en-US': 'Scenic Spot',
    'ja-JP': '対象スポット',
    'ko-KR': '대상 명소',
  },
  'booking.next': {
    'zh-CN': '下一步',
    'en-US': 'Next',
    'ja-JP': '次へ',
    'ko-KR': '다음',
  },
  'booking.previous': {
    'zh-CN': '上一步',
    'en-US': 'Previous',
    'ja-JP': '戻る',
    'ko-KR': '이전',
  },
  'booking.visitorName': {
    'zh-CN': '姓名',
    'en-US': 'Name',
    'ja-JP': '氏名',
    'ko-KR': '이름',
  },
  'booking.phone': {
    'zh-CN': '手机号',
    'en-US': 'Phone',
    'ja-JP': '電話番号',
    'ko-KR': '전화번호',
  },
  'booking.idNumber': {
    'zh-CN': '证件号',
    'en-US': 'ID Number',
    'ja-JP': '身分証番号',
    'ko-KR': '신분증 번호',
  },
  'booking.visitors': {
    'zh-CN': '人数',
    'en-US': 'Visitors',
    'ja-JP': '人数',
    'ko-KR': '인원',
  },
  'booking.paymentMethod': {
    'zh-CN': '支付方式',
    'en-US': 'Payment Method',
    'ja-JP': '支払方法',
    'ko-KR': '결제 수단',
  },
  'booking.summary': {
    'zh-CN': '办理摘要',
    'en-US': 'Booking Summary',
    'ja-JP': '手続き概要',
    'ko-KR': '처리 요약',
  },
  'booking.confirm': {
    'zh-CN': '确认办理',
    'en-US': 'Confirm',
    'ja-JP': '確定',
    'ko-KR': '확정',
  },
  'booking.submitting': {
    'zh-CN': '提交中',
    'en-US': 'Submitting',
    'ja-JP': '送信中',
    'ko-KR': '제출 중',
  },
  'booking.success': {
    'zh-CN': '办理成功',
    'en-US': 'Booking Confirmed',
    'ja-JP': '手続き完了',
    'ko-KR': '처리 완료',
  },
  'booking.viewOrders': {
    'zh-CN': '查看我的预约',
    'en-US': 'View My Orders',
    'ja-JP': '予約記録を見る',
    'ko-KR': '내 예약 보기',
  },
  'booking.continue': {
    'zh-CN': '继续办理',
    'en-US': 'Book Another',
    'ja-JP': '続けて手続き',
    'ko-KR': '계속 진행',
  },
  'booking.payment.free': {
    'zh-CN': '免费入园登记',
    'en-US': 'Free Entry Registration',
    'ja-JP': '無料入場登録',
    'ko-KR': '무료 입장 등록',
  },
  'booking.payment.alipay': {
    'zh-CN': '支付宝',
    'en-US': 'Alipay',
    'ja-JP': 'Alipay',
    'ko-KR': 'Alipay',
  },
  'booking.payment.wechat': {
    'zh-CN': '微信支付',
    'en-US': 'WeChat Pay',
    'ja-JP': 'WeChat Pay',
    'ko-KR': 'WeChat Pay',
  },
  'booking.payment.unionpay': {
    'zh-CN': '银联云闪付',
    'en-US': 'UnionPay',
    'ja-JP': 'UnionPay',
    'ko-KR': 'UnionPay',
  },
  'booking.eyebrow': {
    'zh-CN': 'Scenic Booking',
    'en-US': 'Scenic Booking',
    'ja-JP': 'Scenic Booking',
    'ko-KR': 'Scenic Booking',
  },
  'booking.metaRight': {
    'zh-CN': 'Ticketing Service',
    'en-US': 'Ticketing Service',
    'ja-JP': 'Ticketing Service',
    'ko-KR': 'Ticketing Service',
  },
  'booking.heroDescription': {
    'zh-CN': '当前选择：{name}。请先确认开放公告、票种、日期与时段，再填写游客信息并完成办理。',
    'en-US': 'Current selection: {name}. Confirm opening notice, ticket type, date and time slot, then fill in visitor details.',
    'ja-JP': '現在の選択：{name}。開放告知、券種、日付、時間帯を確認のうえ、来訪者情報をご入力ください。',
    'ko-KR': '현재 선택: {name}. 개방 공지, 권종, 날짜, 시간대를 확인한 뒤 방문자 정보를 입력하세요.',
  },
  'booking.heroUnselected': {
    'zh-CN': '请先选择需要办理的景点，再确认票种、日期与时段。这样进入下一步时，信息会更清楚也更不容易选错。',
    'en-US': 'Choose the scenic spot first, then confirm the ticket type, date and time slot so the rest of the booking flow stays clear.',
    'ja-JP': 'まず手続きを行う景点を選択し、その後に券種・日付・時間帯をご確認ください。次の手順でも内容が分かりやすくなります。',
    'ko-KR': '먼저 처리할 명소를 선택한 뒤 권종, 날짜, 시간대를 확인해 주세요. 그래야 다음 단계에서도 정보가 더 분명합니다.',
  },
  'booking.heroLoading': {
    'zh-CN': '加载中',
    'en-US': 'Loading',
    'ja-JP': '読み込み中',
    'ko-KR': '불러오는 중',
  },
  'booking.notesAria': {
    'zh-CN': '票务须知',
    'en-US': 'Ticketing policy',
    'ja-JP': 'チケット案内',
    'ko-KR': '티켓 정책',
  },
  'booking.rules.eyebrow': {
    'zh-CN': 'Official Ticketing Rules',
    'en-US': 'Official Ticketing Rules',
    'ja-JP': 'Official Ticketing Rules',
    'ko-KR': 'Official Ticketing Rules',
  },
  'booking.rules.title': {
    'zh-CN': '办理前请确认这些规则',
    'en-US': 'Confirm These Rules Before Booking',
    'ja-JP': '手続き前に確認する規則',
    'ko-KR': '처리 전 확인할 규정',
  },
  'booking.rules.description': {
    'zh-CN': '以下规则覆盖放票、退改、优惠、实名、核验、迟到、限流与售罄替代建议。具体执行以对应景点和项目的官方公告为准。',
    'en-US': 'These rules cover ticket release, refunds, concessions, real-name booking, entry checks, late arrival, capacity control and sold-out alternatives. Final handling follows each venue notice.',
    'ja-JP': '販売開始、変更払戻、優待、実名、入場確認、遅刻、定員管理、完売時の代替案をまとめています。具体運用は各施設・商品の公式告知に準じます。',
    'ko-KR': '판매 시작, 환불, 우대, 실명, 입장 확인, 지각, 인원 제한, 매진 대안을 포함합니다. 구체적인 처리는 각 명소와 상품의 공식 공지를 따릅니다.',
  },
  'booking.flowAria': {
    'zh-CN': '办理步骤',
    'en-US': 'Booking steps',
    'ja-JP': '手続きステップ',
    'ko-KR': '처리 단계',
  },
  'booking.section.spot': {
    'zh-CN': '零 / 景点',
    'en-US': '0 / Spot',
    'ja-JP': '〇 / 景点',
    'ko-KR': '〇 / 명소',
  },
  'booking.section.spotTitle': {
    'zh-CN': 'Scenic Spot',
    'en-US': 'Scenic Spot',
    'ja-JP': 'Scenic Spot',
    'ko-KR': 'Scenic Spot',
  },
  'booking.placeholder.spot': {
    'zh-CN': '请选择景点',
    'en-US': 'Choose a scenic spot',
    'ja-JP': '景点を選択してください',
    'ko-KR': '명소를 선택해 주세요',
  },
  'booking.section.ticket': {
    'zh-CN': '一 / 票种',
    'en-US': 'I / Ticket',
    'ja-JP': '一 / 券種',
    'ko-KR': '一 / 권종',
  },
  'booking.section.ticketTitle': {
    'zh-CN': 'Ticket Type',
    'en-US': 'Ticket Type',
    'ja-JP': 'Ticket Type',
    'ko-KR': 'Ticket Type',
  },
  'booking.section.slot': {
    'zh-CN': '二 / 日期时间',
    'en-US': 'II / Date & Time',
    'ja-JP': '二 / 日付と時間',
    'ko-KR': '二 / 날짜와 시간',
  },
  'booking.section.slotTitle': {
    'zh-CN': 'Visit Slot',
    'en-US': 'Visit Slot',
    'ja-JP': 'Visit Slot',
    'ko-KR': 'Visit Slot',
  },
  'booking.section.visitor': {
    'zh-CN': '三 / 游客信息',
    'en-US': 'III / Visitor',
    'ja-JP': '三 / 来訪者情報',
    'ko-KR': '三 / 방문자',
  },
  'booking.section.visitorTitle': {
    'zh-CN': 'Visitor Information',
    'en-US': 'Visitor Information',
    'ja-JP': 'Visitor Information',
    'ko-KR': 'Visitor Information',
  },
  'booking.section.payment': {
    'zh-CN': '四 / 支付方式',
    'en-US': 'IV / Payment',
    'ja-JP': '四 / 支払方法',
    'ko-KR': '四 / 결제',
  },
  'booking.placeholder.name': {
    'zh-CN': '请输入姓名',
    'en-US': 'Enter your name',
    'ja-JP': '氏名を入力',
    'ko-KR': '이름을 입력',
  },
  'booking.placeholder.phone': {
    'zh-CN': '请输入手机号',
    'en-US': 'Enter your phone number',
    'ja-JP': '電話番号を入力',
    'ko-KR': '전화번호를 입력',
  },
  'booking.placeholder.id': {
    'zh-CN': '请输入证件号后四位或测试号',
    'en-US': 'Enter the last 4 digits of your ID, or a test number',
    'ja-JP': '身分証末尾4桁またはテスト番号',
    'ko-KR': '신분증 끝 4자리 또는 테스트 번호',
  },
  'booking.visitorHint': {
    'zh-CN': '请确保姓名、联系方式与证件信息填写准确；优惠票、免票或实名核验以各景点官方规则为准。',
    'en-US': 'Make sure name, contact and ID details are accurate; concession, free-entry and real-name checks follow each venue’s official rules.',
    'ja-JP': '氏名・連絡先・身分情報を正確にご入力ください。優待・無料入場・実名確認は各施設の公式規則に準じます。',
    'ko-KR': '이름, 연락처, 신분 정보를 정확히 입력하세요. 우대, 무료 입장, 실명 확인은 각 명소 공식 규정을 따릅니다.',
  },
  'booking.selectSpotHint': {
    'zh-CN': '先选择景点后，这里会加载对应的票种。',
    'en-US': 'Choose a scenic spot first to load its ticket types.',
    'ja-JP': '先に景点を選ぶと、ここに対応する券種が表示されます。',
    'ko-KR': '먼저 명소를 선택하면 여기에 해당 권종이 표시됩니다.',
  },
  'booking.selectSlotHint': {
    'zh-CN': '先选择景点后，这里会显示可预约的日期与时间段。',
    'en-US': 'Choose a scenic spot first to see available dates and time slots.',
    'ja-JP': '先に景点を選ぶと、利用可能な日付と時間帯が表示されます。',
    'ko-KR': '먼저 명소를 선택하면 이용 가능한 날짜와 시간대가 표시됩니다.',
  },
  'booking.payment.freeNote': {
    'zh-CN': '确认后生成到访登记凭证',
    'en-US': 'Visit registration pass is generated upon confirmation',
    'ja-JP': '確認後に訪問登録証明を発行',
    'ko-KR': '확인 후 방문 등록 바우처가 발급됩니다',
  },
  'booking.payment.paidNote': {
    'zh-CN': '按官方票务规则完成支付并生成办理记录',
    'en-US': 'Complete payment under official ticketing rules to generate the booking record',
    'ja-JP': '公式チケット規則に従って決済し、手続き記録を発行します',
    'ko-KR': '공식 티켓 규정에 따라 결제하고 처리 기록을 생성합니다',
  },
  'booking.summary.spot': {
    'zh-CN': '景点',
    'en-US': 'Spot',
    'ja-JP': '景点',
    'ko-KR': '명소',
  },
  'booking.summary.ticket': {
    'zh-CN': '票种',
    'en-US': 'Ticket',
    'ja-JP': '券種',
    'ko-KR': '권종',
  },
  'booking.summary.time': {
    'zh-CN': '时间',
    'en-US': 'Time',
    'ja-JP': '時間',
    'ko-KR': '시간',
  },
  'booking.summary.cost': {
    'zh-CN': '费用',
    'en-US': 'Cost',
    'ja-JP': '料金',
    'ko-KR': '비용',
  },
  'booking.summary.remaining': {
    'zh-CN': '余量',
    'en-US': 'Remaining',
    'ja-JP': '残数',
    'ko-KR': '잔여',
  },
  'booking.summary.notSelected': {
    'zh-CN': '未选择',
    'en-US': 'Not selected',
    'ja-JP': '未選択',
    'ko-KR': '미선택',
  },
  'booking.summary.toBeSelected': {
    'zh-CN': '待选择',
    'en-US': 'To select',
    'ja-JP': '選択待ち',
    'ko-KR': '선택 대기',
  },
  'booking.success.title': {
    'zh-CN': '办理成功',
    'en-US': 'Booking Confirmed',
    'ja-JP': '手続き完了',
    'ko-KR': '처리 완료',
  },
  'booking.success.eyebrow': {
    'zh-CN': 'Booking Confirmed',
    'en-US': 'Booking Confirmed',
    'ja-JP': 'Booking Confirmed',
    'ko-KR': 'Booking Confirmed',
  },
  'booking.success.orderId': {
    'zh-CN': '办理编号',
    'en-US': 'Booking ID',
    'ja-JP': '手続き番号',
    'ko-KR': '처리 번호',
  },
  'booking.success.spot': {
    'zh-CN': '景点',
    'en-US': 'Spot',
    'ja-JP': '景点',
    'ko-KR': '명소',
  },
  'booking.success.date': {
    'zh-CN': '日期',
    'en-US': 'Date',
    'ja-JP': '日付',
    'ko-KR': '날짜',
  },
  'booking.success.timeRange': {
    'zh-CN': '时间段',
    'en-US': 'Time Slot',
    'ja-JP': '時間帯',
    'ko-KR': '시간대',
  },
  'booking.success.visitorCount': {
    'zh-CN': '游客人数',
    'en-US': 'Visitors',
    'ja-JP': '人数',
    'ko-KR': '인원',
  },
  'booking.success.payResult': {
    'zh-CN': '支付结果',
    'en-US': 'Payment',
    'ja-JP': '支払結果',
    'ko-KR': '결제 결과',
  },
  'booking.success.payDone': {
    'zh-CN': '支付完成 · ¥{amount}',
    'en-US': 'Paid · ¥{amount}',
    'ja-JP': '支払完了 · ¥{amount}',
    'ko-KR': '결제 완료 · ¥{amount}',
  },
  'booking.success.voucher': {
    'zh-CN': '核销码占位',
    'en-US': 'Voucher Code',
    'ja-JP': '入場コード',
    'ko-KR': '검증 코드',
  },
  'booking.slotShortage': {
    'zh-CN': '当前时间段余量不足，请减少人数或返回上一步更换时间。',
    'en-US': 'Not enough capacity for this slot. Reduce the number of visitors or go back to choose another slot.',
    'ja-JP': 'この時間帯は残数が不足しています。人数を減らすか、別の時間帯をお選びください。',
    'ko-KR': '이 시간대 잔여가 부족합니다. 인원을 줄이거나 다른 시간대를 선택해 주세요.',
  },
  'booking.slotsEmpty': {
    'zh-CN': '当前景点暂无可办理的未来时段，请更换景点或稍后再试。',
    'en-US': 'No upcoming slots are available for this spot. Choose another spot or check back later.',
    'ja-JP': 'この景点には現在利用可能な今後の時間帯がありません。別の景点を選ぶか、後ほどご確認ください。',
    'ko-KR': '현재 이 명소에는 이용 가능한 향후 시간대가 없습니다. 다른 명소를 선택하거나 나중에 다시 확인하세요.',
  },
  'booking.dataError': {
    'zh-CN': '预约数据加载失败',
    'en-US': 'Failed to load reservation data',
    'ja-JP': '予約データの読み込みに失敗しました',
    'ko-KR': '예약 데이터를 불러오지 못했습니다',
  },
  'booking.submitError': {
    'zh-CN': '预约提交失败',
    'en-US': 'Failed to submit reservation',
    'ja-JP': '予約の送信に失敗しました',
    'ko-KR': '예약 제출에 실패했습니다',
  },
  'booking.slot.remaining': {
    'zh-CN': '余量 {count}',
    'en-US': '{count} left',
    'ja-JP': '残 {count}',
    'ko-KR': '잔여 {count}',
  },
  'booking.slot.full': {
    'zh-CN': '已约满',
    'en-US': 'Sold out',
    'ja-JP': '満員',
    'ko-KR': '마감',
  },

  'orders.title': {
    'zh-CN': '我的预约',
    'en-US': 'My Reservations',
    'ja-JP': '予約記録',
    'ko-KR': '예약 내역',
  },
  'orders.eyebrow': {
    'zh-CN': 'Reservation Records',
    'en-US': 'Reservation Records',
    'ja-JP': 'Reservation Records',
    'ko-KR': 'Reservation Records',
  },
  'orders.heroDescription': {
    'zh-CN': '集中展示出行前后的预约记录、支付信息与核销凭证。若行程变化，可在出行前取消当前预约。',
    'en-US': 'See your upcoming and past reservations, payment details and vouchers. Cancel any upcoming reservation before the visit if plans change.',
    'ja-JP': '予約・決済・入場コードをまとめて確認できます。ご予定の変更時は事前にキャンセルが可能です。',
    'ko-KR': '예정·완료된 예약과 결제, 검증 바우처를 모아 보여 드립니다. 일정이 바뀌면 사전에 취소할 수 있습니다.',
  },
  'orders.metaCount': {
    'zh-CN': '{count} 条预约记录',
    'en-US': '{count} reservation records',
    'ja-JP': '{count}件の予約記録',
    'ko-KR': '{count}건의 예약 기록',
  },
  'orders.filter.all': {
    'zh-CN': '全部',
    'en-US': 'All',
    'ja-JP': 'すべて',
    'ko-KR': '전체',
  },
  'orders.filter.pending': {
    'zh-CN': '待出行',
    'en-US': 'Upcoming',
    'ja-JP': '利用前',
    'ko-KR': '이용 전',
  },
  'orders.filter.done': {
    'zh-CN': '已完成',
    'en-US': 'Completed',
    'ja-JP': '完了',
    'ko-KR': '완료',
  },
  'orders.filter.canceled': {
    'zh-CN': '已取消',
    'en-US': 'Canceled',
    'ja-JP': '取消済み',
    'ko-KR': '취소됨',
  },
  'orders.bookAgain': {
    'zh-CN': '再次预约',
    'en-US': 'Book Again',
    'ja-JP': '再予約',
    'ko-KR': '다시 예약',
  },
  'orders.cancel': {
    'zh-CN': '取消预约',
    'en-US': 'Cancel',
    'ja-JP': '予約取消',
    'ko-KR': '예약 취소',
  },
  'orders.cancelConfirmMessage': {
    'zh-CN': '确定要取消这条预约吗？取消后如需出行，需要重新办理。',
    'en-US': 'Cancel this booking? You will need to book again if you still plan to visit.',
    'ja-JP': 'この予約を取り消しますか？訪問する場合は再度手続きが必要です。',
    'ko-KR': '이 예약을 취소할까요? 방문하려면 다시 진행해야 합니다.',
  },
  'orders.confirmCancel': {
    'zh-CN': '确认取消',
    'en-US': 'Confirm Cancel',
    'ja-JP': '取消確認',
    'ko-KR': '취소 확인',
  },
  'orders.empty': {
    'zh-CN': '当前状态下暂无预约记录。',
    'en-US': 'No reservations in this view.',
    'ja-JP': 'この条件では予約記録がありません。',
    'ko-KR': '현재 조건에 맞는 예약이 없습니다.',
  },
  'orders.voucher': {
    'zh-CN': '核销凭证',
    'en-US': 'Verification Pass',
    'ja-JP': '入場コード',
    'ko-KR': '검증 바우처',
  },
  'orders.payment': {
    'zh-CN': '支付',
    'en-US': 'Payment',
    'ja-JP': '支払',
    'ko-KR': '결제',
  },
  'orders.field.visitor': {
    'zh-CN': '游客',
    'en-US': 'Visitor',
    'ja-JP': '来訪者',
    'ko-KR': '방문자',
  },
  'orders.field.ticket': {
    'zh-CN': '票种',
    'en-US': 'Ticket',
    'ja-JP': '券種',
    'ko-KR': '권종',
  },
  'orders.field.status': {
    'zh-CN': '状态',
    'en-US': 'Status',
    'ja-JP': '状態',
    'ko-KR': '상태',
  },
  'orders.field.voucher': {
    'zh-CN': '核销码',
    'en-US': 'Voucher',
    'ja-JP': '入場コード',
    'ko-KR': '검증 코드',
  },
  'orders.field.created': {
    'zh-CN': '创建',
    'en-US': 'Created',
    'ja-JP': '作成日',
    'ko-KR': '생성일',
  },
  'orders.status.pending': {
    'zh-CN': '待出行',
    'en-US': 'Upcoming',
    'ja-JP': '利用前',
    'ko-KR': '이용 전',
  },
  'orders.status.done': {
    'zh-CN': '已完成',
    'en-US': 'Completed',
    'ja-JP': '完了',
    'ko-KR': '완료',
  },
  'orders.status.canceled': {
    'zh-CN': '已取消',
    'en-US': 'Canceled',
    'ja-JP': '取消済み',
    'ko-KR': '취소됨',
  },
  'orders.payStatus.paid': {
    'zh-CN': '已支付',
    'en-US': 'Paid',
    'ja-JP': '支払済み',
    'ko-KR': '결제 완료',
  },
  'orders.payStatus.pending': {
    'zh-CN': '待支付',
    'en-US': 'Pending',
    'ja-JP': '未払い',
    'ko-KR': '결제 대기',
  },
  'orders.payStatus.refunded': {
    'zh-CN': '已退款',
    'en-US': 'Refunded',
    'ja-JP': '返金済み',
    'ko-KR': '환불됨',
  },
  'orders.payStatus.free': {
    'zh-CN': '免费入园登记',
    'en-US': 'Free',
    'ja-JP': '無料入場登録',
    'ko-KR': '무료 입장 등록',
  },
  'orders.loadError': {
    'zh-CN': '订单记录加载失败',
    'en-US': 'Failed to load order records',
    'ja-JP': '注文記録の読み込みに失敗しました',
    'ko-KR': '주문 기록을 불러오지 못했습니다',
  },
  'orders.cancelError': {
    'zh-CN': '取消记录失败',
    'en-US': 'Failed to cancel the record',
    'ja-JP': '記録の取消に失敗しました',
    'ko-KR': '기록을 취소하지 못했습니다',
  },
  'orders.filterAria': {
    'zh-CN': '订单状态筛选',
    'en-US': 'Status filter',
    'ja-JP': '状態の絞り込み',
    'ko-KR': '상태 필터',
  },
  'orders.listAria': {
    'zh-CN': '订单记录',
    'en-US': 'Order list',
    'ja-JP': '注文一覧',
    'ko-KR': '주문 목록',
  },

  'notfound.title': {
    'zh-CN': '页面未找到',
    'en-US': 'Page Not Found',
    'ja-JP': 'ページが見つかりません',
    'ko-KR': '페이지를 찾을 수 없습니다',
  },
  'notfound.description': {
    'zh-CN': '你要前往的页面没有在本站的公开路径中保留下来。',
    'en-US': 'The page you are trying to reach is not available in the current public site map.',
    'ja-JP': 'お探しのページは現在の公開サイト構成には含まれていません。',
    'ko-KR': '요청하신 페이지는 현재 공개 사이트 구조에 포함되어 있지 않습니다.',
  },
  'notfound.home': {
    'zh-CN': '返回首页',
    'en-US': 'Back Home',
    'ja-JP': 'ホームへ戻る',
    'ko-KR': '홈으로',
  },
  'notfound.reservations': {
    'zh-CN': '前往票务导览',
    'en-US': 'Go to Tickets & Visits',
    'ja-JP': 'チケット案内へ',
    'ko-KR': '티켓 안내로',
  },
}

messages['admin.title'] = {
  'zh-CN': '票务管理后台',
  'en-US': 'Ticketing Admin',
  'ja-JP': 'チケット管理',
  'ko-KR': '티켓 관리 콘솔',
}

// === Detail page: sticky sub-navigation under the hero ====================
messages['detail.subnav.aria'] = {
  'zh-CN': '景点详情区块导航',
  'en-US': 'Section navigation',
  'ja-JP': 'セクションナビゲーション',
  'ko-KR': '섹션 내비게이션',
}
messages['detail.subnav.overview'] = {
  'zh-CN': '概览',
  'en-US': 'Overview',
  'ja-JP': '概要',
  'ko-KR': '개요',
}
messages['detail.subnav.tickets'] = {
  'zh-CN': '票务',
  'en-US': 'Tickets',
  'ja-JP': 'チケット',
  'ko-KR': '티켓',
}
messages['detail.subnav.practical'] = {
  'zh-CN': '实用信息',
  'en-US': 'Practical',
  'ja-JP': '実用情報',
  'ko-KR': '실용 정보',
}
messages['detail.subnav.accessibility'] = {
  'zh-CN': '无障碍',
  'en-US': 'Accessibility',
  'ja-JP': 'バリアフリー',
  'ko-KR': '접근성',
}
messages['detail.subnav.rules'] = {
  'zh-CN': '规则与公告',
  'en-US': 'Rules & Notices',
  'ja-JP': 'ルール・お知らせ',
  'ko-KR': '규정 및 공지',
}

// === Detail page: sticky reservation rail / mobile bottom bar =============
messages['detail.rail.title'] = {
  'zh-CN': '票务速览',
  'en-US': 'Reservation snapshot',
  'ja-JP': 'チケット概要',
  'ko-KR': '예약 요약',
}
messages['detail.rail.priceFrom'] = {
  'zh-CN': '价格 ¥{price} 起',
  'en-US': 'From ¥{price}',
  'ja-JP': '¥{price} から',
  'ko-KR': '¥{price} 부터',
}
messages['detail.rail.priceFree'] = {
  'zh-CN': '免费预约',
  'en-US': 'Free entry',
  'ja-JP': '無料入場',
  'ko-KR': '무료 입장',
}
messages['detail.rail.todayAvailable'] = {
  'zh-CN': '今日尚可预约',
  'en-US': 'Available today',
  'ja-JP': '本日予約可',
  'ko-KR': '오늘 예약 가능',
}
messages['detail.rail.todayFull'] = {
  'zh-CN': '今日已约满',
  'en-US': 'Today is fully booked',
  'ja-JP': '本日は満席',
  'ko-KR': '오늘은 마감',
}
messages['detail.rail.upcoming'] = {
  'zh-CN': '最近可约 {date} {timeRange}',
  'en-US': 'Next slot {date} {timeRange}',
  'ja-JP': '次の枠 {date} {timeRange}',
  'ko-KR': '다음 시간대 {date} {timeRange}',
}
messages['detail.rail.empty'] = {
  'zh-CN': '暂无可预约时段',
  'en-US': 'No bookable slots yet',
  'ja-JP': '予約可能な枠はまだありません',
  'ko-KR': '예약 가능한 시간대가 없습니다',
}
messages['detail.rail.openVisit'] = {
  'zh-CN': '免费开放参观',
  'en-US': 'Open access — no booking needed',
  'ja-JP': '無料開放、予約不要',
  'ko-KR': '자유 입장, 예약 불필요',
}
messages['detail.rail.viewTickets'] = {
  'zh-CN': '查看全部票种',
  'en-US': 'See all tickets',
  'ja-JP': '全てのチケットを見る',
  'ko-KR': '모든 티켓 보기',
}
messages['detail.rail.viewSlots'] = {
  'zh-CN': '查看可约时段',
  'en-US': 'See available slots',
  'ja-JP': '予約可能な枠を見る',
  'ko-KR': '예약 가능한 시간대',
}

// === New 3-entry nav + mega-menu + command palette =======================
messages['nav.discover'] = {
  'zh-CN': '探索杭州',
  'en-US': 'Discover',
  'ja-JP': '杭州を探る',
  'ko-KR': '항저우 탐색',
}
messages['nav.discover.tagline'] = {
  'zh-CN': '街区 · 路线 · 活动 · 须知',
  'en-US': 'Neighbourhoods · Routes · Events · Guides',
  'ja-JP': 'エリア・ルート・イベント・ガイド',
  'ko-KR': '구역 · 루트 · 이벤트 · 안내',
}
messages['nav.book'] = {
  'zh-CN': '景点预约',
  'en-US': 'Book',
  'ja-JP': '予約する',
  'ko-KR': '예약',
}
messages['nav.myTrip'] = {
  'zh-CN': '我的行程',
  'en-US': 'My Trip',
  'ja-JP': 'マイ旅程',
  'ko-KR': '내 여정',
}
messages['nav.discover.neighborhoods'] = {
  'zh-CN': '街区',
  'en-US': 'Neighbourhoods',
  'ja-JP': 'エリア',
  'ko-KR': '구역',
}
messages['nav.discover.neighborhoodsHint'] = {
  'zh-CN': '城市分区与文化打法',
  'en-US': 'City districts & culture',
  'ja-JP': 'エリア・文化案内',
  'ko-KR': '도시 구역과 문화',
}
messages['nav.discover.events'] = {
  'zh-CN': '活动',
  'en-US': 'What’s On',
  'ja-JP': 'イベント',
  'ko-KR': '이벤트',
}
messages['nav.discover.eventsHint'] = {
  'zh-CN': '展览 · 演出 · 节庆日历',
  'en-US': 'Exhibitions, shows & festivals',
  'ja-JP': '展示・公演・祭り',
  'ko-KR': '전시 · 공연 · 축제',
}
messages['nav.discover.routes'] = {
  'zh-CN': '路线',
  'en-US': 'Routes',
  'ja-JP': 'ルート',
  'ko-KR': '루트',
}
messages['nav.discover.routesHint'] = {
  'zh-CN': '精选漫游路线',
  'en-US': 'Curated slow itineraries',
  'ja-JP': '周遊ルート集',
  'ko-KR': '엄선된 여행 루트',
}
messages['nav.discover.guide'] = {
  'zh-CN': '访前须知',
  'en-US': 'Visit Guide',
  'ja-JP': '訪問ガイド',
  'ko-KR': '방문 안내',
}
messages['nav.discover.guideHint'] = {
  'zh-CN': '实用攻略与服务支持',
  'en-US': 'Practical info & services',
  'ja-JP': '実用情報・サポート',
  'ko-KR': '실용 정보 · 지원',
}

// Search chip + Command Palette
messages['search.chipPlaceholder'] = {
  'zh-CN': '搜景点、街区、活动…',
  'en-US': 'Search places, areas, events…',
  'ja-JP': 'スポット・エリア・イベントを検索',
  'ko-KR': '명소·구역·이벤트 검색',
}
messages['search.chipShortcut'] = {
  'zh-CN': '⌘K',
  'en-US': '⌘K',
  'ja-JP': '⌘K',
  'ko-KR': '⌘K',
}
messages['search.openAria'] = {
  'zh-CN': '打开搜索',
  'en-US': 'Open search',
  'ja-JP': '検索を開く',
  'ko-KR': '검색 열기',
}
messages['palette.title'] = {
  'zh-CN': '搜索杭州文旅',
  'en-US': 'Search Hangzhou Travel',
  'ja-JP': '杭州文旅を検索',
  'ko-KR': '항저우 문화관광 검색',
}
messages['palette.placeholder'] = {
  'zh-CN': '景点 / 街区 / 活动 / 路线 / 须知…',
  'en-US': 'Places / areas / events / routes / guides…',
  'ja-JP': 'スポット / エリア / イベント / ルート…',
  'ko-KR': '명소 / 구역 / 이벤트 / 루트…',
}
messages['palette.empty'] = {
  'zh-CN': '没有匹配项，换个关键词试试。',
  'en-US': 'No matches — try a different keyword.',
  'ja-JP': '該当なし。別のキーワードでお試しください。',
  'ko-KR': '결과가 없습니다. 다른 키워드를 시도해 보세요.',
}
messages['palette.hint'] = {
  'zh-CN': '↑↓ 浏览  ↵ 打开  Esc 关闭',
  'en-US': '↑↓ navigate · ↵ open · Esc close',
  'ja-JP': '↑↓ 移動 / ↵ 開く / Esc 閉じる',
  'ko-KR': '↑↓ 이동 · ↵ 열기 · Esc 닫기',
}
messages['palette.suggestions'] = {
  'zh-CN': '推荐探索',
  'en-US': 'Suggestions',
  'ja-JP': 'おすすめ',
  'ko-KR': '추천',
}
messages['palette.group.spot'] = {
  'zh-CN': '景点',
  'en-US': 'Places',
  'ja-JP': 'スポット',
  'ko-KR': '명소',
}
messages['palette.group.neighborhood'] = {
  'zh-CN': '街区',
  'en-US': 'Areas',
  'ja-JP': 'エリア',
  'ko-KR': '구역',
}
messages['palette.group.event'] = {
  'zh-CN': '活动',
  'en-US': 'Events',
  'ja-JP': 'イベント',
  'ko-KR': '이벤트',
}
messages['palette.group.route'] = {
  'zh-CN': '路线',
  'en-US': 'Routes',
  'ja-JP': 'ルート',
  'ko-KR': '루트',
}
messages['palette.group.pass'] = {
  'zh-CN': '通票 / 卡',
  'en-US': 'Passes',
  'ja-JP': 'パス',
  'ko-KR': '패스',
}
messages['palette.group.theme'] = {
  'zh-CN': '主题旅程',
  'en-US': 'Themed Trips',
  'ja-JP': 'テーマ旅',
  'ko-KR': '테마 여행',
}
messages['palette.close'] = {
  'zh-CN': '关闭',
  'en-US': 'Close',
  'ja-JP': '閉じる',
  'ko-KR': '닫기',
}

const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`,
  )
}

export const t = (key: string, vars?: Record<string, string | number>) => {
  const entry = messages[key]
  const raw = entry?.[siteLocale.value] ?? entry?.[defaultLocale] ?? key
  return interpolate(raw, vars)
}
