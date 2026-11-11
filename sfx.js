// PROTOTYPE - NOT FOR PRODUCTION
// Question: o silêncio e o luto chegam de verdade em quem joga, e a luta punitiva dá vontade de tentar de novo?
// Date: 2026-11-10
'use strict';
// O som: tudo gerado por código (Web Audio). Vento, um zumbido grave, notas esparsas, e os efeitos.

const SND = { ready: false, ok: false, wind: 0, note: 2, pulse: 0 };
const ar = prng(4242); // aleatório só do som

function soundInit() {
  if (SND.ready || !audio) return;
  SND.ready = true;
  try {
    const ac = audio.ac;
    SND.bus = ac.createGain(); SND.bus.gain.value = 0.9; SND.bus.connect(audio.out);
    SND.music = ac.createGain(); SND.music.gain.value = tune.music_volume; SND.music.connect(audio.out);
    // eco longo: dá espaço e distância
    SND.rev = ac.createGain(); SND.rev.gain.value = 1;
    const d1 = ac.createDelay(1), d2 = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
    d1.delayTime.value = 0.31; d2.delayTime.value = 0.47; fb.gain.value = 0.52; lp.type = 'lowpass'; lp.frequency.value = 1700; wet.gain.value = 0.55;
    SND.rev.connect(d1); d1.connect(d2); d2.connect(lp); lp.connect(fb); fb.connect(d1); d1.connect(wet); d2.connect(wet); wet.connect(audio.out);
    // ruído para vento, golpes e respiração
    const len = Math.floor(ac.sampleRate * 2), buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = ar() * 2 - 1;
    SND.noise = buf;
    const ws = ac.createBufferSource(); ws.buffer = buf; ws.loop = true;
    SND.windF = ac.createBiquadFilter(); SND.windF.type = 'bandpass'; SND.windF.frequency.value = 380; SND.windF.Q.value = 0.7;
    SND.windG = ac.createGain(); SND.windG.gain.value = 0.11;
    ws.connect(SND.windF); SND.windF.connect(SND.windG); SND.windG.connect(SND.music); ws.start();
    // zumbido grave
    SND.droneG = ac.createGain(); SND.droneG.gain.value = 0.085;
    const dl = ac.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 180; dl.connect(SND.droneG); SND.droneG.connect(SND.music);
    for (const f of [55, 55.4, 82.5]) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(dl); o.start(); }
    SND.ok = true;
  } catch (e) { SND.ok = false; }
}
addEventListener('tune', () => { if (SND.ok) SND.music.gain.value = tune.music_volume; });

function sTone(freq, dur, type, vol, slide, dest, attack) {
  if (!SND.ok || muted) return;
  const ac = audio.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || SND.bus); o.start(t); o.stop(t + dur + 0.05);
  return g;
}
function sNoise(dur, vol, ftype, f0, f1, q, dest, attack) {
  if (!SND.ok || muted) return;
  const ac = audio.ac, t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = SND.noise; f.type = ftype; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 0.8;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest || SND.bus); s.start(t, ar() * 1.5, dur + 0.1);
  return g;
}
function pluck(freq, vol, dur) { // uma nota que demora a morrer
  if (!SND.ok || muted) return;
  const a = sTone(freq, dur || 3.6, 'sine', vol, 0, SND.music, 0.02), b = sTone(freq * 2.003, (dur || 3.6) * 0.6, 'triangle', vol * 0.22, 0, SND.music, 0.02);
  if (a) a.connect(SND.rev); if (b) b.connect(SND.rev);
}

