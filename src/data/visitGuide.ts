import type { LocalizedText } from '../i18n/site'

export type VisitGuideFact = {
  id: string
  label: LocalizedText
  value: LocalizedText
  note: LocalizedText
}

export type VisitGuideStep = {
  id: string
  title: LocalizedText
  detail: LocalizedText
}

export type VisitGuidePolicy = {
  id: string
  title: LocalizedText
  detail: LocalizedText
}

export type VisitGuideFaq = {
  id: string
  question: LocalizedText
  answer: LocalizedText
}

export type VisitGuideSupport = {
  id: string
  title: LocalizedText
  detail: LocalizedText
}

export const visitGuideFacts: VisitGuideFact[] = [
  {
    id: 'hours',
    label: {
      'zh-CN': '开放与入场',
      'en-US': 'Hours & Entry',
      'ja-JP': '開放・入場',
      'ko-KR': '운영 및 입장',
    },
    value: {
      'zh-CN': '提前确认当日开放、最后入园与安全限流',
      'en-US': 'Confirm daily opening, last entry and safety crowd control',
      'ja-JP': '当日の開放、最終入場、安全上の入場制限をご確認ください',
      'ko-KR': '당일 개방, 마지막 입장, 안전상 인원 제한을 확인하세요',
    },
    note: {
      'zh-CN': '杭州已取消 A 级景区统一入园预约要求，但节假日、维护、活动、恶劣天气或高峰客流仍可能触发现场管控。',
      'en-US': 'Hangzhou has cancelled the unified entry-reservation requirement for A-level scenic areas, but holidays, maintenance, events, severe weather or peak crowds may still trigger on-site controls.',
      'ja-JP': '杭州では A 級観光地の一律入場予約要件が廃止されていますが、祝休日、保守、催事、悪天候、混雑時には現地管理が行われる場合があります。',
      'ko-KR': '항저우는 A급 관광지의 통합 입장 예약 요건을 취소했지만 공휴일, 점검, 행사, 악천후, 혼잡 시 현장 통제가 있을 수 있습니다.',
    },
  },
  {
    id: 'reservation',
    label: {
      'zh-CN': '票务与分时',
      'en-US': 'Tickets & Timed Entry',
      'ja-JP': 'チケット・時間帯',
      'ko-KR': '티켓 및 시간대',
    },
    value: {
      'zh-CN': '付费景区、演出、船班和场馆建议提前确认票种与时段',
      'en-US': 'For paid venues, shows, boats and museums, confirm ticket type and time slot in advance',
      'ja-JP': '有料施設、公演、船便、博物館は券種と時間帯を事前にご確認ください',
      'ko-KR': '유료 명소, 공연, 선박, 박물관은 권종과 시간대를 미리 확인하세요',
    },
    note: {
      'zh-CN': '实时价格、优惠资格、余量、退改和现场补票均以官方票务渠道或景区公告为准。',
      'en-US': 'Real-time prices, concessions, availability, refunds and same-day tickets follow the official ticketing channel or venue notice.',
      'ja-JP': '価格、優待資格、残数、変更払戻、当日券は公式チケット窓口または施設告知に準じます。',
      'ko-KR': '실시간 가격, 우대 자격, 잔여, 환불, 당일권은 공식 티켓 채널 또는 명소 공지를 따릅니다.',
    },
  },
  {
    id: 'identity',
    label: {
      'zh-CN': '实名与核验',
      'en-US': 'Identity & Verification',
      'ja-JP': '本人確認',
      'ko-KR': '본인 확인',
    },
    value: {
      'zh-CN': '入园时请备妥证件、购票凭证或到访登记凭证',
      'en-US': 'Bring ID, ticket voucher or visit registration pass on entry',
      'ja-JP': '入場時は身分証、チケット、訪問登録証明をご準備ください',
      'ko-KR': '입장 시 신분증, 티켓 바우처 또는 방문 등록증을 준비하세요',
    },
    note: {
      'zh-CN': '不同景点可能对姓名、手机号、证件信息或同行人数量有不同要求。',
      'en-US': 'Sites may differ on requirements for name, phone, ID and group size.',
      'ja-JP': '景勝地によって、氏名・電話番号・身分証・同行人数の要件が異なる場合があります。',
      'ko-KR': '명소에 따라 이름·전화·신분증·동반 인원에 대한 요구가 다를 수 있습니다.',
    },
  },
  {
    id: 'transport',
    label: {
      'zh-CN': '到达方式',
      'en-US': 'Getting There',
      'ja-JP': '交通アクセス',
      'ko-KR': '교통 안내',
    },
    value: {
      'zh-CN': '建议优先使用地铁、公交、步行与慢行接驳',
      'en-US': 'Prefer metro, bus, walking and slow-traffic transfers',
      'ja-JP': '地下鉄、バス、徒歩、ゆるやかな移動をおすすめします',
      'ko-KR': '지하철, 버스, 도보 및 천천히 이동을 권장합니다',
    },
    note: {
      'zh-CN': '西湖、灵隐、西溪等区域在高峰时段停车紧张，建议预留换乘时间。',
      'en-US': 'Parking is limited around West Lake, Lingyin and Xixi at peak times—plan transfer time.',
      'ja-JP': '西湖・霊隠・西渓周辺はピーク時に駐車が困難です。乗換時間にゆとりをもってご計画ください。',
      'ko-KR': '시후, 링인, 시시 일대는 혼잡 시간에 주차가 어렵습니다. 환승 시간을 여유 있게 잡으세요.',
    },
  },
]

