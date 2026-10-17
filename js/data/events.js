// 선택형 이벤트 30개. 문장을 고치거나 새 이벤트를 넣을 때는 이 파일만 고치면 된다.
//
// phase: morning(09:00) / am(10:30) / lunch(12:30) / pm(15:00) / off(17:55)
// who:   boss / peer / newbie / hr / team / phone / none  (config.js의 T.WHO)
// fx:    hp 체력, mental 멘탈, cash 현금, eval 평가,
//        salary 월급(영구), living 생활비(영구), side 지금 키우는 부업 진도
// rolls: 결과가 운에 따라 갈리는 선택지. p는 확률(합이 1).
//        함수로 쓰면 지금 상태(s)를 보고 확률을 바꿀 수 있다.
// 선택지 아래 작은 힌트(평가▲ 체력▼)는 fx를 보고 자동으로 만든다.

T.EVENTS = [
  // ───────── 09:00 출근 ─────────
  {
    id: 'm_elevator', phase: 'morning', who: 'boss',
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
    id: 'm_late', phase: 'morning', who: 'none',
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
    id: 'm_coffee', phase: 'morning', who: 'none',
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
    id: 'm_weekly', phase: 'morning', who: 'none',
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
    id: 'm_sick', phase: 'morning', who: 'none',
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
    id: 'a_meeting', phase: 'am', who: 'team',
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
    id: 'a_excel', phase: 'am', who: 'boss',
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
    id: 'a_cc', phase: 'am', who: 'none',
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
    id: 'a_report', phase: 'am', who: 'boss',
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
    id: 'a_chat', phase: 'am', who: 'boss',
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
    id: 'l_menu', phase: 'lunch', who: 'boss',
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
    id: 'l_treat', phase: 'lunch', who: 'boss',
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
    id: 'l_nap', phase: 'lunch', who: 'none',
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
    id: 'l_stock', phase: 'lunch', who: 'peer',
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
    id: 'l_parcel', phase: 'lunch', who: 'boss',
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
    id: 'l_subs', phase: 'lunch', who: 'none',
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
    id: 'p_sleepy', phase: 'pm', who: 'none',
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
    id: 'p_urgent', phase: 'pm', who: 'none',
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
    id: 'p_nego', phase: 'pm', who: 'hr', minMonth: 4, weight: 0.6,
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
    id: 'p_cake', phase: 'pm', who: 'team',
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
    id: 'p_survey', phase: 'pm', who: 'hr',
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
    id: 'p_bonus', phase: 'pm', who: 'hr', weight: 0.5,
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
    id: 'o_dinner', phase: 'off', who: 'boss',
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
    id: 'o_update', phase: 'off', who: 'none',
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
    id: 'o_call', phase: 'off', who: 'phone',
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
];
