import { pickLocalized, pickLocalizedList, t } from '../i18n/site'
import type { LocalizedList, LocalizedText } from '../i18n/site'

type SpotLike = {
  id: string
  nameZh: string
  nameEn: string
  area: string
  category: string
  description: string
  address: string
  openingHours: string
  tags: string[]
}

type TicketLike = {
  id?: string
  name: string
  description: string
  availableFor: string
}

type OrderStatus = '待出行' | '已完成' | '已取消'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const list = (zh: string[], en: string[], ja: string[], ko: string[]): LocalizedList => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const spotNames: Record<string, LocalizedText> = {
  'west-lake': text('西湖风景名胜区', 'West Lake Scenic Area', '西湖風景名勝区', '시후 풍경명승구'),
  'lingyin-feilaifeng': text('灵隐飞来峰', 'Lingyin Feilai Peak', '霊隠飛来峰', '링인 페이라이펑'),
  'xixi-wetland': text('西溪国家湿地公园', 'Xixi National Wetland Park', '西渓国家湿地公園', '시시 국가습지공원'),
  'liangzhu-ancient-city': text('良渚古城遗址公园', 'Liangzhu Ancient City Ruins Park', '良渚古城遺跡公園', '량주 고성 유적공원'),
  'grand-canal-hangzhou': text('京杭大运河杭州段', 'Grand Canal Hangzhou Section', '京杭大運河杭州区間', '징항 대운하 항저우 구간'),
  songcheng: text('宋城', 'Songcheng', '宋城', '송성'),
  'leifeng-pagoda': text('雷峰塔', 'Leifeng Pagoda', '雷峰塔', '레이펑타'),
  'hangzhou-botanical-garden': text('杭州植物园', 'Hangzhou Botanical Garden', '杭州植物園', '항저우 식물원'),
  'hangzhou-zoo': text('杭州动物园', 'Hangzhou Zoo', '杭州動物園', '항저우 동물원'),
  'hu-xueyan-residence': text('胡雪岩故居', 'Hu Xueyan Former Residence', '胡雪岩旧居', '후쉐옌 고거'),
  liuhetower: text('六和塔', 'Liuhe Pagoda', '六和塔', '육화탑'),
  guozhuang: text('郭庄', 'Guo Villa', '郭荘', '궈좡'),
  'xiaohe-street': text('小河直街', 'Xiaohe Straight Street', '小河直街', '샤오허 거리'),
  'southern-song-imperial-street': text('南宋御街', 'Southern Song Imperial Street', '南宋御街', '남송 어가'),
  xianghu: text('湘湖', 'Xianghu Lake', '湘湖', '샹후'),
  'qiandao-lake': text('千岛湖', 'Qiandao Lake', '千島湖', '첸다오후'),
}

