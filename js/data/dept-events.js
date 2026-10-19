// 부서별 이벤트. 시작할 때 고른 부서의 이벤트만 섞여 나온다(부서마다 시간대별 1개씩, 5개).
// 부서를 더하려면 T.DEPTS에 한 줄 넣고, 아래에 dept: '그 id' 이벤트를 쓰면 된다.

T.DEPTS = [
  { id: 'sales',  name: '영업팀' },
  { id: 'mkt',    name: '마케팅팀' },
  { id: 'dev',    name: '개발팀' },
  { id: 'plan',   name: '기획팀' },
  { id: 'hr',     name: '인사팀' },
  { id: 'fin',    name: '재무팀' },
  { id: 'design', name: '디자인팀' },
  { id: 'cs',     name: '고객지원팀' },
  { id: 'etc',    name: '기타 (직접 입력)' },
];

T.EVENTS.push(
  // ───────── 영업팀 ─────────
  {
    id: 'd_sales_m', dept: 'sales', scene: 'street', phase: 'morning', who: 'phone',
    text: '거래처 아침 미팅이 8시 반이다. 내비게이션 도착 예정 8시 47분.',
    options: [
      { label: '"차가 너무 막혀서요" 미리 전화한다', fx: { eval: -2, mental: 2 },
        result: '"저희도 방금 왔어요~" 거래처도 늦었다.' },
      { label: '골목길로 우회한다', rolls: [
        { p: 0.5, fx: { mental: 5, eval: 3 }, result: '8시 29분 도착. 영업의 신.' },
        { p: 0.5, fx: { eval: -6, mental: -5 }, result: '골목이 막다른 길이었다. 9시 도착.' },
      ] },
      { label: '커피를 사 들고 늦게 간다', fx: { cash: -13500, eval: 1 },
        result: '아이스 아메리카노 세 잔이 지각을 덮었다.' },
    ],
  },
  {
    id: 'd_sales_a', dept: 'sales', scene: 'meeting', phase: 'am', who: 'boss',
    text: '월간 실적 회의. 화이트보드에 내 이름 옆 숫자만 빨간색이다.',
    options: [
      { label: '"이번 달 안에 메우겠습니다!"', fx: { eval: 5, mental: -8 },
        result: '말은 했다. 방법은 아직 없다.' },
      { label: '시장 상황을 설명한다', rolls: [
        { p: 0.4, fx: { eval: 3 }, result: '"그건 일리가 있네." 숫자가 주황색이 됐다.' },
        { p: 0.6, fx: { eval: -6, mental: -4 }, result: '"다른 사람들은 같은 시장에서 하잖아."' },
      ] },
      { label: '다음 달 예정 계약을 미리 당겨 쓴다', fx: { eval: 6, mental: -4 },
        result: '이번 달은 살았다. 다음 달의 나는 모르겠다.' },
    ],
  },
  {
    id: 'd_sales_l', dept: 'sales', scene: 'restaurant', phase: 'lunch', who: 'boss',
    text: '거래처 점심 접대. 상대 부장님이 메뉴판을 보며 "여기 한우가 괜찮다던데" 한다.',
    options: [
      { label: '한우를 시킨다', fx: { cash: -60000, eval: 6 },
        result: '법인카드 한도를 걱정하며 먹은 한우는 맛을 모르겠다. 계약은 됐다.' },
      { label: '점심 특선을 권한다', rolls: [
        { p: 0.5, fx: { mental: 3 }, result: '"오, 점심 특선 좋죠." 그분도 사실 가벼운 걸 원했다.' },
        { p: 0.5, fx: { eval: -6 }, result: '상대 표정이 0.5초 굳었다. 계약은 다음으로 미뤄졌다.' },
      ] },
      { label: '"제가 아는 더 좋은 데가 있어요"', fx: { hp: -4, eval: 3 },
        result: '20분을 걸어 단골 국밥집에 갔다. 의외로 대성공.' },
    ],
  },
  {
    id: 'd_sales_p', dept: 'sales', phase: 'pm', who: 'phone',
    text: '거래처에서 클레임 전화다. "납품받은 제품 상자가 찌그러져 있어요. 사진 보낼게요."',
    options: [
      { label: '바로 찾아가서 사과한다', fx: { hp: -8, eval: 5 },
        result: '왕복 두 시간. 상자를 직접 바꿔 드렸다. 그분이 커피를 사 줬다.' },
      { label: '물류팀에 넘긴다', fx: { mental: 3, eval: -2 },
        result: '물류팀이 다시 나에게 넘겼다.' },
      { label: '"상자만 찌그러진 거죠?" 확인한다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '"네, 제품은 괜찮아요. 그냥 알려 드린 거예요." 다행이다.' },
        { p: 0.5, fx: { eval: -7, mental: -6 }, result: '"그걸 지금 확인이라고 하세요?" 통화가 40분 늘었다.' },
      ] },
    ],
  },
  {
    id: 'd_sales_o', dept: 'sales', scene: 'bar', phase: 'off', who: 'boss',
    text: '거래처 저녁 접대. 상대방이 "오늘 끝까지 가는 거죠?" 하며 잔을 채운다.',
    options: [
      { label: '끝까지 간다', fx: { hp: -16, eval: 7, cash: -30000 },
        result: '새벽 2시. 계약서는 내일 쓴다. 간은 오늘 썼다.' },
      { label: '"저 내일 아침 미팅이 있어서…"', fx: { eval: -2, mental: 3 },
        result: '"아이, 영업이 그러면 쓰나~" 그래도 놔줬다.' },
      { label: '물을 소주잔에 따라 마신다', rolls: [
        { p: 0.6, fx: { eval: 4, hp: -4 }, result: '맨정신으로 접대 성공. 상대방은 내가 술이 센 줄 안다.' },
        { p: 0.4, fx: { eval: -8, mental: -4 }, result: '"어, 이거 물이네?" 잔이 바뀌었다.' },
      ] },
    ],
  },

  // ───────── 마케팅팀 ─────────
  {
    id: 'd_mkt_m', dept: 'mkt', prop: 'chat', phase: 'morning', who: 'none',
    text: '어제 오픈한 캠페인에 댓글이 달렸다. 1,200개. 대부분 "이거 뭐 하자는 거임?"',
    options: [
      { label: '댓글을 하나하나 읽는다', fx: { mental: -10, eval: 2 },
        result: '"광고 만든 사람 퇴근 못 하게 해 주세요"라는 댓글이 좋아요 1위다.' },
      { label: '"노이즈 마케팅입니다"라고 보고한다', rolls: [
        { p: 0.5, fx: { eval: 6, mental: 4 }, result: '검색량이 3배가 됐다. 부장님이 "역시 노이즈!"라고 했다.' },
        { p: 0.5, fx: { eval: -8 }, result: '"노이즈만 있고 마케팅이 없잖아."' },
      ] },
      { label: '댓글 창을 닫는다', fx: { mental: 4, eval: -3 },
        result: '닫았더니 "댓글 막았다"는 새 댓글이 달렸다.' },
    ],
  },
  {
    id: 'd_mkt_a', dept: 'mkt', phase: 'am', who: 'boss',
    text: '부장님: "이번엔 바이럴 되게 해 와. 요즘 애들 좋아하는 걸로."',
    options: [
      { label: '밈을 조사해서 기획한다', fx: { hp: -8, eval: 5 },
        result: '밈을 설명하는 장표를 만들었다. 설명하는 순간 밈은 끝났다.' },
      { label: '"예산은 얼마예요?"', rolls: [
        { p: 0.4, fx: { eval: 4, mental: 3 }, result: '"넉넉하게 줄게." 처음 듣는 말이다.' },
        { p: 0.6, fx: { mental: -6 }, result: '"0원. 바이럴은 원래 공짜잖아."' },
      ] },
      { label: '신입한테 요즘 뭐가 유행인지 묻는다', fx: { mental: 2, eval: 2 },
        result: '신입: "선배, 그건 작년이에요." 나도 이미 늙었다.' },
    ],
  },
  {
    id: 'd_mkt_l', dept: 'mkt', scene: 'pantry', phase: 'lunch', who: 'phone',
    text: '팔로워 50만 인플루언서 측에서 연락이 왔다. "게시물 하나에 800만 원입니다."',
    options: [
      { label: '바로 진행한다', rolls: [
        { p: 0.4, fx: { eval: 10, mental: 5 }, result: '대박이 났다. 품절. 회의에서 박수를 받았다.' },
        { p: 0.6, fx: { eval: -10, mental: -6 }, result: '좋아요 1,000개, 매출 0원.' },
      ] },
      { label: '마이크로 인플루언서 10명으로 나눈다', fx: { eval: 4, hp: -6 },
        result: '연락을 열 번 했다. 효과는 꾸준했다.' },
      { label: '"예산 확인 후 연락드릴게요"', fx: { mental: 2 },
        result: '예산은 확인할 필요도 없었다. 없었다.' },
    ],
  },
  {
    id: 'd_mkt_p', dept: 'mkt', prop: 'excel', phase: 'pm', who: 'ceo',
    text: '대표님 보고. "그래서 이 광고로 매출이 얼마 늘었어요?" 대시보드엔 노출수만 있다.',
    options: [
      { label: '노출수를 자신 있게 말한다', fx: { eval: -4, mental: -4 },
        result: '"노출 말고 매출이요." 회의실이 조용해졌다.' },
      { label: '"추적 중입니다, 다음 주에 보고드리겠습니다"', fx: { eval: 1, hp: -6 },
        result: '다음 주까지 매출을 추적하는 법을 배워야 한다.' },
      { label: '브랜드 인지도 얘기로 돌린다', rolls: [
        { p: 0.5, fx: { eval: 4 }, result: '"브랜드는 장기전이죠." 대표님이 고개를 끄덕였다.' },
        { p: 0.5, fx: { eval: -7 }, result: '"인지도로 월급 줄 수 있어요?"' },
      ] },
    ],
  },
  {
    id: 'd_mkt_o', dept: 'mkt', phase: 'off', who: 'phone',
    text: '퇴근 직전, 경쟁사가 우리랑 똑같은 콘셉트의 신제품을 발표했다. 더 싸다.',
    options: [
      { label: '밤새 대응안을 만든다', fx: { hp: -14, eval: 6 },
        result: '아침에 부장님이 대응안을 보고 "음, 일단 지켜보자"고 했다.' },
      { label: '"우리가 먼저였다"고 SNS에 올린다', rolls: [
        { p: 0.4, fx: { eval: 6, mental: 5 }, result: '사람들이 우리 편을 들어 줬다. 원조의 품격.' },
        { p: 0.6, fx: { eval: -8, mental: -6 }, result: '"찌질하다"는 댓글이 달렸다. 법무팀에서 전화가 왔다.' },
      ] },
      { label: '일단 퇴근하고 내일 생각한다', fx: { mental: 4, eval: -2 },
        result: '집에서 경쟁사 제품 리뷰만 3시간 봤다. 쉬지도 못했다.' },
    ],
  },

  // ───────── 개발팀 ─────────
  {
    id: 'd_dev_m', dept: 'dev', scene: 'bedroom', phase: 'morning', who: 'phone',
    text: '새벽 6시. 서버 장애 알림이 울린다. 오늘 당번은 나다.',
    options: [
      { label: '누운 채로 노트북을 연다', fx: { hp: -10, eval: 5 },
        result: '파자마 차림으로 30분 만에 고쳤다. 원인은 디스크 용량. 또.' },
      { label: '다시 알림을 확인한다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '오탐이었다. 다시 잤다.' },
        { p: 0.5, fx: { eval: -9, mental: -5 }, result: '진짜였다. 10분 늦게 봤을 뿐인데 장애 보고서에 이름이 올라갔다.' },
      ] },
      { label: '동료에게 "혹시 보셨어요?" 보낸다', fx: { eval: -3, mental: 2 },
        result: '동료도 같은 메시지를 나에게 보냈다.' },
    ],
  },
  {
    id: 'd_dev_a', dept: 'dev', phase: 'am', who: 'boss',
    text: '"버튼 색만 바꾸는 건데 금방 되지? 한 10분?"',
    options: [
      { label: '"네, 금방 됩니다"', rolls: [
        { p: 0.4, fx: { eval: 4 }, result: '진짜 10분 걸렸다. 이런 날도 있다.' },
        { p: 0.6, fx: { hp: -10, eval: 2 }, result: '버튼 색이 디자인 시스템 전체랑 연결돼 있었다. 3일 걸렸다.' },
      ] },
      { label: '왜 오래 걸리는지 설명한다', fx: { mental: -6, eval: 1 },
        result: '30분 설명했다. "그러니까 10분이면 되는 거지?"' },
      { label: '"이번 스프린트엔 어렵습니다"', fx: { mental: 3, eval: -3 },
        result: '부장님이 "스프린트"가 뭔지 다시 물어봤다.' },
    ],
  },
  {
    id: 'd_dev_l', dept: 'dev', scene: 'pantry', phase: 'lunch', who: 'peer',
    text: '금요일 점심. 동료: "오늘 오후에 배포 하나만 할까요? 작은 거예요."',
    options: [
      { label: '"금요일 배포는 안 됩니다"', fx: { mental: 4, eval: 1 },
        result: '모두가 고개를 끄덕였다. 금요일 배포 금지는 우리의 헌법이다.' },
      { label: '"작은 거면 해요"', rolls: [
        { p: 0.5, fx: { eval: 4 }, result: '아무 일도 없었다. 그게 제일 무섭다.' },
        { p: 0.5, fx: { hp: -14, mental: -10 }, result: '주말 내내 롤백했다. 작은 거였다.' },
      ] },
      { label: '월요일 아침으로 미룬다', fx: { mental: 2 },
        result: '월요일 아침 배포가 금요일 배포보다 나은지는 아직 모른다.' },
    ],
  },
  {
    id: 'd_dev_p', dept: 'dev', prop: 'chat', phase: 'pm', who: 'peer',
    text: '내 코드 리뷰에 코멘트가 47개 달렸다. 첫 번째: "변수명이 좀…"',
    options: [
      { label: '하나하나 다 고친다', fx: { hp: -8, eval: 4 },
        result: '47개를 고쳤더니 리뷰어가 처음 버전이 나았다고 했다.' },
      { label: '"취향 차이 아닐까요?"', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '"그러네요, 승인할게요." 의외로 쿨했다.' },
        { p: 0.5, fx: { mental: -6, eval: -3 }, result: '스레드가 84개로 늘었다. 팀 전체가 구경 중이다.' },
      ] },
      { label: '회의실로 불러 직접 얘기한다', fx: { mental: 2, eval: 2 },
        result: '말로 하니 5분 만에 끝났다. 글이 문제였다.' },
    ],
  },
  {
    id: 'd_dev_o', dept: 'dev', prop: 'update', phase: 'off', who: 'none',
    text: '6시 배포 직전, 테스트 하나가 빨간색이다. 어제는 통과했다.',
    options: [
      { label: '원인을 찾을 때까지 남는다', fx: { hp: -12, eval: 5 },
        result: '밤 10시에 찾았다. 테스트가 날짜를 하드코딩하고 있었다.' },
      { label: '다시 돌려 본다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '초록색이 됐다. 이유는 모른다. 알고 싶지도 않다.' },
        { p: 0.5, fx: { hp: -8, mental: -6 }, result: '다섯 번 돌렸다. 다섯 번 다 빨간색. 결국 밤샘.' },
      ] },
      { label: '배포를 내일로 미룬다', fx: { mental: 4, eval: -3 },
        result: '"내일"이 세 번째다. 기획팀이 쳐다본다.' },
    ],
  },

  // ───────── 기획팀 ─────────
  {
    id: 'd_plan_m', dept: 'plan', prop: 'mail', phase: 'morning', who: 'ceo',
    text: '출근하자마자 대표님 메일. "올해 사업계획, 방향을 좀 바꿔 봅시다." 지난주에 확정한 계획이다.',
    options: [
      { label: '처음부터 다시 쓴다', fx: { hp: -12, eval: 6 },
        result: '파일 이름: 사업계획_최종_진짜최종_수정_v7.pptx' },
      { label: '어떤 방향인지 먼저 묻는다', rolls: [
        { p: 0.5, fx: { eval: 4 }, result: '"아, 3페이지만 바꾸면 돼." 질문이 일주일을 살렸다.' },
        { p: 0.5, fx: { mental: -6 }, result: '"그걸 찾는 게 기획이지." 대표님도 모르신다.' },
      ] },
      { label: '예전 버전 v3를 다시 꺼낸다', fx: { mental: 4, eval: 2 },
        result: '대표님이 v3를 보고 "이거야!"라고 했다. 석 달 전에 반려한 버전이다.' },
    ],
  },
  {
    id: 'd_plan_a', dept: 'plan', scene: 'meeting', phase: 'am', who: 'team',
    text: '오늘 회의가 7개다. 회의와 회의 사이에 "회의 준비 회의"가 있다.',
    options: [
      { label: '7개 다 들어간다', fx: { hp: -10, eval: 4 },
        result: '하루 종일 회의했다. 결정된 건 다음 회의 날짜뿐이다.' },
      { label: '두 개는 회의록만 받는다', fx: { mental: 4, eval: -1 },
        result: '회의록에 "담당: 나"라고 적혀 있었다. 없는 사이에.' },
      { label: '회의를 줄이자는 회의를 제안한다', rolls: [
        { p: 0.5, fx: { eval: 5, mental: 4 }, result: '회의가 3개로 줄었다. 회사의 영웅.' },
        { p: 0.5, fx: { mental: -6 }, result: '회의를 줄이는 방안을 논의하는 회의가 주 1회로 생겼다.' },
      ] },
    ],
  },
  {
    id: 'd_plan_l', dept: 'plan', scene: 'restaurant', phase: 'lunch', who: 'ceo',
    text: '대표님과 점심. 국밥을 드시다 말고 말씀하신다. "근데 우리도 메타버스 해야 하지 않나?"',
    options: [
      { label: '"검토해서 보고드리겠습니다"', fx: { eval: 3, hp: -6 },
        result: '오후 내내 메타버스를 검토했다. 이미 다들 접었다.' },
      { label: '요즘 트렌드를 조심스럽게 말씀드린다', rolls: [
        { p: 0.5, fx: { eval: 6 }, result: '"그래? 역시 기획팀이야." 메타버스가 사라졌다.' },
        { p: 0.5, fx: { eval: -5, mental: -3 }, result: '"그럼 그걸로 해 봐." 일이 바뀌었을 뿐 늘었다.' },
      ] },
      { label: '국밥에 집중한다', fx: { mental: 3, eval: -1 },
        result: '대표님도 국밥에 집중하셨다. 아이디어는 국물과 함께 사라졌다.' },
    ],
  },
  {
    id: 'd_plan_p', dept: 'plan', prop: 'excel', phase: 'pm', who: 'boss',
    text: '내일 보고할 장표의 합계가 안 맞는다. 3페이지 합계 102%.',
    options: [
      { label: '처음부터 다시 계산한다', fx: { hp: -8, eval: 4 },
        result: '반올림 때문이었다. 각주에 "반올림 차이" 한 줄을 넣는 데 두 시간 걸렸다.' },
      { label: '아무도 안 볼 거라 믿는다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '아무도 안 봤다.' },
        { p: 0.5, fx: { eval: -10 }, result: '대표님이 제일 먼저 봤다. "이거 102%네?"' },
      ] },
      { label: '숫자 대신 그래프로 바꾼다', fx: { eval: 2, mental: 2 },
        result: '그래프는 102%를 숨겨 준다. 기획의 기술이다.' },
    ],
  },
  {
    id: 'd_plan_o', dept: 'plan', phase: 'off', who: 'boss',
    text: '6시. 부장님: "내일 아침 9시 대표님 보고인데, 장표 순서를 한번 바꿔 볼까?"',
    options: [
      { label: '오늘 밤에 바꾼다', fx: { hp: -10, eval: 5 },
        result: '순서를 일곱 번 바꿨다. 최종안은 원래 순서였다.' },
      { label: '"지금 순서가 논리적으로 맞습니다"', rolls: [
        { p: 0.5, fx: { eval: 4, mental: 4 }, result: '"음, 그러네." 6시 10분 퇴근.' },
        { p: 0.5, fx: { eval: -5, mental: -3 }, result: '"그래도 한번 바꿔 봐." 논리는 졌다.' },
      ] },
      { label: '두 버전 다 만들어 둔다', fx: { hp: -6, eval: 3 },
        result: '보고 직전에 부장님이 세 번째 버전을 원했다.' },
    ],
  },

  // ───────── 인사팀 ─────────
  {
    id: 'd_hr_m', dept: 'hr', scene: 'hrroom', phase: 'morning', who: 'peer',
    text: '퇴사 면담. 퇴사자가 말한다. "솔직하게 말해도 되죠?" 메모지가 한 장으로 부족해 보인다.',
    options: [
      { label: '전부 받아 적는다', fx: { mental: -8, eval: 3 },
        result: '세 장을 채웠다. 절반은 나도 공감한다.' },
      { label: '"정리해서 전달할게요" 하고 요약한다', fx: { eval: 1 },
        result: '"부장님 리더십 개선 필요"로 요약됐다. 원문은 차마 못 쓴다.' },
      { label: '같이 공감해 준다', rolls: [
        { p: 0.6, fx: { mental: 6 }, result: '퇴사자가 "인사팀이 제일 사람 같았어요"라며 나갔다.' },
        { p: 0.4, fx: { eval: -6, mental: 2 }, result: '퇴사자가 SNS에 "인사팀도 인정함"이라고 올렸다.' },
      ] },
    ],
  },
  {
    id: 'd_hr_a', dept: 'hr', prop: 'mail', phase: 'am', who: 'boss',
    text: '채용 공고를 올린 지 2주. 지원자 0명. 부장님: "우리 회사 그렇게 별로야?"',
    options: [
      { label: '공고 문구를 다시 쓴다', fx: { hp: -6, eval: 4 },
        result: '"가족 같은 회사"를 지웠더니 지원자가 생겼다.' },
      { label: '연봉 정보를 공개하자고 한다', rolls: [
        { p: 0.4, fx: { eval: 6, mental: 4 }, result: '지원자가 30명이 됐다. 숫자가 답이었다.' },
        { p: 0.6, fx: { eval: -4, mental: -3 }, result: '"그건 대표님이 싫어하셔." 지원자는 계속 0명.' },
      ] },
      { label: '"요즘 다들 그래요"', fx: { mental: 2, eval: -2 },
        result: '부장님이 조금 안심했다. 문제는 그대로다.' },
    ],
  },
  {
    id: 'd_hr_l', dept: 'hr', scene: 'restaurant', phase: 'lunch', who: 'team',
    text: '점심 자리. 다른 팀 사람이 웃으며 묻는다. "인사팀이면… 저 연봉 몇 등이에요?"',
    options: [
      { label: '"그건 말씀드릴 수 없어요"', fx: { mental: -2, eval: 2 },
        result: '정답이다. 분위기는 조금 식었다.' },
      { label: '농담으로 넘긴다', fx: { mental: 3 },
        result: '"1등이에요, 우리 마음속에서." 다들 웃었다. 위기 탈출.' },
      { label: '표정 관리에 실패한다', rolls: [
        { p: 0.5, fx: { mental: -4 }, result: '"아… 아니에요." 상대방이 눈치챘다. 아무 말도 안 했는데.' },
        { p: 0.5, fx: { eval: -8, mental: -6 }, result: '다음 날 "인사팀이 표정으로 다 알려 줌" 소문이 돌았다.' },
      ] },
    ],
  },
  {
    id: 'd_hr_p', dept: 'hr', scene: 'hrroom', phase: 'pm', who: 'team',
    text: '평가 시즌. 이의 신청이 12건 들어왔다. 첫 번째 사유: "제가 왜 B예요?"',
    options: [
      { label: '한 명 한 명 면담한다', fx: { hp: -10, mental: -6, eval: 5 },
        result: '12명 모두 자기가 A라고 생각했다. 회사에는 A만 있다.' },
      { label: '평가 기준표를 전체 공지한다', rolls: [
        { p: 0.5, fx: { eval: 4, mental: 3 }, result: '이의 신청이 3건으로 줄었다. 투명성의 힘.' },
        { p: 0.5, fx: { mental: -8 }, result: '기준표에 대한 이의 신청이 들어왔다.' },
      ] },
      { label: '팀장들에게 돌려보낸다', fx: { mental: 3, eval: -3 },
        result: '팀장들이 다시 인사팀으로 보냈다. 공은 둥글다.' },
    ],
  },
  {
    id: 'd_hr_o', dept: 'hr', scene: 'meeting', phase: 'off', who: 'ceo',
    text: '대표님: "이번 워크숍은 직원들이 진짜 즐거운 걸로 해 봐요. 토요일에."',
    options: [
      { label: '"토요일은 좀…" 이라고 말씀드린다', rolls: [
        { p: 0.4, fx: { eval: 4, mental: 6 }, result: '"그래, 금요일로 하지." 직원들이 나를 숭배한다.' },
        { p: 0.6, fx: { eval: -5, mental: -3 }, result: '"주말이어야 일 걱정 없이 놀지." 논리가 단단하다.' },
      ] },
      { label: '레크리에이션을 열심히 기획한다', fx: { hp: -8, eval: 5 },
        result: '레크리에이션 강사를 섭외했다. 직원 만족도 조사 결과: "집에 가고 싶었다."' },
      { label: '"자유 시간"을 일정에 많이 넣는다', fx: { eval: 2, mental: 3 },
        result: '직원들이 가장 좋아한 프로그램: 자유 시간.' },
    ],
  },

  // ───────── 재무팀 ─────────
  {
    id: 'd_fin_m', dept: 'fin', prop: 'excel', phase: 'morning', who: 'boss',
    text: '월말 마감 D-1. 숫자가 3,200원 안 맞는다.',
    options: [
      { label: '찾을 때까지 판다', fx: { hp: -10, eval: 5 },
        result: '밤 9시에 찾았다. 커피 영수증 한 장이 두 번 들어가 있었다.' },
      { label: '"잡손실"로 처리한다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '마감 완료. 3,200원은 우주로 갔다.' },
        { p: 0.5, fx: { eval: -9 }, result: '감사 때 정확히 그 3,200원을 물어봤다.' },
      ] },
      { label: '팀원들과 나눠서 찾는다', fx: { eval: 2, mental: 2 },
        result: '신입이 10분 만에 찾았다. 신입의 눈이 제일 맑다.' },
    ],
  },
  {
    id: 'd_fin_a', dept: 'fin', phase: 'am', who: 'boss',
    text: '부장님 법인카드 사용 내역에 영수증이 없다. "아, 그거 거래처 미팅이었어. 기억은 잘 안 나는데."',
    options: [
      { label: '규정대로 영수증을 요청한다', fx: { eval: -2, mental: 3 },
        result: '부장님이 나를 "원칙주의자"라고 불렀다. 칭찬은 아니다.' },
      { label: '대충 처리해 드린다', rolls: [
        { p: 0.5, fx: { eval: 4 }, result: '"역시 일 잘하네." 다음 달에도 영수증이 없었다.' },
        { p: 0.5, fx: { eval: -10, mental: -6 }, result: '감사팀이 그 건을 짚었다. 처리한 사람: 나.' },
      ] },
      { label: '카드사 내역으로 가게를 찾아본다', fx: { hp: -4, eval: 3 },
        result: '가게 이름: "○○ 노래방". 거래처 미팅이었다고 한다.' },
    ],
  },
  {
    id: 'd_fin_l', dept: 'fin', prop: 'chat', phase: 'lunch', who: 'team',
    text: '점심값 정산 단톡방. "1인당 11,333원입니다." 누군가 묻는다. "재무팀이 계산했으니 맞겠죠?"',
    options: [
      { label: '원 단위까지 정확히 보낸다', fx: { mental: -2, eval: 1 },
        result: '3원 차이로 동기가 "역시 재무팀"이라고 했다. 칭찬인지 모르겠다.' },
      { label: '"그냥 1만 원씩 보내"', fx: { cash: -4000, mental: 3 },
        result: '모자란 4천 원은 내가 냈다. 마음의 평화 값.' },
      { label: '정산 앱 링크를 보낸다', fx: { mental: 2 },
        result: '세 명이 앱을 깔다가 포기했다. 결국 계좌 번호를 보냈다.' },
    ],
  },
  {
    id: 'd_fin_p', dept: 'fin', scene: 'meeting', phase: 'pm', who: 'ceo',
    text: '외부 감사 첫날. 감사인이 첫 질문을 한다. "이 계정, 3년 전부터 잔액이 똑같네요?"',
    options: [
      { label: '아는 대로 솔직히 답한다', fx: { eval: 2, mental: -4 },
        result: '"모릅니다"라고 했다. 그게 제일 정확한 답이었다.' },
      { label: '전임자 자료를 뒤진다', rolls: [
        { p: 0.5, fx: { eval: 6, hp: -6 }, result: '3년 전 메일을 찾았다. 전임자는 다 적어 놓고 갔다. 존경한다.' },
        { p: 0.5, fx: { hp: -10, mental: -6 }, result: '전임자의 폴더 이름: "나중에". 안은 비어 있었다.' },
      ] },
      { label: '"확인 후 회신드리겠습니다"', fx: { mental: 2, eval: -1 },
        result: '감사인 노트에 "확인 필요" 항목이 하나 늘었다.' },
    ],
  },
  {
    id: 'd_fin_o', dept: 'fin', phase: 'off', who: 'phone',
    text: '퇴근 직전 마케팅팀 전화. "예산이 좀 모자라서요… 500만 원만 더 될까요? 오늘까지요."',
    options: [
      { label: '규정대로 거절한다', fx: { mental: 3, eval: 2 },
        result: '"재무팀은 너무 깐깐해." 그게 재무팀의 일이다.' },
      { label: '부장님께 올린다', fx: { hp: -4 },
        result: '부장님이 "알아서 해"라고 했다. 공이 다시 왔다.' },
      { label: '사정을 들어 보고 일부만 승인한다', rolls: [
        { p: 0.5, fx: { eval: 5, mental: 3 }, result: '마케팅팀이 커피를 돌렸다. 협업의 맛.' },
        { p: 0.5, fx: { eval: -6 }, result: '다음 날 영업팀도 전화했다. "마케팅은 해 줬다면서요?"' },
      ] },
    ],
  },

  // ───────── 디자인팀 ─────────
  {
    id: 'd_design_m', dept: 'design', prop: 'chat', phase: 'morning', who: 'boss',
    text: '아침 메신저. "이 느낌 아시죠? 그 뭐랄까, 고급스러운데 친근한? 레퍼런스는 없어요."',
    options: [
      { label: '시안을 다섯 개 만든다', fx: { hp: -10, eval: 4 },
        result: '"음, 이 느낌은 아닌데…" 그 느낌은 부장님 마음속에만 있다.' },
      { label: '레퍼런스를 찾아 달라고 한다', rolls: [
        { p: 0.5, fx: { eval: 4, mental: 3 }, result: '레퍼런스가 왔다. 경쟁사 홈페이지였다. 방향은 잡혔다.' },
        { p: 0.5, fx: { mental: -6 }, result: '"그걸 찾는 게 디자이너 일 아니에요?"' },
      ] },
      { label: '질문 열 개로 범위를 좁힌다', fx: { mental: 2, eval: 2 },
        result: '열 번째 질문에서 부장님이 원하는 게 "파란색"이란 걸 알아냈다.' },
    ],
  },
  {
    id: 'd_design_a', dept: 'design', phase: 'am', who: 'ceo',
    text: '대표님 피드백: "로고를 좀 더 크게. 그리고 전체적으로 좀 더 화려하게."',
    options: [
      { label: '로고를 키운다', fx: { eval: 4, mental: -6 },
        result: '로고가 화면의 절반이 됐다. "음, 좋네." 디자이너의 영혼이 작아졌다.' },
      { label: '여백의 의미를 설명한다', rolls: [
        { p: 0.4, fx: { eval: 5, mental: 5 }, result: '"오, 그런 의도였구나." 대표님이 설득됐다.' },
        { p: 0.6, fx: { eval: -6 }, result: '"여백은 비어 보여요."' },
      ] },
      { label: '로고 크기 A·B안을 같이 보여 준다', fx: { hp: -4, eval: 3 },
        result: '대표님이 B안을 골랐다. 내가 원래 하려던 거다.' },
    ],
  },
  {
    id: 'd_design_l', dept: 'design', prop: 'mail', phase: 'lunch', who: 'none',
    text: '점심 먹다 메일 알림. 법무팀: "지난번 배너에 쓰신 폰트, 라이선스 확인되셨나요?"',
    options: [
      { label: '바로 확인한다', rolls: [
        { p: 0.6, fx: { mental: 4 }, result: '무료 폰트였다. 점심을 마저 먹었다.' },
        { p: 0.4, fx: { mental: -8, eval: -4 }, result: '상업용 유료 폰트였다. 배너 47개를 다시 만들어야 한다.' },
      ] },
      { label: '"제가 산 폰트예요"', fx: { mental: 2, eval: 1 },
        result: '개인 라이선스였다. 법무팀이 회사 명의로 다시 샀다.' },
      { label: '무료 폰트로 다 바꾼다', fx: { hp: -6, eval: 2 },
        result: '갈무리체로 바꿨다. 의외로 잘 어울린다.' },
    ],
  },
  {
    id: 'd_design_p', dept: 'design', scene: 'meeting', phase: 'pm', who: 'boss',
    text: '시안 30개를 보여 줬다. 부장님: "음… 1번이 제일 낫네."',
    options: [
      { label: '1번으로 간다', fx: { mental: -4, eval: 3 },
        result: '어제 오전 10시에 만든 1번. 나머지 29개는 포트폴리오로 간다.' },
      { label: '28번을 추천한다', rolls: [
        { p: 0.4, fx: { eval: 5, mental: 6 }, result: '"오, 보니까 28번도 좋네." 밤새 만든 보람이 있다.' },
        { p: 0.6, fx: { mental: -5 }, result: '"1번이 나아." 28번은 내 마음속 1번이다.' },
      ] },
      { label: '1번과 28번을 섞자고 한다', fx: { hp: -6, eval: 2 },
        result: '31번이 탄생했다. 아무도 만족하지 않았지만 다들 통과시켰다.' },
    ],
  },
  {
    id: 'd_design_o', dept: 'design', phase: 'off', who: 'boss',
    text: '마감 30분 전 최종 확인. 부장님: "음… 전체적으로 다시 한번 볼까?"',
    options: [
      { label: '전체적으로 다시 본다', fx: { hp: -14, eval: 5 },
        result: '새벽 2시. 바뀐 것: 버튼 모서리 2px.' },
      { label: '"어떤 부분이요?" 정확히 묻는다', rolls: [
        { p: 0.5, fx: { mental: 4, eval: 2 }, result: '"아, 이 글자만." 5분 만에 끝났다.' },
        { p: 0.5, fx: { mental: -6, hp: -6 }, result: '"전체적으로." 대화가 같은 자리를 돌았다.' },
      ] },
      { label: '마감은 지키고 수정은 다음 버전에', fx: { mental: 3, eval: -2 },
        result: '다음 버전은 영원히 오지 않았다. 다행이다.' },
    ],
  },

  // ───────── 고객지원팀 ─────────
  {
    id: 'd_cs_m', dept: 'cs', phase: 'morning', who: 'phone',
    text: '9시 정각. 상담 대기 47건. 첫 전화가 울린다.',
    options: [
      { label: '심호흡하고 받는다', fx: { mental: -4, eval: 3 },
        result: '"안녕하세요, {회사} 고객센터입니다." 오늘 이 말을 112번 할 예정이다.' },
      { label: '자주 묻는 질문 공지를 먼저 올린다', rolls: [
        { p: 0.5, fx: { eval: 5, mental: 4 }, result: '대기가 반으로 줄었다. 공지를 읽는 사람이 있었다.' },
        { p: 0.5, fx: { mental: -4 }, result: '공지를 읽고 "공지 보고 전화했는데요" 전화가 왔다.' },
      ] },
      { label: '커피부터 탄다', fx: { mental: 3, eval: -3 },
        result: '커피를 타는 동안 대기가 62건이 됐다.' },
    ],
  },
  {
    id: 'd_cs_a', dept: 'cs', phase: 'am', who: 'phone',
    text: '고객: "제가 누군지 알아요? 당장 책임자 바꿔요!"',
    options: [
      { label: '차분하게 끝까지 듣는다', fx: { mental: -10, eval: 4 },
        result: '42분 통화. 마지막에 "고마워요"라고 했다. 그래도 울고 싶다.' },
      { label: '팀장님께 넘긴다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '팀장님이 3분 만에 해결했다. 연차의 힘.' },
        { p: 0.5, fx: { eval: -5, mental: -3 }, result: '팀장님이 "이걸 왜 넘겨?" 하더니 다시 넘겼다.' },
      ] },
      { label: '매뉴얼대로 응대한다', fx: { mental: -4, eval: 2 },
        result: '매뉴얼 17페이지 "고객이 소리를 지를 때". 효과는 반반이었다.' },
    ],
  },
  {
    id: 'd_cs_l', dept: 'cs', scene: 'pantry', phase: 'lunch', who: 'none',
    text: '점심시간인데 상담 대기가 30건이다. 교대할 사람은 아직 밥을 먹고 있다.',
    options: [
      { label: '밥을 10분 만에 먹고 복귀한다', fx: { hp: -6, eval: 4 },
        result: '체할 것 같다. 대기는 25건이 됐다.' },
      { label: '점심시간을 다 쓴다', fx: { hp: 5, mental: 4, eval: -2 },
        result: '돌아오니 대기 51건. 그래도 밥은 먹어야 한다.' },
      { label: '김밥을 먹으며 채팅 상담을 한다', fx: { eval: 3, mental: -3 },
        result: '고객에게 "ㅇ"를 잘못 보냈다. 김밥 때문이다.' },
    ],
  },
  {
    id: 'd_cs_p', dept: 'cs', prop: 'mail', phase: 'pm', who: 'none',
    text: '고객 칭찬 메일이 왔다. "상담원님 덕분에 해결했어요. 꼭 칭찬해 주세요."',
    options: [
      { label: '캡처해서 팀 단톡에 올린다', fx: { mental: 8, eval: 2 },
        result: '팀원들이 박수 이모티콘을 보냈다. 오늘은 이걸로 버틴다.' },
      { label: '조용히 저장해 둔다', fx: { mental: 6 },
        result: '"힘든 날 볼 것" 폴더에 넣었다. 폴더에 메일이 세 개 있다.' },
      { label: '평가 자료로 인사팀에 보낸다', rolls: [
        { p: 0.5, fx: { eval: 6 }, result: '인사팀이 "우수 사례"로 공유했다.' },
        { p: 0.5, fx: { eval: 1, mental: -3 }, result: '"참고하겠습니다." 답장이 그게 다였다.' },
      ] },
    ],
  },
  {
    id: 'd_cs_o', dept: 'cs', prop: 'mail', phase: 'off', who: 'none',
    text: '5시 58분. 장문의 민원이 접수됐다. A4 네 장 분량. 제목: "마지막 경고입니다".',
    options: [
      { label: '오늘 안에 답변한다', fx: { hp: -10, eval: 5, mental: -4 },
        result: '8시에 답변했다. 고객이 8시 1분에 다섯 번째 장을 보냈다.' },
      { label: '내일 아침 첫 업무로 미룬다', rolls: [
        { p: 0.6, fx: { mental: 4 }, result: '다음 날 아침, 고객이 "해결됐어요, 죄송해요" 메일을 보냈다.' },
        { p: 0.4, fx: { eval: -8, mental: -5 }, result: '밤사이 "답변이 없네요" 메일이 7통 더 왔다.' },
      ] },
      { label: '"접수되었습니다" 자동 답변만 보낸다', fx: { mental: 2, eval: -2 },
        result: '자동 답변에 대한 민원이 접수됐다.' },
    ],
  },
);
