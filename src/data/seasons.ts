import type { LocalizedText } from '../i18n/site'
import seasonAutumnImage from '../assets/images/season-autumn.jpg'
import seasonSpringImage from '../assets/images/season-spring.jpg'
import seasonSummerImage from '../assets/images/season-summer.jpg'
import seasonWinterImage from '../assets/images/season-winter.jpg'

export type Season = {
  id: string
  title: LocalizedText
  titleEn: string
  description: LocalizedText
  image: string
  imagePosition: string
}

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

export const seasons: Season[] = [
  {
    id: '01',
    title: text('春 · 苏堤新柳', 'Spring · New Willows', '春 · 蘇堤の柳', '봄 · 쑤디의 버드나무'),
    titleEn: 'Spring',
    description: text(
      '春天适合从苏堤、白堤与湖滨慢慢进入杭州，柳色、花信与湖风会把行程放轻。',
      'Spring is for entering Hangzhou through Su Causeway, Bai Causeway and Hubin, where willows, blossoms and lake wind soften the day.',
      '春は蘇堤、白堤、湖浜から杭州へ。柳、花、湖風が旅をやわらかくします。',
      '봄에는 쑤디, 바이디, 후빈에서 항저우에 들어서기 좋습니다. 버드나무와 꽃, 호수 바람이 여정을 부드럽게 합니다.',
    ),
    image: seasonSpringImage,
    imagePosition: '50% 46%',
  },
  {
    id: '02',
    title: text('夏 · 曲院风荷', 'Summer · Lotus Breeze', '夏 · 曲院風荷', '여름 · 취위안 풍하'),
    titleEn: 'Summer',
    description: text(
      '夏日的湖面、荷塘、夜游与水岸活动最丰盛，建议结合天气与晚间时段安排行程。',
      'Summer brings lotus ponds, night routes and waterside activity. Plan around weather and evening slots.',
      '夏は蓮池、夜の散策、水辺の催しが豊かです。天候と夜間時間に合わせて計画しましょう。',
      '여름에는 연못, 야간 코스, 수변 활동이 풍성합니다. 날씨와 저녁 시간대를 함께 고려하세요.',
    ),
    image: seasonSummerImage,
    imagePosition: '50% 52%',
  },
  {
    id: '03',
    title: text('秋 · 满陇桂雨', 'Autumn · Osmanthus Rain', '秋 · 桂花の雨', '가을 · 계화 향기'),
    titleEn: 'Autumn',
    description: text(
      '秋天把茶山、桂香、南山路与灵隐山林连成一条香气里的路线，是杭州最舒展的季节。',
      'Autumn links tea hills, osmanthus, Nanshan Road and Lingyin woods into Hangzhou’s most generous season.',
      '秋は茶山、金木犀、南山路、霊隠の森が香りでつながる、杭州らしい季節です。',
      '가을은 차 산지, 계화 향기, 난산로, 링인 숲이 이어지는 항저우다운 계절입니다.',
    ),
    image: seasonAutumnImage,
    imagePosition: '50% 45%',
  },
  {
    id: '04',
    title: text('冬 · 断桥残雪', 'Winter · Broken Bridge Snow', '冬 · 断橋残雪', '겨울 · 단교잔설'),
    titleEn: 'Winter',
    description: text(
      '冬季的杭州更安静，断桥、孤山、博物馆与老街适合慢游，雨雪天气请留意开放公告。',
      'Winter is quieter: Broken Bridge, Solitary Hill, museums and old streets reward slow visits. Check notices in rain or snow.',
      '冬の杭州は静かです。断橋、孤山、博物館、古い街並みをゆっくり巡り、雨雪時は告知を確認してください。',
      '겨울 항저우는 더 조용합니다. 단교, 구산, 박물관, 옛 거리를 천천히 둘러보고 비나 눈이 올 때는 공지를 확인하세요.',
    ),
    image: seasonWinterImage,
    imagePosition: '50% 50%',
  },
]
