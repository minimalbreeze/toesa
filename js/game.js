// 게임 진행. 상태(S)는 한 판의 기록, M은 회차를 넘어 남는 기록(엔딩 도감·연속 출근).
(function () {
  const C = T.CONFIG;
  const EV = Object.fromEntries(T.EVENTS.map((e) => [e.id, e]));
  const JOB = Object.fromEntries(T.SIDEJOBS.map((j) => [j.id, j]));
  const ORDER = ['eval', 'hp', 'mental', 'cash', 'salary', 'living', 'side'];
  const LABEL = { eval: '평가', hp: '체력', mental: '멘탈', cash: '현금', salary: '월급', living: '생활비', side: '부업 진도', sideIncome: '부업 수입' };

  const $ = (s) => document.querySelector(s);
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
      // 첫 판은 튜토리얼 없이 퇴근 5분 전 부장님으로 바로 시작한다
      view: { type: 'event', id: 'o_boss' },
      recent: ['o_boss'], seen: {},
      monthSide: 0, totalSide: 0,
      started: Date.now(), lastSeen: Date.now(),
    };
    saveMeta();
    save();
  }

  // ───────── 계산 ─────────
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const salary = () => C.ranks[S.rank].salary + S.salaryBonus;
  const living = () => Math.max(500000, C.living + S.livingDelta);
  const need = (lvl) => lvl + 1;
  function hourly(id, lvl) {
    const j = JOB[id];
    const l = lvl == null ? S.side[id].lvl : lvl;
    return l <= 0 ? 0 : Math.round((j.rate * Math.pow(l, j.exp)) / 100) * 100;
  }
  const hourlyTotal = () => T.SIDEJOBS.reduce((a, j) => a + hourly(j.id), 0);
  const maxLvl = () => Math.max(...T.SIDEJOBS.map((j) => S.side[j.id].lvl));
  const goalPct = () => clamp(Math.max(S.cash / C.freedomGoal, maxLvl() / C.maxSideLevel), 0, 1);

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

  function pickRoll(rolls) {
    let x = Math.random();
    for (const r of rolls) { if ((x -= r.p) <= 0) return r; }
    return rolls[rolls.length - 1];
  }

  function pickEvent() {
    const ph = T.PHASES[S.phase].id;
    const all = T.EVENTS.filter((e) => e.phase === ph && (e.minMonth || 0) <= S.month);
    let pool = all.filter((e) => !S.recent.includes(e.id));
    if (!pool.length) pool = all;
    const w = pool.map((e) => (e.weight || 1) / (1 + (S.seen[e.id] || 0) * 0.7));
    let x = Math.random() * w.reduce((a, b) => a + b, 0);
    let pick = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) { if ((x -= w[i]) <= 0) { pick = pool[i]; break; } }
    S.recent.push(pick.id);
    if (S.recent.length > 10) S.recent.shift();
    return pick.id;
  }

  // ───────── 진행 ─────────
  function choose(i) {
    const ev = EV[S.view.id];
    const opt = ev && ev.options[i];
    if (!opt) return;
    let fx = opt.fx, text = opt.result;
    if (opt.rolls) {
      const r = pickRoll(typeof opt.rolls === 'function' ? opt.rolls(S) : opt.rolls);
      fx = r.fx; text = r.result;
    }
    const d = apply(fx);
    S.seen[ev.id] = (S.seen[ev.id] || 0) + 1;
    S.view = { type: 'result', text, picked: opt.label, deltas: d.list, ups: d.ups, blocked: d.blocked, who: ev.who, after: 'phase' };
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
    } else if (after === 'payday') {
      S.month++; S.day = 0; S.phase = 0;
      S.view = { type: 'event', id: pickEvent() };
    }
    save(); render();
  }

  function collapse() {
    S.hp = C.collapse.hp;
    const d = apply({ mental: C.collapse.mental, cash: C.collapse.cash, eval: C.collapse.eval });
    S.phase = T.PHASES.length - 1;
    S.view = { type: 'result', text: '모니터 앞에서 정신을 잃었다. 눈을 떠 보니 응급실이었다. 링거 한 대에 15만 원.', picked: '체력 0', deltas: d.list, ups: [], after: 'collapse', scene: { scene: 'office', phase: 'evening', mode: 'collapse' } };
    save(); render();
  }

  function dayIncome() {
    const v = Math.round(hourlyTotal() * C.dayIncomeHours);
    S.cash += v; S.monthSide += v; S.totalSide += v;
    return v;
  }

  function evening(kind) {
    if (kind === 'side') { S.view = { type: 'pickjob' }; save(); render(); return; }
    const d = apply(C.evening[kind].fx);
    const inc = dayIncome();
    if (inc) d.list.push({ k: 'sideIncome', v: inc });
    const text = kind === 'rest'
      ? '넷플릭스를 켜 놓고 3분 만에 잠들었다. 무엇을 보려고 했는지는 기억나지 않는다.'
      : '친구랑 치킨에 맥주. 회사 욕을 실컷 했다. 내일 일은 내일의 내가 하겠지.';
    S.view = { type: 'result', text, picked: kind === 'rest' ? '집에서 뻗는다' : '친구랑 치맥', deltas: d.list, ups: [], after: 'night', scene: { scene: 'home', mode: kind } };
    save(); render();
  }

  function work(id) {
    S.focus = id;
    const d = apply(Object.assign({}, C.evening.side.fx, { side: 1 }));
    const inc = dayIncome();
    if (inc) d.list.push({ k: 'sideIncome', v: inc });
    const j = S.side[id];
    let text = `${JOB[id].name} 작업을 했다. `;
    if (d.blocked) text += `레벨을 올리려면 재고비 ${man(JOB[id].levelCost)}이 필요하다. 통장이 허락하지 않는다.`;
    else if (!d.ups.length) text += j.lvl >= C.maxSideLevel ? '이미 최고 레벨이다. 이제 사직서를 볼 때다.' : `다음 레벨까지 ${need(j.lvl) - j.prog}번 더.`;
    S.view = { type: 'result', text, picked: `${JOB[id].name} 하기`, deltas: d.list, ups: d.ups, blocked: d.blocked, after: 'night', scene: { scene: 'home', mode: 'side' } };
    save(); render();
  }

  function endDay() {
    S.hp = clamp(S.hp + C.nightRecover.hp, 0, 100);
    S.mental = clamp(S.mental + C.nightRecover.mental, 0, 100);
    S.day++;
    S.phase = 0;
    if (S.day >= C.daysPerMonth) {
      const sal = salary(), liv = living();
      S.cash += sal - liv;
      const slip = { month: S.month, salary: sal, living: liv, side: Math.round(S.monthSide), promoted: null };
      if (S.eval >= C.promoteAt && S.rank < C.ranks.length - 1) {
        S.rank++; S.eval = C.promoteReset; slip.promoted = C.ranks[S.rank].name;
      }
      S.monthSide = 0;
      S.view = { type: 'payday', slip, after: 'payday' };
    } else {
      S.view = { type: 'event', id: pickEvent() };
    }
  }

  function ending(id, reason) {
    M.endings = M.endings || {};
    M.endings[id] = (M.endings[id] || 0) + 1;
    saveMeta();
    closeSheet();
    S.view = { type: 'ending', id, reason: reason || '' };
    save(); render();
  }

  // ───────── 꺼 둔 사이 부업 수입 ─────────
  function offline() {
    if (!S || S.view.type === 'ending') return;
    const now = Date.now();
    const gone = now - (S.lastSeen || now);
    lastTick = now;
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
  }

  function tick() {
    const now = Date.now();
    const dt = now - lastTick;
    lastTick = now;
    if (!S || dt <= 0 || dt > 5000 || ['ending', 'title'].includes(S.view.type)) return;
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
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const para = (s) => esc(s).replace(/\n/g, '<br>');

  function hint(opt) {
    if (opt.hint) return opt.hint;
    if (opt.fx) return ORDER.filter((k) => opt.fx[k]).map((k) => LABEL[k].replace(' 진도', '') + (opt.fx[k] > 0 ? '▲' : '▼')).join(' ');
    const rolls = typeof opt.rolls === 'function' ? opt.rolls(S) : opt.rolls;
    const signs = {};
    rolls.forEach((r) => ORDER.forEach((k) => { if (r.fx[k]) (signs[k] = signs[k] || new Set()).add(Math.sign(r.fx[k])); }));
    const parts = ORDER.filter((k) => signs[k]).map((k) => LABEL[k] + (signs[k].size > 1 ? '?' : (signs[k].has(1) ? '▲?' : '▼?')));
    return '운에 맡김 · ' + parts.join(' ');
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
  function sceneFor(v) {
    if (v.scene) return v.scene;
    const phase = T.PHASES[S.phase] ? T.PHASES[S.phase].id : 'am';
    switch (v.type) {
      case 'title': return { scene: 'office', phase: 'off', who: 'boss' };
      case 'event': return { scene: 'office', phase, who: EV[v.id].who };
      case 'result': return { scene: 'office', phase, who: v.who };
      case 'evening': return { scene: 'home' };
      case 'pickjob': return { scene: 'home', mode: 'side' };
      case 'payday': return { scene: 'office', phase: 'off', mode: 'pay' };
      case 'ending': return T.ENDINGS[v.id].scene === 'office' ? { scene: 'office', phase: 'morning', who: 'boss' } : { scene: T.ENDINGS[v.id].scene };
    }
    return { scene: 'office', phase };
  }

  function hud() {
    const ph = T.PHASES[S.phase] || T.PHASES[0];
    const v = S.view.type;
    $('#h-date').textContent = `입사 ${S.month}개월차 · ${T.DAYS[Math.min(S.day, 4)]}`;
    $('#h-rank').textContent = C.ranks[S.rank].name;
    $('#h-time').textContent = v === 'payday' ? '18:00' : v === 'ending' ? '--:--' : ph.time;
    $('#h-phase').textContent = v === 'payday' ? '월급날' : v === 'ending' ? '퇴사 완료' : v === 'title' ? '입사 첫날' : ph.label;
    $('#h-streak').textContent = M.streak && M.streak.n > 1 ? `연속 출근 ${M.streak.n}일` : '';
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
        <p class="muted">회사를 버틸지, 회사를 벗어날지. 매일의 선택이 결말을 바꾼다.</p>
        <button class="btn primary" data-act="start">입사하기</button>`;
    } else if (v.type === 'event') {
      const ev = EV[v.id];
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
          <button class="choice" data-act="evening" data-k="side"><span class="num">2</span><span class="lbl">부업을 한다<small>부업▲ 체력▼ 멘탈▼</small></span></button>
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
    } else if (v.type === 'payday') {
      const s = v.slip;
      const left = s.salary - s.living;
      html = `
        <div class="slip">
          <div class="slip-h"><b>급여명세서</b><span>입사 ${s.month}개월차</span></div>
          <table>
            <tr><th>실수령액</th><td class="plus">+${won(s.salary)}</td></tr>
            <tr><th>생활비<small>월세·식비·통신비·교통비</small></th><td class="minus">-${won(s.living)}</td></tr>
            <tr class="sum"><th>이번 달 남은 돈</th><td class="${left >= 0 ? 'plus' : 'minus'}">${left >= 0 ? '+' : ''}${won(left)}</td></tr>
            <tr><th>부업 수입<small>이미 통장에 들어옴</small></th><td class="plus">+${won(s.side)}</td></tr>
          </table>
          <div class="slip-f">통장 잔고 ${won(S.cash)}</div>
        </div>
        ${s.promoted ? `<p class="levelup"><b>승진!</b> 오늘부터 ${s.promoted}이다. 월급이 올랐다.</p>` : (S.eval >= C.promoteAt - 15 && S.rank < C.ranks.length - 1 ? `<p class="muted">평가 ${C.promoteAt} 이상이면 다음 월급날 승진</p>` : '')}
        <button class="btn primary" data-act="next">다음 달도 버틴다 ›</button>`;
    } else if (v.type === 'ending') {
      const e = T.ENDINGS[v.id];
      const got = M.endings || {};
      const best = T.SIDEJOBS.reduce((a, j) => (S.side[j.id].lvl > S.side[a].lvl ? j.id : a), 'blog');
      html = `
        <div class="who stamp-label">사직서 수리됨</div>
        <h2 class="ending-title">${e.title}</h2>
        <p class="line">${esc(v.reason === 'burnout' ? e.burnoutLine : e.line)}</p>
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
    if (a === 'start') { S.view = { type: 'event', id: 'o_boss' }; save(); render(); }
    else if (a === 'choose') choose(+b.dataset.i);
    else if (a === 'next') next();
    else if (a === 'evening') evening(b.dataset.k);
    else if (a === 'work') work(b.dataset.id);
    else if (a === 'back') { S.view = { type: 'evening' }; save(); render(); }
    else if (a === 'resign') resign();
    else if (a === 'end') ending(b.dataset.id);
    else if (a === 'close') closeSheet();
    else if (a === 'share') share();
    else if (a === 'restart') { newGame(); S.view = { type: 'event', id: 'o_boss' }; render(); }
  }

  function onKey(e) {
    if (!$('#overlay').hidden) { if (e.key === 'Escape') closeSheet(); return; }
    const v = S.view.type;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 3) {
      const btn = document.querySelectorAll('#card .choice, #card .job')[n - 1];
      if (btn) btn.click();
    } else if ((e.key === 'Enter' || e.key === ' ') && (v === 'result' || v === 'payday' || v === 'title')) {
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
    streak();
    S = restore(C.saveKey);
    const canvas = $('#scene');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    if (!S || S.v !== 1) {
      newGame();
      S.view = { type: 'title' };
      render();
    } else {
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
  window.TT = { state: () => S, meta: () => M, reset: () => { try { localStorage.removeItem(C.saveKey); } catch (e) { /* 무시 */ } location.reload(); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
