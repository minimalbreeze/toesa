// 선택형 이벤트. 문장을 고치거나 새 이벤트를 넣을 때는 이 파일만 고치면 된다.
//
// phase: morning(09:00) / am(10:30) / lunch(12:30) / pm(15:00) / off(17:55)
// who:   boss / peer / newbie / hr / team / phone / ceo / none  (config.js의 T.WHO)
// scene: 그림 배경. office(기본) / elevator / meeting / subway / restaurant / street /
//        bedroom / bar / hrroom / toilet / pantry
// dept:  이 부서일 때만 나오는 이벤트 (js/data/dept-events.js)
// prop:  사무실 소품. excel / mail / chat / sleepy / parcel / cake / update / printer / video / nowifi / rain(street)
// fx:    hp 체력, mental 멘탈, cash 현금, eval 평가,
//        salary 월급(영구), living 생활비(영구), side 지금 키우는 부업 진도
// rolls: 결과가 운에 따라 갈리는 선택지. p는 확률(합이 1).
//        함수로 쓰면 지금 상태(s)를 보고 확률을 바꿀 수 있다.
// 선택지 아래 작은 힌트(평가▲ 체력▼)는 fx를 보고 자동으로 만든다.

T.EVENTS = [
  // ───────── 09:00 출근 ─────────
  {
    id: 'm_elevator', scene: 'elevator', phase: 'morning', who: 'boss',
    text: '엘리베이터 문이 닫히는 순간, 저 멀리서 부장님이 뛰어온다.',
    options: [
      { label: '열림 버튼을 누른다', fx: { eval: 3, mental: -8 },
        result: '15층까지 단둘이. "요즘 젊은 사람들은 말이야…" 아침부터 강의 한 편을 들었다.' },
      { label: '닫힘 버튼을 누른다', rolls: [
        { p: 0.5, fx: { mental: 6 }, result: '문이 닫혔다. 평화로운 아침이다.' },
        { p: 0.5, fx: { mental: 3, eval: -8 }, result: '문틈으로 부장님과 눈이 마주쳤다. 닫힘 버튼 위의 내 손가락도 보셨다.' },
      ] },
      { label: '휴대폰을 보는 척한다', fx: { mental: -3 },
        result: '결국 같이 탔다. 15층까지 휴대폰 화면만 계속 내렸다. 아무것도 안 떠 있었다.' },
    ],
  },
  {
    id: 'm_late', scene: 'street', phase: 'morning', who: 'none',
    text: '8시 59분 30초. 지하철 문이 열렸다. 회사까지 뛰면 3분 거리다.',
    options: [
      { label: '전력 질주한다', fx: { hp: -10, eval: 1 },
        result: '9시 1분 도착. 아무도 몰랐다. 대신 셔츠가 다 젖었다.' },
      { label: '어차피 늦은 거, 걷는다', rolls: [
        { p: 0.6, fx: { mental: 5 }, result: '팀장님 자리가 비어 있었다. 오늘은 운이 좋다.' },
        { p: 0.4, fx: { mental: 2, eval: -8 }, result: '자리에 앉는 순간 팀장님이 시계를 봤다. 아무 말도 안 했다. 그게 더 무섭다.' },
      ] },
      { label: '"외근 중입니다" 메신저를 보낸다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '"네~" 답장이 왔다. 회사 앞 편의점에서 김밥을 먹고 들어갔다.' },
        { p: 0.5, fx: { eval: -15, mental: -5 }, result: '"무슨 외근요?" 팀장님은 오늘 내 일정을 다 알고 있었다.' },
      ] },
    ],
  },
  {
    id: 'm_coffee', scene: 'pantry', phase: 'morning', who: 'none',
    text: '탕비실 커피 머신 앞. 원두가 떨어졌다는 불이 깜빡인다.',
    options: [
      { label: '새 원두를 채운다', fx: { hp: -3, eval: 2 },
        result: '원두를 채웠다. 아무도 고마워하지 않았지만, 다들 맛있게 마셨다.' },
      { label: '편의점 커피를 사 온다', fx: { cash: -2500, mental: 5 },
        result: '2,500원으로 평화를 샀다.' },
      { label: '다음 사람에게 맡긴다', rolls: [
        { p: 0.5, fx: { mental: 3 }, result: '조용히 자리로 돌아왔다. 아무도 몰랐다.' },
        { p: 0.5, fx: { eval: -5, mental: -3 }, result: '뒤에서 부장님 목소리가 들린다. "누가 원두 다 쓰고 그냥 갔어?"' },
      ] },
    ],
  },
  {
    id: 'm_weekly', prop: 'excel', phase: 'morning', who: 'none',
    text: '주간 회의 자료를 아직 안 만들었다. 회의는 10분 뒤다.',
    options: [
      { label: '지난주 자료의 날짜만 바꾼다', rolls: [
        { p: 0.7, fx: { mental: 3 }, result: '아무도 눈치채지 못했다. 이게 회사다.' },
        { p: 0.3, fx: { eval: -10, mental: -5 }, result: '"이거 지난주랑 똑같은데?" 신입이 말했다. 눈치가 없는 건지, 용감한 건지.' },
      ] },
      { label: '솔직하게 말한다', fx: { eval: -5, mental: 4 },
        result: '"오후까지 드리겠습니다." 말하고 나니 오히려 마음이 편했다.' },
      { label: '화장실에서 10분 버틴다', rolls: [
        { p: 0.5, fx: { mental: 6 }, result: '나와 보니 회의가 다음 주로 미뤄져 있었다. 기도가 통했다.' },
        { p: 0.5, fx: { eval: -8, hp: -3 }, result: '나와 보니 다들 회의실에서 나만 기다리고 있었다.' },
      ] },
    ],
  },
  {
    id: 'm_hello', phase: 'morning', who: 'team',
    text: '사무실에 들어섰다. 아무도 고개를 들지 않는다. 모두 이어폰을 꽂고 있다.',
    options: [
      { label: '크게 "안녕하십니까!"', fx: { eval: 3, mental: -3 },
        result: '다들 깜짝 놀랐다. 부장님만 흐뭇하게 고개를 끄덕였다.' },
      { label: '조용히 자리에 앉는다', fx: { mental: 3 },
        result: '아무 일도 일어나지 않았다. 직장인에게 그건 좋은 일이다.' },
      { label: '나도 이어폰을 꽂는다', fx: { mental: 5, eval: -2 },
        result: '노이즈 캔슬링을 켰다. 회사가 조금 멀어졌다.' },
    ],
  },
  {
    id: 'm_sick', scene: 'bedroom', phase: 'morning', who: 'none',
    text: '아침에 눈을 떴는데 몸이 으슬으슬하다. 목도 칼칼하다.',
    options: [
      { label: '그래도 출근한다', fx: { hp: -12, eval: 3 },
        result: '마스크를 쓰고 출근했다. "아프면 쉬지 그랬어~" 그럼 쉬라고 하시지.' },
      { label: '반차를 쓴다', fx: { hp: 15, eval: -3 },
        result: '오전 내내 잤다. 오후에 출근하니 다들 바빠서 내가 없었던 걸 몰랐다.' },
      { label: '커피 두 잔으로 버틴다', fx: { hp: -4, mental: 2, cash: -9000 },
        result: '아이스 아메리카노 두 잔. 몸은 떨리는데 정신은 맑다.' },
    ],
  },

  // ───────── 10:30 오전 ─────────
  {
    id: 'a_meeting', scene: 'meeting', phase: 'am', who: 'team',
    text: '아무 결론 없는 회의가 1시간째다. "그럼 이건 다음 주에 다시 논의하죠."',
    options: [
      { label: '열심히 메모하는 척한다', fx: { eval: 2, mental: -5 },
        result: '노트에는 점심 메뉴 후보 세 개가 적혀 있다.' },
      { label: '의견을 하나 낸다', rolls: [
        { p: 0.5, fx: { eval: 6, hp: -8 }, result: '"오, 좋네. 그럼 그거 자네가 맡아." 일이 하나 늘었다.' },
        { p: 0.5, fx: { mental: -8 }, result: '정적. 누군가 헛기침을 했다. 회의는 그대로 끝났다.' },
      ] },
      { label: '노트북으로 몰래 부업을 한다', fx: { side: 1, eval: -3 },
        result: '회의 중에 부업 진도를 조금 뺐다. 화면 밝기는 최저로.' },
    ],
  },
  {
    id: 'a_excel', prop: 'excel', phase: 'am', who: 'boss',
    text: '부장님이 부른다. "엑셀이 깨졌어." 가 보니 화면 확대가 400%다.',
    options: [
      { label: '조용히 100%로 돌린다', fx: { eval: 4 },
        result: '"역시 젊은 사람이 빨라." 3초 걸렸다.' },
      { label: '원리를 친절하게 설명한다', fx: { eval: 2, mental: -6 },
        result: '10분째 설명하는 중이다. 부장님은 끝까지 "그러니까 깨진 거지?"라고 했다.' },
      { label: '"IT팀에 문의해 보시죠"', fx: { eval: -3, mental: 3 },
        result: 'IT팀 담당자가 와서 3초 만에 고쳤다. 부장님이 나를 한 번 쳐다봤다.' },
    ],
  },
  {
    id: 'a_cc', prop: 'mail', phase: 'am', who: 'none',
    text: '메일이 왔다. 내 실수를 지적하는 내용이다. 참조(CC)에 대표님이 들어가 있다.',
    options: [
      { label: '정중하게 사과 답장을 쓴다', fx: { eval: -3, mental: -5 },
        result: '"확인이 늦어 죄송합니다." 이 문장을 쓰는 데 20분 걸렸다.' },
      { label: '반박 근거를 붙여 전체 회신', rolls: [
        { p: 0.5, fx: { eval: 8, mental: 5 }, result: '근거가 완벽했다. 대표님이 "확인했습니다"라고 답장했다. 사무실이 조용해졌다.' },
        { p: 0.5, fx: { eval: -10, mental: -8 }, result: '첨부 파일을 안 붙였다. 전체 회신으로.' },
      ] },
      { label: '못 본 척한다', rolls: [
        { p: 0.5, fx: { mental: 3 }, result: '다른 메일에 묻혀서 다들 잊어버렸다.' },
        { p: 0.5, fx: { eval: -6 }, result: '"메일 확인 안 해요?" 팀장님이 자리로 찾아왔다.' },
      ] },
    ],
  },
  {
    id: 'a_newbie', phase: 'am', who: 'newbie',
    text: '신입이 엑셀 단축키를 물어본다. 나도 모르는 단축키다.',
    options: [
      { label: '같이 검색해 본다', fx: { mental: 2, eval: 1 },
        result: '둘이서 3분 만에 찾았다. 신입이 "선배도 모르는 게 있네요"라고 웃었다.' },
      { label: '아는 척 Ctrl+Alt+Delete', fx: { mental: -3, eval: -2 },
        result: '신입 컴퓨터가 잠겼다. 저장 안 한 파일이 있었다고 한다.' },
      { label: '"그건 감으로 하는 거야"', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '신입이 존경의 눈빛으로 바라본다. 뭔가 대단한 걸 말한 기분이다.' },
        { p: 0.5, fx: { mental: -4 }, result: '"아… 네." 신입이 조용히 유튜브를 켰다.' },
      ] },
    ],
  },
  {
    id: 'a_report', prop: 'excel', phase: 'am', who: 'boss',
    text: '보고서 초안을 올렸다. 피드백이 왔다. "폰트가 좀 촌스럽네." 내용 얘기는 없다.',
    options: [
      { label: '폰트를 12번 바꿔 본다', fx: { hp: -6, eval: 3 },
        result: '결국 처음 폰트로 확정됐다. "이게 낫네."' },
      { label: '내용을 보강해서 다시 낸다', fx: { hp: -8, eval: 5 },
        result: '이번엔 내용 얘기를 들었다. "음, 이건 좋네." 처음이다.' },
      { label: '폰트 하나만 바꿔서 다시 낸다', fx: { eval: 2, mental: 2 },
        result: '"오, 이거 좋다." 바꾼 건 폰트뿐이다.' },
    ],
  },
  {
    id: 'a_chat', prop: 'chat', phase: 'am', who: 'boss',
    text: '팀 단톡방에 부장님이 아재 개그를 올렸다. 3분째 아무도 반응이 없다.',
    options: [
      { label: 'ㅋㅋㅋㅋㅋㅋㅋ', fx: { eval: 3, mental: -4 },
        result: '내가 쳤더니 다들 따라 쳤다. 나는 오늘 팀을 구했다.' },
      { label: '이모티콘 하나만 보낸다', fx: { eval: 1 },
        result: '웃는 이모티콘 하나. 가장 안전한 선택이다.' },
      { label: '읽고 나간다', fx: { eval: -3, mental: 3 },
        result: '숫자 1이 하나 줄었다. 누군지 다 안다.' },
    ],
  },

  // ───────── 12:30 점심 ─────────
  {
    id: 'l_menu', scene: 'restaurant', phase: 'lunch', who: 'boss',
    text: '"뭐 먹을래?" "아무거나요." "그럼 국밥?" "아, 국밥은 좀…"',
    options: [
      { label: '부장님 픽을 따른다', fx: { hp: 5, cash: -9000, eval: 2 },
        result: '결국 제육볶음. 생각보다 맛있었다. 부장님이 계산했다.' },
      { label: '혼밥을 선언한다', fx: { mental: 8, cash: -8000, eval: -2 },
        result: '혼자 먹는 김치찌개. 오늘 하루 중 제일 조용한 30분.' },
      { label: '싸 온 도시락을 꺼낸다', fx: { hp: 3, mental: 2 },
        result: '어제 남은 반찬으로 만든 도시락. 돈은 굳었다.' },
    ],
  },
  {
    id: 'l_treat', scene: 'restaurant', phase: 'lunch', who: 'boss',
    text: '점심 계산대 앞. 부장님이 지갑을 꺼내지 않는다. 다들 나를 본다.',
    options: [
      { label: '내가 낸다', fx: { cash: -48000, eval: 5 },
        result: '4명, 48,000원. "잘 먹었어~" 부장님이 제일 먼저 나갔다.' },
      { label: '더치페이를 제안한다', fx: { cash: -12000, mental: 2, eval: -3 },
        result: '"아 그래, 요즘은 그렇게 하지." 부장님 목소리가 조금 작아졌다.' },
      { label: '신발 끈을 묶는다', rolls: [
        { p: 0.6, fx: { mental: 5 }, result: '끈을 다 묶고 일어나니 계산이 끝나 있었다. 부장님이 냈다.' },
        { p: 0.4, fx: { cash: -12000, mental: -5 }, result: '모두가 신발 끈을 묶고 있었다. 사장님이 우리를 쳐다본다.' },
      ] },
    ],
  },
  {
    id: 'l_nap', prop: 'sleepy', phase: 'lunch', who: 'none',
    text: '점심시간이 20분 남았다. 눈꺼풀이 무겁다.',
    options: [
      { label: '책상에 엎드려 잔다', fx: { hp: 12 },
        result: '푹 잤다. 이마에 키보드 자국이 남았다. ㅁㄴㅇㄹ.' },
      { label: '회사 근처를 산책한다', fx: { hp: 5, mental: 6 },
        result: '햇볕을 쬐었다. 회사 건물이 멀리서 보니 작았다.' },
      { label: '부업을 조금 한다', fx: { side: 1, hp: -5 },
        result: '점심시간 20분으로 부업 진도를 뺐다. 퇴사 준비는 점심시간에 하는 거다.' },
    ],
  },
  {
    id: 'l_stock', scene: 'pantry', phase: 'lunch', who: 'peer',
    text: '동기가 속삭인다. "이거 무조건 오른대. 우리 삼촌 친구가 거기 다녀."',
    options: [
      { label: '30만 원을 넣는다', rolls: [
        { p: 0.4, fx: { cash: 450000, mental: 10 }, result: '진짜 올랐다! 삼촌 친구님 감사합니다.' },
        { p: 0.6, fx: { cash: -180000, mental: -10 }, result: '다음 날 -60%. 삼촌 친구는 거기 퇴사했다고 한다.' },
      ] },
      { label: '10만 원만 넣는다', rolls: [
        { p: 0.5, fx: { cash: 80000, mental: 3 }, result: '조금 올랐다. 치킨 한 마리 값이다.' },
        { p: 0.5, fx: { cash: -60000, mental: -3 }, result: '조금 내렸다. 수업료라고 생각하기로 했다.' },
      ] },
      { label: '안 산다', rolls: [
        { p: 0.5, fx: { mental: -6 }, result: '다음 날 상한가. 동기가 계속 웃고 다닌다.' },
        { p: 0.5, fx: { mental: 6 }, result: '다음 날 반토막. 동기가 점심을 거른다.' },
      ] },
    ],
  },
  {
    id: 'l_parcel', prop: 'parcel', phase: 'lunch', who: 'boss',
    text: '회사로 택배가 왔다. 상자에 큰 글씨로 "고양이 코스튬 (성인용)"이라고 적혀 있다. 부장님이 본다.',
    options: [
      { label: '"조카 선물이에요"', fx: { mental: -2 },
        result: '"조카가 성인이야?" 대답하지 못했다.' },
      { label: '"제 고양이 거예요"', fx: { mental: -4, eval: 2 },
        result: '부장님이 자기 고양이 사진 32장을 보여 줬다. 점심시간이 끝났다.' },
      { label: '"제가 입을 거예요"', fx: { mental: 7, eval: -3 },
        result: '정적. 그날 이후로 아무도 내 택배를 묻지 않는다.' },
    ],
  },
  {
    id: 'l_subs', scene: 'pantry', phase: 'lunch', who: 'none',
    text: '커피를 마시는데 결제 문자가 연달아 온다. 이번 달 구독료다. OTT 4개, 음악 2개, 클라우드 3개.',
    options: [
      { label: '싹 다 해지한다', fx: { living: -30000, mental: -5 },
        result: '생활비가 매달 3만 원 줄었다. 대신 오늘 밤 볼 게 없다.' },
      { label: '안 보는 거 하나만 해지한다', fx: { living: -8000 },
        result: '하나 해지했다. 나머지는 "언젠가 볼 거니까."' },
      { label: '못 본 척한다', fx: { mental: 3 },
        result: '알림을 지웠다. 문제도 같이 지워진 기분이다.' },
    ],
  },

  // ───────── 15:00 오후 ─────────
  {
    id: 'p_sleepy', prop: 'sleepy', phase: 'pm', who: 'none',
    text: '오후 3시. 모니터 속 글자들이 춤을 춘다.',
    options: [
      { label: '에너지 드링크를 마신다', fx: { hp: 10, mental: -2, cash: -2500 },
        result: '심장이 빨리 뛴다. 일도 빨리 된다. 아마도.' },
      { label: '화장실에서 5분 눈을 붙인다', rolls: [
        { p: 0.8, fx: { hp: 8 }, result: '딱 5분. 개운하다.' },
        { p: 0.2, fx: { hp: 15, eval: -8 }, result: '눈을 떠 보니 40분이 지나 있었다. 메신저 알림이 12개.' },
      ] },
      { label: '정신력으로 버틴다', fx: { hp: -6, eval: 2 },
        result: '버텼다. 뭘 했는지는 기억나지 않는다.' },
    ],
  },
  {
    id: 'p_urgent', prop: 'chat', phase: 'pm', who: 'none',
    text: '다른 팀에서 메신저가 왔다. "이거 급한 건데, 오늘 안에 가능하죠?" 내 일도 밀려 있다.',
    options: [
      { label: '"네, 가능합니다"', fx: { eval: 5, hp: -10 },
        result: '가능하게 만들었다. 내 일은 내일의 내가 할 거다.' },
      { label: '"내일 오전까지 드릴게요"', rolls: [
        { p: 0.6, fx: { mental: 2 }, result: '"넵 그럼 내일 부탁드려요~" 생각보다 안 급했다.' },
        { p: 0.4, fx: { eval: -5, mental: -3 }, result: '그 팀 팀장님이 우리 팀장님한테 전화했다.' },
      ] },
      { label: '"저희 팀장님께 여쭤봐 주세요"', fx: { mental: 3, eval: -2 },
        result: '공은 팀장님에게 넘어갔다. 팀장님이 나를 슬쩍 봤다.' },
    ],
  },
  {
    id: 'p_nego', scene: 'hrroom', phase: 'pm', who: 'hr', minMonth: 4, weight: 0.6,
    text: '인사팀에서 연봉 협상 면담을 하자고 한다. 테이블 위에 서류 한 장이 놓여 있다.',
    options: [
      { label: '주는 대로 받는다', fx: { salary: 50000, mental: -3 },
        result: '월급이 5만 원 올랐다. 물가는 그보다 더 올랐다.' },
      { label: '성과를 근거로 요구한다', hint: '평가가 60 이상이면 유리', rolls: s => s.eval >= 60
        ? [ { p: 1, fx: { salary: 250000, mental: 5 }, result: '그동안 쌓은 평가가 말해 줬다. 월급이 25만 원 올랐다.' } ]
        : [ { p: 1, fx: { salary: 50000, mental: -8 }, result: '"성과요? 어떤 거요?" 할 말이 없었다. 월급 5만 원 인상.' } ] },
      { label: '"다른 데서 오퍼가 왔어요" (거짓말)', rolls: [
        { p: 0.4, fx: { salary: 400000, mental: 5 }, result: '인사팀 표정이 굳더니 월급을 40만 원 올려 줬다. 연기 대상감이다.' },
        { p: 0.6, fx: { eval: -10, mental: -15 }, result: '"아, 그럼 가셔도 돼요." 오퍼는 없다.' },
      ] },
    ],
  },
  {
    id: 'p_cake', prop: 'cake', phase: 'pm', who: 'team',
    text: '사무실에 생일 케이크가 도착했다. 누구 생일인지 아무도 모른다.',
    options: [
      { label: '일단 먹는다', fx: { hp: 4, mental: 4 },
        result: '맛있었다. 누구 생일인지는 끝까지 몰랐다.' },
      { label: '누구 생일인지 조사한다', fx: { mental: -3, eval: 3 },
        result: '팀장님 생일이었다. 롤링 페이퍼에 한 줄을 써야 한다. "늘 감사합니다." 30분 고민했다.' },
      { label: '다이어트 중이라고 사양한다', fx: { mental: -2, hp: 1 },
        result: '모두가 케이크를 먹는 동안 나는 물을 마셨다.' },
    ],
  },
  {
    id: 'p_survey', prop: 'mail', phase: 'pm', who: 'hr',
    text: '인사팀에서 "직원 만족도 조사" 메일이 왔다. 굵은 글씨로 "익명 보장"이라고 적혀 있다.',
    options: [
      { label: '솔직하게 쓴다', rolls: [
        { p: 0.7, fx: { mental: 8 }, result: '하고 싶은 말을 다 썼다. 속이 시원하다.' },
        { p: 0.3, fx: { mental: -5, eval: -10 }, result: '다음 날 부장님이 말했다. "누가 이렇게 썼는지 대충 알겠더라."' },
      ] },
      { label: '전부 "매우 만족"', fx: { mental: -5 },
        result: '모든 칸에 5점을 찍었다. 내 영혼도 같이 제출했다.' },
      { label: '안 한다', fx: { mental: -3 },
        result: '독촉 메일이 세 통 왔다. 세 번째 메일 제목: "[필수] 미참여자 명단 공유 예정"' },
    ],
  },
  {
    id: 'p_bonus', prop: 'mail', phase: 'pm', who: 'hr', weight: 0.5,
    text: '명절 보너스 공지가 올라왔다. 마지막 줄: "※ 온누리상품권으로 지급됩니다."',
    options: [
      { label: '감사히 받는다', fx: { cash: 200000, mental: -2 },
        result: '20만 원어치 상품권. 전통시장에서 장을 봤다. 나쁘지 않았다.' },
      { label: '상품권을 현금으로 바꾼다', fx: { cash: 185000 },
        result: '수수료를 떼고 18만 5천 원. 현금은 정직하다.' },
      { label: '부모님께 드린다', fx: { mental: 12 },
        result: '"뭘 이런 걸 다…" 엄마 목소리가 좋았다.' },
    ],
  },

  // ───────── 17:55 퇴근 5분 전 ─────────
  {
    id: 'o_boss', phase: 'off', who: 'boss',
    text: '오후 5시 55분. 퇴근까지 5분.\n부장님이 다가온다.\n"이거 오늘까지 해 놓고 가는 게 좋겠는데?"',
    options: [
      { label: '알겠습니다.', fx: { eval: 6, hp: -15 },
        result: '밤 10시에 퇴근했다. 부장님은 6시 정각에 퇴근했다.' },
      { label: '내일 오전까지 하겠습니다.', rolls: [
        { p: 0.6, fx: { mental: 2 }, result: '"그래, 그럼 내일 아침에 보자." 생각보다 쉬웠다.' },
        { p: 0.4, fx: { eval: -5, mental: -3 }, result: '부장님이 아무 말 없이 한숨을 쉬었다. 그 한숨이 집까지 따라왔다.' },
      ] },
      { label: '이미 퇴근했습니다.', rolls: [
        { p: 0.5, fx: { mental: 10, eval: -2 }, result: '메신저 상태가 "퇴근"으로 바뀌어 있었다. 부장님은 내 자리가 빈 걸 보고 그냥 갔다.' },
        { p: 0.5, fx: { mental: 6, eval: -12 }, result: '"방금까지 여기 있었잖아?" 부장님은 내가 엘리베이터 타는 걸 봤다.' },
      ] },
    ],
  },
  {
    id: 'o_dinner', scene: 'bar', phase: 'off', who: 'boss',
    text: '"오늘 다들 별일 없지? 간단하게 한잔하자." 오늘 회식이 잡혔다.',
    options: [
      { label: '3차까지 간다', fx: { eval: 6, hp: -15, mental: -8, cash: -25000 },
        result: '노래방에서 부장님 18번을 세 번 들었다. 택시비 2만 5천 원.' },
      { label: '1차만 하고 빠진다', fx: { eval: 2, hp: -5 },
        result: '삼겹살만 먹고 나왔다. 가장 현명한 직장인의 선택.' },
      { label: '"집에 일이 생겨서요…"', fx: { mental: 5, eval: -4 },
        result: '집에 와서 라면을 끓였다. 일은 안 생겼다.' },
    ],
  },
  {
    id: 'o_update', prop: 'update', phase: 'off', who: 'none',
    text: '퇴근하려고 컴퓨터를 끄는데 화면에 뜬다. "업데이트 중… (1/47) 전원을 끄지 마십시오."',
    options: [
      { label: '끝날 때까지 기다린다', fx: { hp: -5, mental: -5 },
        result: '47개를 다 기다렸다. 7시 10분 퇴근.' },
      { label: '전원 버튼을 길게 누른다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '아무 일도 없었다. 컴퓨터는 생각보다 튼튼하다.' },
        { p: 0.5, fx: { eval: -5, mental: -3 }, result: '다음 날 아침 파란 화면이 반겨 줬다. IT팀에 전화했다.' },
      ] },
      { label: '그냥 두고 퇴근한다', fx: { mental: 5 },
        result: '컴퓨터는 혼자 열심히 업데이트하겠지. 나는 집에 간다.' },
    ],
  },
  {
    id: 'o_peer', phase: 'off', who: 'peer',
    text: '퇴근 직전, 옆자리 동기가 속삭인다. "나 다음 달에 퇴사해."',
    options: [
      { label: '진심으로 축하한다', fx: { mental: -5 },
        result: '"축하해!" 진심이었다. 근데 집에 오는 길이 유난히 길었다.' },
      { label: '비결을 묻는다', fx: { side: 1, mental: -2 },
        result: '"부업이 월급만큼 나와서." 그날 밤, 나도 부업 노트를 다시 열었다.' },
      { label: '서랍 속 사직서를 만져 본다', fx: { mental: 6 },
        result: '언젠가 낼 사직서. 아직은 아니지만, 있다는 것만으로 든든하다.' },
    ],
  },
  {
    id: 'o_call', scene: 'subway', phase: 'off', who: 'phone',
    text: '퇴근길 지하철. 회사 번호로 전화가 온다.',
    options: [
      { label: '받는다', fx: { mental: -8, eval: 3 },
        result: '"아, 별건 아니고~" 30분 통화했다. 별거였다.' },
      { label: '안 받는다', fx: { mental: -4 },
        result: '문자가 왔다. "급한 거 아니에요^^" 더 무섭다.' },
      { label: '비행기 모드를 켠다', rolls: [
        { p: 0.7, fx: { mental: 6 }, result: '세상이 조용해졌다. 오늘은 여기까지.' },
        { p: 0.3, fx: { mental: 3, eval: -10 }, result: '다음 날 알았다. 진짜 급한 거였다.' },
      ] },
    ],
  },
  {
    id: 'o_overtime', phase: 'off', who: 'team',
    text: '6시가 지났다. 팀 전체가 야근하는 분위기다. 아무도 먼저 일어나지 않는다.',
    options: [
      { label: '같이 버틴다', fx: { hp: -10, eval: 3 },
        result: '8시에 다 같이 일어났다. 아무도 일은 안 했다.' },
      { label: '"먼저 들어가 보겠습니다!"', fx: { mental: 6, eval: -3 },
        result: '용기를 냈다. 내가 일어나자 세 명이 따라 일어났다. 나는 영웅이다.' },
      { label: '모니터를 켜 둔 채 사라진다', rolls: [
        { p: 0.5, fx: { mental: 8 }, result: '화장실 가는 척 그대로 퇴근. 완벽한 작전이었다.' },
        { p: 0.5, fx: { mental: 4, eval: -10 }, result: '다음 날 아침, 모니터에 포스트잇이 붙어 있었다. "어디 갔어?"' },
      ] },
    ],
  },

  // ═════════ 2차 추가 이벤트 ═════════

  // ───────── 09:00 출근 ─────────
  {
    id: 'm_alarm', scene: 'bedroom', phase: 'morning', who: 'none',
    text: '알람이 울린다. 6시 50분. 다시 알림 버튼이 손 닿는 곳에 있다.',
    options: [
      { label: '바로 일어난다', fx: { hp: -3, mental: 2 },
        result: '일어났다. 상쾌하진 않다. 그래도 일어났다.' },
      { label: '5분만 더', rolls: [
        { p: 0.6, fx: { hp: 6 }, result: '5분이 이렇게 달콤할 수가.' },
        { p: 0.4, fx: { hp: 8, eval: -8 }, result: '눈을 떠 보니 8시 40분이었다.' },
      ] },
      { label: '알람 시계를 집어 던진다', fx: { mental: 5, cash: -15000 },
        result: '알람 시계가 박살 났다. 출근길에 새로 샀다.' },
    ],
  },
  {
    id: 'm_crowd', scene: 'subway', prop: 'crowd', phase: 'morning', who: 'none',
    text: '출근 지하철. 문이 열리자 사람들이 밀려든다. 내 얼굴이 누군가의 백팩에 붙었다.',
    options: [
      { label: '그대로 버틴다', fx: { hp: -8 },
        result: '네 정거장 동안 백팩 지퍼만 봤다.' },
      { label: '다음 열차를 탄다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '다음 열차는 텅 비어 있었다. 앉아서 갔다.' },
        { p: 0.5, fx: { hp: -4, eval: -6 }, result: '다음 열차도 꽉 찼다. 지각이다.' },
      ] },
      { label: '내려서 택시를 잡는다', fx: { cash: -23000, mental: 5 },
        result: '택시 안에서 미터기만 봤다. 23,000원.' },
    ],
  },
  {
    id: 'm_monday', phase: 'morning', who: 'boss',
    text: '월요일 아침. 부장님이 주말 등산 사진을 보여 주려고 휴대폰을 꺼낸다.',
    options: [
      { label: '감탄한다', fx: { eval: 3, mental: -5 },
        result: '사진 47장. 전부 같은 산, 같은 포즈다.' },
      { label: '"저도 등산 좋아해요"', rolls: [
        { p: 0.5, fx: { eval: 5, mental: -10 }, result: '다음 주 등산에 초대받았다. 토요일 새벽 5시 집합.' },
        { p: 0.5, fx: { eval: 4 }, result: '부장님이 신나서 등산 스틱을 추천해 줬다. 그걸로 끝났다.' },
      ] },
      { label: '바쁜 척 모니터를 본다', fx: { eval: -2, mental: 2 },
        result: '부장님이 다른 사람에게 갔다. 미안, 김 대리.' },
    ],
  },
  {
    id: 'm_seat', phase: 'morning', who: 'newbie',
    text: '출근했더니 내 자리에 모르는 사람이 앉아 있다.',
    options: [
      { label: '"저기, 여기 제 자리인데요"', fx: { mental: -2 },
        result: '다른 팀 신입이었다. 둘이 서로 다섯 번씩 사과했다.' },
      { label: '그냥 빈자리에 앉는다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '창가 자리였다. 오늘은 여기가 내 자리다.' },
        { p: 0.5, fx: { eval: -6 }, result: '부장님 자리였다.' },
      ] },
      { label: '커피를 사러 나간다', fx: { cash: -4500, mental: 2 },
        result: '돌아오니 자리가 비어 있었다. 기다림이 답이다.' },
    ],
  },
  {
    id: 'm_dress', phase: 'morning', who: 'boss',
    text: '오늘 입고 온 셔츠가 부장님 셔츠랑 똑같다. 색까지.',
    options: [
      { label: '커플룩이라고 웃어넘긴다', fx: { eval: 3, mental: -4 },
        result: '부장님이 같이 찍은 사진을 단톡방에 올렸다.' },
      { label: '재킷을 입고 버틴다', fx: { hp: -5 },
        result: '하루 종일 재킷을 입고 땀을 흘렸다.' },
      { label: '점심에 새 셔츠를 산다', fx: { cash: -39000, mental: 5 },
        result: '그 셔츠는 옷장 깊은 곳으로 갔다.' },
    ],
  },
  {
    id: 'm_ceo', scene: 'elevator', phase: 'morning', who: 'ceo',
    text: '엘리베이터에 대표님과 단둘이 탔다. 대표님이 묻는다. "자네 어느 팀이지?"',
    options: [
      { label: '팀 소개를 30초 안에 한다', rolls: [
        { p: 0.5, fx: { eval: 8, mental: 4 }, result: '"오, 똑똑하네." 하루 종일 기분이 좋았다.' },
        { p: 0.5, fx: { mental: -6 }, result: '말이 꼬였다. 우리 팀 이름을 틀리게 말했다.' },
      ] },
      { label: '"○○팀입니다." 짧게', fx: { eval: 1 },
        result: '"그래." 대화는 거기서 끝났다. 15층이 멀다.' },
      { label: '전화 받는 척한다', fx: { eval: -4, mental: 2 },
        result: '그 순간 진짜로 전화가 울렸다. 엄마였다. 크게.' },
    ],
  },
  {
    id: 'm_hangover', scene: 'bedroom', phase: 'morning', who: 'none',
    text: '어제 회식의 여파. 머리가 깨질 것 같다.',
    options: [
      { label: '해장국 먹고 출근한다', fx: { cash: -9000, hp: 6, eval: -2 },
        result: '10분 지각. 국물은 훌륭했다.' },
      { label: '숙취해소제 두 병', fx: { cash: -6000, hp: 3 },
        result: '효과가 있는 건지, 기분 탓인지.' },
      { label: '그냥 버틴다', fx: { hp: -10, eval: 2 },
        result: '하루 종일 모니터가 두 개로 보였다.' },
    ],
  },

  // ───────── 10:30 오전 ─────────
  {
    id: 'a_print', prop: 'printer', phase: 'am', who: 'none',
    text: '프린터에 종이가 걸렸다. 인쇄 중인 건 내 보고서다. 회의는 5분 뒤.',
    options: [
      { label: '직접 고친다', rolls: [
        { p: 0.5, fx: { eval: 3, mental: 3 }, result: '고쳤다. 다들 나를 기술자처럼 본다.' },
        { p: 0.5, fx: { hp: -4, mental: -6 }, result: '손에 토너가 묻었다. 셔츠에도 묻었다.' },
      ] },
      { label: '다른 층 프린터로 뛴다', fx: { hp: -6 },
        result: '18층에서 인쇄해서 계단으로 뛰어왔다. 회의 시작 10초 전.' },
      { label: '화면 공유로 대신한다', fx: { eval: -2, mental: 3 },
        result: '"요즘은 종이 안 쓰지." 의외로 부장님이 좋아했다.' },
    ],
  },
  {
    id: 'a_zoom', prop: 'video', phase: 'am', who: 'team',
    text: '화상 회의 중. 마이크가 켜진 줄 모르고 한숨을 쉬었다. 크게.',
    options: [
      { label: '아무 일 없던 척한다', fx: { mental: -6 },
        result: '아무도 말하지 않았다. 다들 들었다는 뜻이다.' },
      { label: '"아, 죄송합니다. 기침이…"', fx: { eval: -1, mental: -3 },
        result: '아무도 안 믿었다.' },
      { label: '화면을 멈추고 인터넷 탓을 한다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '"○○ 씨 연결이 끊겼나 봐요." 성공.' },
        { p: 0.5, fx: { eval: -8 }, result: '"○○ 씨, 화면 멈춘 거 다 보여요. 지금 웃고 계세요."' },
      ] },
    ],
  },
  {
    id: 'a_kpi', scene: 'meeting', phase: 'am', who: 'boss',
    text: '하반기 목표 회의. 부장님: "작년보다 30%는 올려야지?"',
    options: [
      { label: '"가능합니다!"', fx: { eval: 6, mental: -8 },
        result: '가능하다고 했다. 어떻게 할지는 모르겠다.' },
      { label: '"근거를 좀 보고…"', rolls: [
        { p: 0.5, fx: { eval: 5 }, result: '숫자로 설명했더니 15%로 조정됐다. 박수.' },
        { p: 0.5, fx: { eval: -6, mental: -4 }, result: '"그러니까 못 한다는 거지?"' },
      ] },
      { label: '고개만 끄덕인다', fx: { eval: 1, mental: -3 },
        result: '끄덕였을 뿐인데 회의록에 "동의"라고 적혔다.' },
    ],
  },
  {
    id: 'a_idea', phase: 'am', who: 'boss',
    text: '부장님이 어젯밤 유튜브를 보고 왔다. "우리도 AI 도입하자. 기획서 좀 써 와."',
    options: [
      { label: '밤새 기획서를 쓴다', fx: { eval: 6, hp: -10 },
        result: '기획서 20장. 부장님은 첫 장만 읽었다.' },
      { label: 'AI한테 기획서를 쓰라고 한다', rolls: [
        { p: 0.6, fx: { eval: 5, mental: 3 }, result: 'AI가 쓴 기획서가 올해 제일 칭찬받았다. 착잡하다.' },
        { p: 0.4, fx: { eval: -9, mental: -4 }, result: '기획서 첫 줄에 "물론이죠! 기획서를 작성해 드릴게요"가 그대로 남아 있었다.' },
      ] },
      { label: '"검토해 보겠습니다"', fx: { mental: 2 },
        result: '검토는 영원히 계속될 것이다.' },
    ],
  },
  {
    id: 'a_typo', prop: 'mail', phase: 'am', who: 'none',
    text: '전체 메일을 보냈다. 보내고 나서야 봤다. "감사합니다"가 "감사함니다"로 나갔다.',
    options: [
      { label: '정정 메일을 보낸다', fx: { eval: -1, mental: -4 },
        result: '정정 메일에도 오타가 있었다.' },
      { label: '그냥 둔다', fx: { mental: -2 },
        result: '아무도 신경 안 쓴다. 나만 신경 쓴다. 하루 종일.' },
      { label: '메일을 회수한다', rolls: [
        { p: 0.5, fx: { mental: 3 }, result: '회수 성공. 아무도 못 봤다.' },
        { p: 0.5, fx: { eval: -4, mental: -5 }, result: '"○○ 님이 메일 회수를 요청했습니다." 이 알림이 전 직원에게 갔다.' },
      ] },
    ],
  },
  {
    id: 'a_desk', phase: 'am', who: 'peer',
    text: '옆자리 동기가 키보드를 너무 세게 친다. 타닥타닥타닥타닥.',
    options: [
      { label: '조용히 말해 본다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '다음 날 동기가 무소음 키보드를 샀다. 착한 녀석.' },
        { p: 0.5, fx: { mental: -5 }, result: '"아 그래? 미안~" 다음 날 더 세게 친다.' },
      ] },
      { label: '이어폰을 낀다', fx: { mental: 2 },
        result: '노래 사이사이로 타닥타닥이 들린다.' },
      { label: '나도 세게 친다', fx: { mental: 4, eval: 2 },
        result: '둘이 경쟁하듯 쳤다. 팀장님이 "다들 열심히 하네" 했다.' },
    ],
  },
  {
    id: 'a_wifi', prop: 'nowifi', phase: 'am', who: 'team',
    text: '사무실 와이파이가 끊겼다. 팀 전체가 일을 못 한다.',
    options: [
      { label: 'IT팀에 전화한다', fx: { eval: 2, mental: -3 },
        result: '통화 대기 23분. 그사이 와이파이가 저절로 돌아왔다.' },
      { label: '휴대폰 핫스팟을 켠다', fx: { cash: -5000, eval: 3 },
        result: '나 혼자 일했다. 데이터가 줄어드는 소리가 들렸다.' },
      { label: '다 같이 커피 타임', fx: { mental: 8, eval: -1 },
        result: '팀이 이렇게 화목했던 적이 있었나.' },
    ],
  },

  // ───────── 12:30 점심 ─────────
  {
    id: 'l_salad', scene: 'restaurant', phase: 'lunch', who: 'team',
    text: '팀원들이 샐러드 가게에 가자고 한다. 1인분 15,000원.',
    options: [
      { label: '따라간다', fx: { cash: -15000, hp: 4, mental: -3 },
        result: '샐러드를 먹고 30분 뒤에 배가 고팠다.' },
      { label: '혼자 국밥을 먹으러 간다', fx: { cash: -9000, hp: 6, mental: 3 },
        result: '국밥은 배신하지 않는다.' },
      { label: '편의점 삼각김밥', fx: { cash: -2800, hp: 2 },
        result: '삼각김밥 포장을 한 번에 깔끔하게 뜯었다. 오늘의 성취.' },
    ],
  },
  {
    id: 'l_bank', scene: 'street', phase: 'lunch', who: 'none',
    text: '점심시간에 은행에 갔다. 대기 번호 47번. 지금 12번.',
    options: [
      { label: '기다린다', fx: { hp: -4, mental: -6 },
        result: '45분 기다려서 3분 만에 끝났다. 점심은 못 먹었다.' },
      { label: '앱으로 해 본다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '앱으로 1분 만에 끝났다. 은행은 왜 왔지.' },
        { p: 0.5, fx: { mental: -6 }, result: '앱이 말했다. "가까운 영업점을 방문해 주세요."' },
      ] },
      { label: '포기하고 밥 먹으러 간다', fx: { cash: -8000, hp: 5 },
        result: '은행 일은 내일의 나에게.' },
    ],
  },
  {
    id: 'l_walk', scene: 'street', phase: 'lunch', who: 'boss',
    text: '점심 먹고 산책하는데 부장님과 마주쳤다. "어, 같이 걷지."',
    options: [
      { label: '같이 걷는다', fx: { eval: 4, mental: -6 },
        result: '부장님의 신입 시절 이야기 3부작을 들었다.' },
      { label: '전화 받는 척한다', fx: { eval: -2, mental: 2 },
        result: '아무도 없는 수화기에 대고 "네, 네" 열 번 했다.' },
      { label: '"저 먼저 들어가 볼게요"', fx: { eval: -1, mental: 1 },
        result: '사무실 방향이 같았다. 결국 같이 걸었다.' },
    ],
  },
  {
    id: 'l_lotto', scene: 'street', phase: 'lunch', who: 'none',
    text: '점심 먹고 오는 길, 복권방 앞이다. 현수막: "1등 7번 나온 집".',
    options: [
      { label: '5천 원어치 산다', rolls: [
        { p: 0.85, fx: { cash: -5000, mental: 2 }, result: '꽝. 그래도 추첨 전까지 3일은 행복했다.' },
        { p: 0.14, fx: { cash: 50000, mental: 8 }, result: '5만 원 당첨! 오늘 치킨은 내가 쏜다.' },
        { p: 0.01, fx: { cash: 10000000, mental: 30 }, result: '1천만 원 당첨. 손이 떨린다. 아무한테도 말하지 않기로 했다.' },
      ] },
      { label: '그냥 지나간다', fx: { mental: -1 },
        result: '어차피 안 될 거다. 아마도.' },
      { label: '동기 것까지 사 준다', rolls: [
        { p: 0.9, fx: { cash: -10000, mental: 3 }, result: '둘 다 꽝. 동기가 커피를 샀다.' },
        { p: 0.1, fx: { cash: -10000, mental: -8 }, result: '동기 것이 5만 원 당첨됐다. 내 돈으로 산 건데.' },
      ] },
    ],
  },
  {
    id: 'l_queue', scene: 'restaurant', phase: 'lunch', who: 'none',
    text: '맛집 앞 줄이 30미터다. 점심시간은 50분 남았다.',
    options: [
      { label: '줄을 선다', rolls: [
        { p: 0.5, fx: { hp: 8, mental: 6, cash: -12000 }, result: '기다린 보람이 있었다. 인생 돈가스.' },
        { p: 0.5, fx: { hp: 4, eval: -5, cash: -12000 }, result: '10분 늦게 복귀했다. 돈가스는 맛있었다.' },
      ] },
      { label: '옆 가게로 간다', fx: { hp: 3, cash: -9000 },
        result: '나쁘지 않았다. 딱 나쁘지 않았다.' },
      { label: '컵라면', fx: { hp: 1, cash: -1500, mental: -2 },
        result: '사무실에 라면 냄새가 퍼졌다. 다들 쳐다본다.' },
    ],
  },
  {
    id: 'l_spill', scene: 'restaurant', phase: 'lunch', who: 'none',
    text: '짜장면을 먹다 흰 셔츠에 튀었다. 오후에 중요한 미팅이 있다.',
    options: [
      { label: '물티슈로 문지른다', fx: { mental: -4 },
        result: '얼룩이 두 배로 커졌다.' },
      { label: '새 셔츠를 산다', fx: { cash: -35000, mental: 2 },
        result: '오늘만 셔츠를 두 번 입었다.' },
      { label: '재킷 단추를 끝까지 잠근다', fx: { hp: -5, eval: 1 },
        result: '미팅 내내 땀을 흘렸다. 아무도 몰랐다. 아마도.' },
    ],
  },
  {
    id: 'l_gossip', scene: 'pantry', phase: 'lunch', who: 'peer',
    text: '탕비실에서 동기가 속삭인다. "부장님 다음 달에 다른 팀 간대."',
    options: [
      { label: '"진짜?!" 신나서 퍼뜨린다', rolls: [
        { p: 0.4, fx: { mental: 10 }, result: '진짜였다. 사무실 공기가 달라졌다.' },
        { p: 0.6, fx: { mental: -5, eval: -8 }, result: '가짜였다. 소문의 출처가 나로 알려졌다.' },
      ] },
      { label: '못 들은 척한다', fx: { mental: 1 },
        result: '모르는 게 약이다. 근데 너무 궁금하다.' },
      { label: '부장님께 직접 여쭤본다', fx: { eval: -3, mental: -5 },
        result: '"누가 그래?" 부장님 눈빛이 날카로워졌다.' },
    ],
  },

  // ───────── 15:00 오후 ─────────
  {
    id: 'p_ceo', phase: 'pm', who: 'ceo',
    text: '대표님이 사무실을 둘러보는 중이다. 내 모니터 쪽으로 걸어온다. 화면엔 부업 창이 떠 있다.',
    options: [
      { label: '재빨리 엑셀 창을 띄운다', rolls: [
        { p: 0.6, fx: { eval: 3 }, result: '대표님이 고개를 끄덕이고 지나갔다. 심장이 아직도 뛴다.' },
        { p: 0.4, fx: { eval: -12, mental: -6 }, result: '엑셀 창 뒤로 블로그가 비쳤다. "그거 블로그야?"' },
      ] },
      { label: '그냥 일어나서 인사한다', fx: { eval: 2, mental: -3 },
        result: '인사하느라 몸으로 모니터를 가렸다. 자연스러웠다. 아마도.' },
      { label: '모니터 전원을 끈다', fx: { eval: -3, mental: 2 },
        result: '"모니터가 꺼져 있네?" "절전 모드입니다." 대표님이 웃었다.' },
    ],
  },
  {
    id: 'p_aircon', phase: 'pm', who: 'team',
    text: '에어컨 온도 전쟁. 누군가 18도로 내렸다. 누군가 28도로 올렸다.',
    options: [
      { label: '26도로 맞춘다', fx: { mental: 2 },
        result: '평화 협정은 15분 만에 깨졌다.' },
      { label: '담요를 꺼낸다', fx: { hp: 3 },
        result: '7월에 담요를 덮고 일한다. 이게 회사다.' },
      { label: '18도로 내린다', fx: { hp: -4, mental: 4 },
        result: '범인은 나였다.' },
    ],
  },
  {
    id: 'p_cry', scene: 'toilet', phase: 'pm', who: 'newbie',
    text: '화장실에서 신입이 눈이 빨개진 채 나온다.',
    options: [
      { label: '커피를 사 준다', fx: { cash: -4500, mental: 3, eval: 2 },
        result: '"선배 같은 사람이 되고 싶어요." 그건 좀 말리고 싶다.' },
      { label: '못 본 척한다', fx: { mental: -4 },
        result: '모른 척하는 게 배려일 수도 있다. 그렇게 믿기로 했다.' },
      { label: '같이 운다', fx: { mental: 6, eval: -1 },
        result: '둘이 화장실에서 10분 울었다. 개운했다.' },
    ],
  },
  {
    id: 'p_training', scene: 'meeting', phase: 'pm', who: 'none',
    text: '의무 교육 "직장 내 소통의 이해" 4시간.',
    options: [
      { label: '성실하게 듣는다', fx: { eval: 2, hp: -6 },
        result: '소통에 대해 4시간 동안 아무하고도 말하지 않았다.' },
      { label: '강의를 틀어 놓고 부업을 한다', fx: { side: 1, eval: -2 },
        result: '강사님 목소리를 배경음악 삼아 부업 진도를 뺐다.' },
      { label: '잔다', rolls: [
        { p: 0.5, fx: { hp: 8 }, result: '푹 잤다. 수료증도 나왔다.' },
        { p: 0.5, fx: { hp: 6, eval: -8 }, result: '"뒤에 주무시는 분~" 강사님이 정확히 나를 가리켰다.' },
      ] },
    ],
  },
  {
    id: 'p_headhunt', phase: 'pm', who: 'phone', minMonth: 3,
    text: '헤드헌터에게 전화가 왔다. "연봉 20% 올려 드릴 수 있는 자리가 있는데요."',
    options: [
      { label: '몰래 면접을 본다', rolls: [
        { p: 0.4, fx: { salary: 300000, mental: 8 }, result: '합격했다. 그 얘길 들은 회사가 붙잡으면서 월급을 30만 원 올려 줬다.' },
        { p: 0.6, fx: { mental: -8, hp: -5 }, result: '면접관: "왜 지금 회사를 떠나려 하시죠?" 정답이 너무 많아서 말을 못 했다.' },
      ] },
      { label: '정중하게 거절한다', fx: { mental: -2 },
        result: '끊고 나니 괜히 아깝다.' },
      { label: '이력서만 다시 써 둔다', fx: { mental: 5 },
        result: '이력서를 보니 생각보다 열심히 살았다.' },
    ],
  },
  {
    id: 'p_credit', phase: 'pm', who: 'boss',
    text: '부장님이 내 보고서를 자기 이름으로 올렸다.',
    options: [
      { label: '참는다', fx: { mental: -10, eval: 3 },
        result: '참았다. 사리가 하나 생겼다.' },
      { label: '정중하게 짚는다', rolls: [
        { p: 0.5, fx: { eval: 6, mental: 5 }, result: '"아, 내가 깜빡했네~" 보고서에 내 이름이 들어갔다.' },
        { p: 0.5, fx: { eval: -8, mental: -5 }, result: '"팀 성과가 내 성과지." 할 말을 잃었다.' },
      ] },
      { label: '다음 보고서부터 워터마크를 넣는다', fx: { mental: 6, eval: -2 },
        result: '모든 페이지 배경에 내 이름을 연하게 깔았다.' },
    ],
  },
  {
    id: 'p_fire', scene: 'street', phase: 'pm', who: 'team',
    text: '화재 대피 훈련. 사이렌이 울린다.',
    options: [
      { label: '계단으로 성실하게 내려간다', fx: { hp: -8, eval: 2 },
        result: '18층에서 걸어 내려갔다. 다리가 후들거린다.' },
      { label: '이 김에 커피를 산다', fx: { cash: -4500, mental: 6 },
        result: '대피 장소가 하필 카페 앞이었다.' },
      { label: '자리에서 버틴다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '텅 빈 사무실을 혼자 썼다. 평화로웠다.' },
        { p: 0.5, fx: { eval: -10 }, result: '안전 관리자 명단에 이름이 적혔다. 빨간 펜으로.' },
      ] },
    ],
  },

  // ───────── 17:55 퇴근 5분 전 ─────────
  {
    id: 'o_weekend', phase: 'off', who: 'boss',
    text: '퇴근 직전. 부장님: "다들 주말에 뭐 해?"',
    options: [
      { label: '"아무것도 안 해요"', fx: { eval: -1, mental: 3 },
        result: '"젊은 사람이 그러면 쓰나~" 그래도 솔직해서 편했다.' },
      { label: '"자기계발 합니다"', fx: { eval: 3, mental: -2 },
        result: '자기계발이 뭔지는 나도 모른다.' },
      { label: '"부장님은요?"', fx: { eval: 4, mental: -8 },
        result: '물어보지 말 걸 그랬다. 40분.' },
    ],
  },
  {
    id: 'o_rain', scene: 'street', prop: 'rain', phase: 'off', who: 'none',
    text: '퇴근하려는데 비가 쏟아진다. 우산이 없다.',
    options: [
      { label: '뛰어간다', fx: { hp: -8, mental: 2 },
        result: '흠뻑 젖었다. 이상하게 상쾌했다.' },
      { label: '편의점 우산을 산다', fx: { cash: -8000 },
        result: '집에 편의점 우산이 아홉 개째다.' },
      { label: '그칠 때까지 야근한다', fx: { hp: -10, eval: 4 },
        result: '비는 밤 11시에 그쳤다.' },
    ],
  },
  {
    id: 'o_chat', scene: 'subway', phase: 'off', who: 'phone',
    text: '퇴근길 지하철. 단톡방 알림. 부장님: "내일 아침 회의 자료 준비됐지?"',
    options: [
      { label: '지하철에서 노트북을 연다', fx: { eval: 5, hp: -6, mental: -6 },
        result: '선 채로 자료를 만들었다. 옆 사람이 내 화면을 다 봤다.' },
      { label: '"네!"만 보내고 아침에 한다', rolls: [
        { p: 0.6, fx: { hp: -5, mental: 2 }, result: '아침 7시에 출근해서 끝냈다. 아무도 모른다.' },
        { p: 0.4, fx: { eval: -8, mental: -4 }, result: '다음 날 아침 지하철이 20분 연착됐다.' },
      ] },
      { label: '읽고 답하지 않는다', fx: { mental: 4, eval: -5 },
        result: '숫자 1이 사라진 걸 부장님도 봤을 것이다.' },
    ],
  },
  {
    id: 'o_gym', scene: 'street', phase: 'off', who: 'none',
    text: '퇴근길 헬스장 앞. 6개월 회원권을 끊어 놓고 두 번 갔다.',
    options: [
      { label: '오늘은 간다', fx: { hp: -6, mental: 6 },
        result: '다음 날 온몸이 아팠다. 뿌듯했다.' },
      { label: '내일부터 간다', fx: { mental: -2 },
        result: '내일의 나에게 맡겼다. 내일의 나는 늘 바쁘다.' },
      { label: '환불을 알아본다', fx: { cash: 120000, mental: -4 },
        result: '위약금을 떼고 12만 원 돌려받았다. 꿈도 같이 환불됐다.' },
    ],
  },
  {
    id: 'o_peer2', phase: 'off', who: 'peer',
    text: '동기가 "오늘 한잔?" 하는데 표정이 심상치 않다.',
    options: [
      { label: '간다', fx: { cash: -30000, mental: 5, hp: -6 },
        result: '동기가 이직한다고 털어놨다. 둘이 같이 울었다.' },
      { label: '다음에 하자고 한다', fx: { mental: -3 },
        result: '그 "다음에"가 언제 올지 둘 다 안다.' },
      { label: '커피로 대신한다', fx: { cash: -5000, mental: 3 },
        result: '커피 한 잔으로 30분 수다. 가성비 최고.' },
    ],
  },
  {
    id: 'o_papers', phase: 'off', who: 'boss',
    text: '6시 5분. 부장님이 퇴근하면서 내 책상에 서류를 쌓는다. "다들 너무 늦게까지 있지 말고~"',
    options: [
      { label: '서류를 본다', fx: { hp: -12, eval: 5 },
        result: '"내일까지 검토만 해 줘." 검토만 3시간 걸렸다.' },
      { label: '서랍에 넣고 퇴근한다', rolls: [
        { p: 0.5, fx: { mental: 6 }, result: '부장님도 잊어버렸다. 서류는 아직 서랍에 있다.' },
        { p: 0.5, fx: { eval: -10 }, result: '다음 날 아침 9시 1분. "어제 그거 봤지?"' },
      ] },
      { label: '"네, 들어가세요!"만 한다', fx: { eval: -3, mental: 4 },
        result: '서류가 내 책상에서 나를 쳐다본다.' },
    ],
  },
  {
    id: 'o_bus', scene: 'street', phase: 'off', who: 'none',
    text: '회사 앞 정류장. 버스가 막 출발하려 한다. 뛰면 탈 수 있을 것 같다.',
    options: [
      { label: '뛴다', rolls: [
        { p: 0.5, fx: { hp: -4, mental: 5 }, result: '탔다! 기사님이 기다려 줬다.' },
        { p: 0.5, fx: { hp: -8, mental: -6 }, result: '기사님과 눈이 마주쳤다. 버스는 출발했다.' },
      ] },
      { label: '다음 버스를 기다린다', fx: { mental: -2 },
        result: '다음 버스는 23분 뒤.' },
      { label: '걸어간다', fx: { hp: -5, mental: 3 },
        result: '걸으니까 생각이 정리됐다. 대부분 퇴사 생각이었다.' },
    ],
  },

  // ═════════ 3차 추가 이벤트 (공통) ═════════
  // 문장 안의 {회사} {부서}는 플레이어가 입력한 회사 이름·부서 이름으로 바뀐다.

  // ───────── 09:00 출근 ─────────
  {
    id: 'm_badge', scene: 'street', phase: 'morning', who: 'none',
    text: '회사 앞에서 알았다. 사원증을 집에 두고 왔다.',
    options: [
      { label: '집에 다시 갔다 온다', fx: { hp: -8, eval: -4 },
        result: '왕복 50분. 사원증은 현관 신발장 위에서 나를 기다리고 있었다.' },
      { label: '앞사람 뒤에 바짝 붙어 들어간다', rolls: [
        { p: 0.6, fx: { mental: 4 }, result: '성공. 경비 아저씨가 못 본 척해 주셨다.' },
        { p: 0.4, fx: { eval: -6, mental: -4 }, result: '삐- 경보가 울렸다. 로비의 모든 눈이 나를 봤다.' },
      ] },
      { label: '임시 출입증을 신청한다', fx: { mental: -3 },
        result: '방문객 출입증을 목에 걸었다. {회사}에 손님으로 출근했다.' },
    ],
  },
  {
    id: 'm_liftfull', scene: 'elevator', phase: 'morning', who: 'team',
    text: '8시 58분. 엘리베이터가 꽉 찼다. 한 명만 더 타면 삐- 소리가 날 것 같다.',
    options: [
      { label: '밀고 탄다', rolls: [
        { p: 0.5, fx: { mental: 2 }, result: '탔다. 소리는 안 났다. 숨도 안 쉬었다.' },
        { p: 0.5, fx: { mental: -6 }, result: '삐- 모두가 나를 봤다. 내렸다.' },
      ] },
      { label: '다음 걸 기다린다', fx: { eval: -3 },
        result: '다음 엘리베이터는 모든 층에 섰다. 9시 4분.' },
      { label: '계단으로 간다', fx: { hp: -9, eval: 1 },
        result: '12층까지 계단. 자리에 앉으니 셔츠가 등에 붙었다.' },
    ],
  },
  {
    id: 'm_inbox', prop: 'mail', phase: 'morning', who: 'none',
    text: '휴가 다녀왔더니 안 읽은 메일이 128통이다.',
    options: [
      { label: '하나하나 다 읽는다', fx: { hp: -6, eval: 4 },
        result: '오전이 통째로 사라졌다. 그중 120통은 참조였다.' },
      { label: '"전체 읽음" 버튼을 누른다', rolls: [
        { p: 0.6, fx: { mental: 8 }, result: '아무 일도 일어나지 않았다. 원래 다 그런 메일이었다.' },
        { p: 0.4, fx: { eval: -10, mental: -4 }, result: '그 안에 마감이 어제인 메일이 있었다.' },
      ] },
      { label: '제목에 "긴급"만 골라 읽는다', fx: { eval: 1, mental: 2 },
        result: '"긴급"이 47통이었다. 회사에선 모든 게 긴급하다.' },
    ],
  },
  {
    id: 'm_heel', scene: 'street', phase: 'morning', who: 'none',
    text: '횡단보도를 건너다 구두 굽이 하수구 틈에 꼈다. 신호는 깜빡이고 있다.',
    options: [
      { label: '힘으로 뽑는다', rolls: [
        { p: 0.5, fx: { hp: -2 }, result: '뽑혔다. 굽은 무사하다. 자존심은 아니다.' },
        { p: 0.5, fx: { cash: -45000, mental: -5 }, result: '굽만 남고 구두가 빠졌다. 출근길에 새 구두를 샀다.' },
      ] },
      { label: '구두를 버리고 건넌다', fx: { mental: 5, cash: -30000 },
        result: '한 짝만 신고 회사 앞 편의점에서 삼선 슬리퍼를 샀다. 의외로 편하다.' },
      { label: '지나가는 사람에게 도움을 청한다', fx: { mental: 3 },
        result: '모르는 아저씨가 같이 뽑아 줬다. 세상은 아직 따뜻하다.' },
    ],
  },

  // ───────── 10:30 오전 ─────────
  {
    id: 'a_reject', phase: 'am', who: 'boss',
    text: '결재가 세 번째 반려됐다. 사유: "다시 한번 검토 바람."',
    options: [
      { label: '뭘 검토하냐고 묻는다', rolls: [
        { p: 0.5, fx: { eval: 3, mental: 2 }, result: '"아, 2페이지 표가 좀…" 드디어 진짜 이유를 들었다.' },
        { p: 0.5, fx: { eval: -6, mental: -6 }, result: '"그걸 내가 말해 줘야 알아?"' },
      ] },
      { label: '날짜만 바꿔서 다시 올린다', rolls: [
        { p: 0.5, fx: { mental: 6 }, result: '승인됐다. 부장님도 안 읽고 있었다.' },
        { p: 0.5, fx: { eval: -5 }, result: '네 번째 반려. 사유: "다시 한번 검토 바람."' },
      ] },
      { label: '처음부터 다시 쓴다', fx: { hp: -10, eval: 4 },
        result: '새로 썼다. 승인됐다. 처음 버전이랑 거의 같다.' },
    ],
  },
  {
    id: 'a_mutedboss', prop: 'video', phase: 'am', who: 'boss',
    text: '화상 회의 10분째. 부장님이 열심히 말씀 중인데 마이크가 꺼져 있다.',
    options: [
      { label: '"부장님, 음소거요!"', fx: { eval: 3, mental: -2 },
        result: '부장님이 처음부터 다시 말씀하셨다. 10분이 20분이 됐다.' },
      { label: '채팅창에 조용히 알린다', fx: { eval: 2 },
        result: '아무도 채팅을 안 봤다. 부장님은 끝까지 무음으로 열변을 토했다.' },
      { label: '다 같이 모른 척한다', fx: { mental: 6, eval: -2 },
        result: '역대 가장 평화로운 회의였다.' },
    ],
  },
  {
    id: 'a_crash', prop: 'excel', phase: 'am', who: 'none',
    text: '두 시간 동안 만든 엑셀이 저장 직전에 꺼졌다. "응답 없음."',
    options: [
      { label: '자동 복구를 믿는다', rolls: [
        { p: 0.5, fx: { mental: 8 }, result: '살아 있었다! 자동 복구님 감사합니다.' },
        { p: 0.5, fx: { mental: -10, hp: -4 }, result: '복구된 파일은 두 시간 전 것이었다.' },
      ] },
      { label: '기억을 더듬어 다시 만든다', fx: { hp: -10, eval: 2 },
        result: '두 번째는 한 시간 걸렸다. 그리고 Ctrl+S를 30번 눌렀다.' },
      { label: '모니터를 바라보며 5분간 멍때린다', fx: { mental: 3, eval: -2 },
        result: '아무것도 해결되지 않았지만 마음은 조금 정리됐다.' },
    ],
  },
  {
    id: 'a_reorg', scene: 'meeting', phase: 'am', who: 'team',
    text: '조직 개편 소문이 돈다. {부서}이 다른 팀과 합쳐진다는 얘기다.',
    options: [
      { label: '인맥을 총동원해 정보를 캔다', fx: { mental: -4, eval: 1 },
        result: '소문이 세 가지 버전으로 늘었다.' },
      { label: '이력서를 슬쩍 업데이트한다', fx: { mental: 5, side: 1 },
        result: '이력서를 고치다 보니 하고 싶은 일이 하나 떠올랐다.' },
      { label: '모르는 게 약이다', rolls: [
        { p: 0.6, fx: { mental: 3 }, result: '소문은 소문으로 끝났다.' },
        { p: 0.4, fx: { mental: -8, eval: -3 }, result: '다음 주 발표. 새 팀장님이 오신다. 처음 보는 분이다.' },
      ] },
    ],
  },

  // ───────── 12:30 점심 ─────────
  {
    id: 'l_coupon', scene: 'restaurant', phase: 'lunch', who: 'none',
    text: '단골 김밥집 쿠폰 도장이 9개다. 하나만 더 찍으면 공짜다. 그런데 오늘 가게가 문을 닫았다.',
    options: [
      { label: '내일 다시 온다', fx: { cash: -8000, mental: -2 },
        result: '옆 가게에서 먹었다. 쿠폰은 지갑 속에서 하루 더 기다린다.' },
      { label: '"사정상 폐업합니다" 안내문을 읽는다', fx: { mental: -6 },
        result: '쿠폰 9개가 추억이 됐다.' },
      { label: '쿠폰을 동기에게 준다', fx: { mental: 3, eval: 1 },
        result: '동기가 감동했다. 사실 나 다이어트 중이다.' },
    ],
  },
  {
    id: 'l_newbie', scene: 'restaurant', phase: 'lunch', who: 'newbie',
    text: '신입이 쭈뼛거리며 묻는다. "선배, 점심 같이 드셔도 돼요?"',
    options: [
      { label: '맛집에 데려가서 산다', fx: { cash: -24000, mental: 4, eval: 2 },
        result: '"선배 최고예요!" 그 한마디에 2만 4천 원이 아깝지 않았다. 조금 아까웠다.' },
      { label: '구내식당에 같이 간다', fx: { cash: -5500, mental: 2 },
        result: '신입이 회사 고민을 털어놨다. 3년 전 내 고민이랑 똑같았다.' },
      { label: '"나 약속 있어" 하고 혼밥', fx: { mental: 3, eval: -1 },
        result: '혼자 먹는 밥이 맛있었다. 조금 미안했다.' },
    ],
  },
  {
    id: 'l_battery', scene: 'pantry', phase: 'lunch', who: 'none',
    text: '휴대폰 배터리 3%. 충전기는 집에 있다. 오후에 중요한 전화가 온다.',
    options: [
      { label: '팀원에게 충전기를 빌린다', fx: { mental: -2 },
        result: '빌린 충전기는 단자가 안 맞았다. 다른 팀원 걸 또 빌렸다.' },
      { label: '편의점에서 새로 산다', fx: { cash: -15000 },
        result: '집에 충전기가 하나 더 늘었다. 일곱 개째다.' },
      { label: '절전 모드로 버틴다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '1%로 전화를 받고 끊는 순간 꺼졌다. 완벽한 타이밍.' },
        { p: 0.5, fx: { eval: -7 }, result: '통화 중에 꺼졌다. 상대방은 내가 끊은 줄 안다.' },
      ] },
    ],
  },
  {
    id: 'l_errand', scene: 'pantry', phase: 'lunch', who: 'boss',
    text: '"오는 길에 내 커피도 하나만~" 부장님 메뉴: 샷 추가, 시럽 반, 얼음 적게, 우유 저지방.',
    options: [
      { label: '완벽하게 사 온다', fx: { cash: -6500, eval: 3 },
        result: '"오, 딱 이거야." 커피 주문 외우는 데 오후 일 할 머리를 다 썼다.' },
      { label: '그냥 아메리카노를 사 온다', fx: { cash: -4500, eval: -2, mental: 2 },
        result: '"…뭐, 고마워." 차이를 아셨다.' },
      { label: '깜빡한 척한다', rolls: [
        { p: 0.5, fx: { mental: 5 }, result: '부장님도 깜빡하셨다.' },
        { p: 0.5, fx: { eval: -6 }, result: '"내 커피는?" 빈손으로 서 있었다.' },
      ] },
    ],
  },

  // ───────── 15:00 오후 ─────────
  {
    id: 'p_snack', phase: 'pm', who: 'team',
    text: '내 서랍 속 간식이 사라졌다. 초코바 포장지만 휴지통에 남아 있다.',
    options: [
      { label: '단톡에 범인을 묻는다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '다음 날 서랍에 초코바 두 개가 들어 있었다. 이자까지.' },
        { p: 0.5, fx: { mental: -6, eval: -2 }, result: '"그거 하나 갖고…" 쪼잔한 사람이 됐다.' },
      ] },
      { label: '서랍에 자물쇠를 단다', fx: { cash: -9000, mental: 3 },
        result: '이제 내 간식은 안전하다. 팀 분위기는 조금 덜 안전하다.' },
      { label: '아예 간식 바구니를 만든다', fx: { cash: -20000, eval: 3, mental: 2 },
        result: '팀원들이 나를 "간식 요정"이라고 부른다.' },
    ],
  },
  {
    id: 'p_ppt', phase: 'pm', who: 'boss', prop: 'excel',
    text: '대표님 보고용 장표 30장을 만들었다. 부장님: "대표님 바쁘셔. 3장으로 줄여."',
    options: [
      { label: '진짜 3장으로 줄인다', fx: { hp: -8, eval: 5 },
        result: '줄이는 게 만드는 것보다 어려웠다. 3장은 꽤 좋았다.' },
      { label: '글씨 크기를 8로 줄여 3장에 다 넣는다', rolls: [
        { p: 0.4, fx: { mental: 4 }, result: '"오, 알차네." 아무도 못 읽었다.' },
        { p: 0.6, fx: { eval: -6 }, result: '"이거 돋보기 갖고 보라는 거야?"' },
      ] },
      { label: '나머지 27장을 부록으로 붙인다', fx: { eval: 2, mental: 2 },
        result: '대표님은 부록만 봤다.' },
    ],
  },
  {
    id: 'p_result', scene: 'meeting', phase: 'pm', who: 'ceo', minMonth: 2,
    text: '분기 실적 발표. 대표님: "이번 분기 {부서} 고생 많았어요. 그런데…"',
    options: [
      { label: '"그런데"를 담담히 듣는다', fx: { mental: -6, eval: 2 },
        result: '"그런데" 뒤에 20분이 더 있었다.' },
      { label: '박수를 제일 크게 친다', fx: { eval: 3, mental: -2 },
        result: '혼자 박수를 쳤다. "그런데"는 아직 시작도 안 했다.' },
      { label: '다음 분기 계획을 먼저 말한다', rolls: [
        { p: 0.5, fx: { eval: 8 }, result: '"오, 준비됐네." 대표님 수첩에 내 이름이 적혔다.' },
        { p: 0.5, fx: { eval: -4, hp: -6 }, result: '"좋아요, 그럼 그거 다음 주까지." 일만 늘었다.' },
      ] },
    ],
  },
  {
    id: 'p_plant', phase: 'pm', who: 'none',
    text: '내 자리 화분이 시들었다. 회사에서 키운 지 1년. 이름도 지어 줬다.',
    options: [
      { label: '물을 듬뿍 준다', rolls: [
        { p: 0.6, fx: { mental: 6 }, result: '다음 날 잎이 다시 섰다. 너도 버텼구나.' },
        { p: 0.4, fx: { mental: -5 }, result: '과습이었다. 미안해, 김부장(화분 이름).' },
      ] },
      { label: '창가로 옮긴다', fx: { mental: 3 },
        result: '창가 자리는 부장님 자리다. 화분이 나보다 먼저 승진했다.' },
      { label: '"너도 힘들지" 하고 같이 쉰다', fx: { mental: 4, eval: -1 },
        result: '화분과 나, 둘 다 광합성이 필요했다.' },
    ],
  },

  // ───────── 17:55 퇴근 5분 전 ─────────
  {
    id: 'o_ceomail', prop: 'mail', phase: 'off', who: 'ceo',
    text: '5시 59분. 대표님 메일이 도착했다. 제목: "간단한 의견 부탁드립니다 (내일 오전까지)"',
    options: [
      { label: '오늘 밤에 써서 보낸다', fx: { hp: -10, eval: 6 },
        result: '새벽 1시에 보냈다. 대표님이 새벽 1시 5분에 답장했다. 이분도 안 잔다.' },
      { label: '내일 아침 일찍 쓴다', fx: { hp: -4, eval: 2 },
        result: '7시 반 출근. 커피 두 잔과 함께 "간단한" 의견 4페이지를 썼다.' },
      { label: '"간단한"을 믿고 세 줄만 쓴다', rolls: [
        { p: 0.5, fx: { mental: 6, eval: 2 }, result: '"명쾌하네요." 세 줄이 정답이었다.' },
        { p: 0.5, fx: { eval: -8 }, result: '"좀 더 구체적으로…" 간단하지 않았다.' },
      ] },
    ],
  },
  {
    id: 'o_dinnervote', prop: 'chat', phase: 'off', who: 'boss',
    text: '부장님이 단톡방에 회식 장소 투표를 올렸다. 선택지: ① 삼겹살 ② 삼겹살 ③ 부장님 단골 삼겹살.',
    options: [
      { label: '③에 투표한다', fx: { eval: 3, mental: -2 },
        result: '만장일치. 회식은 결국 삼겹살이다.' },
      { label: '"파스타는 어떠세요?" 기타 의견', rolls: [
        { p: 0.3, fx: { mental: 8, eval: 1 }, result: '"오, 그래 가끔은!" 팀원들이 나를 영웅으로 봤다.' },
        { p: 0.7, fx: { eval: -3, mental: -3 }, result: '"파스타는 배가 안 차~" 삼겹살로 결정됐다.' },
      ] },
      { label: '투표 안 하고 알림을 끈다', fx: { mental: 3, eval: -2 },
        result: '다음 날, 안 낸 사람 명단에 내 이름만 있었다.' },
    ],
  },
  {
    id: 'o_friendbday', scene: 'subway', prop: 'phone', phase: 'off', who: 'phone',
    text: '오늘 친구 생일 파티다. 7시 시작. 그런데 팀장님이 "잠깐 얘기 좀" 하신다.',
    options: [
      { label: '팀장님 얘기를 듣고 늦게 간다', fx: { eval: 3, mental: -5 },
        result: '도착하니 케이크가 반 남아 있었다. 친구가 "역시 직장인"이라며 웃었다.' },
      { label: '"내일 아침에 말씀 나눠도 될까요?"', rolls: [
        { p: 0.6, fx: { mental: 8 }, result: '"그래, 그래." 생일 노래를 처음부터 불렀다.' },
        { p: 0.4, fx: { mental: 4, eval: -6 }, result: '"…알았어." 다음 날 팀장님 말투가 30% 차가웠다.' },
      ] },
      { label: '파티에 못 간다고 연락한다', fx: { mental: -8, eval: 2 },
        result: '단톡방에 올라온 파티 사진을 야근하며 봤다.' },
    ],
  },
  {
    id: 'o_taxi', scene: 'street', phase: 'off', who: 'none',
    text: '밤 11시 야근 후 택시를 탔다. 야근 택시비는 회사 지원인데, 영수증 처리가 복잡하다.',
    options: [
      { label: '영수증을 꼼꼼히 챙긴다', fx: { hp: -2, cash: 0 },
        result: '정산 서류 다섯 장을 썼다. 승인까지 3주.' },
      { label: '귀찮아서 내 돈으로 낸다', fx: { cash: -28000, mental: 2 },
        result: '2만 8천 원으로 귀찮음을 샀다.' },
      { label: '지하철 막차를 노린다', rolls: [
        { p: 0.5, fx: { mental: 4 }, result: '막차를 탔다! 텅 빈 지하철이 내 것 같다.' },
        { p: 0.5, fx: { hp: -6, cash: -32000 }, result: '막차가 떠났다. 결국 택시. 영수증은 잃어버렸다.' },
      ] },
    ],
  },
];
