# 퇴사하고 싶다 : 오늘도 버텼다

평범한 직장인이 회사를 버티면서 부업을 키우고, 언젠가 사직서를 던지는 세로형 픽셀 게임.
방치형 성장 + 선택형 시뮬레이션.

- 웹: GitHub Pages (`index.html`을 그대로 연다. 빌드 도구 없음)
- 아이폰: 같은 웹 파일을 Capacitor로 감싼다 → `RELEASE-iOS.md`

## 파일
| 파일 | 내용 |
|---|---|
| `js/data/events.js` | 선택형 이벤트 65개. 문장을 고치려면 여기만 |
| `js/data/sidejobs.js` | 부업 3종과 레벨업 문구 |
| `js/data/endings.js` | 엔딩 3개 |
| `js/data/config.js` | 밸런스 숫자 전부 (월급, 생활비, 퇴사 조건…) |
| `js/sprites.js` | 픽셀 그림 (캐릭터는 글자 격자, 장면 11개) |
| `js/sound.js` | 효과음 (Web Audio, 파일 없음) |
| `js/game.js` | 진행 로직, 저장, 화면 |
| `css/style.css` | 화면 모양 |
| `scripts/make-icons.py` | 아이콘 4종 + iOS 아이콘 다시 만들기 |

## 한 판의 흐름
09:00 출근 → 10:30 오전 → 12:30 점심 → 15:00 오후 → 17:55 퇴근 5분 전 → 19:00 퇴근 후(뻗기·부업·치맥)
월~금 5일이 게임 속 한 달. 금요일 밤이 지나면 월급날.

## 로컬에서 보기
아무 정적 서버로 연다. 예: `npx serve .`
주소 끝에 `#test`를 붙이면 출근 도장 제한 없이 테스트할 수 있다.
콘솔에서 `TT.state()`로 현재 상태를 볼 수 있고, `TT.reset()`으로 처음부터 시작한다.

## 글꼴
갈무리11 (Galmuri11, SIL Open Font License 1.1) — `fonts/OFL-Galmuri.md`
