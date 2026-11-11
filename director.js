// PROTOTYPE - NOT FOR PRODUCTION
// Question: o silêncio e o luto chegam de verdade em quem joga, e a luta punitiva dá vontade de tentar de novo?
// Date: 2026-11-10
'use strict';
// O Sono: o diretor. Sem modelo e sem rede. Ele acompanha o que você faz (onde morre, por onde
// passa, quanto demora, que golpe usa mais) e, ao trocar de sala ou entre uma morte e outra,
// mexe no mundo: põe um inimigo onde não havia, manda atrás quem você deixou vivo, troca os
// troncos do lago de lugar, faz nascer espinhos, fecha o atalho e abre uma ponte. E sussurra
// frases montadas na hora, de pedaços, a partir do que viu. Começa a agir depois da primeira morte.
// O que ele nunca faz: mexer nas salas dos guardiões, nas salas de broto calmo (O Despertar, O Limiar)
// ou deixar um caminho sem saída. Toda mudança de chão sai de um conjunto conferido à mão.

// ---- Dados: onde ele pode pôr coisas -----------------------------------------------------
const DIR_SANCT = { R1: 1, R7: 1 };
// Lugares para um inimigo a mais: ground = x e a linha do chão; air = onde uma mariposa paira.
const DIR_SLOTS = {
  R2: { ground: [[18, 14], [48, 15], [56, 15]], air: [[20, 9], [42, 9], [58, 8]] },
  R3: { ground: [[10, 14], [27, 13], [42, 14]], air: [[30, 8], [47, 8]] },
  R4: { ground: [[24, 40], [22, 35], [5, 23]], air: [[11, 31], [24, 21], [16, 6]] },
  R6: { ground: [[24, 15], [31, 12], [46, 12], [58, 15], [70, 15]], air: [[13, 10], [38, 7], [53, 6], [64, 9]] },
  R9: { ground: [[8, 36], [22, 36], [6, 32], [24, 28], [6, 24], [24, 20], [6, 16], [24, 12]], air: [[16, 31], [16, 23], [16, 15]] },
  R10: { ground: [[10, 15], [22, 15], [74, 15]], air: [[17, 9], [40, 8], [56, 9], [72, 9]] },
};
// Espinhos que nascem: dois blocos de largura, em chão plano, longe das portas. [x do bloco da esquerda, linha].
const DIR_THORNS = { R2: [[22, 13], [46, 14]], R3: [[40, 13], [8, 13]], R6: [[50, 11], [61, 14]], R10: [[6, 14], [78, 14]] };
const DIR_LOC = { R1: 'no despertar', R2: 'na ravina', R3: 'nas raízes baixas', R4: 'no tronco oco', R5: 'na clareira', R6: 'nas copas mortas',
  R7: 'no limiar', R8: 'no coração queimado', R9: 'na garganta', R10: 'no lago', R11: 'no ninho' };
const DIR_INI = { carcaca: 'a carcaça', mariposa: 'a mariposa', espinheiro: 'o espinheiro', vigia: 'o vigia', enlutada: 'a enlutada', rainha: 'a rainha', floresta: 'a floresta' };
const DIR_NUM = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'];
for (const id of Object.keys(ROOMS)) ROOMS[id].g0 = ROOMS[id].g.slice(); // o mundo como foi feito, para desfazer o que ele mexer

