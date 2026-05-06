import type { LocalizedList, LocalizedText } from '../i18n/site'
import routeCanalRiverfrontImage from '../assets/images/route-canal-riverfront.jpg'
import routeSongHeritageImage from '../assets/images/route-song-heritage.jpg'
import routeWestLakeWalkImage from '../assets/images/route-west-lake-walk.jpg'

export type CityRoute = {
  id: string
  title: LocalizedText
  titleEn: string
  duration: LocalizedText
  pace: LocalizedText
  audience: LocalizedText
  description: LocalizedText
  stops: LocalizedList
  primaryStopText: string
  image: string
}

export const routes: CityRoute[] = [
  {
    id: '01',
    title: {
      'zh-CN': '西湖慢行线',
      'en-US': 'West Lake Walk',
      'ja-JP': '西湖さんぽ',
      'ko-KR': '시후 산책 코스',
    },
    titleEn: 'West Lake Walk',
    duration: {
      'zh-CN': '半日',
      'en-US': 'Half day',
      'ja-JP': '半日',
      'ko-KR': '반나절',
    },
    pace: {
      'zh-CN': '舒缓',
      'en-US': 'Easy',
      'ja-JP': 'ゆったり',
      'ko-KR': '여유로움',
    },
    audience: {
      'zh-CN': '第一次抵达杭州的人',
      'en-US': 'First-time visitors to Hangzhou',
      'ja-JP': '初めて杭州を訪れる方',
      'ko-KR': '항저우를 처음 찾는 분',
    },
    description: {
      'zh-CN': '沿着白堤与苏堤展开一段湖山旅程，在水光之间认识杭州。',
      'en-US': 'Trace the Bai and Su causeways through lake and hills, and meet Hangzhou between sheets of light on water.',
      'ja-JP': '白堤と蘇堤に沿って湖山を歩き、水光のあいだで杭州に出会います。',
      'ko-KR': '바이디와 쑤디를 따라 호수와 산을 걷고, 물빛 사이에서 항저우를 만납니다.',
    },
    stops: {
      'zh-CN': ['断桥', '白堤', '孤山', '苏堤', '曲院风荷'],
      'en-US': ['Broken Bridge', 'Bai Causeway', 'Solitary Hill', 'Su Causeway', 'Quyuan Lotus Garden'],
      'ja-JP': ['断橋', '白堤', '孤山', '蘇堤', '曲院風荷'],
      'ko-KR': ['단교', '바이디', '구산', '쑤디', '취위안 풍하'],
    },
    primaryStopText: '西湖',
    image: routeWestLakeWalkImage,
  },
  {
    id: '02',
    title: {
      'zh-CN': '宋韵文脉线',
      'en-US': 'Song Heritage Route',
      'ja-JP': '宋韻文脈ルート',
      'ko-KR': '송풍 문맥 코스',
    },
    titleEn: 'Song Heritage Route',
    duration: {
      'zh-CN': '一日',
      'en-US': 'One day',
      'ja-JP': '一日',
      'ko-KR': '하루',
    },
    pace: {
      'zh-CN': '从容',
      'en-US': 'Steady',
      'ja-JP': 'ゆとり',
      'ko-KR': '여유로움',
    },
    audience: {
      'zh-CN': '想看见杭州历史层次的人',
      'en-US': 'Travellers drawn to historical depth',
      'ja-JP': '歴史の層に触れたい方',
      'ko-KR': '도시의 역사 층을 만나고 싶은 분',
    },
    description: {
      'zh-CN': '从南宋御街走到灵隐，在街巷、山门与香火之间阅读杭州的宋韵。',
      'en-US': "Walk from the Southern Song Imperial Street to Lingyin, reading Hangzhou's Song heritage in lanes, gates and incense.",
      'ja-JP': '南宋御街から霊隠へ。街路と山門、線香の煙のなかで杭州の宋韻を読みます。',
      'ko-KR': '남송 어가에서 링인까지 걸으며 골목과 산문, 향연 속에서 송풍을 읽습니다.',
    },
    stops: {
      'zh-CN': ['南宋御街', '河坊街', '鼓楼', '灵隐寺'],
      'en-US': ['Southern Song Imperial Street', 'Hefang Street', 'Gulou', 'Lingyin Temple'],
      'ja-JP': ['南宋御街', '河坊街', '鼓楼', '霊隠寺'],
      'ko-KR': ['남송 어가', '허팡 거리', '구러우', '링인사'],
    },
    primaryStopText: '灵隐飞来峰',
    image: routeSongHeritageImage,
  },
  {
    id: '03',
    title: {
      'zh-CN': '运河与城市线',
      'en-US': 'Canal & City Route',
      'ja-JP': '運河と都市ルート',
      'ko-KR': '운하와 도시 코스',
    },
    titleEn: 'Canal & City Route',
    duration: {
      'zh-CN': '一日',
      'en-US': 'One day',
      'ja-JP': '一日',
      'ko-KR': '하루',
    },
    pace: {
      'zh-CN': '开阔',
      'en-US': 'Expansive',
      'ja-JP': '広やか',
      'ko-KR': '시원함',
    },
    audience: {
      'zh-CN': '想从生活水岸走向现代城市的人',
      'en-US': 'Walkers heading from canal life to the modern skyline',
      'ja-JP': '水辺の暮らしから現代都市へ歩きたい方',
      'ko-KR': '수변 일상에서 현대 도시로 향하고 싶은 분',
    },
    description: {
      'zh-CN': '从运河的日常水岸一路走向钱塘江，感受杭州由旧入新的城市界面。',
      'en-US': "Move from canal-side daily life to the Qiantang River and feel Hangzhou's surface shift from old to new.",
      'ja-JP': '運河の暮らしから銭塘江へ。古さから新しさへ移る杭州の表情を感じます。',
      'ko-KR': '운하의 일상에서 첸탕장까지 걸으며 옛 도시에서 현대 도시로 변하는 항저우를 느낍니다.',
    },
    stops: {
      'zh-CN': ['京杭大运河', '小河直街', '拱宸桥', '钱塘江'],
      'en-US': ['Grand Canal', 'Xiaohe Straight Street', 'Gongchen Bridge', 'Qiantang River'],
      'ja-JP': ['京杭大運河', '小河直街', '拱宸橋', '銭塘江'],
      'ko-KR': ['징항 대운하', '샤오허 거리', '궁천교', '첸탕장'],
    },
    primaryStopText: '京杭大运河杭州段',
    image: routeCanalRiverfrontImage,
  },
]
