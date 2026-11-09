# 아이폰 앱 출시 안내 — 퇴사할게요

빌드는 GitHub Actions의 맥에서 하고, App Store Connect(TestFlight)로 바로 올라간다. 내 컴퓨터에서 Xcode로 빌드할 필요는 없다.
명령은 윈도우 파워셸이나 맥 터미널(zsh) 어느 쪽이든 된다. 아래 4·5번에 둘 다 적어 두었다.

## 0. 처음 한 번만 준비
1. **Apple Developer Program 가입**(연 회비)한 애플 계정
2. **GitHub CLI 설치** (파워셸):
   ```powershell
   winget install --id GitHub.cli
   gh auth login
   ```

## 1. 번들 ID 등록 (developer.apple.com)
Certificates, Identifiers & Profiles → Identifiers → **+** → App IDs → App
- Description: `Toesa`
- Bundle ID (Explicit): **`com.minimalbreeze.toesa`**
- Capabilities: 아무것도 켜지 않아도 됨 → Register

## 2. 앱 만들기 (appstoreconnect.apple.com)
앱 → **+** → 새로운 앱
- 플랫폼: iOS
- 이름: `퇴사할게요 : 오늘도 버텼다` ("퇴사할게요"는 이미 다른 앱이 쓰고 있다. 홈 화면 아이콘 이름은 그대로 "퇴사할게요")
- 기본 언어: 한국어
- 번들 ID: `com.minimalbreeze.toesa`
- SKU: `toesa-001`

## 3. 업로드용 API 키 만들기 (App Store Connect)
> 줄넘기 챌린지 때 만든 API 키(.p8 파일)와 팀 ID가 있으면 **3번은 건너뛰고** 그 값을 4번에 그대로 넣으면 된다. 키는 앱마다가 아니라 개발자 계정에 하나다.

사용자 및 액세스 → 통합 → App Store Connect API → 팀 키 → **+**
- 이름: `github-actions`, 액세스: **관리자(Admin)** ← 인증서를 자동으로 만들려면 관리자여야 함
- 만든 뒤 **키 ID**, 위쪽의 **발급자(Issuer) ID**를 적어 두고, **API 키 다운로드**(.p8, 한 번만 받을 수 있음)

**팀 ID**: developer.apple.com → Account → Membership details → Team ID (10자리)

## 4. GitHub에 비밀값 등록
맥 터미널:
```zsh
brew install gh && gh auth login   # gh가 없을 때만
R=minimalbreeze/toesa
gh secret set APPLE_TEAM_ID -R $R -b "팀ID10자리"
gh secret set ASC_KEY_ID    -R $R -b "키ID"
gh secret set ASC_ISSUER_ID -R $R -b "발급자ID"
gh secret set ASC_KEY_P8    -R $R < ~/Downloads/AuthKey_키ID.p8
gh secret list -R $R          # 4개가 보이면 끝
```
윈도우 파워셸:
```powershell
$R = "minimalbreeze/toesa"
gh secret set APPLE_TEAM_ID -R $R -b "팀ID10자리"
gh secret set ASC_KEY_ID    -R $R -b "키ID"
gh secret set ASC_ISSUER_ID -R $R -b "발급자ID"
Get-Content -Raw "$HOME\Downloads\AuthKey_키ID.p8" | gh secret set ASC_KEY_P8 -R $R
```
비밀값은 GitHub에 암호화돼서 저장되고, 공개 리포여도 다른 사람은 볼 수 없다.

## 5-B. 맥에서 Xcode로 직접 올리기 (비밀값 없이, 1.0은 이렇게 올렸다)
```zsh
cd ~/toesa && git pull && npm ci && npm run build && npx cap sync ios
open ios/App/App.xcodeproj
```
- Signing & Capabilities → Team 고르기 → 맨 위 기기 `Any iOS Device (arm64)` → Product → Archive → Distribute App → App Store Connect
- 새 버전은 General 탭의 Version(예: 1.0.1)이나 Build 번호를 올린 뒤 Archive 한다
- codesign이 키체인 비밀번호를 계속 물으면 한 번만: `security set-key-partition-list -S apple-tool:,apple:,codesign: -s ~/Library/Keychains/login.keychain-db` (맥 비밀번호, 영어 입력으로)

## 5. 빌드하고 올리기 (GitHub Actions, 비밀값 4개가 있을 때)
```
gh workflow run ios-testflight.yml -R minimalbreeze/toesa -f version=1.0.0
gh run watch -R minimalbreeze/toesa
```
15~25분 걸린다. 초록색 체크가 뜨면 App Store Connect로 올라간 것이다.
새 버전을 올릴 때는 `version`만 바꾼다(예: `1.0.1`). 빌드 번호는 자동으로 올라간다.

## 6. TestFlight로 내 아이폰에서 먼저 해 보기
App Store Connect → 앱 → TestFlight
- 빌드가 "처리 중"에서 끝나면(10~30분) **내부 테스트** 그룹을 만들고 내 애플 계정을 추가
- 아이폰에 **TestFlight** 앱을 깔면 초대가 온다 → 설치
- 꼭 확인: 첫 화면 → 입사 서류(시작 난이도), 17:55 부장님, 근무 일지, 주말, 월급날 명세서, 재테크, 사직서 → 엔딩 영상(소리 포함), 결과 공유하기, 앱을 껐다 켜도 이어서 되는지

## 7. 심사 제출 (App Store Connect → 앱 → iOS 앱 1.0)
`store/listing.md`의 내용을 복사해서 넣는다.
- 스크린샷: `store/screenshots/01~07.png` 순서대로 (6.9인치, 1320×2868, 위쪽에 헤더 문구가 들어간 버전) — 아이폰 전용 앱이라 아이패드 스크린샷은 필요 없음
- 개인정보처리방침 URL: `https://minimalbreeze.github.io/toesa/privacy.html`
- 지원 URL: `https://minimalbreeze.github.io/toesa/support.html`
- 앱 개인정보 보호: **"데이터를 수집하지 않음"**
- 연령 등급 설문: 술 언급(치맥)은 "드물게/약하게", 도박은 "없음"(주식은 모의 투자, 실제 돈 없음). 나머지는 없음
- 가격: 무료 (유료 앱 계약은 필요 없음)
- 빌드 선택 → 심사에 추가 → 제출

## 문제가 생기면
- 빌드 로그: `gh run view -R minimalbreeze/toesa --log-failed`
- 서명 오류(No signing certificate 등): API 키 액세스가 **관리자**인지, 팀 ID가 맞는지 확인
- "No suitable application records": 2번의 앱 만들기와 번들 ID가 같은지 확인