export const visitGuideSteps: VisitGuideStep[] = [
  {
    id: 'choose',
    title: {
      'zh-CN': '选择景点与日期',
      'en-US': 'Choose spot and date',
      'ja-JP': '景点と日付を選ぶ',
      'ko-KR': '명소와 날짜 선택',
    },
    detail: {
      'zh-CN': '先在票务导览页按区域、分类与开放方式筛选，再进入景点详情确认开放公告、票种与安检规则。',
      'en-US': 'Filter by area, category and entry mode, then open the detail page to confirm notices, tickets and security rules.',
      'ja-JP': 'チケット案内でエリア、分類、入場方式を絞り込み、詳細で開放告知、券種、手荷物検査を確認します。',
      'ko-KR': '티켓 안내에서 지역, 분류, 입장 방식으로 검색한 뒤 상세에서 공지, 권종, 보안 규정을 확인합니다.',
    },
  },
  {
    id: 'reserve',
    title: {
      'zh-CN': '完成购票或到访登记',
      'en-US': 'Complete ticketing or visit registration',
      'ja-JP': '購入または訪問登録を完了',
      'ko-KR': '구매 또는 방문 등록 완료',
    },
    detail: {
      'zh-CN': '按页面指引选择票种、日期与时段，填写游客信息后完成办理。免费开放点位可生成到访登记记录。',
      'en-US': 'Pick ticket, date and slot, fill in visitor details and confirm. Free open sites can generate a visit registration record.',
      'ja-JP': '券種・日付・時間帯を選び、来訪者情報を入力して手続き完了。無料開放地点は訪問登録記録を発行できます。',
      'ko-KR': '권종, 날짜, 시간대를 선택하고 방문자 정보를 입력해 진행하세요. 무료 개방 지점은 방문 등록 기록을 생성할 수 있습니다.',
    },
  },
  {
    id: 'arrive',
    title: {
      'zh-CN': '按时抵达与核验',
      'en-US': 'Arrive and verify',
      'ja-JP': '時間どおりに来場・検証',
      'ko-KR': '제시간 도착과 확인',
    },
    detail: {
      'zh-CN': '建议至少提前 15 至 30 分钟抵达入口，携带购票或登记凭证、有效身份信息与必要的优惠资格证明。',
      'en-US': 'Arrive 15–30 minutes early with your ticket or registration pass, valid ID and any concession proof.',
      'ja-JP': '入口には 15〜30 分前にお越しください。チケットまたは登録証明、身分証、割引資格書類をご持参ください。',
      'ko-KR': '입구에 15~30분 전에 도착하세요. 티켓 또는 등록증, 신분증, 필요한 우대 증빙을 지참합니다.',
    },
  },
  {
    id: 'manage',
    title: {
      'zh-CN': '在订单页管理记录',
      'en-US': 'Manage from My Orders',
      'ja-JP': '予約記録ページで管理',
      'ko-KR': '예약 내역에서 관리',
    },
    detail: {
      'zh-CN': '已提交的记录可在“我的预约”中查看、再次办理或按规则取消；管理端可进行核销与余量调整。',
      'en-US': 'View, rebook or cancel submitted records under My Orders; the admin side handles verification and capacity.',
      'ja-JP': '送信済み記録は「予約記録」で確認・再手続き・規定に沿った取消が可能。管理側で検証と残数調整が行えます。',
      'ko-KR': '제출한 기록은 ‘내 예약’에서 확인·재처리·규정에 따른 취소가 가능하며, 관리자 측에서 검증과 잔여 조정이 이루어집니다.',
    },
  },
]

