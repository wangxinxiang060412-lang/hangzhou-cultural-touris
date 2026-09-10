import type { LocalizedText } from '../i18n/site'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export type CityPass = {
  id: string
  name: LocalizedText
  shortLabel: LocalizedText
  description: LocalizedText
  duration: LocalizedText
  suitableFor: LocalizedText
  transportNote: LocalizedText
  activationNote: LocalizedText
  routeNote: LocalizedText
  price: number
  marketPrice: number
  primarySpotId: string
  coverSpotId: string
  suggestedRouteId?: string
  includedSpotIds: string[]
  includedBenefits: LocalizedText[]
  serviceHighlights: LocalizedText[]
}

export const cityPasses: CityPass[] = [
  {
    id: 'west-lake-day-pass',
    name: text('西湖一日慢游', 'West Lake Slow Day Pass', '西湖スローデイパス', '서호 슬로우 데이 패스'),
    shortLabel: text('湖岸慢游套票', 'Lake Day Bundle', '湖畔周遊セット', '호숫가 데이 번들'),
    description: text(
      '把西湖核心慢行、登塔视角和园林停留打成一张更适合首次来杭游客的一日产品，减少拆单预约和路线判断成本。',
      'A one-day West Lake bundle that combines shoreline strolling, tower views and garden pauses so first-time visitors spend less time splitting reservations.',
      '西湖の散策、登塔の眺望、庭園滞在を一つにまとめた初訪問向けの一日商品です。',
      '서호 산책, 탑 전망, 정원 체류를 한 장으로 묶은 첫 방문객용 1일 상품입니다.',
    ),
    duration: text('1 日内激活', 'Activate within 1 day', '1日以内に利用開始', '1일 이내 사용 시작'),
    suitableFor: text('首次来杭、情侣、城市慢游用户', 'First-time visitors, couples, slow city travellers', '初訪問、カップル、ゆっくり巡りたい方', '첫 방문객, 커플, 느린 도시 여행자'),
    transportNote: text(
      '含湖滨至雷峰塔一线的换乘建议，适合步行 + 短公交或打车接驳。',
      'Includes transfer guidance between Hubin and Leifeng Pagoda, ideal for walking plus short bus or taxi hops.',
      '湖浜から雷峰塔までの乗継案内を含み、徒歩と短距離移動向きです。',
      '후빈부터 레이펑타까지 환승 안내를 포함하며 도보와 짧은 이동에 적합합니다.',
    ),
    activationNote: text(
      '以西湖核心时段预约为主激活点，激活后当天可使用套票内其他权益。',
      'Activate on a core West Lake entry slot, then use the remaining included benefits on the same day.',
      '西湖の主要時間枠で有効化し、当日に他の特典も利用できます。',
      '서호 핵심 시간대 예약으로 활성화한 뒤 당일 다른 혜택도 이용할 수 있습니다.',
    ),
    routeNote: text(
      '建议配合慢游路线 01，从断桥进入、苏堤收尾。',
      'Pairs best with Route 01, entering at Broken Bridge and finishing around Su Causeway.',
      'ルート01と相性が良く、断橋から入り蘇堤付近で締める流れです。',
      '루트 01과 가장 잘 맞고 단교에서 시작해 쑤디 쪽에서 마무리하기 좋습니다.',
    ),
    price: 168,
    marketPrice: 218,
    primarySpotId: 'west-lake',
    coverSpotId: 'west-lake',
    suggestedRouteId: '01',
    includedSpotIds: ['west-lake', 'leifeng-pagoda', 'guozhuang'],
    includedBenefits: [
      text('西湖核心预约时段 1 次', '1 West Lake core reservation slot', '西湖コア予約枠 1回', '서호 핵심 예약 1회'),
      text('雷峰塔登塔权益', 'Leifeng Pagoda tower entry', '雷峰塔の入場特典', '레이펑타 입장 특전'),
      text('郭庄园林入园', 'Guo Villa garden entry', '郭庄庭園入場', '궈좡 정원 입장'),
      text('西湖慢游动线建议', 'Curated slow-walk route guidance', '西湖周遊ガイド', '서호 산책 동선 가이드'),
    ],
    serviceHighlights: [
      text('比拆单购买更省心，适合把核心经典一次走顺。', 'Less fragmented than separate bookings and easier for a classic one-day visit.', '個別予約よりも手間が少なく、定番を一日で回しやすいです。', '개별 예약보다 수고가 적고 대표 코스를 하루에 정리하기 쉽습니다.'),
      text('适合作为国际游客到杭第一张票。', 'Works well as a first-ticket product for international visitors.', '海外旅行者の最初の一枚に向いています。', '국제 여행객의 첫 티켓 상품으로 적합합니다.'),
    ],
  },
  {
    id: 'song-heritage-pass',
    name: text('宋韵文化联票', 'Song Heritage Pass', '宋韻文化パス', '송 운치 문화 패스'),
    shortLabel: text('老城文化联票', 'Heritage Bundle', '旧城文化セット', '구시가지 문화 번들'),
    description: text(
      '把南宋御街、胡雪岩故居和灵隐文化段串成一条更完整的杭州历史体验，既有街区烟火也有文化深度。',
      'Connects Imperial Street, Hu Xueyan Residence and the Lingyin cultural zone into a fuller Hangzhou heritage experience.',
      '南宋御街、胡雪岩旧居、霊隠文化エリアをつないだ杭州の歴史体験商品です。',
      '남송어가, 후쉐옌 고거, 링인 문화 구간을 엮은 항저우 역사 체험 상품입니다.',
    ),
    duration: text('1 天或 2 个半天使用', 'Use in 1 day or 2 half-days', '1日または半日2回で利用', '1일 또는 반나절 2회 이용'),
    suitableFor: text('历史文化、国际游客、二刷西湖用户', 'Heritage seekers, international visitors, second-time lake visitors', '歴史文化好き、海外旅行者、西湖再訪者', '역사문화 선호층, 국제 방문객, 서호 재방문자'),
    transportNote: text(
      '适合老城步行 + 灵隐接驳，站内会同步给出公交和打车建议。',
      'Designed for old-city walking plus a transfer to Lingyin, with bus and taxi guidance built in.',
      '旧市街の徒歩と霊隠への接続向けで、バス・タクシー案内も含みます。',
      '구시가지 도보와 링인 환승을 전제로 하며 버스와 택시 안내를 함께 제공합니다.',
    ),
    activationNote: text(
      '先预约南宋御街或灵隐激活，当天内可衔接其余文化点位。',
      'Activate at Imperial Street or Lingyin, then continue through the remaining heritage stops the same day.',
      '南宋御街または霊隠で有効化し、同日に他の文化地点へつなげます。',
      '남송어가 또는 링인에서 활성화한 뒤 당일 다른 문화 지점으로 이어갈 수 있습니다.',
    ),
    routeNote: text(
      '建议配合慢游路线 02，先走老城再接灵隐。',
      'Best paired with Route 02: old city first, Lingyin after.',
      'ルート02と組み合わせ、旧市街を先に歩いてから霊隠へ向かう流れがおすすめです。',
      '루트 02와 함께 구시가지를 먼저 보고 링인으로 이어가는 구성이 좋습니다.',
    ),
    price: 198,
    marketPrice: 258,
    primarySpotId: 'southern-song-imperial-street',
    coverSpotId: 'southern-song-imperial-street',
    suggestedRouteId: '02',
    includedSpotIds: ['southern-song-imperial-street', 'hu-xueyan-residence', 'lingyin-feilaifeng'],
    includedBenefits: [
      text('南宋御街文化激活权益', 'Imperial Street activation access', '南宋御街の起点特典', '남송어가 시작 특전'),
      text('胡雪岩故居入园', 'Hu Xueyan Residence entry', '胡雪岩旧居入場', '후쉐옌 고거 입장'),
      text('灵隐文化段预约建议', 'Lingyin cultural-entry guidance', '霊隠文化区の予約案内', '링인 문화 구간 예약 안내'),
      text('老城 + 山线联动交通提示', 'Old-city and mountain transfer tips', '旧市街と山側の移動案内', '구시가지와 산쪽 이동 안내'),
    ],
    serviceHighlights: [
      text('更像完整行程而不是单点打卡。', 'Feels like a complete itinerary rather than isolated stops.', '単独スポットよりも一つの行程として機能します。', '단일 스팟이 아니라 완성된 일정처럼 작동합니다.'),
      text('对国际游客更友好，路线和交通理解成本更低。', 'Friendlier for international visitors with less route-planning overhead.', '海外旅行者にも分かりやすく、移動判断の負担が少ないです。', '국제 방문객에게 더 친절하고 이동 판단 부담이 적습니다.'),
    ],
  },
  {
    id: 'family-nature-pass',
    name: text('亲子自然票', 'Family Nature Pass', 'ファミリーネイチャーパス', '패밀리 네이처 패스'),
    shortLabel: text('亲子生态套票', 'Family Nature Bundle', '親子自然セット', '가족 자연 번들'),
    description: text(
      '把西溪湿地、植物园和动物园整合成更适合家庭用户的一张自然主题套票，决策更直接，也更容易安排半天到一天行程。',
      'Combines Xixi Wetland, the Botanical Garden and the Zoo into a family-friendly nature bundle for a half-day to full-day outing.',
      '西溪湿地、植物園、動物園をまとめた、家族向けの自然体験パスです。',
      '시시 습지, 식물원, 동물원을 묶은 가족형 자연 체험 패스입니다.',
    ),
    duration: text('1 天内使用更合适', 'Best used within 1 day', '1日利用向け', '1일 사용 권장'),
    suitableFor: text('亲子家庭、轻户外、雨停后出行', 'Families, light outdoor trips, post-rain outings', '家族連れ、軽い屋外散策', '가족 단위, 가벼운 야외 일정'),
    transportNote: text(
      '站内会优先给出婴儿车、休息点和打车衔接建议。',
      'The site prioritises stroller, rest-stop and taxi-transfer suggestions for this pass.',
      'ベビーカー、休憩地点、タクシー接続の案内を優先します。',
      '유모차, 휴식 지점, 택시 연계 안내를 우선 제공합니다.',
    ),
    activationNote: text(
      '以西溪湿地主预约激活，适合上午入园后按体力灵活延展。',
      'Activates on the Xixi reservation slot, then the family can flex the rest of the day around energy levels.',
      '西溪の予約枠で有効化し、その後は体力に合わせて調整できます。',
      '시시 예약 시간대로 활성화한 뒤 남은 일정은 체력에 맞춰 유연하게 조정할 수 있습니다.',
    ),
    routeNote: text(
      '适合作为亲子自然日，不强绑定现有慢游线，重在轻松串联。',
      'Works as a flexible family nature day rather than a strict route sequence.',
      '既存ルートよりも家族向けの柔軟な自然日程として使いやすいです。',
      '기존 루트보다 가족형 자연 일정으로 유연하게 쓰기 좋습니다.',
    ),
    price: 228,
    marketPrice: 310,
    primarySpotId: 'xixi-wetland',
    coverSpotId: 'xixi-wetland',
    includedSpotIds: ['xixi-wetland', 'hangzhou-botanical-garden', 'hangzhou-zoo'],
    includedBenefits: [
      text('西溪湿地主票权益', 'Core Xixi wetland entry', '西溪湿地入場', '시시 습지 입장'),
      text('植物园自然课堂型游览建议', 'Botanical Garden family guidance', '植物園ファミリー案内', '식물원 가족 가이드'),
      text('动物园亲子延展点位', 'Zoo extension stop for families', '動物園の延長立ち寄り', '동물원 연장 코스'),
      text('雨后替代与休息点提示', 'Wet-weather and rest-stop prompts', '雨天代替・休憩案内', '우천 대안 및 휴식 안내'),
    ],
    serviceHighlights: [
      text('减少家长在多个小票种之间反复判断。', 'Cuts down repeated decision-making across multiple small family tickets.', '複数の小さなチケット判断を減らせます。', '여러 소형 티켓 사이에서 반복 판단하는 부담을 줄입니다.'),
      text('更适合带婴儿车和需要休息节奏的游客。', 'Better suited to stroller users and slower family pacing.', 'ベビーカー利用や休憩を挟むペースに向いています。', '유모차 이용과 느린 가족 리듬에 더 잘 맞습니다.'),
    ],
  },
  {
    id: 'canal-night-transit-pass',
    name: text('运河夜游 + 交通', 'Canal Night + Transit Pass', '運河ナイト + 交通パス', '운하 야간 + 교통 패스'),
    shortLabel: text('运河夜游套票', 'Canal Night Bundle', '運河夜景セット', '운하 야경 번들'),
    description: text(
      '把桥西街区、运河夜景和返程交通建议做成一张夜间产品，解决“看完之后怎么走”的问题。',
      'A night product that bundles Qiaoxi, canal ambience and return transport guidance so visitors know how to get back after dark.',
      '橋西街区と運河夜景に帰路交通案内を加えた夜間商品です。',
      '차오시 거리와 운하 야경에 귀가 교통 안내를 묶은 야간 상품입니다.',
    ),
    duration: text('傍晚至夜间使用', 'Use from late afternoon into evening', '夕方から夜間に利用', '늦은 오후부터 야간 이용'),
    suitableFor: text('城市夜游、情侣、短停留游客', 'Evening city visitors, couples, short-stay travellers', '夜景散策、カップル、短期滞在者', '야간 시티투어, 커플, 단기 체류객'),
    transportNote: text(
      '重点提供返酒店的地铁、公交、打车建议，并标记夜间更稳的路径。',
      'Focuses on hotel return guidance by metro, bus or taxi, with the most reliable evening options highlighted.',
      'ホテルへの帰路を中心に、夜間に安定した移動方法を案内します。',
      '호텔 복귀 중심으로 야간에 안정적인 이동 수단을 안내합니다.',
    ),
    activationNote: text(
      '以运河主游览段预约激活，随后可按时间衔接夜景和周边街区。',
      'Activate on the canal visit window, then continue into the night-view sequence and surrounding streets.',
      '運河の利用枠で有効化し、その後夜景と街区へつなげます。',
      '운하 방문 시간대로 활성화한 뒤 야경과 주변 거리로 이어갈 수 있습니다.',
    ),
    routeNote: text(
      '建议配合慢游路线 03，傍晚进入桥西街区、夜间收尾返程。',
      'Pairs with Route 03: enter Qiaoxi at dusk and close the night with a clean return.',
      'ルート03と組み合わせ、夕方に橋西へ入り夜に戻る流れがきれいです。',
      '루트 03과 함께 황혼에 차오시에 들어가 밤에 깔끔하게 돌아오기 좋습니다.',
    ),
    price: 138,
    marketPrice: 186,
    primarySpotId: 'grand-canal-hangzhou',
    coverSpotId: 'grand-canal-hangzhou',
    suggestedRouteId: '03',
    includedSpotIds: ['grand-canal-hangzhou', 'xiaohe-street'],
    includedBenefits: [
      text('运河主游览时段预约', 'Main canal reservation window', '運河の主予約枠', '운하 메인 예약 시간'),
      text('桥西 / 小河直街夜游建议', 'Qiaoxi and Xiaohe evening guidance', '橋西・小河直街の夜散策案内', '차오시 / 샤오허 야간 가이드'),
      text('返酒店交通建议', 'Return-to-hotel transit suggestions', 'ホテル帰路の交通案内', '호텔 복귀 교통 안내'),
      text('停航或天气变化替代方案', 'Fallback plans for suspension or weather changes', '運休・天候変化時の代替案', '운휴·날씨 변화 대안'),
    ],
    serviceHighlights: [
      text('解决夜游场景最容易掉链子的返程问题。', 'Solves the most fragile part of evening sightseeing: getting back smoothly.', '夜間観光で弱くなりがちな帰路判断を補います。', '야간 관광에서 가장 불안한 귀가 판단을 보완합니다.'),
      text('适合只在杭州停留一晚的国际游客。', 'Especially useful for international visitors staying just one night.', '杭州一泊の旅行者にも使いやすいです。', '항저우에 하루 밤만 머무는 국제 방문객에게 특히 유용합니다.'),
    ],
  },
]
