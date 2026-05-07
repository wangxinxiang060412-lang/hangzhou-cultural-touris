import type { LocalizedText } from '../i18n/site'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export type HotelOrigin = {
  id: string
  label: LocalizedText
}

export type RouteStopPoint = {
  id: string
  label: LocalizedText
  x: number
  y: number
  spotText?: string
  note: LocalizedText
  nearby: Array<{
    name: LocalizedText
    type: LocalizedText
    distance: string
    walkMinutes: number
    spotText?: string
  }>
}

export type RoutePlan = {
  id: string
  totalDistance: string
  totalWalkMinutes: number
  mapHint: LocalizedText
  hotelAccess: Record<
    string,
    {
      metro: LocalizedText
      bus: LocalizedText
      taxi: LocalizedText
    }
  >
  legs: Array<{
    from: LocalizedText
    to: LocalizedText
    distance: string
    walkMinutes: number
    accessible: LocalizedText
  }>
  stops: RouteStopPoint[]
  accessibilityRoute: LocalizedText
  rainyAlternative: LocalizedText
}

export const routePlanningLabels = {
  sectionEyebrow: text('互动路线规划', 'Interactive Planning', 'インタラクティブ計画', '인터랙티브 일정'),
  sectionTitle: text('从酒店出发，看看附近还能玩什么', 'From Your Hotel to What Is Nearby', 'ホテルから周辺まで', '호텔에서 주변까지'),
  routeSelector: text('选择路线', 'Choose Route', 'ルート選択', '코스 선택'),
  hotelSelector: text('酒店所在区域', 'Hotel Area', 'ホテルエリア', '호텔 위치'),
  mapTitle: text('互动地图', 'Interactive Map', 'インタラクティブマップ', '인터랙티브 지도'),
  mapHint: text('点击地图点位查看附近景点与换乘建议', 'Select a map stop for nearby sights and transfer advice', '地図上の地点を選ぶと周辺情報を確認できます', '지도 지점을 선택해 주변 명소와 이동 팁을 확인하세요'),
  fromHotel: text('从酒店怎么过去', 'How to Get There', 'ホテルからの行き方', '호텔에서 가는 법'),
  metro: text('地铁建议', 'Metro', '地下鉄', '지하철'),
  bus: text('公交建议', 'Bus', 'バス', '버스'),
  taxi: text('打车建议', 'Taxi', 'タクシー', '택시'),
  walkingLegs: text('路线段距离与步行时间', 'Walking Legs', '区間距離と徒歩時間', '구간 거리와 도보 시간'),
  selectedStop: text('当前点位', 'Selected Stop', '選択地点', '선택 지점'),
  nearby: text('附近还能玩什么', 'Nearby Ideas', '周辺でできること', '근처 추천'),
  accessibleRoute: text('无障碍路线', 'Accessible Route', 'バリアフリールート', '접근성 동선'),
  rainyAlternative: text('雨天替代路线', 'Rainy-Day Alternative', '雨天代替ルート', '우천 대안 코스'),
  walkMinute: text('分钟步行', 'min walk', '分徒歩', '분 도보'),
}

export const hotelOrigins: HotelOrigin[] = [
  {
    id: 'hubin',
    label: text('湖滨 / 武林商圈酒店', 'Hubin / Wulin hotel area', '湖浜・武林エリアのホテル', '후빈 / 우린 상권 호텔'),
  },
  {
    id: 'east-station',
    label: text('杭州东站周边酒店', 'Hangzhou East Railway Station hotels', '杭州東駅周辺ホテル', '항저우동역 주변 호텔'),
  },
  {
    id: 'west-lake-cultural-square',
    label: text('西湖文化广场酒店', 'West Lake Cultural Square hotels', '西湖文化広場周辺ホテル', '서호문화광장 호텔'),
  },
  {
    id: 'airport',
    label: text('萧山机场 / 空港酒店', 'Xiaoshan Airport hotels', '蕭山空港エリアのホテル', '샤오산공항 / 공항 호텔'),
  },
]

const hubinAccess = {
  metro: text('湖滨或龙翔桥一带出发，可步行接入西湖东线，再按路线向北或向南展开。', 'From Hubin or Longxiangqiao, walk directly into the east lakeside and continue north or south.', '湖浜または龍翔橋周辺から西湖東線へ徒歩で入り、北または南へ進めます。', '후빈 또는 룽샹차오에서 서호 동선으로 바로 걸어 들어가 북쪽이나 남쪽으로 이어갈 수 있습니다.'),
  bus: text('可使用湖滨、少年宫、断桥等站点作为起终点，节假日建议少换乘。', 'Use Hubin, Children’s Palace or Broken Bridge stops as route anchors; reduce transfers on holidays.', '湖浜、少年宮、断橋などの停留所を起終点にできます。祝日は乗換を少なめに。', '후빈, 소년궁, 단교 정류장을 기점으로 쓰고 공휴일에는 환승을 줄이는 편이 좋습니다.'),
  taxi: text('打车定位建议选“湖滨步行街外围”或“断桥残雪外围”，避免直接压到景区核心。', 'Set taxi drop-off to the edge of Hubin pedestrian area or Broken Bridge rather than the crowded core.', 'タクシーは湖浜歩行街外側または断橋外側を指定し、核心混雑区を避けてください。', '택시는 후빈 보행가 외곽이나 단교 외곽으로 지정해 핵심 혼잡 구역을 피하세요.'),
}

