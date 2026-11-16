// 웹 버전 방문 집계(GA4). 측정 ID가 비어 있으면 아무것도 안 한다 (요청 0, 쿠키 0).
//
// 아이폰 앱에서는 절대 켜지지 않는다.
//   앱(Capacitor)은 같은 index.html을 capacitor://localhost 에서 연다. 앱스토어에는 데이터 수집을
//   신고하지 않았으므로, 앱 안에서 집계를 보내면 신고 내용과 실제 동작이 어긋난다.
//   그래서 웹 주소(minimalbreeze.github.io)에서 열렸을 때만 켠다.
//
// 내 방문 빼기: 주소 끝에 ?noga=1 을 붙여 한 번 열면 그 기기는 영구히 제외된다. 다시 켜기는 ?noga=0.
(function () {
  var ID = ''; // ← GA4 측정 ID (G-로 시작). 비어 있으면 꺼져 있다.
  if (!ID) return;

  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return;
  if (location.protocol !== 'https:') return;               // capacitor://, file:// 등
  if (location.hostname !== 'minimalbreeze.github.io') return; // 로컬 테스트도 안 센다

  var KEY = 'toesa:noAnalytics';
  var off = false;
  try {
    var q = new URLSearchParams(location.search).get('noga');
    if (q === '1') { localStorage.setItem(KEY, '1'); notice('이 기기는 방문 집계에서 빠졌어'); }
    else if (q === '0') { localStorage.removeItem(KEY); notice('이 기기 방문 집계를 다시 켰어'); }
    off = localStorage.getItem(KEY) === '1';
  } catch (e) { /* 저장소를 못 쓰면 평소대로 센다 */ }
  if (off) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID, { anonymize_ip: true });

  function notice(msg) {
    function show() {
      var el = document.createElement('div');
      el.textContent = msg;
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:99999;'
        + 'max-width:90vw;padding:10px 16px;font-size:13px;background:#2f2b3a;color:#fff;';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 4000);
    }
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  }
})();
