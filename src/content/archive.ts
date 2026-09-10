import impressionHeritageImage from '../assets/images/impression-heritage.jpg'
import impressionLakeImage from '../assets/images/impression-lake.jpg'
import impressionTeaImage from '../assets/images/impression-tea.jpg'
import type { LocalizedText } from '../i18n/site'

export type TravelImpression = {
  id: string
  title: LocalizedText
  titleEn: string
  description: LocalizedText
  image: string
}

export const travelImpressions: TravelImpression[] = [
  {
    id: 'lake',
    title: {
      'zh-CN': '湖山呼吸',
      'en-US': 'Lake Breathing',
      'ja-JP': '湖山の呼吸',
      'ko-KR': '호수와 산의 호흡',
    },
    titleEn: 'Lake Breathing',
    description: {
      'zh-CN': '在堤桥和水光之间，杭州的旅行节奏会自然慢下来。',
      'en-US': "Between causeways and lake light, Hangzhou's pace naturally slows down.",
      'ja-JP': '堤と水光のあいだで、杭州の旅は自然とゆるやかになります。',
      'ko-KR': '제방과 물빛 사이에서 항저우의 여행 속도는 자연스럽게 느려집니다.',
    },
    image: impressionLakeImage,
  },
  {
    id: 'heritage',
    title: {
      'zh-CN': '文脉肌理',
      'en-US': 'Heritage Texture',
      'ja-JP': '文化の肌理',
      'ko-KR': '문화의 결',
    },
    titleEn: 'Heritage Texture',
    description: {
      'zh-CN': '街巷、桥梁与遗址叠出层次，城市记忆始终可读。',
      'en-US': 'Lanes, bridges and ruins layer up a city whose memory remains legible.',
      'ja-JP': '路地、橋、遺跡の層が重なり、都市の記憶が読み取れます。',
      'ko-KR': '골목, 다리, 유적이 층을 이루며 도시의 기억이 읽힙니다.',
    },
    image: impressionHeritageImage,
  },
  {
    id: 'tea',
    title: {
      'zh-CN': '茶山余韵',
      'en-US': 'Tea Hills Aftertone',
      'ja-JP': '茶畑の余韻',
      'ko-KR': '차 언덕의 여운',
    },
    titleEn: 'Tea Hills Aftertone',
    description: {
      'zh-CN': '茶香和山风交错，让杭州的旅行记忆更长久地停留。',
      'en-US': 'Tea aroma and mountain wind keep Hangzhou lingering in memory.',
      'ja-JP': '茶の香りと山風が交わり、杭州の旅の余韻を長く残します。',
      'ko-KR': '차 향과 산바람이 만나 항저우 여행의 여운을 오래 남깁니다.',
    },
    image: impressionTeaImage,
  },
]
