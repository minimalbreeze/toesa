// 게임 밸런스 숫자는 전부 여기 모아 둔다. 테스트하면서 숫자만 고치면 된다.
window.T = window.T || {};

T.CONFIG = {
  saveKey: 'toesa:save:v1',
  metaKey: 'toesa:meta:v1',
  shareUrl: 'https://minimalbreeze.github.io/toesa/',

  start: { hp: 80, mental: 70, cash: 3000000, eval: 40 },

  // 월급은 세금 떼고 통장에 찍히는 돈(실수령) 기준
  ranks: [
    { name: '사원', salary: 2800000 },
    { name: '대리', salary: 3200000 },
    { name: '과장', salary: 3700000 },
    { name: '차장', salary: 4300000 },
    { name: '부장', salary: 5000000 },
  ],
  living: 2000000,       // 한 달 생활비 (월세·식비·통신비·교통비)
  promoteAt: 85,         // 월급날 평가가 이 이상이면 승진
  promoteReset: 40,      // 승진하면 평가는 여기서 다시 시작

  daysPerMonth: 5,       // 월~금 5일 = 게임 속 한 달 (압축)
  nightRecover: { hp: 8, mental: 4 },
  collapse: { hp: 40, mental: -10, cash: -150000, eval: -8 },

  offlineCapHours: 8,    // 앱을 꺼 둔 사이 부업 수입은 최대 8시간치만 쌓인다
  dayIncomeHours: 3,     // 게임 속 하루마다 퇴근 후 부업이 버는 시간

  freedomGoal: 50000000, // 경제적 자유 엔딩: 현금 5천만 원
  maxSideLevel: 10,      // 사업가 엔딩: 부업 하나를 Lv.10까지

  evening: {
    rest:  { fx: { hp: 20, mental: 10 } },
    side:  { fx: { hp: -12, mental: -4 } },
    beer:  { fx: { hp: -6, mental: 22, cash: -35000 } },
  },
};

T.PHASES = [
  { id: 'morning', time: '09:00', label: '출근' },
  { id: 'am',      time: '10:30', label: '오전 업무' },
  { id: 'lunch',   time: '12:30', label: '점심시간' },
  { id: 'pm',      time: '15:00', label: '오후 업무' },
  { id: 'off',     time: '17:55', label: '퇴근 5분 전' },
  { id: 'evening', time: '19:00', label: '퇴근 후' },
];

T.DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];

T.WHO = {
  boss: '부장님',
  peer: '입사 동기',
  newbie: '신입',
  hr: '인사팀',
  team: '팀원들',
  phone: '회사 전화',
  none: '',
};
