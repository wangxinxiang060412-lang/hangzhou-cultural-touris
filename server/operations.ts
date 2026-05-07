export type OperationTone = 'normal' | 'watch' | 'limited' | 'closed'
type SiteLocale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'
type LocalizedText = Record<SiteLocale, string>

type SpotLike = {
  id: string
  nameZh: string
  nameEn: string
  featured: boolean
}

type SlotLike = {
  scenicSpotId: string
  date: string
  timeRange: string
  capacity: number
  remaining: number
}

type WeatherLike = {
  syncedAt?: string
  current?: {
    temperature: number
    precipitation: number
    windSpeed: number
    weatherCode: number
  }
  daily?: Array<{
    weatherCode: number
    temperatureMax: number
    precipitationProbability: number
    precipitationSum: number
    windSpeedMax: number
  }>
}

type SpotOperationConfig = {
  openMinute?: number
  closeMinute?: number
  allDay?: boolean
  boats?: boolean
  performance?: boolean
  weatherSensitive?: boolean
}

export type OperationNotice = {
  id: string
  spotId?: string
  tone: OperationTone
  tag: LocalizedText
  title: LocalizedText
  detail: LocalizedText
}

export type SpotOperationStatus = {
  spotId: string
  openTone: OperationTone
  openLabel: LocalizedText
  openDetail: LocalizedText
  crowdTone: OperationTone
  crowdLabel: LocalizedText
  crowdDetail: LocalizedText
  highlight: LocalizedText
  alerts: OperationNotice[]
}

export type OperationServiceCard = {
  id: string
  label: LocalizedText
  value: string
  detail: LocalizedText
  href?: string
}

export type OperationsPayload = {
  syncedAt: string
  spotStatuses: Record<string, SpotOperationStatus>
  featuredAlerts: OperationNotice[]
  serviceCards: OperationServiceCard[]
}

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const pad2 = (value: number) => String(value).padStart(2, '0')
const formatClock = (minute: number) => `${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`

const OPERATION_CONFIG: Record<string, SpotOperationConfig> = {
  'west-lake': { allDay: true, boats: true, weatherSensitive: true },
  'lingyin-feilaifeng': { openMinute: 6 * 60 + 30, closeMinute: 17 * 60 + 30 },
  'xixi-wetland': { openMinute: 8 * 60 + 30, closeMinute: 17 * 60 + 15, boats: true, weatherSensitive: true },
  'liangzhu-ancient-city': { openMinute: 9 * 60, closeMinute: 17 * 60 },
  'grand-canal-hangzhou': { allDay: true, boats: true, weatherSensitive: true },
  songcheng: { openMinute: 10 * 60, closeMinute: 21 * 60 + 30, performance: true, weatherSensitive: true },
  'leifeng-pagoda': { openMinute: 8 * 60, closeMinute: 17 * 60 + 30 },
  'hangzhou-botanical-garden': { openMinute: 7 * 60 + 30, closeMinute: 17 * 60 },
  'hangzhou-zoo': { openMinute: 8 * 60, closeMinute: 17 * 60 },
  'hu-xueyan-residence': { openMinute: 8 * 60 + 30, closeMinute: 17 * 60 },
  liuhetower: { openMinute: 7 * 60 + 30, closeMinute: 17 * 60 },
  guozhuang: { openMinute: 8 * 60, closeMinute: 17 * 60 },
  'xiaohe-street': { allDay: true },
  'southern-song-imperial-street': { allDay: true },
  xianghu: { openMinute: 8 * 60, closeMinute: 18 * 60, boats: true, weatherSensitive: true },
  'qiandao-lake': { openMinute: 8 * 60, closeMinute: 17 * 60 + 30, boats: true, weatherSensitive: true },
}

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseRange = (timeRange: string) => {
  const match = timeRange.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
  if (!match) return null
  return {
    start: Number(match[1]) * 60 + Number(match[2]),
    end: Number(match[3]) * 60 + Number(match[4]),
  }
}