export const visitGuidePolicies: VisitGuidePolicy[] = [
  {
    id: 'slot',
    title: {
      'zh-CN': '分时服务',
      'en-US': 'Timed Services',
      'ja-JP': '時間帯サービス',
      'ko-KR': '시간대 서비스',
    },
    detail: {
      'zh-CN': '涉及演出、游船、展馆或容量管理的项目，以所选日期和时间段为准；若显示约满，请改选其他时段或日期。',
      'en-US': 'For shows, boats, museums or capacity-managed items, the chosen date and slot apply. If sold out, choose another slot or day.',
      'ja-JP': '公演、船便、展示館、容量管理対象は選択した日付・時間帯が基準です。満員の場合は別時間帯や別日をご検討ください。',
      'ko-KR': '공연, 선박, 전시관, 수용 인원 관리 항목은 선택한 날짜와 시간대 기준입니다. 마감이면 다른 시간대나 날짜를 선택하세요.',
    },
  },
  {
    id: 'arrival',
    title: {
      'zh-CN': '最晚到场',
      'en-US': 'Latest Arrival',
      'ja-JP': '最終到着',
      'ko-KR': '최종 도착',
    },
    detail: {
      'zh-CN': '为保证现场秩序，建议提前到达；部分景点会在停止检票前关闭当日入场。',
      'en-US': 'Arrive early to keep the on-site flow orderly; some sites close same-day entry before final check.',
      'ja-JP': '現場の流れを保つため、お早めにご来場ください。一部の景勝地は最終受付前に当日入場を締め切ります。',
      'ko-KR': '현장 흐름을 위해 일찍 도착해 주세요. 일부 명소는 마감 전 당일 입장을 종료할 수 있습니다.',
    },
  },
  {
    id: 'refund',
    title: {
      'zh-CN': '取消与改期',
      'en-US': 'Cancel & Reschedule',
      'ja-JP': 'キャンセル・変更',
      'ko-KR': '취소 및 변경',
    },
    detail: {
      'zh-CN': '未出行记录可在订单页取消；付费票的改期、退款、不可退项目与手续费以各景点官方票务规则为准。',
      'en-US': 'Upcoming records can be cancelled from My Orders; rescheduling, refunds, non-refundable items and fees follow each venue’s official ticketing rules.',
      'ja-JP': '未利用記録は予約記録ページで取消可能。有料券の変更、払戻、不可払戻項目、手数料は各施設の公式規則に準じます。',
      'ko-KR': '이용 전 기록은 내 예약에서 취소할 수 있습니다. 유료권의 변경, 환불, 환불 불가 항목과 수수료는 각 명소 공식 규정을 따릅니다.',
    },
  },
  {
    id: 'payment',
    title: {
      'zh-CN': '支付方式',
      'en-US': 'Payment Methods',
      'ja-JP': '支払方法',
      'ko-KR': '결제 수단',
    },
    detail: {
      'zh-CN': '站内流程已预留免费入园登记、支付宝、微信支付与云闪付等路径；正式运营时应按景点票务系统逐项接入。',
      'en-US': 'The flow supports free entry registration, Alipay, WeChat Pay and UnionPay; launch integration should connect each venue’s ticketing system one by one.',
      'ja-JP': '無料入場登録、Alipay、WeChat Pay、UnionPay の導線を用意済み。本番では各施設のチケットシステムと接続します。',
      'ko-KR': '무료 입장 등록, Alipay, WeChat Pay, UnionPay 경로를 마련했습니다. 정식 운영 시 각 명소 티켓 시스템과 연결해야 합니다.',
    },
  },
]