const spotDescriptions: Record<string, LocalizedText> = {
  'west-lake': text(
    '杭州旅行的起点。湖面、堤桥、群山与城市日常在这里安静相遇。',
    'The starting point of a Hangzhou journey, where lake, causeways, hills and daily city life quietly meet.',
    '杭州の旅の起点。湖面、堤、山々、街の日常が静かに交わります。',
    '항저우 여행의 출발점입니다. 호수와 제방, 산과 도시의 일상이 조용히 만납니다.',
  ),
  'lingyin-feilaifeng': text(
    '飞来峰石刻、山林与灵隐片区共同构成杭州最具代表性的宋韵文化界面。',
    'Feilai Peak’s cliff carvings, woods and the Lingyin area form one of Hangzhou’s signature Song-heritage landscapes.',
    '飛来峰の石刻、山林、霊隠エリアが、杭州を代表する宋韻文化の景観をつくります。',
    '페이라이펑 석각과 숲, 링인 일대가 항저우를 대표하는 송풍 문화 경관을 이룹니다.',
  ),
  'xixi-wetland': text(
    '水网、芦荡、村落与候鸟，把杭州的另一面写得更缓慢。',
    'Waterways, reeds, villages and birds reveal a slower side of Hangzhou.',
    '水路、葦原、村落、渡り鳥が、杭州のもう一つのゆるやかな表情を見せます。',
    '물길과 갈대, 마을과 철새가 항저우의 더 느린 면을 보여 줍니다.',
  ),
  'liangzhu-ancient-city': text(
    '在开阔的遗址公园中，阅读五千年文明留给杭州的时间厚度。',
    'Read five thousand years of civilisation across this open archaeological park.',
    '広い遺跡公園で、五千年の文明が杭州に残した時間の厚みを読みます。',
    '넓은 유적공원에서 오천 년 문명이 남긴 시간의 깊이를 만납니다.',
  ),
  'grand-canal-hangzhou': text(
    '桥、船、街巷与生活水岸，保留着杭州日常流动的声音。',
    'Bridges, boats, lanes and waterside life preserve the everyday sound of Hangzhou.',
    '橋、舟、路地、水辺の暮らしが、杭州の日常の流れを残しています。',
    '다리와 배, 골목과 수변 생활이 항저우 일상의 흐름을 간직합니다.',
  ),
  songcheng: text(
    '以宋韵、街市与演艺组织起一段更具舞台感的杭州夜游体验。',
    'A theatrical Hangzhou night experience built from Song-style streets and performances.',
    '宋韻、街市、演藝によって、舞台感のある杭州の夜を体験できます。',
    '송풍 거리와 공연으로 무대감 있는 항저우의 밤을 경험합니다.',
  ),
  'leifeng-pagoda': text(
    '从南山路边登高望湖，让传说、塔影与西湖天光重叠。',
    'Climb above Nanshan Road to see legend, tower shadow and West Lake light overlap.',
    '南山路のそばから湖を望み、伝説、塔影、西湖の光が重なります。',
    '난산로 옆에서 올라 호수를 바라보며 전설과 탑 그림자, 시후의 빛을 만납니다.',
  ),
  'hangzhou-botanical-garden': text(
    '在植物、溪谷和山脚之间，把城市旅行调成更低的音量。',
    'Among plants, gullies and foothills, city travel drops into a softer register.',
    '植物、渓谷、山麓のあいだで、街の旅が静かな音量になります。',
    '식물과 계곡, 산기슭 사이에서 도시 여행의 소리가 낮아집니다.',
  ),
  'hangzhou-zoo': text(
    '南山脚下的亲子自然目的地，保留着杭州人的童年记忆。',
    'A family nature destination below Nanshan, carrying many local childhood memories.',
    '南山のふもとにある家族向けの自然スポット。杭州の人々の幼い記憶を残します。',
    '난산 아래의 가족 자연 여행지로, 항저우 사람들의 어린 시절 기억을 품고 있습니다.',
  ),
  'hu-xueyan-residence': text(
    '深宅、园林与木作细节，收纳了晚清杭州的富丽与秩序。',
    'Courtyards, gardens and woodwork preserve the richness and order of late Qing Hangzhou.',
    '深い邸宅、庭園、木工の細部に、清末杭州の華やかさと秩序が宿ります。',
    '깊은 저택과 정원, 목조 세부가 청말 항저우의 화려함과 질서를 담습니다.',
  ),
  liuhetower: text(
    '在钱塘江边看塔与江潮，感受杭州由湖走向江的开阔。',
    'By the Qiantang River, tower and tide open Hangzhou from lake to river.',
    '銭塘江のほとりで塔と潮を眺め、湖から川へ広がる杭州を感じます。',
    '첸탕장 곁에서 탑과 조수를 보며 호수에서 강으로 넓어지는 항저우를 느낍니다.',
  ),
  guozhuang: text(
    '一座临湖园林，以更小的尺度观看西湖、花木与亭台。',
    'A lakeside garden for viewing West Lake, flowers and pavilions at a smaller scale.',
    '湖畔の庭園で、西湖、花木、亭台を小さな尺度で眺めます。',
    '호숫가 정원에서 시후와 꽃나무, 정자를 더 작은 규모로 바라봅니다.',
  ),
  'xiaohe-street': text(
    '白墙、木窗与运河支流，让杭州的烟火气保留在窄街水岸。',
    'White walls, timber windows and canal branches keep daily life along narrow lanes.',
    '白壁、木窓、運河の支流が、細い街路の水辺に暮らしを残します。',
    '흰 벽과 나무 창, 운하 지류가 좁은 수변 골목의 일상을 간직합니다.',
  ),
  'southern-song-imperial-street': text(
    '从街巷肌理里看南宋临安的历史层次与当代生活。',
    'Read the layers of Southern Song Lin’an and modern life in the street fabric.',
    '街路の肌理から、南宋臨安の歴史層と現代の暮らしを見ます。',
    '거리의 결 속에서 남송 임안의 역사 층과 현대 생활을 읽습니다.',
  ),
  xianghu: text(
    '比西湖更开阔安静的水面，适合把旅行节奏放得更慢。',
    'A broader, quieter lake surface that invites an even slower travel rhythm.',
    '西湖より広く静かな水面。旅のリズムをさらにゆっくりにできます。',
    '시후보다 넓고 조용한 수면으로, 여행의 속도를 더 늦추기 좋습니다.',
  ),
  'qiandao-lake': text(
    '从城市向西南抵达更大的水面，在群岛之间展开杭州的远行面。',
    'Head southwest to a wider water world, where Hangzhou opens into an island journey.',
    '街から南西へ、大きな水面へ。群島のあいだに杭州の遠い旅が開きます。',
    '도시에서 남서쪽의 더 큰 수면으로 이동해 섬들 사이에서 항저우의 먼 여행을 펼칩니다.',
  ),
}