const holidayContextFor = (now: Date) => {
  const month = now.getMonth() + 1
  const date = now.getDate()
  const weekday = now.getDay()
  const inRange = (startMonth: number, startDate: number, endMonth: number, endDate: number) => {
    const key = month * 100 + date
    return key >= startMonth * 100 + startDate && key <= endMonth * 100 + endDate
  }

  if (inRange(1, 1, 1, 3)) {
    return {
      active: true,
      label: text('元旦假期提醒', 'New Year Reminder', '年始休暇の案内', '신정 연휴 안내'),
      detail: text('假期窗口内预约余量变化更快，建议优先锁定上午时段。', 'Availability can move faster during the New Year break; morning slots are safer to secure first.', '年始休暇中は残数変動が早くなります。午前枠の確保をおすすめします。', '신정 연휴에는 잔여 수량 변동이 빨라지므로 오전 시간대를 먼저 확보하는 편이 좋습니다.'),
    }
  }
  if (inRange(5, 1, 5, 5)) {
    return {
      active: true,
      label: text('五一假期提醒', 'Labour Holiday Reminder', '労働節休暇の案内', '노동절 연휴 안내'),
      detail: text('五一窗口客流通常处于高位，热门景点、船班和演出场次建议尽早确认。', 'Labour Day usually brings heavy demand. Confirm popular spots, sailings and shows as early as possible.', '労働節期間は混雑しやすく、人気景点・船便・公演は早めの確認が安心です。', '노동절 연휴에는 수요가 높아 인기 명소, 선박, 공연 회차를 가능한 한 빨리 확인하는 편이 좋습니다.'),
    }
  }
  if (inRange(10, 1, 10, 7)) {
    return {
      active: true,
      label: text('国庆假期提醒', 'National Holiday Reminder', '国慶休暇の案内', '국경절 연휴 안내'),
      detail: text('国庆长假期间会更频繁触发限流和交通管制，请尽量避开午后高峰时段。', 'National Holiday is more likely to trigger capacity controls and traffic management; avoid afternoon peaks when possible.', '国慶連休中は入場制限や交通規制が起こりやすく、午後のピークを避けると動きやすくなります。', '국경절 연휴에는 인원 제한과 교통 통제가 더 자주 발생하므로 가능하면 오후 혼잡 시간을 피하는 편이 좋습니다.'),
    }
  }
  if (weekday === 0 || weekday === 6) {
    return {
      active: true,
      label: text('周末预约提醒', 'Weekend Booking Reminder', '週末予約の案内', '주말 예약 안내'),
      detail: text('周末热门景点余量更新更快，建议先看实时运行状态，再锁定预约时段。', 'Weekend availability moves faster at popular spots. Check live operations first, then secure the slot.', '週末は人気景点の残数変動が速くなります。先に運行状況を見てから時間帯を確保してください。', '주말에는 인기 명소의 잔여 수량 변동이 빨라집니다. 먼저 운영 상태를 확인한 뒤 시간대를 확보하세요.'),
    }
  }
  return {
    active: false,
    label: text('平日运行', 'Weekday Operations', '平日運行', '평일 운영'),
    detail: text('工作日客流通常更平稳，适合安排展馆、园林和长线步行。', 'Weekdays are usually steadier and better for museums, gardens and longer walks.', '平日は比較的落ち着いており、展示館、庭園、長めの散策に向いています。', '평일에는 비교적 안정적이어서 전시관, 정원, 긴 산책 일정을 잡기 좋습니다.'),
  }
}

const weatherRiskFor = (weather: WeatherLike | null) => {
  const current = weather?.current
  const daily = weather?.daily?.[0]
  if (!current || !daily) return 'medium'

  const hasStorm =
    [95, 96, 99].includes(current.weatherCode) || [95, 96, 99].includes(daily.weatherCode)
  const highRain = daily.precipitationProbability >= 70 || daily.precipitationSum >= 20
  const strongWind = Math.max(current.windSpeed, daily.windSpeedMax) >= 38
  const highHeat = Math.max(current.temperature, daily.temperatureMax) >= 35
  const mediumRain = daily.precipitationProbability >= 35 || current.precipitation > 0

  if (hasStorm || highRain || strongWind || highHeat) return 'high'
  if (mediumRain || current.windSpeed >= 24 || daily.temperatureMax >= 32) return 'medium'
  return 'low'
}

const defaultConfigForSpot = (spotId: string) =>
  OPERATION_CONFIG[spotId] ?? { openMinute: 8 * 60 + 30, closeMinute: 17 * 60 }

