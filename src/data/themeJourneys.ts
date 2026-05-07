import type { LocalizedText } from '../i18n/site'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export type ThemeJourneyFilter =
  | 'family'
  | 'photography'
  | 'food'
  | 'accessible'
  | 'heritage'
  | 'night'

export type ThemeJourney = {
  id: string
  title: LocalizedText
  titleEn: string
  duration: LocalizedText
  audience: LocalizedText
  summary: LocalizedText
  filters: ThemeJourneyFilter[]
  neighborhoodIds: string[]
  routeIds: string[]
  spotIds: string[]
  cityPassId?: string
  accessibilityNote: LocalizedText
  rainyPlan: LocalizedText
  dayPlans: Array<{
    label: LocalizedText
    plan: LocalizedText
  }>
}

export const themeJourneys: ThemeJourney[] = [
  {
    id: 'family-three-days',
    title: text('亲子 3 天', 'Family 3-Day Journey', '親子3日旅', '가족 3일 여정'),
    titleEn: 'Family 3-Day Journey',
    duration: text('3 天 2 夜', '3 days / 2 nights', '3日2泊', '3일 2박'),
    audience: text('带小朋友、婴儿车、希望节奏松一点的家庭', 'Families with children and stroller-friendly pacing', '子連れ・ベビーカー利用の家族向け', '아이 동반·유모차 친화 가족'),
    summary: text(
      '第一天西湖轻松入门，第二天完整给西溪湿地，第三天留给植物园或动物园，不需要每天都把体力拉满。',
      'A slower family plan: light West Lake, a full Xixi day, then the Botanical Garden or Zoo on day three.',
      '初日は西湖を軽く、2日目は西溪、3日目は植物園または動物園へ。',
      '첫날은 서호를 가볍게, 둘째 날은 시시 습지, 셋째 날은 식물원이나 동물원으로 가는 느린 가족 일정입니다.',
    ),
    filters: ['family', 'accessible'],
    neighborhoodIds: ['xixi-nature-belt'],
    routeIds: ['01'],
    spotIds: ['west-lake', 'xixi-wetland', 'hangzhou-botanical-garden', 'hangzhou-zoo'],
    cityPassId: 'family-nature-pass',
    accessibilityNote: text('优先平缓步道、婴儿车可走区域与午休点。', 'Prioritises flatter paths, stroller access and midday rest points.', '平坦な動線と休憩ポイントを優先しています。', '평탄한 동선과 휴식 지점을 우선합니다.'),
    rainyPlan: text('把第三天切换成植物园短线或城市室内场馆。', 'Switch day three to a shorter garden loop or indoor city stop if needed.', '3日目は短い園路や屋内施設へ切り替え可能です。', '셋째 날을 짧은 정원 코스나 실내 시설로 전환할 수 있습니다.'),
    dayPlans: [
      {
        label: text('Day 1', 'Day 1', 'Day 1', 'Day 1'),
        plan: text('西湖核心湖岸 + 雷峰塔，傍晚早一点收。', 'Core West Lake shoreline and Leifeng Pagoda, ending early.', '西湖湖岸と雷峰塔を見て早めに締めます。', '서호 핵심 호숫가와 레이펑타를 본 뒤 조금 일찍 마칩니다.'),
      },
      {
        label: text('Day 2', 'Day 2', 'Day 2', 'Day 2'),
        plan: text('西溪湿地为主，午后只留一段轻松延展。', 'Give the day mostly to Xixi Wetland.', '2日目は西溪湿地を主役に。', '둘째 날은 시시 습지를 중심으로 둡니다.'),
      },
      {
        label: text('Day 3', 'Day 3', 'Day 3', 'Day 3'),
        plan: text('植物园 / 动物园二选一，按照体力决定。', 'Choose between the Botanical Garden or Zoo based on energy.', '植物園か動物園を体力で選びます。', '식물원과 동물원 중 체력에 맞게 선택합니다.'),
      },
    ],
  },
  {
    id: 'photography-hangzhou',
    title: text('摄影爱好者', 'Photography Journey', '写真好きの旅程', '사진 애호가 코스'),
    titleEn: 'Photography Journey',
    duration: text('2 天', '2 days', '2日', '2일'),
    audience: text('想拍晨雾、桥、街巷和夜景的人', 'Visitors chasing morning light, bridges, lanes and night scenes', '朝の光や橋、路地、夜景を撮りたい方', '아침빛, 다리, 골목, 야경을 찍고 싶은 사람'),
    summary: text(
      '第一天给西湖晨间和南线逆光，第二天给运河黄昏与夜色，让杭州从风景照延伸到城市照。',
      'Day one captures West Lake light; day two moves to canal dusk and city night scenes.',
      '1日目は西湖、2日目は運河の黄昏と夜景へ。', 
      '첫째 날은 서호의 빛, 둘째 날은 운하의 황혼과 야경으로 이어갑니다.',
    ),
    filters: ['photography', 'night'],
    neighborhoodIds: ['canal-gongshu', 'longjing-tea-hills'],
    routeIds: ['01', '03'],
    spotIds: ['west-lake', 'leifeng-pagoda', 'grand-canal-hangzhou', 'xiaohe-street'],
    cityPassId: 'canal-night-transit-pass',
    accessibilityNote: text('部分最佳机位在桥面或坡道，建议轻装。', 'Some best viewpoints sit on bridges or gentle slopes, so travel light.', '橋や坂の撮影ポイントがあるため軽装向きです。', '다리와 완만한 경사 포인트가 있어 가볍게 움직이는 편이 좋습니다.'),
    rainyPlan: text('雨天可保留运河夜景，白天切成老城屋檐与室内场馆。', 'Keep canal night shots and pivot daytime to arcades and interiors in rain.', '雨なら昼を屋内や軒下に寄せ、夜の運河を残せます。', '비가 오면 낮은 실내·처마 아래로 돌리고 밤 운하는 유지할 수 있습니다.'),
    dayPlans: [
      {
        label: text('Day 1', 'Day 1', 'Day 1', 'Day 1'),
        plan: text('断桥晨光、白堤、雷峰塔高点，傍晚收南山路。', 'Broken Bridge morning light, Bai Causeway, Leifeng Pagoda and Nanshan Road.', '断橋の朝光、白堤、雷峰塔から南山路へ。', '단교의 아침빛, 바이디, 레이펑타, 남산로로 이어갑니다.'),
      },
      {
        label: text('Day 2', 'Day 2', 'Day 2', 'Day 2'),
        plan: text('运河沿线从拱宸桥进，小河直街收夜色。', 'Start at Gongchen Bridge and finish with Xiaohe after dark.', '拱宸橋から入り、小河直街の夜で締めます。', '궁천교에서 시작해 샤오허 거리의 밤으로 마칩니다.'),
      },
    ],
  },
  {
    id: 'foodie-old-town-canal',
    title: text('美食打卡', 'Foodie Hangzhou', '食で巡る杭州', '미식 항저우'),
    titleEn: 'Foodie Hangzhou',
    duration: text('2 天', '2 days', '2日', '2일'),
    audience: text('想把老城、茶点、运河晚餐串起来的人', 'Visitors building days around snacks, tea and dinner scenes', '食べ歩きやお茶、夜の食事を重視する方', '간식, 차, 저녁 식사를 중심으로 일정을 짜는 사람'),
    summary: text(
      '白天走南宋御街与河坊街，晚上转运河；风景只是配角，重点是在哪一段停下来吃。',
      'Old-town snacking by day, canal-side dinner by night.',
      '昼は南宋御街、夜は運河へ。食の止まりどころが主役です。',
      '낮에는 남송어가, 밤에는 운하로 넘어가며 어디서 멈춰 먹을지가 핵심인 일정입니다.',
    ),
    filters: ['food', 'heritage', 'night'],
    neighborhoodIds: ['southern-song-quarter', 'canal-gongshu'],
    routeIds: ['02', '03'],
    spotIds: ['southern-song-imperial-street', 'hu-xueyan-residence', 'grand-canal-hangzhou', 'xiaohe-street'],
    cityPassId: 'song-heritage-pass',
    accessibilityNote: text('以街巷慢行为主，座位高峰期建议提前留出排队时间。', 'Mostly gentle walking, but popular meal times need queue margin.', '歩きやすい一方、食事は待ち時間を見込むと安心です。', '골목 도보 중심이지만 인기 식사 시간은 대기 시간을 잡아두는 편이 좋습니다.'),
    rainyPlan: text('雨天更适合做这条线，老城屋檐和茶馆能承接停留。', 'This route actually works well in light rain thanks to arcades and tea houses.', '小雨ならむしろ成立しやすい線です。', '가벼운 비에는 오히려 더 잘 맞는 코스입니다.'),
    dayPlans: [
      {
        label: text('Day 1', 'Day 1', 'Day 1', 'Day 1'),
        plan: text('南宋御街午前 + 河坊街午餐 + 胡雪岩故居收束。', 'Imperial Street morning, Hefang lunch, Hu Xueyan Residence later.', '南宋御街から河坊街の昼食、胡雪岩旧居へ。', '남송어가 오전, 허팡거리 점심, 후쉐옌 고거로 이어갑니다.'),
      },
      {
        label: text('Day 2', 'Day 2', 'Day 2', 'Day 2'),
        plan: text('运河下午慢走，桥西或小河直街安排晚餐。', 'Canal walk in the afternoon, dinner in Qiaoxi or Xiaohe.', '午後は運河を歩き、夜は橋西や小河へ。', '오후에는 운하를 걷고 저녁은 차오시나 샤오허에서 먹습니다.'),
      },
    ],
  },
  {
    id: 'accessible-easy-hangzhou',
    title: text('无障碍出游', 'Accessible Hangzhou', 'バリアフリー杭州', '무장애 항저우'),
    titleEn: 'Accessible Hangzhou',
    duration: text('1 - 2 天', '1-2 days', '1 - 2日', '1~2일'),
    audience: text('轮椅、老人、步行能力有限的游客', 'Wheelchair users, seniors and lower-mobility visitors', '車椅子利用者、高齢者、歩行負担を抑えたい方', '휠체어 이용자, 노년층, 보행 부담을 줄이고 싶은 사람'),
    summary: text(
      '把坡度、休息点、卫生间和接驳放在第一位，优先选择湖岸平缓区、植物园与可控节奏的点位。',
      'Designed around slope, rest points, toilets and predictable transfers first.',
      '勾配や休憩、トイレ、乗継を最優先に組み立てた線です。',
      '경사, 휴식 지점, 화장실, 환승을 최우선으로 둔 동선입니다.',
    ),
    filters: ['accessible', 'family'],
    neighborhoodIds: ['xixi-nature-belt'],
    routeIds: ['01'],
    spotIds: ['west-lake', 'hangzhou-botanical-garden', 'xixi-wetland'],
    cityPassId: 'family-nature-pass',
    accessibilityNote: text('避开长台阶和连续陡坡，优先有接驳和休息设施的区域。', 'Avoids long stairs and steeper climbs in favour of smoother routes.', '長い階段や急坂を避けています。', '긴 계단과 급경사를 피하는 구성입니다.'),
    rainyPlan: text('雨天优先植物园短线或直接改室内行程，避免湿滑木栈道。', 'Use shorter garden loops or indoor backups in rain.', '雨天は短い園路か屋内代替へ。', '비 오는 날은 짧은 정원 코스나 실내 대안으로 전환합니다.'),
    dayPlans: [
      {
        label: text('Option A', 'Option A', 'Option A', 'Option A'),
        plan: text('西湖北线平缓湖岸 + 就近休息点。', 'Gentler north-shore West Lake with nearby rest stops.', '西湖北線の平坦な湖岸を中心に。', '서호 북선의 평탄한 호숫가를 중심으로 움직입니다.'),
      },
      {
        label: text('Option B', 'Option B', 'Option B', 'Option B'),
        plan: text('植物园低强度漫步 + 简单茶歇。', 'Low-intensity Botanical Garden loop and tea break.', '植物園の低負荷散歩と休憩。', '식물원의 저강도 산책과 휴식입니다.'),
      },
    ],
  },
  {
    id: 'song-culture-two-days',
    title: text('宋韵文化 2 天', 'Song Culture in 2 Days', '宋韻文化2日旅', '송 문화 2일 코스'),
    titleEn: 'Song Culture in 2 Days',
    duration: text('2 天', '2 days', '2日', '2일'),
    audience: text('不想只看西湖，希望读懂杭州文化背景的人', 'Visitors who want depth beyond the lakefront', '西湖以外の文化背景も知りたい方', '서호 너머의 문화 맥락을 보고 싶은 사람'),
    summary: text(
      '第一天老城街巷，第二天灵隐山线，把杭州的历史、宗教和生活面拼成一段更完整的宋韵旅程。',
      'Old-city lanes first, Lingyin hillside second: a fuller Song-culture sequence.',
      '旧市街と霊隠山線を二日でつなぐ宋韻ルートです。',
      '구시가지와 링인 산길을 이틀에 연결하는 송 문화 루트입니다.',
    ),
    filters: ['heritage', 'food'],
    neighborhoodIds: ['southern-song-quarter', 'longjing-tea-hills'],
    routeIds: ['02'],
    spotIds: ['southern-song-imperial-street', 'hu-xueyan-residence', 'lingyin-feilaifeng'],
    cityPassId: 'song-heritage-pass',
    accessibilityNote: text('第二天山线步行较多，可根据体力缩短灵隐周边停留。', 'Day two involves more walking and can be shortened around Lingyin.', '2日目は歩行量が増えるため調整可能です。', '둘째 날은 걷는 양이 늘어나므로 유연하게 줄일 수 있습니다.'),
    rainyPlan: text('把第一天做长，第二天优先寺院与茶馆等室内外混合空间。', 'Lengthen day one and keep day two mixed indoor-outdoor if rain arrives.', '雨天は1日目を厚くし、2日目は屋内外混成で。', '비가 오면 첫째 날 비중을 늘리고 둘째 날은 실내외 혼합으로 갑니다.'),
    dayPlans: [
      {
        label: text('Day 1', 'Day 1', 'Day 1', 'Day 1'),
        plan: text('南宋御街、河坊街、鼓楼、胡雪岩故居。', 'Imperial Street, Hefang, Gulou and Hu Xueyan Residence.', '南宋御街、河坊街、鼓楼、胡雪岩旧居。', '남송어가, 허팡거리, 고루, 후쉐옌 고거.'),
      },
      {
        label: text('Day 2', 'Day 2', 'Day 2', 'Day 2'),
        plan: text('灵隐飞来峰为主，接茶山或植物园轻收。', 'Lingyin and Feilai Peak, then a softer tea-hill or garden finish.', '霊隠飛来峰を主に、後半は茶山や植物園へ。', '링인·비래봉을 중심으로 보고 뒤는 차산이나 식물원으로 부드럽게 마칩니다.'),
      },
    ],
  },
]