const spotTags: Record<string, LocalizedList> = {
  'west-lake': list(['湖山', '世界遗产', '慢行'], ['Lake', 'World Heritage', 'Slow Walk'], ['湖山', '世界遺産', '散策'], ['호수와 산', '세계유산', '느린 산책']),
  'lingyin-feilaifeng': list(['山林', '石刻', '寺院'], ['Woods', 'Cliff Carvings', 'Temple'], ['山林', '石刻', '寺院'], ['산림', '석각', '사찰']),
  'xixi-wetland': list(['湿地', '生态', '舟行'], ['Wetland', 'Ecology', 'Boating'], ['湿地', '生態', '舟行'], ['습지', '생태', '뱃길']),
  'liangzhu-ancient-city': list(['良渚', '遗址', '文明'], ['Liangzhu', 'Ruins', 'Civilisation'], ['良渚', '遺跡', '文明'], ['량주', '유적', '문명']),
  'grand-canal-hangzhou': list(['运河', '水岸', '街区'], ['Canal', 'Waterfront', 'Historic Blocks'], ['運河', '水辺', '街区'], ['운하', '수변', '거리']),
  songcheng: list(['宋韵', '演艺', '夜游'], ['Song Style', 'Performance', 'Night Visit'], ['宋韻', '演藝', '夜の旅'], ['송풍', '공연', '야간 관광']),
  'leifeng-pagoda': list(['登高', '塔影', '传说'], ['Viewpoint', 'Pagoda', 'Legend'], ['登高', '塔影', '伝説'], ['전망', '탑 그림자', '전설']),
  'hangzhou-botanical-garden': list(['植物', '山脚', '园林'], ['Plants', 'Foothills', 'Garden'], ['植物', '山麓', '庭園'], ['식물', '산기슭', '정원']),
  'hangzhou-zoo': list(['亲子', '自然', '城市记忆'], ['Family', 'Nature', 'City Memory'], ['家族', '自然', '街の記憶'], ['가족', '자연', '도시 기억']),
  'hu-xueyan-residence': list(['故居', '园林', '建筑'], ['Residence', 'Garden', 'Architecture'], ['旧居', '庭園', '建築'], ['고거', '정원', '건축']),
  liuhetower: list(['钱塘江', '塔', '登高'], ['Qiantang River', 'Pagoda', 'Viewpoint'], ['銭塘江', '塔', '登高'], ['첸탕장', '탑', '전망']),
  guozhuang: list(['园林', '临湖', '小景'], ['Garden', 'Lakeside', 'Intimate View'], ['庭園', '湖畔', '小景'], ['정원', '호숫가', '작은 풍경']),
  'xiaohe-street': list(['街区', '运河', '日常'], ['Historic Blocks', 'Canal', 'Daily Life'], ['街区', '運河', '日常'], ['거리', '운하', '일상']),
  'southern-song-imperial-street': list(['宋韵', '街区', '历史'], ['Song Style', 'Historic Blocks', 'History'], ['宋韻', '街区', '歴史'], ['송풍', '거리', '역사']),
  xianghu: list(['湖泊', '慢行', '亲水'], ['Lake', 'Slow Walk', 'Waterfront'], ['湖', '散策', '親水'], ['호수', '느린 산책', '친수']),
  'qiandao-lake': list(['湖岛', '远行', '度假'], ['Lake Islands', 'Excursion', 'Resort'], ['湖島', '遠出', 'リゾート'], ['호수와 섬', '원행', '휴양']),
}