const buildOpenState = (spotId: string, minute: number, weatherRisk: string) => {
  const config = defaultConfigForSpot(spotId)

  if (config.allDay) {
    if (weatherRisk === 'high' && config.weatherSensitive) {
      return {
        tone: 'limited' as const,
        label: text('部分受限', 'Partially Restricted', '一部制限中', '일부 제한'),
        detail: text('受强对流或大风影响，临水区域与户外运营项目可能临时调整。', 'Strong weather may temporarily affect waterfront areas and outdoor operations.', '強い天候の影響で、水辺や屋外運営が一時調整される場合があります。', '강한 날씨 영향으로 수변 구역과 야외 운영 항목이 임시 조정될 수 있습니다.'),
      }
    }
    return {
      tone: 'normal' as const,
      label: text('开放中', 'Open Now', '開放中', '운영 중'),
      detail: text('景区主体开放，个别码头、展馆或服务点位以现场公告为准。', 'The scenic area is open; individual piers, museums and service points follow on-site notice.', '景区本体は開放中。個別の船着場、展示館、サービス窓口は現地告知に準じます。', '명소 본체는 운영 중이며 개별 선착장, 전시관, 서비스 포인트는 현장 공지를 따릅니다.'),
    }
  }

  const openMinute = config.openMinute ?? 8 * 60 + 30
  const closeMinute = config.closeMinute ?? 17 * 60

  if (minute < openMinute) {
    return {
      tone: 'watch' as const,
      label: text('待开园', 'Opening Later', '開園前', '개장 전'),
      detail: text(`预计 ${formatClock(openMinute)} 开放，请留意首轮检票与安检安排。`, `Expected to open at ${formatClock(openMinute)}. Check first-entry and security arrangements.`, `${formatClock(openMinute)} 開始予定です。初回入場と手荷物検査の案内をご確認ください。`, `${formatClock(openMinute)} 개장 예정입니다. 첫 입장과 보안 검색 안내를 확인해 주세요.`),
    }
  }

  if (minute >= closeMinute) {
    return {
      tone: 'closed' as const,
      label: text('已闭园', 'Closed Today', '本日終了', '운영 종료'),
      detail: text(`今日运营时段已结束，下一轮开放以次日 ${formatClock(openMinute)} 及景区公告为准。`, `Today's operating hours have ended. The next opening follows ${formatClock(openMinute)} tomorrow and venue notice.`, `本日の運営は終了しました。次回は翌日 ${formatClock(openMinute)} と施設告知に従います。`, `오늘 운영이 종료되었습니다. 다음 개방은 내일 ${formatClock(openMinute)} 및 현장 공지를 따릅니다.`),
    }
  }

  if (weatherRisk === 'high' && config.weatherSensitive) {
    return {
      tone: 'limited' as const,
      label: text('限流开放', 'Open with Limits', '制限付き開放', '제한 운영'),
      detail: text('极端天气下已启动临时安全管控，户外或临水动线可能缩短。', 'Temporary safety controls are active due to severe weather; outdoor or waterfront routes may shorten.', '悪天候のため一時安全管理を実施中です。屋外・水辺の導線が短縮される場合があります。', '악천후로 임시 안전 통제가 시행 중이며 야외·수변 동선이 축소될 수 있습니다.'),
    }
  }

  if (closeMinute - minute <= 45) {
    return {
      tone: 'watch' as const,
      label: text('即将停止入园', 'Last Entry Soon', '最終入場まもなく', '마감 임박'),
      detail: text(`距停止入园约 ${closeMinute - minute} 分钟，请优先完成检票与安检。`, `About ${closeMinute - minute} minutes remain before last entry. Prioritise ticket check and security.`, `最終入場まで約 ${closeMinute - minute} 分です。検票と手荷物検査を優先してください。`, `마지막 입장까지 약 ${closeMinute - minute}분 남았습니다. 검표와 보안 검색을 우선 진행해 주세요.`),
    }
  }

  return {
    tone: 'normal' as const,
    label: text('开放中', 'Open Now', '開放中', '운영 중'),
    detail: text(`当前处于今日运营时段内，常规开放至 ${formatClock(closeMinute)}。`, `Currently within today's operating window and normally open until ${formatClock(closeMinute)}.`, `本日の運営時間内で、通常は ${formatClock(closeMinute)} まで開放します。`, `현재 오늘 운영 시간 내이며 보통 ${formatClock(closeMinute)}까지 운영합니다.`),
  }
}

