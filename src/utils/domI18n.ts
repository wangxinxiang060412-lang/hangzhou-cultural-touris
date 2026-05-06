import { siteLocale } from '../i18n/site'

type LocaleText = {
  'en-US': string
  'ja-JP': string
  'ko-KR': string
}

const text = (en: string, ja: string, ko: string): LocaleText => ({
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const replacements: Record<string, LocaleText> = {
  票务管理后台: text('Ticketing Admin', 'チケット管理', '티켓 관리'),
  票务管理: text('Ticketing', 'チケット管理', '티켓 관리'),
  '后台与后端 API + SQLite 同步，可直接新增、修改、删除景点 / 票种 / 时段 / 订单，所有操作实时写入数据库。': text(
    'The admin panel syncs with the backend API and SQLite. Create, edit and delete spots, tickets, slots and orders in real time.',
    '管理画面はバックエンド API と SQLite に同期し、景点・券種・時間帯・注文をリアルタイムに管理できます。',
    '관리 화면은 백엔드 API와 SQLite에 동기화되며 명소, 티켓, 시간대, 주문을 실시간으로 관리합니다.',
  ),
  查看前台预约: text('View Tickets & Visits', 'チケット案内を見る', '티켓 안내 보기'),
  查看预约记录: text('View Orders', '予約記録を見る', '예약 기록 보기'),
  回到首页: text('Back Home', 'ホームへ戻る', '홈으로'),
  今日预约数: text('Today’s Bookings', '本日の手続き数', '오늘 처리 수'),
  待核销: text('Pending Check-in', '未検証', '검증 대기'),
  已核销: text('Checked In', '検証済み', '검증 완료'),
  已取消: text('Canceled', '取消済み', '취소됨'),
  景点数量: text('Spots', '景点数', '명소 수'),
  票种数量: text('Ticket Types', '券種数', '권종 수'),
  订单管理: text('Orders', '注文管理', '주문 관리'),
  时段管理: text('Slots', '時間帯管理', '시간대 관리'),
  景点管理: text('Spots', '景点管理', '명소 관리'),
  票种管理: text('Tickets', '券種管理', '티켓 관리'),
  数据模型: text('Data Model', 'データモデル', '데이터 모델'),
  刷新: text('Refresh', '更新', '새로고침'),
  重置订单表: text('Reset Orders', '注文表をリセット', '주문 초기화'),
  重置整库: text('Reset Database', 'DB をリセット', 'DB 초기화'),
  确认重置订单: text('Confirm Reset Orders', '注文リセット確認', '주문 초기화 확인'),
  确认重置数据库: text('Confirm Reset Database', 'DB リセット確認', 'DB 초기화 확인'),
  放弃: text('Cancel', '取り消し', '취소'),
  热门景点: text('Popular Spots', '人気景点', '인기 명소'),
  暂无景点: text('No spots yet', '景点はまだありません', '아직 명소가 없습니다'),
  请先新增景点: text('Create a spot first', 'まず景点を追加してください', '먼저 명소를 추가하세요'),
  余票预警: text('Low Capacity Alerts', '残数アラート', '잔여 알림'),
  暂无告警: text('No alerts', 'アラートなし', '알림 없음'),
  所有时段余量充足: text('All slots have capacity', '全時間帯に余裕があります', '모든 시간대에 여유가 있습니다'),
  最近预约: text('Recent Orders', '最近の記録', '최근 기록'),
  暂无预约: text('No records', '記録なし', '기록 없음'),
  等待首单: text('Waiting for first order', '最初の記録待ち', '첫 기록 대기'),
  状态: text('Status', '状態', '상태'),
  全部: text('All', 'すべて', '전체'),
  待出行: text('Upcoming', '利用前', '이용 전'),
  已完成: text('Completed', '完了', '완료'),
  检索: text('Search', '検索', '검색'),
  编号: text('ID', '番号', '번호'),
  景点: text('Spot', '景点', '명소'),
  日期: text('Date', '日付', '날짜'),
  游客: text('Visitor', '来訪者', '방문자'),
  操作: text('Actions', '操作', '작업'),
  核销: text('Verify', '検証', '검증'),
  取消: text('Cancel', '取消', '취소'),
  删除: text('Delete', '削除', '삭제'),
  恢复: text('Restore', '復元', '복원'),
  确认删除: text('Confirm Delete', '削除確認', '삭제 확인'),
  新增: text('Create', '追加', '추가'),
  新增时段: text('New Slot', '時間帯を追加', '시간대 추가'),
  新增景点: text('New Spot', '景点を追加', '명소 추가'),
  新增票种: text('New Ticket', '券種を追加', '권종 추가'),
  编辑: text('Edit', '編集', '편집'),
  创建时段: text('Create Slot', '時間帯を作成', '시간대 생성'),
  创建景点: text('Create Spot', '景点を作成', '명소 생성'),
  创建票种: text('Create Ticket', '券種を作成', '권종 생성'),
  保存修改: text('Save Changes', '変更を保存', '변경 저장'),
  所属景点: text('Spot', '所属景点', '소속 명소'),
  时段: text('Time Slot', '時間帯', '시간대'),
  容量: text('Capacity', '定員', '수용량'),
  基础已约: text('Base Booked', '基本予約数', '기본 예약'),
  数据库占用: text('DB Used', 'DB 使用数', 'DB 점유'),
  剩余: text('Remaining', '残数', '잔여'),
  区域: text('Area', 'エリア', '지역'),
  分类: text('Category', '分類', '분류'),
  预约: text('Entry Mode', '入場方式', '입장 방식'),
  票种: text('Ticket', '券種', '권종'),
  关联时段: text('Linked Slots', '関連時間帯', '연결 시간대'),
  票种名: text('Ticket Name', '券種名', '권종명'),
  价格: text('Price', '価格', '가격'),
  '价格 (¥)': text('Price (¥)', '価格 (¥)', '가격 (¥)'),
  适用人群: text('Audience', '対象者', '대상'),
  描述: text('Description', '説明', '설명'),
  中文名: text('Chinese Name', '中国語名', '중국어명'),
  英文名: text('English Name', '英語名', '영문명'),
  地址: text('Address', '所在地', '주소'),
  开放时间: text('Opening Hours', '営業時間', '운영 시간'),
  标签: text('Tags', 'タグ', '태그'),
  首页推荐: text('Featured on Home', 'ホーム掲載', '홈 추천'),
  免费预约: text('Free Entry Registration', '無料入場登録', '무료 입장 등록'),
  免费入园登记: text('Free Entry Registration', '無料入場登録', '무료 입장 등록'),
  开放参观: text('Open Access', '入場自由', '자유 입장'),
  首页: text('Home', 'ホーム', '홈'),
  关系: text('Relations', '関連', '관계'),
}

const fragments: Record<string, LocaleText> = {
  灵隐飞来峰: text('Lingyin Feilai Peak', '霊隠飛来峰', '링인 페이라이펑'),
  西溪国家湿地公园: text('Xixi National Wetland Park', '西渓国家湿地公園', '시시 국가습지공원'),
  良渚古城遗址公园: text('Liangzhu Ancient City Ruins Park', '良渚古城遺跡公園', '량주 고성 유적공원'),
  京杭大运河杭州段: text('Grand Canal Hangzhou Section', '京杭大運河杭州区間', '징항 대운하 항저우 구간'),
  宋城: text('Songcheng', '宋城', '송성'),
  西湖风景名胜区: text('West Lake Scenic Area', '西湖風景名勝区', '시후 풍경명승구'),
  湘湖: text('Xianghu Lake', '湘湖', '샹후'),
  雷峰塔: text('Leifeng Pagoda', '雷峰塔', '레이펑타'),
  杭州植物园: text('Hangzhou Botanical Garden', '杭州植物園', '항저우 식물원'),
  杭州动物园: text('Hangzhou Zoo', '杭州動物園', '항저우 동물원'),
  胡雪岩故居: text('Hu Xueyan Former Residence', '胡雪岩旧居', '후쉐옌 고거'),
  六和塔: text('Liuhe Pagoda', '六和塔', '육화탑'),
  郭庄: text('Guo Villa', '郭荘', '궈좡'),
  小河直街: text('Xiaohe Straight Street', '小河直街', '샤오허 거리'),
  南宋御街: text('Southern Song Imperial Street', '南宋御街', '남송 어가'),
  千岛湖: text('Qiandao Lake', '千島湖', '첸다오후'),
  西湖区: text('Xihu District', '西湖区', '시후구'),
  上城区: text('Shangcheng District', '上城区', '상청구'),
  余杭区: text('Yuhang District', '余杭区', '위항구'),
  拱墅区: text('Gongshu District', '拱墅区', '궁수구'),
  萧山区: text('Xiaoshan District', '蕭山区', '샤오산구'),
  淳安县: text('Chun’an County', '淳安県', '춘안현'),
  湖山风景: text('Lake & Hills', '湖山風景', '호수와 산 풍경'),
  宋韵文脉: text('Song Heritage', '宋韻文脈', '송풍 문맥'),
  湿地生态: text('Wetland Ecology', '湿地生態', '습지 생태'),
  文明遗址: text('Civilisation Ruins', '文明遺跡', '문명 유적'),
  运河水岸: text('Canal Waterfront', '運河水辺', '운하 수변'),
  宋韵演艺: text('Song-Style Performance', '宋韻演藝', '송풍 공연'),
  自然园林: text('Nature Garden', '自然庭園', '자연 정원'),
  亲子自然: text('Family Nature', '家族自然', '가족 자연'),
  历史建筑: text('Historic Architecture', '歴史建築', '역사 건축'),
  江岸地标: text('Riverside Landmark', '川辺のランドマーク', '강변 랜드마크'),
  江南园林: text('Jiangnan Garden', '江南庭園', '강남 정원'),
  历史街区: text('Historic Block', '歴史街区', '역사 거리'),
  湖岛度假: text('Lake Island Resort', '湖島リゾート', '호수 섬 휴양'),
  需预约: text('Ticket / Timed Entry', 'チケット/時間帯', '티켓/시간대'),
  '购票/分时': text('Ticket / Timed Entry', 'チケット/時間帯', '티켓/시간대'),
  推荐: text('Featured', 'おすすめ', '추천'),
  待出行: text('Upcoming', '利用前', '이용 전'),
  已完成: text('Completed', '完了', '완료'),
  已取消: text('Canceled', '取消済み', '취소됨'),
  剩余: text('Remaining', '残数', '잔여'),
  人: text('pax', '名', '명'),
}

const translate = (source: string) => {
  if (siteLocale.value === 'zh-CN') return source
  const locale = siteLocale.value

  const exact = replacements[source]
  if (exact) return exact[locale]

  let next = source
  Object.entries(fragments).forEach(([key, value]) => {
    next = next.split(key).join(value[locale])
  })
  return next
}

const translateNode = (node: Node) => {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
    const translated = translate(node.textContent.trim())
    if (translated !== node.textContent.trim()) {
      node.textContent = node.textContent.replace(node.textContent.trim(), translated)
    }
  }
}

export const translateStaticDom = (root: ParentNode = document) => {
  if (siteLocale.value === 'zh-CN') return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    translateNode(node)
    node = walker.nextNode()
  }

  root.querySelectorAll?.('[placeholder], [aria-label]').forEach((element) => {
    if (!(element instanceof HTMLElement)) return
    const placeholder = element.getAttribute('placeholder')
    const ariaLabel = element.getAttribute('aria-label')

    if (placeholder) {
      const translated = translate(placeholder)
      if (translated !== placeholder) element.setAttribute('placeholder', translated)
    }
    if (ariaLabel) {
      const translated = translate(ariaLabel)
      if (translated !== ariaLabel) element.setAttribute('aria-label', translated)
    }
  })
}