const phraseTranslations: Record<string, LocalizedText> = {
  西湖区: text('西湖区', 'Xihu District', '西湖区', '시후구'),
  上城区: text('上城区', 'Shangcheng District', '上城区', '상청구'),
  余杭区: text('余杭区', 'Yuhang District', '余杭区', '위항구'),
  拱墅区: text('拱墅区', 'Gongshu District', '拱墅区', '궁수구'),
  萧山区: text('萧山区', 'Xiaoshan District', '蕭山区', '샤오산구'),
  淳安县: text('淳安县', 'Chun’an County', '淳安県', '춘안현'),
  湖山风景: text('湖山风景', 'Lake & Hills', '湖山風景', '호수와 산 풍경'),
  宋韵文脉: text('宋韵文脉', 'Song Heritage', '宋韻文脈', '송풍 문맥'),
  湿地生态: text('湿地生态', 'Wetland Ecology', '湿地生態', '습지 생태'),
  文明遗址: text('文明遗址', 'Civilisation Ruins', '文明遺跡', '문명 유적'),
  运河水岸: text('运河水岸', 'Canal Waterfront', '運河水辺', '운하 수변'),
  宋韵演艺: text('宋韵演艺', 'Song-Style Performance', '宋韻演藝', '송풍 공연'),
  自然园林: text('自然园林', 'Nature Garden', '自然庭園', '자연 정원'),
  亲子自然: text('亲子自然', 'Family Nature', '家族自然', '가족 자연'),
  历史建筑: text('历史建筑', 'Historic Architecture', '歴史建築', '역사 건축'),
  江岸地标: text('江岸地标', 'Riverside Landmark', '川辺のランドマーク', '강변 랜드마크'),
  江南园林: text('江南园林', 'Jiangnan Garden', '江南庭園', '강남 정원'),
  历史街区: text('历史街区', 'Historic Block', '歴史街区', '역사 거리'),
  湖岛度假: text('湖岛度假', 'Lake Island Resort', '湖島リゾート', '호수 섬 휴양'),
}

const addresses: Record<string, LocalizedText> = {
  'west-lake': text('杭州市西湖区龙井路1号周边', 'Around No. 1 Longjing Road, Xihu District, Hangzhou', '杭州市西湖区龍井路1号周辺', '항저우시 시후구 룽징로 1호 일대'),
  'lingyin-feilaifeng': text('杭州市西湖区灵隐路法云弄1号', 'No. 1 Fayun Lane, Lingyin Road, Xihu District, Hangzhou', '杭州市西湖区霊隠路法雲弄1号', '항저우시 시후구 링인로 파윈농 1호'),
  'xixi-wetland': text('杭州市西湖区天目山路518号', 'No. 518 Tianmushan Road, Xihu District, Hangzhou', '杭州市西湖区天目山路518号', '항저우시 시후구 톈무산로 518호'),
  'liangzhu-ancient-city': text('杭州市余杭区瓶窑镇凤都路与104国道交叉口', 'Fengdu Road and G104, Pingyao Town, Yuhang District, Hangzhou', '杭州市余杭区瓶窯鎮、鳳都路と104国道交差点', '항저우시 위항구 핑야오진 펑두로와 104국도 교차로'),
  'grand-canal-hangzhou': text('杭州市拱墅区拱宸桥及运河沿线', 'Gongchen Bridge and Grand Canal corridor, Gongshu District, Hangzhou', '杭州市拱墅区拱宸橋および運河沿線', '항저우시 궁수구 궁천교 및 운하 연선'),
  songcheng: text('杭州市西湖区之江路148号', 'No. 148 Zhijiang Road, Xihu District, Hangzhou', '杭州市西湖区之江路148号', '항저우시 시후구 즈장로 148호'),
  'leifeng-pagoda': text('杭州市西湖区南山路15号', 'No. 15 Nanshan Road, Xihu District, Hangzhou', '杭州市西湖区南山路15号', '항저우시 시후구 난산로 15호'),
  'hangzhou-botanical-garden': text('杭州市西湖区桃源岭1号', 'No. 1 Taoyuanling, Xihu District, Hangzhou', '杭州市西湖区桃源嶺1号', '항저우시 시후구 타오위안링 1호'),
  'hangzhou-zoo': text('杭州市西湖区虎跑路40号', 'No. 40 Hupao Road, Xihu District, Hangzhou', '杭州市西湖区虎跑路40号', '항저우시 시후구 후파오로 40호'),
  'hu-xueyan-residence': text('杭州市上城区元宝街18号', 'No. 18 Yuanbao Street, Shangcheng District, Hangzhou', '杭州市上城区元宝街18号', '항저우시 상청구 위안바오가 18호'),
  liuhetower: text('杭州市西湖区之江路16号', 'No. 16 Zhijiang Road, Xihu District, Hangzhou', '杭州市西湖区之江路16号', '항저우시 시후구 즈장로 16호'),
  guozhuang: text('杭州市西湖区杨公堤28号', 'No. 28 Yanggongdi, Xihu District, Hangzhou', '杭州市西湖区楊公堤28号', '항저우시 시후구 양공디 28호'),
  'xiaohe-street': text('杭州市拱墅区小河直街历史文化街区', 'Xiaohe Straight Street Historic Block, Gongshu District, Hangzhou', '杭州市拱墅区小河直街歴史文化街区', '항저우시 궁수구 샤오허 거리 역사문화지구'),
  'southern-song-imperial-street': text('杭州市上城区中山中路沿线', 'Along Zhongshan Middle Road, Shangcheng District, Hangzhou', '杭州市上城区中山中路沿線', '항저우시 상청구 중산중로 일대'),
  xianghu: text('杭州市萧山区湘湖路132号周边', 'Around No. 132 Xianghu Road, Xiaoshan District, Hangzhou', '杭州市蕭山区湘湖路132号周辺', '항저우시 샤오산구 샹후로 132호 일대'),
  'qiandao-lake': text('杭州市淳安县千岛湖镇梦姑路', 'Menggu Road, Qiandaohu Town, Chun’an County, Hangzhou', '杭州市淳安県千島湖鎮夢姑路', '항저우시 춘안현 첸다오후진 멍구로'),
}