export const visitGuideSupport: VisitGuideSupport[] = [
  {
    id: 'accessibility',
    title: {
      'zh-CN': '无障碍与长者服务',
      'en-US': 'Accessibility & Senior Care',
      'ja-JP': 'バリアフリー・シニア対応',
      'ko-KR': '접근성 및 시니어 지원',
    },
    detail: {
      'zh-CN': '建议在出行前确认景点是否提供轮椅通道、坡道、电瓶车、无障碍卫生间与人工服务。',
      'en-US': 'Confirm wheelchair access, ramps, shuttle carts, accessible toilets and on-site assistance before you travel.',
      'ja-JP': '車椅子動線、スロープ、電動カート、バリアフリー化粧室、有人サポートの有無を事前にご確認ください。',
      'ko-KR': '휠체어 접근, 경사로, 전동 카트, 무장애 화장실, 인적 지원 가능 여부를 사전에 확인하세요.',
    },
  },
  {
    id: 'language',
    title: {
      'zh-CN': '语言与国际访客',
      'en-US': 'Language & International Visitors',
      'ja-JP': '言語・海外からの訪問',
      'ko-KR': '언어 및 해외 방문',
    },
    detail: {
      'zh-CN': '站点已支持中文、English、日本語、한국어切换；正式运营可继续扩展更多国际访客服务内容。',
      'en-US': 'The site already supports Chinese, English, Japanese and Korean. More international support can be added at launch.',
      'ja-JP': '本サイトは中国語・英語・日本語・韓国語に対応。正式運用に向けて多言語サポートをさらに拡張できます。',
      'ko-KR': '본 사이트는 중국어·영어·일본어·한국어를 지원합니다. 정식 운영 시 다국어 서비스를 더 확장할 수 있습니다.',
    },
  },
  {
    id: 'weather',
    title: {
      'zh-CN': '天气与季节性提示',
      'en-US': 'Weather & Seasons',
      'ja-JP': '天候・季節の案内',
      'ko-KR': '날씨와 계절 안내',
    },
    detail: {
      'zh-CN': '湖山景区、湿地步道与夜间演艺对天气较为敏感，雨雾、大风或高温时请留意景区公告。',
      'en-US': 'Lake-and-hill venues, wetland trails and night shows are weather-sensitive; check site notices in rain, fog, wind or heat.',
      'ja-JP': '湖山エリア、湿地の遊歩道、夜の演出は天候に左右されます。雨霧・強風・酷暑の際は現地のお知らせをご確認ください。',
      'ko-KR': '호수·산 일대, 습지 산책로, 야간 공연은 날씨에 영향을 받습니다. 우천·안개·강풍·고온 시 현장 공지를 확인하세요.',
    },
  },
  {
    id: 'contact',
    title: {
      'zh-CN': '服务联络',
      'en-US': 'Service Contact',
      'ja-JP': 'サービス連絡',
      'ko-KR': '서비스 연락',
    },
    detail: {
      'zh-CN': '正式运营建议接入统一热线、景点分级联络与站内消息通知；当前页面结构已预留说明入口。',
      'en-US': 'A unified hotline, tiered venue contacts and in-site messaging can plug in at launch; the layout already reserves the slot.',
      'ja-JP': '本番運用では統一ホットライン、景勝地別の連絡、サイト内通知を接続できます。現状のレイアウトに案内枠を確保済みです。',
      'ko-KR': '정식 운영 시 통합 핫라인, 명소별 연락, 사이트 내 알림을 연결할 수 있도록 안내 슬롯을 마련해 두었습니다.',
    },
  },
]

