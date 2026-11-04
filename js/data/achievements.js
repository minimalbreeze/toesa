// 업적: 판마다 다른 기준으로 퇴사해 보게 만드는 목표. 엔딩(꿈 퇴사·실패 퇴사)을 볼 때 확인한다.
// when(x): x = { dream, failed, reason, grade, diffLv(0 쉬움 ~ 3 지옥), days, rank, car, estates, stats, housing, endings }
// stats = { collapse, beer, weekend: { home, friends, side, drive }, themeBest(테마주 최고 수익률), estatesMax }
// 이름과 조건은 첫 화면·엔딩의 "도감·업적"에 처음부터 다 보인다. 뭘 노릴지 고르는 게 재미다.

T.ACHIEVEMENTS = [
  { id: 'first', name: '첫 꿈 퇴사', desc: '어떤 꿈이든 조건을 다 채우고 퇴사한다.', when: (x) => !x.failed },
  { id: 'grade_s', name: 'S등급 퇴사', desc: '꿈 퇴사를 S등급으로 해낸다.', when: (x) => x.grade === 'S' },
  { id: 'hard', name: '어려움을 이겨 냄', desc: '시작 난이도 어려움 이상으로 꿈 퇴사.', when: (x) => !x.failed && x.diffLv >= 2 },
  { id: 'hell', name: '지옥에서 왔습니다', desc: '시작 난이도 지옥으로 꿈 퇴사.', when: (x) => !x.failed && x.diffLv >= 3 },
  { id: 'safe', name: '무사고 퇴사', desc: '한 번도 쓰러지지 않고 꿈 퇴사.', when: (x) => !x.failed && x.stats.collapse === 0 },
  { id: 'boss', name: '부장 달고 나간다', desc: '부장까지 승진한 뒤 꿈 퇴사.', when: (x) => !x.failed && x.rank >= 4 },
  { id: 'sawon', name: '영원한 사원', desc: '한 번도 승진하지 않고 꿈 퇴사.', when: (x) => !x.failed && x.rank === 0 },
  { id: 'landlord', name: '원룸 두 채', desc: '원룸을 두 채까지 가져 본다.', when: (x) => x.stats.estatesMax >= 2 },
  { id: 'theme', name: '테마주의 신', desc: '테마주를 팔아서 +100% 이상 수익을 낸다.', when: (x) => x.stats.themeBest >= 1 },
  { id: 'frugal', name: '짠돌이 퇴사', desc: '치맥도, 친구 만나는 주말도 없이 꿈 퇴사.', when: (x) => !x.failed && !x.stats.beer && !(x.stats.weekend.friends || 0) },
  { id: 'car', name: '차 끌고 퇴사', desc: '차를 가진 채로 꿈 퇴사.', when: (x) => !x.failed && x.car },
  { id: 'parents', name: '엄마 밥 먹고 퇴사', desc: '부모님 집에서 시작해 꿈 퇴사.', when: (x) => !x.failed && x.housing === 'parents' },
  { id: 'speed', name: '칼퇴의 신', desc: '출근 60일 안에 꿈 퇴사.', when: (x) => !x.failed && x.days <= 60 },
  { id: 'long', name: '오래 버틴 사람', desc: '출근 200일을 넘기고 꿈 퇴사.', when: (x) => !x.failed && x.days > 200 },
  { id: 'collector', name: '꿈 수집가', desc: '꿈 엔딩 8개를 전부 본다.', when: (x) => x.endings >= 8 },
  { id: 'angry', name: '홧김의 역사', desc: '홧김에 사직서를 던진다. (실패 퇴사)', when: (x) => x.reason === 'angry' },
  { id: 'burnout', name: '하얗게 불태웠다', desc: '멘탈 0으로 무너진다. (실패 퇴사)', when: (x) => x.reason === 'burnout' },
  { id: 'fired', name: '인사팀의 부름', desc: '평가 경고가 쌓여 권고사직. (실패 퇴사)', when: (x) => x.reason === 'fired' },
];
