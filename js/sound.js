// 효과음. 파일 없이 브라우저에서 8비트 소리를 바로 만든다(Web Audio).
// 아이폰은 사용자가 화면을 한 번 눌러야 소리가 나기 때문에, 첫 터치 때 준비한다.
(function () {
  let ac = null;
  let on = true;

  function ready() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ac = new AC(); } catch (e) { ac = null; }
    return ac;
  }

  // notes: [[주파수, 길이(초)], ...] 를 차례로 낸다
  function seq(notes, type, vol) {
    if (!on || !ready()) return;
    let t = ac.currentTime + 0.01;
    for (const [freq, dur] of notes) {
      if (freq) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = type || 'square';
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(vol || 0.06, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + dur + 0.02);
      }
      t += dur;
    }
  }

  function slide(from, to, dur, type) {
    if (!on || !ready()) return;
    const t = ac.currentTime + 0.01;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  const SFX = {
    tap:     () => seq([[880, 0.03]], 'square', 0.04),
    good:    () => seq([[523, 0.07], [659, 0.07], [784, 0.12]]),
    bad:     () => seq([[392, 0.09], [330, 0.09], [262, 0.18]], 'triangle', 0.09),
    twist:   () => slide(660, 120, 0.45, 'sawtooth'),
    level:   () => seq([[523, 0.06], [659, 0.06], [784, 0.06], [1047, 0.2]]),
    coin:    () => seq([[988, 0.06], [1319, 0.22]]),
    collapse:() => seq([[440, 0.12], [0, 0.04], [415, 0.12], [0, 0.04], [392, 0.12], [0, 0.04], [370, 0.4]], 'triangle', 0.1),
    stamp:   () => { seq([[110, 0.12]], 'square', 0.12); },
    ending:  () => seq([[523, 0.1], [523, 0.1], [523, 0.1], [659, 0.3], [784, 0.15], [659, 0.15], [1047, 0.5]]),
    gate:    () => seq([[659, 0.1], [523, 0.1], [392, 0.25]], 'triangle', 0.08),
    phone:   () => seq([[1200, 0.05], [0, 0.03], [1200, 0.05], [0, 0.03], [1200, 0.05]], 'square', 0.04),
  };

  T.Sound = {
    play(name) { try { if (SFX[name]) SFX[name](); } catch (e) { /* 소리는 없어도 게임은 계속 */ } },
    unlock: ready,
    get on() { return on; },
    set on(v) { on = !!v; },
  };
})();