export const visitGuideFaq: VisitGuideFaq[] = [
  {
    id: 'same-day',
    question: {
      'zh-CN': '当天还能购票或登记吗？',
      'en-US': 'Can I still buy a ticket or register today?',
      'ja-JP': '当日でも購入・登録できますか？',
      'ko-KR': '당일에도 구매 또는 등록할 수 있나요?',
    },
    answer: {
      'zh-CN': '部分景点支持当日购票或现场补票，免费开放点位通常可直接参观；热门演出、游船、展馆仍建议提前确认余量。',
      'en-US': 'Some venues support same-day or on-site tickets, while free open sites usually allow direct visits. Popular shows, boats and museums should still be checked in advance.',
      'ja-JP': '当日券や現地購入に対応する施設もあり、無料開放地点は通常直接訪問できます。人気公演、船便、展示館は事前に残数をご確認ください。',
      'ko-KR': '일부 명소는 당일권 또는 현장 발권이 가능하고 무료 개방 지점은 보통 바로 방문할 수 있습니다. 인기 공연, 선박, 전시관은 사전에 잔여를 확인하세요.',
    },
  },
  {
    id: 'children',
    question: {
      'zh-CN': '儿童、学生、老人需要单独选择票种吗？',
      'en-US': 'Do children, students and seniors need separate ticket types?',
      'ja-JP': '子ども・学生・高齢者は別の券種を選ぶ必要がありますか？',
      'ko-KR': '어린이·학생·노인은 별도 권종을 선택해야 하나요?',
    },
    answer: {
      'zh-CN': '如果景点提供对应票种，请按适用人群选择，并在到场时备妥可核验的身份或优惠资格材料。',
      'en-US': 'When a site offers concession types, pick the matching one and bring valid ID or eligibility proof on arrival.',
      'ja-JP': '対応する券種がある場合は該当のものをお選びいただき、現地で身分証や資格書類をご提示ください。',
      'ko-KR': '해당 권종이 있는 명소에서는 적합한 권종을 선택하고 현장에서 신분증·자격 증빙을 제시해 주세요.',
    },
  },
  {
    id: 'late',
    question: {
      'zh-CN': '错过分时时段怎么办？',
      'en-US': 'What if I miss my time slot?',
      'ja-JP': '時間帯に遅れた場合は？',
      'ko-KR': '시간대를 놓쳤을 때는?',
    },
    answer: {
      'zh-CN': '建议尽量按所选时段到场。迟到宽限、改签、补票或人工处理以各景点票务规则和现场秩序为准。',
      'en-US': 'Try to arrive within your selected slot. Grace periods, rescheduling, same-day tickets or manual handling follow venue ticketing rules and on-site flow.',
      'ja-JP': 'できる限り選択時間帯にご来場ください。遅刻猶予、変更、当日券、有人対応は各施設の規則と現地運用に準じます。',
      'ko-KR': '선택한 시간대에 도착하는 것을 권장합니다. 지각 유예, 변경, 당일권, 수기 처리는 각 명소 규정과 현장 운영을 따릅니다.',
    },
  },
  {
    id: 'multi',
    question: {
      'zh-CN': '一个人可以替多人办理吗？',
      'en-US': 'Can one person book for multiple visitors?',
      'ja-JP': '一人で複数人分の手続きはできますか？',
      'ko-KR': '한 사람이 여러 명을 처리할 수 있나요?',
    },
    answer: {
      'zh-CN': '可以，但请确保同行人信息完整且真实。部分景点会要求逐人核验，请以景点详情页展示的入园规则为准。',
      'en-US': 'Yes—just make sure all companion details are real and complete. Some sites verify visitors individually; follow the rules shown on each spot.',
      'ja-JP': '可能です。同行者の情報を正確にご記入ください。景勝地によっては個別に本人確認が必要です。詳細ページの案内に従ってください。',
      'ko-KR': '가능합니다. 동행자 정보를 정확히 입력하세요. 일부 명소는 개별 본인 확인이 필요하니 상세 페이지의 안내를 따르세요.',
    },
  },
]

