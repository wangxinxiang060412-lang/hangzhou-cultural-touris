import type { LocalizedText } from '../i18n/site'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export type AccessibilityStatus = 'recommended' | 'limited' | 'not-recommended'
export type FacilityStatus = 'available' | 'limited' | 'not-available'

export type AccessibilityGuide = {
  overview: LocalizedText
  wheelchair: AccessibilityStatus
  seniors: AccessibilityStatus
  stroller: AccessibilityStatus
  accessibleRestroom: FacilityStatus
  elevator: FacilityStatus
  ramp: FacilityStatus
  restArea: FacilityStatus
  englishGuide: FacilityStatus
  nursingRoom: FacilityStatus
}

export const accessibilityLabels = {
  sectionEyebrow: text('无障碍与照护', 'Accessibility & Family Care', 'バリアフリーとケア', '접근성 및 돌봄'),
  sectionTitle: text('出行可达性信息', 'Accessibility Guide', 'アクセス情報', '접근성 안내'),
  overviewTitle: text('整体判断', 'Overall Read', '全体判断', '전체 판단'),
  groupTitle: text('人群适配', 'Visitor Fit', '利用者との相性', '방문객 적합도'),
  facilityTitle: text('设施支持', 'On-site Support', '現地設備', '현장 지원 시설'),
  wheelchair: text('轮椅', 'Wheelchair', '車いす', '휠체어'),
  seniors: text('老人', 'Seniors', '高齢者', '어르신'),
  stroller: text('婴儿车', 'Stroller', 'ベビーカー', '유모차'),
  accessibleRestroom: text('无障碍厕所', 'Accessible Restroom', '多目的トイレ', '장애인 화장실'),
  elevator: text('电梯', 'Elevator', 'エレベーター', '엘리베이터'),
  ramp: text('坡道', 'Ramp', 'スロープ', '경사로'),
  restArea: text('休息点', 'Rest Area', '休憩ポイント', '휴식 공간'),
  englishGuide: text('英文导览', 'English Guidance', '英語案内', '영문 안내'),
  nursingRoom: text('母婴室', 'Nursing Room', '授乳室', '수유실'),
}

export const accessibilityStatusLabels: Record<AccessibilityStatus, LocalizedText> = {
  recommended: text('适合', 'Recommended', '向いている', '적합'),
  limited: text('部分适合', 'Limited', '一部対応', '부분 적합'),
  'not-recommended': text('不建议', 'Not Recommended', '非推奨', '비권장'),
}

export const facilityStatusLabels: Record<FacilityStatus, LocalizedText> = {
  available: text('有', 'Available', 'あり', '있음'),
  limited: text('部分有', 'Limited', '一部あり', '부분 있음'),
  'not-available': text('暂无', 'Not Available', '未確認 / なし', '없음'),
}

