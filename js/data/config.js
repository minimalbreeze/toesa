// 게임 밸런스 숫자는 전부 여기 모아 둔다. 테스트하면서 숫자만 고치면 된다.
window.T = window.T || {};

T.CONFIG = {
  saveKey: 'toesa:save:v1',
  metaKey: 'toesa:meta:v1',
  shareUrl: 'https://minimalbreeze.github.io/toesa/',

  start: { hp: 75, mental: 65, cash: 2000000, eval: 35 },

  // 시작할 때 "그냥 입사하기"를 누르면 쓰는 기본 정보 (나중에 리포트에서 고칠 수 있다)
  // rank: null이면 연차로 자동, 0~4면 사원~부장을 직접 고른 것
  defaultProfile: { company: '주식회사 오늘도', dept: 'plan', deptName: '', years: 1, rank: null, salary: null, expense: null },
  // 연차 → 시작 직급: 2년 차까지 사원, 5년 차까지 대리, 9년 차까지 과장, 14년 차까지 차장, 그 위는 부장
  rankByYears: [2, 5, 9, 14],

  // 월급은 세금 떼고 통장에 찍히는 돈(실수령) 기준
  ranks: [
    { name: '사원', salary: 2600000 },
    { name: '대리', salary: 3000000 },
    { name: '과장', salary: 3500000 },
    { name: '차장', salary: 4100000 },
    { name: '부장', salary: 4800000 },
  ],
  living: 2150000,       // 한 달 생활비 (월세·식비·통신비·교통비)
  promoteAt: 80,         // 월급날 평가가 이 이상이면 승진
  promoteReset: 35,      // 승진하면 평가는 여기서 다시 시작
  evalDecay: 6,          // 매달 월급날 평가가 이만큼 깎인다 ("지난달 성과는 지난달 거고")
  warnBelow: 10,         // 월급날 평가가 이 아래면 인사팀 경고
  warnLimit: 2,          // 경고가 연달아 이만큼 쌓이면 권고사직 (재취업 엔딩)
  sideNeed: 2,           // 부업 Lv.n → n+1 에 필요한 진도 = (n+1) × 이 값

  daysPerMonth: 5,       // 월~금 5일 = 게임 속 한 달 (압축)
  nightRecover: { hp: 5, mental: 2 },
  collapse: { hp: 35, mental: -12, cash: -150000, eval: -10 },

  // 출근 도장: 실제 시간으로 하루에 할 수 있는 양을 제한한다.
  // 게임 속 하루를 시작할 때마다 1개를 쓴다. 다 쓰면 다음 충전까지 기다린다.
  workPass: {
    start: 5,            // 첫 판은 첫 월급날까지 볼 수 있게 5개로 시작
    max: 3,              // 평소에는 최대 3개까지만 모인다
    rechargeHours: 4,    // 4시간마다 1개 충전 (점심에 한 번, 퇴근길에 또)
  },

  // 골프처럼 마음대로 안 되게
  luck: {
    spread: 0.35,        // 정해진 결과도 ±35% 흔들린다
    twist: 0.15,         // 15% 확률로 "삐끗": 좋은 건 반토막, 나쁜 건 두 배
    condition: 0.9,      // 컨디션(체력·멘탈 평균)이 나쁠수록 운에 맡긴 선택이 나쁘게 나올 확률이 커진다
    lowCondition: 40,    // 컨디션이 이 아래면 선택지 힌트에 "컨디션 나쁨"이 붙는다
    twistLines: [
      '…라고 생각했는데, 오늘따라 뭔가 삐끗했다.',
      '분명 계획대로였다. 결과만 빼고.',
      '타이밍이 묘하게 어긋났다.',
      '인생은 생크의 연속이다.',
      '하필 그때 부장님이 지나갔다.',
      '공은 똑바로 쳤는데 바람이 불었다.',
    ],
  },
  sideFail: 0.25,        // 부업을 해도 25%는 아무 진전이 없다 ("오늘은 한 줄도 못 썼다")

  // 월급날마다 하나씩 터지는 예상 못 한 지출 (0원이면 운 좋은 달)
  surprises: [
    { text: '아무 일도 없었다. 이런 달도 있다.', cash: 0 },
    { text: '아무 일도 없었다. 수상할 만큼 조용하다.', cash: 0 },
    { text: '친구 결혼식 축의금', cash: -100000 },
    { text: '회사 선배 부친상 조의금', cash: -50000 },
    { text: '휴대폰 액정이 깨졌다', cash: -280000 },
    { text: '사랑니가 썩었다', cash: -350000 },
    { text: '집주인: "다음 달부터 월세 5만 원 올릴게요"', cash: 0, living: 50000 },
    { text: '부모님 용돈', cash: -200000 },
    { text: '보일러가 고장 났다', cash: -420000 },
    { text: '연말정산 환급', cash: 180000 },
    { text: '주차 위반 딱지', cash: -40000 },
    { text: '조카 돌잔치 + 금반지', cash: -230000 },
  ],

  offlineCapHours: 8,    // 앱을 꺼 둔 사이 부업 수입은 최대 8시간치만 쌓인다
  dayIncomeHours: 3,     // 게임 속 하루마다 퇴근 후 부업이 버는 시간

  freedomGoal: 100000000, // 경제적 자유 엔딩: 현금 1억 원
  maxSideLevel: 10,       // 사업가 엔딩: 부업 하나를 Lv.10까지

  evening: {
    rest:  { fx: { hp: 16, mental: 8 } },
    side:  { fx: { hp: -14, mental: -6 } },
    beer:  { fx: { hp: -8, mental: 20, cash: -45000 } },
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
  ceo: '대표님',
  none: '',
};