export type VisitGuideTransport = {
  id: string
  title: LocalizedText
  detail: LocalizedText
  hint: LocalizedText
}

export type VisitGuideEmergency = {
  id: string
  label: LocalizedText
  number: string
  detail: LocalizedText
}

/**
 * Practical "how to actually get to Hangzhou" — drawn from public information
 * about Hangzhou Xiaoshan Airport, Hangzhou East Railway Station and the city
 * metro network. Numbers are stable but always confirm against the operator.
 */
export const visitGuideTransport: VisitGuideTransport[] = [
  {
    id: 'air',
    title: {
      'zh-CN': '航空 · 杭州萧山国际机场 (HGH)',
      'en-US': 'By Air · Hangzhou Xiaoshan International Airport (HGH)',
      'ja-JP': '空路 · 杭州蕭山国際空港 (HGH)',
      'ko-KR': '항공 · 항저우 샤오산 국제공항 (HGH)',
    },
    detail: {
      'zh-CN': '机场距市区约 27 公里，开通地铁 19 号线、机场快线大巴与出租车 / 网约车，与亚洲、欧洲及国内主要城市直飞。',
      'en-US': 'About 27 km from downtown. Metro Line 19, airport coaches and taxi / ride-hail link the airport to the city, with direct flights across Asia, Europe and major Chinese cities.',
      'ja-JP': '市街地から約 27 km。地下鉄 19 号線、空港リムジンバス、タクシー / 配車で市内へ。アジア・欧州・中国主要都市と直行便で結ばれています。',
      'ko-KR': '시내에서 약 27km. 지하철 19호선, 공항 리무진 버스, 택시 / 호출 차량으로 시내까지 연결되며 아시아·유럽·중국 주요 도시 직항편이 운항합니다.',
    },
    hint: {
      'zh-CN': '建议预留 60–90 分钟通行时间；高峰时段优先选择地铁。',
      'en-US': 'Allow 60–90 minutes for transit; prefer the metro at peak times.',
      'ja-JP': '所要 60〜90 分を見込み、混雑時は地下鉄を優先。',
      'ko-KR': '60〜90분의 이동 시간을 확보하고, 혼잡 시간에는 지하철을 권장합니다.',
    },
  },
  {
    id: 'rail',
    title: {
      'zh-CN': '高铁 · 杭州东 / 杭州 / 杭州西站',
      'en-US': 'High-speed rail · Hangzhou East / Hangzhou / Hangzhou West',
      'ja-JP': '高速鉄道 · 杭州東駅 / 杭州駅 / 杭州西駅',
      'ko-KR': '고속철도 · 항저우동·항저우·항저우서역',
    },
    detail: {
      'zh-CN': '杭州东站连通京沪、沪昆等高铁主干，至上海虹桥约 45–60 分钟、至北京约 4.5 小时。地铁 1/3/4/5/19 号线在三个主站均可换乘。',
      'en-US': 'Hangzhou East joins the Beijing-Shanghai and Shanghai-Kunming HSR corridors—Shanghai Hongqiao 45–60 min, Beijing about 4.5 h. Metro Lines 1/3/4/5/19 connect the three main stations.',
      'ja-JP': '杭州東駅は京滬・滬昆などの高速鉄道幹線が集まり、上海虹橋まで 45〜60 分、北京まで約 4.5 時間。三大駅は地下鉄 1・3・4・5・19 号線で接続。',
      'ko-KR': '항저우동역은 베이징-상하이·상하이-쿤밍 고속철도 간선이 모이는 거점입니다. 상하이훙차오까지 45〜60분, 베이징까지 약 4.5시간. 세 주요 역은 지하철 1·3·4·5·19호선으로 연결됩니다.',
    },
    hint: {
      'zh-CN': '高铁车票可在 12306 / 各 OTA 提前预订；国际旅客护照可直接取票或刷证进站。',
      'en-US': 'Buy HSR tickets via 12306 or major OTAs; international visitors can collect or scan tickets with a passport.',
      'ja-JP': '高速鉄道のきっぷは 12306 や OTA で事前購入可能。海外からの旅客はパスポートでの受取・改札利用ができます。',
      'ko-KR': '고속철도 티켓은 12306 또는 주요 OTA에서 미리 구매하세요. 해외 방문객은 여권으로 발권·개찰이 가능합니다.',
    },
  },
  {
    id: 'metro',
    title: {
      'zh-CN': '地铁 / 公交 · 城市出行',
      'en-US': 'Metro & Bus · Within the City',
      'ja-JP': '地下鉄 / バス · 市内移動',
      'ko-KR': '지하철 / 버스 · 시내 이동',
    },
    detail: {
      'zh-CN': '杭州地铁覆盖西湖、灵隐、武林、钱江新城、湖滨、奥体等核心区域；公交线路串联景点出入口与历史街区。',
      'en-US': 'Hangzhou Metro covers West Lake, Lingyin, Wulin, Qianjiang New Town, Hubin and the Olympic Sports Centre; buses connect scenic gateways and historic blocks.',
      'ja-JP': '杭州地下鉄は西湖・霊隠・武林・銭江新城・湖浜・オリンピックスポーツセンターなど主要エリアをカバー。バスは景勝地の出入口と歴史街区を結びます。',
      'ko-KR': '항저우 지하철은 시후·링인·우린·첸장신청·후빈·올림픽스포츠센터 등 주요 지역을 운행하며, 버스는 명소 출입구와 역사 거리들을 연결합니다.',
    },
    hint: {
      'zh-CN': '推荐使用支付宝 / 微信乘车码或交通卡；国际旅客可在地铁站购买单程票。',
      'en-US': 'Use the Alipay / WeChat ride code or a transit card; international visitors can buy single-trip tickets at metro stations.',
      'ja-JP': 'アリペイ / WeChat の乗車コードか交通カードが便利。海外旅客は駅で単区間券を購入できます。',
      'ko-KR': '알리페이/위챗 탑승 코드 또는 교통카드 이용을 권장합니다. 해외 방문객은 역에서 1회권을 구매할 수 있습니다.',
    },
  },
  {
    id: 'taxi',
    title: {
      'zh-CN': '出租车 / 网约车',
      'en-US': 'Taxi & Ride-hail',
      'ja-JP': 'タクシー / 配車',
      'ko-KR': '택시 / 호출 차량',
    },
    detail: {
      'zh-CN': '高德 / 滴滴等平台覆盖全市；旅客建议在机场、车站官方候车区上车。',
      'en-US': 'Amap and Didi cover the whole city; visitors should board at official taxi ranks at airports and stations.',
      'ja-JP': '高徳・滴滴などが市内をカバー。空港・駅の公式タクシー乗り場をご利用ください。',
      'ko-KR': '가오더·디디 등이 시내 전역을 운행하며, 공항·역의 공식 택시 승강장에서 승차하세요.',
    },
    hint: {
      'zh-CN': '高峰、雨天、节假日叫车难度上升，请预留时间或改乘地铁。',
      'en-US': 'Peak hours, rain and holidays make ride-hailing harder—plan extra time or switch to metro.',
      'ja-JP': '混雑時、雨天、祝休日は配車が難しくなります。余裕をもつか地下鉄をご検討ください。',
      'ko-KR': '혼잡 시간, 우천, 공휴일에는 호출이 어려울 수 있으니 여유 시간을 두거나 지하철을 이용하세요.',
    },
  },
]