const guides: Record<string, AccessibilityGuide> = {
  'west-lake': {
    overview: text(
      '湖滨、白堤等主线较平缓，适合老人和婴儿车；若进入石桥、老码头和人流密集段，轮椅通行会受限。',
      'Hubin and Bai Causeway are relatively gentle for seniors and strollers, while stone bridges, older piers and dense crowds make wheelchair movement more limited.',
      '湖浜や白堤の主動線は比較的なだらかで、高齢者やベビーカー向きです。一方、石橋や古い船着場、人の多い区間では車いす移動がやや制限されます。',
      '후빈과 백제 메인 동선은 비교적 완만해 어르신과 유모차에 괜찮지만, 돌다리와 오래된 선착장, 혼잡 구간에서는 휠체어 이동이 제한될 수 있습니다.',
    ),
    wheelchair: 'limited',
    seniors: 'recommended',
    stroller: 'recommended',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'available',
    englishGuide: 'available',
    nursingRoom: 'limited',
  },
  'lingyin-feilaifeng': {
    overview: text(
      '山门外与游客中心区域还算好走，但飞来峰石阶、坡道和寺院周边高差较多，轮椅和婴儿车整体不友好。',
      'The visitor-centre edge is manageable, but the stone steps, slopes and elevation changes around Feilai Peak and the temple make the site difficult for wheelchairs and strollers.',
      '案内所周辺は比較的動きやすいものの、飛来峰の石段や傾斜、寺院周辺の高低差が多く、車いすやベビーカーには全体として厳しめです。',
      '안내소 주변은 그나마 이동 가능하지만, 페이라이펑 석계단과 경사, 사찰 주변 단차가 많아 휠체어와 유모차에는 전체적으로 불리합니다.',
    ),
    wheelchair: 'not-recommended',
    seniors: 'limited',
    stroller: 'not-recommended',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
  'xixi-wetland': {
    overview: text(
      '入口与主游线较开阔，适合老人和婴儿车；但园区距离长、部分桥面与乘船换乘点会让轮椅体验打折。',
      'Entrances and main routes are broad enough for seniors and strollers, though long distances, bridges and boat-transfer points reduce wheelchair convenience.',
      '入口と主動線は比較的広く、高齢者やベビーカー向きです。ただし、距離の長さや橋、乗船乗り換えが車いす利用にはやや負担です。',
      '입구와 메인 동선은 비교적 넓어 어르신과 유모차에 괜찮지만, 이동 거리가 길고 다리와 승선 환승 구간이 있어 휠체어 편의성은 다소 떨어집니다.',
    ),
    wheelchair: 'limited',
    seniors: 'recommended',
    stroller: 'recommended',
    accessibleRestroom: 'available',
    elevator: 'not-available',
    ramp: 'available',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
  'liangzhu-ancient-city': {
    overview: text(
      '遗址公园尺度大、开阔路段多，基础可达性不差，但暴晒、接驳和长距离步行会增加老人及轮椅出行负担。',
      'The open park has decent baseline accessibility, but exposure, shuttle transfers and long walking distances raise the effort for seniors and wheelchair users.',
      '開けた公園で基礎的なアクセス性は悪くありませんが、日差しやシャトル移動、長い歩行距離が高齢者や車いす利用には負担になります。',
      '넓게 열린 공원이라 기본 접근성은 나쁘지 않지만, 햇빛과 셔틀 이동, 긴 도보 거리가 어르신과 휠체어 이용자에게 부담이 됩니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'limited',
    accessibleRestroom: 'available',
    elevator: 'limited',
    ramp: 'available',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
  'grand-canal-hangzhou': {
    overview: text(
      '运河主街区和平地步道对轮椅、老人和婴儿车都相对友好，但老桥、沿河高差和分散点位仍会带来局部绕行。',
      'The canal district’s flatter streets are relatively friendly to wheelchairs, seniors and strollers, although old bridges and split-level riverside sections can still force detours.',
      '運河の主街区や平坦な遊歩道は車いす、高齢者、ベビーカーにも比較的やさしい一方、古い橋や川沿いの段差では回り道が必要になることがあります。',
      '운하 메인 거리와 평지 산책로는 휠체어, 어르신, 유모차에 비교적 친절하지만, 오래된 다리와 강변 단차 때문에 일부 우회가 필요할 수 있습니다.',
    ),
    wheelchair: 'recommended',
    seniors: 'recommended',
    stroller: 'recommended',
    accessibleRestroom: 'limited',
    elevator: 'limited',
    ramp: 'limited',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
  songcheng: {
    overview: text(
      '主题园区服务设施较完整，但高峰时排队、坡道与剧场进出节奏会让轮椅、老人和婴儿车体验更依赖工作人员协助。',
      'Service facilities are comparatively complete, but queues, slopes and theatre crowd flow mean wheelchairs, seniors and strollers benefit from staff assistance.',
      'テーマ園区として設備は比較的整っていますが、混雑時の列や傾斜、劇場の入退場は車いす・高齢者・ベビーカー利用でスタッフ補助があると安心です。',
      '테마파크형 시설이라 기본 지원은 비교적 잘 갖춰져 있지만, 혼잡 시간대 대기열과 경사, 공연장 입퇴장 흐름 때문에 휠체어·어르신·유모차는 직원 도움을 받는 편이 좋습니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'limited',
    accessibleRestroom: 'available',
    elevator: 'available',
    ramp: 'available',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'available',
  },
  'leifeng-pagoda': {
    overview: text(
      '塔外与入口段可达性尚可，但登塔体验更依赖电梯和排队秩序，老人和轮椅游客建议避开高峰时段。',
      'The outer approach is manageable, but the tower visit relies heavily on elevators and queue flow, so seniors and wheelchair users should avoid peak hours.',
      '塔の外周や入口は比較的回れますが、上層体験はエレベーターと待機列に左右されます。高齢者や車いす利用者は混雑時間帯を避けるのがおすすめです。',
      '탑 외곽과 입구 구간은 그럭저럭 이동 가능하지만, 상층 관람은 엘리베이터와 대기열 영향이 큽니다. 어르신과 휠체어 이용자는 혼잡 시간을 피하는 편이 좋습니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'limited',
    accessibleRestroom: 'available',
    elevator: 'available',
    ramp: 'limited',
    restArea: 'limited',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
  'hangzhou-botanical-garden': {
    overview: text(
      '园路自然起伏明显，老人仍可慢行，但轮椅和婴儿车会在坡路、林下小径和季节性泥地上受影响。',
      'The garden’s natural slopes still allow slow walking for many seniors, but wheelchairs and strollers are affected by inclines, forest paths and seasonal muddy ground.',
      '園路には自然な起伏があり、高齢者はゆっくりなら回れますが、車いすやベビーカーは坂道や林間小径、季節のぬかるみに影響を受けます。',
      '정원 길은 자연스러운 오르내림이 있어 어르신은 천천히 이동할 수 있지만, 휠체어와 유모차는 경사와 숲길, 계절성 흙길에 영향을 받습니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'limited',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'not-available',
  },
  'hangzhou-zoo': {
    overview: text(
      '亲子设施基础不错，但园区坡度和馆舍分布会拉长照护动线，老人、轮椅和婴儿车更适合短线分段游览。',
      'Family basics are good, but slopes and enclosure spacing stretch the care route, so seniors, wheelchairs and strollers are better served by shorter segmented visits.',
      'ファミリー向けの基本設備はありますが、傾斜や館舎の分散で介助動線は長くなります。高齢者、車いす、ベビーカーは短めの区間に分けて回る方が楽です。',
      '가족용 기본 시설은 괜찮지만, 경사와 전시관 분산 때문에 돌봄 동선이 길어집니다. 어르신, 휠체어, 유모차는 짧은 구간으로 나눠 보는 편이 좋습니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'limited',
    accessibleRestroom: 'available',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'available',
  },
  'hu-xueyan-residence': {
    overview: text(
      '老宅门槛、回廊与地面细节较多，适合慢慢看但不太适合轮椅和婴儿车，老人出行也更适合有人陪同。',
      'Historic thresholds, corridors and floor details reward slow viewing, but they are not very practical for wheelchairs or strollers, and seniors are best accompanied.',
      '旧邸らしい敷居や回廊、床面の細かな変化が多く、じっくり見るにはよい一方、車いすやベビーカーには不向きです。高齢者も付き添いがあると安心です。',
      '고택 특유의 문턱과 회랑, 바닥 단차가 많아 천천히 보기엔 좋지만 휠체어와 유모차에는 적합하지 않습니다. 어르신도 동행이 있으면 더 안전합니다.',
    ),
    wheelchair: 'not-recommended',
    seniors: 'limited',
    stroller: 'not-recommended',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'limited',
    englishGuide: 'limited',
    nursingRoom: 'not-available',
  },
  liuhetower: {
    overview: text(
      '塔区台阶和登高属性很强，轮椅与婴儿车整体不建议，老人若前往也更适合只停留在塔前及江岸平缓区域。',
      'Because of the stairs and climb-oriented layout, wheelchairs and strollers are generally not recommended, and seniors are better off staying near the forecourt and flatter river edge.',
      '塔区は階段と登高性が強く、車いすやベビーカーには全体として非推奨です。高齢者も塔前や川沿いの比較的平坦な範囲にとどめる方が安心です。',
      '탑 구역은 계단과 고도 변화가 커서 휠체어와 유모차는 전반적으로 비권장입니다. 어르신도 탑 앞과 비교적 평탄한 강변 구간 중심이 더 안전합니다.',
    ),
    wheelchair: 'not-recommended',
    seniors: 'limited',
    stroller: 'not-recommended',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'limited',
    englishGuide: 'limited',
    nursingRoom: 'not-available',
  },
  guozhuang: {
    overview: text(
      '园林尺度小但桥、石阶和转角较多，老人尚可慢行，轮椅和婴儿车会频繁遇到通过性问题。',
      'The garden is compact, but bridges, steps and turns are frequent; seniors may still move through slowly, while wheelchairs and strollers run into repeated passage constraints.',
      '庭園は小規模ですが、橋や石段、曲がりが多く、高齢者はゆっくりなら見学可能でも、車いすやベビーカーは通行面で困る場面が増えます。',
      '정원 규모는 작지만 다리와 돌계단, 굴곡이 많아 어르신은 천천히 볼 수 있어도 휠체어와 유모차는 통행 제약을 자주 만납니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'limited',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'limited',
    englishGuide: 'limited',
    nursingRoom: 'not-available',
  },
  'xiaohe-street': {
    overview: text(
      '老街主路相对平缓，老人可以慢逛，但小桥、窄巷和店铺门槛会让轮椅和婴儿车局部不便。',
      'The main old-street route is fairly gentle for seniors, though small bridges, narrow lanes and shop thresholds reduce convenience for wheelchairs and strollers.',
      '旧街の主路は比較的緩やかで高齢者には歩きやすい一方、小橋や細い路地、店先の段差は車いすやベビーカーにはやや不便です。',
      '옛 거리 메인 길은 비교적 완만해 어르신이 천천히 보기 좋지만, 작은 다리와 좁은 골목, 가게 문턱이 휠체어와 유모차에는 불편할 수 있습니다.',
    ),
    wheelchair: 'limited',
    seniors: 'recommended',
    stroller: 'limited',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'limited',
    englishGuide: 'limited',
    nursingRoom: 'not-available',
  },
  'southern-song-imperial-street': {
    overview: text(
      '街区主线较平直，适合老人和婴儿车，轮椅也能基本通行，但厕所、母婴室和英文服务更依赖具体商家与节点。',
      'The main street is relatively straight for seniors, strollers and basic wheelchair movement, though restrooms, nursing rooms and English support depend more on specific venues.',
      '主街は比較的まっすぐで、高齢者やベビーカー、車いすでも基本的に移動できますが、トイレや授乳室、英語対応は個別店舗や拠点次第です。',
      '메인 거리는 비교적 평탄하고 직선적이라 어르신, 유모차, 휠체어가 기본적으로 이동 가능하지만, 화장실과 수유실, 영문 서비스는 개별 상점과 거점에 더 의존합니다.',
    ),
    wheelchair: 'recommended',
    seniors: 'recommended',
    stroller: 'recommended',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'limited',
    restArea: 'limited',
    englishGuide: 'limited',
    nursingRoom: 'not-available',
  },
  xianghu: {
    overview: text(
      '湖岸主线开阔平缓，对老人和婴儿车较友好，轮椅也能覆盖较多区域，但分散点位仍建议围绕主服务节点行动。',
      'The main lakeside route is broad and gentle for seniors and strollers, and wheelchairs can cover a fair amount, though it is still wise to stay around the main service nodes.',
      '湖岸の主動線は広くなだらかで、高齢者やベビーカーに比較的やさしく、車いすでも多くの範囲を回れます。ただし、分散した区間ではサービス拠点周辺を中心に動くのが安心です。',
      '호숫가 메인 동선은 넓고 완만해 어르신과 유모차에 비교적 친절하고, 휠체어도 꽤 넓은 범위를 커버할 수 있습니다. 다만 분산 구간은 서비스 거점 주변 위주로 움직이는 편이 좋습니다.',
    ),
    wheelchair: 'recommended',
    seniors: 'recommended',
    stroller: 'recommended',
    accessibleRestroom: 'limited',
    elevator: 'not-available',
    ramp: 'available',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
  'qiandao-lake': {
    overview: text(
      '码头和部分游客区可以照顾老人，但乘船、登岛与长距离换乘会降低轮椅和婴儿车的整体便利性。',
      'Piers and some visitor zones can work for seniors, but boarding, island landings and longer transfers reduce overall convenience for wheelchairs and strollers.',
      '桟橋や一部の観光区間は高齢者でも対応できますが、乗船や島での上陸、長めの乗り継ぎが車いすやベビーカーの利便性を下げます。',
      '선착장과 일부 관광 구간은 어르신도 이용할 수 있지만, 승선과 섬 상륙, 긴 환승 동선 때문에 휠체어와 유모차 편의성은 떨어집니다.',
    ),
    wheelchair: 'limited',
    seniors: 'limited',
    stroller: 'not-recommended',
    accessibleRestroom: 'available',
    elevator: 'limited',
    ramp: 'limited',
    restArea: 'available',
    englishGuide: 'limited',
    nursingRoom: 'limited',
  },
}

export const getAccessibilityGuide = (spotId: string) => guides[spotId] ?? null