function sfx(name) {
  if (!SND.ok || muted) return;
  switch (name) {
    case 'jump': sNoise(0.12, 0.05, 'bandpass', 500, 1100, 1); break;
    case 'land': sNoise(0.1, 0.09, 'lowpass', 300, 90, 0.7); break;
    case 'step': sNoise(0.05, 0.03, 'lowpass', 700, 250, 0.7); break;
    case 'slash': sNoise(0.16, 0.16, 'bandpass', 2600, 700, 1.4); break;
    case 'hit': sNoise(0.1, 0.24, 'bandpass', 900, 300, 1.2); sTone(150, 0.14, 'triangle', 0.22, 60); break;
    case 'kill': sNoise(0.5, 0.2, 'lowpass', 1400, 120, 0.8); sTone(110, 0.5, 'sine', 0.2, 40); break;
    case 'clank': sTone(520, 0.08, 'square', 0.06, 300); sNoise(0.06, 0.1, 'highpass', 2500, 0, 1); break;
    case 'hurt': sTone(220, 0.34, 'sawtooth', 0.14, 55); sNoise(0.25, 0.22, 'lowpass', 1200, 150, 0.8); break;
    case 'dash': sNoise(0.24, 0.2, 'bandpass', 500, 2600, 0.9); break;
    case 'heal': { const g = sTone(330, 0.9, 'sine', 0.12, 660, SND.bus, 0.3); if (g) g.connect(SND.rev); sTone(495, 0.9, 'sine', 0.06, 990, SND.rev, 0.4); break; }
    case 'broto': pluck(587.33, 0.16, 3); pluck(880, 0.1, 3.4); pluck(1174.66, 0.05, 3.6); break;
    case 'pickup': pluck(392, 0.14, 2.5); pluck(587.33, 0.12, 3); pluck(783.99, 0.09, 3.4); break;
    case 'power': pluck(146.83, 0.2, 4); pluck(220, 0.16, 4); pluck(349.23, 0.14, 4.4); pluck(587.33, 0.12, 5); break;
    case 'level': pluck(293.66, 0.12, 3); pluck(440, 0.1, 3.4); break;
    case 'tele': sTone(90, 0.5, 'sawtooth', 0.09, 180); break;
    case 'slam': sNoise(0.4, 0.34, 'lowpass', 500, 60, 0.7); sTone(70, 0.45, 'sine', 0.34, 30); break;
    case 'thorn': sNoise(0.12, 0.1, 'bandpass', 3000, 1500, 2); break;
    case 'roar': { const g = sTone(72, 1.3, 'sawtooth', 0.2, 48, SND.bus, 0.15); if (g) g.connect(SND.rev); sNoise(1.2, 0.2, 'bandpass', 260, 120, 1.4, SND.bus, 0.2); break; }
    case 'wail': { const g = sTone(392, 1.6, 'sine', 0.12, 277, SND.bus, 0.3); if (g) g.connect(SND.rev); sTone(587, 1.6, 'sine', 0.06, 415, SND.rev, 0.4); break; }
    case 'pillar': sNoise(0.5, 0.26, 'bandpass', 300, 1800, 0.8); sTone(60, 0.5, 'sine', 0.26, 34); break;
    case 'voice': for (let i = 0; i < 4; i++) { const f = 70 + ar() * 46; const g = sTone(f, 0.24 + ar() * 0.2, 'sawtooth', 0.0001, f * (0.8 + ar() * 0.35), SND.rev, 0.05); if (g) { const t = audio.ac.currentTime + i * 0.19; g.gain.cancelScheduledValues(0); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); } } break;
    case 'death': { const g = sNoise(2.4, 0.3, 'bandpass', 180, 2400, 0.6, SND.bus, 1.6); if (g) g.connect(SND.rev); sTone(55, 2.6, 'sine', 0.36, 27, SND.bus, 0.4); sTone(277.18, 2.4, 'sine', 0.07, 138, SND.rev, 1.2); break; }
    case 'wake': sNoise(0.5, 0.2, 'bandpass', 500, 1500, 1.2, SND.bus, 0.3); sNoise(0.7, 0.12, 'bandpass', 1300, 400, 1.2, SND.bus, 0.45); break;
    case 'break': sNoise(0.35, 0.3, 'lowpass', 1800, 200, 0.8); sTone(180, 0.2, 'square', 0.08, 70); break;
    case 'gate': sNoise(0.6, 0.2, 'lowpass', 400, 90, 0.8); sTone(98, 0.6, 'triangle', 0.16, 65); break;
    case 'end': pluck(146.83, 0.2, 6); pluck(220, 0.16, 6); pluck(293.66, 0.14, 6); pluck(369.99, 0.12, 6); pluck(440, 0.1, 7); break;
  }
}

// As notas: ré menor, poucas, com muito silêncio entre elas. Na luta, um pulso grave por baixo.
const SCALE = [146.83, 174.61, 196, 220, 261.63, 293.66, 349.23, 440, 523.25];
const SCALE_DARK = [138.59, 146.83, 174.61, 207.65, 220, 277.18, 293.66, 349.23, 415.3];
function musicStep(dt, mood, fight) {
  if (!SND.ok) return;
  SND.wind -= dt;
  if (SND.wind <= 0) { // o vento respira
    SND.wind = 1.5 + ar() * 3; const t = audio.ac.currentTime;
    SND.windF.frequency.setTargetAtTime(240 + ar() * 520, t, 1.4); SND.windG.gain.setTargetAtTime(muted ? 0 : 0.05 + ar() * 0.12, t, 1.2);
    SND.droneG.gain.setTargetAtTime(fight ? 0.13 : 0.085, t, 1);
  }
  SND.note -= dt;
  if (SND.note <= 0) {
    const dark = mood === 'limiar' || mood === 'heart' || fight, sc = dark ? SCALE_DARK : SCALE, i = Math.floor(ar() * sc.length);
    pluck(sc[i], 0.06 + ar() * 0.05);
    if (ar() < 0.4) pluck(sc[(i + 2) % sc.length] * (ar() < 0.3 ? 0.5 : 1), 0.04 + ar() * 0.03);
    SND.note = fight ? 1.1 + ar() * 1.6 : 2.6 + ar() * 4.4;
  }
  if (fight) { SND.pulse -= dt; if (SND.pulse <= 0) { SND.pulse = 0.86; sTone(49, 0.5, 'sine', 0.2, 38, SND.music, 0.02); } }
}