const buildCrowdState = (
  spotId: string,
  featured: boolean,
  slots: SlotLike[],
  minute: number,
  hour: number,
  holidayActive: boolean,
  weatherRisk: string,
) => {
  const spotSlots = slots.filter((slot) => slot.scenicSpotId === spotId)
  let ratio = 0
  let remainingText = text('当前余量平稳', 'Availability is steady', '残数は安定しています', '잔여 수량은 안정적입니다')

  if (spotSlots.length > 0) {
    const activeSlot = spotSlots.find((slot) => {
      const range = parseRange(slot.timeRange)
      return range ? minute >= range.start && minute < range.end : false
    })
    const sourceSlot = activeSlot ?? spotSlots[0]
    ratio = sourceSlot.capacity > 0 ? 1 - sourceSlot.remaining / sourceSlot.capacity : 0
    remainingText = text(
      `当前可用余量 ${sourceSlot.remaining} / ${sourceSlot.capacity}`,
      `Current availability ${sourceSlot.remaining} / ${sourceSlot.capacity}`,
      `現在の残数 ${sourceSlot.remaining} / ${sourceSlot.capacity}`,
      `현재 잔여 ${sourceSlot.remaining} / ${sourceSlot.capacity}`,
    )
  } else {
    ratio = featured ? 0.42 : 0.3
    if (holidayActive) ratio += 0.18
    if (hour >= 10 && hour <= 16) ratio += 0.14
    if (weatherRisk === 'high') ratio -= 0.08
  }

  if (ratio >= 0.86) {
    return {
      tone: 'limited' as const,
      label: text('客流高峰', 'Peak Crowds', '混雑ピーク', '혼잡 최고조'),
      detail: text('主入口与热门动线排队较长，建议错峰或改选相邻时段。', 'Queues are longer at main gates and popular routes. Shift later or choose an adjacent slot if possible.', '主入口と人気動線の待ち時間が長めです。時間帯をずらすと動きやすくなります。', '주요 입구와 인기 동선 대기 시간이 길어질 수 있어 시간대를 늦추는 편이 좋습니다.'),
      remainingText,
    }
  }
  if (ratio >= 0.68) {
    return {
      tone: 'watch' as const,
      label: text('客流较满', 'Busy Now', 'やや混雑', '다소 혼잡'),
      detail: text('热门点位通行速度放缓，建议预留更多检票与步行时间。', 'Movement is slowing near popular areas. Allow more time for entry and walking.', '人気エリアでは通行がやや遅くなっています。検票と移動に余裕をみてください。', '인기 지점 통행 속도가 다소 느려지고 있어 검표와 이동 시간을 넉넉히 잡는 편이 좋습니다.'),
      remainingText,
    }
  }
  if (ratio >= 0.42) {
    return {
      tone: 'watch' as const,
      label: text('客流平稳', 'Steady Flow', '流れは安定', '안정적 흐름'),
      detail: text('当前客流可控，适合按原计划入园或切换相邻线路。', 'Visitor flow is manageable and supports normal plans or nearby route changes.', '現在の客流は安定しており、通常どおりの入場や近隣ルート変更に向いています。', '현재 방문 흐름은 안정적이어서 원래 계획대로 입장하거나 인근 동선으로 바꾸기 좋습니다.'),
      remainingText,
    }
  }
  return {
    tone: 'normal' as const,
    label: text('通行顺畅', 'Easy Access', '通行は順調', '원활'),
    detail: text('主入口与核心动线通行顺畅，适合优先安排热门区域。', 'Main gates and core routes are moving smoothly, making this a good time for popular areas.', '主入口と主要動線は順調です。人気エリアを先に回るのに向いています。', '주요 입구와 핵심 동선이 원활해 인기 구역을 먼저 보기 좋습니다.'),
    remainingText,
  }
}

