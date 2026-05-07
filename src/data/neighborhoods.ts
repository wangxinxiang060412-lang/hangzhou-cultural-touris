import type { LocalizedText } from '../i18n/site'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export type NeighborhoodGuide = {
  id: string
  name: LocalizedText
  nameEn: string
  district: LocalizedText
  theme: LocalizedText
  description: LocalizedText
  moodLine: LocalizedText
  bestArrival: LocalizedText
  foodHint: LocalizedText
  walkingHint: LocalizedText
  bestFor: LocalizedText[]
  highlights: LocalizedText[]
  leadSpotId: string
  featuredSpotIds: string[]
  suggestedRouteId?: string
  suggestedPassId?: string
}

export const neighborhoods: NeighborhoodGuide[] = [
  {
    id: 'southern-song-quarter',
    name: text('上城南宋皇城遗址区', 'Southern Song Imperial Quarter', '上城・南宋皇城エリア', '상청 남송 황성 유적 구역'),
    nameEn: 'Southern Song Imperial Quarter',
    district: text('上城区', 'Shangcheng District', '上城区', '상청구'),
    theme: text('宋韵街巷与老城烟火', 'Song heritage and old-city life', '宋韻と旧市街の暮らし', '송 문화와 구시가지 일상'),
    description: text(
      '把南宋御街、河坊街、鼓楼和胡雪岩故居放在同一个阅读框里，这里不是单点景点，而是一整片适合边走边看的杭州老城。',
      'This is not a single stop but a full old-city quarter, where Imperial Street, Hefang lanes, Gulou and Hu Xueyan Residence read best together.',
      '南宋御街や河坊街、鼓楼、胡雪岩旧居をひとまとまりで歩くと、この地区の輪郭がよく見えてきます。',
      '남송어가, 허팡거리, 고루, 후쉐옌 고거를 한 구역으로 묶어 걸을 때 이 동네의 결이 가장 잘 드러납니다.',
    ),
    moodLine: text('适合把杭州的历史层次走出来。', 'The place to feel Hangzhou layer by layer.', '杭州の時間の層を歩いて感じる場所です。', '항저우의 시간층을 걸으며 느끼기 좋은 구역입니다.'),
    bestArrival: text('上午 9:30 前进街巷，午后转室内故居或茶馆。', 'Enter the lanes before 9:30 a.m., then shift indoors in the afternoon.', '午前9時半前に歩き始め、午後は屋内の旧居や茶館へ。', '오전 9시 30분 전 골목에 들어가고 오후는 실내 고택이나 찻집으로 옮기기 좋습니다.'),
    foodHint: text('更适合安排杭帮小吃、茶点和老城晚餐。', 'Best paired with local snacks, tea breaks and an old-town dinner.', '杭帮小吃や茶席、旧市街の夕食と相性が良いです。', '항방식 간식, 차, 구시가지 저녁 식사와 잘 맞습니다.'),
    walkingHint: text('街巷密度高，建议步行穿行，尽量少来回折返。', 'Walk it on foot and avoid backtracking through the dense lanes.', '路地が密なので、徒歩で抜けるのがおすすめです。', '골목 밀도가 높아 도보로 통과하듯 이동하는 편이 좋습니다.'),
    bestFor: [
      text('第一次想看杭州历史的人', 'First-time heritage visitors', '杭州の歴史を初めてたどる方', '항저우 역사를 처음 보고 싶은 사람'),
      text('拍街景、建筑细节的人', 'Street and architecture photographers', '街並みや建築の細部を撮りたい方', '거리와 건축 디테일을 찍고 싶은 사람'),
      text('希望边逛边吃的人', 'Visitors who want to snack as they go', '食べ歩きもしたい方', '걸으며 먹는 걸 좋아하는 사람'),
    ],
    highlights: [
      text('南宋御街', 'Southern Song Imperial Street', '南宋御街', '남송어가'),
      text('河坊街', 'Hefang Street', '河坊街', '허팡거리'),
      text('鼓楼周边', 'Gulou area', '鼓楼周辺', '고루 일대'),
      text('胡雪岩故居', 'Hu Xueyan Residence', '胡雪岩旧居', '후쉐옌 고거'),
    ],
    leadSpotId: 'southern-song-imperial-street',
    featuredSpotIds: ['southern-song-imperial-street', 'hu-xueyan-residence', 'lingyin-feilaifeng'],
    suggestedRouteId: '02',
    suggestedPassId: 'song-heritage-pass',
  },
  {
    id: 'canal-gongshu',
    name: text('运河拱墅段', 'Gongshu Canal Waterfront', '運河・拱墅ウォーターフロント', '운하 공수 수변 구역'),
    nameEn: 'Gongshu Canal Waterfront',
    district: text('拱墅区', 'Gongshu District', '拱墅区', '공수구'),
    theme: text('运河水岸、桥西街区与夜游', 'Canal life, heritage streets and night views', '運河の日常と夜景', '운하 일상과 야경'),
    description: text(
      '如果西湖代表杭州的风景面，运河代表的是生活面。桥、街巷、小馆子和夜间散步的节奏，在这里比单看一个景点更重要。',
      'If West Lake is Hangzhou’s scenic face, the canal is its everyday face: bridges, lanes, small eateries and evening walks matter more than any one landmark.',
      '西湖が景観の顔なら、運河は暮らしの顔です。橋や路地、小さな店、夜の散歩が主役になります。',
      '서호가 풍경의 얼굴이라면 운하는 생활의 얼굴입니다. 다리와 골목, 작은 식당, 밤 산책의 리듬이 핵심입니다.',
    ),
    moodLine: text('更适合傍晚到夜间，越晚越有城市温度。', 'Best from dusk into the evening.', '夕方から夜にかけて魅力が増します。', '해질 무렵부터 밤까지 갈수록 분위기가 살아납니다.'),
    bestArrival: text('建议 16:30 后进入，桥西黄昏最好看。', 'Arrive after 4:30 p.m. for the best dusk light around Qiaoxi.', '16時半以降に入ると黄昏の橋西がきれいです。', '오후 4시 30분 이후 들어가면 차오시의 황혼이 가장 좋습니다.'),
    foodHint: text('适合安排沿河晚餐、咖啡或夜宵。', 'Ideal for waterside dinner, coffee or a late-night snack.', '運河沿いの夕食やカフェ、夜食に向いています。', '강변 저녁 식사, 카페, 야식과 잘 맞습니다.'),
    walkingHint: text('以拱宸桥为锚点，向小河直街和桥西历史街区扩散。', 'Use Gongchen Bridge as the anchor and fan out through Xiaohe and Qiaoxi.', '拱宸橋を軸に小河直街と橋西へ広げると回りやすいです。', '궁천교를 축으로 샤오허와 차오시로 퍼져 나가듯 움직이면 좋습니다.'),
    bestFor: [
      text('想看杭州日常感的人', 'Visitors chasing everyday Hangzhou', '暮らしの杭州を見たい方', '생활감 있는 항저우를 보고 싶은 사람'),
      text('夜游用户', 'Evening visitors', '夜歩き派', '야간 여행자'),
      text('喜欢街区感和桥边拍照的人', 'People who like street scenes and bridge photos', '街並みと橋の撮影が好きな方', '거리 분위기와 다리 사진을 좋아하는 사람'),
    ],
    highlights: [
      text('拱宸桥', 'Gongchen Bridge', '拱宸橋', '궁천교'),
      text('小河直街', 'Xiaohe Straight Street', '小河直街', '샤오허 거리'),
      text('桥西历史街区', 'Qiaoxi Historic Area', '橋西歴史街区', '차오시 역사 거리'),
      text('运河夜景', 'Canal night views', '運河夜景', '운하 야경'),
    ],
    leadSpotId: 'grand-canal-hangzhou',
    featuredSpotIds: ['grand-canal-hangzhou', 'xiaohe-street'],
    suggestedRouteId: '03',
    suggestedPassId: 'canal-night-transit-pass',
  },
  {
    id: 'longjing-tea-hills',
    name: text('龙井茶山区', 'Longjing Tea Hills', '龍井茶山エリア', '룽징 차산 구역'),
    nameEn: 'Longjing Tea Hills',
    district: text('西湖区', 'Xihu District', '西湖区', '시후구'),
    theme: text('茶山、湖山转换与慢节奏停留', 'Tea hills and slower hillside pacing', '茶畑と山裾のゆるやかな時間', '차밭과 산기슭의 느린 리듬'),
    description: text(
      '这条线适合把杭州从“看湖”切换到“进山”。不追求打卡密度，而是追求茶园、山路和视野变化。',
      'This district shifts Hangzhou from lake-viewing to hillside wandering, trading checklist density for tea terraces and changing views.',
      '湖を見る杭州から山へ入る杭州へ切り替える地区です。茶畑と視界の変化を楽しむのが主角です。',
      '서호를 보는 항저우에서 산으로 들어가는 항저우로 전환되는 구역입니다. 체크리스트보다 차밭과 시야 변화가 핵심입니다.',
    ),
    moodLine: text('适合放慢步速，也适合春天重复来。', 'Built for repeat spring visits and slower pacing.', '春に何度も訪れたくなるエリアです。', '봄에 반복 방문하기 좋고 속도를 늦추기 좋은 구역입니다.'),
    bestArrival: text('晴天上午最舒服，夏季建议避开正午。', 'Sunny mornings work best; avoid summer noon heat.', '晴れた午前が快適で、夏は正午を避けたいです。', '맑은 오전이 가장 좋고 여름에는 한낮을 피하는 편이 좋습니다.'),
    foodHint: text('更适合安排茶席、农家菜和安静午餐。', 'Best paired with tea tastings and a quiet hillside lunch.', 'お茶席や山あいの昼食と相性が良いです。', '차 체험과 조용한 산기슭 점심에 잘 맞습니다.'),
    walkingHint: text('建议以植物园或灵隐片区接驳，不追求一天塞满。', 'Link it with the Botanical Garden or Lingyin zone and keep the day intentionally light.', '植物園や霊隠側とつなぎつつ、詰め込みすぎない日程が向いています。', '식물원이나 링인 구간과 연결하되 하루를 과하게 채우지 않는 편이 좋습니다.'),
    bestFor: [
      text('春季来杭游客', 'Spring visitors', '春の杭州旅行者', '봄철 방문객'),
      text('喜欢茶、山路和安静景观的人', 'People who like tea, hills and quiet views', '茶畑と静かな景色が好きな方', '차, 산길, 조용한 풍경을 좋아하는 사람'),
      text('想避开最热闹核心湖岸的人', 'Visitors who want a calmer alternative to the core lakefront', '西湖中心部を少し外したい方', '가장 붐비는 호숫가를 피하고 싶은 사람'),
    ],
    highlights: [
      text('龙井茶园沿线', 'Longjing tea terraces', '龍井茶畑', '룽징 차밭'),
      text('梅家坞方向视野', 'Meijiawu-facing viewpoints', '梅家塢方面の眺め', '메이자우 방면 전망'),
      text('植物园接驳', 'Botanical Garden link', '植物園接続', '식물원 연계'),
      text('灵隐山线接续', 'Lingyin hillside continuation', '霊隠方面への接続', '링인 산길 연계'),
    ],
    leadSpotId: 'hangzhou-botanical-garden',
    featuredSpotIds: ['hangzhou-botanical-garden', 'lingyin-feilaifeng', 'west-lake'],
    suggestedPassId: 'west-lake-day-pass',
  },
  {
    id: 'xixi-nature-belt',
    name: text('西溪亲子自然带', 'Xixi Family Nature Belt', '西溪ファミリーネイチャー帯', '시시 가족 자연 벨트'),
    nameEn: 'Xixi Family Nature Belt',
    district: text('西湖区 / 余杭区', 'Xihu / Yuhang', '西湖区 / 余杭区', '시후구 / 위항구'),
    theme: text('湿地、水网与家庭友好自然行程', 'Wetland ecology and family-friendly pacing', '湿地と家族向け自然体験', '습지와 가족 친화 자연 일정'),
    description: text(
      '适合把西溪、植物园和动物园看成一条亲子自然带，而不是分散的三张票。重点不是赶，而是体力友好、推车友好和休息点清晰。',
      'Think of Xixi, the Botanical Garden and the Zoo as one family nature belt rather than three isolated tickets.',
      '西溪と植物園、動物園を別々ではなく、家族向けの自然ベルトとして捉えると使いやすいエリアです。',
      '시시, 식물원, 동물원을 각각이 아니라 하나의 가족 자연 벨트로 보는 편이 훨씬 쓰기 좋습니다.',
    ),
    moodLine: text('比“打卡成功”更重视体力分配。', 'Designed around energy management, not checklist speed.', '制覇感よりも体力配分を優先するエリアです。', '체크리스트 속도보다 체력 배분을 중시하는 구역입니다.'),
    bestArrival: text('建议早一点入园，把午后留给休息或二选一延展。', 'Start early and leave the afternoon flexible.', '朝早めに入り、午後は柔軟に調整するのが向いています。', '아침 일찍 들어가고 오후는 유연하게 비워 두는 편이 좋습니다.'),
    foodHint: text('适合安排园区简餐或返程后再集中用餐。', 'Keep food simple inside the parks or plan a fuller meal afterwards.', '園内は軽食、しっかり食事は帰路に回すのが楽です。', '공원 안에서는 간단히 먹고 본격 식사는 돌아가는 길에 하는 편이 편합니다.'),
    walkingHint: text('优先选择平缓动线和可休息节点，雨后尤其适合。', 'Prioritise flatter paths and clear rest points, especially after rain.', '平坦な動線と休憩ポイントを優先したいです。', '평탄한 동선과 쉬는 지점을 우선하는 편이 좋습니다.'),
    bestFor: [
      text('亲子家庭', 'Families with children', '子連れファミリー', '가족 단위 방문객'),
      text('婴儿车用户', 'Stroller users', 'ベビーカー利用者', '유모차 이용자'),
      text('偏好自然、不要太赶的人', 'Visitors who prefer nature over speed', '自然中心でゆったり過ごしたい方', '자연 위주로 여유 있게 다니고 싶은 사람'),
    ],
    highlights: [
      text('西溪湿地', 'Xixi Wetland', '西溪湿地', '시시 습지'),
      text('杭州植物园', 'Botanical Garden', '杭州植物園', '항저우 식물원'),
      text('杭州动物园', 'Hangzhou Zoo', '杭州動物園', '항저우 동물원'),
      text('雨后木栈道与水网', 'Boardwalks after rain', '雨上がりの木道', '비 온 뒤 데크길과 수로'),
    ],
    leadSpotId: 'xixi-wetland',
    featuredSpotIds: ['xixi-wetland', 'hangzhou-botanical-garden', 'hangzhou-zoo'],
    suggestedPassId: 'family-nature-pass',
  },
]