// ---- O que ele diz: pedaços. abertura + corpo + fecho, escolhidos na hora ------------------
const SONO = {
  ab: ['pequena brasa, ', 'escuta: ', 'eu vi. ', 'sabe, ', 'olha só: ', 'brasa, ', 'ei. '],
  fe: [' eu conto.', ' eu lembro.', ' continue.', ' eu espero.', ' não pare por mim.', ' devagar.', ' eu fico olhando.', ' durma, se quiser.', ' é só o que eu faço.', ' depois eu digo mais.'],
  solto: { idle: 1, low: 1, heal: 1, streak: 1, roomdeaths: 1, fav_dash: 1, fav_down: 1, fav_up: 1, fav_side: 1, noheal: 1, slow: 1, fast: 1, back: 1, deaths: 1, time: 1, ecos: 1, calm: 1 },
  b: {
    wake1: ['então você acorda.', 'você voltou. as outras não voltavam.', 'apagou e acendeu de novo. que coisa.'],
    idle: ['parada assim, você parece as outras cinzas.', 'eu também sei esperar.', 'descanse. eu não tenho pressa.', 'o fogo também parou assim, um pouco antes de acabar.', 'está ouvindo? sou eu, respirando.'],
    low: ['uma brasa só. dá para ouvir ela estalar.', 'tão pouco calor. eu chego mais perto.', 'falta tão pouco para você dormir de novo.', 'não cure agora. deixa eu ver como termina.'],
    heal: ['você se acende de novo. quantas vezes ainda?', 'esse calor não era seu. era deles.', 'curou. eu desfaço depois.'],
    streak: ['{n} seguidas sem um arranhão. vou mexer em alguma coisa.', 'você está ficando boa nisso. eu não gosto.', 'limpo demais. eu deixo mais difícil.'],
    roomdeaths: ['você já apagou {n} vezes {loc}.', '{loc} o chão já tem a sua forma.', '{n} vezes {loc}. eu guardei cada uma.'],
    spot: ['foi aqui.', 'aqui você apagou. lembra?', 'o calor que você largou aqui ainda estava morno. pegue.'],
    fav_dash: ['você corre mais do que luta.', 'sempre o ímpeto. sempre para frente, sem olhar.'],
    fav_down: ['você gosta de cair em cima deles.', 'de cima para baixo, sempre. eles vão aprender a olhar para o alto.'],
    fav_up: ['você corta para cima como quem pede ajuda.', 'tanto golpe para o alto. lá em cima só tem cinza.'],
    fav_side: ['sempre o mesmo corte, da mesma altura.', 'o mesmo golpe, {n} vezes. eu já sei de cor.'],
    noheal: ['você guarda o calor e morre com ele guardado.', 'tanto calor no bolso. para quê?'],
    slow: ['faz tempo que você está {loc}. perdeu alguma coisa?', 'você demora {loc}. eu gosto de ver você procurar.'],
    fast: ['passou correndo. nem viu o que eu deixei.', 'com pressa? eu chego antes.'],
    back: ['voltou. eu também voltaria.', 'esqueceu alguma coisa lá atrás?'],
    nemesis: ['{ini} te apagou {n} vezes. eu mandei mais.', '{ini} gosta de você. {n} vezes já. trouxe companhia.'],
    deaths: ['{n} vezes você acordou. eu contei todas.', '{n} mortes. nenhuma ficou.'],
    time: ['faz {n} minutos que você está acordada. é mais do que elas aguentaram.', '{n} minutos. a brasa ainda não cansou?'],
    ecos: ['você escuta os mortos. eles falam de mim?', 'ela me chamou de sono. antes eu não tinha nome.', 'não acredite em tudo o que a cinza diz.'],
    calm: ['eu vim antes do fogo.', 'ela queimou tudo para eu não passar. e você me carrega aí dentro.', 'toda vez que você apaga, eu chego mais perto da brasa.', 'não sou eu que te mato. eu só espero.',
      'a floresta era mais bonita dormindo.', 'quando você dorme, eu arrumo as coisas do meu jeito.', 'eu não tenho mãos. uso as deles.', 'você é o último lugar quente daqui.'],
    sanct: ['aqui eu só olho.', 'perto do broto eu não chego. ainda.'],
    g_extra: ['esse não estava aqui. eu pus.', 'trouxe companhia para você.', 'achei que estava vazio demais.'],
    g_thorns: ['espinhos novos. cresceram enquanto você dormia.', 'cuidado onde pisa. eu mudei o chão.'],
    g_thorns_off: ['tirei os espinhos. estava fácil demais para mim.', 'os espinhos se foram. eu ponho em outro lugar.'],
    g_shut: ['as raízes fecharam de novo. dê a volta.', 'fechei o seu atalho. abri outra coisa.'],
    g_lake: ['os troncos andaram enquanto você dormia.', 'o lago não é o mesmo. olhe antes de pular.'],
    g_empty: ['hoje não tem ninguém. estranhou?', 'mandei eles saírem. depois voltam. com mais.'],
    g_stalk: ['ele veio atrás de você.', 'fugir não adianta. eu abro a porta para eles.'],
    g_swap: ['troquei eles de lugar. para você não decorar.', 'não são os mesmos de antes. olhe direito.'],
    g_awake: ['eles já sabiam que você vinha. eu contei.', 'ninguém dorme aqui hoje. só você, depois.'],
    g_gift: ['um galho novo. não é pena. é curiosidade.', 'tirei um do caminho. quero ver até onde você vai.'],
    g_dark: ['apaguei um pouco a luz.', 'assim eu vejo melhor a sua brasa.'],
  },
  // ditas no pesadelo, quando quem te matou não tem nada a dizer
  morte: ['durma. eu arrumo tudo antes de você voltar.', 'cada vez que você cai, eu aprendo o caminho.', 'não foi {ini}. fui eu que deixei.', '{n} mortes. {m} delas para {ini}.', 'você apagou {loc}. de novo.', 'eu mudei uma coisa e você caiu nela.'],
};