/**
 * Public emergency / official-service hotlines that apply across mainland
 * China. Free-of-charge, multilingual support varies by line — kept short and
 * factual.
 */
export const visitGuideEmergency: VisitGuideEmergency[] = [
  {
    id: 'police',
    number: '110',
    label: {
      'zh-CN': '公安报警',
      'en-US': 'Police',
      'ja-JP': '警察',
      'ko-KR': '경찰',
    },
    detail: {
      'zh-CN': '盗抢、走失、打架斗殴、突发治安情况均可拨打。',
      'en-US': 'Theft, missing person, assault and any public-safety incident.',
      'ja-JP': '盗難、行方不明、暴行、公安に関する緊急時にご利用ください。',
      'ko-KR': '도난, 실종, 폭행 등 공공안전 관련 긴급 상황에서 이용하세요.',
    },
  },
  {
    id: 'ambulance',
    number: '120',
    label: {
      'zh-CN': '医疗急救',
      'en-US': 'Ambulance',
      'ja-JP': '救急',
      'ko-KR': '응급 의료',
    },
    detail: {
      'zh-CN': '突发疾病、伤情、晕厥时拨打，告知所在景区/酒店地点。',
      'en-US': 'Sudden illness, injury or fainting—report the scenic area or hotel location.',
      'ja-JP': '急病、けが、意識喪失などの際に。所在地（景勝地・ホテル）を伝えてください。',
      'ko-KR': '갑작스러운 질병, 부상, 의식 저하 시 사용하세요. 위치(명소·호텔)를 알려야 합니다.',
    },
  },
  {
    id: 'fire',
    number: '119',
    label: {
      'zh-CN': '消防 · 救援',
      'en-US': 'Fire & Rescue',
      'ja-JP': '消防・救助',
      'ko-KR': '소방·구조',
    },
    detail: {
      'zh-CN': '火警、被困、危险品事故。',
      'en-US': 'Fire, entrapment, hazardous-material incidents.',
      'ja-JP': '火災、閉じ込め、危険物事故など。',
      'ko-KR': '화재, 갇힘, 위험물 사고 등에 사용하세요.',
    },
  },
  {
    id: 'mayor',
    number: '12345',
    label: {
      'zh-CN': '杭州市民服务热线',
      'en-US': 'Hangzhou Citizen Service',
      'ja-JP': '杭州市民サービスホットライン',
      'ko-KR': '항저우 시민 서비스 콜센터',
    },
    detail: {
      'zh-CN': '城市投诉、咨询、政务事项。',
      'en-US': 'City complaints, enquiries and government services.',
      'ja-JP': '市政への苦情・問い合わせ・行政手続き。',
      'ko-KR': '시정 민원·문의·행정 서비스 안내.',
    },
  },
  {
    id: 'tourism',
    number: '12301',
    label: {
      'zh-CN': '全国旅游服务热线',
      'en-US': 'National Tourism Hotline',
      'ja-JP': '全国観光案内ホットライン',
      'ko-KR': '전국 관광 서비스 콜센터',
    },
    detail: {
      'zh-CN': '旅游咨询、投诉与跨地区服务协调。',
      'en-US': 'Travel advice, complaints and cross-region service support.',
      'ja-JP': '観光案内、苦情、地域横断のサービス調整。',
      'ko-KR': '관광 안내, 민원, 지역 간 서비스 조정.',
    },
  },
  {
    id: 'consumer',
    number: '12315',
    label: {
      'zh-CN': '消费者投诉',
      'en-US': 'Consumer Complaints',
      'ja-JP': '消費者相談',
      'ko-KR': '소비자 민원',
    },
    detail: {
      'zh-CN': '价格、质量、虚假宣传等消费者权益问题。',
      'en-US': 'Pricing, quality, false advertising and other consumer-rights issues.',
      'ja-JP': '価格、品質、誇大広告など消費者の権利に関する問題。',
      'ko-KR': '가격, 품질, 허위 광고 등 소비자 권익 문제.',
    },
  },
]
