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

  // notes: [[주파수, 길이(초)], ...] 를 차례로 낸다. keep에 넘기면 만든 소리를 모아 둔다 (엔딩 음악을 멈출 때 쓴다)
  function seq(notes, type, vol, keep, delay) {
    if (!on || !ready()) return;
    let t = ac.currentTime + 0.01 + (delay || 0);
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
        if (keep) keep.push(o);
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

  // 엔딩 음악: 멜로디(사각파) + 베이스(삼각파). 한 번 쭉 흐르고, 영상을 닫으면 멈춘다.
  const N = { C3: 131, D3: 147, E3: 165, F3: 175, G3: 196, A3: 220, B3: 247, C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, Eb4: 311, Ab3: 208, Bb3: 233, Eb3: 156 };
  const q = 0.28;
  const tune = (s) => s.split(' ').map((x) => { const [n, l] = x.split(':'); return [n === '-' ? 0 : N[n], q * Number(l || 1)]; });
  const TRACKS = {
    dream: {
      lead: tune('C5 E5 G5:2 E5 G5 C5:2 - A4 C5 F5:2 E5 D5 C5:2 - G4 B4 D5:2 B4 D5 G5:2 F5 E5 D5 C5 D5:2 E5:4 C5 E5 G5:2 A5 G5 E5:2 F5 E5 D5 C5 A4:2 G4 C5 E5 G5:2 F5 D5 B4 G4 C5:6'),
      bass: tune('C3:4 C3:4 F3:4 F3:4 G3:4 G3:4 G3:4 C3:4 C3:4 A3:4 F3:4 G3:4 C3:8'),
    },
    fail: {
      lead: tune('C5:2 Eb4:2 G4:2 C5 - Bb3:2 D4:2 F4:2 Ab3:2 C4:2 Eb4:2 G4:4 - C5:2 Eb4:2 G4:2 F4 Eb4 D4:2 B3:2 C4:6'),
      bass: tune('C3:6 Bb3:6 Ab3:6 G3:6 C3:6 G3:6 C3:6'),
    },
  };
  let playing = [];
  function music(name) {
    stopMusic();
    const tr = TRACKS[name];
    if (!tr) return;
    seq(tr.lead, 'square', 0.035, playing);
    seq(tr.bass, 'triangle', 0.06, playing);
  }
  function stopMusic() {
    playing.forEach((o) => { try { o.stop(); } catch (e) { /* 이미 끝남 */ } });
    playing = [];
  }

  T.Sound = {
    music(name) { try { music(name); } catch (e) { /* 소리는 없어도 게임은 계속 */ } },
    stopMusic,
    play(name) { try { if (SFX[name]) SFX[name](); } catch (e) { /* 소리는 없어도 게임은 계속 */ } },
    unlock: ready,
    get on() { return on; },
    set on(v) { on = !!v; },
  };
})();
