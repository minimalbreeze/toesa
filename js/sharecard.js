// 공유 카드: 엔딩·리포트를 이미지 한 장으로 만든다 (1080×1350, 인스타·스레드 세로 비율).
// 보상이 아니라 "자랑할 거리"를 주려는 것이다. 서버도 계정도 필요 없다.
// 그림은 sprites.js의 장면을 그대로 8배 키워 쓴다 (손으로 다시 그리지 않는다).
// 색: 배경은 게임 바탕(#2f2b3a), 강조는 노랑. 빨강(#d9432f)은 사직서 도장에만 쓴다. 핑크는 안 쓴다.

T.ShareCard = (function () {
  const W = 1080, H = 1350;
  const FONT = "'Galmuri11', 'Apple SD Gothic Neo', sans-serif";
  const C = { bg: '#2f2b3a', paper: '#f4efe4', ink: '#2f2b3a', dim: '#cfc6b8', gold: '#ffc66b', red: '#d9432f', green: '#2f8a5c', line: '#4a4458' };

  async function fonts() {
    try { await Promise.all([document.fonts.load(`700 40px ${FONT}`), document.fonts.load(`400 30px ${FONT}`)]); } catch (e) { /* 기본 글꼴로 그린다 */ }
  }

  function wrap(ctx, text, x, y, maxW, lh, maxLines) {
    const words = String(text).split(' ');
    let line = '', n = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        n++;
        if (maxLines && n >= maxLines) { ctx.fillText(line + '…', x, y); return y + lh; }
        ctx.fillText(line, x, y); y += lh; line = words[i];
      } else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }

  function base(scene) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    // 머리: 게임 이름
    ctx.textBaseline = 'top';
    ctx.fillStyle = C.gold; ctx.font = `700 34px ${FONT}`;
    ctx.fillText('퇴사할게요 : 오늘도 버텼다', 60, 52);
    // 장면 (120×84 → 8배 = 960×672)
    const sc = document.createElement('canvas'); sc.width = 120; sc.height = 84;
    T.Sprites.draw(sc.getContext('2d'), Object.assign({ frame: 0 }, scene));
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#1d1a25'; ctx.fillRect(52, 112, 976, 688);
    ctx.drawImage(sc, 60, 120, 960, 672);
    // 종이
    ctx.fillStyle = C.paper; ctx.fillRect(60, 830, 960, 400);
    // 발: 주소
    ctx.fillStyle = C.dim; ctx.font = `400 28px ${FONT}`;
    ctx.fillText('minimalbreeze.github.io/toesa', 60, 1262);
    ctx.textAlign = 'right'; ctx.fillText('#퇴사할게요', 1020, 1262); ctx.textAlign = 'left';
    return { cv, ctx };
  }

  function tagline(ctx, text) {
    ctx.fillStyle = '#7a7286'; ctx.font = `400 26px ${FONT}`; ctx.textBaseline = 'top';
    ctx.fillText(text || '버틸까, 던질까. 직장인 퇴사 게임', 100, 1182);
  }

  function stamp(ctx, text, color) {
    ctx.save();
    ctx.translate(840, 180); ctx.rotate(-0.12);
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(-130, -42, 260, 84);
    ctx.fillStyle = color; ctx.font = `700 40px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 2);
    ctx.restore();
  }

  // 엔딩 카드. o = { scene, title, line, grade, days, diff, company, rank, moments, failed, stay }
  async function ending(o) {
    await fonts();
    const { cv, ctx } = base(o.scene);
    stamp(ctx, o.failed ? '실패 퇴사' : o.stay ? '사직서 찢음' : '사직서 수리', o.failed ? C.dim : o.stay ? C.green : C.red);
    ctx.textBaseline = 'top'; ctx.fillStyle = C.ink;
    let y = 868;
    if (o.grade) {
      ctx.fillStyle = C.ink; ctx.fillRect(100, y, 96, 96);
      ctx.fillStyle = C.gold; ctx.font = `700 64px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(o.grade, 148, y + 16); ctx.textAlign = 'left';
      ctx.fillStyle = C.ink; ctx.font = `700 52px ${FONT}`; ctx.fillText(o.title, 220, y + 8);
      ctx.font = `400 30px ${FONT}`; ctx.fillStyle = '#5a5366'; ctx.fillText(`${o.grade}등급`, 222, y + 70);
      y += 130;
    } else {
      ctx.font = `700 52px ${FONT}`; ctx.fillText(o.title, 100, y); y += 84;
    }
    ctx.fillStyle = '#3d3748'; ctx.font = `400 34px ${FONT}`;
    y = wrap(ctx, o.line, 100, y, 880, 48, 2) + 14;
    ctx.fillStyle = '#5a5366'; ctx.font = `400 30px ${FONT}`;
    const facts = [`출근 ${o.days}일`, o.diff ? `${o.diff} 시작` : '', o.rank, o.stay || o.moments >= 10 ? `좋은 순간 ${o.moments}번` : ''].filter(Boolean).join(' · ');
    wrap(ctx, facts, 100, y, 880, 42, 2);
    tagline(ctx);
    return cv;
  }

  // 리포트 카드. o = { scene, persona, body, traits: [[이름, 비율]...], company, months }
  async function report(o) {
    await fonts();
    const { cv, ctx } = base(o.scene);
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#8a6a1f'; ctx.font = `700 30px ${FONT}`; ctx.fillText('내 회사생활 진단', 100, 868);
    ctx.fillStyle = C.ink; ctx.font = `700 52px ${FONT}`;
    let y = wrap(ctx, `「${o.persona}」`, 100, 912, 880, 64, 2) + 16;
    ctx.font = `400 30px ${FONT}`;
    if (o.traits.some(([, v]) => v > 0)) o.traits.slice(0, 3).forEach(([name, v]) => {
      ctx.fillStyle = '#3d3748'; ctx.fillText(name, 100, y);
      ctx.fillStyle = '#ddd5c6'; ctx.fillRect(330, y + 6, 540, 24);
      ctx.fillStyle = C.green; ctx.fillRect(330, y + 6, Math.round(540 * Math.max(0, Math.min(1, v))), 24);
      ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText(Math.round(v * 100) + '%', 980, y); ctx.textAlign = 'left';
      y += 50;
    });
    tagline(ctx, '게임 속 선택으로 만든 재미용 진단');
    return cv;
  }

  function toBlob(cv) { return new Promise((res) => cv.toBlob((b) => res(b), 'image/png')); }

  // 공유: 이미지 공유가 되면 이미지로, 안 되면 이미지를 띄워 길게 눌러 저장하게 한다.
  // 반환: 'shared' | 'cancel' | 'fallback'
  async function share(cv, text, url) {
    try {
      const blob = await toBlob(cv);
      const file = new File([blob], 'toesa.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: text + '\n' + url });
        return 'shared';
      }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
    return 'fallback';
  }

  return { ending, report, share, dataURL: (cv) => cv.toDataURL('image/png') };
})();