// ---- O acaso dele: semeado pela semente do jogo e pelo que você fez; nunca o acaso solto do navegador -------
let dseed = 1;
function drng() { dseed = (dseed + 0x6D2B79F5) | 0; let t = Math.imul(dseed ^ (dseed >>> 15), dseed | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function dmix() { // a mesma partida, jogada igual, dá as mesmas mudanças; uma tecla diferente já muda tudo
  const d = state.dir, a = d.acts, s0 = Number(params.get('seed')) || CONFIG.seed;
  dseed = (Math.imul(s0, 0x9E3779B1) ^ Math.imul(d.beats + 1, 40503) ^ Math.floor(state.time * 7) ^ Math.imul(state.totalDeaths + 1, 9973) ^ Math.imul(a.side + a.up * 3 + a.down * 5 + a.dash * 7 + a.jump * 11 + a.hurt * 13, 131)) | 0;
  drng(); drng();
}
const dpick = arr => arr[Math.floor(drng() * arr.length)];

// ---- A memória dele (vai para o save) e o que ele tem na cabeça agora (não vai) ---------------
function dirNew() {
  return { awake: false, heat: 0.35, beats: 0, quiet: 1, debt: 0, changes: 0, roomDeaths: {}, roomVisits: {},
    acts: { side: 0, up: 0, down: 0, dash: 0, heal: 0, jump: 0, jump2: 0, hurt: 0, kills: 0 },
    mark: null, last: null, sRoom: '', sN: 0, thorns: {}, tAge: {}, tSeen: {}, lake: 0, shut: false, gift: {}, spare: null, ms: {}, said: [], notes: {} };
}
const DRT = {};
let DIRCTX = null; // como você entrou na sala: por uma porta, acordando, ou no começo
function dirRt() { Object.assign(DRT, { q: [], pend: [], gap: 6, min: 0, amb: 40, idle: 0, idleCd: 0, low: 0, lowCd: 0, streak: 0, cur: null, hist: [], chase: null, force: '', dread: 0, leftAlive: 0 }); }
function dirReset() { state.dir = dirNew(); if (params.get('room')) state.dir.awake = true; dirRt(); fx.sono = null; fx.dread = 0; dirApplyWorld(); }
function dirLoad(sv) {
  const d = dirNew(), s = sv.dir || {};
  for (const k of Object.keys(d)) if (s[k] !== undefined && s[k] !== null && k !== 'acts') d[k] = s[k];
  Object.assign(d.acts, s.acts || {}); d.mark = s.mark || null; d.last = s.last || null; d.spare = s.spare || null;
  if (!sv.dir && (sv.totalDeaths || 0) > 0) d.awake = true; // um save de antes do Sono: ele já viu você morrer
  state.dir = d; dirRt(); dirApplyWorld();
}
const dirPack = () => state.dir;

// ---- O mundo como ele deixou: refaz as salas a partir do original e aplica o que está ligado ----
function dirApplyWorld() {
  const d = state.dir;
  for (const id of Object.keys(ROOMS)) ROOMS[id].g.set(ROOMS[id].g0);
  for (const id of Object.keys(d.thorns)) { const s = DIR_THORNS[id] && DIR_THORNS[id][d.thorns[id] - 1]; if (s) box(ROOMS[id], s[0], s[1], s[0] + 1, s[1], 3); }
  if (d.lake) { const r = ROOMS.R10; box(r, 45, 12, 47, 12, 0); box(r, 51, 14, 53, 14, 0); branch(r, 44, 46, 13); branch(r, 50, 53, 13); } // os troncos do meio em outro lugar
  if (d.shut) box(ROOMS.R2, 32, 13, 35, 13, 9);   // o atalho fechou: uma ponte nova sobre a ravina
  if (d.gift.R6) box(ROOMS.R6, 12, 13, 14, 13, 9); // um galho novo sobre o primeiro fosso de espinhos
  fx.artRoom = ''; // a arte da sala é refeita
}

// ---- Sussurros ------------------------------------------------------------------------------
function dirOffer(id, vars, delay, force) {
  const rt = DRT; if (!tune.director || !state.dir.awake) return;
  if (!force && rt.q.length >= 2) return;
  const t = delay === undefined ? 0.8 + drng() * 2.5 : delay;
  rt.q.push({ id, vars: vars || {}, t, ttl: t + (force ? 22 : 12), force: !!force });
}
function dirCompose(id, vars) {
  const d = state.dir, pool = SONO.b[id]; if (!pool) return '';
  const fresh = pool.filter(s => !d.said.includes(s)), body = dpick(fresh.length ? fresh : pool);
  d.said.push(body); if (d.said.length > 16) d.said.shift();
  let s = body;
  if (SONO.solto[id]) { if (drng() < 0.3) s = dpick(SONO.ab) + s; if (drng() < 0.3) s += dpick(SONO.fe); }
  return dirFill(s, vars);
}
function dirFill(s, vars) {
  s = s.replace(/\{(\w+)\}/g, (_, k) => { const v = vars[k]; return v === undefined ? '' : typeof v === 'number' ? (v >= 0 && v < DIR_NUM.length ? DIR_NUM[v] : String(v)) : v; });
  return s.replace(/\s+/g, ' ').trim();
}
function dirTopKiller() { // o inimigo comum que mais te matou
  let k = '', n = 0;
  for (const q of ['carcaca', 'mariposa', 'espinheiro']) if ((state.deaths[q] || 0) > n) { n = state.deaths[q]; k = q; }
  return { k, n };
}
function dirAmbient() { // quando nada acontece: ele comenta o que reparou em você, ou fala de si
  const d = state.dir, a = d.acts, atk = a.side + a.up + a.down, c = [];
  for (const n of [5, 10, 15, 20, 30, 40, 50]) if (state.totalDeaths >= n && !d.ms['d' + n]) { d.ms['d' + n] = 1; return ['deaths', { n: state.totalDeaths }]; }
  const min = Math.floor(state.time / 60);
  for (const n of [10, 20, 30, 45, 60]) if (min >= n && !d.ms['t' + n]) { d.ms['t' + n] = 1; return ['time', { n: min }]; }
  if (atk >= 25) { if (a.down / atk > 0.3) c.push(['fav_down', {}]); if (a.up / atk > 0.3) c.push(['fav_up', {}]); if (a.side / atk > 0.85) c.push(['fav_side', { n: a.side }]); }
  if (a.dash >= 20 && a.dash > atk * 0.7) c.push(['fav_dash', {}]);
  if (state.totalDeaths >= 3 && a.heal === 0) c.push(['noheal', {}]);
  if (Object.keys(state.ecos).length >= 2) c.push(['ecos', {}]);
  c.push(['calm', {}], ['calm', {}]);
  return dpick(c);
}
function dirDeathLine(key) { // a frase do pesadelo, quando o inimigo não disse nada
  const d = state.dir; if (!tune.director || !d.awake || state.totalDeaths < 3) return '';
  dmix(); if (drng() > 0.55) return '';
  const c = [SONO.morte[0], SONO.morte[1]], cur = DRT.cur;
  if (key !== 'floresta') c.push(SONO.morte[2]);
  if (state.deaths[key] >= 2) c.push(SONO.morte[3]);
  if ((d.roomDeaths[state.room] || 0) >= 2) c.push(SONO.morte[4]);
  if (cur && cur.gesto) c.push(SONO.morte[5], SONO.morte[5]);
  return dirFill(dpick(c), { n: state.totalDeaths, m: state.deaths[key], ini: DIR_INI[key] || '', loc: DIR_LOC[state.room] });
}

// ---- O que ele anota de você ------------------------------------------------------------------
function dirAct(name) {
  const d = state.dir, rt = DRT; d.acts[name] = (d.acts[name] || 0) + 1;
  if (name === 'hurt') { rt.streak = 0; if (rt.cur) rt.cur.hurt++; }
  if (name === 'heal' && drng() < 0.3) dirOffer('heal', {}, 0.6);
}
function dirKill(e) {
  const d = state.dir, rt = DRT; d.acts.kills++;
  if (SPEC[e.k].boss) { d.heat = clamp(d.heat + 0.1, 0.1, 1); return; }
  rt.streak++;
  if (rt.streak === 4 || rt.streak === 9) { d.heat = clamp(d.heat + 0.1, 0.1, 1); d.debt = Math.max(d.debt, 1); if (drng() < 0.8) dirOffer('streak', { n: rt.streak }, 1); } // sem levar um golpe: ele reage
}
function dirDeath(key, how) {
  const d = state.dir, p = state.p; if (!tune.director) return;
  d.awake = true; d.roomDeaths[state.room] = (d.roomDeaths[state.room] || 0) + 1; d.heat = clamp(d.heat - 0.12, 0.1, 1);
  if (d.sRoom === state.room) d.sN++; else { d.sRoom = state.room; d.sN = 1; }
  d.last = { room: state.room, key, how };
  d.mark = { room: state.room, x: p.safeX + p.w / 2, y: p.safeY + p.h }; // onde você apagou: fica um resto de calor
  DRT.q = []; DRT.pend = []; DRT.streak = 0; fx.sono = null;
}
function dirLeave(side) { // saindo por uma porta: quem estava atrás de você pode vir junto
  const p = state.p, rt = DRT, pcx = p.x + p.w / 2, pcy = p.y + p.h / 2; let best = null, bd = 560, alive = 0;
  for (const e of state.ents) if (e.alive && !SPEC[e.k].boss && !e.tmp) {
    alive++; const dd = Math.hypot(e.x + e.w / 2 - pcx, e.y + e.h / 2 - pcy);
    const hot = e.k === 'carcaca' ? e.st !== 'sleep' && e.st !== 'idle' : e.k === 'mariposa' ? e.st !== 'hover' || dd < 300 : dd < 420;
    if (hot && dd < bd) { bd = dd; best = e; }
  }
  rt.chase = best ? { k: best.k, hp: best.hp } : null; rt.leftAlive = alive; DIRCTX = { how: 'door', side };
}

// ---- Os gestos: o que ele pode fazer ao trocar de sala ---------------------------------------------
function dirSlot(id, k, px, py) {
  const all = DIR_SLOTS[id] && DIR_SLOTS[id][k === 'mariposa' ? 'air' : 'ground']; if (!all) return null;
  const ok = all.filter(s => Math.hypot(s[0] - px, s[1] - py) >= 8.5 && state.ents.every(e => Math.hypot((e.x + e.w / 2) / T - s[0] - 0.5, (e.y + e.h) / T - s[1]) > 3));
  return ok.length ? dpick(ok) : null;
}
function dirSpawn(id, k, s, tag) { const e = makeEnt({ k, x: s[0], y: s[1] }, id + ':' + tag); e.dirx = 1; state.ents.push(e); return e; }
function dirExtra(id, px, py, kind, n) {
  let made = 0;
  for (let i = 0; i < n; i++) {
    const top = dirTopKiller(), kinds = ['carcaca', 'espinheiro', 'mariposa', 'mariposa']; if (top.n >= 2) kinds.push(top.k, top.k);
    let k = kind || dpick(kinds), s = dirSlot(id, k, px, py);
    if (!s && !kind) { k = k === 'mariposa' ? 'espinheiro' : 'mariposa'; s = dirSlot(id, k, px, py); }
    if (s) { dirSpawn(id, k, s, 'd' + state.dir.beats + '_' + i); made++; }
  }
  return made > 0;
}
function dirWorldGesto(cur, how) { // mexe no chão: espinhos, troncos do lago, o atalho. Devolve o nome do gesto, ou ''.
  const d = state.dir, c = [];
  const on = Object.keys(d.thorns), off = Object.keys(DIR_THORNS).filter(id => state.seen[id] && !d.thorns[id]);
  if (off.length && on.length < 2) c.push('thorns', 'thorns');
  const old = on.filter(id => d.beats - (d.tAge[id] || 0) >= 6); // espinhos ficam um tempo antes de sumir
  if (old.length) c.push('thorns_off');
  if (state.seen.R10) c.push('lake');
  if (state.flags.atalho && !d.shut && cur !== 'R2') c.push('shut');
  if (!c.length) return '';
  const g = dpick(c), p = state.p;
  if (g === 'thorns') {
    const id = off.includes(cur) && drng() < 0.7 ? cur : dpick(off), sl = DIR_THORNS[id];
    let i = 1 + Math.floor(drng() * sl.length);
    if (id === cur && Math.abs(sl[i - 1][0] - p.x / T) < 6) i = i === 1 ? 2 : 1;       // nunca debaixo de quem acabou de entrar
    if (id === cur && Math.abs(sl[i - 1][0] - p.x / T) < 6) return '';
    d.thorns[id] = i; d.tAge[id] = d.beats; dirApplyWorld(); if (id === cur) { d.tSeen[id] = 1; dirNote('g_thorns', 0.65); } else d.notes[id] = 'g_thorns';
  } else if (g === 'thorns_off') { const id = dpick(old); dirThornsOff(id, cur); }
  else if (g === 'lake') { d.lake = d.lake ? 0 : 1; dirApplyWorld(); if (cur === 'R10') dirNote('g_lake', 0.7); else d.notes.R10 = 'g_lake'; }
  else if (g === 'shut') { state.flags.atalho = false; d.shut = true; dirApplyWorld(); d.notes.R2 = 'g_shut'; }
  return g;
}
function dirThornsOff(id, cur) { // some um canteiro; ele só comenta se você chegou a ver
  const d = state.dir, seen = d.tSeen[id]; delete d.thorns[id]; delete d.tAge[id]; delete d.tSeen[id]; dirApplyWorld();
  if (seen && id !== cur) d.notes[id] = 'g_thorns_off'; else if (d.notes[id] === 'g_thorns') delete d.notes[id];
}
function dirNote(id, chance, vars) { if (drng() < chance) dirOffer(id, vars, 2 + drng() * 4, true); } // às vezes ele avisa; às vezes não
function dirDo(g, id, px, py) {
  const d = state.dir, rt = DRT, r = ROOMS[id], commons = state.ents.filter(e => !SPEC[e.k].boss);
  if (g === 'extra') return dirExtra(id, px, py, '', Math.min(tune.director_max_extra, 1 + (d.heat >= 0.7 || d.debt >= 2 ? 1 : 0)));
  if (g === 'nemesis') { const top = dirTopKiller(); if (top.n < 3) return false; rt.cur.vars = { ini: DIR_INI[top.k], n: top.n }; return dirExtra(id, px, py, top.k, Math.min(tune.director_max_extra, top.n >= 6 ? 2 : 1)); }
  if (g === 'swap') { // os do chão trocam de tipo, só nesta visita
    let n = 0;
    state.ents = state.ents.map(e => {
      const def = r.ents[Number(e.id.split(':')[1])];
      if (e.dirx || SPEC[e.k].boss || e.k === 'mariposa' || !def) return e;
      const q = makeEnt({ k: e.k === 'carcaca' ? 'espinheiro' : 'carcaca', x: def.x, y: def.y }, e.id); q.dirx = 1; n++; return q;
    });
    return n > 0;
  }
  if (g === 'awake') { // ninguém dorme, e as mariposas te veem de mais longe
    if (!commons.length) return false;
    for (const e of commons) { if (e.k === 'carcaca') { e.st = 'walk'; e.rise = 1; } else if (e.k === 'mariposa') { e.far = 1; e.cd = 0.2; } else e.cd = 0.3; }
    dirNote('g_awake', 0.6); return true;
  }
  if (g === 'empty') { if (commons.length < 2) return false; state.ents = state.ents.filter(e => SPEC[e.k].boss); d.debt = 2; dirNote('g_empty', 0.7); return true; } // sala vazia; a próxima paga
  if (g === 'dark') { rt.dread = 1; dirNote('g_dark', 0.5); return true; }
  if (g === 'world') return !!dirWorldGesto(id, 'door');
  return false;
}
function dirWake(id) { // acordando depois de morrer: ele mexeu em alguma coisa enquanto você dormia?
  const d = state.dir, m = d.last; let g = '';
  if (!d.ms.w1) { d.ms.w1 = 1; dirOffer('wake1', {}, 1.2, true); return; } // a primeira vez que ele fala
  if (m && d.sN >= tune.director_mercy_deaths) { // muitas mortes seguidas na mesma sala: ele cede uma coisa
    if (m.room === 'R6' && m.key === 'floresta' && !d.gift.R6) { d.gift.R6 = true; dirApplyWorld(); d.notes.R6 = 'g_gift'; g = 'gift'; }
    else if (DIR_INI[m.key] && !SPEC[m.key]) g = '';
    else if (SPEC[m.key] && !SPEC[m.key].boss) { d.spare = { room: m.room, k: m.key }; d.notes[m.room] = 'g_gift'; g = 'gift'; }
    if (g) d.sN = 0;
  }
  if (!g && m && m.key === 'floresta' && m.how === 'espinhos' && d.thorns[m.room] && drng() < 0.6) { d.tSeen[m.room] = 1; dirThornsOff(m.room, ''); g = 'thorns_off'; }
  if (!g && drng() < tune.director_gesture_chance * 0.7) g = dirWorldGesto(id, 'wake');
  if (g) { d.changes++; events.push({ type: 'diretor', gesto: g, sala: id, quando: 'acordar' }); }
}
function dirEnter(id) {
  const d = state.dir, rt = DRT, c = DIRCTX || { how: 'start' }; DIRCTX = null;
  const r = ROOMS[id], calmRoom = !!r.boss || !!DIR_SANCT[id], prev = rt.cur, p = state.p, px = p.x / T, py = (p.y + p.h) / T;
  if (prev && c.how === 'door' && !prev.hurt && prev.had) d.heat = clamp(d.heat + 0.05, 0.1, 1); // atravessou sem um arranhão: ele presta mais atenção
  if (c.how === 'door') { rt.hist.push(id); if (rt.hist.length > 6) rt.hist.shift(); } else rt.hist = [id];
  rt.cur = { room: id, t: 0, hurt: 0, had: state.ents.some(e => !SPEC[e.k].boss), slow: false, gesto: '', vars: {}, told: 0 };
  rt.pend = []; rt.dread = 0; rt.q = []; // o que ele ia dizer sobre a outra sala fica na outra sala
  d.roomVisits[id] = (d.roomVisits[id] || 0) + 1;
  if (d.shut && state.flags.atalho) { d.shut = false; dirApplyWorld(); } // você reabriu o atalho por baixo: a ponte some
  if (d.thorns[id]) d.tSeen[id] = 1;
  if (!tune.director || !d.awake || c.how === 'start') return;
  dmix(); d.beats++;
  if (c.how === 'wake') dirWake(id);
  if (d.spare && d.spare.room === id) { const i = state.ents.findIndex(e => e.k === d.spare.k && !SPEC[e.k].boss); if (i >= 0) state.ents.splice(i, 1); d.spare = null; } // o que ele tirou do caminho
  if (d.notes[id]) { dirOffer(d.notes[id], {}, 2 + drng() * 4, true); delete d.notes[id]; }
  if (c.how === 'wake') return; // a sala onde você acorda fica como é
  // quem estava atrás de você
  if (rt.chase && !calmRoom && drng() < tune.director_stalk_chance) {
    const k = rt.chase.k, ground = k !== 'mariposa';
    if (!ground || c.side === 'left' || c.side === 'right') rt.pend.push({ k, hp: rt.chase.hp, x: px, y: ground ? Math.round(py) : Math.max(3, py - 4), t: 1.4 + drng() * 2.2, ttl: 10 });
  }
  rt.chase = null;
  // o que ele repara na entrada
  if ((d.roomDeaths[id] || 0) >= 2 && drng() < 0.4) dirOffer('roomdeaths', { n: d.roomDeaths[id], loc: DIR_LOC[id] });
  else if (rt.hist.length >= 3 && rt.hist[rt.hist.length - 3] === id && prev && prev.t < 25 && drng() < 0.5) dirOffer('back', {});
  else if (prev && prev.t < 7 && rt.leftAlive > 0 && !DIR_SANCT[prev.room] && drng() < 0.4) { dirOffer('fast', {}); d.debt = Math.max(d.debt, 1); }
  else if (DIR_SANCT[id] && !d.ms['s' + id] && drng() < 0.5) { d.ms['s' + id] = 1; dirOffer('sanct', {}, 2.5); }
  // mexer ou não mexer (se alguém já vem atrás de você, isso basta por agora)
  if (rt.pend.length && !rt.force) return;
  let go = !!rt.force || d.debt > 0;
  if (!go) { if (d.quiet > 0) d.quiet--; else go = drng() < clamp(tune.director_gesture_chance * (0.6 + 0.8 * d.heat), 0, 0.95); }
  if (!go) return;
  const top = dirTopKiller();
  let cands = calmRoom ? [['world', 1]] : [['extra', 3 + 3 * d.heat], ['nemesis', top.n >= 3 ? 2.5 : 0], ['swap', 1.5], ['awake', 1.5], ['empty', d.heat > 0.5 && d.debt === 0 ? 1 : 0], ['dark', 1], ['world', 2.5]];
  if (d.debt > 0 && !calmRoom) cands = [['extra', 3], ['nemesis', top.n >= 3 ? 2 : 0], ['awake', 1]]; // dívida: a sala vazia ou a pressa se pagam com gente
  if (rt.force) { cands = [[rt.force, 1]]; }
  const forced = rt.force; rt.force = '';
  cands = cands.filter(q => q[1] > 0);
  while (cands.length) {
    let tot = 0; for (const q of cands) tot += q[1];
    let x = drng() * tot, i = 0; while (i < cands.length - 1 && x >= cands[i][1]) { x -= cands[i][1]; i++; }
    const g = cands[i][0];
    if (dirDo(g, id, px, py)) {
      rt.cur.gesto = g; d.changes++; d.quiet = tune.director_quiet_rooms + (drng() < 0.4 ? 1 : 0);
      if (d.debt > 0 && !calmRoom && g !== 'empty') d.debt--;
      events.push({ type: 'diretor', gesto: g, sala: id, forcado: !!forced });
      return;
    }
    cands.splice(i, 1);
  }
}

// ---- A cada passo: os momentos que ninguém marcou ---------------------------------------------------
function dirStep(dt) {
  const d = state.dir, rt = DRT, p = state.p; if (!rt.cur) return;
  rt.cur.t += dt; fx.dread = lerp(fx.dread || 0, rt.dread, Math.min(1, dt * 1.5));
  if (fx.sono) { fx.sono.t += dt; if (fx.sono.t > fx.sono.dur) fx.sono = null; }
  if (!tune.director || !d.awake) return;
  const pcx = p.x + p.w / 2, pfy = p.y + p.h, r = ROOMS[state.room];
  let near = false;
  for (const e of state.ents) if (e.alive && Math.abs(e.x + e.w / 2 - pcx) < 440 && Math.abs(e.y + e.h - pfy) < 260) { near = true; break; }
  const calm = !state.fight && !near;
  // onde você apagou: um resto de calor, e ele lembra
  if (d.mark && d.mark.room === state.room && Math.abs(pcx - d.mark.x) < 40 && Math.abs(pfy - d.mark.y) < 70) {
    puff(d.mark.x, d.mark.y - 14, 18, PAL.violetPale, 150, { add: true, g: -90, life: 1 }); puff(d.mark.x, d.mark.y - 14, 8, PAL.ember, 120, { add: true, g: -110, life: 1.1 });
    d.mark = null; state.calor = Math.min(tune.calor_max, state.calor + 2); sfx('eco'); if (drng() < 0.7) dirOffer('spot', {}, 0.3, true);
  }
  // os que ele pôs: a primeira vez que você vê
  for (const e of state.ents) if (e.dirx === 1 && Math.abs(e.x + e.w / 2 - pcx) < 430 && Math.abs(e.y + e.h - pfy) < 280) {
    e.dirx = 2;
    if (!rt.cur.told && drng() < 0.6) { rt.cur.told = 1; dirOffer(rt.cur.gesto === 'swap' ? 'g_swap' : rt.cur.gesto === 'nemesis' ? 'nemesis' : 'g_extra', rt.cur.vars, 0.6, true); }
  }
  // quem veio atrás: aparece na porta por onde você entrou, quando você já se afastou dela
  for (const q of rt.pend) {
    q.t -= dt; if (q.t > 0) continue;
    q.ttl -= dt; const dx = Math.abs(pcx / T - q.x - 0.5);
    if (dx >= (q.k === 'mariposa' ? 3 : 4.5)) {
      const e = makeEnt({ k: q.k, x: q.x, y: q.y }, state.room + ':s' + d.beats); e.hp = Math.min(e.hp, q.hp); e.dirx = 2; e.face = pcx > e.x ? 1 : -1;
      if (q.k === 'carcaca') { e.st = 'rise'; e.rise = 0; } if (q.k === 'mariposa') e.cd = 1.2;
      state.ents.push(e); sfx('tele'); puff(e.x + e.w / 2, e.y + e.h / 2, 16, PAL.violet, 170, { add: true, life: 0.8, g: -40 });
      q.done = 1; d.changes++; rt.cur.gesto = rt.cur.gesto || 'stalk'; events.push({ type: 'diretor', gesto: 'stalk', sala: state.room, quem: q.k });
      if (drng() < 0.6) dirOffer('g_stalk', {}, 0.8, true);
    } else if (q.ttl <= 0) q.done = 1;
  }
  if (rt.pend.length) rt.pend = rt.pend.filter(q => !q.done);
  // parada, com pouca vida, demorando
  const still = p.ground && Math.abs(p.vx) < 8 && p.atk < 0 && p.heal === 0;
  rt.idle = still ? rt.idle + dt : 0; rt.idleCd -= dt; rt.lowCd -= dt;
  if (rt.idle > tune.director_idle_time && rt.idleCd <= 0 && calm) { dirOffer('idle', {}, 0.2); rt.idleCd = 60; }
  rt.low = p.life === 1 && p.maxLife > 1 ? rt.low + dt : 0;
  if (rt.low > 5 && rt.lowCd <= 0 && !state.fight) { dirOffer('low', {}, 0.2); rt.lowCd = 70; }
  if (rt.cur.t > 85 && !rt.cur.slow && !r.boss && !DIR_SANCT[state.room]) { rt.cur.slow = true; if (drng() < 0.7) dirOffer('slow', { loc: DIR_LOC[state.room] }, 1); }
  rt.amb -= dt;
  if (rt.amb <= 0) { rt.amb = tune.director_whisper_gap * (1.2 + drng() * 2); if (calm) { const a = dirAmbient(); dirOffer(a[0], a[1], 0.5); } }
  // a fila: um sussurro por vez, nunca por cima de outra voz, nunca numa luta de guardião
  rt.gap -= dt; rt.min -= dt;
  for (const q of rt.q) { q.t -= dt; q.ttl -= dt; }
  if (rt.q.length) rt.q = rt.q.filter(q => q.ttl > 0);
  if (!fx.sono && !fx.eco && !fx.say && !state.banner && !state.fight && rt.min <= 0) {
    const i = rt.q.findIndex(q => q.t <= 0 && (q.force || rt.gap <= 0));
    if (i >= 0) {
      const q = rt.q.splice(i, 1)[0], s = dirCompose(q.id, q.vars);
      if (s) { fx.sono = { text: s, t: 0, dur: 3.2 + s.length * 0.065 }; sfx('sono'); rt.gap = tune.director_whisper_gap * (0.6 + drng() * 0.9); rt.min = 5; events.push({ type: 'sussurro', id: q.id, texto: s }); }
    }
  }
}

// ---- Desenhar: a marca de onde você apagou, o brilho dos que ele pôs, os galhos novos, a voz ------------
function dirDrawWorld(g, t) {
  const d = state.dir;
  if (d.mark && d.mark.room === state.room) { // um resto de calor no chão, com cinza subindo
    const x = d.mark.x, y = d.mark.y;
    g.fillStyle = 'rgba(8,5,16,0.7)'; g.beginPath(); g.ellipse(x, y - 1, 22, 5, 0, 0, TAU); g.fill();
    glow(g, x, y - 10, 70, PAL.violet, 0.4 + 0.12 * Math.sin(t * 2.2)); glow(g, x, y - 7, 18, PAL.ember, 0.75 + 0.2 * Math.sin(t * 3.1)); g.fillStyle = '#fff1d0'; g.beginPath(); g.ellipse(x, y - 6, 2.4, 3.6, 0, 0, TAU); g.fill();
    for (let i = 0; i < 4; i++) { const k = (t * 0.3 + i * 0.25) % 1; glow(g, x + Math.sin(i * 2.4 + t * 0.8) * 12, y - 8 - k * 64, 4, PAL.violetPale, (1 - k) * 0.7); }
  }
  const th = DIR_THORNS[state.room] && DIR_THORNS[state.room][(d.thorns[state.room] || 0) - 1]; // espinhos que ele fez nascer: ainda pulsam
  if (th) glow(g, (th[0] + 1) * T, (th[1] + 1) * T - 14, 90, PAL.violet, 0.3 + 0.12 * Math.sin(t * 2.4));
  for (const e of state.ents) if (e.alive && e.dirx) glow(g, e.x + e.w / 2, e.y + e.h * 0.55, Math.max(e.w, e.h) * 0.9, PAL.violet, 0.2 + 0.07 * Math.sin(t * 2.6 + e.x)); // os que ele pôs têm um resto de violeta
}
function dirDrawBranch(g, px, py, t, x) { // galho novo (bloco 9): segura por cima, como os outros, mas ainda brilha do sono
  g.fillStyle = PAL.ink2; g.beginPath(); g.moveTo(px - 2, py + 1); g.quadraticCurveTo(px + T / 2, py - 2, px + T + 2, py + 1); g.lineTo(px + T + 2, py + 10); g.quadraticCurveTo(px + T / 2, py + 13, px - 2, py + 10); g.closePath(); g.fill();
  g.strokeStyle = rgba(PAL.violetPale, 0.7 + 0.2 * Math.sin(t * 2 + x)); g.lineWidth = 2; g.beginPath(); g.moveTo(px - 2, py + 1); g.quadraticCurveTo(px + T / 2, py - 2, px + T + 2, py + 1); g.stroke();
  g.strokeStyle = PAL.ink2; g.lineWidth = 1.6; g.beginPath(); g.moveTo(px + 12, py + 10); g.lineTo(px + 8 + (x % 3) * 4, py + 24 + (x % 2) * 8); g.stroke();
  glow(g, px + T / 2, py + 4, 52, PAL.violet, 0.2 + 0.07 * Math.sin(t * 1.7 + x));
}
function dirDrawOver(g) { if (fx.dread > 0.02) { glow(g, W / 2, H / 2, 1000, PAL.violetDeep, 0.2 * fx.dread); g.fillStyle = `rgba(4,2,10,${0.2 * fx.dread})`; g.fillRect(0, 0, W, H); } } // ele apagou um pouco a luz
function dirDrawHUD(g) { // a voz dele: embaixo, no meio, baixa
  const s = fx.sono; if (!s) return;
  const a = clamp(s.t * 1.2, 0, 1) * clamp(s.dur - s.t, 0, 1), lines = wrapLines(g, s.text.slice(0, Math.floor(s.t * 26)), 25, 600), y0 = H - 112 - (lines.length - 1) * 16;
  lines.forEach((ln, i) => textGlow(g, ln, W / 2 + Math.sin(s.t * 1.3 + i) * 2, y0 + i * 32, 25, '#dccdf7', PAL.violetDeep, a * 0.95, 'center', true));
}
