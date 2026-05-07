import type { LocalizedText } from '../i18n/site'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export type CityEventGuide = {
  id: string
  name: LocalizedText
  nameEn: string
  category: LocalizedText
  monthLabel: LocalizedText
  district: LocalizedText
  description: LocalizedText
  bestFor: LocalizedText
  bookingAlert: LocalizedText
  weatherPlan: LocalizedText
  statusNote: LocalizedText
  relatedNeighborhoodId?: string
  relatedSpotIds: string[]
  leadSpotId: string
}

export const cityEvents: CityEventGuide[] = [
  {
    id: 'longjing-tea-season',
    name: text('龙井问茶季', 'Longjing Tea Season', '龍井問茶シーズン', '룽징 차 시즌'),
    nameEn: 'Longjing Tea Season',
    category: text('春季茶事', 'Spring tea culture', '春の茶文化', '봄 차 문화'),
    monthLabel: text('3 月下旬 - 4 月', 'Late Mar - Apr', '3月下旬 - 4月', '3월 하순 - 4월'),
    district: text('西湖区龙井一带', 'Longjing hills, Xihu District', '西湖区・龍井周辺', '시후구 룽징 일대'),
    description: text(
      '适合把龙井茶园、山路和茶席安排在一起。它吸引的不是“一次看完”，而是春天愿意再次回来的人。',
      'A seasonal draw for tea hills, gentle walks and tea-table pauses.',
      '茶畑の景色と山道、お茶席を一緒に楽しむ春の定番です。',
      '차밭 풍경, 산길, 다도 체험을 함께 묶기 좋은 봄철 핵심 일정입니다.',
    ),
    bestFor: text('春季二刷杭州、摄影、茶文化偏好用户', 'Repeat spring visitors, photographers and tea lovers', '春の再訪者、写真好き、お茶好き向け', '봄 재방문객, 사진가, 차 문화 선호층'),
    bookingAlert: text('茶村停车和周边接驳通常比门票更早紧张，建议提早定路线。', 'Transport and parking often tighten earlier than tickets.', '駐車や接続交通のほうが先に混みやすい時期です。', '입장권보다 주차와 연결 교통이 먼저 붐비기 쉬운 시기입니다.'),
    weatherPlan: text('小雨并不一定影响体验，但山路湿滑时应减少长距离徒步。', 'Light rain can still work, but wet paths reduce longer walks.', '小雨なら成立しますが、濡れた山道は歩行距離を短く。', '가벼운 비는 괜찮지만 젖은 산길에서는 장거리 도보를 줄이는 편이 좋습니다.'),
    statusNote: text('具体活动档期以年度官方发布为准。', 'Exact dates should follow the yearly official release.', '日程は毎年の公式発表に準じます。', '정확한 일정은 연도별 공식 발표 기준입니다.'),
    relatedNeighborhoodId: 'longjing-tea-hills',
    relatedSpotIds: ['hangzhou-botanical-garden', 'west-lake'],
    leadSpotId: 'hangzhou-botanical-garden',
  },
  {
    id: 'animation-festival',
    name: text('国际动漫季', 'International Animation Festival', '国際アニメフェスティバル', '국제 애니메이션 페스티벌'),
    nameEn: 'International Animation Festival',
    category: text('城市节庆', 'City festival', '都市フェス', '도시 축제'),
    monthLabel: text('5 月', 'May', '5月', '5월'),
    district: text('杭州主城区 / 会展片区', 'Urban Hangzhou / exhibition districts', '市街地 / 会展示区', '도심 / 전시 구역'),
    description: text(
      '它会把杭州的城市气氛拉得更年轻，适合把白天景点和晚间活动混编，而不是只排传统景区。',
      'A younger citywide festival mood that pairs well with daytime sightseeing and evening programmes.',
      '伝統景観だけでなく、夜のイベントも組み合わせたくなる都市型シーズンです。',
      '전통 관광지만이 아니라 저녁 프로그램도 함께 묶고 싶어지는 도시형 시즌입니다.',
    ),
    bestFor: text('年轻游客、二次元爱好者、夜间活动用户', 'Young visitors, anime fans and night-out travellers', '若い旅行者、アニメ好き、夜型プラン向け', '젊은 방문객, 애니메이션 팬, 야간 활동 선호층'),
    bookingAlert: text('热门场次和周边酒店往往先满，建议提前锁定住宿片区。', 'Popular sessions and nearby hotels usually fill first.', '人気回や周辺ホテルは先に埋まりやすいです。', '인기 세션과 주변 호텔이 먼저 차기 쉽습니다.'),
    weatherPlan: text('这是相对不怕下雨的活动季，适合和室内行程联动。', 'A rain-tolerant season that works well with indoor plans.', '雨に比較的強く、屋内行程とつなぎやすいです。', '비에 비교적 강해 실내 일정과 연결하기 좋습니다.'),
    statusNote: text('具体票务、分会场和展演安排以年度公告为准。', 'Venue and ticket details depend on the annual announcement.', '会場やチケット詳細は毎年の告知に準じます。', '장소와 티켓 세부 사항은 연도별 공지 기준입니다.'),
    relatedSpotIds: ['southern-song-imperial-street', 'west-lake'],
    leadSpotId: 'west-lake',
  },
  {
    id: 'canal-summer-nights',
    name: text('运河夏夜演出季', 'Canal Summer Nights', '運河サマーナイト', '운하 여름 밤 시즌'),
    nameEn: 'Canal Summer Nights',
    category: text('夜游演出', 'Night performances', '夜の催し', '야간 공연'),
    monthLabel: text('7 月 - 8 月', 'Jul - Aug', '7月 - 8月', '7월 - 8월'),
    district: text('拱墅区运河沿线', 'Canal waterfront, Gongshu', '拱墅区運河沿い', '공수구 운하 일대'),
    description: text(
      '适合把运河白天的街区感转换成夜间的漫步和轻演出。它更像一种“今晚去哪儿”的答案。',
      'A summer answer to “where should we go tonight?” along the canal waterfront.',
      '運河の街区感を、夜の散歩と軽い催しへ切り替えるシーズンです。',
      '운하의 거리 분위기를 밤 산책과 가벼운 공연으로 바꾸는 시즌입니다.',
    ),
    bestFor: text('情侣、短住游客、夜游用户', 'Couples, short-stay visitors and evening travellers', 'カップル、短期滞在、夜歩き向け', '커플, 단기 체류객, 야간 여행자'),
    bookingAlert: text('夜游船位、沿河餐位和返程打车高峰需要提前判断。', 'Evening boat seats, dinner tables and return transport need early planning.', '夜の船便や食事、帰路の混雑を先に見ておくと安心です。', '야간 유람선 좌석, 식사, 귀가 교통 혼잡을 먼저 보는 편이 좋습니다.'),
    weatherPlan: text('暴雨或临时停航时建议切换成桥西街区 + 室内馆舍方案。', 'Shift to indoor canal museums or Qiaoxi streets if heavy rain hits.', '豪雨や運休時は街区歩きと屋内館へ切り替えたいです。', '폭우나 운항 중단 시 실내 전시와 거리 산책으로 전환하는 편이 좋습니다.'),
    statusNote: text('演出和夜游档期会动态调整，请以站内提醒和官方公告为准。', 'Evening programming can change dynamically.', '催しや夜便は変動しやすいです。', '공연과 야간 프로그램은 변동 가능성이 큽니다.'),
    relatedNeighborhoodId: 'canal-gongshu',
    relatedSpotIds: ['grand-canal-hangzhou', 'xiaohe-street'],
    leadSpotId: 'grand-canal-hangzhou',
  },
  {
    id: 'hangzhou-marathon-season',
    name: text('杭州马拉松周', 'Hangzhou Marathon Week', '杭州マラソンウィーク', '항저우 마라톤 위크'),
    nameEn: 'Hangzhou Marathon Week',
    category: text('体育赛事', 'Sports event', 'スポーツイベント', '스포츠 이벤트'),
    monthLabel: text('11 月前后', 'Around Nov', '11月前後', '11월 전후'),
    district: text('西湖及城市主干线沿线', 'West Lake and city corridors', '西湖および市内回廊', '서호 및 도심 주요 노선'),
    description: text(
      '这类赛事周会改变整座城市的通行方式。对游客来说，重点不只是看比赛，而是提前知道哪条路会更难走。',
      'Race week changes how the city moves, so route awareness matters as much as the event itself.',
      '大会そのものだけでなく、街の動線が変わることを先に知っておく価値があります。',
      '경기 자체보다 도시 동선이 바뀐다는 점을 먼저 아는 것이 더 중요할 때가 많습니다.',
    ),
    bestFor: text('秋季来杭游客、赛事观众、喜欢城市氛围的人', 'Autumn visitors, race spectators and city-atmosphere seekers', '秋の旅行者、観戦客、街の高揚感が好きな方', '가을 방문객, 경기 관람객, 도시 분위기를 즐기는 사람'),
    bookingAlert: text('酒店和核心湖岸交通会更早紧张，建议尽量减少当天跨城移动。', 'Hotels and core-lake transport tighten early.', 'ホテルと湖岸交通が早めに混みやすい週です。', '호텔과 핵심 호숫가 교통이 일찍부터 혼잡해질 수 있습니다.'),
    weatherPlan: text('秋雨会影响观赛体验，建议准备室内替代点和热饮停留。', 'Autumn rain makes indoor backups especially helpful.', '秋雨対策として屋内代替案を持っておくと安心です。', '가을비 대비로 실내 대안과 따뜻한 휴식 지점을 준비하는 편이 좋습니다.'),
    statusNote: text('赛道与管制信息需以赛事年度通告和交警公告为准。', 'Road closures depend on the yearly race notice.', 'コースと規制は毎年の大会告知に従います。', '코스와 통제 정보는 연도별 대회 공지 기준입니다.'),
    relatedSpotIds: ['west-lake', 'liuhetower'],
    leadSpotId: 'west-lake',
  },
  {
    id: 'holiday-lights-special',
    name: text('节假日灯光与烟花特别提醒', 'Holiday Lights & Fireworks Watch', '祝祭ライトアップ・花火ウォッチ', '연휴 조명·불꽃 특별 알림'),
    nameEn: 'Holiday Lights & Fireworks Watch',
    category: text('节假日特别活动', 'Holiday special', '祝祭特別企画', '연휴 특별 행사'),
    monthLabel: text('节假日节点', 'Holiday periods', '大型連休期', '연휴 기간'),
    district: text('西湖 / 运河 / 湘湖等热门夜游区', 'West Lake, Canal and other night districts', '西湖・運河など夜景エリア', '서호·운하 등 야간 인기 구역'),
    description: text(
      '大型灯光、烟花或无人机表演往往不按常规景点逻辑发生，它们更像“城市事件”，需要从全城客流与返程交通一起判断。',
      'Light shows, fireworks or drone displays behave more like city events than normal attractions.',
      'ライトアップや花火、ドローン演出は通常の観光地よりも都市イベントとして捉えるべき内容です。',
      '조명·불꽃·드론쇼는 일반 관광지보다 도시 이벤트로 봐야 하는 경우가 많습니다.',
    ),
    bestFor: text('重游杭州、想看夜景特别场的人', 'Repeat visitors and night-scene seekers', '再訪者、特別な夜景を見たい方', '재방문객, 특별한 야경을 보고 싶은 사람'),
    bookingAlert: text('关键不是抢景点，而是提前判断封控、安检和返程拥堵。', 'The key is crowd control, security checks and the trip back.', '重要なのは封鎖や入場管理、帰路混雑の読みです。', '핵심은 명소 자체보다 통제, 보안 검색, 귀가 혼잡 판단입니다.'),
    weatherPlan: text('极端天气下活动取消概率高，建议默认准备替代夜间方案。', 'Extreme weather can cancel plans quickly, so keep an evening fallback ready.', '悪天候時は中止の可能性が高いため代替案を前提に。', '악천후 시 취소 가능성이 높아 기본적으로 대체 야간 계획을 준비하는 편이 좋습니다.'),
    statusNote: text('具体有无烟花和表演，以官方年度发布和临时公告为准。', 'Specific fireworks or drone shows depend on official releases.', '具体の実施有無は年次告知に準じます。', '구체적인 불꽃·공연 여부는 공식 발표 기준입니다.'),
    relatedSpotIds: ['west-lake', 'grand-canal-hangzhou', 'xianghu'],
    leadSpotId: 'west-lake',
  },
]