const buildSpotAlerts = (
  spot: SpotLike,
  openTone: OperationTone,
  crowdTone: OperationTone,
  crowdLabel: LocalizedText,
  crowdDetail: LocalizedText,
  holidayContext: ReturnType<typeof holidayContextFor>,
  weatherRisk: string,
  weather: WeatherLike | null,
) => {
  const config = defaultConfigForSpot(spot.id)
  const alerts: OperationNotice[] = []
  const spotName = text(spot.nameZh, spot.nameEn, spot.nameEn, spot.nameEn)

  if (holidayContext.active && (spot.featured || config.performance || config.boats)) {
    alerts.push({
      id: `${spot.id}-holiday`,
      spotId: spot.id,
      tone: 'watch',
      tag: holidayContext.label,
      title: text('预约余量更新更快', 'Availability Moves Faster', '残数変動に注意', '잔여 변동 주의'),
      detail: holidayContext.detail,
    })
  }

  if (crowdTone === 'limited' || crowdTone === 'watch') {
    alerts.push({
      id: `${spot.id}-crowd`,
      spotId: spot.id,
      tone: crowdTone,
      tag: text('当前客流', 'Current Crowds', '現在の客流', '현재 방문 흐름'),
      title: crowdLabel,
      detail: crowdDetail,
    })
  }

  if (openTone === 'limited' || crowdTone === 'limited') {
    alerts.push({
      id: `${spot.id}-control`,
      spotId: spot.id,
      tone: 'limited',
      tag: text('临时管制', 'Temporary Control', '一時規制', '임시 통제'),
      title: text('部分入口或动线已启用弹性限流', 'Entry or route controls are active', '入口または動線で調整中', '일부 입구 또는 동선 조정 중'),
      detail: text('现场将根据安全与客流情况分段放行，请优先听从工作人员引导。', 'Segmented entry may be used for safety and crowd balance. Follow staff guidance first.', '安全と混雑状況に応じて区間ごとの入場調整を行う場合があります。スタッフ案内を優先してください。', '안전과 혼잡 상황에 따라 구간별 입장이 조정될 수 있으니 직원 안내를 우선 따라 주세요.'),
    })
  }

  if (config.performance) {
    const performanceAffected = weatherRisk === 'high'
    alerts.push({
      id: `${spot.id}-performance`,
      spotId: spot.id,
      tone: performanceAffected ? 'limited' : 'normal',
      tag: text('演出变更', 'Show Update', '公演更新', '공연 변경'),
      title: performanceAffected
        ? text('晚场演出可能顺延或调整入场', 'Evening show may shift entry timing', '夜公演の入場時間が調整される場合があります', '야간 공연 입장 시간이 조정될 수 있습니다')
        : text('今日演出按计划进行', 'Shows are running as planned', '本日の公演は予定どおりです', '오늘 공연은 정상 진행입니다'),
      detail: performanceAffected
        ? text('如遇雷雨或大风，夜间演出将以现场广播和检票口公告为准。', 'Thunderstorms or strong winds may change tonight’s entry order; follow gate announcements.', '雷雨や強風時は、夜公演の案内を現地放送とゲート告知でご確認ください。', '뇌우나 강풍 시 야간 공연 안내는 현장 방송과 게이트 공지를 따릅니다.')
        : text('建议至少提前 30 分钟到场，晚场通常比白天场次更早进入检票高峰。', 'Arrive at least 30 minutes early; evening shows usually hit ticket-check peaks sooner.', '少なくとも 30 分前の到着がおすすめです。夜公演は日中より早く検票が混み始めます。', '최소 30분 일찍 도착하는 편이 좋습니다. 야간 공연은 낮보다 더 빨리 검표 대기가 몰립니다.'),
    })
  }

  if (config.boats) {
    const windSpeed = Math.max(weather?.current?.windSpeed ?? 0, weather?.daily?.[0]?.windSpeedMax ?? 0)
    const boatSuspended = weatherRisk === 'high' || windSpeed >= 38
    const boatLimited = !boatSuspended && weatherRisk === 'medium'
    if (boatSuspended || boatLimited) {
      alerts.push({
        id: `${spot.id}-boats`,
        spotId: spot.id,
        tone: boatSuspended ? 'closed' : 'limited',
        tag: text('码头 / 游船', 'Pier / Boats', '船着場・遊船', '선착장 / 유람선'),
        title: boatSuspended
          ? text('部分船班暂停', 'Some sailings suspended', '一部の船便を停止', '일부 운항 중단')
          : text('船班减班运行', 'Reduced sailing frequency', '減便運航', '감편 운항'),
        detail: boatSuspended
          ? text(`受风力或强对流影响，${spotName['zh-CN']} 临水项目可能临时停航。`, `${spotName['en-US']} waterfront operations may suspend because of wind or severe weather.`, `${spotName['ja-JP']} の水辺運営は風や悪天候のため一時停止する場合があります。`, `${spotName['ko-KR']} 수변 운영은 강풍 또는 악천후로 임시 중단될 수 있습니다.`)
          : text('临近收班或受天气影响，码头与游船班次可能拉长等待间隔。', 'Near last sailing or under weather pressure, piers may lengthen wait intervals.', '最終便前後または天候影響により、船便間隔が延びる場合があります。', '막차 시간대 또는 날씨 영향으로 선박 간격이 길어질 수 있습니다.'),
      })
    }
  }

  if (weatherRisk === 'high' && config.weatherSensitive) {
    alerts.push({
      id: `${spot.id}-weather`,
      spotId: spot.id,
      tone: 'limited',
      tag: text('极端天气', 'Weather Alert', '気象警戒', '기상 경보'),
      title: text('户外动线可能缩短', 'Outdoor routes may shorten', '屋外導線が短縮される場合があります', '야외 동선이 축소될 수 있습니다'),
      detail: text('强降水、雷电、大风或高温情况下，请优先关注景区入口广播与工作人员引导。', 'In heavy rain, thunder, strong wind or heat, follow gate broadcasts and staff guidance first.', '強い雨、雷、強風、高温時は入口放送とスタッフ案内を優先してください。', '강우, 번개, 강풍, 고온 시에는 입구 방송과 직원 안내를 우선 확인해 주세요.'),
    })
  }

  return alerts
}