const openingHours: Record<string, LocalizedText> = {
  '全天开放，部分点位以现场公告为准': text('全天开放，部分点位以现场公告为准', 'Open all day; some points follow on-site notices.', '終日開放。一部地点は現地告知に準じます。', '종일 개방. 일부 지점은 현장 공지를 따릅니다.'),
  '全天开放，展馆及游船以现场公告为准': text('全天开放，展馆及游船以现场公告为准', 'Open all day; museums and boats follow on-site notices.', '終日開放。展示館・遊覧船は現地告知に準じます。', '종일 개방. 전시관과 유람선은 현장 공지를 따릅니다.'),
  '全天开放，商户时间各异': text('全天开放，商户时间各异', 'Open all day; shop hours vary.', '終日開放。店舗営業時間は異なります。', '종일 개방. 상점 운영 시간은 다릅니다.'),
  '全天开放，展馆及商户时间各异': text('全天开放，展馆及商户时间各异', 'Open all day; museum and shop hours vary.', '終日開放。展示館・店舗営業時間は異なります。', '종일 개방. 전시관과 상점 운영 시간은 다릅니다.'),
  '全天开放，部分场馆以现场公告为准': text('全天开放，部分场馆以现场公告为准', 'Open all day; some venues follow on-site notices.', '終日開放。一部施設は現地告知に準じます。', '종일 개방. 일부 시설은 현장 공지를 따릅니다.'),
  '免票开放，实行实名预约与分时游览；寺院及特殊点位以官方公告为准': text('免票开放，实行实名预约与分时游览；寺院及特殊点位以官方公告为准', 'Free entry with real-name booking and timed visits; temple areas and special points follow official notices.', '入場無料、実名予約と時間帯制で見学。寺院エリアと特別地点は公式告知に準じます。', '무료 입장이며 실명 예약과 시간대 관람을 시행합니다. 사찰 구역과 특별 지점은 공식 공지를 따릅니다.'),
  '开放时间、售票与最后入园以景区当日公告为准': text('开放时间、售票与最后入园以景区当日公告为准', 'Hours, ticketing and last entry follow the venue notice of the day.', '営業時間・チケット・最終入場は当日の景区告知に準じます。', '운영 시간, 티켓, 마지막 입장은 당일 명소 공지를 따릅니다.'),
  '开放时间、演出场次与最后入园以景区当日公告为准': text('开放时间、演出场次与最后入园以景区当日公告为准', 'Hours, show times and last entry follow the venue notice of the day.', '営業時間・公演回・最終入場は当日の景区告知に準じます。', '운영 시간, 공연 회차, 마지막 입장은 당일 명소 공지를 따릅니다.'),
  '开放时间、售票与最后入园以园区当日公告为准': text('开放时间、售票与最后入园以园区当日公告为准', 'Hours, ticketing and last entry follow the park notice of the day.', '営業時間・チケット・最終入園は当日の園区告知に準じます。', '운영 시간, 티켓, 마지막 입장은 당일 공원 공지를 따릅니다.'),
  '开放时间、售票与最后入馆以场馆当日公告为准': text('开放时间、售票与最后入馆以场馆当日公告为准', 'Hours, ticketing and last entry follow the venue notice of the day.', '開館時間・チケット・最終入館は当日の施設告知に準じます。', '운영 시간, 티켓, 마지막 입장은 당일 시설 공지를 따릅니다.'),
  '开放时间、船班与最后入园以景区当日公告为准': text('开放时间、船班与最后入园以景区当日公告为准', 'Hours, boat schedules and last entry follow the venue notice of the day.', '営業時間・船便・最終入場は当日の景区告知に準じます。', '운영 시간, 선박 일정, 마지막 입장은 당일 명소 공지를 따릅니다.'),
}

