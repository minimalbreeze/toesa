// 엔딩 영상. 컷마다 그림(scene)과 자막(text)이 있고, 자동으로 넘어간다 (화면을 누르면 다음 컷, "건너뛰기"로 끝).
// scene은 sprites.js의 draw()에 그대로 들어간다. 자막의 {회사} {부서} {꿈} {직급} {출근} {순자산}은 이 판의 값으로 바뀐다.
//
// 꿈 퇴사 영상 = intro(공통) → dreams[꿈](꿈 장면, 자막은 dreams.js 엔딩 문장) → 에필로그(이 판을 어떻게 살았는지) → 스태프 롤 → THE END
// 실패 퇴사 영상 = fail[이유] → 스태프 롤

T.CINEMA = {
  intro: [
    { scene: { scene: 'office', phase: 'off', who: 'boss', prop: 'resign', face: 'happy' }, text: '오후 5시 55분. 오늘은 부장님보다 내가 먼저 일어섰다.' },
    { scene: { scene: 'office', phase: 'off', who: 'boss', prop: 'resign', bossShock: true }, text: '"부장님, 이거요." 하얀 봉투 위에 세 글자. 사직서.' },
    { scene: { scene: 'elevator', who: 'none' }, text: '엘리베이터 버튼을 눌렀다. 이번엔 1층까지 한 번에.' },
    { scene: { scene: 'street', phase: 'off', walk: true, box: true }, text: '짐 상자 하나. {출근}일 동안의 {회사}가 이 안에 다 들어갔다.' },
  ],

  // 꿈마다 장면 4개 (dreams.js 엔딩 문장 4줄과 짝을 이룬다)
  dreams: {
    rest:    [{ scene: 'office', phase: 'morning', who: 'boss', prop: 'resign' }, { scene: 'bedroom' }, { scene: 'bedroom', face: 'happy' }, { scene: 'home', mode: 'rest' }],
    travel:  [{ scene: 'office', phase: 'off', who: 'boss', prop: 'resign' }, { scene: 'airport' }, { scene: 'beach' }, { scene: 'beach', sunset: true }],
    cafe:    [{ scene: 'office', phase: 'off', who: 'team' }, { scene: 'shop', cafe: true }, { scene: 'street', phase: 'morning', who: 'crowd' }, { scene: 'shop', cafe: true }],
    farm:    [{ scene: 'office', phase: 'off', who: 'boss', prop: 'resign' }, { scene: 'farm' }, { scene: 'farm' }, { scene: 'farm' }],
    creator: [{ scene: 'home', mode: 'side' }, { scene: 'home', mode: 'side', face: 'happy' }, { scene: 'shop' }, { scene: 'home', mode: 'beer' }],
    startup: [{ scene: 'office', phase: 'off', who: 'boss', bossShock: true }, { scene: 'office', phase: 'am', prop: 'ceo', face: 'happy' }, { scene: 'office', phase: 'evening', prop: 'ceo' }, { scene: 'home', mode: 'side' }],
    freedom: [{ scene: 'office', phase: 'off', who: 'boss', prop: 'resign' }, { scene: 'street', phase: 'morning', face: 'happy' }, { scene: 'bedroom' }, { scene: 'beach', sunset: true }],
    custom:  [{ scene: 'office', phase: 'off', who: 'boss', prop: 'resign' }, { scene: 'office', phase: 'off', who: 'boss', bossShock: true }, { scene: 'street', phase: 'morning', walk: true }, { scene: 'beach', sunset: true }],
  },

  // 에필로그: 이 판을 어떻게 살았는지에 따라 붙는다 (위에서부터 맞는 것 최대 2개)
  // when(s, x): s = 게임 상태, x = { rank, car, estates, collapse, housing, themeBest, persona }
  epilogues: [
    { when: (s, x) => x.estates >= 2, scene: { scene: 'street', phase: 'pm' }, text: '원룸 {원룸}채의 월세는 오늘도 꼬박꼬박 들어온다. 세입자 단톡방이 회사 단톡방을 대신한다.' },
    { when: (s, x) => x.estates === 1, scene: { scene: 'street', phase: 'pm' }, text: '원룸 한 채는 그대로 두었다. 보일러 고장 연락만 오지 않으면 된다.' },
    { when: (s, x) => x.rank >= 4, scene: { scene: 'office', phase: 'am' }, text: '부장까지 달고 나온 사람이라, 가끔 전 회사에서 "잠깐 통화 되세요?"가 온다.' },
    { when: (s, x) => x.rank === 0, scene: { scene: 'office', phase: 'am' }, text: '끝까지 사원이었다. 그래도 사직서만큼은 부장님 결재를 한 번에 받았다.' },
    { when: (s, x) => x.themeBest >= 1, scene: { scene: 'home', mode: 'side' }, text: '테마주로 두 배를 먹은 날은 아직도 가끔 꿈에 나온다. 다시는 안 한다. 아마도.' },
    { when: (s, x) => x.collapse >= 3, scene: { scene: 'bedroom' }, text: '응급실 간호사가 나를 기억했다. 이제 그럴 일은 없다.' },
    { when: (s, x) => x.car, scene: { scene: 'street', phase: 'morning' }, text: '{차}는 아직도 잘 달린다. 이제 출근길이 아니라 그냥 길을 달린다.' },
    { when: (s, x) => x.housing === 'parents', scene: { scene: 'home' }, text: '엄마는 아직도 아침밥을 차려 준다. 이제는 같이 앉아서 먹는다.' },
  ],
  // 마지막 한 줄: 이 판의 선택 성향 (report.js의 성향과 같은 키)
  persona: {
    devote: '회사에 바친 시간은 돌아오지 않는다. 대신 이제부터의 시간은 전부 내 거다.',
    protect: '끝까지 나를 지켰다. 그래서 나는 아직 멀쩡하다.',
    gamble: '운에 맡긴 날이 많았다. 마지막만큼은 운이 아니었다.',
    escape: '몸은 회사, 마음은 퇴사였다. 이제 몸도 따라 나왔다.',
    spend: '버티는 데 돈을 많이 썼다. 이제는 사는 데 쓴다.',
    balanced: '이것저것 조금씩. 그래도 결국 하나는 해냈다.',
  },

  // 실패 퇴사 영상 (endings.js 재취업 엔딩 문장과 짝)
  fail: {
    angry:   [{ scene: 'office', phase: 'pm', who: 'boss', bossShock: true, face: 'shock' }, { scene: 'street', phase: 'evening', walk: true, box: true }],
    burnout: [{ scene: 'home', mode: 'rest' }, { scene: 'bedroom' }],
    fired:   [{ scene: 'hrroom', who: 'hr' }, { scene: 'street', phase: 'evening', walk: true, box: true, prop: 'rain' }],
    after:   [{ scene: 'home', mode: 'rest' }, { scene: 'bedroom' }, { scene: 'street', phase: 'morning' }, { scene: 'elevator', who: 'boss', face: 'shock' }],
  },

  // 스태프 롤
  credits: [
    ['주연', '나 ({회사} {부서} {직급})'],
    ['조연', '부장님'],
    ['우정 출연', '입사 동기 · 신입 · 인사팀'],
    ['특별 출연', '국민 지수펀드 · 테마주 · 월세'],
    ['협찬', '편의점 삼각김밥 · 새벽 배송'],
    ['감독', '퇴근 5분 전의 나'],
  ],
  theEnd: 'THE END',
  failEnd: '…TO BE CONTINUED',
};