export const buildOperationsPayload = (
  spots: SpotLike[],
  slots: SlotLike[],
  weather: WeatherLike | null,
  now = new Date(),
): OperationsPayload => {
  const minute = now.getHours() * 60 + now.getMinutes()
  const hour = now.getHours()
  const today = formatLocalDate(now)
  const todaysSlots = slots.filter((slot) => slot.date === today)
  const holidayContext = holidayContextFor(now)
  const weatherRisk = weatherRiskFor(weather)
  const spotStatuses = Object.fromEntries(
    spots.map((spot) => {
      const openState = buildOpenState(spot.id, minute, weatherRisk)
      const crowdState = buildCrowdState(
        spot.id,
        spot.featured,
        todaysSlots,
        minute,
        hour,
        holidayContext.active,
        weatherRisk,
      )
      const alerts = buildSpotAlerts(
        spot,
        openState.tone,
        crowdState.tone,
        crowdState.label,
        crowdState.detail,
        holidayContext,
        weatherRisk,
        weather,
      )

      return [
        spot.id,
        {
          spotId: spot.id,
          openTone: openState.tone,
          openLabel: openState.label,
          openDetail: openState.detail,
          crowdTone: crowdState.tone,
          crowdLabel: crowdState.label,
          crowdDetail: crowdState.remainingText,
          highlight: alerts[0]?.detail ?? crowdState.detail,
          alerts,
        } satisfies SpotOperationStatus,
      ]
    }),
  )
  const statuses = Object.values(spotStatuses)
  const alerts: OperationNotice[] = []

  if (weatherRisk === 'high') {
    alerts.push({
      id: 'global-weather',
      tone: 'limited',
      tag: text('极端天气提醒', 'Weather Advisory', '気象警戒', '기상 안내'),
      title: text('户外景区可能临时限流', 'Outdoor venues may restrict entry', '屋外景区で一時制限の可能性', '야외 명소는 임시 제한 가능'),
      detail: text('当前天气条件对山水步道、码头、游船与夜间演出更敏感，请优先查看实时状态。', 'Current weather is more sensitive for waterfront routes, piers, boats and evening shows. Check live status before departure.', '現在の天候は水辺ルート、船着場、遊船、夜公演に影響しやすいため、出発前に運行状況をご確認ください。', '현재 날씨는 수변 동선, 선착장, 유람선, 야간 공연에 더 민감하므로 출발 전에 운영 상태를 먼저 확인해 주세요.'),
    })
  } else if (weatherRisk === 'medium') {
    alerts.push({
      id: 'global-weather-watch',
      tone: 'watch',
      tag: text('天气变化', 'Weather Watch', '天候変化', '날씨 변화'),
      title: text('临水与夜间项目请留意最新公告', 'Watch waterfront and evening updates', '水辺と夜間運営の最新案内に注意', '수변·야간 운영 공지 확인'),
      detail: text('降雨、雾气或阵风可能拉长排队和候船时间，建议预留更多现场调整空间。', 'Rain, fog or gusts may lengthen queues and boarding time. Leave room for adjustments.', '雨、霧、突風により待機や乗船時間が延びる場合があります。時間に余裕を持ってください。', '비, 안개, 돌풍으로 대기와 승선 시간이 길어질 수 있으니 여유 있게 움직이는 편이 좋습니다.'),
    })
  }

  if (holidayContext.active) {
    alerts.push({
      id: 'global-holiday',
      tone: 'watch',
      tag: holidayContext.label,
      title: text('热门景点余量更新较快', 'Popular spots update quickly', '人気景点の残数更新が速い', '인기 명소 잔여 변동이 빠름'),
      detail: holidayContext.detail,
    })
  }

  spots
    .filter((spot) => spot.featured)
    .flatMap((spot) => spotStatuses[spot.id]?.alerts ?? [])
    .filter((alert) => alert.tone !== 'normal')
    .slice(0, 4)
    .forEach((alert) => alerts.push(alert))

  const openCount = statuses.filter((status) => status.openTone !== 'closed').length
  const busyCount = statuses.filter((status) => status.crowdTone === 'limited' || status.crowdTone === 'watch').length
  const syncedAt = weather?.syncedAt ?? now.toISOString()
  const syncedDate = new Date(syncedAt)
  const displaySync = Number.isNaN(syncedDate.getTime()) ? now : syncedDate

  return {
    syncedAt,
    spotStatuses,
    featuredAlerts: alerts.slice(0, 5),
    serviceCards: [
      {
        id: 'open-spots',
        label: text('当前开放景点', 'Open Spots', '現在開放中の景点', '현재 운영 중 명소'),
        value: String(openCount),
        detail: text('按今日营业时段、天气和现场限制综合估算。', 'Estimated from today’s hours, weather and on-site limits.', '本日の営業時間、天候、現地制限をもとに推定しています。', '오늘 운영 시간, 날씨, 현장 제한을 기준으로 추정한 수치입니다.'),
      },
      {
        id: 'busy-spots',
        label: text('高负荷景点', 'Busy Spots', '混雑注意景点', '혼잡 주의 명소'),
        value: String(busyCount),
        detail: text('建议优先查看实时状态，再决定是否立即预约。', 'Check live status first before deciding to book right away.', 'すぐ予約する前に、まず運行状況をご確認ください。', '바로 예약하기 전에 먼저 운영 상태를 확인하는 편이 좋습니다.'),
      },
      {
        id: 'status-sync',
        label: text('状态更新时间', 'Status Sync', '更新時刻', '업데이트 시각'),
        value: `${pad2(displaySync.getHours())}:${pad2(displaySync.getMinutes())}`,
        detail: text('天气与运行提示由后端统一聚合并定时刷新。', 'Weather and operation cues are aggregated by the API and refreshed on schedule.', '天候と運行提示は API で集約し定期更新します。', '날씨와 운영 신호는 API에서 통합해 주기적으로 갱신합니다.'),
      },
      {
        id: 'tourism-hotline',
        label: text('旅游咨询', 'Tourism Hotline', '観光相談', '관광 상담'),
        value: '12301',
        href: 'tel:12301',
        detail: text('如遇停航、限流或临时调整，可优先联系旅游服务热线。', 'For sailings, capacity controls or temporary changes, use the tourism hotline first.', '運休、入場制限、一時調整がある場合は観光ホットラインが最短です。', '운항 중단, 인원 제한, 임시 조정은 관광 핫라인으로 먼저 확인할 수 있습니다.'),
      },
    ],
  }
}