const ticketNames: Record<string, LocalizedText> = {
  免费预约: text('免费预约', 'Free Entry Registration', '無料入場登録', '무료 입장 등록'),
  免费入园登记: text('免费入园登记', 'Free Entry Registration', '無料入場登録', '무료 입장 등록'),
  成人票: text('成人票', 'Adult Ticket', '大人券', '성인권'),
  学生票: text('学生票', 'Student Ticket', '学生券', '학생권'),
  儿童票: text('儿童票', 'Child Ticket', '子ども券', '아동권'),
  老人票: text('老人票', 'Senior Ticket', 'シニア券', '경로권'),
}

const audience: Record<string, LocalizedText> = {
  全体游客: text('全体游客', 'All visitors', 'すべての来訪者', '모든 방문객'),
  '18周岁及以上游客': text('18周岁及以上游客', 'Visitors aged 18+', '18歳以上の来訪者', '18세 이상 방문객'),
  全日制学生: text('全日制学生', 'Full-time students', '全日制学生', '전일제 학생'),
  儿童游客: text('儿童游客', 'Children', '子ども', '어린이'),
  符合优待条件游客: text('符合优待条件游客', 'Eligible concession visitors', '優待条件に該当する来訪者', '우대 조건 방문객'),
}

const ticketDescriptions: Record<string, LocalizedText> = {
  免费预约: text('免费开放或免费登记凭证，客流、安检与活动安排以现场公告为准。', 'Free entry or registration pass; crowd control, security checks and events follow on-site notices.', '無料入場または無料登録証明。混雑管理・手荷物検査・催事は現地告知に準じます。', '무료 입장 또는 등록 바우처. 혼잡 관리, 보안 검사, 행사는 현장 공지를 따릅니다.'),
  免费入园登记: text('免费开放或免费登记凭证，客流、安检与活动安排以现场公告为准。', 'Free entry or registration pass; crowd control, security checks and events follow on-site notices.', '無料入場または無料登録証明。混雑管理・手荷物検査・催事は現地告知に準じます。', '무료 입장 또는 등록 바우처. 혼잡 관리, 보안 검사, 행사는 현장 공지를 따릅니다.'),
  成人票: text('成人票，价格、优惠与退改规则以官方票务渠道为准。', 'Adult ticket; price, concessions and refund rules follow the official ticketing channel.', '大人券。価格・優待・変更払戻規則は公式チケット窓口に準じます。', '성인권. 가격, 우대, 환불 규정은 공식 티켓 채널을 따릅니다.'),
  学生票: text('学生优惠票，入园时请携带可核验的有效证件。', 'Student concession ticket; bring verifiable valid ID on entry.', '学生優待券。入場時に確認可能な有効証明書をご持参ください。', '학생 할인권. 입장 시 확인 가능한 유효 신분증을 지참하세요.'),
  儿童票: text('儿童优惠票，适用范围以官方票务渠道为准。', 'Child concession ticket; eligibility follows the official ticketing channel.', '子ども優待券。適用範囲は公式チケット窓口に準じます。', '아동 할인권. 적용 범위는 공식 티켓 채널을 따릅니다.'),
  老人票: text('老人优待凭证，入园时请携带可核验的有效证件。', 'Senior concession pass; bring verifiable valid ID on entry.', 'シニア優待証明。入場時に確認可能な有効証明書をご持参ください。', '경로 우대 바우처. 입장 시 확인 가능한 유효 신분증을 지참하세요.'),
}

