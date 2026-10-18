// 게임 진행. 상태(S)는 한 판의 기록, M은 회차를 넘어 남는 기록(엔딩 도감·연속 출근·소리 설정).
(function () {
  const C = T.CONFIG;
  const EV = Object.fromEntries(T.EVENTS.map((e) => [e.id, e]));
  const JOB = Object.fromEntries(T.SIDEJOBS.map((j) => [j.id, j]));
  const ORDER = ['eval', 'hp', 'mental', 'cash', 'salary', 'living', 'side'];
  const LABEL = { eval: '평가', hp: '체력', mental: '멘탈', cash: '현금', salary: '월급', living: '생활비', side: '부업 진도', sideIncome: '부업 수입' };
  const RECHARGE = C.workPass.rechargeHours * 3600000;
  // 주소 끝에 #test 를 붙이면 출근 도장 제한 없이 테스트할 수 있다
  const TEST = location.hash === '#test';

  const $ = (s) => document.querySelector(s);
  const sfx = (n) => T.Sound && T.Sound.play(n);
  let S = null;
  let M = null;
  let frame = 0;
  let lastTick = Date.now();

  // ───────── 저장 ─────────
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 저장 못 해도 게임은 계속 */ } }
  function restore(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function save() { if (!S) return; S.lastSeen = Date.now(); store(C.saveKey, S); }
  function saveMeta() { store(C.metaKey, M); }

  function newGame() {
    M.runs = (M.runs || 0) + 1;
    S = {
      v: 1, month: 1, day: 0, phase: 4,
      hp: C.start.hp, mental: C.start.mental, cash: C.start.cash, eval: C.start.eval,
      rank: 0, salaryBonus: 0, livingDelta: 0,
      side: Object.fromEntries(T.SIDEJOBS.map((j) => [j.id, { lvl: 0, prog: 0 }])),
      focus: 'blog',
      // 첫 판은 튜토리얼 없이 퇴근 5분 전 부장님으로 바로 시작한다 (첫날 출근 도장 1개 사용)
      view: { type: 'event', id: 'o_boss' },
      bags: {}, seen: { o_boss: 0 },
      passes: C.workPass.start - 1, passAt: Date.now(),
      monthSide: 0, totalSide: 0,
      started: Date.now(), lastSeen: Date.now(),
    };
    saveMeta();
    save();
  }

  // 1차 버전 저장을 이어서 쓸 수 있게 새로 생긴 칸을 채운다
  function migrate(s) {
    if (s.passes == null) { s.passes = C.workPass.max; s.passAt = Date.now(); }
    if (!s.bags) s.bags = {};
    if (!s.seen) s.seen = {};
    return s;
  }

  // ───────── 계산 ─────────
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const salary = () => C.ranks[S.rank].salary + S.salaryBonus;
  const living = () => Math.max(500000, C.living + S.livingDelta);
  const need = (lvl) => (lvl + 1) * C.sideNeed;
  const condition = () => (S.hp + S.mental) / 2;
  function hourly(id, lvl) {
    const j = JOB[id];
    const l = lvl == null ? S.side[id].lvl : lvl;
    return l <= 0 ? 0 : Math.round((j.rate * Math.pow(l, j.exp)) / 100) * 100;
  }
  const hourlyTotal = () => T.SIDEJOBS.reduce((a, j) => a + hourly(j.id), 0);
  const maxLvl = () => Math.max(...T.SIDEJOBS.map((j) => S.side[j.id].lvl));
  const goalPct = () => clamp(Math.max(S.cash / C.freedomGoal, maxLvl() / C.maxSideLevel), 0, 1);

  // 좋은 결과인지 나쁜 결과인지 대충 점수로 본다 (표정·효과음·운 보정에 쓴다)
  function score(fx) {
    if (!fx) return 0;
    return (fx.hp || 0) + (fx.mental || 0) + (fx.eval || 0) + (fx.cash || 0) / 10000 +
      (fx.salary || 0) / 5000 - (fx.living || 0) / 5000 + (fx.side || 0) * 6;
  }
  const isGood = (k, v) => (k === 'living' ? v < 0 : v > 0);

  // ───────── 출근 도장 ─────────
  function recharge() {
    const now = Date.now();
    if (S.passAt > now) S.passAt = now; // 시계를 되돌린 경우
    if (S.passes >= C.workPass.max) { S.passAt = now; return; }
    const n = Math.floor((now - S.passAt) / RECHARGE);
    if (n > 0) {
      S.passes = Math.min(C.workPass.max, S.passes + n);
      S.passAt += n * RECHARGE;
      if (S.passes >= C.workPass.max) S.passAt = now;
    }
  }
  function nextPassMs() { return Math.max(0, RECHARGE - (Date.now() - S.passAt)); }

  function startDay() {
    if (!TEST) {
      recharge();
      if (S.passes <= 0) { S.view = { type: 'gate' }; sfx('gate'); return; }
      if (S.passes >= C.workPass.max) S.passAt = Date.now();
      S.passes--;
    }
    S.view = { type: 'event', id: pickEvent() };
  }

  // ───────── 부업 ─────────
  function addSide(id, n) {
    const j = S.side[id], def = JOB[id];
    const ups = [];
    let blocked = false;
    j.prog += n;
    while (j.lvl < C.maxSideLevel && j.prog >= need(j.lvl)) {
      if (def.levelCost && S.cash < def.levelCost) { j.prog = need(j.lvl); blocked = true; break; }
      S.cash -= def.levelCost;
      j.prog -= need(j.lvl);
      j.lvl++;
      ups.push({ id, lvl: j.lvl, line: def.lines[j.lvl], cost: def.levelCost });
    }
    if (j.lvl >= C.maxSideLevel) j.prog = 0;
    return { ups, blocked };
  }

  function apply(fx) {
    const out = { list: [], ups: [], blocked: false };
    if (!fx) return out;
    for (const k of ORDER) {
      const v = fx[k];
      if (!v) continue;
      if (k === 'hp' || k === 'mental' || k === 'eval') {
        const before = S[k];
        S[k] = clamp(S[k] + v, 0, 100);
        out.list.push({ k, v: S[k] - before });
      } else if (k === 'cash') {
        S.cash += v; out.list.push({ k, v });
      } else if (k === 'salary') {
        S.salaryBonus += v; out.list.push({ k, v });
      } else if (k === 'living') {
        S.livingDelta += v; out.list.push({ k, v });
      } else if (k === 'side') {
        const r = addSide(S.focus, v);
        out.list.push({ k, v, job: S.focus });
        out.ups.push(...r.ups);
        out.blocked = out.blocked || r.blocked;
      }
    }
    return out;
  }

  // ───────── 운: 골프처럼 마음대로 안 되게 ─────────
  // 컨디션이 나쁠수록 나쁜 결과의 확률이 커진다
  function weighRolls(rolls) {
    const f = clamp(1 + C.luck.condition * (55 - condition()) / 55, 0.5, 1.9);
    const w = rolls.map((r) => r.p * (score(r.fx) < 0 ? f : 1));
    const sum = w.reduce((a, b) => a + b, 0);
    let x = Math.random() * sum;
    for (let i = 0; i < rolls.length; i++) { if ((x -= w[i]) <= 0) return rolls[i]; }
    return rolls[rolls.length - 1];
  }

  // 정해진 결과도 조금씩 흔들리고, 가끔은 크게 삐끗한다
  function shake(fx) {
    const out = Object.assign({}, fx);
    let twist = false;
    for (const k of ['hp', 'mental', 'eval', 'cash']) {
      if (!out[k]) continue;
      const v = out[k] * (1 + (Math.random() * 2 - 1) * C.luck.spread);
      const r = k === 'cash' ? Math.round(v / 500) * 500 : Math.round(v);
      out[k] = r === 0 ? Math.sign(out[k]) * (k === 'cash' ? 500 : 1) : r;
    }
    if (Math.random() < C.luck.twist) {
      twist = true;
      for (const k of ['hp', 'mental', 'eval', 'cash']) {
        if (!out[k]) continue;
        out[k] = isGood(k, out[k]) ? Math.round(out[k] / 2) : out[k] * 2;
        if (k === 'cash') out[k] = Math.round(out[k] / 500) * 500;
      }
    }
    return { fx: out, twist };
  }

  function faceFor(fx, twist) {
    if (twist) return 'shock';
    const s = score(fx);
    return s >= 4 ? 'happy' : s <= -4 ? 'sad' : '';
  }

  function pickEvent() {
    const ph = T.PHASES[S.phase].id;
    const ok = (id) => EV[id] && EV[id].phase === ph && (EV[id].minMonth || 0) <= S.month;
    // 시간대마다 이벤트 주머니를 섞어 두고 하나씩 꺼낸다. 다 꺼내기 전에는 같은 이벤트가 다시 안 나온다.
    let bag = (S.bags[ph] || []).filter(ok);
    if (!bag.length) {
      bag = T.EVENTS.filter((e) => ok(e.id)).map((e) => e.id);
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      // 방금 본 이벤트가 새 주머니 맨 앞에 오지 않게
      if (bag.length > 1 && bag[bag.length - 1] === S.lastEvent) bag.unshift(bag.pop());
      // 확률이 낮은 이벤트(weight < 1)는 가끔 빠진다
      bag = bag.filter((id) => Math.random() < (EV[id].weight || 1));
      if (!bag.length) bag = T.EVENTS.filter((e) => ok(e.id)).map((e) => e.id);
    }
    const id = bag.pop();
    S.bags[ph] = bag;
    S.lastEvent = id;
    return id;
  }

  // ───────── 진행 ─────────
  function choose(i) {
    const ev = EV[S.view.id];
    const opt = ev && ev.options[i];
    if (!opt) return;
    let fx = opt.fx, text = opt.result;
    if (opt.rolls) {
      const r = weighRolls(typeof opt.rolls === 'function' ? opt.rolls(S) : opt.rolls);
      fx = r.fx; text = r.result;
    }
    const sh = shake(fx);
    if (sh.twist) text += '\n' + rnd(C.luck.twistLines);
    const d = apply(sh.fx);
    S.seen[ev.id] = (S.seen[ev.id] || 0) + 1;
    S.view = {
      type: 'result', text, picked: opt.label, deltas: d.list, ups: d.ups, blocked: d.blocked,
      twist: sh.twist, after: 'phase',
      scene: Object.assign(sceneOfEvent(ev), { face: faceFor(sh.fx, sh.twist) }),
    };
    sfx(sh.twist ? 'twist' : score(sh.fx) >= 0 ? 'good' : 'bad');
    if (d.ups.length) setTimeout(() => sfx('level'), 350);
    save(); render();
  }

  function next() {
    if (S.mental <= 0) return ending('rehire', 'burnout');
    const after = S.view.after;
    if (S.hp <= 0 && after !== 'collapse') return collapse();
    if (after === 'phase') {
      S.phase++;
      if (T.PHASES[S.phase].id === 'evening') S.view = { type: 'evening' };
      else S.view = { type: 'event', id: pickEvent() };
    } else if (after === 'night' || after === 'collapse') {
      endDay();
    } else if (after === 'fired') {
      return ending('rehire', 'fired');
    } else if (after === 'payday') {
      S.month++; S.day = 0; S.phase = 0;
      startDay();
    }
    save(); render();
  }

  function collapse() {
    S.hp = C.collapse.hp;
    const d = apply({ mental: C.collapse.mental, cash: C.collapse.cash, eval: C.collapse.eval });
    S.phase = T.PHASES.length - 1;
    S.view = { type: 'result', text: '모니터 앞에서 정신을 잃었다. 눈을 떠 보니 응급실이었다. 링거 한 대에 15만 원.', picked: '체력 0', deltas: d.list, ups: [], after: 'collapse', scene: { scene: 'office', phase: 'evening', mode: 'collapse' } };
    sfx('collapse');
    save(); render();
  }

  function dayIncome() {
    const v = Math.round(hourlyTotal() * C.dayIncomeHours);
    S.cash += v; S.monthSide += v; S.totalSide += v;
    return v;
  }

  function evening(kind) {
    if (kind === 'side') { S.view = { type: 'pickjob' }; save(); render(); return; }
    const sh = shake(C.evening[kind].fx);
    const d = apply(sh.fx);
    const inc = dayIncome();
    if (inc) d.list.push({ k: 'sideIncome', v: inc });
    let text = kind === 'rest'
      ? '넷플릭스를 켜 놓고 3분 만에 잠들었다. 무엇을 보려고 했는지는 기억나지 않는다.'
      : '친구랑 치킨에 맥주. 회사 욕을 실컷 했다. 내일 일은 내일의 내가 하겠지.';
    if (sh.twist) text += '\n' + rnd(C.luck.twistLines);
    S.view = { type: 'result', text, picked: kind === 'rest' ? '집에서 뻗는다' : '친구랑 치맥', deltas: d.list, ups: [], twist: sh.twist, after: 'night', scene: { scene: 'home', mode: kind } };
    sfx(sh.twist ? 'twist' : 'good');
    save(); render();
  }

  function work(id) {
    S.focus = id;
    const j = S.side[id];
    const failed = j.lvl < C.maxSideLevel && Math.random() < C.sideFail;
    const sh = shake(C.evening.side.fx);
    const d = apply(Object.assign({}, sh.fx, failed ? {} : { side: 1 }));
    const inc = dayIncome();
    if (inc) d.list.push({ k: 'sideIncome', v: inc });
    let text = `${JOB[id].name} 작업을 했다. `;
    if (failed) text += rnd(JOB[id].fails) + ' 진도는 그대로.';
    else if (d.blocked) text += `레벨을 올리려면 재고비 ${man(JOB[id].levelCost)}이 필요하다. 통장이 허락하지 않는다.`;
    else if (!d.ups.length) text += j.lvl >= C.maxSideLevel ? '이미 최고 레벨이다. 이제 사직서를 볼 때다.' : `다음 레벨까지 ${need(j.lvl) - j.prog}번 더.`;
    if (sh.twist) text += '\n' + rnd(C.luck.twistLines);
    S.view = { type: 'result', text, picked: `${JOB[id].name} 하기`, deltas: d.list, ups: d.ups, blocked: d.blocked, twist: sh.twist, after: 'night', scene: { scene: 'home', mode: 'side', face: failed ? 'sad' : d.ups.length ? 'happy' : '' } };
    sfx(failed ? 'bad' : d.ups.length ? 'level' : 'tap');
    save(); render();
  }

  function endDay() {
    S.hp = clamp(S.hp + C.nightRecover.hp, 0, 100);
    S.mental = clamp(S.mental + C.nightRecover.mental, 0, 100);
    S.day++;
    S.phase = 0;
    if (S.day >= C.daysPerMonth) payday();
    else startDay();
  }

  function payday() {
    const sal = salary();
    const sp = rnd(C.surprises);
    if (sp.living) S.livingDelta += sp.living;
    const liv = living();
    S.cash += sal - liv + (sp.cash || 0);
    const slip = { month: S.month, salary: sal, living: liv, surprise: sp, side: Math.round(S.monthSide), promoted: null, decay: 0, warn: 0 };
    // 평가가 바닥이면 인사팀 경고. 연달아 쌓이면 권고사직이다.
    if (S.eval < C.warnBelow) { S.warns = (S.warns || 0) + 1; slip.warn = S.warns; } else S.warns = 0;
    if (S.eval >= C.promoteAt && S.rank < C.ranks.length - 1) {
      S.rank++; S.eval = C.promoteReset; slip.promoted = C.ranks[S.rank].name;
    } else {
      const before = S.eval;
      S.eval = Math.max(0, S.eval - C.evalDecay);
      slip.decay = before - S.eval;
    }
    S.monthSide = 0;
    S.view = { type: 'payday', slip, after: slip.warn >= C.warnLimit ? 'fired' : 'payday' };
    sfx('coin');
    if (slip.promoted) setTimeout(() => sfx('level'), 400);
  }

  function ending(id, reason) {
    M.endings = M.endings || {};
    M.endings[id] = (M.endings[id] || 0) + 1;
    saveMeta();
    closeSheet();
    S.view = { type: 'ending', id, reason: reason || '' };
    sfx('stamp'); setTimeout(() => sfx('ending'), 250);
    save(); render();
  }

  // ───────── 꺼 둔 사이 부업 수입 ─────────
  function offline() {
    if (!S || S.view.type === 'ending') return;
    const now = Date.now();
    const gone = now - (S.lastSeen || now);
    lastTick = now;
    if (S.view.type === 'gate') { recharge(); render(); }
    if (gone <= 0) return;
    const capMs = C.offlineCapHours * 3600000;
    const used = Math.min(gone, capMs);
    const inc = hourlyTotal() * used / 3600000;
    if (inc < 100 || gone < 60000) return;
    S.cash += inc; S.monthSide += inc; S.totalSide += inc;
    save(); hud();
    const h = Math.floor(used / 3600000), m = Math.floor((used % 3600000) / 60000);
    sheet(`
      <h3>자리 비운 사이</h3>
      <p>회사에 있는 동안에도, 자는 동안에도 부업은 일했다.</p>
      <p class="big money">+${won(inc)}</p>
      <p class="muted">${h ? h + '시간 ' : ''}${m}분치 수입${gone > capMs ? ` · 부업 수입은 최대 ${C.offlineCapHours}시간까지만 쌓여` : ''}</p>
      <button class="btn primary" data-act="close">통장 확인 완료</button>`);
    sfx('coin');
  }

  function tick() {
    const now = Date.now();
    const dt = now - lastTick;
    lastTick = now;
    if (!S || dt <= 0 || dt > 5000 || ['ending', 'title'].includes(S.view.type)) return;
    if (S.view.type === 'gate') {
      const before = S.passes;
      recharge();
      if (S.passes !== before) { save(); render(); sfx('good'); }
      else { const t = $('#gate-left'); if (t) t.textContent = hms(nextPassMs()); }
    }
    const inc = hourlyTotal() * dt / 3600000;
    if (!inc) return;
    S.cash += inc; S.monthSide += inc; S.totalSide += inc;
    $('#h-cash').textContent = won(S.cash);
  }

  // ───────── 형식 ─────────
  function won(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }
  function man(n) {
    const sign = n < 0 ? '-' : '';
    const a = Math.abs(n);
    if (a >= 1e8) return sign + (Math.round(a / 1e6) / 100).toString() + '억 원';
    if (a >= 1e4) { const m = a / 1e4; return sign + (m >= 100 ? Math.round(m).toLocaleString('ko-KR') : String(Math.round(m * 10) / 10)) + '만 원'; }
    return sign + Math.round(a).toLocaleString('ko-KR') + '원';
  }
  function hms(ms) {
    const s = Math.ceil(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const para = (s) => esc(s).replace(/\n/g, '<br>');

  function hint(opt) {
    if (opt.hint) return opt.hint;
    if (opt.fx) return ORDER.filter((k) => opt.fx[k]).map((k) => LABEL[k].replace(' 진도', '') + (opt.fx[k] > 0 ? '▲' : '▼')).join(' ');
    const rolls = typeof opt.rolls === 'function' ? opt.rolls(S) : opt.rolls;
    const signs = {};
    rolls.forEach((r) => ORDER.forEach((k) => { if (r.fx[k]) (signs[k] = signs[k] || new Set()).add(Math.sign(r.fx[k])); }));
    const parts = ORDER.filter((k) => signs[k]).map((k) => LABEL[k] + (signs[k].size > 1 ? '?' : (signs[k].has(1) ? '▲?' : '▼?')));
    const luck = condition() < C.luck.lowCondition ? '운에 맡김(컨디션 나쁨)' : '운에 맡김';
    return luck + ' · ' + parts.join(' ');
  }

  function chip(d) {
    let txt, good = d.v > 0;
    if (d.k === 'cash' || d.k === 'sideIncome') txt = (d.v > 0 ? '+' : '') + man(d.v);
    else if (d.k === 'salary') txt = (d.v > 0 ? '+' : '') + man(d.v) + ' (매달)';
    else if (d.k === 'living') { txt = (d.v > 0 ? '+' : '') + man(d.v) + ' (매달)'; good = d.v < 0; }
    else if (d.k === 'side') txt = `+${d.v} (${JOB[d.job].name})`;
    else txt = (d.v > 0 ? '+' : '') + d.v;
    if (d.v === 0) return `<span class="d zero">${LABEL[d.k]} 그대로</span>`;
    return `<span class="d ${good ? 'up' : 'down'}">${LABEL[d.k]} ${txt}</span>`;
  }

  // ───────── 화면 ─────────
  function sceneOfEvent(ev) {
    const phase = T.PHASES[S.phase] ? T.PHASES[S.phase].id : 'am';
    return { scene: ev.scene || 'office', prop: ev.prop, phase, who: ev.who };
  }

  function sceneFor(v) {
    if (v.scene) return v.scene;
    const phase = T.PHASES[S.phase] ? T.PHASES[S.phase].id : 'am';
    switch (v.type) {
      case 'title': return { scene: 'office', phase: 'off', who: 'boss' };
      case 'event': return sceneOfEvent(EV[v.id]);
      case 'evening': return { scene: 'home' };
      case 'pickjob': return { scene: 'home', mode: 'side' };
      case 'gate': return { scene: 'home', mode: 'rest' };
      case 'payday': return { scene: 'office', phase: 'off', mode: 'pay', face: 'happy' };
      case 'ending': return T.ENDINGS[v.id].scene === 'office' ? { scene: 'elevator', who: 'boss', face: 'shock' } : { scene: T.ENDINGS[v.id].scene };
    }
    return { scene: 'office', phase };
  }

  function hud() {
    const ph = T.PHASES[S.phase] || T.PHASES[0];
    const v = S.view.type;
    $('#h-date').textContent = `입사 ${S.month}개월차 · ${T.DAYS[Math.min(S.day, 4)]}`;
    $('#h-rank').textContent = C.ranks[S.rank].name;
    $('#h-time').textContent = v === 'payday' ? '18:00' : v === 'ending' ? '--:--' : v === 'gate' ? '23:00' : ph.time;
    $('#h-phase').textContent = v === 'payday' ? '월급날' : v === 'ending' ? '퇴사 완료' : v === 'title' ? '입사 첫날' : v === 'gate' ? '오늘 근무 끝' : ph.label;
    $('#h-streak').textContent = M.streak && M.streak.n > 1 ? `연속 출근 ${M.streak.n}일` : '';
    if (TEST) $('#h-pass').textContent = '테스트 모드';
    else {
      recharge();
      const shown = Math.max(S.passes, 0);
      const slots = Math.max(C.workPass.max, shown);
      $('#h-pass').innerHTML = `출근 <span class="dots">${'●'.repeat(shown)}${'○'.repeat(slots - shown)}</span>`;
    }
    bar('#b-hp', S.hp);
    bar('#b-mind', S.mental);
    $('#h-cash').textContent = won(S.cash);
    $('#h-cash').classList.toggle('neg', S.cash < 0);
    $('#h-eval').textContent = `${S.eval}`;
    $('#h-goal').textContent = `${Math.floor(goalPct() * 100)}%`;
    const h = hourlyTotal();
    const focus = JOB[S.focus];
    $('#sidebank').innerHTML = h
      ? `<b>부업 시급 ${won(h)}</b><span>${focus.name} Lv.${S.side[S.focus].lvl} · 앱을 꺼도 쌓여</span>`
      : `<b>부업 시급 0원</b><span>퇴근 후에 부업을 시작해 봐</span>`;
    $('#btn-resign').disabled = ['ending', 'title'].includes(v);
    $('#btn-sound').textContent = M.sound === false ? '소리 끔' : '소리 켬';
    $('#btn-sound').setAttribute('aria-pressed', M.sound === false ? 'false' : 'true');
  }

  function bar(sel, val) {
    const b = $(sel);
    b.querySelector('i').style.width = val + '%';
    b.querySelector('em').textContent = val;
    b.classList.toggle('low', val <= 25);
  }

  function render() {
    const v = S.view;
    document.body.dataset.view = v.type;
    hud();
    const card = $('#card');
    let html = '';
    if (v.type === 'title') {
      html = `
        <h1 class="logo">퇴사하고 싶다<small>: 오늘도 버텼다</small></h1>
        <p>평범한 직장인. 목표는 하나, 퇴사.</p>
        <p class="muted">회사를 버틸지, 회사를 벗어날지. 매일의 선택이 결말을 바꾼다. 다만 회사는 마음대로 되는 게 하나도 없다.</p>
        <button class="btn primary" data-act="start">입사하기</button>`;
    } else if (v.type === 'event') {
      const ev = EV[v.id];
      if (ev.who === 'phone') sfx('phone');
      html = `
        ${T.WHO[ev.who] ? `<div class="who">${T.WHO[ev.who]}</div>` : ''}
        <p class="text">${para(ev.text)}</p>
        <div class="choices">${ev.options.map((o, i) => `
          <button class="choice" data-act="choose" data-i="${i}">
            <span class="num">${i + 1}</span>
            <span class="lbl">${esc(o.label)}<small>${esc(hint(o))}</small></span>
          </button>`).join('')}
        </div>`;
    } else if (v.type === 'result') {
      html = `
        <div class="picked">${esc(v.picked)}</div>
        ${v.twist ? '<div class="twist">삐끗!</div>' : ''}
        <p class="text">${para(v.text)}</p>
        ${(v.ups || []).map((u) => `<p class="levelup"><b>${JOB[u.id].name} Lv.${u.lvl}</b> ${esc(u.line)}${u.cost ? ` <span class="muted">(재고비 -${man(u.cost)})</span>` : ''}</p>`).join('')}
        <div class="deltas">${v.deltas.map(chip).join('')}</div>
        <button class="btn primary" data-act="next">${v.after === 'night' || v.after === 'collapse' ? '잠자리에 든다 ›' : '다음 ›'}</button>`;
    } else if (v.type === 'evening') {
      const day = T.DAYS[Math.min(S.day, 4)];
      html = `
        <div class="who">퇴근 후 19:00</div>
        <p class="text">${day === '금요일' ? '금요일 저녁. 내일은 월급날이다.' : '오늘도 버텼다.'} 남은 저녁, 뭘 할까?</p>
        <div class="choices">
          <button class="choice" data-act="evening" data-k="rest"><span class="num">1</span><span class="lbl">집에서 뻗는다<small>체력▲ 멘탈▲</small></span></button>
          <button class="choice" data-act="evening" data-k="side"><span class="num">2</span><span class="lbl">부업을 한다<small>부업▲ 체력▼ 멘탈▼ · 안 풀리는 날도 있다</small></span></button>
          <button class="choice" data-act="evening" data-k="beer"><span class="num">3</span><span class="lbl">친구랑 치맥<small>멘탈▲ 체력▼ 현금▼</small></span></button>
        </div>`;
    } else if (v.type === 'pickjob') {
      html = `
        <div class="who">어떤 부업을 할까?</div>
        <div class="jobs">${T.SIDEJOBS.map((j) => {
          const s = S.side[j.id];
          const max = s.lvl >= C.maxSideLevel;
          const pct = max ? 100 : Math.round(s.prog / need(s.lvl) * 100);
          return `
          <button class="job${S.focus === j.id ? ' on' : ''}" data-act="work" data-id="${j.id}">
            <span class="jt"><b>${j.name}</b><em>Lv.${s.lvl}</em></span>
            <span class="jd">${j.desc}</span>
            <span class="jbar"><i style="width:${pct}%"></i></span>
            <span class="jn">시급 ${won(hourly(j.id))} → 다음 레벨 ${max ? '최고 레벨' : won(hourly(j.id, s.lvl + 1))}${j.levelCost && !max ? ` · 재고비 ${man(j.levelCost)}` : ''}</span>
          </button>`;
        }).join('')}</div>
        <button class="btn ghost" data-act="back">돌아가기</button>`;
    } else if (v.type === 'gate') {
      const full = S.passes > 0;
      html = `
        <div class="who">출근 도장 0개</div>
        <p class="text">오늘은 여기까지. 회사도 나도 좀 쉬어야 한다.</p>
        <p class="muted">출근 도장은 ${C.workPass.rechargeHours}시간마다 1개씩, 최대 ${C.workPass.max}개까지 모여. 그동안에도 부업 수입은 쌓여.</p>
        <div class="gate-clock">${full ? '출근할 수 있어' : `다음 출근까지 <b id="gate-left">${hms(nextPassMs())}</b>`}</div>
        <button class="btn primary" data-act="work-day" ${full ? '' : 'disabled'}>${full ? '출근한다 ›' : '아직 퇴근 중'}</button>`;
    } else if (v.type === 'payday') {
      const s = v.slip;
      const sp = s.surprise || { text: '', cash: 0 };
      const left = s.salary - s.living + (sp.cash || 0);
      html = `
        <div class="slip">
          <div class="slip-h"><b>급여명세서</b><span>입사 ${s.month}개월차</span></div>
          <table>
            <tr><th>실수령액</th><td class="plus">+${won(s.salary)}</td></tr>
            <tr><th>생활비<small>월세·식비·통신비·교통비</small></th><td class="minus">-${won(s.living)}</td></tr>
            <tr><th>이번 달 변수<small>${esc(sp.text)}${sp.living ? ` (생활비 매달 +${man(sp.living)})` : ''}</small></th><td class="${(sp.cash || 0) >= 0 ? 'plus' : 'minus'}">${sp.cash ? ((sp.cash > 0 ? '+' : '-') + won(Math.abs(sp.cash))) : '0원'}</td></tr>
            <tr class="sum"><th>이번 달 남은 돈</th><td class="${left >= 0 ? 'plus' : 'minus'}">${left >= 0 ? '+' : ''}${won(left)}</td></tr>
            <tr><th>부업 수입<small>이미 통장에 들어옴</small></th><td class="plus">+${won(s.side)}</td></tr>
          </table>
          <div class="slip-f">통장 잔고 ${won(S.cash)}</div>
        </div>
        ${s.promoted ? `<p class="levelup"><b>승진!</b> 오늘부터 ${s.promoted}이다. 월급이 올랐다.</p>`
          : `<p class="muted">평가 -${s.decay}. 지난달 성과는 지난달 거다.${S.rank < C.ranks.length - 1 ? ` 승진하려면 월급날 평가 ${C.promoteAt} 이상.` : ''}</p>`}
        ${s.warn ? `<p class="warn"><b>인사팀 경고 ${s.warn}/${C.warnLimit}</b> 평가가 ${C.warnBelow} 아래다. ${s.warn >= C.warnLimit ? '인사팀에서 면담하자는 메일이 왔다.' : `다음 월급날에도 이러면 권고사직이다.`}</p>` : ''}
        <button class="btn primary" data-act="next">${s.warn >= C.warnLimit ? '면담하러 간다 ›' : '다음 달도 버틴다 ›'}</button>`;
    } else if (v.type === 'ending') {
      const e = T.ENDINGS[v.id];
      const got = M.endings || {};
      const best = T.SIDEJOBS.reduce((a, j) => (S.side[j.id].lvl > S.side[a].lvl ? j.id : a), 'blog');
      html = `
        <div class="who stamp-label">사직서 수리됨</div>
        <h2 class="ending-title">${e.title}</h2>
        <p class="line">${esc(v.reason === 'burnout' ? e.burnoutLine : v.reason === 'fired' ? e.firedLine : e.line)}</p>
        ${e.body.map((b) => `<p class="text">${esc(b)}</p>`).join('')}
        <div class="summary">
          <span>입사 ${S.month}개월</span><span>${C.ranks[S.rank].name}</span><span>${won(S.cash)}</span><span>${JOB[best].name} Lv.${S.side[best].lvl}</span>
        </div>
        <div class="dex"><b>엔딩 도감 ${Object.keys(got).length}/${Object.keys(T.ENDINGS).length}</b>
          ${Object.keys(T.ENDINGS).map((k) => `<span class="${got[k] ? 'got' : ''}">${got[k] ? T.ENDINGS[k].title.replace(' 엔딩', '') : '???'}</span>`).join('')}
        </div>
        <div class="row">
          <button class="btn" data-act="share">결과 공유하기</button>
          <button class="btn primary" data-act="restart">다시 입사하기</button>
        </div>`;
    }
    card.innerHTML = html;
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    paint();
  }

  // ───────── 사직서 ─────────
  function resign() {
    if (!S || ['ending', 'title'].includes(S.view.type)) return;
    const freedom = S.cash >= C.freedomGoal;
    const boss = maxLvl() >= C.maxSideLevel;
    const cashPct = clamp(S.cash / C.freedomGoal, 0, 1) * 100;
    const lvPct = maxLvl() / C.maxSideLevel * 100;
    sheet(`
      <h3>사직서</h3>
      <p class="muted">어떤 사직서를 낼까?</p>
      <div class="resign">
        <button class="rs" data-act="end" data-id="freedom" ${freedom ? '' : 'disabled'}>
          <b>경제적 자유</b><span>현금 ${man(Math.max(0, S.cash))} / ${man(C.freedomGoal)}</span><span class="jbar"><i style="width:${cashPct}%"></i></span>
        </button>
        <button class="rs" data-act="end" data-id="boss" ${boss ? '' : 'disabled'}>
          <b>사업가</b><span>부업 최고 Lv.${maxLvl()} / ${C.maxSideLevel}</span><span class="jbar"><i style="width:${lvPct}%"></i></span>
        </button>
        <button class="rs angry" data-act="end" data-id="rehire">
          <b>홧김에 던진다</b><span>${freedom || boss ? '조건은 됐는데… 그래도 홧김에?' : '아직 준비가 안 됐다. 그래도 던질래?'}</span>
        </button>
      </div>
      <button class="btn ghost" data-act="close">서랍에 다시 넣는다</button>`);
  }

  // ───────── 공유 ─────────
  async function share() {
    const e = T.ENDINGS[S.view.id];
    const url = /^https?:/.test(location.href) && !/claude|localhost|127\./.test(location.host) ? location.href.split('#')[0] : C.shareUrl;
    const text = `나는 입사 ${S.month}개월 만에 「${e.title}」으로 퇴사했다.\n#퇴사하고싶다 #오늘도버텼다`;
    try { if (navigator.share) { await navigator.share({ title: '퇴사하고 싶다', text, url }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + '\n' + url); toast('결과를 복사했어. 붙여 넣기만 하면 돼.'); return; } catch (err) { /* 아래로 */ }
    sheet(`<h3>결과 공유하기</h3><p class="muted">아래 글을 길게 눌러 복사해 줘.</p><textarea id="share-text" readonly>${esc(text + '\n' + url)}</textarea><button class="btn primary" data-act="close">닫기</button>`);
  }

  // ───────── 공통 UI ─────────
  function sheet(html) { $('#sheet').innerHTML = html; $('#overlay').hidden = false; }
  function closeSheet() { $('#overlay').hidden = true; }
  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  let ctx = null;
  function paint() {
    if (!ctx) return;
    T.Sprites.draw(ctx, Object.assign({ frame }, sceneFor(S.view)));
  }

  function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a !== 'choose') sfx('tap');
    if (a === 'start') { S.view = { type: 'event', id: 'o_boss' }; save(); render(); }
    else if (a === 'choose') choose(+b.dataset.i);
    else if (a === 'next') next();
    else if (a === 'evening') evening(b.dataset.k);
    else if (a === 'work') work(b.dataset.id);
    else if (a === 'work-day') { startDay(); save(); render(); }
    else if (a === 'back') { S.view = { type: 'evening' }; save(); render(); }
    else if (a === 'resign') resign();
    else if (a === 'end') ending(b.dataset.id);
    else if (a === 'close') closeSheet();
    else if (a === 'share') share();
    else if (a === 'sound') { M.sound = M.sound === false; T.Sound.on = M.sound; saveMeta(); hud(); if (M.sound) sfx('good'); }
    else if (a === 'restart') { newGame(); S.view = { type: 'event', id: 'o_boss' }; render(); }
  }

  function onKey(e) {
    if (!$('#overlay').hidden) { if (e.key === 'Escape') closeSheet(); return; }
    const v = S.view.type;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 3) {
      const btn = document.querySelectorAll('#card .choice, #card .job')[n - 1];
      if (btn) btn.click();
    } else if ((e.key === 'Enter' || e.key === ' ') && ['result', 'payday', 'title', 'gate'].includes(v)) {
      e.preventDefault();
      const btn = $('#card .btn.primary'); if (btn) btn.click();
    }
  }

  function today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
  function streak() {
    const t = today();
    const y = new Date(Date.now() - 864e5);
    const yd = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
    const s = M.streak || { last: '', n: 0 };
    if (s.last !== t) { s.n = s.last === yd ? s.n + 1 : 1; s.last = t; }
    M.streak = s;
    saveMeta();
  }

  function boot() {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) document.documentElement.classList.add('standalone');
    M = restore(C.metaKey) || { endings: {}, runs: 0 };
    if (T.Sound) T.Sound.on = M.sound !== false;
    streak();
    S = restore(C.saveKey);
    const canvas = $('#scene');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', () => T.Sound && T.Sound.unlock(), { once: true });
    if (!S || S.v !== 1) {
      newGame();
      S.view = { type: 'title' };
      render();
    } else {
      migrate(S);
      render();
      offline();
    }
    setInterval(() => { if (document.hidden) return; frame++; paint(); }, 170);
    setInterval(tick, 1000);
    setInterval(save, 10000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else offline(); });
    window.addEventListener('pagehide', save);
  }

  // 테스트용 (콘솔에서 TT.state() 등)
  window.TT = { state: () => S, meta: () => M, events: EV, reset: () => { try { localStorage.removeItem(C.saveKey); } catch (e) { /* 무시 */ } location.reload(); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
