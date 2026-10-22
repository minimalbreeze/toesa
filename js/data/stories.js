// 연재 이야기: 며칠에 걸쳐 이어지는 사건. 한 번에 하나씩 진행된다.
// 근무 일지 끝에 "내일 예고"가 붙어서, 다음 날 결과가 궁금하게 만든다.
//
// steps: 차례대로 나오는 장면. 각 장면은 이벤트(events.js)와 같은 모양이고 몇 가지가 더 있다.
//   delay:  앞 장면에서 며칠 뒤에 나오는지 (기본 1 = 다음 날)
//   teaser: 전날 근무 일지에 나오는 "내일 예고" 문장
// 선택지에 더 쓸 수 있는 것:
//   next: 다음에 나올 장면 번호 (0부터). 없으면 바로 다음 장면
//   end:  true면 이야기가 여기서 끝난다
// when: 이 이야기가 시작될 수 있는 조건 (게임 상태 s를 받는다)

T.STORIES = [
  {
    id: 'peer_quit', title: '동기의 퇴사',
    steps: [
      {
        phase: 'lunch', who: 'peer', scene: 'restaurant',
        teaser: '내일 점심, 동기가 "할 말이 있다"며 밥을 먹자고 했다.',
        text: '국밥을 앞에 두고 동기가 말한다. "나… 퇴사하려고."',
        options: [
          { label: '"왜? 무슨 일 있어?"', fx: { mental: -3 },
            result: '"그냥… 여기선 내가 안 보여." 국밥이 식을 때까지 이야기를 들었다.' },
          { label: '"잘 생각했어. 응원할게."', fx: { mental: 3 },
            result: '동기가 처음으로 웃었다. "너밖에 없다."' },
          { label: '"나도 데려가."', rolls: [
            { p: 0.5, fx: { mental: 6 }, result: '"진짜? 자리 생기면 연락할게." 반쯤 농담이었는데 동기 눈이 진지했다.' },
            { p: 0.5, fx: { mental: -4 }, result: '"너는 여기 잘 맞잖아." 그 말이 칭찬인지 아닌지 모르겠다.' },
          ] },
        ],
      },
      {
        phase: 'off', delay: 2, who: 'team', scene: 'bar',
        teaser: '모레는 동기 송별회다. 롤링페이퍼 총무가 나로 정해졌다.',
        text: '동기 송별회. 부장님이 건배사를 한다. "어디 가서든 우리 회사 욕은 하지 말고~"',
        options: [
          { label: '끝까지 남아서 배웅한다', fx: { hp: -10, mental: 6, cash: -30000 },
            result: '마지막 택시를 잡아 줬다. 동기가 창문을 내리고 소리쳤다. "너도 빨리 나와!"' },
          { label: '롤링페이퍼에 진심을 쓴다', fx: { mental: 4 },
            result: '"네 덕분에 버텼다." 쓰고 보니 나한테 하는 말 같았다.' },
          { label: '1차만 하고 빠진다', fx: { mental: -2, eval: 1 },
            result: '집에 가는 길에 동기에게 문자를 보냈다. "잘 가라. 진짜로."' },
        ],
      },
      {
        phase: 'pm', delay: 3, who: 'phone',
        teaser: '며칠 뒤, 떠난 동기에게서 연락이 올 것 같은 예감이 든다.',
        text: '떠난 동기에게 전화가 왔다. "우리 회사 자리 하나 났어. 연봉 15% 더 준대. 와 볼래?"',
        options: [
          { label: '면접을 본다', rolls: [
            { p: 0.45, fx: { salary: 300000, mental: 8 }, result: '합격했다. 그 얘기가 돌자 회사가 붙잡으며 월급을 30만 원 올려 줬다. 결국 남았다. 동기에게 밥을 샀다.' },
            { p: 0.55, fx: { mental: -6 }, result: '떨어졌다. "아쉽다, 다음에 또 연락할게." 동기의 목소리가 미안해 보였다.' },
          ], next: 3 },
          { label: '"고맙지만 아직은 여기서 버틸래"', fx: { mental: 2, eval: 2 },
            result: '"그래, 너답다." 전화를 끊고 한참 모니터를 봤다.', next: 3 },
          { label: '"그 회사 분위기는 어때?"', fx: { mental: 4 },
            result: '"여기도 회사야. 근데 숨은 쉬어져." 그 말이 오래 남았다.', next: 3 },
        ],
      },
      {
        phase: 'lunch', delay: 4, who: 'phone', scene: 'pantry',
        teaser: '다음 주쯤, 동기의 근황이 들려올 것이다.',
        text: '동기 SNS에 새 글이 올라왔다. "이직 한 달 차. 요즘 나는…"',
        options: [
          { label: '끝까지 읽는다', rolls: [
            { p: 0.5, fx: { mental: 6 }, result: '"…매일 칼퇴한다." 좋아요를 눌렀다. 두 번 누를 수 없어서 아쉬웠다.' },
            { p: 0.5, fx: { mental: -3 }, result: '"…거기도 똑같더라." 이상하게 안심이 됐다. 그리고 조금 슬펐다.' },
          ], end: true },
          { label: '댓글을 단다. "부럽다"', fx: { mental: 2 },
            result: '동기가 답글을 달았다. "너도 할 수 있어." 진짜일까.', end: true },
          { label: '알림을 끈다', fx: { mental: -2 },
            result: '남의 행복은 오늘 말고 다음에 보기로 했다.', end: true },
        ],
      },
    ],
  },

  {
    id: 'new_boss', title: '새 부장님',
    steps: [
      {
        phase: 'morning', who: 'team',
        teaser: '내일 아침 전체 공지가 뜬다는 소문이 돈다. "조직 개편"이라는 단어와 함께.',
        text: '전체 공지: "○○○ 부장 다른 본부로 이동. 후임은 다음 주 월요일 부임." 사무실이 술렁인다.',
        options: [
          { label: '부장님께 그동안 감사했다고 인사한다', fx: { eval: 3, mental: -2 },
            result: '부장님이 눈시울을 붉혔다. "자네가 제일 말을 안 들었는데." 칭찬이라고 믿기로 했다.' },
          { label: '새 부장님이 누군지 캐 본다', fx: { mental: -3 },
            result: '정보 세 개를 모았다. "깐깐하다", "엄청 착하다", "전 회사에서 별명이 터미네이터".' },
          { label: '조용히 짐 정리를 돕는다', fx: { hp: -3, mental: 3 },
            result: '부장님 서랍에서 내 첫 보고서 출력본이 나왔다. 빨간 펜 자국이 가득했다.' },
        ],
      },
      {
        phase: 'morning', delay: 3, who: 'boss',
        teaser: '새 부장님 첫 출근이 다가온다. 별명이 "터미네이터"라는 말이 있다.',
        text: '새 부장님 첫 출근. 첫마디: "저는 숫자로 이야기합니다. 각자 지난 분기 성과 세 줄로 정리해 오세요. 오늘 오전까지."',
        options: [
          { label: '성과를 숫자로 정리해 간다', fx: { hp: -6, eval: 7 },
            result: '"좋네요. 이런 게 필요해요." 처음으로 숫자로 칭찬받았다.', next: 2 },
          { label: '세 줄을 꽉 채워 미사여구로', rolls: [
            { p: 0.4, fx: { eval: 3 }, result: '"글을 잘 쓰시네요." 성과 얘기는 없었다.' },
            { p: 0.6, fx: { eval: -6, mental: -4 }, result: '"그래서 숫자는요?" 세 줄이 세 번 반려됐다.' },
          ], next: 2 },
          { label: '"제 성과는 팀 성과입니다"', fx: { eval: -3, mental: 2 },
            result: '"그럼 팀에서 본인 몫은요?" 회의실 공기가 얼었다.', next: 2 },
        ],
      },
      {
        phase: 'off', delay: 2, who: 'boss',
        teaser: '새 부장님이 다음 주에 팀원들과 1:1 면담을 한다고 한다.',
        text: '새 부장님과 1:1 면담. "솔직하게 말해 봐요. 이 팀, 뭐가 제일 문제예요?"',
        options: [
          { label: '솔직하게 말한다', rolls: [
            { p: 0.55, fx: { eval: 6, mental: 8 }, result: '부장님이 메모하더니 다음 주에 회의를 절반으로 줄였다. 터미네이터가 아니라 구원자였다.' },
            { p: 0.45, fx: { eval: -6, mental: -6 }, result: '"그건 본인 문제 아닐까요?" 솔직함의 대가는 컸다.' },
          ], end: true },
          { label: '"딱히 없습니다"', fx: { mental: -4 },
            result: '"그래요? 다른 분들은 많던데." 나만 아무 말도 안 한 사람이 됐다.', end: true },
          { label: '질문으로 되돌린다. "부장님은 어떻게 보세요?"', fx: { eval: 3 },
            result: '부장님이 30분 동안 본인 생각을 말했다. 듣기만 했는데 "대화가 잘 통한다"는 평을 받았다.', end: true },
        ],
      },
    ],
  },

  {
    id: 'office_love', title: '엘리베이터의 그 사람',
    steps: [
      {
        phase: 'morning', who: 'none', scene: 'elevator',
        teaser: '내일 아침, 엘리베이터에서 뭔가 일어날 것 같다. 이유는 모르겠다.',
        text: '엘리베이터에 옆 팀 사람과 단둘이 탔다. 내 사원증 줄이 그 사람 가방에 걸렸다.',
        options: [
          { label: '"죄송해요!" 웃으며 푼다', fx: { mental: 5 },
            result: '그 사람도 웃었다. "자주 걸리시나 봐요." 15층이 너무 빨리 왔다.' },
          { label: '얼어서 아무 말도 못 한다', fx: { mental: -3 },
            result: '그 사람이 대신 풀어 줬다. 하루 종일 그 장면이 재생됐다.' },
          { label: '사원증 줄을 그냥 끊는다', fx: { cash: -3000, mental: 2 },
            result: '새 줄을 샀다. 왜 그랬는지는 나도 모르겠다.', end: true },
        ],
      },
      {
        phase: 'pm', delay: 2, who: 'none', scene: 'pantry',
        teaser: '탕비실에서 그 사람을 또 마주칠지도 모른다.',
        text: '탕비실. 그 사람이 커피 머신 앞에서 원두를 채우고 있다. "아, 엘리베이터!"',
        options: [
          { label: '"커피 한잔 같이 하실래요?"', rolls: [
            { p: 0.6, fx: { mental: 10 }, result: '"좋아요." 회사 1층 카페에서 20분 이야기했다. 오후 업무가 하나도 기억나지 않는다.' },
            { p: 0.4, fx: { mental: -5 }, result: '"아, 제가 지금 회의가…" 타이밍이 나빴다. 아마 타이밍이.' },
          ] },
          { label: '원두 채우는 걸 돕는다', fx: { mental: 4 },
            result: '둘이 원두를 채웠다. 대화는 원두 얘기뿐이었다. 그래도 좋았다.' },
          { label: '목례만 하고 지나간다', fx: { mental: -2 },
            result: '자리에 돌아와서 후회했다. 퇴근할 때까지 후회했다.', end: true },
        ],
      },
      {
        phase: 'lunch', delay: 3, who: 'peer',
        teaser: '요즘 사내에 이상한 소문이 돈다는 얘기를 들었다.',
        text: '동기가 속삭인다. "너 옆 팀 그분이랑 무슨 사이야? 다들 알던데."',
        options: [
          { label: '"아무 사이 아니야!"', fx: { mental: -4 },
            result: '얼굴이 빨개졌다. 동기가 "아, 그렇구나~" 했다. 아무도 안 믿는다.' },
          { label: '"…아직은."', fx: { mental: 5 },
            result: '동기가 박수를 쳤다. 비밀은 오후 3시에 팀 전체로 퍼졌다.' },
          { label: '소문의 근원을 찾는다', fx: { mental: -2, hp: -3 },
            result: '근원은 탕비실 CCTV를 보는 시설팀이었다. 회사는 넓고 비밀은 없다.' },
        ],
      },
      {
        phase: 'off', delay: 2, who: 'phone',
        teaser: '금요일 저녁, 메신저 알림이 하나 올 것 같다.',
        text: '퇴근 직전, 그 사람에게 메신저가 왔다. "이번 주말에 뭐 하세요?"',
        options: [
          { label: '"아무것도요! 혹시…"', rolls: [
            { p: 0.6, fx: { mental: 15, cash: -40000 }, result: '주말에 영화를 봤다. 월요일 출근이 처음으로 기다려졌다. 회사도 가끔은 좋은 걸 준다.' },
            { p: 0.4, fx: { mental: -6 }, result: '"아, 팀 등산 인원 조사 중이라서요." 부장님 심부름이었다.' },
          ], end: true },
          { label: '"자기계발이요" (거짓말)', fx: { mental: -5 },
            result: '"아… 바쁘시구나." 대화가 끝났다. 자기계발은 하지 않았다.', end: true },
          { label: '답장을 한 시간 동안 고민한다', fx: { mental: 3, hp: -3 },
            result: '한 시간 뒤 "저도요 ㅎㅎ"를 보냈다. 답장이 바로 왔다. "그럼 같이 밥 먹어요."', end: true },
        ],
      },
    ],
  },

  {
    id: 'ceo_tf', title: '대표님 특명',
    steps: [
      {
        phase: 'am', who: 'ceo', scene: 'meeting',
        teaser: '내일 대표님이 직접 사람을 뽑는다는 소문이 있다. "특명"이라고 했다.',
        text: '대표님이 회의실로 불렀다. "신사업 TF에 자네가 들어와 줬으면 해. 3주짜리야."',
        options: [
          { label: '"맡겨만 주십시오!"', fx: { eval: 6, mental: -4 },
            result: '"역시." 대표님이 어깨를 두드렸다. 3주간 내 저녁은 없다.' },
          { label: '"지금 업무가 많아서요…"', fx: { eval: -6, mental: 3 },
            result: '"그래? 아쉽네." 대표님 표정이 0.5초 굳었다. 그 0.5초가 오래 갈 것 같다.', end: true },
          { label: '조건을 건다. "끝나면 휴가 주시나요?"', rolls: [
            { p: 0.5, fx: { eval: 4, mental: 5 }, result: '"하하, 좋아. 3일 줄게." 협상 성공.' },
            { p: 0.5, fx: { eval: -2 }, result: '"일단 해 보고 얘기하지." 협상은 다음으로 미뤄졌다.' },
          ] },
        ],
      },
      {
        phase: 'off', delay: 2, who: 'team', scene: 'meeting',
        teaser: 'TF 첫 주말 회의가 잡힐 것 같다는 불길한 예감이 든다.',
        text: 'TF 팀장: "이번 주 토요일에 잠깐 모일까요? 두 시간만."',
        options: [
          { label: '나간다', fx: { hp: -10, eval: 5 },
            result: '두 시간이 여섯 시간이 됐다. 토요일이 증발했다.' },
          { label: '"집에서 온라인으로 할게요"', fx: { hp: -4, eval: 2 },
            result: '잠옷 위에 셔츠만 입고 참석했다. 카메라는 상반신만 비춘다.' },
          { label: '"주말엔 어렵습니다"', fx: { eval: -4, mental: 5 },
            result: '나 빼고 다 나갔다. 월요일에 결정된 것들이 나에게 배정돼 있었다.' },
        ],
      },
      {
        phase: 'pm', delay: 4, who: 'ceo', scene: 'meeting',
        teaser: '다음 주, TF 최종 발표가 있다. 발표자는… 나다.',
        text: 'TF 최종 발표. 임원 열두 명이 나를 보고 있다. 첫 장을 넘기는 손이 떨린다.',
        options: [
          { label: '준비한 대로 발표한다', rolls: s => (s.eval >= 50
            ? [{ p: 0.7, fx: { eval: 12, mental: 8 }, result: '박수가 나왔다. 대표님이 내 이름을 두 번 불렀다. 회사 생활 최고의 날.' },
               { p: 0.3, fx: { eval: 4 }, result: '무난했다. "수고했어요." 무난한 게 제일 어렵다.' }]
            : [{ p: 0.4, fx: { eval: 8, mental: 5 }, result: '생각보다 잘했다. 대표님이 고개를 끄덕였다.' },
               { p: 0.6, fx: { eval: -6, mental: -8 }, result: '질문 하나에 말문이 막혔다. "그건 다음에 정리해서 주세요."' }]),
            hint: '평가가 50 이상이면 유리', end: true },
          { label: '대표님이 좋아하는 숫자만 강조한다', fx: { eval: 6, mental: -3 },
            result: '대표님은 좋아했다. 다른 임원 하나가 "근데 이 숫자는요?"라고 물었다.', end: true },
          { label: 'TF 팀장에게 발표를 넘긴다', fx: { eval: -4, mental: 6 },
            result: '팀장이 발표하고 칭찬도 받았다. 나는 뒤에서 슬라이드만 넘겼다. 마음은 편했다.', end: true },
        ],
      },
    ],
  },

  {
    id: 'side_viral', title: '부업 대박 조짐',
    when: (s) => Object.values(s.side).some((j) => j.lvl >= 2),
    steps: [
      {
        phase: 'morning', who: 'none', scene: 'subway',
        teaser: '내일 아침, 휴대폰 알림이 평소보다 많이 울릴 것 같다.',
        text: '출근길 지하철. 알림이 멈추지 않는다. 어젯밤 올린 부업 게시물이 갑자기 퍼지고 있다.',
        options: [
          { label: '화장실에서 몰래 댓글에 답한다', fx: { side: 1, eval: -3 },
            result: '오전 내내 화장실을 네 번 갔다. 팔로워가 두 배가 됐다.' },
          { label: '퇴근 후에 보기로 한다', fx: { mental: -3 },
            result: '하루 종일 주머니 속 휴대폰이 진동했다. 일에 집중이 안 됐다.' },
          { label: '반차를 쓴다', fx: { side: 2, eval: -6 },
            result: '오후 내내 카페에서 부업을 했다. 이게 진짜 내 일 같았다.' },
        ],
      },
      {
        phase: 'lunch', delay: 2, who: 'boss',
        teaser: '회사 사람 누군가가 내 부업을 본 것 같다는 느낌이 든다.',
        text: '점심시간, 부장님이 휴대폰을 내민다. "이거… 자네 아니야?"',
        options: [
          { label: '솔직하게 인정한다', rolls: [
            { p: 0.5, fx: { mental: 8, eval: 2 }, result: '"오, 대단한데? 근데 회사 일은 잘하고 있지?" 의외로 응원받았다.' },
            { p: 0.5, fx: { eval: -10, mental: -5 }, result: '"회사 일에 집중 좀 하지." 그날 이후 부장님 눈빛이 달라졌다.' },
          ] },
          { label: '"닮은 사람이네요"', fx: { mental: -6 },
            result: '"그래? 목소리까지 똑같은데." 부장님이 웃으며 갔다. 다 안다.' },
          { label: '"부장님도 해 보실래요?"', fx: { eval: 3, mental: 3 },
            result: '부장님이 진지하게 물어보기 시작했다. 동지가 생겼다. 아마도.' },
        ],
      },
      {
        phase: 'off', delay: 3, who: 'phone',
        teaser: '조만간 부업 관련해서 중요한 연락이 올 것 같다.',
        text: '브랜드에서 협업 제안이 왔다. "한 달 집중 프로젝트예요. 평일 낮 미팅이 몇 번 있어요."',
        options: [
          { label: '받는다. 연차를 쓴다', fx: { side: 3, eval: -8, cash: 1000000 },
            result: '연차 사흘을 썼다. 협업비 100만 원. 회사 밖에서 처음으로 내 이름값을 받았다.', end: true },
          { label: '주말에만 가능하다고 협상한다', rolls: [
            { p: 0.5, fx: { side: 2, cash: 500000, hp: -8 }, result: '"주말도 괜찮아요." 주말이 사라졌지만 50만 원과 경력이 남았다.' },
            { p: 0.5, fx: { mental: -6 }, result: '"아쉽지만 이번엔 어렵겠네요." 기회는 기다려 주지 않았다.' },
          ], end: true },
          { label: '정중히 거절한다', fx: { mental: -4, eval: 2 },
            result: '회사가 우선이다. 아직은. 거절 메일을 보내고 한참 창밖을 봤다.', end: true },
        ],
      },
    ],
  },

  {
    id: 'checkup', title: '건강검진',
    steps: [
      {
        phase: 'morning', who: 'none', scene: 'street',
        teaser: '내일은 회사 건강검진 날. 오늘 밤 9시부터 금식이다.',
        text: '건강검진 날. 공복 14시간째. 대기 번호 87번.',
        options: [
          { label: '성실하게 전부 받는다', fx: { hp: -4, mental: -2 },
            result: '위내시경까지 받았다. 수면 마취에서 깨어나며 부장님 이름을 불렀다고 한다.' },
          { label: '수면 내시경 추가 (자비)', fx: { cash: -60000, mental: 3 },
            result: '6만 원으로 고통을 피했다. 잘 쓴 돈이다.' },
          { label: '빨리 끝내고 출근한다', fx: { eval: 2, hp: -2 },
            result: '오후에 출근했다. 다들 "벌써 왔어?" 했다.' },
        ],
      },
      {
        phase: 'pm', delay: 4, who: 'phone',
        teaser: '며칠 뒤 검진 결과가 나온다. 왠지 떨린다.',
        text: '검진 결과 문자가 왔다. "[결과 안내] 일부 항목 재검이 필요합니다."',
        options: [
          { label: '바로 재검 예약을 한다', rolls: [
            { p: 0.7, fx: { cash: -80000, mental: 8 }, result: '재검 결과 이상 없음. 의사가 말했다. "스트레스 줄이세요." 그게 제일 어렵다.' },
            { p: 0.3, fx: { cash: -200000, hp: -10, mental: -8 }, result: '약을 먹어야 한단다. 몸이 먼저 사직서를 냈다.' },
          ] },
          { label: '"바쁘니까 다음에"', fx: { mental: -6 },
            result: '"다음에"라고 하고 3주째다. 문자가 계속 신경 쓰인다.' },
          { label: '인터넷에 증상을 검색한다', fx: { mental: -10 },
            result: '검색 결과 모든 길은 큰 병으로 통했다. 검색을 멈췄다.' },
        ],
      },
      {
        phase: 'off', delay: 1, who: 'none', scene: 'street',
        teaser: '검진 이후로 뭔가 바꿔야겠다는 생각이 든다.',
        text: '퇴근길. 오늘부터 뭔가 바꾸기로 했다.',
        options: [
          { label: '한 정거장 먼저 내려 걷는다', fx: { hp: 6, mental: 4 },
            result: '20분 걸었다. 내일도 할 수 있을 것 같다. 아마도.', end: true },
          { label: '헬스장 1년권을 끊는다', fx: { cash: -500000, hp: 3 },
            result: '1년권을 끊었다. 이번에는 다를 거다. 지난번에도 그렇게 말했다.', end: true },
          { label: '야근을 줄이기로 한다', fx: { hp: 8, eval: -3 },
            result: '7시가 되자 가방을 쌌다. 몸이 먼저였다.', end: true },
        ],
      },
    ],
  },

  {
    id: 'parents', title: '부모님 상경',
    steps: [
      {
        phase: 'lunch', who: 'phone',
        teaser: '내일 엄마한테 전화가 올 것 같다. 이번 주말 얘기일 것이다.',
        text: '엄마 전화. "이번 주말에 아빠랑 서울 올라갈게. 너 회사 구경 좀 하자."',
        options: [
          { label: '"좋아! 맛있는 거 사 드릴게"', fx: { mental: 5 },
            result: '"회사 앞에서 사진 찍자." 엄마 목소리가 들떠 있었다.' },
          { label: '"회사는 좀…"', fx: { mental: -3 },
            result: '"왜, 부끄러워?" 부끄러운 건 회사다.' },
          { label: '"나 주말에도 바빠"', fx: { mental: -6 },
            result: '"그래… 다음에 가지 뭐." 전화를 끊고 한참 마음이 불편했다.', end: true },
        ],
      },
      {
        phase: 'off', delay: 2, who: 'none', scene: 'restaurant',
        teaser: '주말, 부모님과의 저녁. 메뉴를 정해야 한다.',
        text: '부모님과 저녁. 메뉴판을 보던 아빠가 묻는다. "여기 비싼 데 아니냐?"',
        options: [
          { label: '"괜찮아, 내가 쏠게"', fx: { cash: -150000, mental: 10 },
            result: '아빠가 직원에게 말했다. "우리 애가 사는 거예요." 15만 원이 아깝지 않은 한마디.' },
          { label: '적당한 곳으로 옮긴다', fx: { cash: -60000, mental: 5 },
            result: '동네 갈비집. 엄마는 여기가 더 맛있다고 했다. 진심 같았다.' },
          { label: '결국 아빠가 계산한다', fx: { mental: -4 },
            result: '"너 돈 아껴." 카드를 막을 틈도 없었다. 조금 서글펐다.' },
        ],
      },
      {
        phase: 'off', delay: 1, who: 'none', scene: 'street',
        teaser: '부모님이 내려가시는 날. 엄마가 뭔가를 챙겨 온 것 같다.',
        text: '터미널. 엄마가 봉투를 쥐여 준다. "회사 힘들면 그만둬도 돼. 너 하나는 먹여 살려."',
        options: [
          { label: '봉투를 받는다', fx: { cash: 300000, mental: 12 },
            result: '버스가 떠날 때까지 손을 흔들었다. 봉투보다 그 말이 더 컸다.', end: true },
          { label: '"됐어, 나 잘 벌어"', fx: { mental: 8 },
            result: '봉투를 다시 엄마 가방에 넣었다. 집에 와 보니 내 가방에 들어 있었다.', end: true },
          { label: '아무 말도 못 하고 안아 드린다', fx: { mental: 15 },
            result: '오랜만이었다. 다음 주는 조금 덜 힘들 것 같다.', end: true },
        ],
      },
    ],
  },

  {
    id: 'restructure', title: '희망퇴직',
    when: (s) => s.month >= 3,
    steps: [
      {
        phase: 'morning', who: 'hr', prop: 'mail',
        teaser: '내일 인사팀에서 "중요 공지"가 나간다고 한다. 다들 표정이 어둡다.',
        text: '인사팀 공지: "경영 효율화를 위한 희망퇴직 신청을 받습니다. 위로금: 기본급 6개월분."',
        options: [
          { label: '공지를 끝까지 꼼꼼히 읽는다', fx: { mental: -5 },
            result: '위로금 계산을 세 번 해 봤다. 숫자가 자꾸 눈에 밟힌다.' },
          { label: '"나랑은 상관없어"', fx: { mental: 2 },
            result: '상관없다고 세 번 말했다. 네 번째에는 자신이 없었다.' },
          { label: '동기들과 긴급 회의', fx: { mental: -3, hp: -2 },
            result: '단톡방 이름이 "탈출 작전 회의"로 바뀌었다.' },
        ],
      },
      {
        phase: 'pm', delay: 2, who: 'hr', scene: 'hrroom',
        teaser: '인사팀이 개별 면담을 시작했다. 내 차례도 곧이다.',
        text: '인사팀 면담. "혹시… 신청해 보실 생각 있으세요? 강요는 아닙니다."',
        options: [
          { label: '"신청하겠습니다"', fx: { mental: 5 },
            result: '서류에 이름을 적었다. 손이 떨렸다. 이상하게 후련했다.', next: 2 },
          { label: '"저는 남겠습니다"', fx: { eval: 4, mental: -6 },
            result: '"알겠습니다." 면담은 3분 만에 끝났다. 나가면서 들어오는 다음 사람과 눈이 마주쳤다.', end: true },
          { label: '"위로금 협상이 되나요?"', rolls: [
            { p: 0.5, fx: { mental: 4 }, result: '"검토해 보겠습니다." 인사팀이 처음으로 긴장한 얼굴을 했다.' },
            { p: 0.5, fx: { eval: -6, mental: -4 }, result: '"그건 어렵습니다." 괜히 찍힌 것 같다.' },
          ], end: true },
        ],
      },
      {
        phase: 'morning', delay: 3, who: 'hr', prop: 'mail',
        teaser: '희망퇴직 결과 발표가 며칠 뒤다. 잠이 안 온다.',
        text: '인사팀 메일: "희망퇴직 신청이 반려되었습니다. 사유: 꼭 필요한 인재."',
        options: [
          { label: '기뻐한다', fx: { eval: 6, mental: 4 },
            result: '"꼭 필요한 인재." 캡처해서 배경화면으로 했다.', end: true },
          { label: '허탈해한다', fx: { mental: -8 },
            result: '나갈 준비를 다 했는데. 짐 싼 상자를 다시 풀었다.', end: true },
          { label: '"그럼 연봉을 올려 주세요"', rolls: [
            { p: 0.4, fx: { salary: 200000, mental: 8 }, result: '"…검토해 보죠." 다음 달 월급이 20만 원 올랐다. 필요한 인재의 힘.' },
            { p: 0.6, fx: { eval: -4, mental: -4 }, result: '"그건 별개의 문제입니다." 필요하긴 한데 비싸면 안 되는 인재였다.' },
          ], end: true },
        ],
      },
    ],
  },
];