const translateByMap = (value: string, map: Record<string, LocalizedText>) => {
  const entry = map[value]
  return entry ? pickLocalized(entry) : value
}

export const localizeSpotName = (spot: Pick<SpotLike, 'id' | 'nameZh' | 'nameEn'>) =>
  spotNames[spot.id] ? pickLocalized(spotNames[spot.id]) : spot.nameZh

export const localizeSpotArea = (spot: Pick<SpotLike, 'area'>) =>
  spot.area
    .split('/')
    .map((part) => translateByMap(part.trim(), phraseTranslations))
    .join(' / ')

export const localizeSpotCategory = (spot: Pick<SpotLike, 'category'>) =>
  translateByMap(spot.category, phraseTranslations)

export const localizeSpotDescription = (spot: Pick<SpotLike, 'id' | 'description'>) =>
  spotDescriptions[spot.id] ? pickLocalized(spotDescriptions[spot.id]) : spot.description

export const localizeSpotAddress = (spot: Pick<SpotLike, 'id' | 'address'>) =>
  addresses[spot.id] ? pickLocalized(addresses[spot.id]) : translateByMap(spot.address, addresses)

export const localizeSpotOpeningHours = (spot: Pick<SpotLike, 'openingHours'>) =>
  translateByMap(spot.openingHours, openingHours)

export const localizeSpotTags = (spot: Pick<SpotLike, 'id' | 'tags'>) =>
  spotTags[spot.id] ? pickLocalizedList(spotTags[spot.id]) : spot.tags

export const localizeTicketName = (ticket: TicketLike) => translateByMap(ticket.name, ticketNames)

export const localizeTicketDescription = (ticket: TicketLike) => {
  if (ticket.description.includes('免费预约') || ticket.description.includes('免费参观') || ticket.description.includes('免票') || ticket.description.includes('开放')) {
    return pickLocalized(ticketDescriptions['免费预约'])
  }

  return translateByMap(ticket.name, ticketDescriptions)
}

export const localizeTicketAudience = (ticket: TicketLike) => translateByMap(ticket.availableFor, audience)

export const localizeOrderStatus = (status: OrderStatus | string) => {
  if (status === '待出行') return t('orders.status.pending')
  if (status === '已完成') return t('orders.status.done')
  if (status === '已取消') return t('orders.status.canceled')
  return status
}

export const localizePaymentStatus = (status?: string) => {
  if (!status) return ''
  if (status === '已支付') return t('orders.payStatus.paid')
  if (status === '支付完成') return t('orders.payStatus.paid')
  if (status === '待支付') return t('orders.payStatus.pending')
  if (status === '已退款') return t('orders.payStatus.refunded')
  if (status === '免费预约') return t('orders.payStatus.free')
  return status
}

const visitorNames: Record<string, LocalizedText> = {
  测试游客: text('测试游客', 'Test Visitor', 'テスト来訪者', '테스트 방문객'),
  王一: text('王一', 'Wang Yi', '王一', '왕이'),
  林二: text('林二', 'Lin Er', '林二', '린얼'),
  陈三: text('陈三', 'Chen San', '陳三', '천싼'),
  周四: text('周四', 'Zhou Si', '周四', '저우쓰'),
  周五: text('周五', 'Zhou Wu', '周五', '저우우'),
  周六: text('周六', 'Zhou Liu', '周六', '저우리우'),
}

export const localizeVisitorName = (name: string) => translateByMap(name, visitorNames)

export const localizeOrderSpotName = (spotName: string, spots: Array<Pick<SpotLike, 'id' | 'nameZh' | 'nameEn'>>) => {
  const spot = spots.find((item) => item.nameZh === spotName || item.nameEn === spotName)
  return spot ? localizeSpotName(spot) : spotName
}