export const routePlans: Record<string, RoutePlan> = {
  '01': {
    id: '01',
    totalDistance: '5.8 km',
    totalWalkMinutes: 95,
    mapHint: text('湖线适合把酒店放在湖滨、武林或西湖文化广场，步行和短公交组合最舒服。', 'This lake route works best from Hubin, Wulin or West Lake Cultural Square hotels using walking plus short bus hops.', '湖のルートは湖浜、武林、西湖文化広場周辺のホテルから徒歩と短距離バスを組み合わせると快適です。', '호수 코스는 후빈, 우린, 서호문화광장 호텔에서 도보와 짧은 버스를 섞는 편이 가장 편합니다.'),
    hotelAccess: {
      hubin: hubinAccess,
      'east-station': {
        metro: text('杭州东站乘地铁至龙翔桥或凤起路，再步行进入湖滨；行李多时先回酒店放置。', 'Take metro from East Railway Station to Longxiangqiao or Fengqi Road, then walk into Hubin; drop luggage first if needed.', '杭州東駅から龍翔橋または鳳起路まで地下鉄、そこから湖浜へ徒歩。荷物が多い場合は先にホテルへ。', '항저우동역에서 지하철로 룽샹차오나 펑치루까지 간 뒤 후빈으로 걸어가세요. 짐이 많으면 먼저 호텔에 두는 편이 좋습니다.'),
        bus: text('公交可到少年宫或断桥周边，但跨城段耗时较长，适合不赶时间。', 'Bus can reach Children’s Palace or Broken Bridge, but cross-city time is longer.', 'バスで少年宮や断橋周辺へ行けますが、市内横断で時間がかかります。', '버스로 소년궁이나 단교 주변까지 갈 수 있지만 도심 횡단 시간이 길어 여유 있을 때 좋습니다.'),
        taxi: text('打车约按湖滨外围落客，早晚高峰建议避开湖滨核心路段。', 'Taxi to the edge of Hubin; avoid the core lakeside roads during rush hours.', 'タクシーは湖浜外側で下車。朝夕ピークは湖浜中心道路を避けましょう。', '택시는 후빈 외곽에서 하차하고 출퇴근 시간에는 호수 핵심 도로를 피하세요.'),
      },
      'west-lake-cultural-square': {
        metro: text('可乘地铁至凤起路或龙翔桥，再步行到湖滨；也可短打车到断桥外围。', 'Take metro to Fengqi Road or Longxiangqiao, then walk to Hubin; a short taxi to Broken Bridge edge also works.', '地下鉄で鳳起路または龍翔橋へ行き湖浜へ徒歩。断橋外側まで短距離タクシーも便利です。', '지하철로 펑치루나 룽샹차오까지 간 뒤 후빈으로 걷거나, 단교 외곽까지 짧게 택시를 타도 좋습니다.'),
        bus: text('可选择少年宫、白堤、岳庙方向公交，适合从北线切入。', 'Buses toward Children’s Palace, Bai Causeway or Yue Temple work well for entering from the north.', '少年宮、白堤、岳廟方面のバスで北側から入るのが便利です。', '소년궁, 백제, 악묘 방향 버스로 북쪽에서 진입하기 좋습니다.'),
        taxi: text('短途打车建议落在少年宫或断桥外围，避开桥面与白堤入口拥堵。', 'For a short taxi ride, drop near Children’s Palace or the Broken Bridge edge, not on the bridge or Bai Causeway entrance.', '短距離タクシーは少年宮または断橋外側で降り、橋上や白堤入口の混雑を避けます。', '짧은 택시는 소년궁이나 단교 외곽에서 하차하고 다리 위와 백제 입구 혼잡을 피하세요.'),
      },
      airport: {
        metro: text('机场出发建议先到酒店放行李，再从龙翔桥或凤起路接入湖线。', 'From the airport, leave luggage at the hotel first, then enter the route from Longxiangqiao or Fengqi Road.', '空港からは先にホテルへ荷物を置き、龍翔橋または鳳起路から湖ルートへ入るのがおすすめです。', '공항에서는 먼저 호텔에 짐을 두고 룽샹차오나 펑치루에서 호수 코스를 시작하는 편이 좋습니다.'),
        bus: text('机场巴士更适合到市区酒店，不建议直接背行李进入湖边步道。', 'Airport coaches are better for reaching the hotel area; avoid taking luggage straight onto lakeside walks.', '空港バスは市内ホテルへ向かう用途が中心で、荷物を持ったまま湖畔散策へ入るのは避けましょう。', '공항버스는 시내 호텔 이동에 적합하며 짐을 들고 바로 호숫가 산책로로 들어가는 것은 피하세요.'),
        taxi: text('机场打车可直达酒店或湖滨外围；若直接游览，选择湖滨外围下车。', 'A taxi can go to your hotel or Hubin edge; if touring directly, choose an outer Hubin drop-off.', '空港タクシーはホテルまたは湖浜外側へ。直接観光するなら湖浜外側で下車してください。', '공항 택시는 호텔이나 후빈 외곽까지 가능하며, 바로 관광한다면 후빈 외곽 하차가 좋습니다.'),
      },
    },
    legs: [
      {
        from: text('断桥', 'Broken Bridge', '断橋', '단교'),
        to: text('白堤', 'Bai Causeway', '白堤', '백제'),
        distance: '0.8 km',
        walkMinutes: 12,
        accessible: text('基本平缓，旺季人流密集时轮椅需慢行。', 'Mostly flat; wheelchair users should slow down in holiday crowds.', '概ね平坦ですが、繁忙期は車いす利用でゆっくり進む必要があります。', '대체로 평탄하지만 성수기 인파 속에서는 휠체어가 천천히 이동해야 합니다.'),
      },
      {
        from: text('白堤', 'Bai Causeway', '白堤', '백제'),
        to: text('孤山', 'Solitary Hill', '孤山', '구산'),
        distance: '1.1 km',
        walkMinutes: 18,
        accessible: text('主路可达，部分临水台阶不建议轮椅进入。', 'Main route is accessible; avoid stepped waterside edges.', '主路は通行可能ですが、水辺の階段部分は避けてください。', '메인 길은 가능하지만 수변 계단 구간은 피하세요.'),
      },
      {
        from: text('孤山', 'Solitary Hill', '孤山', '구산'),
        to: text('苏堤', 'Su Causeway', '蘇堤', '쑤디'),
        distance: '2.0 km',
        walkMinutes: 34,
        accessible: text('建议老人分段休息；轮椅可改走湖滨或公交接驳。', 'Seniors should break the walk; wheelchair users may switch to Hubin or short bus transfer.', '高齢者は休憩を挟み、車いすは湖浜側や短距離バスへの切替も検討してください。', '어르신은 구간별 휴식이 좋고, 휠체어는 후빈이나 짧은 버스 환승으로 바꿀 수 있습니다.'),
      },
      {
        from: text('苏堤', 'Su Causeway', '蘇堤', '쑤디'),
        to: text('曲院风荷', 'Quyuan Lotus Garden', '曲院風荷', '취위안 풍하'),
        distance: '1.9 km',
        walkMinutes: 31,
        accessible: text('平缓但距离较长，雨天或高温建议缩短到曲院风荷一带。', 'Flat but long; in rain or heat, shorten the route around Quyuan Lotus Garden.', '平坦ですが距離があります。雨天や高温時は曲院風荷周辺に短縮しましょう。', '평탄하지만 길이가 있어 비나 더위에는 취위안풍하 주변으로 줄이는 편이 좋습니다.'),
      },
    ],
    stops: [
      {
        id: 'broken-bridge',
        label: text('断桥', 'Broken Bridge', '断橋', '단교'),
        x: 20,
        y: 30,
        spotText: '西湖',
        note: text('适合作为西湖东线起点，清晨和傍晚体验最好。', 'Best as the east-lake starting point, especially early morning or evening.', '西湖東線の起点に向き、早朝や夕方が最も快適です。', '서호 동선 시작점으로 좋고 이른 아침과 저녁이 가장 좋습니다.'),
        nearby: [
          { name: text('湖滨步行街', 'Hubin Pedestrian Street', '湖浜歩行街', '후빈 보행가'), type: text('餐饮 / 购物', 'Dining / Shopping', '飲食 / 買物', '식음 / 쇼핑'), distance: '1.1 km', walkMinutes: 16 },
          { name: text('少年宫码头', 'Children’s Palace Pier', '少年宮船着場', '소년궁 선착장'), type: text('游船', 'Boat pier', '遊船', '유람선'), distance: '0.5 km', walkMinutes: 8 },
        ],
      },
      {
        id: 'bai-causeway',
        label: text('白堤', 'Bai Causeway', '白堤', '백제'),
        x: 38,
        y: 36,
        spotText: '西湖',
        note: text('湖面开阔、拍照点密集，适合慢走但节假日拥挤。', 'Open lake views and frequent photo points; easy walking but crowded on holidays.', '湖面が開け、撮影ポイントが多いですが、祝日は混みます。', '호수 전망이 넓고 사진 포인트가 많지만 공휴일에는 붐빕니다.'),
        nearby: [
          { name: text('平湖秋月', 'Pinghu Qiuyue', '平湖秋月', '핑후추웨'), type: text('景观', 'Viewpoint', '景観', '경관'), distance: '0.4 km', walkMinutes: 6 },
          { name: text('浙江省博物馆孤山馆区', 'Zhejiang Provincial Museum Gushan Area', '浙江省博物館孤山館区', '저장성박물관 구산관구'), type: text('室内替代', 'Indoor option', '屋内候補', '실내 대안'), distance: '0.9 km', walkMinutes: 13 },
        ],
      },
      {
        id: 'su-causeway',
        label: text('苏堤', 'Su Causeway', '蘇堤', '쑤디'),
        x: 58,
        y: 58,
        spotText: '西湖',
        note: text('长线步行最有湖山感，也最需要体力和天气判断。', 'The strongest lake-and-hill walk, but it requires the most stamina and weather awareness.', '最も湖山らしい長距離散策ですが、体力と天候判断が必要です。', '호수와 산 느낌이 가장 강한 긴 산책 구간이며 체력과 날씨 판단이 필요합니다.'),
        nearby: [
          { name: text('花港观鱼', 'Viewing Fish at Flower Harbor', '花港観魚', '화강관어'), type: text('园林', 'Garden', '庭園', '정원'), distance: '0.7 km', walkMinutes: 10 },
          { name: text('雷峰塔', 'Leifeng Pagoda', '雷峰塔', '레이펑타'), type: text('登高 / 票务', 'Viewpoint / Ticketed', '展望 / チケット', '전망 / 티켓'), distance: '1.5 km', walkMinutes: 22, spotText: '雷峰塔' },
        ],
      },
      {
        id: 'quyuan',
        label: text('曲院风荷', 'Quyuan Lotus Garden', '曲院風荷', '취위안 풍하'),
        x: 72,
        y: 28,
        spotText: '西湖',
        note: text('适合作为北线收尾，可接公交或短打车回酒店。', 'A good north-side finish with bus or short taxi access back to the hotel.', '北側の終点に向き、バスや短距離タクシーでホテルへ戻れます。', '북쪽 마무리 지점으로 좋고 버스나 짧은 택시로 호텔 복귀가 쉽습니다.'),
        nearby: [
          { name: text('岳王庙', 'Yue Fei Temple', '岳王廟', '악왕묘'), type: text('历史建筑', 'Historic site', '歴史建築', '역사 건축'), distance: '0.5 km', walkMinutes: 8 },
          { name: text('郭庄', 'Guo Villa', '郭荘', '궈좡'), type: text('园林 / 票务', 'Garden / Ticketed', '庭園 / チケット', '정원 / 티켓'), distance: '1.4 km', walkMinutes: 21, spotText: '郭庄' },
        ],
      },
    ],
    accessibilityRoute: text('轮椅与婴儿车建议选择断桥至白堤短线，避开苏堤长距离段；老人可在孤山或曲院风荷分段休息。', 'Wheelchairs and strollers should use the Broken Bridge to Bai Causeway short route and avoid the long Su Causeway leg; seniors can rest at Solitary Hill or Quyuan Lotus Garden.', '車いす・ベビーカーは断橋〜白堤の短線がおすすめで、蘇堤の長距離区間は避けましょう。高齢者は孤山や曲院風荷で休憩を挟めます。', '휠체어와 유모차는 단교~백제 짧은 구간을 추천하며 쑤디 장거리 구간은 피하세요. 어르신은 구산이나 취위안풍하에서 나눠 쉬기 좋습니다.'),
    rainyAlternative: text('小雨保留断桥、白堤短线；中到大雨改为湖滨商圈、浙江省博物馆孤山馆区和茶室组合。', 'In light rain, keep Broken Bridge and Bai Causeway short; in heavier rain, switch to Hubin, the Gushan museum area and teahouses.', '小雨なら断橋・白堤の短線を残し、強い雨なら湖浜商圈、孤山の博物館、茶室へ切り替えます。', '가벼운 비에는 단교와 백제 짧은 구간을 유지하고, 큰비에는 후빈 상권, 구산 박물관, 찻집 조합으로 바꾸세요.'),
  },
  '02': {
    id: '02',
    totalDistance: '8.6 km',
    totalWalkMinutes: 138,
    mapHint: text('宋韵线不适合全程步行，建议老城街区步行 + 地铁或打车接灵隐。', 'Do not walk the full heritage route; combine old-city walking with metro or taxi access to Lingyin.', '宋韻ルートは全徒歩にせず、旧市街散策と地下鉄またはタクシーで霊隠方面へつなぐのがおすすめです。', '송풍 코스는 전 구간 도보보다 구시가지 산책 후 지하철이나 택시로 링인에 연결하는 편이 좋습니다.'),
    hotelAccess: {
      hubin: {
        metro: text('从湖滨酒店步行或短地铁至定安路，先走南宋御街；灵隐段建议打车或公交接驳。', 'From Hubin, walk or take a short metro ride to Ding’an Road for Imperial Street; use taxi or bus for Lingyin.', '湖浜から定安路へ徒歩または短距離地下鉄で入り、南宋御街を先に歩きます。霊隠はタクシーやバス接続がおすすめです。', '후빈에서는 도보나 짧은 지하철로 딩안루에 가서 남송어가를 먼저 걷고, 링인은 택시나 버스 연결을 추천합니다.'),
        bus: text('老城段公交站密集，灵隐段周末排队明显，尽量早出发。', 'Bus stops are dense in the old city; Lingyin buses queue on weekends, so start early.', '旧市街はバス停が多いですが、霊隠方面は週末待ちが出やすいため早めに。', '구시가지에는 버스 정류장이 많지만 주말 링인 방향은 대기가 있어 일찍 출발하세요.'),
        taxi: text('从南宋御街到灵隐建议错开午后高峰，定位灵隐游客中心外围。', 'For taxi from Imperial Street to Lingyin, avoid the afternoon peak and set the destination to the visitor-centre edge.', '南宋御街から霊隠へは午後ピークを避け、霊隠案内所外側を指定してください。', '남송어가에서 링인으로 갈 때는 오후 피크를 피하고 링인 안내소 외곽을 목적지로 잡으세요.'),
      },
      'east-station': {
        metro: text('杭州东站乘地铁至定安路或吴山广场，先走老城，再换乘前往灵隐。', 'Take metro to Ding’an Road or Wushan Square, walk the old city first, then transfer toward Lingyin.', '杭州東駅から定安路または呉山広場へ地下鉄、旧市街を歩いた後に霊隠方面へ接続します。', '항저우동역에서 딩안루나 우산광장까지 지하철로 간 뒤 구시가지를 걷고 링인 방향으로 이동하세요.'),
        bus: text('公交跨城耗时不稳定，适合预算优先且不赶演出的人。', 'Cross-city buses are time-variable, best for budget-first travellers without fixed show times.', '市内横断バスは時間が読みにくく、予算優先で急がない方向きです。', '도심 횡단 버스는 시간이 불안정해 예산 우선이고 급하지 않은 경우에 적합합니다.'),
        taxi: text('打车可直接到南宋御街北段；若直接去灵隐，早晚高峰请预留更多时间。', 'Taxi can go directly to north Imperial Street; if going straight to Lingyin, allow extra time in peaks.', 'タクシーで南宋御街北段へ直行できます。霊隠直行はピーク時に余裕を見てください。', '택시로 남송어가 북단까지 바로 갈 수 있습니다. 링인 직행은 피크 시간에 더 여유를 두세요.'),
      },
      'west-lake-cultural-square': {
        metro: text('地铁至定安路或吴山广场后开始老城步行，灵隐段建议公交或打车。', 'Metro to Ding’an Road or Wushan Square, then walk the old city; use bus or taxi for Lingyin.', '定安路または呉山広場まで地下鉄、旧市街を歩き、霊隠はバスまたはタクシーで接続します。', '딩안루나 우산광장까지 지하철 후 구시가지를 걷고, 링인은 버스나 택시를 이용하세요.'),
        bus: text('可从武林一带乘公交接老城，返程根据体力在灵隐或湖滨结束。', 'Use buses from Wulin into the old city; finish at Lingyin or Hubin based on energy.', '武林周辺からバスで旧市街へ。帰りは体力に応じて霊隠または湖浜で終了します。', '우린 일대에서 버스로 구시가지에 들어가고, 체력에 따라 링인이나 후빈에서 마무리하세요.'),
        taxi: text('短打车到南宋御街较稳，灵隐段如遇拥堵可改到植物园外围下车。', 'Short taxi to Imperial Street is reliable; for Lingyin congestion, drop near the Botanical Garden edge instead.', '南宋御街へ短距離タクシーが安定。霊隠混雑時は植物園外側で降りる選択もあります。', '남송어가까지 짧은 택시가 안정적이며, 링인 혼잡 시 식물원 외곽 하차도 가능합니다.'),
      },
      airport: {
        metro: text('机场抵达后建议先到市区酒店；当天若继续游览，优先南宋御街短线，不建议再上灵隐。', 'After airport arrival, go to the city hotel first; if touring the same day, keep to Imperial Street and skip Lingyin.', '空港到着日はまず市内ホテルへ。当日観光なら南宋御街短線にとどめ、霊隠は別日に。', '공항 도착 후 먼저 시내 호텔로 가고, 당일 관광은 남송어가 짧은 코스로 제한하며 링인은 다른 날이 좋습니다.'),
        bus: text('机场巴士适合到市区后再转老城，不建议直奔灵隐山路。', 'Airport coach is best for reaching the city first; avoid going straight to the Lingyin mountain area.', '空港バスは市内へ入る用途に向き、霊隠山側へ直行はおすすめしません。', '공항버스는 시내 진입에 적합하며 링인 산길로 바로 가는 것은 권장하지 않습니다.'),
        taxi: text('若时间紧，可打车到南宋御街或酒店；灵隐段建议另排半天。', 'If time is tight, taxi to Imperial Street or the hotel; reserve Lingyin for another half day.', '時間が限られる場合は南宋御街またはホテルへタクシー、霊隠は別の半日に回しましょう。', '시간이 빠듯하면 남송어가나 호텔까지 택시를 타고, 링인은 별도 반나절로 잡으세요.'),
      },
    },
    legs: [
      { from: text('南宋御街', 'Southern Song Imperial Street', '南宋御街', '남송 어가'), to: text('河坊街', 'Hefang Street', '河坊街', '허팡 거리'), distance: '0.7 km', walkMinutes: 10, accessible: text('主街平直，轮椅与婴儿车基本可行。', 'Main street is straight and generally workable for wheelchairs and strollers.', '主街はまっすぐで車いす・ベビーカーでも概ね通行可能です。', '메인 거리는 곧고 휠체어와 유모차도 대체로 가능합니다.') },
      { from: text('河坊街', 'Hefang Street', '河坊街', '허팡 거리'), to: text('鼓楼', 'Gulou', '鼓楼', '구러우'), distance: '0.6 km', walkMinutes: 9, accessible: text('人流密集时建议走主街外侧，避开窄巷。', 'Use the outer edge of the main street in crowds and avoid narrow lanes.', '混雑時は主街の外側を使い、細い路地を避けてください。', '혼잡 시 메인 거리 외측으로 걷고 좁은 골목은 피하세요.') },
      { from: text('鼓楼', 'Gulou', '鼓楼', '구러우'), to: text('灵隐游客中心', 'Lingyin Visitor Centre', '霊隠案内所', '링인 안내소'), distance: '7.3 km', walkMinutes: 119, accessible: text('不建议步行，改用公交或打车接驳。', 'Do not walk this leg; use bus or taxi.', 'この区間は徒歩非推奨。バスまたはタクシーを使いましょう。', '이 구간은 도보 비권장입니다. 버스나 택시를 이용하세요.') },
    ],
    stops: [
      { id: 'imperial-street', label: text('南宋御街', 'Southern Song Imperial Street', '南宋御街', '남송 어가'), x: 18, y: 68, spotText: '南宋御街', note: text('适合从酒店出发后的第一站，餐饮和补给最方便。', 'A strong first stop from the hotel with the easiest dining and supplies.', 'ホテルからの第一地点に向き、食事と補給が最も便利です。', '호텔 출발 후 첫 지점으로 좋고 식사와 보급이 가장 편합니다.'), nearby: [{ name: text('胡雪岩故居', 'Hu Xueyan Former Residence', '胡雪岩旧居', '후쉐옌 고거'), type: text('历史建筑 / 票务', 'Historic site / Ticketed', '歴史建築 / チケット', '역사 건축 / 티켓'), distance: '0.8 km', walkMinutes: 12, spotText: '胡雪岩故居' }, { name: text('清河坊', 'Qinghefang', '清河坊', '칭허팡'), type: text('小吃 / 购物', 'Snacks / Shopping', '軽食 / 買物', '간식 / 쇼핑'), distance: '0.4 km', walkMinutes: 6 }] },
      { id: 'hefang-street', label: text('河坊街', 'Hefang Street', '河坊街', '허팡 거리'), x: 35, y: 64, note: text('游客密度高，但雨天和夜间都有较多室内店铺可用。', 'Busy with visitors, but many indoor shops work for rain and evenings.', '観光客は多いですが、雨天や夜間でも屋内店舗が多く使えます。', '방문객이 많지만 비 오는 날과 야간에도 실내 상점이 많아 이용하기 좋습니다.'), nearby: [{ name: text('鼓楼', 'Gulou', '鼓楼', '구러우'), type: text('老城节点', 'Old-city node', '旧市街ノード', '구시가지 지점'), distance: '0.6 km', walkMinutes: 9 }, { name: text('胡庆余堂', 'Hu Qing Yu Tang', '胡慶余堂', '후칭위탕'), type: text('文化 / 室内', 'Culture / Indoor', '文化 / 屋内', '문화 / 실내'), distance: '0.3 km', walkMinutes: 5 }] },
      { id: 'gulou', label: text('鼓楼', 'Gulou', '鼓楼', '구러우'), x: 46, y: 54, note: text('老城步行段的转折点，可在这里决定继续灵隐还是转室内。', 'A decision point: continue to Lingyin or switch to indoor old-city stops.', '旧市街歩行の分岐点。霊隠へ進むか屋内へ切替えるか判断できます。', '구시가지 산책의 전환점으로 링인으로 갈지 실내 코스로 바꿀지 결정하기 좋습니다.'), nearby: [{ name: text('十五奎巷', 'Shiwukui Lane', '十五奎巷', '스우쿠이 골목'), type: text('街巷', 'Lane', '路地', '골목'), distance: '0.5 km', walkMinutes: 8 }, { name: text('城隍阁外围', 'Chenghuang Pavilion area', '城隍閣外周', '청황거 외곽'), type: text('登高 / 视野', 'Viewpoint', '展望', '전망'), distance: '1.1 km', walkMinutes: 18 }] },
      { id: 'lingyin', label: text('灵隐游客中心', 'Lingyin Visitor Centre', '霊隠案内所', '링인 안내소'), x: 78, y: 24, spotText: '灵隐飞来峰', note: text('灵隐段高差更明显，建议预约后早到，周末不要压线。', 'Lingyin has more elevation change; book ahead and arrive early on weekends.', '霊隠は高低差が大きいため、予約して週末は早めに到着しましょう。', '링인 구간은 고저차가 커서 예약 후 주말에는 일찍 도착하는 편이 좋습니다.'), nearby: [{ name: text('杭州植物园', 'Hangzhou Botanical Garden', '杭州植物園', '항저우 식물원'), type: text('自然 / 票务', 'Nature / Ticketed', '自然 / チケット', '자연 / 티켓'), distance: '2.1 km', walkMinutes: 32, spotText: '杭州植物园' }, { name: text('法云古村', 'Fayun Ancient Village', '法雲古村', '파윈 마을'), type: text('茶饮 / 街区', 'Tea / Village', '茶 / 集落', '차 / 마을'), distance: '0.9 km', walkMinutes: 15 }] },
    ],
    accessibilityRoute: text('老人和婴儿车建议只走南宋御街、河坊街、鼓楼老城段；灵隐段山路和台阶多，轮椅不建议。', 'Seniors and strollers should keep to the old-city section; Lingyin has slopes and steps and is not wheelchair-friendly.', '高齢者とベビーカーは南宋御街、河坊街、鼓楼の旧市街区間に留めるのがおすすめ。霊隠は坂と階段が多く車いすには不向きです。', '어르신과 유모차는 남송어가, 허팡제, 구러우 구시가지 구간만 추천합니다. 링인은 산길과 계단이 많아 휠체어에는 권장하지 않습니다.'),
    rainyAlternative: text('雨天保留南宋御街、河坊街、胡雪岩故居、胡庆余堂；灵隐山路如遇大雨建议取消或改期。', 'In rain, keep Imperial Street, Hefang Street, Hu Xueyan Residence and Hu Qing Yu Tang; postpone Lingyin in heavy rain.', '雨天は南宋御街、河坊街、胡雪岩旧居、胡慶余堂を残し、大雨なら霊隠は延期しましょう。', '비 오는 날에는 남송어가, 허팡제, 후쉐옌 고거, 후칭위탕을 유지하고 큰비에는 링인을 취소하거나 연기하세요.'),
  },
  '03': {
    id: '03',
    totalDistance: '4.9 km',
    totalWalkMinutes: 76,
    mapHint: text('运河线适合傍晚出发，步行 + 公交/打车回酒店，夜间氛围更好。', 'The canal route works best from late afternoon, with walking plus bus or taxi back to the hotel.', '運河ルートは夕方出発がおすすめ。徒歩とバスまたはタクシーでホテルへ戻ると快適です。', '운하 코스는 늦은 오후 출발이 좋고 도보 후 버스나 택시로 호텔에 돌아가기 편합니다.'),
    hotelAccess: {
      hubin: { ...hubinAccess, metro: text('湖滨酒店可从龙翔桥或凤起路转到运河北部，再从拱宸桥一带开始。', 'From Hubin, connect by metro via Longxiangqiao or Fengqi Road to the north canal area, then start near Gongchen Bridge.', '湖浜から龍翔橋または鳳起路経由で運河北部へ向かい、拱宸橋周辺から始めます。', '후빈에서는 룽샹차오나 펑치루를 거쳐 운하 북부로 이동한 뒤 궁천교 주변에서 시작하세요.') },
      'east-station': {
        metro: text('杭州东站出发可乘地铁接运河北部站点，再短步行到拱宸桥或桥西。', 'From East Railway Station, use metro toward the north canal area, then walk shortly to Gongchen Bridge or Qiaoxi.', '杭州東駅から地下鉄で運河北部へ、そこから拱宸橋または橋西へ短く歩きます。', '항저우동역에서 지하철로 운하 북부까지 가고, 궁천교나 차오시까지 짧게 걸으세요.'),
        bus: text('公交可直达桥西或小河直街附近，适合不赶时间的傍晚路线。', 'Buses can reach Qiaoxi or Xiaohe Street, good for an unhurried evening route.', 'バスで橋西や小河直街付近へ行け、急がない夕方ルートに合います。', '버스로 차오시나 샤오허 거리 근처까지 갈 수 있어 여유로운 저녁 코스에 좋습니다.'),
        taxi: text('打车可定位桥西历史街区外围，晚高峰尽量避开主干路。', 'Taxi to the edge of Qiaoxi Historic District and avoid main roads in the evening peak.', 'タクシーは橋西歴史街区外側を指定し、夕方ピークは幹線道路を避けます。', '택시는 차오시 역사거리 외곽으로 지정하고 저녁 피크에는 간선도로를 피하세요.'),
      },
      'west-lake-cultural-square': {
        metro: text('从西湖文化广场到运河北部距离较近，可地铁或短打车接入拱宸桥。', 'West Lake Cultural Square is close to the north canal; use metro or short taxi to Gongchen Bridge.', '西湖文化広場から運河北部は近く、地下鉄または短距離タクシーで拱宸橋へ。', '서호문화광장에서 운하 북부는 가까워 지하철이나 짧은 택시로 궁천교에 접근하세요.'),
        bus: text('公交到桥西、小河直街都较顺，适合傍晚轻装出发。', 'Buses to Qiaoxi and Xiaohe Street are straightforward, good for a light evening outing.', '橋西や小河直街へのバスが使いやすく、夕方の軽装散策に向いています。', '차오시와 샤오허 거리행 버스가 편해 저녁 가벼운 산책에 좋습니다.'),
        taxi: text('短打车到拱宸桥外侧，再沿水岸向小河直街慢走。', 'Take a short taxi to the outer Gongchen Bridge area, then walk slowly toward Xiaohe Street.', '短距離タクシーで拱宸橋外側へ行き、水辺を小河直街方面へ歩きます。', '짧은 택시로 궁천교 외곽까지 간 뒤 수변을 따라 샤오허 거리 방향으로 천천히 걸으세요.'),
      },
      airport: {
        metro: text('机场当天不建议直接走运河全线，可先到酒店，傍晚再选桥西短线。', 'From the airport, do not start the full canal route directly; check in first and do a shorter Qiaoxi loop in the evening.', '空港到着日は運河全線へ直行せず、ホテル後に夕方の橋西短線がおすすめです。', '공항 도착 당일에는 운하 전체 코스 직행보다 호텔 체크인 후 저녁 차오시 짧은 코스를 추천합니다.'),
        bus: text('机场巴士到市区后再转运河北部，行李多时不建议进入老街。', 'Use airport coach to the city first, then connect north; avoid old streets with luggage.', '空港バスで市内へ入ってから北部へ接続。荷物が多い場合は旧街へ入らない方がよいです。', '공항버스로 시내 진입 후 북부로 연결하고, 짐이 많으면 옛 거리 진입은 피하세요.'),
        taxi: text('若直达运河，建议落在桥西外围，行李寄存后再步行。', 'If taxiing straight to the canal, drop at the Qiaoxi edge and store luggage before walking.', '運河へ直行するなら橋西外側で降り、荷物を預けてから歩きましょう。', '운하로 바로 택시를 탄다면 차오시 외곽에서 내려 짐을 맡긴 뒤 걷는 편이 좋습니다.'),
      },
    },
    legs: [
      { from: text('拱宸桥', 'Gongchen Bridge', '拱宸橋', '궁천교'), to: text('桥西历史街区', 'Qiaoxi Historic District', '橋西歴史街区', '차오시 역사거리'), distance: '0.5 km', walkMinutes: 8, accessible: text('主路较平，轮椅和婴儿车基本可行。', 'Main route is flat and generally workable for wheelchairs and strollers.', '主路は平坦で、車いす・ベビーカーでも概ね通行可能です。', '메인 길은 평탄해 휠체어와 유모차도 대체로 가능합니다.') },
      { from: text('桥西历史街区', 'Qiaoxi Historic District', '橋西歴史街区', '차오시 역사거리'), to: text('小河直街', 'Xiaohe Straight Street', '小河直街', '샤오허 거리'), distance: '1.7 km', walkMinutes: 26, accessible: text('窄巷和小桥较多，轮椅建议走主街和沿河外侧。', 'Narrow lanes and small bridges appear often; wheelchair users should keep to main streets and outer riverside paths.', '細い路地や小橋が多く、車いすは主街と川沿い外側を使ってください。', '좁은 골목과 작은 다리가 많아 휠체어는 메인 거리와 강변 외측을 이용하세요.') },
      { from: text('小河直街', 'Xiaohe Straight Street', '小河直街', '샤오허 거리'), to: text('运河水岸夜景', 'Canal night waterfront', '運河夜景', '운하 야경 수변'), distance: '2.7 km', walkMinutes: 42, accessible: text('距离较长，老人建议在小河直街结束后打车返回。', 'Longer leg; seniors may finish at Xiaohe Street and take a taxi back.', '距離が長いため、高齢者は小河直街で終了しタクシーで戻るのもよいです。', '거리가 길어 어르신은 샤오허 거리에서 마무리하고 택시로 돌아가는 편이 좋습니다.') },
    ],
    stops: [
      { id: 'gongchen', label: text('拱宸桥', 'Gongchen Bridge', '拱宸橋', '궁천교'), x: 18, y: 36, spotText: '京杭大运河', note: text('运河线最清晰的地标起点，适合傍晚开始。', 'The clearest landmark start for the canal route, best in late afternoon.', '運河ルートのわかりやすい起点で、夕方開始に向いています。', '운하 코스의 가장 명확한 랜드마크 시작점으로 늦은 오후가 좋습니다.'), nearby: [{ name: text('中国京杭大运河博物馆', 'Grand Canal Museum', '京杭大運河博物館', '징항대운하박물관'), type: text('室内 / 雨天', 'Indoor / Rainy day', '屋内 / 雨天', '실내 / 우천'), distance: '0.4 km', walkMinutes: 6 }, { name: text('桥西历史街区', 'Qiaoxi Historic District', '橋西歴史街区', '차오시 역사거리'), type: text('街区 / 餐饮', 'District / Dining', '街区 / 飲食', '거리 / 식음'), distance: '0.5 km', walkMinutes: 8 }] },
      { id: 'qiaoxi', label: text('桥西历史街区', 'Qiaoxi Historic District', '橋西歴史街区', '차오시 역사거리'), x: 38, y: 42, note: text('餐饮、博物馆和老厂房密集，是雨天最稳的运河节点。', 'Dining, museums and old factories cluster here, making it the most reliable rainy-day canal node.', '飲食、博物館、旧工場が集まり、雨天でも安定した運河ノードです。', '식당, 박물관, 옛 공장이 모여 있어 비 오는 날 가장 안정적인 운하 지점입니다.'), nearby: [{ name: text('手工艺活态馆', 'Craft Living Museum', '手工芸活態館', '공예 생활관'), type: text('室内文化', 'Indoor culture', '屋内文化', '실내 문화'), distance: '0.3 km', walkMinutes: 5 }, { name: text('运河边茶馆', 'Canal teahouses', '運河沿い茶館', '운하변 찻집'), type: text('休息 / 餐饮', 'Rest / Dining', '休憩 / 飲食', '휴식 / 식음'), distance: '0.2 km', walkMinutes: 4 }] },
      { id: 'xiaohe', label: text('小河直街', 'Xiaohe Straight Street', '小河直街', '샤오허 거리'), x: 62, y: 56, spotText: '小河直街', note: text('更生活化的小尺度街区，适合慢逛但不适合拖箱。', 'A smaller lived-in district for slow wandering, not for rolling luggage.', '生活感ある小さな街区で、ゆっくり歩くのに向きますがスーツケースには不向きです。', '생활감 있는 작은 거리로 천천히 걷기에 좋지만 캐리어에는 맞지 않습니다.'), nearby: [{ name: text('大兜路历史街区', 'Dadou Road Historic District', '大兜路歴史街区', '다더우루 역사거리'), type: text('街区 / 餐饮', 'District / Dining', '街区 / 飲食', '거리 / 식음'), distance: '1.2 km', walkMinutes: 18 }, { name: text('香积寺外围', 'Xiangji Temple area', '香積寺周辺', '샹지사 외곽'), type: text('文化 / 安静', 'Culture / Quiet', '文化 / 静か', '문화 / 조용함'), distance: '1.0 km', walkMinutes: 15 }] },
      { id: 'night-waterfront', label: text('运河水岸夜景', 'Canal night waterfront', '運河夜景', '운하 야경 수변'), x: 78, y: 34, note: text('适合饭后收尾，公交或打车返回酒店更自然。', 'Best as an after-dinner finish with bus or taxi back to the hotel.', '夕食後の締めに向き、バスまたはタクシーでホテルへ戻るのが自然です。', '식사 후 마무리에 좋고 버스나 택시로 호텔 복귀가 자연스럽습니다.'), nearby: [{ name: text('胜利河美食街', 'Shengli River Food Street', '勝利河美食街', '성리허 먹거리 거리'), type: text('餐饮', 'Dining', '飲食', '식음'), distance: '1.5 km', walkMinutes: 22 }, { name: text('运河夜游码头', 'Canal night cruise pier', '運河夜遊船着場', '운하 야간 유람선 선착장'), type: text('游船', 'Boat pier', '遊船', '유람선'), distance: '0.8 km', walkMinutes: 12 }] },
    ],
    accessibilityRoute: text('轮椅和婴儿车建议以拱宸桥、桥西主街和博物馆为核心，不进入过窄巷道；老人可在小河直街结束后打车返回。', 'Wheelchairs and strollers should focus on Gongchen Bridge, Qiaoxi main streets and museums, avoiding narrow lanes; seniors can finish at Xiaohe Street and taxi back.', '車いす・ベビーカーは拱宸橋、橋西主街、博物館を中心にし、狭い路地は避けてください。高齢者は小河直街で終了しタクシー帰着もおすすめです。', '휠체어와 유모차는 궁천교, 차오시 메인 거리, 박물관 중심으로 보고 좁은 골목은 피하세요. 어르신은 샤오허 거리에서 끝내고 택시로 돌아가도 좋습니다.'),
    rainyAlternative: text('雨天把重点放在运河博物馆、桥西室内展馆和茶馆；小河直街只保留短停。', 'In rain, prioritise the Grand Canal Museum, Qiaoxi indoor exhibits and teahouses; keep Xiaohe Street as a short stop.', '雨天は運河博物館、橋西の屋内展示、茶館を中心にし、小河直街は短時間にします。', '비 오는 날에는 운하박물관, 차오시 실내 전시, 찻집을 중심으로 하고 샤오허 거리는 짧게 보세요.'),
  },
}
