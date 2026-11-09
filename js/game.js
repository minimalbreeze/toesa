// 게임 진행. 상태(S)는 한 판의 기록, M은 회차를 넘어 남는 기록(엔딩 도감·연속 출근·소리 설정).
(function () {
  const C = T.CONFIG;
  const EV = Object.fromEntries(T.EVENTS.map((e) => [e.id, e]));
  // 연재 이야기의 장면도 이벤트처럼 꺼내 쓸 수 있게 등록한다 (id: 이야기id#장면번호)
  const STORY = Object.fromEntries(T.STORIES.map((st) => [st.id, st]));
  T.STORIES.forEach((st) => st.steps.forEach((step, i) => {
    const id = `${st.id}#${i}`;
    EV[id] = Object.assign({ who: 'none' }, step, { id, story: st.id, stepIndex: i });
  }));
  const DREAM = Object.fromEntries(T.DREAMS.map((d) => [d.id, d]));
  const JOB = Object.fromEntries(T.SIDEJOBS.map((j) => [j.id, j]));
  const ORDER = ['eval', 'hp', 'mental', 'cash', 'salary', 'living', 'side'];
  const LABEL = { eval: '평가', hp: '체력', mental: '멘탈', cash: '현금', salary: '월급', living: '생활비', side: '부업 진도', sideIncome: '부업 수입' };
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

  // 시작점: 입력한 정보로 월급·주거비·그 밖의 고정지출·출퇴근을 정한다 (입사 서류의 난이도 미리보기도 이걸 쓴다)
  function startPlan(p, raw) {
    const rank = p.rank != null ? p.rank : rankOfYears(p.years);
    const scale = p.salary ? (p.salary * 10000) / C.ranks[rank].salary : 1;
    const rankPay = C.ranks[rank].salary * scale;
    const ratio = rankPay / C.ranks[0].salary;
    const H = T.LIFE.housing.find((h) => h.id === p.housing) || T.LIFE.housing[1];
    const CM = T.LIFE.commutes.find((c) => c.id === p.commute) || T.LIFE.commutes[0];
    // 예전 입력(주거 칸이 없던 때)의 고정지출에는 월세가 이미 들어 있다
    const old = raw && raw.housing === undefined && raw.expense != null;
    const rent = old ? 0 : p.housingCost != null ? p.housingCost * 10000 : Math.round(H.cost * ratio / 10000) * 10000;
    const other = p.expense != null ? p.expense * 10000 : Math.round(C.life.fixed * ratio / 10000) * 10000;
    const car = CM.car ? T.LIFE.cars.find((c) => c.id === CM.car) : null;
    const day = (car ? car.commute : CM.cost) + C.life.lunch;
    const out = other + rent + (car ? car.monthly : 0) + day * C.daysPerMonth + C.life.weekendAvg;
    const pay = Math.round(rankPay / 1000) * 1000;
    const left = pay - out;
    const lv = C.life.difficulty.findIndex((t) => left / pay >= t);
    return { rank, scale, ratio, H, CM, car, rent, other, out, pay, left, diff: T.LIFE.difficulty[lv < 0 ? T.LIFE.difficulty.length - 1 : lv] };
  }

  function newGame() {
    M.runs = (M.runs || 0) + 1;
    const p = profile();
    // 연차로 시작 직급을, 입력한 월급으로 월급 눈금 전체를 맞춘다
    const sp = startPlan(p, M.profile);
    const { rank, scale, ratio } = sp;
    S = {
      v: 1, month: 1, day: 0, phase: 4,
      hp: C.start.hp, mental: C.start.mental, cash: Math.round(C.start.cash * ratio), eval: C.start.eval,
      rank, salaryBonus: 0, livingDelta: 0,
      scale, livingBase: sp.other,
      lifeV: 1, car: sp.car ? sp.car.id : null, tax: newTax(), monthSpend: { commute: 0, weekend: 0 },
      housing: sp.H.id, rent: sp.rent, deposit: sp.H.deposit || 0, commuteMode: sp.CM.id,
      diffLv: T.LIFE.difficulty.indexOf(sp.diff), stats: newStats(), moments: [],
      goal: Math.max(5e7, Math.round(C.freedomGoal * ratio / 1e7) * 1e7),
      ratio, inv: newInv(),
      traits: {}, dayLog: [],
      dayNo: 0, story: null, storiesDone: [], storyRest: 0,
      side: Object.fromEntries(T.SIDEJOBS.map((j) => [j.id, { lvl: 0, prog: 0 }])),
      focus: 'blog',
      // 첫 판은 튜토리얼 없이 퇴근 5분 전 부장님으로 바로 시작한다 (첫날 출근 도장 1개 사용)
      view: { type: 'event', id: 'o_boss' },
      bags: {}, seen: { o_boss: 0 },
      monthSide: 0, totalSide: 0,
      started: Date.now(), lastSeen: Date.now(),
    };
    saveMeta();
    save();
  }

  // 재테크: 주식은 units(좌수)로, 가격은 1,000에서 시작하는 지수로 센다
  function newInv() {
    const ids = T.INVEST.stocks.map((x) => x.id);
    const zero = () => Object.fromEntries(ids.map((id) => [id, 0]));
    return { units: zero(), cost: zero(), price: Object.fromEntries(ids.map((id) => [id, 1000])), move: zero(), news: '', rate: C.invest.estate.rate, estates: [], road: [], bought: false };
  }

  // 세금: 1년(게임 12개월) 동안 쌓인 부업·월세 소득과 미리 뗀 세금
  function newTax() { return { side: 0, rent: 0, withheld: 0 }; }
  // 업적용 기록
  function newStats() { return { collapse: 0, beer: 0, weekend: {}, themeBest: 0, estatesMax: 0 }; }

  // 1차 버전 저장을 이어서 쓸 수 있게 새로 생긴 칸을 채운다
  function migrate(s) {
    if (!s.bags) s.bags = {};
    if (!s.seen) s.seen = {};
    if (s.scale == null) { s.scale = 1; s.livingBase = C.living; s.goal = C.freedomGoal; }
    if (!s.traits) s.traits = {};
    if (!s.dayLog) s.dayLog = [];
    if (s.dayNo == null) { s.dayNo = (s.month - 1) * C.daysPerMonth + s.day; s.story = null; s.storiesDone = []; s.storyRest = 0; }
    if (!s.inv) { s.inv = newInv(); s.ratio = s.ratio || 1; }
    if (!s.stats) { s.stats = newStats(); s.diffLv = 1; }
    if (!s.moments) s.moments = [];
    // 생활비를 고정지출 + 출근·주말 지출로 나눴다. 예전 생활비에서 새로 따로 나가는 몫을 뺀다.
    if (!s.lifeV) {
      s.lifeV = 1; s.car = null; s.tax = newTax(); s.monthSpend = { commute: 0, weekend: 0 };
      s.housing = 'monthly'; s.rent = 0; s.deposit = 0; s.commuteMode = 'transit';
      s.livingBase = Math.max(300000, s.livingBase - (T.LIFE.commutes[0].cost + C.life.lunch) * C.daysPerMonth - C.life.weekendAvg);
    }
    return s;
  }

  // ───────── 계산 ─────────
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const salary = () => Math.round(C.ranks[S.rank].salary * S.scale / 1000) * 1000 + S.salaryBonus;
  // 생활비 = 월급날 고정지출 + 출근한 날 교통비·점심값 + 주말 지출(평균). 목표 계산에는 이 합계를 쓴다.
  const carOf = () => (S.car ? T.LIFE.cars.find((c) => c.id === S.car) : null);
  const housingOf = () => T.LIFE.housing.find((h) => h.id === S.housing) || T.LIFE.housing[1];
  const commuteOf = () => T.LIFE.commutes.find((c) => c.id === S.commuteMode && !c.car) || T.LIFE.commutes[0];
  const otherFixed = () => Math.max(100000, S.livingBase + S.livingDelta);
  const fixedBase = () => otherFixed() + (S.rent || 0);
  const fixedCost = () => fixedBase() + (carOf() ? carOf().monthly : 0);
  const dayCost = () => (carOf() ? carOf().commute : commuteOf().cost) + C.life.lunch;
  const variableMonthly = () => dayCost() * C.daysPerMonth + C.life.weekendAvg;
  const living = () => fixedCost() + variableMonthly();
  const goal = () => S.goal;
  const profile = () => Object.assign({}, C.defaultProfile, M.profile || {});
  const rankOfYears = (y) => C.rankByYears.filter((t) => (y || 1) > t).length;
  const company = () => profile().company || C.defaultProfile.company;
  function deptName() {
    const p = profile();
    if (p.dept === 'etc') return p.deptName || '우리 팀';
    const d = T.DEPTS.find((x) => x.id === p.dept);
    return d ? d.name : '우리 팀';
  }
  const fmt = (t) => String(t).replace(/\{회사\}/g, company()).replace(/\{부서\}/g, deptName()).replace(/\{꿈\}/g, dreamName());
  const need = (lvl) => (lvl + 1) * C.sideNeed;
  const condition = () => (S.hp + S.mental) / 2;
  function hourly(id, lvl) {
    const j = JOB[id];
    const l = lvl == null ? S.side[id].lvl : lvl;
    return l <= 0 ? 0 : Math.round((j.rate * Math.pow(l, j.exp)) / 100) * 100;
  }
  const hourlyTotal = () => T.SIDEJOBS.reduce((a, j) => a + hourly(j.id), 0);
  const maxLvl = () => Math.max(...T.SIDEJOBS.map((j) => S.side[j.id].lvl));
  // ───────── 세금 ─────────
  const TX = C.tax;
  function progTax(x) {
    let t = 0, prev = 0;
    for (const [cap, r] of TX.brackets) { if (x > prev) t += (Math.min(x, cap) - prev) * r; prev = cap; }
    return t;
  }
  // 월급 1년치 위에 부업·월세 소득을 얹었을 때 늘어나는 세금 (지방소득세 포함)
  function incomeTaxDue() {
    const base = salary() * 12, add = S.tax.side + S.tax.rent;
    return Math.round((progTax(base + add) - progTax(base)) * (1 + TX.local));
  }
  // 게임 속 12개월마다 월급날에 정산: 종합소득세(미리 뗀 3.3%는 빼 준다) + 재산세
  function taxYear() {
    if (S.month % TX.yearMonths !== 0) return null;
    const due = incomeTaxDue();
    const income = due - Math.round(S.tax.withheld);
    const prop = Math.round(S.inv.estates.reduce((a, e) => a + e.price * TX.property, 0) / 1000) * 1000;
    const out = { gross: Math.round(S.tax.side + S.tax.rent), due, withheld: Math.round(S.tax.withheld), income, prop };
    S.cash -= income + prop;
    S.tax = newTax();
    return out;
  }

  // ───────── 재테크 ─────────
  const IV = C.invest;
  const STOCK = Object.fromEntries(T.INVEST.stocks.map((x) => [x.id, x]));
  const stockVal = (id) => S.inv.units[id] * S.inv.price[id];
  const stocksTotal = () => T.INVEST.stocks.reduce((a, x) => a + stockVal(x.id), 0);
  const estateEquity = () => S.inv.estates.reduce((a, e) => a + e.price - e.loan, 0);
  // 전세 보증금은 이사 나갈 때나 돌려받는 돈이라 순자산(꿈 자금)에 안 센다
  const netWorth = () => S.cash + stocksTotal() + estateEquity();
  const emergencyNeed = () => Math.round(living() * C.emergencyMonths / 10000) * 10000;
  const estateNet = (e) => Math.round(e.rent - e.loan * S.inv.rate / 100 / 12);
  const rentNet = () => S.inv.estates.reduce((a, e) => a + estateNet(e), 0);
  const sideMonthly = () => hourlyTotal() * C.dayIncomeHours * C.daysPerMonth;
  const divMonthly = () => T.INVEST.stocks.reduce((a, x) => a + stockVal(x.id) * (IV.stocks[x.id].div || 0), 0) * (1 - TX.dividend);
  const capitalIncome = () => Math.round(rentNet() + divMonthly());
  const passive = () => Math.round(sideMonthly() * (1 - TX.withhold) + rentNet() + divMonthly());
  const road = (id) => S.inv.road.includes(id);
  const stocksOpen = () => road('emergency');
  const estateOpen = () => road('seed');
  const lot = (i) => Math.round(IV.lots[i] * (S.ratio || 1) / 100000) * 100000;
  function estateQuote() {
    const E = IV.estate;
    const price = Math.round(E.price * (S.ratio || 1) / 1e6) * 1e6;
    const loan = Math.round(price * E.ltv);
    return { price, loan, need: price - loan + Math.round(price * (TX.acquire + TX.broker)), rent: Math.round(E.rent * (S.ratio || 1) / 10000) * 10000 };
  }
  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function pickW(list) { const sum = list.reduce((a, x) => a + (x.w || 1), 0); let r = Math.random() * sum; for (const x of list) { if ((r -= (x.w || 1)) <= 0) return x; } return list[list.length - 1]; }

  // 장 마감 (매일 밤): 가격이 움직이고, 가끔 사건이 터지고, 내놓은 원룸이 팔린다
  function marketClose() {
    const inv = S.inv;
    const ev = Math.random() < IV.eventChance ? pickW(T.INVEST.marketEvents) : null;
    for (const x of T.INVEST.stocks) {
      const p = IV.stocks[x.id];
      let m = Math.exp(p.mu - p.sigma * p.sigma / 2 + p.sigma * gauss());
      if (ev && ev[x.id]) m *= 1 + ev[x.id];
      const before = inv.price[x.id];
      inv.price[x.id] = Math.max(10, before * m);
      inv.move[x.id] = inv.price[x.id] / before - 1;
    }
    if (ev && ev.rate) inv.rate = clamp(inv.rate + ev.rate, 1.5, 9);
    inv.news = ev ? ev.text : '';
    const sold = [];
    inv.estates = inv.estates.filter((e) => {
      if (e.selling == null || S.dayNo + 1 < e.selling) return true;
      const got = Math.round(e.price * (1 - TX.broker) - e.loan - gainTax(e));
      S.cash += got; sold.push(got);
      return false;
    });
    if (sold.length) inv.news = (inv.news ? inv.news + ' ' : '') + `${T.INVEST.lines.sold} 손에 쥔 돈 ${man(sold.reduce((a, b) => a + b, 0))}.`;
  }

  // 원룸 양도세 (게임용 단순화): 산 값보다 비싸게 팔면 차익에 붙는다. 1년 안에 팔면 더 무겁다.
  function gainTax(e) {
    const gain = e.price * (1 - TX.broker) - (e.buy || e.price);
    if (gain <= 0) return 0;
    return Math.round(gain * (S.month - (e.month || S.month) < TX.yearMonths ? TX.gainShort : TX.gainLong));
  }

  // 월급날: 월세가 들어오고 대출 이자가 나간다. 시세도 한 달치 움직인다.
  function estateMonth() {
    const E = IV.estate, inv = S.inv;
    if (!inv.estates.length) return null;
    let net = 0;
    const notes = [];
    for (const e of inv.estates) {
      const ev = Math.random() < E.eventChance ? pickW(T.INVEST.estateEvents) : null;
      e.price = Math.round(e.price * (1 + E.mu + E.sigma * gauss() + (ev && ev.price || 0)) / 1e5) * 1e5;
      let n = estateNet(e);
      if (ev && ev.vacancy) n -= e.rent;
      if (ev && ev.cash) n += Math.round(ev.cash * (S.ratio || 1) / 1000) * 1000;
      if (ev) notes.push(ev.text);
      net += n;
      if (!(ev && ev.vacancy)) S.tax.rent += Math.max(0, estateNet(e));
    }
    S.cash += net;
    return { net, notes };
  }

  // 통장이 마이너스면 주식부터 팔고, 그래도 모자라면 원룸이 급매로 넘어간다
  function coverDebt() {
    const notes = [];
    if (S.cash >= 0) return notes;
    if (stocksTotal() > 0) {
      for (const x of T.INVEST.stocks) { S.cash += stockVal(x.id) * (1 - IV.fee); S.inv.units[x.id] = 0; S.inv.cost[x.id] = 0; }
      notes.push(T.INVEST.lines.stockCover);
    }
    if (S.cash < 0 && S.inv.estates.length) {
      const e = S.inv.estates.shift();
      S.cash += Math.round(e.price * (1 - IV.estate.firesale) - e.loan);
      notes.push(T.INVEST.lines.firesale);
    }
    return notes;
  }

  function buyStock(id, amt) {
    if (amt > S.cash || amt <= 0) { toast(T.INVEST.lines.noCash); return false; }
    S.cash -= amt;
    S.inv.units[id] += amt * (1 - IV.fee) / S.inv.price[id];
    S.inv.cost[id] += amt;
    S.inv.bought = true;
    return true;
  }
  function sellStock(id, part) {
    const u = S.inv.units[id] * part;
    if (u <= 0) return false;
    const got = u * S.inv.price[id] * (1 - IV.fee);
    const paid = S.inv.cost[id] * part;
    if (id === 'theme' && paid > 0) S.stats.themeBest = Math.max(S.stats.themeBest, got / paid - 1);
    S.cash += got;
    S.inv.cost[id] *= 1 - part;
    S.inv.units[id] -= u;
    return true;
  }
  function buyEstate() {
    const q = estateQuote();
    if (S.inv.estates.length >= IV.estate.max) return false;
    if (S.cash < q.need) { toast(T.INVEST.lines.noCash + ` 계약금과 세금 ${man(q.need)}이 필요해.`); return false; }
    S.cash -= q.need;
    S.inv.estates.push({ price: q.price, loan: q.loan, rent: q.rent, paid: q.need, buy: q.price, month: S.month, selling: null });
    S.stats.estatesMax = Math.max(S.stats.estatesMax, S.inv.estates.length);
    return true;
  }

  // ───────── 퇴사 로드맵 ─────────
  function roadPct(id) {
    switch (id) {
      case 'emergency': return S.cash / emergencyNeed();
      case 'invest': return S.inv.bought ? 1 : 0;
      case 'seed': return netWorth() / estateQuote().need;
      case 'passive': return passive() / (living() * IV.passiveStep);
      case 'half': return goalPct() / 0.5;
      case 'ready': return dreamReady() ? 1 : goalPct();
    }
    return 0;
  }
  const roadNext = () => T.ROADMAP.find((r) => !road(r.id));
  // 다음 단계 하나만 본다. 단계는 차례대로 넘는다.
  function checkRoad() {
    if (!S || !S.inv || ['title', 'setup', 'ending'].includes(S.view.type)) return;
    const r = roadNext();
    if (!r || roadPct(r.id) < 1) return;
    S.inv.road.push(r.id);
    const d = apply(r.reward);
    const i = T.ROADMAP.indexOf(r);
    const nx = T.ROADMAP[i + 1];
    save();
    sheet(`
      <h3>퇴사 로드맵 ${i + 1}/${T.ROADMAP.length}</h3>
      <div class="stamp-big">결재</div>
      <p class="levelup"><b>${esc(r.title)}</b> ${esc(r.desc)}</p>
      ${r.unlock ? `<p class="unlock">${esc(r.unlock)}</p>` : ''}
      ${d.list.length ? `<div class="deltas">${d.list.map(chip).join('')}</div>` : ''}
      ${nx ? `<p class="muted">다음 목표: ${esc(nx.title)}</p>` : '<p class="muted">이제 사직서 서랍을 열어 봐.</p>'}
      <button class="btn primary" data-act="close">도장 쾅</button>`, { queue: true });
    sfx('stamp'); setTimeout(() => sfx('level'), 250);
  }

  // ───────── 퇴사 계획서 (꿈) ─────────
  const dream = () => DREAM[profile().dream] || DREAM.rest;
  function dreamName() {
    const p = profile();
    return dream().id === 'custom' ? (p.dreamName || '내 꿈') : dream().name;
  }
  function dreamNeed() {
    const d = dream(), p = profile();
    const c = d.cash;
    const cash = c === 'living12' ? living() * 12 : c === 'living6' ? living() * 6 : c === 'goal' ? goal()
      : c === 'custom' ? (p.dreamCost || 3000) * 10000 : (c || 0);
    return { cash: Math.round(cash / 10000) * 10000, side: d.side || null, capital: d.capital ? Math.round(fixedCost() * d.capital / 10000) * 10000 : 0 };
  }
  function sideBest(ids) { return Math.max(...ids.map((id) => S.side[id].lvl)); }
  // 사직서 조건: 꿈 자금(순자산) + 현금 비상금 + (꿈에 따라) 부업 레벨·월 부수입
  function dreamParts() {
    const n = dreamNeed();
    const part = (label, have, need, money) => ({ label, have, need, pct: clamp(have / need, 0, 1), money });
    const parts = [];
    if (n.cash) parts.push(part('꿈 자금 (순자산)', netWorth(), n.cash, true));
    parts.push(part(`비상금 (현금 ${C.emergencyMonths}개월치)`, S.cash, emergencyNeed(), true));
    if (n.side) parts.push(part(n.side.ids.map((id) => JOB[id].name).join('·') + ' 레벨', sideBest(n.side.ids), n.side.lvl, false));
    if (n.capital) parts.push(part('월 자본소득 (월세+배당)', capitalIncome(), n.capital, true));
    return parts;
  }
  const dreamDesc = (d) => d.desc + '\n' + T.DREAM_NOTE.pace(d);
  const dreamReady = () => dreamParts().every((x) => x.pct >= 1);
  // 여러 조건이 있으면 평균으로 진행률을 보여 준다
  const goalPct = () => { const ps = dreamParts(); return ps.reduce((a, x) => a + x.pct, 0) / ps.length; };

  // 좋은 결과인지 나쁜 결과인지 대충 점수로 본다 (표정·효과음·운 보정에 쓴다)
  function score(fx) {
    if (!fx) return 0;
    return (fx.hp || 0) + (fx.mental || 0) + (fx.eval || 0) + (fx.cash || 0) / 10000 +
      (fx.salary || 0) / 5000 - (fx.living || 0) / 5000 + (fx.side || 0) * 6;
  }
  const isGood = (k, v) => (k === 'living' ? v < 0 : v > 0);

  // ───────── 출근: 실제 하루에 게임 속 하루 하나 ─────────
  // 기록은 판(S)이 아니라 기기(M)에 남긴다. 다시 입사해도 오늘 근무가 다시 생기지 않는다.
  function workLeft() {
    const w = M.work || {};
    if (w.date && today() < w.date) return 0; // 시계를 되돌린 경우
    return w.date === today() ? Math.max(0, C.workPerDay - (w.used || 0)) : C.workPerDay;
  }
  function useWork() {
    const t = today();
    if (!M.work || M.work.date !== t) M.work = { date: t, used: 0 };
    M.work.used++;
    saveMeta();
  }
  function msToMidnight() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) - d;
  }

  function startDay() {
    if (!TEST) {
      if (workLeft() <= 0) { S.view = { type: 'gate' }; sfx('gate'); return; }
      useWork();
    }
    S.view = { type: 'event', id: pickEvent() };
  }

  // ───────── 연속 출근 보상 ─────────
  // 그날 처음 열었을 때 한 번. 결과는 { n: 연속 일수, broke: 끊겼다가 다시 시작 }
  function attendance() {
    const t = today();
    const y = dayKey(new Date(Date.now() - 864e5));
    const s = M.streak || { last: '', n: 0 };
    if (s.last === t) return null;
    const broke = !!s.last && s.last !== y;
    s.n = s.last === y ? s.n + 1 : 1;
    s.last = t;
    M.streak = s;
    saveMeta();
    return { n: s.n, broke };
  }

  // 보상은 진행 중인 판에만 줄 수 있다. 첫 화면·엔딩이면 다음 입사 때 준다.
  function checkAttendance() {
    const a = attendance() || M.pendingStreak;
    if (!a) return;
    if (['title', 'setup', 'ending'].includes(S.view.type)) { M.pendingStreak = a; saveMeta(); return; }
    M.pendingStreak = null; saveMeta();
    giveStreak(a);
  }

  function rewardOf(n) {
    return C.streakMilestones[n] || C.streakRewards[(n - 1) % C.streakRewards.length];
  }

  function giveStreak(a) {
    const n = a.n;
    const r = rewardOf(n);
    const fx = Object.assign({}, r.fx);
    if (fx.cash) fx.cash = Math.round(fx.cash * S.scale / 1000) * 1000;
    const d = apply(fx);
    save(); hud();
    const len = C.streakRewards.length;
    const first = n - ((n - 1) % len);
    const cells = Array.from({ length: len }, (_, i) => first + i);
    const next = Object.keys(C.streakMilestones).map(Number).find((m) => m > n);
    const short = (fx0) => Object.keys(fx0).map((k) => LABEL[k]).join('·');
    sheet(`
      <h3>출근 도장판</h3>
      <p class="muted">${a.broke ? esc(C.streakBreak) + ' ' : ''}연속 출근 <b>${n}일째</b></p>
      <div class="stamps">${cells.map((day) => `
        <div class="stamp${day < n ? ' done' : day === n ? ' today' : ''}${C.streakMilestones[day] ? ' big' : ''}">
          <span class="sd">${day}일</span><span class="sm">${day <= n ? '출근' : ''}</span><span class="sr">${short(rewardOf(day).fx)}</span>
        </div>`).join('')}
      </div>
      <p class="levelup"><b>오늘의 보상</b> ${esc(r.text)}</p>
      <div class="deltas">${d.list.map(chip).join('')}</div>
      ${next ? `<p class="muted">다음 특별 보상: ${next}일 연속 출근 (${next - n}일 남음)</p>` : ''}
      <button class="btn primary" data-act="close">도장 쾅</button>`);
    sfx('stamp'); setTimeout(() => sfx('coin'), 200);
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

  // 선택 하나를 성향으로 센다 (리포트용)
  // people: 사람과 함께한 선택. 돈이 들어도 "돈으로 해결"이 아니라 "사람"으로 센다
  function traitOf(fx, gamble, people) {
    const t = S.traits;
    const add = (k) => { t[k] = (t[k] || 0) + 1; };
    add('total');
    if (gamble) add('gamble');
    if (people) add('people');
    if (!fx) return;
    if (fx.eval > 0 && (fx.hp < 0 || fx.mental < 0)) add('devote');
    if ((fx.mental > 0 || fx.hp > 0) && !(fx.eval > 0) && !people) add('protect');
    if (fx.side > 0) add('escape');
    if (fx.cash < 0 && !people) add('spend');
  }

  // ───────── 좋은 순간 (사람과 함께한 장면) ─────────
  // 돈과 상관없는 두 번째 점수판. 크게 한 번보다 자주 오는 게 중요하다.
  function addMoment(text) {
    S.moments.push({ d: S.dayNo, t: text });
    return text;
  }
  const momentsRecent = () => S.moments.filter((m) => m.d > S.dayNo - C.happy.recentDays).length;
  function stayParts() {
    const H = C.happy;
    const part = (label, have, need) => ({ label, have, need, pct: clamp(have / need, 0, 1) });
    return [
      part('좋은 순간 (전체)', S.moments.length, H.stayTotal),
      part(`좋은 순간 (최근 ${H.recentDays}일)`, momentsRecent(), H.stayRecent),
      part('멘탈', S.mental, H.stayMental),
    ];
  }
  const stayReady = () => stayParts().every((x) => x.pct >= 1);

  function log(label, list, twist, time) {
    const ph = T.PHASES[S.phase] || T.PHASES[0];
    S.dayLog.push({ time: time || ph.time, label, deltas: list, twist: !!twist });
  }

  function faceFor(fx, twist) {
    if (twist) return 'shock';
    const s = score(fx);
    return s >= 4 ? 'happy' : s <= -4 ? 'sad' : '';
  }

  // ───────── 연재 이야기 ─────────
  function storyStep() {
    if (!S.story) return null;
    return EV[`${S.story.id}#${S.story.step}`];
  }
  // 이야기가 없으면 밤에 다음 이야기를 정해 둔다 (그래야 근무 일지에 "내일 예고"가 뜬다)
  function planStory() {
    if (S.story || S.dayNo < S.storyRest) return;
    const pool = T.STORIES.filter((st) => !S.storiesDone.includes(st.id) && (!st.when || st.when(S)));
    if (!pool.length) return;
    // 지난 시즌에 본 이야기는 뒤로 미룬다 (기록은 기기에 남는다)
    const seen = M.storiesSeen || [];
    const fresh = pool.filter((st) => !seen.includes(st.id));
    S.story = { id: rnd(fresh.length ? fresh : pool).id, step: 0, due: S.dayNo + 1 };
  }
  function advanceStory(opt) {
    const st = STORY[S.story.id];
    const nextIdx = opt.end ? st.steps.length : (opt.next != null ? opt.next : S.story.step + 1);
    if (nextIdx >= st.steps.length) {
      S.storiesDone.push(st.id);
      M.storiesSeen = M.storiesSeen || [];
      if (!M.storiesSeen.includes(st.id)) { M.storiesSeen.push(st.id); saveMeta(); }
      S.story = null;
      S.storyRest = S.dayNo + 1 + C.storyGap;
      return { done: true, title: st.title };
    }
    S.story = { id: st.id, step: nextIdx, due: S.dayNo + (st.steps[nextIdx].delay || 1) };
    return { done: false, title: st.title };
  }
  function teaser() {
    const step = storyStep();
    if (!step) return '';
    const left = S.story.due - S.dayNo;
    if (left <= 1) return step.teaser || `「${STORY[S.story.id].title}」 이야기가 내일 이어진다.`;
    return `「${STORY[S.story.id].title}」 이야기는 ${left}일 뒤에 이어진다.`;
  }

  function pickEvent() {
    const ph = T.PHASES[S.phase].id;
    const step = storyStep();
    if (step && S.story.due <= S.dayNo && step.phase === ph) return step.id;
    const dept = profile().dept;
    const ok = (id) => EV[id] && EV[id].phase === ph && (EV[id].minMonth || 0) <= S.month && (!EV[id].dept || EV[id].dept === dept);
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
    traitOf(fx, !!opt.rolls, !!opt.moment);
    const moment = opt.moment ? addMoment(fmt(opt.moment)) : '';
    log(fmt(opt.label), d.list, sh.twist);
    const arc = ev.story ? advanceStory(opt) : null;
    S.view = {
      type: 'result', text, picked: opt.label, deltas: d.list, ups: d.ups, blocked: d.blocked,
      twist: sh.twist, after: 'phase', arc, moment,
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
      commute();
      marketClose();
      planStory();
      S.view = { type: 'daylog', log: S.dayLog, month: S.month, day: S.day, teaser: teaser(), after: 'endday' };
      S.dayLog = [];
    } else if (after === 'endday') {
      endDay();
    } else if (after === 'weekend') {
      payday();
    } else if (after === 'fired') {
      return ending('rehire', 'fired');
    } else if (after === 'payday') {
      S.month++; S.day = 0; S.phase = 0;
      startDay();
    }
    save(); render();
  }

  function collapse() {
    S.stats.collapse++;
    S.hp = C.collapse.hp;
    const d = apply({ mental: C.collapse.mental, cash: C.collapse.cash, eval: C.collapse.eval });
    S.phase = T.PHASES.length - 1;
    log('쓰러졌다', d.list, false);
    S.view = { type: 'result', text: '모니터 앞에서 정신을 잃었다. 눈을 떠 보니 응급실이었다. 링거 한 대에 15만 원.', picked: '체력 0', deltas: d.list, ups: [], after: 'collapse', scene: { scene: 'office', phase: 'evening', mode: 'collapse' } };
    sfx('collapse');
    save(); render();
  }

  // 부업 수입은 하루를 보내야 들어온다 (3.3%를 먼저 떼고, 1년에 한 번 종합소득세로 정산)
  function dayIncome() {
    const gross = Math.round(hourlyTotal() * C.dayIncomeHours);
    if (!gross) return 0;
    const w = Math.round(gross * TX.withhold);
    S.tax.side += gross; S.tax.withheld += w;
    const v = gross - w;
    S.cash += v; S.monthSide += v; S.totalSide += v;
    return v;
  }

  // 출근한 날마다 나가는 돈: 교통비(차가 있으면 기름값·주차비) + 점심값
  function commute() {
    const c = carOf();
    const cost = dayCost();
    S.cash -= cost; S.monthSpend.commute += cost;
    const list = [{ k: 'cash', v: -cost }];
    const hp = c ? c.hp : commuteOf().hp;
    if (hp) { const b = S.hp; S.hp = clamp(S.hp + hp, 0, 100); list.push({ k: 'hp', v: S.hp - b }); }
    log(c ? `출근(${c.name}) · 점심값` : `출근(${commuteOf().name}) · 점심값`, list, false, '하루');
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
    traitOf(C.evening[kind].fx, false, kind === 'beer');
    if (kind === 'beer') S.stats.beer++;
    const moment = kind === 'beer' ? addMoment(T.LIFE.moments.beer) : '';
    log(kind === 'rest' ? '집에서 뻗었다' : '친구랑 치맥', d.list, sh.twist);
    S.view = { type: 'result', text, picked: kind === 'rest' ? '집에서 뻗는다' : '친구랑 치맥', deltas: d.list, ups: [], twist: sh.twist, after: 'night', moment, scene: { scene: 'home', mode: kind } };
    sfx(sh.twist ? 'twist' : 'good');
    save(); render();
  }

  function weekend(id) {
    const w = T.LIFE.weekend.find((x) => x.id === id);
    if (!w) return;
    const sh = shake(w.fx);
    const d = apply(sh.fx);
    S.monthSpend.weekend += -(sh.fx.cash || 0);
    S.stats.weekend[id] = (S.stats.weekend[id] || 0) + 1;
    const wm = w.moment || (id === 'home' && S.housing === 'parents' ? T.LIFE.moments.parentsWeekend : '');
    traitOf(w.fx, false, !!wm);
    const moment = wm ? addMoment(wm) : '';
    let text = w.text;
    if (sh.twist) text += '\n' + rnd(C.luck.twistLines);
    const scene = { home: { scene: 'home', mode: 'rest' }, friends: { scene: 'restaurant' }, side: { scene: 'home', mode: 'side' }, drive: { scene: 'street', phase: 'am' } }[id];
    S.view = { type: 'result', text, picked: w.label, deltas: d.list, ups: d.ups, blocked: d.blocked, twist: sh.twist, after: 'weekend', moment, scene: Object.assign({ face: faceFor(sh.fx, sh.twist) }, scene) };
    sfx(sh.twist ? 'twist' : 'good');
    if (d.ups.length) setTimeout(() => sfx('level'), 350);
    save(); render();
  }

  function carSheet() {
    const L = T.LIFE.lines;
    sheet(`
      <h3>${esc(L.carAsk)}</h3>
      <p class="muted">${esc(L.carDesc)}</p>
      ${T.LIFE.cars.map((c) => `
        <div class="asset">
          <div class="asset-h"><b>${esc(c.name)}</b><span>${man(c.price)}</span></div>
          <p class="muted">${esc(c.text)}</p>
          <p class="asset-v">매달 보험·자동차세·정비 ${man(c.monthly)} · 출근한 날 기름값·주차비 ${man(c.commute)} (지금은 ${esc(commuteOf().name)} ${man(commuteOf().cost)}) · 출근할 때 체력 +${c.hp}</p>
          <button class="btn sm" data-act="buy-car" data-id="${c.id}" ${S.cash < c.price ? 'disabled' : ''}>현금으로 산다</button>
        </div>`).join('')}
      <p class="muted">지금 현금 ${man(S.cash)} · 비상금 ${man(emergencyNeed())}은 남겨 두는 게 좋다.</p>
      <button class="btn primary" data-act="close">안 산다</button>`);
  }
  function buyCar(id) {
    const c = T.LIFE.cars.find((x) => x.id === id);
    if (!c || S.cash < c.price || S.car) return;
    S.cash -= c.price;
    S.car = c.id;
    const d = apply(c.mental ? { mental: c.mental } : null);
    log(`${c.name} 구매`, [{ k: 'cash', v: -c.price }].concat(d.list), false);
    closeSheet();
    toast(c.text);
    sfx('coin');
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
    traitOf({ side: 1 }, false);
    log(`${JOB[id].name} 작업${failed ? ' (진전 없음)' : ''}`, d.list, sh.twist);
    S.view = { type: 'result', text, picked: `${JOB[id].name} 하기`, deltas: d.list, ups: d.ups, blocked: d.blocked, twist: sh.twist, after: 'night', scene: { scene: 'home', mode: 'side', face: failed ? 'sad' : d.ups.length ? 'happy' : '' } };
    sfx(failed ? 'bad' : d.ups.length ? 'level' : 'tap');
    save(); render();
  }

  function endDay() {
    S.hp = clamp(S.hp + C.nightRecover.hp, 0, 100);
    S.mental = clamp(S.mental + C.nightRecover.mental, 0, 100);
    S.day++;
    S.dayNo++;
    S.phase = 0;
    if (S.day >= C.daysPerMonth) S.view = { type: 'weekend' };
    else startDay();
  }

  function payday() {
    const sal = salary();
    const sp = rnd(C.surprises);
    if (sp.living) S.livingDelta += sp.living;
    const liv = fixedCost();
    S.cash += sal - liv + (sp.cash || 0);
    const div = Math.round(divMonthly());
    S.cash += div;
    const spend = Object.assign({}, S.monthSpend);
    S.monthSpend = { commute: 0, weekend: 0 };
    const est = estateMonth();
    const tax = taxYear();
    const cover = coverDebt();
    const slip = { month: S.month, salary: sal, living: liv, other: otherFixed(), rent: S.rent || 0, rentLabel: housingOf().costLabel, car: carOf() ? carOf().monthly : 0, spend, tax, surprise: sp, side: Math.round(S.monthSide), div, estate: est, cover, promoted: null, decay: 0, warn: 0 };
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

  // 엔딩 등급: 출근 일수에 시작 난이도 배율을 곱해 꿈의 par와 비교한다
  function gradeOf(dreamId, days) {
    const par = DREAM[dreamId] && DREAM[dreamId].par;
    if (!par) return '';
    const eff = days * (C.grade.diff[S.diffLv] || 1);
    return eff <= par[0] ? 'S' : eff <= par[1] ? 'A' : eff <= par[2] ? 'B' : 'C';
  }
  const GRADE_ORDER = ['S', 'A', 'B', 'C'];

  function ending(id, reason) {
    M.endings = M.endings || {};
    const key = id === 'dream' ? 'dream:' + dream().id : id;
    M.endings[key] = (M.endings[key] || 0) + 1;
    const days = S.dayNo + 1;
    const failed = id === 'rehire';
    const stay = id === 'stay';
    const grade = failed || stay ? '' : gradeOf(dream().id, days);
    // 꿈마다 최고 등급·최단 기록
    let record = null;
    if (!failed && !stay) {
      M.records = M.records || {};
      const old = M.records[dream().id];
      const better = !old || (grade && (!old.grade || GRADE_ORDER.indexOf(grade) < GRADE_ORDER.indexOf(old.grade)));
      const faster = !old || days < old.best;
      M.records[dream().id] = { best: faster ? days : old.best, grade: better ? grade : old.grade };
      record = { newBest: !!old && faster, newGrade: !!old && better && !!grade };
    }
    // 업적
    M.ach = M.ach || {};
    const x = {
      dream: dream().id, failed, stay, moments: S.moments.length, reason: failed ? (reason || 'angry') : '', grade, diffLv: S.diffLv, days, rank: S.rank, car: !!S.car,
      estates: S.inv.estates.length, stats: S.stats, housing: S.housing, endings: T.DREAMS.filter((d) => M.endings['dream:' + d.id]).length,
    };
    const newAch = T.ACHIEVEMENTS.filter((a) => !M.ach[a.id] && a.when(x)).map((a) => a.id);
    newAch.forEach((aid) => { M.ach[aid] = today(); });
    saveMeta();
    closeSheet();
    S.view = { type: 'ending', id, reason: reason || '', dream: dream().id, dreamName: dreamName(), days, grade, record, newAch, played: false };
    sfx('stamp');
    save(); render();
    movie();
  }

  // ───────── 꺼 둔 사이 부업 수입 ─────────
  function offline() {
    if (!S || S.view.type === 'ending') return;
    const now = Date.now();
    const gone = now - (S.lastSeen || now);
    lastTick = now;
    if (S.view.type === 'gate') render();
    // 앱을 꺼 둔 사이에 돈이 저절로 늘지는 않는다. 부업 수입은 하루를 보내야 들어온다.
  }

  function tick() {
    const now = Date.now();
    const dt = now - lastTick;
    lastTick = now;
    if (!S || dt <= 0 || dt > 5000 || ['ending', 'title'].includes(S.view.type)) return;
    if (S.view.type === 'gate') {
      if (workLeft() > 0) { checkAttendance(); render(); sfx('good'); }
      else { const t = $('#gate-left'); if (t) t.textContent = hms(msToMidnight()); }
    }
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
  // 고정지출을 항목별로 나눠 보여 준다 (입력한 금액이면 같은 비율로 나눈다)
  function fixedParts(total) {
    return T.LIFE.fixed.map((f) => `${f.name} ${man(Math.round(total * f.share / 10000) * 10000)}`).join(' · ');
  }
  const pctS = (x) => (x >= 0 ? '+' : '') + (Math.round(x * 1000) / 10).toFixed(1) + '%';
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

  // 꿈 엔딩은 dreams.js에서, 나머지는 endings.js에서 가져온다
  function endingOf(v) {
    if (v.id === 'dream') {
      const d = DREAM[v.dream] || DREAM.rest;
      const name = v.dreamName || d.name;
      const sub = (t) => String(t).replace(/\{꿈\}/g, name);
      return { title: sub(d.ending.title), line: sub(d.ending.line), body: d.ending.body.map(sub), scene: d.scene };
    }
    return T.ENDINGS[v.id] || T.ENDINGS.rehire;
  }
  const shortName = (t, n) => (t.length > n ? t.slice(0, n) + '…' : t);

  function sceneFor(v) {
    if (v.scene) return v.scene;
    const phase = T.PHASES[S.phase] ? T.PHASES[S.phase].id : 'am';
    switch (v.type) {
      case 'title': return { scene: 'office', phase: 'off', who: 'boss', prop: 'cover', face: 'happy' };
      case 'event': return sceneOfEvent(EV[v.id]);
      case 'evening': return { scene: 'home' };
      case 'pickjob': return { scene: 'home', mode: 'side' };
      case 'gate': return { scene: 'home', mode: 'rest' };
      case 'weekend': return { scene: 'street', phase: 'am' };
      case 'daylog': return { scene: 'home', mode: 'rest' };
      case 'setup': return { scene: 'office', phase: 'morning' };
      case 'payday': return { scene: 'office', phase: 'off', mode: 'pay', face: 'happy' };
      case 'ending': { const sc = endingOf(v).scene; return sc === 'office' ? { scene: 'elevator', who: 'boss', face: 'shock' } : { scene: sc, mode: sc === 'home' ? 'rest' : undefined }; }
    }
    return { scene: 'office', phase };
  }

  function hud() {
    const ph = T.PHASES[S.phase] || T.PHASES[0];
    const v = S.view.type;
    $('#h-date').textContent = `입사 ${S.month}개월차 · ${v === 'weekend' ? '주말' : T.DAYS[Math.min(S.day, 4)]}`;
    $('#h-rank').textContent = C.ranks[S.rank].name;
    $('#h-time').textContent = v === 'payday' ? '18:00' : v === 'ending' ? '--:--' : v === 'gate' ? '23:00' : ph.time;
    $('#h-phase').textContent = v === 'weekend' ? '주말' : v === 'payday' ? '월급날' : v === 'ending' ? '퇴사 완료' : v === 'title' ? '입사 첫날' : v === 'gate' ? '오늘 근무 끝' : ph.label;
    $('#h-org').textContent = `${company()} · ${deptName()}`;
    if (TEST) $('#h-pass').textContent = '테스트 모드';
    else {
      const n = (M.streak && M.streak.n) || 0;
      $('#h-pass').textContent = n > 1 ? `연속 출근 ${n}일` : workLeft() ? '오늘 출근 전' : '오늘 근무 끝';
    }
    bar('#b-hp', S.hp);
    bar('#b-mind', S.mental);
    $('#h-cash').textContent = won(S.cash);
    $('#h-cash').classList.toggle('neg', S.cash < 0);
    $('#h-eval').textContent = `${S.eval}`;
    $('#h-goal').textContent = `${Math.floor(goalPct() * 100)}%`;
    $('#h-goal-label').textContent = `${shortName(dream().id === 'custom' ? dreamName() : dream().short, 5)}까지`;
    const h = hourlyTotal();
    const focus = JOB[S.focus];
    $('#sidebank').innerHTML = h
      ? `<b>부업 하루 ${man(Math.round(h * C.dayIncomeHours * (1 - TX.withhold)))}</b><span>${focus.name} Lv.${S.side[S.focus].lvl} · 하루를 보내야 들어와</span>`
      : `<b>부업 수입 0원</b><span>퇴근 후에 부업을 시작해 봐</span>`;
    const rn = roadNext();
    const showRoad = !['title', 'setup', 'ending'].includes(v);
    $('#h-road').hidden = !showRoad;
    if (showRoad) $('#h-road').innerHTML = rn ? `<span>다음 목표 ${T.ROADMAP.indexOf(rn) + 1}/${T.ROADMAP.length}</span><b>${esc(rn.title)}</b><em>${Math.floor(clamp(roadPct(rn.id), 0, 1) * 100)}%</em>` : '<span>퇴사 로드맵</span><b>완주. 사직서를 낼 수 있다</b><em>100%</em>';
    $('#btn-invest').disabled = ['title', 'setup', 'ending'].includes(v);
    $('#btn-invest').classList.toggle('locked', !stocksOpen());
    $('#btn-resign').disabled = ['ending', 'title', 'setup'].includes(v);
    $('#cover').hidden = v !== 'title';
    $('#btn-report').disabled = ['title', 'setup'].includes(v);
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
        <p>평범한 직장인. 퇴사하고 하고 싶은 게 하나 있다.</p>
        <p class="muted">그 꿈을 위해 회사를 버틸지, 벗어날지. 매일의 선택이 결말을 바꾼다. 다만 회사는 마음대로 되는 게 하나도 없다.</p>
        <button class="btn primary" data-act="setup">내 회사로 입사하기</button>
        <button class="btn" data-act="start">그냥 입사하기</button>
        ${M.endings && Object.keys(M.endings).length ? `<button class="btn ghost" data-act="dex">엔딩 도감 ${T.DREAMS.filter((d) => M.endings['dream:' + d.id]).length + (M.endings.stay ? 1 : 0)}/${T.DREAMS.length + 1} · 업적 ${T.ACHIEVEMENTS.filter((a) => (M.ach || {})[a.id]).length}/${T.ACHIEVEMENTS.length}</button>` : `<button class="btn ghost" data-act="dex">도감·업적 보기</button>`}
        <p class="muted">"내 회사로"를 고르면 회사·부서·연차·직급·월급과 <b>퇴사하고 하고 싶은 것</b>을 정하고 시작해. "그냥 입사하기"는 꿈이 "1년 쉬기"로 정해져.</p>`;
    } else if (v.type === 'setup') {
      html = `<div class="who">입사 서류</div>${profileForm()}
        <button class="btn primary" data-act="setup-go">이대로 입사하기</button>
        <button class="btn ghost" data-act="start">귀찮아, 기본값으로 시작</button>`;
    } else if (v.type === 'event') {
      const ev = EV[v.id];
      if (ev.who === 'phone') sfx('phone');
      const arcTag = ev.story ? `<div class="arc">이어지는 이야기 · ${esc(STORY[ev.story].title)} <span>${ev.stepIndex + 1}/${STORY[ev.story].steps.length}</span></div>` : '';
      html = `
        ${arcTag}
        ${T.WHO[ev.who] ? `<div class="who">${T.WHO[ev.who]}</div>` : ''}
        <p class="text">${para(fmt(ev.text))}</p>
        <div class="choices">${ev.options.map((o, i) => `
          <button class="choice" data-act="choose" data-i="${i}">
            <span class="num">${i + 1}</span>
            <span class="lbl">${esc(fmt(o.label))}<small>${esc(hint(o))}</small></span>
          </button>`).join('')}
        </div>`;
    } else if (v.type === 'result') {
      html = `
        <div class="picked">${esc(fmt(v.picked))}</div>
        ${v.twist ? '<div class="twist">삐끗!</div>' : ''}
        <p class="text">${para(fmt(v.text))}</p>
        ${(v.ups || []).map((u) => `<p class="levelup"><b>${JOB[u.id].name} Lv.${u.lvl}</b> ${esc(u.line)}${u.cost ? ` <span class="muted">(재고비 -${man(u.cost)})</span>` : ''}</p>`).join('')}
        <div class="deltas">${v.deltas.map(chip).join('')}</div>
        ${v.moment ? `<p class="moment"><b>좋은 순간</b> ${esc(v.moment)}</p>` : ''}
        ${v.arc ? `<p class="arc-next">${v.arc.done ? `「${esc(v.arc.title)}」 이야기 끝.` : `「${esc(v.arc.title)}」 이야기는 계속된다…`}</p>` : ''}
        <button class="btn primary" data-act="next">${v.after === 'night' || v.after === 'collapse' ? '오늘의 근무 일지 ›' : '다음 ›'}</button>`;
    } else if (v.type === 'daylog') {
      html = daylog(v);
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
    } else if (v.type === 'weekend') {
      const L = T.LIFE.lines;
      const opts = T.LIFE.weekend.filter((w) => !w.car || S.car);
      html = `
        <div class="who">${esc(L.weekendTitle)}</div>
        <p class="text">한 주를 버텼다. 주말이 지나면 월급날이다. ${esc(L.weekendAsk)}</p>
        <div class="choices">${opts.map((w, i) => `
          <button class="choice" data-act="weekend" data-id="${w.id}">
            <span class="num">${i + 1}</span>
            <span class="lbl">${esc(w.label)}<small>${esc(hint({ fx: w.fx }))} · 약 ${man(-w.fx.cash)}</small></span>
          </button>`).join('')}
        </div>
        ${S.car ? `<p class="muted">내 차: ${esc(carOf().name)}</p>` : `<button class="btn" data-act="car">${esc(L.carAsk)}</button>`}`;
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
      const full = workLeft() > 0;
      html = `
        <div class="who">오늘 근무 끝</div>
        <p class="text">오늘은 여기까지. 회사도 나도 내일 다시.</p>
        <p class="muted">실제 하루에 게임 속 하루 하나만 출근할 수 있어. 내일 열면 출근 도장이 찍히고, 연속으로 출근할수록 보상이 커져. 그동안에도 부업 수입은 쌓여.</p>
        <div class="gate-clock">${full ? '출근할 수 있어' : `다음 출근까지 <b id="gate-left">${hms(msToMidnight())}</b>`}</div>
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
            ${s.rent ? `<tr><th>${esc(s.rentLabel)}</th><td class="minus">-${won(s.rent)}</td></tr>` : ''}
            <tr><th>그 밖의 고정지출<small>${esc(fixedParts(s.other != null ? s.other : s.living))}</small></th><td class="minus">-${won(s.other != null ? s.other : s.living)}</td></tr>
            ${s.car ? `<tr><th>차 보험·자동차세·정비</th><td class="minus">-${won(s.car)}</td></tr>` : ''}
            <tr><th>이번 달 변수<small>${esc(sp.text)}${sp.living ? ` (생활비 매달 +${man(sp.living)})` : ''}</small></th><td class="${(sp.cash || 0) >= 0 ? 'plus' : 'minus'}">${sp.cash ? ((sp.cash > 0 ? '+' : '-') + won(Math.abs(sp.cash))) : '0원'}</td></tr>
            <tr class="sum"><th>이번 달 남은 돈</th><td class="${left >= 0 ? 'plus' : 'minus'}">${left >= 0 ? '+' : ''}${won(left)}</td></tr>
            <tr><th>부업 수입<small>3.3% 떼고 이미 통장에 들어옴</small></th><td class="plus">+${won(s.side)}</td></tr>
            ${s.spend && s.spend.commute ? `<tr><th>출근 교통비·점심값<small>출근한 날마다 이미 나감</small></th><td class="minus">-${won(s.spend.commute)}</td></tr>` : ''}
            ${s.spend && s.spend.weekend ? `<tr><th>주말 지출<small>이미 나감</small></th><td class="minus">-${won(s.spend.weekend)}</td></tr>` : ''}
            ${s.tax ? `<tr><th>종합소득세 정산<small>1년치 부업·월세 소득 ${man(s.tax.gross)} · 세금 ${man(s.tax.due)} − 미리 뗀 ${man(s.tax.withheld)}</small></th><td class="${s.tax.income > 0 ? 'minus' : 'plus'}">${s.tax.income > 0 ? '-' : '+'}${won(Math.abs(s.tax.income))}</td></tr>
            ${s.tax.prop ? `<tr><th>재산세<small>원룸 시세 기준 (대략)</small></th><td class="minus">-${won(s.tax.prop)}</td></tr>` : ''}` : ''}
            ${s.div ? `<tr><th>배당금<small>지수펀드 분배금 (게임용) · 배당소득세 15.4% 뗀 금액</small></th><td class="plus">+${won(s.div)}</td></tr>` : ''}
            ${s.estate ? `<tr><th>월세 − 대출 이자<small>${esc(s.estate.notes.join(' ') || '원룸 ' + S.inv.estates.length + '채 · 금리 ' + S.inv.rate.toFixed(1) + '%')}</small></th><td class="${s.estate.net >= 0 ? 'plus' : 'minus'}">${s.estate.net >= 0 ? '+' : '-'}${won(Math.abs(s.estate.net))}</td></tr>` : ''}
          </table>
          ${(s.cover || []).map((t) => `<p class="warn">${esc(t)}</p>`).join('')}
          <div class="slip-f">통장 잔고 ${won(S.cash)}</div>
        </div>
        ${s.promoted ? `<p class="levelup"><b>승진!</b> 오늘부터 ${s.promoted}이다. 월급이 올랐다.</p>`
          : `<p class="muted">평가 -${s.decay}. 지난달 성과는 지난달 거다.${S.rank < C.ranks.length - 1 ? ` 승진하려면 월급날 평가 ${C.promoteAt} 이상.` : ''}</p>`}
        ${s.warn ? `<p class="warn"><b>인사팀 경고 ${s.warn}/${C.warnLimit}</b> 평가가 ${C.warnBelow} 아래다. ${s.warn >= C.warnLimit ? '인사팀에서 면담하자는 메일이 왔다.' : `다음 월급날에도 이러면 권고사직이다.`}</p>` : ''}
        <button class="btn primary" data-act="next">${s.warn >= C.warnLimit ? '면담하러 간다 ›' : '다음 달도 버틴다 ›'}</button>`;
    } else if (v.type === 'ending') {
      const e = endingOf(v);
      const got = M.endings || {};
      // 도감은 꿈 퇴사만 센다. 홧김·번아웃·권고사직은 실패 퇴사로 따로 센다.
      const dex = T.DREAMS.map((d) => ({ key: 'dream:' + d.id, label: d.id === 'custom' ? '내 꿈' : d.ending.title.replace(' 엔딩', '') }))
        .concat([{ key: 'stay', label: '오늘도 다닐게요' }]);
      const failed = v.id === 'rehire';
      const stay = v.id === 'stay';
      const best = T.SIDEJOBS.reduce((a, j) => (S.side[j.id].lvl > S.side[a].lvl ? j.id : a), 'blog');
      html = `
        <div class="who stamp-label${failed ? ' fail' : stay ? ' stay' : ''}">${failed ? '실패 퇴사' : stay ? '사직서 찢음' : '사직서 수리됨'}</div>
        <h2 class="ending-title">${e.title}</h2>
        ${v.grade ? `<div class="grade-row"><span class="grade g${v.grade}">${v.grade}</span><span>출근 ${v.days}일 · ${esc((T.LIFE.difficulty[S.diffLv] || T.LIFE.difficulty[1]).name)} 시작${v.record && v.record.newBest ? ' · 최단 기록!' : ''}</span></div>` : ''}
        <p class="line">${esc(v.reason === 'burnout' ? e.burnoutLine : v.reason === 'fired' ? e.firedLine : e.line)}</p>
        ${e.body.map((b) => `<p class="text">${esc(fmt(b))}</p>`).join('')}
        <div class="summary">
          <span>${esc(company())}</span><span>출근 ${S.dayNo + 1}일</span><span>입사 ${S.month}개월</span><span>${C.ranks[S.rank].name}</span><span>순자산 ${man(netWorth())}</span><span>좋은 순간 ${S.moments.length}번</span><span>${JOB[best].name} Lv.${S.side[best].lvl}</span>
        </div>
        <div class="dex"><b>엔딩 도감 ${dex.filter((x) => got[x.key]).length}/${dex.length}</b>
          ${dex.map((x) => { const r = (M.records || {})[x.key.slice(6)]; return `<span class="${got[x.key] ? 'got' : ''}">${got[x.key] ? x.label + (r && r.grade ? ' ' + r.grade : '') : '???'}</span>`; }).join('')}
        </div>
        ${(v.newAch || []).length ? `<div class="new-ach">${v.newAch.map((id) => { const a = T.ACHIEVEMENTS.find((z) => z.id === id); return a ? `<p class="levelup"><b>업적 달성</b> ${esc(a.name)}</p>` : ''; }).join('')}</div>` : ''}
        ${got.rehire ? `<p class="muted">실패 퇴사 ${got.rehire}번</p>` : ''}
        <p class="muted">${esc(stay ? T.DREAM_NOTE.stay(S.dayNo + 1, S.moments.length) : T.DREAM_NOTE.season(S.dayNo + 1, T.DREAMS.filter((d) => !got['dream:' + d.id]).length, failed))}</p>
        <div class="row">
          <button class="btn" data-act="share">결과 공유하기</button>
          <button class="btn primary" data-act="restart">다음 시즌 입사</button>
        </div>
        <div class="row">
          <button class="btn" data-act="movie">영상 다시 보기</button>
          <button class="btn" data-act="dex">도감·업적</button>
        </div>
        <button class="btn" data-act="report">이번 회사생활 리포트 보기</button>`;
    }
    card.innerHTML = html;
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    paint();
    checkRoad();
  }

  // ───────── 하루 근무 일지 ─────────
  function daylog(v) {
    const sum = { hp: 0, mental: 0, eval: 0, cash: 0, twists: 0, side: 0 };
    v.log.forEach((e) => {
      if (e.twist) sum.twists++;
      e.deltas.forEach((d) => {
        if (d.k === 'sideIncome') sum.cash += d.v;
        else if (d.k in sum) sum[d.k] += d.v;
      });
    });
    const line = T.DAYLINES.find((l) => l.when(sum)).text;
    const dayName = T.DAYS[Math.min(v.day, 4)];
    const tomorrow = v.day + 1 >= C.daysPerMonth ? '내일은 월급날이다.' : `내일은 ${T.DAYS[v.day + 1]}.`;
    const top = (list) => list.filter((d) => d.v).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 2).map(chip).join('');
    const total = ['hp', 'mental', 'eval', 'cash'].filter((k) => sum[k]).map((k) => chip({ k, v: Math.round(sum[k]) })).join('') || '<span class="d zero">변화 없음</span>';
    return `
      <div class="slip daylog">
        <div class="slip-h"><b>근무 일지</b><span>입사 ${v.month}개월차 · ${dayName}</span></div>
        <ol class="log">${v.log.map((e) => `
          <li><span class="t">${e.time}</span><span class="l">${esc(e.label)}${e.twist ? ' <em>삐끗</em>' : ''}</span><span class="c">${top(e.deltas)}</span></li>`).join('')}
        </ol>
        <div class="log-sum"><b>오늘 합계</b><div class="deltas">${total}</div></div>
        <p class="log-line">“${esc(line)}”</p>
      </div>
      ${S.moments.some((m) => m.d === S.dayNo) ? `<div class="moments"><b>오늘의 좋은 순간</b>${S.moments.filter((m) => m.d === S.dayNo).map((m) => `<p>${esc(m.t)}</p>`).join('')}</div>` : ''}
      ${stocksOpen() ? `<div class="market"><b>오늘의 시장</b><p>${T.INVEST.stocks.map((x) => `${esc(x.name)} <em class="${S.inv.move[x.id] >= 0 ? 'up' : 'down'}">${pctS(S.inv.move[x.id])}</em>`).join(' · ')}</p>${S.inv.news ? `<p class="muted">${esc(S.inv.news)}</p>` : ''}</div>` : ''}
      ${v.teaser ? `<div class="teaser"><b>내일 예고</b><p>${esc(fmt(v.teaser))}</p></div>` : ''}
      <p class="muted">${esc(dreamName())}까지 ${Math.floor(goalPct() * 100)}% · ${tomorrow}${M.streak && M.streak.n > 1 ? ` · 실제로 ${M.streak.n}일 연속 출근 중` : ''}</p>
      <button class="btn primary" data-act="next">잠자리에 든다 ›</button>
      <button class="btn ghost" data-act="report">내 회사생활 리포트 보기</button>`;
  }

  // ───────── 입사 서류 (내 정보) ─────────
  function profileForm() {
    const p = profile();
    return `
      <div class="form">
        <label for="p-company">회사 이름</label>
        <input id="p-company" type="text" maxlength="20" value="${esc(p.company)}" placeholder="${esc(C.defaultProfile.company)}">
        <label for="p-dept">부서</label>
        <select id="p-dept">${T.DEPTS.map((d) => `<option value="${d.id}"${d.id === p.dept ? ' selected' : ''}>${d.name}</option>`).join('')}</select>
        <input id="p-deptname" type="text" maxlength="12" value="${esc(p.deptName || '')}" placeholder="부서 이름 (예: 총무팀)"${p.dept === 'etc' ? '' : ' hidden'}>
        <div class="form-row">
          <div><label for="p-years">연차</label><input id="p-years" type="number" inputmode="numeric" min="1" max="40" value="${p.years || ''}" placeholder="1"><small>년 차</small></div>
          <div><label for="p-rank">직급</label><select id="p-rank"><option value="">연차로 자동</option>${C.ranks.map((r, i) => `<option value="${i}"${p.rank === i ? ' selected' : ''}>${r.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div><label for="p-salary">월 실수령</label><input id="p-salary" type="number" inputmode="numeric" min="100" max="5000" value="${p.salary || ''}" placeholder="260"><small>만 원</small></div>
        </div>
        <label for="p-housing">사는 곳</label>
        <select id="p-housing">${T.LIFE.housing.map((h) => `<option value="${h.id}"${h.id === p.housing ? ' selected' : ''}>${h.name}</option>`).join('')}</select>
        <p class="muted" id="p-housing-desc">${esc((T.LIFE.housing.find((h) => h.id === p.housing) || T.LIFE.housing[1]).desc)}</p>
        <div class="form-unit"><input id="p-housingcost" type="number" inputmode="numeric" min="0" max="1000" value="${p.housingCost != null ? p.housingCost : ''}" placeholder="한 달 주거비 (비우면 기본값)"><small>만 원</small></div>
        <label for="p-commute">출퇴근</label>
        <select id="p-commute">${T.LIFE.commutes.map((c) => `<option value="${c.id}"${c.id === p.commute ? ' selected' : ''}>${c.name}</option>`).join('')}</select>
        <p class="muted" id="p-commute-desc">${esc((T.LIFE.commutes.find((c) => c.id === p.commute) || T.LIFE.commutes[0]).desc)}</p>
        <label for="p-expense">그 밖의 고정지출 <span class="opt">선택</span></label>
        <p class="muted">장보기·공과금·보험·통신비처럼 주거비 말고 매달 나가는 돈. 점심값·주말 지출은 게임 안에서 따로 나가.</p>
        <div class="form-unit"><input id="p-expense" type="number" inputmode="numeric" min="0" max="5000" value="${p.expense != null ? p.expense : ''}" placeholder="비우면 기본값"><small>만 원</small></div>
        <div class="diff" id="p-diff">${diffLine(p)}</div>
        <label for="p-dream">퇴사하고 하고 싶은 것</label>
        <select id="p-dream">${T.DREAMS.map((d) => `<option value="${d.id}"${d.id === p.dream ? ' selected' : ''}>${d.name}</option>`).join('')}</select>
        <p class="muted" id="p-dream-desc">${esc(dreamDesc(DREAM[p.dream] || DREAM.rest))}</p>
        <p class="muted">${T.DREAM_NOTE.scale}</p>
        <div class="form-custom"${p.dream === 'custom' ? '' : ' hidden'}>
          <input id="p-dreamname" type="text" maxlength="16" value="${esc(p.dreamName || '')}" placeholder="예: 동네 책방 열기">
          <div class="form-unit"><input id="p-dreamcost" type="number" inputmode="numeric" min="100" max="100000" value="${p.dreamCost || ''}" placeholder="필요한 돈"><small>만 원</small></div>
        </div>
        <p class="muted">입력한 내용은 이 기기에만 저장되고 어디로도 보내지 않아. 비워 두면 기본값을 써.</p>
        <p class="form-err" id="p-err" hidden></p>
      </div>`;
  }

  // 입사 서류 아래 "시작 난이도": 고른 조합으로 한 달에 남는 돈을 미리 계산한다
  function diffLine(p) {
    const sp = startPlan(p, p);
    return `<b>시작 난이도 ${sp.diff.stars} ${sp.diff.name}</b><span>월급 ${man(sp.pay)} − 예상 생활비 ${man(sp.out)} = 한 달에 ${sp.left >= 0 ? '' : '마이너스 '}${man(Math.abs(sp.left))}</span>`;
  }
  function formDraft() {
    const v = (id) => { const x = $(id); return x && x.value.trim() !== '' ? Math.round(Number(x.value)) : null; };
    const rk = $('#p-rank').value;
    return Object.assign({}, C.defaultProfile, { years: v('#p-years') || 1, rank: rk === '' ? null : Number(rk), salary: v('#p-salary'), expense: v('#p-expense'), housing: $('#p-housing').value, housingCost: v('#p-housingcost'), commute: $('#p-commute').value });
  }

  function readProfile() {
    const num = (id, lo, hi) => {
      const raw = $(id).value.trim();
      if (!raw) return null;
      const n = Math.round(Number(raw));
      return Number.isFinite(n) && n >= lo && n <= hi ? n : NaN;
    };
    const p = {
      company: $('#p-company').value.trim() || C.defaultProfile.company,
      dept: $('#p-dept').value,
      deptName: $('#p-deptname').value.trim(),
      years: num('#p-years', 1, 40),
      rank: $('#p-rank').value === '' ? null : Number($('#p-rank').value),
      salary: num('#p-salary', 100, 5000),
      expense: num('#p-expense', 0, 5000),
      housing: $('#p-housing').value,
      housingCost: num('#p-housingcost', 0, 1000),
      commute: $('#p-commute').value,
      dream: $('#p-dream').value,
      dreamName: $('#p-dreamname').value.trim(),
      dreamCost: num('#p-dreamcost', 100, 100000),
    };
    const err = [];
    if (Number.isNaN(p.years)) err.push('연차는 1~40 사이 숫자로 적어 줘.');
    if (Number.isNaN(p.salary)) err.push('월 실수령은 만 원 단위로 100~5000 사이로 적어 줘. 예: 320');
    if (Number.isNaN(p.expense)) err.push('고정지출은 만 원 단위 숫자로 적어 줘. 예: 90');
    if (Number.isNaN(p.housingCost)) err.push('주거비는 만 원 단위 숫자로 적어 줘. 예: 60');
    if (p.dream === 'custom' && !p.dreamName) err.push('하고 싶은 걸 한 줄로 적어 줘.');
    if (p.dream === 'custom' && (Number.isNaN(p.dreamCost) || !p.dreamCost)) err.push('꿈에 필요한 돈을 만 원 단위로 적어 줘. 예: 5000');
    if (err.length) { const e = $('#p-err'); e.textContent = err.join(' '); e.hidden = false; return null; }
    if (!p.years) p.years = C.defaultProfile.years;
    return p;
  }

  function editProfile() {
    sheet(`<h3>내 정보 고치기</h3>${profileForm()}
      <p class="muted">회사·부서·꿈은 바로 바뀌어. 연차·직급·월급·고정지출은 리포트에는 바로, 게임 속 직급·월급에는 다음 입사부터 반영돼.</p>
      <button class="btn primary" data-act="profile-save">저장</button>
      <button class="btn ghost" data-act="close">닫기</button>`);
  }

  // ───────── 내 회사생활 리포트 ─────────
  function reportData() {
    const p = profile();
    const t = S.traits || {};
    const total = t.total || 0;
    const share = Object.fromEntries(Object.keys(T.TRAITS).map((k) => [k, total ? (t[k] || 0) / total : 0]));
    const topKey = Object.keys(share).sort((a, b) => share[b] - share[a])[0];
    const persona = total && share[topKey] >= 0.3 ? topKey : 'balanced';
    const r = { share, total, persona, sideLevel: maxLvl(), savingRate: null, moments: S.moments.length, momentsRecent: momentsRecent() };
    if (p.salary && p.expense != null) {
      // 입력한 고정지출 + 게임 속 출근·주말 지출 평균
      r.spend = Math.round(living() / 10000);
      const save = p.salary - r.spend;
      r.savingRate = save / p.salary;
      r.save = save;
      r.fiTarget = r.spend * 12 * 25;
      r.fiYears = save > 0 ? r.fiTarget / (save * 12) : null;
    }
    const sideMonth = hourlyTotal() * C.dayIncomeHours * C.daysPerMonth;
    r.dependency = salary() / (salary() + sideMonth);
    return { p, r };
  }

  // 꿈까지 남은 것: 게임 속 페이스와, 실제 숫자를 넣었다면 현실 페이스
  function planBlock(p, r) {
    const parts = dreamParts();
    const rows = parts.map((x) => `<li><span>${x.label}</span><b>${x.money ? man(Math.max(0, x.have)) + ' / ' + man(x.need) : 'Lv.' + x.have + ' / ' + x.need}</b><em class="${x.pct >= 1 ? 'good' : ''}">${Math.floor(x.pct * 100)}%</em></li>`).join('');
    const monthSave = salary() - living() + passive();
    const needCash = dreamNeed().cash + emergencyNeed();
    const gap = Math.max(0, needCash - netWorth());
    const gameMonths = gap <= 0 ? 0 : monthSave > 0 ? Math.ceil(gap / monthSave) : null;
    const game = !dreamNeed().cash ? '이 꿈은 돈을 모으는 것보다 월세·배당 같은 자본소득을 키우는 게 핵심이다.'
      : gap <= 0 ? '돈은 이미 모였다. 남은 조건만 채우면 사직서를 낼 수 있다.'
      : gameMonths ? `투자 수익 없이 지금 페이스(월급 − 생활비 + 부업·월세)로만 모으면 약 ${gameMonths}개월 뒤. 실제로는 하루에 하루씩이라 약 ${gameMonths * C.daysPerMonth}일 걸린다. 재테크가 이 기간을 줄이거나 늘린다.`
      : '지금 페이스로는 돈이 모이지 않는다. 생활비가 월급보다 크다.';
    let realLine = '';
    if (r.save != null) {
      const d = dream();
      const realNeed = (d.cash === 'living12' ? r.spend * 12 : d.cash === 'living6' ? r.spend * 6 : d.cash === 'custom' ? (p.dreamCost || 0)
        : d.cash === 'goal' || d.capital ? r.fiTarget : d.cash / 10000) + (d.capital ? 0 : r.spend * C.emergencyMonths);
      const months = r.save > 0 ? Math.ceil(realNeed / r.save) : null;
      realLine = `<p class="muted">현실에서는: ${esc(dreamName())}에 약 ${man(realNeed * 10000)}이 필요하다${d.capital ? ' (생활비 25년치, 4% 법칙)' : ` (비상금 ${C.emergencyMonths}개월치 포함)`}. 한 달에 ${man(r.save * 10000)}씩 모으면 ${months ? `약 ${months}개월(${(months / 12).toFixed(1)}년)` : '모을 수 없다'}. 투자 수익과 지금까지 모은 돈은 빼고 단순 계산했어.</p>`;
    }
    const desc = dream().id === 'custom' ? `직접 정한 꿈. 실제로 필요한 돈 ${man((p.dreamCost || 3000) * 10000)}.` : dreamDesc(dream());
    return `<div class="plan"><b>${esc(dreamName())}</b><p>${esc(desc)}</p></div>
      <ul class="checks">${rows}</ul>
      <p class="muted">${T.DREAM_NOTE.scale}</p>
      <p class="muted">${game}</p>${realLine}`;
  }

  function report() {
    const { p, r } = reportData();
    const per = T.REPORT.personas[r.persona];
    const tips = T.REPORT.advice.filter((a) => a.when(S, p, r)).slice(0, 5);
    const yrs = T.REPORT.years.find((y) => (p.years || 1) <= y.max);
    const pace = p.rank != null ? T.REPORT.rankPace.find((x) => x.when(p.rank - rankOfYears(p.years))) : null;
    const check = (label, value, bad, good) => `<li><span>${label}</span><b>${value}</b><em class="${bad ? 'bad' : good ? 'good' : ''}">${bad ? '위험' : good ? '양호' : '보통'}</em></li>`;
    const pct = (x) => Math.round(x * 100) + '%';
    const real = r.savingRate == null
      ? `<p class="muted">월 실수령과 고정지출을 넣으면 실제 숫자로도 진단해 줄게.</p>`
      : `<ul class="checks">
          ${check('실제 저축률', pct(Math.max(r.savingRate, -9)), r.savingRate < 0.1, r.savingRate >= 0.3)}
          ${check('한 달에 남는 돈', man(r.save * 10000), r.save <= 0, false)}
          ${check('생활비 25년치', man(r.fiTarget * 10000), false, false)}
          ${check('지금 페이스로 모으면', r.fiYears ? `약 ${Math.ceil(r.fiYears)}년` : '불가능', !r.fiYears || r.fiYears > 30, r.fiYears && r.fiYears <= 15)}
        </ul>
        <p class="muted">"생활비 25년치"는 모은 돈의 4%씩 꺼내 쓰며 산다는 4% 법칙 기준이야. 투자 수익과 지금까지 모은 돈은 빼고 단순 계산했어.</p>`;
    sheet(`
      <div class="report">
        <h3>내 회사생활 리포트</h3>
        <p class="muted">${esc(company())} ${esc(deptName())} · ${p.rank != null ? C.ranks[p.rank].name + ' · ' : ''}${p.years || 1}년 차 · 게임 속 입사 ${S.month}개월차 · 선택 ${r.total}번</p>
        <div class="persona"><span>한 줄 진단</span><b>${per.title}</b><p>${per.body}</p>${r.total < 15 ? '<p class="muted">아직 선택이 적어서 진단이 흔들릴 수 있어. 며칠 더 버티고 다시 보자.</p>' : ''}</div>
        <h4>선택 성향</h4>
        <div class="traits">${Object.entries(T.TRAITS).map(([k, tr]) => `
          <div class="tr"><span>${tr.name}</span><span class="jbar"><i style="width:${pct(r.share[k])}"></i></span><b>${pct(r.share[k])}</b></div>`).join('')}
        </div>
        <h4>냉정한 상태 체크</h4>
        <ul class="checks">
          ${check('체력', S.hp, S.hp < 35, S.hp >= 70)}
          ${check('멘탈', S.mental, S.mental < 35, S.mental >= 70)}
          ${check('평가', S.eval + (S.warns ? ` (경고 ${S.warns})` : ''), S.eval < C.warnBelow + 10, S.eval >= C.promoteAt - 15)}
          ${check('월급 의존도', pct(r.dependency), r.dependency > 0.9, r.dependency < 0.6)}
          ${check(esc(shortName(dreamName(), 8)) + '까지', pct(goalPct()), goalPct() < 0.1, goalPct() >= 0.6)}
        </ul>
        <h4>좋은 순간</h4>
        <ul class="checks">
          ${check('사람과 함께한 좋은 순간', r.moments + '번', false, r.moments >= 20)}
          ${check(`최근 ${C.happy.recentDays}일`, r.momentsRecent + '번', r.total >= 10 && r.momentsRecent === 0, r.momentsRecent >= C.happy.stayRecent)}
        </ul>
        ${S.moments.length ? `<p class="muted">최근: ${S.moments.slice(-3).reverse().map((m) => esc(m.t)).join(' · ')}</p>` : ''}
        <p class="muted">돈과 상관없는 점수판이야. 큰 사건 한 번보다 누군가와 밥 먹고 웃는 순간이 얼마나 자주 있었는지를 센다. 좋은 순간이 충분히 쌓이면 사직서 서랍에 "오늘도 다닐게요"가 열린다.</p>
        <h4>내 자산</h4>
        <ul class="checks">
          ${check('현금', man(S.cash), S.cash < emergencyNeed(), S.cash >= emergencyNeed() * 2)}
          ${check('주식 평가액', man(stocksTotal()), false, false)}
          ${check('원룸 (대출 뺀 값)', man(estateEquity()), false, false)}
          ${S.deposit ? check('전세 보증금 (묶여 있음, 꿈 자금에 안 셈)', man(S.deposit), false, false) : ''}
          ${check('순자산', man(netWorth()), netWorth() < 0, false)}
          ${check('월 부수입 (부업+월세+배당)', man(passive()), passive() <= 0, passive() >= living() * 0.5)}
          ${check('올해 부업·월세 소득', man(S.tax.side + S.tax.rent), false, false)}
          ${check('종합소득세 예상 (미리 뗀 세금 빼고)', man(Math.max(0, incomeTaxDue() - S.tax.withheld)), false, false)}
        </ul>
        <p class="muted">세금: 월급은 이미 세금 뗀 실수령이야. 부업 수입은 3.3%를 먼저 떼고, 게임 속 12개월마다 월급 1년치에 부업·월세 소득을 얹어 종합소득세(6~45% 누진, 지방소득세 포함)를 정산해. 공제·경비는 빼지 않은 단순 계산이야. 배당은 15.4%를 떼고 들어와. 국내 주식 매매차익은 세금이 없다고 보고, 수수료·거래세는 대략 ${(IV.fee * 100).toFixed(1)}%로 잡았어.</p>
        <p class="muted">${esc(T.INVEST.disclaimer)}</p>
        <h4>내 퇴사 계획</h4>
        ${planBlock(p, r)}
        <h4>내 실제 숫자</h4>
        ${real}
        <h4>바꿀 수 있는 것</h4>
        <div class="tips">${tips.length ? tips.map((a) => `<div class="tip"><b>${a.title}</b><p>${a.text}</p></div>`).join('') : '<div class="tip"><b>큰 위험 없음</b><p>지금은 균형이 나쁘지 않다. 이 페이스를 지키는 게 제일 어렵다.</p></div>'}
          ${pace ? `<div class="tip"><b>${pace.title}</b><p>${pace.text}</p></div>` : ''}
          <div class="tip"><b>${p.years || 1}년 차에게</b><p>${yrs.text}</p></div>
          <div class="tip"><b>${esc(deptName())}에게</b><p>${T.REPORT.dept[p.dept] || T.REPORT.dept.etc}</p></div>
        </div>
        <p class="muted">${T.REPORT.disclaimer}</p>
      </div>
      <div class="row">
        <button class="btn" data-act="report-share">리포트 공유</button>
        <button class="btn" data-act="profile">내 정보 고치기</button>
      </div>
      <button class="btn primary" data-act="close">닫기</button>`);
    $('#sheet').scrollTop = 0;
  }

  async function shareReport() {
    const { r } = reportData();
    const per = T.REPORT.personas[r.persona];
    const top = Object.entries(T.TRAITS).sort((a, b) => r.share[b[0]] - r.share[a[0]]).slice(0, 3).map(([k, tr]) => `${tr.name} ${Math.round(r.share[k] * 100)}%`).join(' · ');
    const text = `내 회사생활 진단: 「${per.title}」\n${top}\n#퇴사할게요 #오늘도버텼다`;
    try { await navigator.clipboard.writeText(text + '\n' + C.shareUrl); toast('리포트 요약을 복사했어.'); } catch (e) { toast('복사가 안 돼. 화면을 캡처해서 공유해 줘.'); }
  }

  // ───────── 사직서 ─────────
  function resign() {
    if (!S || ['ending', 'title'].includes(S.view.type)) return;
    const ready = dreamReady();
    const parts = dreamParts();
    sheet(`
      <h3>사직서</h3>
      <p class="muted">어떤 사직서를 낼까?</p>
      <div class="resign">
        <button class="rs" data-act="end" data-id="dream" ${ready ? '' : 'disabled'}>
          <b>${esc(dreamName())}</b>
          ${parts.map((x) => `<span>${x.label} ${x.money ? man(Math.max(0, x.have)) + ' / ' + man(x.need) : 'Lv.' + x.have + ' / ' + x.need}</span><span class="jbar"><i style="width:${x.pct * 100}%"></i></span>`).join('')}
        </button>
        <button class="rs stay" data-act="end" data-id="stay" ${stayReady() ? '' : 'disabled'}>
          <b>사직서를 찢는다 · 오늘도 다닐게요</b>
          ${stayParts().map((x) => `<span>${x.label} ${x.have} / ${x.need}</span><span class="jbar"><i style="width:${x.pct * 100}%"></i></span>`).join('')}
        </button>
        <button class="rs angry" data-act="angry">
          <b>홧김에 던진다</b><span>실패 퇴사. 꿈 도감에 안 남는다.</span>
        </button>
      </div>
      <p class="muted">${ready ? '조건이 다 모였다. 이제 꿈 퇴사를 할 수 있다.' : `아직 조건 ${parts.length}개 중 ${parts.filter((x) => x.pct >= 1).length}개. 순자산은 현금+주식+원룸(대출 뺀 값)이야.`}</p>
      <p class="muted">꿈은 리포트의 "내 정보 고치기"에서 바꿀 수 있어.</p>
      <button class="btn ghost" data-act="close">서랍에 다시 넣는다</button>`);
  }

  function angry() {
    sheet(`
      <h3>정말 던질까?</h3>
      <p>이건 <b>실패 퇴사</b>야. 모은 돈으로 버티다 다시 취업하는 엔딩으로 끝나고, 꿈 도감에는 남지 않아.</p>
      <p class="muted">지금 ${esc(dreamName())}까지 ${Math.floor(goalPct() * 100)}%.</p>
      <button class="btn danger" data-act="end" data-id="rehire" data-r="angry">그래도 던진다</button>
      <button class="btn primary" data-act="close">아니, 참는다</button>`);
  }

  // ───────── 재테크 ─────────
  function invest() {
    if (!S || ['title', 'setup', 'ending'].includes(S.view.type)) return;
    const L = T.INVEST.lines;
    if (!stocksOpen()) {
      sheet(`
        <h3>재테크</h3>
        <p>${esc(L.locked)}</p>
        <ul class="checks"><li><span>비상금 (현금 ${C.emergencyMonths}개월치)</span><b>${man(Math.max(0, S.cash))} / ${man(emergencyNeed())}</b><em>${Math.floor(clamp(roadPct('emergency'), 0, 1) * 100)}%</em></li></ul>
        <button class="btn primary" data-act="close">닫기</button>`);
      return;
    }
    const spare = Math.max(0, Math.floor((S.cash - emergencyNeed()) / 100000) * 100000);
    const stockRows = T.INVEST.stocks.map((x) => {
      const val = stockVal(x.id), cost = S.inv.cost[x.id];
      const gain = cost ? val / cost - 1 : 0;
      return `
      <div class="asset">
        <div class="asset-h"><b>${esc(x.name)}</b><span>${Math.round(S.inv.price[x.id]).toLocaleString('ko-KR')} <em class="${S.inv.move[x.id] >= 0 ? 'up' : 'down'}">${pctS(S.inv.move[x.id])}</em></span></div>
        <p class="muted">${esc(x.desc)}</p>
        <p class="asset-v">보유 ${man(val)}${cost ? ` · 수익률 <em class="${gain >= 0 ? 'up' : 'down'}">${pctS(gain)}</em>` : ''}</p>
        <div class="row4">
          <button class="btn sm" data-act="buy" data-id="${x.id}" data-n="0" ${S.cash < lot(0) ? 'disabled' : ''}>${man(lot(0))} 사기</button>
          <button class="btn sm" data-act="buy" data-id="${x.id}" data-n="1" ${S.cash < lot(1) ? 'disabled' : ''}>${man(lot(1))} 사기</button>
          <button class="btn sm" data-act="buy" data-id="${x.id}" data-n="spare" ${spare <= 0 ? 'disabled' : ''}>비상금 빼고 전부</button>
          <button class="btn sm" data-act="sell" data-id="${x.id}" data-n="0.5" ${val <= 0 ? 'disabled' : ''}>절반 팔기</button>
          <button class="btn sm" data-act="sell" data-id="${x.id}" data-n="1" ${val <= 0 ? 'disabled' : ''}>전부 팔기</button>
        </div>
      </div>`;
    }).join('');
    const q = estateQuote();
    const estateBlock = !estateOpen()
      ? `<div class="asset locked"><div class="asset-h"><b>${esc(T.INVEST.estate.name)}</b><span>잠김</span></div><p class="muted">${esc(L.estateLocked)} 지금 ${Math.floor(clamp(roadPct('seed'), 0, 1) * 100)}% (계약금+세금 ${man(q.need)})</p></div>`
      : `<div class="asset">
          <div class="asset-h"><b>${esc(T.INVEST.estate.name)}</b><span>금리 ${S.inv.rate.toFixed(1)}%</span></div>
          <p class="muted">${esc(T.INVEST.estate.desc)}</p>
          ${S.inv.estates.map((e, i) => `
            <p class="asset-v">${i + 1}호 · 시세 ${man(e.price)} · 대출 ${man(e.loan)} · 월 ${estateNet(e) >= 0 ? '+' : ''}${man(estateNet(e))}${e.selling != null ? ` · <b>매물로 내놓음 (${Math.max(0, e.selling - S.dayNo - 1)}일 뒤 팔림)</b>` : ''}</p>
            ${e.selling == null ? `<button class="btn sm" data-act="estate-sell" data-i="${i}">중개소에 내놓기</button>` : ''}`).join('')}
          ${S.inv.estates.length < IV.estate.max ? `
            <p class="asset-v">새로 사기: 시세 ${man(q.price)} · 대출 ${Math.round(IV.estate.ltv * 100)}% · 월세 ${man(q.rent)} · 필요한 현금 ${man(q.need)}</p>
            <button class="btn sm" data-act="estate-buy" ${S.cash < q.need ? 'disabled' : ''}>계약한다</button>` : ''}
        </div>`;
    sheet(`
      <h3>재테크</h3>
      <ul class="checks">
        <li><span>현금</span><b>${man(S.cash)}</b><em class="${S.cash >= emergencyNeed() ? 'good' : 'bad'}">${S.cash >= emergencyNeed() ? '비상금 OK' : '비상금 부족'}</em></li>
        <li><span>순자산</span><b>${man(netWorth())}</b><em></em></li>
        <li><span>월 부수입 (부업+월세+배당)</span><b>${man(passive())}</b><em></em></li>
      </ul>
      ${stockRows}
      ${estateBlock}
      <p class="muted">주식 가격은 매일 밤 장이 닫힐 때 움직여. 수수료 ${(IV.fee * 100).toFixed(1)}%. ${esc(T.INVEST.disclaimer)}</p>
      <button class="btn primary" data-act="close">닫기</button>`);
  }
  function investAct(a, b) {
    const id = b.dataset.id;
    let ok = false;
    if (a === 'buy') {
      const n = b.dataset.n;
      const amt = n === 'spare' ? Math.max(0, Math.floor((S.cash - emergencyNeed()) / 100000) * 100000) : lot(+n);
      ok = buyStock(id, amt);
      if (ok) traitOf(null, id === 'theme');
    } else if (a === 'sell') ok = sellStock(id, +b.dataset.n);
    else if (a === 'estate-buy') ok = buyEstate();
    else if (a === 'estate-sell') { const e = S.inv.estates[+b.dataset.i]; if (e) { e.selling = S.dayNo + IV.estate.sellDays; ok = true; toast(T.INVEST.lines.selling); } }
    if (!ok) return;
    sfx(a === 'sell' || a === 'estate-sell' ? 'coin' : 'good');
    save(); hud(); invest(); checkRoad();
  }

  function roadSheet() {
    sheet(`
      <h3>퇴사 로드맵</h3>
      <p class="muted">차례대로 하나씩 넘는다. 넘을 때마다 결재 도장과 작은 보상, 새 기능이 열린다.</p>
      <ol class="road">${T.ROADMAP.map((r) => {
        const done = road(r.id), cur = roadNext() === r;
        return `<li class="${done ? 'done' : cur ? 'cur' : ''}"><b>${esc(r.title)}</b><span>${esc(r.desc)}</span>${r.unlock ? `<small>${esc(r.unlock.replace('열렸다.', '열린다'))}</small>` : ''}${cur ? `<span class="jbar"><i style="width:${Math.floor(clamp(roadPct(r.id), 0, 1) * 100)}%"></i></span>` : ''}</li>`;
      }).join('')}</ol>
      <button class="btn primary" data-act="close">닫기</button>`);
  }

  // ───────── 엔딩 영상 ─────────
  // 컷을 차례로 보여 준다. 화면을 누르면 다음 컷, "건너뛰기"는 끝으로.
  let MV = null;
  function movieText(t) {
    const v = S.view;
    return fmt(t).replace(/\{직급\}/g, C.ranks[S.rank].name).replace(/\{출근\}/g, v.days || S.dayNo + 1)
      .replace(/\{순자산\}/g, man(netWorth())).replace(/\{원룸\}/g, S.inv.estates.length).replace(/\{차\}/g, carOf() ? carOf().name : '차');
  }
  function movieCuts(v) {
    const CI = T.CINEMA, e = endingOf(v);
    const cuts = [];
    if (v.id === 'stay') {
      CI.stay.forEach((sc, i) => cuts.push({ scene: sc, text: e.body[i] || '' }));
      cuts.push({ scene: { scene: 'restaurant' }, title: e.title, text: e.line });
      const recent = S.moments.slice(-3).map((m) => m.t).join(', ');
      if (recent) cuts.push({ scene: { scene: 'street', phase: 'evening' }, text: `요즘의 좋은 순간: ${recent}.` });
      cuts.push({ scene: { scene: 'beach', sunset: true }, text: CI.persona.people });
    } else if (v.id === 'rehire') {
      const r = v.reason === 'burnout' || v.reason === 'fired' ? v.reason : 'angry';
      const first = r === 'burnout' ? e.burnoutLine : r === 'fired' ? e.firedLine : e.line;
      CI.fail[r].forEach((sc, i) => cuts.push({ scene: sc, text: i ? '상자 하나 들고 나왔다. 꿈은 아직 상자 안에 있다.' : first }));
      CI.fail.after.forEach((sc, i) => cuts.push({ scene: sc, text: e.body[i] || '' }));
      cuts.push({ scene: { scene: 'elevator', who: 'boss' }, title: e.title, text: '실패 퇴사. 꿈 도감에는 남지 않는다.' });
    } else {
      CI.intro.forEach((c) => cuts.push({ scene: c.scene, text: c.text }));
      const sc = CI.dreams[v.dream] || CI.dreams.custom;
      e.body.forEach((line, i) => cuts.push({ scene: sc[i] || sc[sc.length - 1], text: line }));
      cuts.push({ scene: { scene: e.scene === 'office' ? 'elevator' : e.scene, sunset: true, mode: e.scene === 'home' ? 'rest' : undefined, cafe: v.dream === 'cafe' }, title: e.title, text: e.line });
      const xx = { rank: S.rank, car: !!S.car, estates: S.inv.estates.length, collapse: S.stats.collapse, housing: S.housing, themeBest: S.stats.themeBest, moments: S.moments.length };
      CI.epilogues.filter((ep) => ep.when(S, xx)).slice(0, 2).forEach((ep) => cuts.push({ scene: ep.scene, text: ep.text }));
      const { r } = reportData();
      cuts.push({ scene: { scene: 'beach', sunset: true }, text: CI.persona[r.persona] || CI.persona.balanced });
    }
    cuts.push({ credits: true, scene: { scene: 'fireworks' } });
    cuts.push({ record: true, scene: { scene: 'fireworks' } });
    cuts.push({ end: true, scene: { scene: v.id === 'rehire' ? 'elevator' : 'fireworks', who: v.id === 'rehire' ? 'boss' : undefined }, title: v.id === 'rehire' ? CI.failEnd : CI.theEnd });
    return cuts;
  }
  function movie() {
    const v = S.view;
    if (!v || v.type !== 'ending') return;
    const el = $('#movie');
    if (!el) return;
    MV = { cuts: movieCuts(v), i: -1, frame: 0, timer: 0, typer: 0, ctx: $('#mv-canvas').getContext('2d') };
    MV.ctx.imageSmoothingEnabled = false;
    el.hidden = false;
    document.body.classList.add('movie-on');
    if (T.Sound) T.Sound.music(v.id === 'rehire' ? 'fail' : 'dream');
    clearInterval(MV.anim);
    MV.anim = setInterval(() => { if (!MV) return; MV.frame++; drawCut(); }, 170);
    nextCut();
  }
  function drawCut() {
    const c = MV.cuts[MV.i];
    if (c) T.Sprites.draw(MV.ctx, Object.assign({ frame: MV.frame }, c.scene));
  }
  function nextCut() {
    if (!MV) return;
    clearTimeout(MV.timer); clearInterval(MV.typer);
    MV.i++;
    if (MV.i >= MV.cuts.length) return endMovie();
    const c = MV.cuts[MV.i], v = S.view;
    MV.frame = 0;
    drawCut();
    const tx = $('#mv-text'), ti = $('#mv-title'), box = $('#mv-credits');
    box.hidden = true; box.innerHTML = ''; ti.textContent = ''; tx.textContent = '';
    let ms = 3200;
    if (c.credits) {
      box.hidden = false;
      box.innerHTML = `<div class="roll">${T.CINEMA.credits.map(([k, val]) => `<p><span>${esc(k)}</span><b>${esc(movieText(val))}</b></p>`).join('')}</div>`;
      ms = 6500;
    } else if (c.record) {
      box.hidden = false;
      const ach = (v.newAch || []).map((id) => T.ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean);
      box.innerHTML = `
        <div class="rec">
          ${v.grade ? `<div class="grade g${v.grade}">${v.grade}</div>` : ''}
          <p><span>꿈</span><b>${esc(v.id === 'rehire' ? '실패 퇴사' : v.id === 'stay' ? '오늘도 다닐게요' : v.dreamName)}</b></p>
          <p><span>출근</span><b>${v.days}일</b></p>
          <p><span>시작 난이도</span><b>${esc((T.LIFE.difficulty[S.diffLv] || T.LIFE.difficulty[1]).stars + ' ' + (T.LIFE.difficulty[S.diffLv] || T.LIFE.difficulty[1]).name)}</b></p>
          <p><span>순자산</span><b>${man(netWorth())}</b></p>
          <p><span>좋은 순간</span><b>${S.moments.length}번</b></p>
          ${v.record && v.record.newBest ? '<p class="new">최단 기록 경신!</p>' : ''}
          ${ach.map((a) => `<p class="new">업적 달성 · ${esc(a.name)}</p>`).join('')}
        </div>`;
      ms = 5000 + ach.length * 600;
      if (v.grade || ach.length) sfx('level');
    } else {
      if (c.title) { ti.textContent = c.title; sfx('stamp'); }
      const full = c.text ? movieText(c.text) : '';
      let n = 0;
      MV.typer = setInterval(() => { n += 2; tx.textContent = full.slice(0, n); if (n >= full.length) clearInterval(MV.typer); }, 45);
      ms = Math.max(c.end ? 4000 : 3000, 1400 + full.length * 70);
    }
    $('#mv-skip').textContent = MV.i === MV.cuts.length - 1 ? '닫기 ›' : '건너뛰기 ›';
    MV.timer = setTimeout(nextCut, ms);
  }
  function endMovie() {
    if (!MV) return;
    clearTimeout(MV.timer); clearInterval(MV.typer); clearInterval(MV.anim);
    MV = null;
    $('#movie').hidden = true;
    document.body.classList.remove('movie-on');
    if (T.Sound) T.Sound.stopMusic();
    if (S.view.type === 'ending') { S.view.played = true; save(); }
  }

  // ───────── 도감·업적 ─────────
  function dexSheet() {
    const got = M.endings || {}, rec = M.records || {}, ach = M.ach || {};
    sheet(`
      <h3>엔딩 도감</h3>
      <p class="muted">꿈마다 최고 등급과 최단 출근 일수가 남는다. 등급은 출근 일수와 시작 난이도로 정해진다. "오늘도 다닐게요"는 돈이 아니라 좋은 순간으로 연다.</p>
      <ul class="checks">${T.DREAMS.map((d) => {
        const r = rec[d.id];
        return `<li><span>${got['dream:' + d.id] ? esc(d.name) : '???'}</span><b>${r ? r.best + '일' : '-'}</b><em class="${r && r.grade === 'S' ? 'good' : ''}">${r && r.grade ? r.grade : r ? '기록' : '미달성'}</em></li>`;
      }).join('')}
        <li><span>${got.stay ? '오늘도 다닐게요' : '???'}</span><b>${got.stay ? got.stay + '번' : '-'}</b><em class="${got.stay ? 'good' : ''}">${got.stay ? '달성' : '미달성'}</em></li></ul>
      <h3>업적 ${T.ACHIEVEMENTS.filter((a) => ach[a.id]).length}/${T.ACHIEVEMENTS.length}</h3>
      <ul class="achs">${T.ACHIEVEMENTS.map((a) => `<li class="${ach[a.id] ? 'got' : ''}"><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></li>`).join('')}</ul>
      <p class="muted">실패 퇴사 ${got.rehire || 0}번</p>
      <button class="btn primary" data-act="close">닫기</button>`);
  }

  // ───────── 공유 ─────────
  async function share() {
    const e = endingOf(S.view);
    const url = /^https?:/.test(location.href) && !/claude|localhost|127\./.test(location.host) ? location.href.split('#')[0] : C.shareUrl;
    const text = S.view.id === 'stay'
      ? `나는 ${company()} 입사 ${S.month}개월째, 사직서를 찢었다. 「${e.title}」 · 좋은 순간 ${S.moments.length}번\n#퇴사할게요 #오늘도버텼다`
      : `나는 ${company()} 입사 ${S.month}개월 만에 「${e.title}」으로 퇴사했다.\n#퇴사할게요 #오늘도버텼다`;
    try { if (navigator.share) { await navigator.share({ title: '퇴사할게요', text, url }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + '\n' + url); toast('결과를 복사했어. 붙여 넣기만 하면 돼.'); return; } catch (err) { /* 아래로 */ }
    sheet(`<h3>결과 공유하기</h3><p class="muted">아래 글을 길게 눌러 복사해 줘.</p><textarea id="share-text" readonly>${esc(text + '\n' + url)}</textarea><button class="btn primary" data-act="close">닫기</button>`);
  }

  // ───────── 공통 UI ─────────
  const sheetQueue = [];
  function sheet(html, opt) {
    if (opt && opt.queue && !$('#overlay').hidden) { sheetQueue.push(html); return; }
    $('#sheet').innerHTML = html; $('#overlay').hidden = false; $('#sheet').scrollTop = 0;
  }
  function closeSheet() {
    if (sheetQueue.length) { sheet(sheetQueue.shift()); return; }
    $('#overlay').hidden = true;
  }
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
    if (a === 'start') { if (!M.profile) M.profile = Object.assign({}, C.defaultProfile); saveMeta(); newGame(); render(); checkAttendance(); }
    else if (a === 'setup') { S.view = { type: 'setup' }; render(); }
    else if (a === 'setup-go') { const p = readProfile(); if (!p) return; M.profile = p; saveMeta(); newGame(); render(); checkAttendance(); }
    else if (a === 'report') { if (S && !['title', 'setup'].includes(S.view.type)) report(); }
    else if (a === 'report-share') shareReport();
    else if (a === 'profile') editProfile();
    else if (a === 'profile-save') { const p = readProfile(); if (!p) return; M.profile = p; saveMeta(); closeSheet(); render(); toast('저장했어. 회사·부서는 바로 바뀌었어.'); }
    else if (a === 'choose') choose(+b.dataset.i);
    else if (a === 'next') next();
    else if (a === 'evening') evening(b.dataset.k);
    else if (a === 'work') work(b.dataset.id);
    else if (a === 'work-day') { startDay(); save(); render(); }
    else if (a === 'back') { S.view = { type: 'evening' }; save(); render(); }
    else if (a === 'resign') resign();
    else if (a === 'end') ending(b.dataset.id, b.dataset.r);
    else if (a === 'angry') angry();
    else if (a === 'movie') movie();
    else if (a === 'dex') dexSheet();
    else if (a === 'mv-skip') { if (MV && MV.i < MV.cuts.length - 1) { MV.i = MV.cuts.length - 2; nextCut(); } else endMovie(); }
    else if (a === 'mv-next') nextCut();
    else if (a === 'weekend') weekend(b.dataset.id);
    else if (a === 'car') carSheet();
    else if (a === 'buy-car') buyCar(b.dataset.id);
    else if (a === 'invest') invest();
    else if (a === 'road') roadSheet();
    else if (['buy', 'sell', 'estate-buy', 'estate-sell'].includes(a)) investAct(a, b);
    else if (a === 'close') closeSheet();
    else if (a === 'share') share();
    else if (a === 'sound') { M.sound = M.sound === false; T.Sound.on = M.sound; saveMeta(); hud(); if (M.sound) sfx('good'); }
    else if (a === 'restart') { closeSheet(); newGame(); S.view = { type: 'title' }; render(); }
  }

  function onKey(e) {
    if (MV) { if (e.key === 'Escape') endMovie(); else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextCut(); } return; }
    if (!$('#overlay').hidden) { if (e.key === 'Escape') closeSheet(); return; }
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    const v = S.view.type;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 3) {
      const btn = document.querySelectorAll('#card .choice, #card .job')[n - 1];
      if (btn) btn.click();
    } else if ((e.key === 'Enter' || e.key === ' ') && ['result', 'payday', 'title', 'gate', 'daylog'].includes(v)) {
      e.preventDefault();
      const btn = $('#card .btn.primary'); if (btn) btn.click();
    }
  }

  function dayKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function today() { return dayKey(new Date()); }

  function boot() {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) document.documentElement.classList.add('standalone');
    M = restore(C.metaKey) || { endings: {}, runs: 0 };
    if (T.Sound) T.Sound.on = M.sound !== false;
    S = restore(C.saveKey);
    const canvas = $('#scene');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('change', (e) => {
      if (e.target.id === 'p-dept') $('#p-deptname').hidden = e.target.value !== 'etc';
      if (e.target.id === 'p-housing') $('#p-housing-desc').textContent = T.LIFE.housing.find((h) => h.id === e.target.value).desc;
      if (e.target.id === 'p-commute') $('#p-commute-desc').textContent = T.LIFE.commutes.find((c) => c.id === e.target.value).desc;
      if (e.target.id === 'p-dream') {
        $('#p-dream-desc').textContent = dreamDesc(DREAM[e.target.value] || DREAM.rest);
        $('.form-custom').hidden = e.target.value !== 'custom';
      }
    });
    // 입사 서류를 고칠 때마다 시작 난이도를 다시 계산한다
    const redraw = (e) => { if (/^p-(years|rank|salary|expense|housing|housingcost|commute)$/.test(e.target.id) && $('#p-diff')) $('#p-diff').innerHTML = diffLine(formDraft()); };
    document.addEventListener('input', redraw);
    document.addEventListener('change', redraw);
    document.addEventListener('pointerdown', () => T.Sound && T.Sound.unlock(), { once: true });
    if (!S || S.v !== 1) {
      newGame();
      S.view = { type: 'title' };
      render();
      checkAttendance();
    } else {
      migrate(S);
      render();
      if (S.view.type === 'ending' && S.view.played === false) movie();
      checkAttendance();
      offline();
    }
    setInterval(() => { if (document.hidden) return; frame++; paint(); }, 170);
    setInterval(tick, 1000);
    setInterval(save, 10000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { checkAttendance(); offline(); } });
    window.addEventListener('pagehide', save);
  }

  // 테스트용 (콘솔에서 TT.state() 등)
  window.TT = { state: () => S, meta: () => M, events: EV, render: () => render(), pct: () => goalPct(), ready: () => dreamReady(), stay: () => stayReady(), moments: () => S.moments.length, net: () => netWorth(), emergency: () => emergencyNeed(), quote: () => estateQuote(), buy: (id, amt) => { const r = buyStock(id, amt); save(); return r; }, sell: (id, part) => sellStock(id, part), buyEstate: () => buyEstate(), open: () => [stocksOpen(), estateOpen()], road: () => S.inv.road.slice(), reset: () => { try { localStorage.removeItem(C.saveKey); } catch (e) { /* 무시 */ } location.reload(); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
