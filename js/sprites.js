// 픽셀 그림. 캔버스는 120×84 칸이고, CSS가 그대로 키워서 보여 준다(image-rendering: pixelated).
// 캐릭터는 글자 격자로 그린다. 글자 하나 = 픽셀 하나, '.'은 투명.
(function () {
  const W = 120, H = 84;

  const PAL = {
    k: '#2b2833', // 외곽선
    s: '#f2c9a0', // 피부
    p: '#f0a090', // 볼터치
    e: '#2b2833', // 눈 (깜빡일 때 바뀜)
    h: '#3b2f2f', // 머리
    w: '#fbfaf5', // 셔츠
    t: '#d9432f', // 넥타이
    b: '#4a5a7a', // 정장
    g: '#6e6a78', // 부장님 정장
    r: '#c23b2a', // 부장님 넥타이
    l: '#cfe8ff', // 안경알
    d: '#7fd6c2', // 화면
  };

  const PLAYER = [
    '....kkkkkkkk....',
    '...khhhhhhhhk...',
    '..khhhhhhhhhhk..',
    '..khhssssssshk..',
    '..khsssssssssk..',
    '..kssessssessk..',
    '..kspsssssspsk..',
    '..ksssskkssssk..',
    '...kssssssssk...',
    '....kkkkkkkk....',
    '..kbbwwttwwbbk..',
    '.kbbbwwttwwbbbk.',
    '.kbbbbwttwbbbbk.',
    '.kbbbbbttbbbbbk.',
    '.ksbbbbbbbbbbsk.',
    '.kkbbbbbbbbbbkk.',
    '...kbbbkkbbbk...',
    '...kbbbkkbbbk...',
    '..kkkkk..kkkkk..',
  ];

  const BOSS = [
    '................',
    '....kkkkkkkk....',
    '...kssswssssk...',
    '..kssssssssssk..',
    '..khsssssssshk..',
    '..kkkkksskkkkk..',
    '..kleelssleelk..',
    '..kssssssssssk..',
    '..kshhhhhhhhsk..',
    '..ksssskkssssk..',
    '...kssssssssk...',
    '....kkkkkkkk....',
    '..kggwwrrwwggk..',
    '.kgggwwrrwwgggk.',
    'kggggwwrrwwggggk',
    'kggggggrrggggggk',
    'ksggggggggggggsk',
    '.kkggggggggggkk.',
    '...kgggkkgggk...',
    '..kkkkk..kkkkk..',
  ];

  const PHONE = [
    '.kkkkkk.',
    'kddddddk',
    'kdkkkkdk',
    'kddddddk',
    'kdkkkddk',
    'kddddddk',
    'kdkkkkdk',
    'kddddddk',
    'kkkkkkkk',
    'kkkwwkkk',
    '.kkkkkk.',
  ];

  // 같은 몸에 색만 바꿔 입힌다
  const SKINS = {
    player: { grid: PLAYER, pal: {}, blink: 's' },
    peer:   { grid: PLAYER, pal: { h: '#8a5a3b', b: '#3f8f6a', t: '#fbfaf5' }, blink: 's' },
    newbie: { grid: PLAYER, pal: { h: '#d9a441', b: '#9aa7c7', t: '#5b7cfa' }, blink: 's' },
    hr:     { grid: PLAYER, pal: { h: '#2b2833', b: '#8b5fbf', t: '#fbfaf5' }, blink: 's' },
    boss:   { grid: BOSS,   pal: {}, blink: 'l' },
    ceo:    { grid: PLAYER, pal: { h: '#c9c4d3', b: '#35303f', t: '#f2b84b' }, blink: 's' },
    crowd:  { grid: PLAYER, pal: { h: '#5f596b', s: '#b9b2c9', p: '#b9b2c9', b: '#7b7488', t: '#7b7488', w: '#9b93a5' }, blink: 's' },
  };

  const SKY = {
    morning: ['#bfe4ff', '#e8f6ff'],
    am:      ['#8fcfff', '#c9ebff'],
    lunch:   ['#79c3ff', '#b5e2ff'],
    pm:      ['#ffd98a', '#fff0c4'],
    off:     ['#ff9e6d', '#ffd08a'],
    evening: ['#262a52', '#3a3f74'],
  };

  const TIME = { morning: [9, 0], am: [10, 30], lunch: [12, 30], pm: [15, 0], off: [17, 55], evening: [19, 0] };

  function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

  function grid(ctx, rows, pal, x, y, opt) {
    const o = opt || {};
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      for (let i = 0; i < row.length; i++) {
        let c = row[i];
        if (c === '.') continue;
        if (c === 'e' && o.blink) c = o.blink;
        if (c === 'e' && o.shades) c = 'k';
        const xi = o.flip ? row.length - 1 - i : i;
        ctx.fillStyle = (pal && pal[c]) || PAL[c];
        ctx.fillRect(x + xi, y + j, 1, 1);
      }
    }
  }

  function person(ctx, who, x, y, f, opt) {
    const sk = SKINS[who] || SKINS.player;
    const o = Object.assign({}, opt);
    if (f % 23 === 0) o.blink = sk.blink;
    const bob = Math.floor(f / 3) % 2;
    grid(ctx, sk.grid, sk.pal, x, y + bob, o);
    if (o.shades) rect(ctx, x + 3, y + bob + 5, 10, 1, PAL.k);
    if (o.face && sk.grid === PLAYER) face(ctx, x, y + bob, o.face, o.flip, f);
  }

  // 표정: 입 모양만 바꿔 그린다 (격자는 그대로)
  function face(ctx, x, y, kind, flip, f) {
    const P = (i, j, c) => rect(ctx, x + (flip ? 15 - i : i), y + j, 1, 1, c);
    const k = PAL.k, s = PAL.s;
    for (let i = 6; i <= 9; i++) P(i, 7, s);
    for (let i = 5; i <= 10; i++) P(i, 8, s);
    if (kind === 'happy') { P(6, 7, k); P(9, 7, k); P(7, 8, k); P(8, 8, k); }
    else if (kind === 'sad') {
      P(7, 7, k); P(8, 7, k); P(6, 8, k); P(9, 8, k);
      const d = f % 6 < 3 ? 0 : 1;
      P(14, 4 + d, '#7fc8ff'); P(14, 5 + d, '#7fc8ff');
    } else if (kind === 'shock') {
      P(7, 7, k); P(8, 7, k); P(7, 8, k); P(8, 8, k);
      P(5, 4, k); P(10, 4, k);
    } else if (kind === 'sleep') {
      P(5, 5, s); P(10, 5, s); P(4, 5, k); P(5, 6, k); P(10, 6, k); P(11, 5, k);
      P(7, 7, k); P(8, 7, k);
    } else { P(7, 7, k); P(8, 7, k); }
  }

  function windowSky(ctx, x, y, w, h, phase, f) {
    const sky = SKY[phase] || SKY.am;
    rect(ctx, x - 1, y - 1, w + 2, h + 2, PAL.k);
    rect(ctx, x, y, w, h, sky[0]);
    rect(ctx, x, y + Math.floor(h * 0.6), w, h - Math.floor(h * 0.6), sky[1]);
    if (phase === 'evening') {
      rect(ctx, x + w - 8, y + 3, 4, 4, '#f7f1c6');
      rect(ctx, x + w - 7, y + 3, 1, 1, sky[0]);
      const stars = [[3, 4], [9, 2], [14, 7], [6, 10], [19, 4]];
      stars.forEach(([sx, sy], i) => { if ((f + i) % 6 > 1) rect(ctx, x + sx, y + sy, 1, 1, '#fffbe0'); });
    } else if (phase === 'off') {
      rect(ctx, x + 6, y + h - 7, 6, 6, '#ff6b3d');
    } else if (phase === 'pm') {
      rect(ctx, x + w - 10, y + 4, 5, 5, '#ffb347');
    } else {
      rect(ctx, x + 4, y + 3, 5, 5, '#fff3a6');
    }
    // 건물 실루엣
    const city = phase === 'evening' ? '#1b1d3a' : '#9aa6b8';
    rect(ctx, x + 2, y + h - 6, 5, 6, city);
    rect(ctx, x + 9, y + h - 9, 6, 9, city);
    rect(ctx, x + 17, y + h - 5, 4, 5, city);
    rect(ctx, x + 23, y + h - 8, 5, 8, city);
    if (phase === 'evening') {
      [[10, h - 7], [12, h - 4], [24, h - 6], [3, h - 4]].forEach(([wx, wy]) => rect(ctx, x + wx, y + wy, 1, 1, '#ffd36b'));
    }
    // 블라인드
    for (let by = y + 1; by < y + 9; by += 2) rect(ctx, x, by, w, 1, 'rgba(255,255,255,.35)');
    rect(ctx, x + Math.floor(w / 2), y, 1, h, PAL.k);
  }

  function clock(ctx, cx, cy, phase) {
    rect(ctx, cx - 5, cy - 6, 11, 13, PAL.k);
    rect(ctx, cx - 6, cy - 5, 13, 11, PAL.k);
    rect(ctx, cx - 4, cy - 5, 9, 11, '#fbfaf5');
    rect(ctx, cx - 5, cy - 4, 11, 9, '#fbfaf5');
    const [hh, mm] = TIME[phase] || [9, 0];
    const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2;
    const ma = mm / 60 * Math.PI * 2;
    for (let r = 0; r <= 3; r++) rect(ctx, cx + Math.round(Math.sin(ha) * r), cy - Math.round(Math.cos(ha) * r), 1, 1, PAL.k);
    for (let r = 0; r <= 4; r++) rect(ctx, cx + Math.round(Math.sin(ma) * r), cy - Math.round(Math.cos(ma) * r), 1, 1, '#d9432f');
  }

  function office(ctx, phase, f, o) {
    rect(ctx, 0, 0, W, 64, '#ddd6c4');
    rect(ctx, 0, 0, W, 2, '#cfc7b3');
    rect(ctx, 0, 62, W, 2, '#a89f8c');
    rect(ctx, 0, 64, W, H - 64, '#8d8577');
    for (let x = 0; x < W; x += 12) rect(ctx, x, 64, 1, H - 64, '#7f776a');
    rect(ctx, 0, 73, W, 1, '#7f776a');

    windowSky(ctx, 6, 6, 30, 22, phase, f);

    // 달력 (빨간 날 하나)
    rect(ctx, 47, 7, 14, 15, PAL.k);
    rect(ctx, 48, 8, 12, 13, '#fbfaf5');
    rect(ctx, 48, 8, 12, 3, '#d9432f');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) rect(ctx, 49 + i * 3, 13 + j * 3, 1, 1, '#9b93a5');
    rect(ctx, 58, 19, 1, 1, '#d9432f');

    clock(ctx, 104, 12, phase);

    // 화분
    rect(ctx, 104, 52, 9, 10, PAL.k);
    rect(ctx, 105, 53, 7, 8, '#c8734a');
    rect(ctx, 103, 42, 3, 6, '#3f8f6a');
    rect(ctx, 107, 38, 3, 14, '#4fa36f');
    rect(ctx, 111, 43, 3, 6, '#3f8f6a');

    // 화이트보드 대신 포스트잇
    rect(ctx, 70, 10, 5, 5, '#ffe27a');
    rect(ctx, 77, 13, 5, 5, '#ffb3c1');
    rect(ctx, 72, 18, 5, 5, '#a8e6cf');

    // 나: 책상 뒤에 앉아 있다
    const sleepy = o.mode === 'collapse';
    const myFace = o.prop === 'sleepy' ? 'sleep' : o.face;
    if (!o.hidePlayer) person(ctx, 'player', 12, sleepy ? 44 : 38, f, { face: myFace });
    if (o.prop === 'sleepy') zzz(ctx, 26, 34, f, PAL.k);

    // 모니터 (소품에 따라 화면이 바뀐다)
    monitor(ctx, 29, 39, o.mode === 'side' ? 'side' : o.prop, f);

    // 책상
    rect(ctx, 3, 56, 72, 3, PAL.k);
    rect(ctx, 4, 56, 70, 2, '#b07b4f');
    rect(ctx, 4, 59, 70, 12, '#94653f');
    rect(ctx, 3, 59, 1, 12, PAL.k);
    rect(ctx, 74, 59, 1, 12, PAL.k);
    rect(ctx, 4, 70, 70, 1, PAL.k);
    rect(ctx, 34, 63, 10, 1, '#6f4a2c');

    // 머그컵 + 김
    rect(ctx, 58, 51, 6, 5, PAL.k);
    rect(ctx, 59, 52, 4, 4, '#fbfaf5');
    rect(ctx, 64, 52, 1, 2, PAL.k);
    if (f % 4 < 2) { rect(ctx, 60, 48, 1, 2, '#ffffff'); rect(ctx, 61, 46, 1, 2, '#ffffff'); }
    else { rect(ctx, 61, 48, 1, 2, '#ffffff'); rect(ctx, 60, 46, 1, 2, '#ffffff'); }

    if (o.prop === 'cake') {
      rect(ctx, 44, 49, 12, 7, PAL.k); rect(ctx, 45, 50, 10, 5, '#fbfaf5'); rect(ctx, 45, 52, 10, 1, '#ffb3c1');
      rect(ctx, 49, 46, 1, 3, '#ffe27a'); if (f % 2) rect(ctx, 49, 45, 1, 1, '#ff9e6d');
    }
    if (o.prop === 'parcel') {
      rect(ctx, 6, 46, 20, 10, PAL.k); rect(ctx, 7, 47, 18, 8, '#c8955c'); rect(ctx, 15, 47, 2, 8, '#e3c08b');
      rect(ctx, 9, 49, 5, 3, '#fbfaf5');
    }
    if (o.prop === 'printer') {
      rect(ctx, 84, 46, 22, 16, PAL.k); rect(ctx, 85, 47, 20, 14, '#cfc9d8'); rect(ctx, 88, 44, 14, 3, '#fbfaf5');
      rect(ctx, 89, 52, 12, 1, PAL.k); if (f % 2) rect(ctx, 102, 49, 2, 2, '#d9432f');
      rect(ctx, 88, 41 - (f % 3), 4, 4, '#fbfaf5');
    }
    if (sleepy) {
      rect(ctx, 0, 0, W, H, 'rgba(120,20,30,.25)');
      const zx = 24 + (f % 6), zy = 30 - (f % 6);
      rect(ctx, zx, zy, 3, 1, PAL.k); rect(ctx, zx + 1, zy + 1, 1, 1, PAL.k); rect(ctx, zx, zy + 2, 3, 1, PAL.k);
    }

    if (o.mode === 'pay') coins(ctx, f);
  }

  function coins(ctx, f) {
    for (let i = 0; i < 9; i++) {
      const x = 8 + i * 13;
      const y = ((f * 3 + i * 17) % 70) - 6;
      rect(ctx, x, y, 4, 4, '#2b2833');
      rect(ctx, x + 1, y + 1, 2, 2, '#f2b84b');
    }
  }

  function home(ctx, f, o) {
    rect(ctx, 0, 0, W, 62, '#3d3760');
    rect(ctx, 0, 62, W, H - 62, '#2c2747');
    for (let x = 6; x < W; x += 14) rect(ctx, x, 62, 1, H - 62, '#25213d');
    windowSky(ctx, 8, 8, 30, 22, 'evening', f);

    // 스탠드
    rect(ctx, 98, 30, 12, 6, '#f2b84b');
    rect(ctx, 103, 36, 2, 26, '#1f1b33');
    rect(ctx, 99, 61, 10, 2, '#1f1b33');
    rect(ctx, 92, 36, 24, 26, 'rgba(242,184,75,.08)');

    // 소파
    rect(ctx, 6, 44, 70, 3, PAL.k);
    rect(ctx, 7, 45, 68, 10, '#c45b5b');
    if (!o.hidePlayer) person(ctx, 'player', 28, 34, f, { face: o.mode === 'rest' ? 'sleep' : o.face });
    rect(ctx, 5, 54, 72, 14, PAL.k);
    rect(ctx, 6, 55, 70, 12, '#d96a6a');
    rect(ctx, 6, 55, 70, 2, '#e88a7f');
    rect(ctx, 4, 50, 6, 17, '#a8494b');
    rect(ctx, 72, 50, 6, 17, '#a8494b');

    if (o.mode === 'side') {
      rect(ctx, 33, 50, 14, 8, PAL.k);
      rect(ctx, 34, 51, 12, 6, '#7fd6c2');
      rect(ctx, 31, 58, 18, 2, '#9b93a5');
      rect(ctx, 26, 34, 28, 26, 'rgba(127,214,194,.10)');
    }
    if (o.mode === 'beer') {
      rect(ctx, 84, 60, 20, 3, '#94653f');
      rect(ctx, 86, 54, 4, 6, '#f2b84b'); rect(ctx, 86, 53, 4, 1, '#fbfaf5');
      rect(ctx, 93, 55, 8, 5, '#c8734a'); rect(ctx, 94, 54, 2, 1, '#e3a36b'); rect(ctx, 97, 54, 3, 1, '#e3a36b');
    }
    if (o.mode === 'rest') {
      const zx = 50 + (f % 6), zy = 26 - (f % 6);
      rect(ctx, zx, zy, 3, 1, '#fbfaf5'); rect(ctx, zx + 1, zy + 1, 1, 1, '#fbfaf5'); rect(ctx, zx, zy + 2, 3, 1, '#fbfaf5');
    }
  }

  function beach(ctx, f) {
    rect(ctx, 0, 0, W, 40, '#8fd3ff');
    rect(ctx, 0, 24, W, 16, '#bfe8ff');
    rect(ctx, 90, 8, 10, 10, '#ffe27a');
    rect(ctx, 0, 40, W, 16, '#3fa7d6');
    for (let i = 0; i < 6; i++) rect(ctx, ((i * 23 + f * 2) % (W + 10)) - 10, 44 + (i % 3) * 4, 8, 1, '#bfe8ff');
    rect(ctx, 0, 56, W, H - 56, '#f2d59b');
    for (let i = 0; i < 12; i++) rect(ctx, (i * 37) % W, 60 + (i * 7) % 20, 1, 1, '#d9b877');
    // 파라솔
    rect(ctx, 20, 30, 1, 34, PAL.k);
    for (let i = 0; i < 9; i++) rect(ctx, 11 + i * 2, 30 - Math.min(i, 8 - i), 2, Math.min(i, 8 - i) + 2, i % 2 ? '#fbfaf5' : '#d9432f');
    person(ctx, 'player', 52, 44, f, { shades: true });
  }

  function farm(ctx, f) {
    rect(ctx, 0, 0, W, 44, '#9fd8ff');
    rect(ctx, 0, 30, W, 14, '#c9ecff');
    rect(ctx, 92, 8, 10, 10, '#ffe27a');
    // 먼 산
    for (let x = 0; x < W; x++) { const h = 6 + Math.round(4 * Math.sin(x / 9)); rect(ctx, x, 44 - h, 1, h, '#7cb98a'); }
    rect(ctx, 0, 44, W, H - 44, '#8fc46a');
    // 밭고랑
    for (let y = 50; y < H; y += 6) { rect(ctx, 0, y, W, 2, '#6f9e4e'); for (let x = (y % 12); x < W; x += 12) rect(ctx, x, y - 2, 3, 2, '#4f8a3a'); }
    // 작은 집
    rect(ctx, 8, 28, 26, 18, PAL.k); rect(ctx, 9, 29, 24, 16, '#f0d9b5');
    for (let i = 0; i < 14; i++) rect(ctx, 6 + i, 28 - i / 2 | 0, 30 - i * 2, 1, '#c23b2a');
    rect(ctx, 18, 36, 6, 10, '#94653f');
    person(ctx, 'player', 54, 42, f, {});
    // 밀짚모자
    rect(ctx, 52, 41 + (Math.floor(f / 3) % 2), 20, 2, '#e3c08b'); rect(ctx, 56, 38 + (Math.floor(f / 3) % 2), 12, 3, '#e3c08b');
  }

  function shop(ctx, f) {
    rect(ctx, 0, 0, W, H, '#cfe6f0');
    rect(ctx, 10, 14, 100, 52, '#fbfaf5');
    rect(ctx, 10, 14, 100, 1, PAL.k);
    for (let i = 0; i < 10; i++) rect(ctx, 10 + i * 10, 15, 10, 8, i % 2 ? '#fbfaf5' : '#3f8f6a');
    rect(ctx, 10, 23, 100, 1, PAL.k);
    rect(ctx, 38, 4, 44, 9, PAL.k);
    rect(ctx, 39, 5, 42, 7, '#f2b84b');
    rect(ctx, 16, 30, 26, 22, PAL.k); rect(ctx, 17, 31, 24, 20, '#bfe4ff');
    rect(ctx, 78, 30, 26, 22, PAL.k); rect(ctx, 79, 31, 24, 20, '#bfe4ff');
    rect(ctx, 0, 66, W, H - 66, '#9aa6b8');
    rect(ctx, 0, 66, W, 1, PAL.k);
    person(ctx, 'player', 52, 47, f, {});
    if (f % 8 < 4) rect(ctx, 70, 44, 3, 3, '#f2b84b');
  }

  function speaker(ctx, who, f) {
    if (!who || who === 'none') return;
    if (who === 'phone') {
      const sx = f % 2 ? 1 : 0;
      grid(ctx, PHONE, null, 92 + sx, 36);
      if (f % 4 < 2) { rect(ctx, 88, 38, 2, 1, PAL.k); rect(ctx, 102, 40, 2, 1, PAL.k); }
      return;
    }
    if (who === 'team') {
      person(ctx, 'peer', 80, 50, f + 5, { flip: true });
      person(ctx, 'newbie', 96, 52, f + 11, { flip: true });
      return;
    }
    person(ctx, who, 86, 50, f, { flip: true });
  }

  function zzz(ctx, x, y, f, c) {
    const zx = x + (f % 6), zy = y - (f % 6);
    rect(ctx, zx, zy, 3, 1, c); rect(ctx, zx + 1, zy + 1, 1, 1, c); rect(ctx, zx, zy + 2, 3, 1, c);
  }

  function monitor(ctx, x, y, kind, f) {
    rect(ctx, x, y, 24, 16, PAL.k);
    const scr = { side: '#2b2833', update: '#2f6fd6', nowifi: '#e4dfd2' }[kind] || '#7fd6c2';
    rect(ctx, x + 1, y + 1, 22, 13, scr);
    if (kind === 'excel') {
      for (let i = 0; i < 4; i++) rect(ctx, x + 2, y + 3 + i * 3, 20, 1, '#3f8f6a');
      for (let i = 0; i < 4; i++) rect(ctx, x + 2 + i * 5, y + 2, 1, 11, '#3f8f6a');
      rect(ctx, x + 7 + (f % 3) * 5, y + 6, 4, 2, '#2b2833');
    } else if (kind === 'mail') {
      rect(ctx, x + 6, y + 3, 12, 8, '#fbfaf5'); rect(ctx, x + 6, y + 3, 12, 1, PAL.k);
      for (let i = 0; i < 6; i++) rect(ctx, x + 6 + i, y + 4 + i * 0.5 | 0, 1, 1, PAL.k), rect(ctx, x + 17 - i, y + 4 + i * 0.5 | 0, 1, 1, PAL.k);
      if (f % 4 < 2) rect(ctx, x + 18, y + 2, 3, 3, '#d9432f');
    } else if (kind === 'chat') {
      rect(ctx, x + 2, y + 2, 12, 4, '#fbfaf5'); rect(ctx, x + 9, y + 8, 12, 4, '#ffe27a');
      if (f % 4 < 2) rect(ctx, x + 3, y + 3, 1, 1, PAL.k), rect(ctx, x + 5, y + 3, 1, 1, PAL.k), rect(ctx, x + 7, y + 3, 1, 1, PAL.k);
    } else if (kind === 'update') {
      rect(ctx, x + 3, y + 9, 18, 2, '#1d4fa8'); rect(ctx, x + 3, y + 9, 1 + (f % 18), 2, '#fbfaf5');
      rect(ctx, x + 9, y + 3, 6, 4, '#fbfaf5'); rect(ctx, x + 10, y + 4, 4, 2, '#2f6fd6');
    } else if (kind === 'video') {
      for (let i = 0; i < 4; i++) {
        const cx = x + 1 + (i % 2) * 11, cy = y + 1 + (i >> 1) * 7;
        rect(ctx, cx, cy, 10, 6, ['#9aa7c7', '#c8734a', '#7fd6c2', '#d9a441'][i]);
        rect(ctx, cx + 4, cy + 1, 3, 3, '#f2c9a0');
      }
      if (f % 2) rect(ctx, x + 2, y + 2, 2, 2, '#d9432f');
    } else if (kind === 'nowifi') {
      rect(ctx, x + 8, y + 9, 8, 1, '#9b93a5'); rect(ctx, x + 6, y + 6, 12, 1, '#9b93a5'); rect(ctx, x + 4, y + 3, 16, 1, '#9b93a5');
      rect(ctx, x + 11, y + 11, 2, 2, '#9b93a5');
      for (let i = 0; i < 9; i++) rect(ctx, x + 7 + i, y + 3 + i, 1, 1, '#d9432f');
    } else {
      const lineC = kind === 'side' ? '#7fd6c2' : '#4c9f8c';
      for (let i = 0; i < 4; i++) {
        const len = [14, 9, 17, 6][(i + Math.floor(f / 4)) % 4];
        rect(ctx, x + 3, y + 3 + i * 3, len, 1, lineC);
      }
    }
    rect(ctx, x + 10, y + 16, 4, 2, PAL.k);
  }

  function floor(ctx, y, c1, c2, step) {
    rect(ctx, 0, y, W, H - y, c1);
    for (let x = 0; x < W; x += step) rect(ctx, x, y, 1, H - y, c2);
  }

  function elevator(ctx, f, o) {
    rect(ctx, 0, 0, W, H, '#b8bcc6');
    for (let x = 6; x < W; x += 18) rect(ctx, x, 0, 1, 66, '#a3a8b4');
    rect(ctx, 0, 30, W, 2, '#d7dae1');
    rect(ctx, 0, 66, W, H - 66, '#6b6574');
    rect(ctx, 46, 4, 28, 10, PAL.k); rect(ctx, 47, 5, 26, 8, '#2b2833');
    const n = 9 + (Math.floor(f / 6) % 7);
    digits(ctx, 52, 6, String(n), '#ff9e6d');
    rect(ctx, 66, 7, 3, 1, '#ff9e6d'); rect(ctx, 67, 6, 1, 1, '#ff9e6d');
    rect(ctx, 104, 30, 10, 22, PAL.k); rect(ctx, 105, 31, 8, 20, '#d7dae1');
    for (let i = 0; i < 5; i++) rect(ctx, 107, 33 + i * 4, 4, 2, i === 2 ? '#ffe27a' : '#9b93a5');
    person(ctx, 'player', 30, 47, f, { face: o.face || 'shock' });
    speakerAt(ctx, o.who, 66, 47, f);
  }

  function digits(ctx, x, y, str, c) {
    const D = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'], 6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'] };
    [...str].forEach((ch, n) => (D[ch] || []).forEach((row, j) => [...row].forEach((b, i) => { if (b === '1') rect(ctx, x + n * 4 + i, y + j, 1, 1, c); })));
  }

  function meeting(ctx, phase, f, o) {
    rect(ctx, 0, 0, W, 62, '#e6e1d3');
    rect(ctx, 8, 6, 56, 30, PAL.k); rect(ctx, 9, 7, 54, 28, '#fbfaf5');
    const scrib = [[12, 10, 20], [12, 14, 32], [12, 18, 14], [36, 22, 22], [12, 28, 28]];
    scrib.forEach(([sx, sy, len], i) => rect(ctx, sx, sy, (i + Math.floor(f / 3)) % 5 === 0 ? len - 6 : len, 1, i === 3 ? '#d9432f' : '#5b7cfa'));
    rect(ctx, 44, 10, 14, 10, '#ffe27a'); rect(ctx, 46, 13, 8, 1, PAL.k); rect(ctx, 46, 16, 6, 1, PAL.k);
    clock(ctx, 104, 12, phase);
    floor(ctx, 62, '#8d8577', '#7f776a', 12);
    person(ctx, 'player', 14, 38, f, { face: o.face });
    if (o.who === 'boss' || o.who === 'ceo') person(ctx, o.who, 90, 38, f, { flip: true });
    else { person(ctx, 'peer', 56, 39, f + 5, { flip: true }); person(ctx, 'newbie', 84, 39, f + 9, { flip: true }); }
    rect(ctx, 2, 55, 116, 3, PAL.k); rect(ctx, 3, 55, 114, 2, '#b07b4f'); rect(ctx, 3, 58, 114, 10, '#94653f');
    rect(ctx, 2, 58, 1, 10, PAL.k); rect(ctx, 117, 58, 1, 10, PAL.k); rect(ctx, 3, 67, 114, 1, PAL.k);
    [26, 66, 96].forEach((cx) => { rect(ctx, cx, 51, 6, 4, '#fbfaf5'); rect(ctx, cx, 51, 6, 1, PAL.k); });
  }

  function subway(ctx, f, o) {
    rect(ctx, 0, 0, W, H, '#d4d8de');
    rect(ctx, 0, 8, W, 26, '#2a2d44');
    for (let i = 0; i < 4; i++) rect(ctx, ((i * 37 - f * 6) % (W + 40) + W + 40) % (W + 40) - 20, 14 + (i % 2) * 8, 14, 2, '#ffd36b');
    for (let x = 0; x < W; x += 30) rect(ctx, x, 8, 2, 26, '#9aa0aa');
    rect(ctx, 0, 6, W, 2, '#9aa0aa');
    for (let x = 10; x < W; x += 16) { rect(ctx, x + 3, 0, 1, 4, '#5f596b'); rect(ctx, x + 1, 4, 5, 4, '#5f596b'); rect(ctx, x + 2, 5, 3, 2, '#d4d8de'); }
    rect(ctx, 0, 54, W, 8, '#3f8f6a'); rect(ctx, 0, 54, W, 1, PAL.k);
    rect(ctx, 0, 66, W, H - 66, '#8a8696');
    rect(ctx, 58, 0, 2, 66, '#c0c4cc');
    if (o.prop === 'crowd') {
      [[4, 44], [70, 44], [86, 46], [100, 44]].forEach(([cx, cy], i) => person(ctx, 'crowd', cx, cy, f + i * 3, { flip: i % 2 === 0 }));
      person(ctx, 'player', 38, 46, f, { face: o.face || 'sad' });
      person(ctx, 'crowd', 22, 46, f + 7, {});
    } else {
      person(ctx, 'player', 34, 46, f, { face: o.face });
      if (o.who === 'phone') phone(ctx, 52, 38, f);
      else speakerAt(ctx, o.who, 74, 46, f);
    }
  }

  function phone(ctx, x, y, f) {
    const sx = f % 2 ? 1 : 0;
    grid(ctx, PHONE, null, x + sx, y);
    if (f % 4 < 2) { rect(ctx, x - 4, y + 2, 2, 1, PAL.k); rect(ctx, x + 10, y + 4, 2, 1, PAL.k); }
  }

  function restaurant(ctx, f, o) {
    rect(ctx, 0, 0, W, 62, '#f0d9b5');
    rect(ctx, 0, 0, W, 4, '#c8734a');
    rect(ctx, 10, 8, 40, 26, PAL.k); rect(ctx, 11, 9, 38, 24, '#3a3542');
    for (let i = 0; i < 5; i++) { rect(ctx, 14, 12 + i * 4, 16, 1, '#fbfaf5'); rect(ctx, 38, 12 + i * 4, 8, 1, '#ffe27a'); }
    rect(ctx, 70, 8, 6, 8, '#d9432f'); rect(ctx, 80, 8, 6, 8, '#d9432f'); rect(ctx, 90, 8, 6, 8, '#d9432f');
    [70, 80, 90].forEach((lx) => rect(ctx, lx + 2, 4, 2, 4, PAL.k));
    floor(ctx, 62, '#a0705a', '#8f6250', 10);
    person(ctx, 'player', 18, 38, f, { face: o.face });
    speakerAt(ctx, o.who, 82, 38, f, true);
    rect(ctx, 2, 55, 116, 3, PAL.k); rect(ctx, 3, 55, 114, 2, '#e3c08b'); rect(ctx, 3, 58, 114, 10, '#c8955c');
    rect(ctx, 3, 67, 114, 1, PAL.k);
    // 그릇과 김
    [[24, 50], [86, 50]].forEach(([bx, by]) => { rect(ctx, bx, by, 10, 5, PAL.k); rect(ctx, bx + 1, by + 1, 8, 3, '#fbfaf5'); rect(ctx, bx + 2, by + 1, 6, 1, '#c23b2a'); });
    if (f % 4 < 2) { rect(ctx, 28, 46, 1, 2, '#ffffff'); rect(ctx, 90, 45, 1, 2, '#ffffff'); }
    else { rect(ctx, 29, 45, 1, 2, '#ffffff'); rect(ctx, 89, 46, 1, 2, '#ffffff'); }
  }

  function street(ctx, phase, f, o) {
    const sky = SKY[phase] || SKY.am;
    rect(ctx, 0, 0, W, 50, sky[0]); rect(ctx, 0, 30, W, 20, sky[1]);
    const bc = phase === 'evening' ? '#1b1d3a' : '#8e9ab0';
    [[0, 10, 22], [24, 4, 18], [44, 16, 26], [72, 0, 20], [94, 12, 26]].forEach(([bx, by, bw]) => {
      rect(ctx, bx, by, bw, 50 - by, bc);
      for (let wy = by + 4; wy < 46; wy += 6) for (let wx = bx + 3; wx < bx + bw - 2; wx += 5) rect(ctx, wx, wy, 2, 3, phase === 'off' || phase === 'evening' ? '#ffd36b' : '#c9d6e8');
    });
    rect(ctx, 0, 50, W, 14, '#b9b2a6'); for (let x = 0; x < W; x += 10) rect(ctx, x, 50, 1, 14, '#a39c90');
    rect(ctx, 0, 64, W, H - 64, '#55505e'); for (let x = 4; x < W; x += 20) rect(ctx, x, 73, 10, 1, '#fbfaf5');
    rect(ctx, 100, 22, 2, 42, PAL.k); rect(ctx, 96, 20, 10, 3, PAL.k); rect(ctx, 97, 23, 8, 1, '#ffe27a');
    person(ctx, 'player', 30, 44, f, { face: o.face });
    speakerAt(ctx, o.who, 70, 44, f);
    if (o.prop === 'rain') {
      for (let i = 0; i < 26; i++) {
        const rx = (i * 29 + f * 3) % W, ry = (i * 17 + f * 7) % H;
        rect(ctx, rx, ry, 1, 3, '#9fd0ff');
      }
      rect(ctx, 0, 0, W, H, 'rgba(40,50,80,.18)');
    }
  }

  function bedroom(ctx, f, o) {
    rect(ctx, 0, 0, W, 62, '#a9b8d6');
    windowSky(ctx, 80, 8, 28, 20, 'morning', f);
    rect(ctx, 0, 62, W, H - 62, '#8f7a6a');
    rect(ctx, 6, 40, 4, 30, '#94653f'); rect(ctx, 6, 38, 66, 4, '#94653f');
    person(ctx, 'player', 22, 34, f, { face: o.face || 'sleep' });
    rect(ctx, 6, 52, 70, 4, PAL.k); rect(ctx, 7, 52, 68, 14, '#5b7cfa'); rect(ctx, 7, 52, 68, 3, '#7f9bff');
    rect(ctx, 6, 66, 70, 2, PAL.k);
    // 알람 시계
    const sh = f % 2 ? 1 : 0;
    rect(ctx, 86, 56, 22, 12, '#94653f');
    rect(ctx, 92 + sh, 46, 11, 10, PAL.k); rect(ctx, 93 + sh, 47, 9, 8, '#fbfaf5');
    digits(ctx, 93 + sh, 48, '7', '#d9432f');
    if (f % 2) { rect(ctx, 89, 46, 2, 1, PAL.k); rect(ctx, 104, 47, 2, 1, PAL.k); }
  }

  function bar(ctx, f, o) {
    rect(ctx, 0, 0, W, H, '#3b2a35');
    for (let i = 0; i < 5; i++) rect(ctx, 8 + i * 24, 6, 8, 5, (f + i) % 3 ? '#ffb347' : '#ff7b54');
    rect(ctx, 70, 16, 40, 12, PAL.k); rect(ctx, 71, 17, 38, 10, (f % 4 < 2) ? '#ff5fa2' : '#c23b7a');
    person(ctx, 'player', 16, 36, f, { face: o.face });
    person(ctx, 'boss', 86, 36, f, { flip: true });
    person(ctx, 'peer', 52, 37, f + 4, {});
    rect(ctx, 2, 53, 116, 3, PAL.k); rect(ctx, 3, 53, 114, 2, '#7a4b3a'); rect(ctx, 3, 56, 114, 14, '#5e3a2e');
    rect(ctx, 50, 48, 20, 5, '#2b2833'); rect(ctx, 52, 49, 16, 3, '#c23b2a');
    [[30, 44], [36, 44], [78, 44]].forEach(([bx, by]) => { rect(ctx, bx, by, 3, 9, '#3f8f6a'); rect(ctx, bx + 1, by - 2, 1, 2, '#3f8f6a'); });
  }

  function hrroom(ctx, f, o) {
    rect(ctx, 0, 0, W, 62, '#d6dbe4');
    rect(ctx, 46, 8, 28, 18, PAL.k); rect(ctx, 47, 9, 26, 16, '#fbfaf5');
    rect(ctx, 50, 12, 20, 1, PAL.k); rect(ctx, 50, 16, 14, 1, '#9b93a5'); rect(ctx, 50, 19, 16, 1, '#9b93a5');
    floor(ctx, 62, '#9aa1ad', '#8a919d', 14);
    person(ctx, 'player', 18, 40, f, { face: o.face });
    person(ctx, 'hr', 82, 40, f, { flip: true });
    rect(ctx, 6, 56, 108, 3, PAL.k); rect(ctx, 7, 56, 106, 2, '#e4dfd2'); rect(ctx, 7, 59, 106, 9, '#c9c3b5');
    rect(ctx, 50, 51, 18, 5, '#fbfaf5'); rect(ctx, 50, 51, 18, 1, PAL.k); rect(ctx, 58, 53, 6, 1, '#d9432f');
  }

  function toilet(ctx, f, o) {
    rect(ctx, 0, 0, W, H, '#dfeef2');
    for (let x = 0; x < W; x += 8) rect(ctx, x, 0, 1, H, '#c3dbe2');
    for (let y = 0; y < H; y += 8) rect(ctx, 0, y, W, 1, '#c3dbe2');
    rect(ctx, 56, 6, 30, 60, PAL.k); rect(ctx, 57, 7, 28, 58, '#7fb7c9');
    rect(ctx, 80, 34, 3, 3, '#d9432f');
    rect(ctx, 6, 40, 20, 4, '#fbfaf5'); rect(ctx, 6, 44, 20, 1, PAL.k); rect(ctx, 14, 36, 2, 4, '#9b93a5');
    rect(ctx, 0, 68, W, H - 68, '#9fb8c0');
    person(ctx, 'player', 30, 49, f, { face: o.face || 'shock' });
    if (o.who && o.who !== 'none') {
      person(ctx, o.who, 92, 49, f, { flip: true });
      if (o.who === 'newbie' && f % 4 < 2) { rect(ctx, 96, 55, 1, 2, '#7fc8ff'); rect(ctx, 103, 56, 1, 2, '#7fc8ff'); }
    }
  }

  function pantry(ctx, f, o) {
    rect(ctx, 0, 0, W, 62, '#e8e2d2');
    rect(ctx, 0, 62, W, H - 62, '#8d8577');
    // 커피 머신
    rect(ctx, 6, 26, 22, 30, PAL.k); rect(ctx, 7, 27, 20, 28, '#5f596b'); rect(ctx, 10, 30, 14, 6, '#2b2833');
    rect(ctx, 12, 32, 2, 2, f % 2 ? '#d9432f' : '#5f596b');
    rect(ctx, 13, 44, 8, 8, '#2b2833'); rect(ctx, 15, 48, 4, 4, '#fbfaf5');
    // 냉장고
    rect(ctx, 96, 14, 20, 48, PAL.k); rect(ctx, 97, 15, 18, 46, '#fbfaf5'); rect(ctx, 97, 32, 18, 1, PAL.k); rect(ctx, 112, 20, 1, 8, PAL.k);
    rect(ctx, 100, 18, 4, 4, '#ffe27a'); rect(ctx, 106, 22, 4, 4, '#ffb3c1');
    rect(ctx, 30, 54, 62, 3, PAL.k); rect(ctx, 31, 54, 60, 2, '#d8d0bc'); rect(ctx, 31, 57, 60, 11, '#b8ae98');
    person(ctx, 'player', 40, 36, f, { face: o.face });
    speakerAt(ctx, o.who, 70, 36, f, true);
    rect(ctx, 50, 50, 4, 4, '#fbfaf5'); rect(ctx, 54, 51, 1, 2, '#fbfaf5');
  }

  // 장면마다 말 거는 사람 자리
  function speakerAt(ctx, who, x, y, f) {
    if (!who || who === 'none') return;
    if (who === 'phone') { phone(ctx, x + 6, y - 6, f); return; }
    if (who === 'team') {
      person(ctx, 'peer', x - 4, y + 1, f + 5, { flip: true });
      person(ctx, 'newbie', x + 14, y + 2, f + 11, { flip: true });
      return;
    }
    person(ctx, who, x, y, f, { flip: true });
  }

  function draw(ctx, o) {
    const f = o.frame || 0;
    ctx.clearRect(0, 0, W, H);
    switch (o.scene) {
      case 'home': home(ctx, f, o); break;
      case 'beach': beach(ctx, f); break;
      case 'shop': shop(ctx, f); break;
      case 'farm': farm(ctx, f); break;
      case 'elevator': elevator(ctx, f, o); break;
      case 'meeting': meeting(ctx, o.phase || 'am', f, o); break;
      case 'subway': subway(ctx, f, o); break;
      case 'restaurant': restaurant(ctx, f, o); break;
      case 'street': street(ctx, o.phase || 'am', f, o); break;
      case 'bedroom': bedroom(ctx, f, o); break;
      case 'bar': bar(ctx, f, o); break;
      case 'hrroom': hrroom(ctx, f, o); break;
      case 'toilet': toilet(ctx, f, o); break;
      case 'pantry': pantry(ctx, f, o); break;
      default: office(ctx, o.phase || 'am', f, o); speaker(ctx, o.who, f);
    }
  }

  // 아이콘 만들기용: 캐릭터 하나를 원하는 칸에 그린다
  function drawPerson(ctx, who, x, y, opt) { grid(ctx, (SKINS[who] || SKINS.player).grid, (SKINS[who] || SKINS.player).pal, x, y, opt); }

  T.Sprites = { W, H, draw, drawPerson, PLAYER, BOSS, PAL };
})();
