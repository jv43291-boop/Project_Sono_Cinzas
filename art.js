// PROTOTYPE - NOT FOR PRODUCTION
// Question: o silêncio e o luto chegam de verdade em quem joga, e a luta punitiva dá vontade de tentar de novo?
// Date: 2026-11-10
'use strict';
// A arte: tudo desenhado em código. Camadas pintadas uma vez por sala, figuras desenhadas a cada quadro.

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;

// Paleta com papéis (o brief): carvão = chão e troncos · névoa azul-esverdeada = profundidade
// branco-osso + brasa âmbar = a figura · violeta = ameaça e pesadelo · verde-água = brotos, vida e saves
const PAL = {
  ink: '#05090b', ink2: '#0a1317', bark: '#0c161a', rim: '#8fc4bd', ash: '#b9cdc9',
  bone: '#efe8d8', boneShade: '#9aa7a8', ember: '#ffb347', emberHot: '#ff7a2b',
  violet: '#a866ff', violetDeep: '#5b2ca6', violetPale: '#d9c2ff',
  sprout: '#7df5d0', sproutDeep: '#2fbf9b', enemy: '#182024', enemyLit: '#4b5c60',
};
const MOODS = {
  surface: { top: '#061217', mid: '#11353d', bot: '#1f575b', glow: '#6cc0b6', gx: 0.66, gy: 0.3, gr: 560, ga: 0.5, fog: '#2f7377', shafts: 1, dark: 0.22, ember: 0 },
  deep: { top: '#03080c', mid: '#0a2029', bot: '#123944', glow: '#3a8f95', gx: 0.5, gy: 0.5, gr: 460, ga: 0.32, fog: '#1d4f57', shafts: 0, dark: 0.5, ember: 0 },
  hollow: { top: '#04090a', mid: '#11261f', bot: '#1e3d30', glow: '#79b997', gx: 0.5, gy: 0.18, gr: 500, ga: 0.4, fog: '#2c5a49', shafts: 1, dark: 0.42, ember: 1 },
  arena: { top: '#04080c', mid: '#0e212a', bot: '#1b4048', glow: '#86d6ca', gx: 0.28, gy: 0.22, gr: 400, ga: 0.55, fog: '#25575d', shafts: 1, dark: 0.4, ember: 1 },
  limiar: { top: '#090716', mid: '#221944', bot: '#3d2d6c', glow: '#a184e6', gx: 0.82, gy: 0.34, gr: 540, ga: 0.5, fog: '#4c3c84', shafts: 0, dark: 0.3, ember: 1 },
  lake: { top: '#03080b', mid: '#0b2630', bot: '#1f5059', glow: '#a9dcd5', gx: 0.5, gy: 0.66, gr: 620, ga: 0.42, fog: '#2b666c', shafts: 0, dark: 0.34, ember: 0 },
  nest: { top: '#05060d', mid: '#161a33', bot: '#2a2b55', glow: '#9c8fe0', gx: 0.5, gy: 0.2, gr: 520, ga: 0.42, fog: '#3a3a70', shafts: 1, dark: 0.4, ember: 1 },
  heart: { top: '#0a0514', mid: '#28134e', bot: '#472181', glow: '#bd93ff', gx: 0.6, gy: 0.3, gr: 580, ga: 0.55, fog: '#5c3c9e', shafts: 0, dark: 0.3, ember: 1 },
};

function prng(a) { // aleatório só da arte e do som: nunca mexe na semente do jogo
  return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const vr = prng(90210);
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const p = rgb(a), q = rgb(b); return `rgb(${Math.round(lerp(p[0], q[0], t))},${Math.round(lerp(p[1], q[1], t))},${Math.round(lerp(p[2], q[2], t))})`; }
function rgba(hex, a) { const p = rgb(hex); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
function smooth(g, pts, close = true) { // curva suave pelos pontos
  const n = pts.length; g.beginPath();
  if (close) {
    g.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    g.closePath();
  } else {
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) { const p = pts[i], q = pts[i + 1]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    g.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}
function limb(g, x0, y0, x1, y1, w0, w1, bend = 0) { // membro ou galho afilado
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const mx = (x0 + x1) / 2 + nx * bend, my = (y0 + y1) / 2 + ny * bend;
  g.beginPath(); g.moveTo(x0 + nx * w0, y0 + ny * w0);
  g.quadraticCurveTo(mx + nx * (w0 + w1) / 2, my + ny * (w0 + w1) / 2, x1 + nx * w1, y1 + ny * w1);
  g.lineTo(x1 - nx * w1, y1 - ny * w1);
  g.quadraticCurveTo(mx - nx * (w0 + w1) / 2, my - ny * (w0 + w1) / 2, x0 - nx * w0, y0 - ny * w0);
  g.closePath(); g.fill();
}

// ---- Brilhos: um sprite por cor, desenhado somando luz ----
const glowCache = {};
function glowSprite(hex) {
  if (glowCache[hex]) return glowCache[hex];
  const c = mk(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, rgba(hex, 1)); gr.addColorStop(0.25, rgba(hex, 0.55)); gr.addColorStop(0.6, rgba(hex, 0.16)); gr.addColorStop(1, rgba(hex, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return (glowCache[hex] = c);
}
function glow(g, x, y, r, hex, a) {
  if (a <= 0.003) return;
  const pa = g.globalAlpha, pc = g.globalCompositeOperation;
  g.globalAlpha = pa * clamp(a, 0, 1); g.globalCompositeOperation = 'lighter';
  g.drawImage(glowSprite(hex), x - r, y - r, r * 2, r * 2);
  g.globalAlpha = pa; g.globalCompositeOperation = pc;
}

// ================= As camadas de uma sala, pintadas uma vez =================
const isRock = (r, x, y) => x < 0 || x >= r.w || y >= r.h ? true : y < 0 ? false : r.g[y * r.w + x] === 1;

function trunkLayer(room, rnd, par, o) {
  const m = MOODS[room.mood];
  const lw = W + (room.w * T - W) * par, lh = H + Math.max(0, room.h * T - H) * par;
  const c = mk(lw, lh), g = c.getContext('2d');
  if (o.blur) g.filter = `blur(${o.blur}px)`;
  const col = mix(m.fog, PAL.ink, o.depth);
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
  let x = -rnd() * o.gap;
  while (x < lw + 60) {
    const w0 = lerp(o.minW, o.maxW, rnd() * rnd()), w1 = w0 * lerp(0.55, 0.85, rnd()), leanX = (rnd() - 0.5) * 90 * o.lean;
    const broken = rnd() < o.broken, topY = broken ? lh * lerp(0.15, 0.6, rnd()) : -40;
    g.beginPath(); g.moveTo(x - w0 / 2 - w0 * 0.25, lh + 10); g.quadraticCurveTo(x - w0 / 2, lh - 60, x - w0 / 2 + leanX * 0.15, lh - 130);
    g.lineTo(x - w1 / 2 + leanX, topY);
    if (broken) { const n = 5; for (let i = 1; i <= n; i++) g.lineTo(x - w1 / 2 + leanX + (w1 * i) / n, topY + (i % 2 ? -1 : 1) * lerp(8, 34, rnd())); }
    else g.lineTo(x + w1 / 2 + leanX, topY);
    g.lineTo(x + w0 / 2 + leanX * 0.15, lh - 130); g.quadraticCurveTo(x + w0 / 2, lh - 60, x + w0 / 2 + w0 * 0.25, lh + 10); g.closePath(); g.fill();
    const nb = 1 + Math.floor(rnd() * 4); // tocos e galhos quebrados
    for (let i = 0; i < nb; i++) {
      const by = lerp(Math.max(topY, 20) + 20, lh - 180, rnd()), side = rnd() < 0.5 ? -1 : 1, len = lerp(40, 190, rnd()) * (w0 / o.maxW + 0.4);
      const bx = x + leanX * (1 - by / lh) + (side * w1) / 2.4, ex = bx + side * len, ey = by - len * lerp(0.15, 0.7, rnd());
      limb(g, bx, by, ex, ey, w0 * 0.11 + 2, 1, side * len * 0.12);
      if (rnd() < 0.6) limb(g, lerp(bx, ex, 0.55), lerp(by, ey, 0.55), lerp(bx, ex, 0.8) + side * 10, ey - len * 0.3, w0 * 0.05 + 1.2, 0.6, 0);
    }
    x += lerp(o.gap * 0.45, o.gap * 1.55, rnd());
  }
  if (o.giant) { // um vulto enorme na névoa: uma árvore morta com galhadas
    const gx = lw * lerp(0.35, 0.7, rnd()), gw = 240;
    g.beginPath(); g.moveTo(gx - gw * 0.8, lh + 10); g.quadraticCurveTo(gx - gw * 0.45, lh * 0.6, gx - gw * 0.3, lh * 0.2); g.lineTo(gx - gw * 0.22, -20);
    g.lineTo(gx + gw * 0.25, -20); g.quadraticCurveTo(gx + gw * 0.4, lh * 0.55, gx + gw * 0.85, lh + 10); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, by = lh * lerp(0.08, 0.5, i / 6); limb(g, gx + s * 50, by + 60, gx + s * lerp(220, 420, rnd()), by - lerp(40, 160, rnd()), 26, 2, s * 60); }
  }
  g.filter = 'none';
  g.globalCompositeOperation = 'source-atop'; // os troncos somem na névoa perto do chão
  const fg = g.createLinearGradient(0, lh * 0.35, 0, lh); fg.addColorStop(0, rgba(m.fog, 0)); fg.addColorStop(1, rgba(m.fog, o.mist));
  g.fillStyle = fg; g.fillRect(0, 0, lw, lh);
  return { c, par };
}

function buildRoomArt(room) {
  const rnd = prng(room.id.charCodeAt(1) * 7919 + 13), m = MOODS[room.mood], RW = room.w * T, RH = room.h * T;
  const art = { glows: [], layers: [] };

  // ---- céu de névoa ----
  const sky = mk(W, H), sg = sky.getContext('2d');
  let gr = sg.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, m.top); gr.addColorStop(0.55, m.mid); gr.addColorStop(1, m.bot);
  sg.fillStyle = gr; sg.fillRect(0, 0, W, H);
  gr = sg.createRadialGradient(W * m.gx, H * m.gy, 0, W * m.gx, H * m.gy, m.gr);
  gr.addColorStop(0, rgba(m.glow, m.ga)); gr.addColorStop(0.5, rgba(m.glow, m.ga * 0.3)); gr.addColorStop(1, rgba(m.glow, 0));
  sg.fillStyle = gr; sg.fillRect(0, 0, W, H);
  art.sky = sky;

  // ---- troncos em três profundidades ----
  art.layers.push(trunkLayer(room, rnd, 0.12, { depth: 0.16, minW: 90, maxW: 260, gap: 330, broken: 0.25, lean: 0.4, blur: 5, mist: 0.75, giant: room.mood !== 'hollow' && room.mood !== 'deep' && room.mood !== 'nest' }));
  art.layers.push(trunkLayer(room, rnd, 0.3, { depth: 0.42, minW: 50, maxW: 170, gap: 250, broken: 0.35, lean: 0.7, blur: 2.5, mist: 0.6 }));
  art.layers.push(trunkLayer(room, rnd, 0.55, { depth: 0.7, minW: 34, maxW: 120, gap: 300, broken: 0.45, lean: 1, blur: 1, mist: 0.45 }));

  if (room.mood === 'heart') { // a árvore-coração queimada ao fundo
    const L = art.layers[1], g = L.c.getContext('2d'), cx = L.c.width * 0.62, lh = L.c.height;
    g.globalCompositeOperation = 'source-over'; g.fillStyle = mix(m.fog, PAL.ink, 0.72);
    g.beginPath(); g.moveTo(cx - 330, lh + 10); g.quadraticCurveTo(cx - 150, lh * 0.7, cx - 120, lh * 0.25); g.lineTo(cx - 90, -20); g.lineTo(cx + 110, -20);
    g.quadraticCurveTo(cx + 130, lh * 0.7, cx + 340, lh + 10); g.closePath(); g.fill();
    g.strokeStyle = rgba(PAL.violet, 0.75); g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { let x = cx + (rnd() - 0.5) * 150, y = lh * lerp(0.15, 0.55, rnd()); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 34; y += lerp(18, 46, rnd()); g.lineTo(x, y); } g.stroke(); }
    art.heart = { x: cx, y: lh * 0.42 };
  }

  // ---- feixes de luz ----
  if (m.shafts) {
    const sh = mk(W, H), g = sh.getContext('2d'); g.filter = 'blur(14px)';
    for (let i = 0; i < 5; i++) {
      const x = W * lerp(0.1, 0.95, rnd()), w = lerp(40, 130, rnd()), sl = lerp(120, 260, rnd());
      const lg = g.createLinearGradient(0, 0, 0, H * 0.95); lg.addColorStop(0, rgba(m.glow, 0.5)); lg.addColorStop(1, rgba(m.glow, 0));
      g.fillStyle = lg; g.beginPath(); g.moveTo(x, -20); g.lineTo(x + w, -20); g.lineTo(x + w * 1.6 - sl, H); g.lineTo(x - sl - w * 0.4, H); g.closePath(); g.fill();
    }
    art.shafts = sh;
  }

  // ---- troncos próximos, atrás da figura ----
  const back = mk(RW, RH), bg = back.getContext('2d');
  if (room.mood !== 'hollow') {
    let tx = 3 + Math.floor(rnd() * 4);
    while (tx < room.w - 2) {
      let gy = -1; for (let y = 1; y < room.h; y++) if (isRock(room, tx, y) && !isRock(room, tx, y - 1)) { gy = y; break; }
      const ceil = room.mood === 'deep' || room.mood === 'arena' || room.mood === 'nest';
      if (gy > 4 && !(room.g[(gy - 1) * room.w + tx])) {
        const x = tx * T + 20, w = lerp(46, 118, rnd() * rnd() + 0.1), top = ceil ? 0 : (rnd() < 0.4 ? gy * T - lerp(170, 420, rnd()) : -30), lean = (rnd() - 0.5) * 40;
        bg.fillStyle = PAL.bark;
        bg.beginPath(); bg.moveTo(x - w * 0.75, gy * T + 4); bg.quadraticCurveTo(x - w / 2, gy * T - 40, x - w / 2 + lean * 0.2, gy * T - 110); bg.lineTo(x - w * 0.36 + lean, top);
        if (top > 0) for (let i = 1; i <= 5; i++) bg.lineTo(x - w * 0.36 + lean + (w * 0.72 * i) / 5, top + (i % 2 ? -1 : 1) * lerp(6, 30, rnd()));
        else bg.lineTo(x + w * 0.36 + lean, top);
        bg.lineTo(x + w / 2 + lean * 0.2, gy * T - 110); bg.quadraticCurveTo(x + w / 2, gy * T - 40, x + w * 0.75, gy * T + 4); bg.closePath(); bg.fill();
        bg.save(); bg.clip(); // casca: sulcos e a borda que pega a luz
        bg.lineCap = 'round';
        for (let i = 0; i < w / 5; i++) { const lx = x - w / 2 + rnd() * w; bg.strokeStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.5)' : rgba(PAL.rim, 0.06); bg.lineWidth = lerp(1, 3, rnd()); bg.beginPath(); const y0 = gy * T - rnd() * 600; bg.moveTo(lx, y0); bg.quadraticCurveTo(lx + (rnd() - 0.5) * 16, y0 - 60, lx + lean * 0.2, y0 - lerp(60, 200, rnd())); bg.stroke(); }
        const rg = bg.createLinearGradient(x - w / 2, 0, x + w / 2, 0); rg.addColorStop(0, rgba(PAL.rim, 0.22)); rg.addColorStop(0.18, rgba(PAL.rim, 0.03)); rg.addColorStop(1, 'rgba(0,0,0,0.3)');
        bg.fillStyle = rg; bg.fillRect(x - w, top - 40, w * 2, gy * T - top + 60);
        if (rnd() < 0.5) { const ky = gy * T - lerp(120, 300, rnd()); bg.fillStyle = '#020405'; bg.beginPath(); bg.ellipse(x + lean * 0.4, ky, w * 0.14, w * 0.24, 0, 0, TAU); bg.fill(); }
        bg.restore();
        bg.fillStyle = PAL.bark; const nb = Math.floor(rnd() * 3);
        for (let i = 0; i < nb; i++) { const s = rnd() < 0.5 ? -1 : 1, by = gy * T - lerp(150, 380, rnd()), len = lerp(50, 150, rnd()); if (by > top + 20) limb(bg, x + s * w * 0.3, by, x + s * (w * 0.3 + len), by - len * lerp(0.2, 0.6, rnd()), 6, 1, s * 14); }
      }
      tx += 4 + Math.floor(rnd() * 7);
    }
    if (room.mood === 'nest') for (let i = 0; i < 22; i++) { // casulos pendurados
      const x = lerp(120, RW - 120, rnd()), len = lerp(50, 330, rnd() * rnd() + 0.08), rx = lerp(9, 20, rnd()), top = 2 * T;
      bg.strokeStyle = 'rgba(160,172,190,0.3)'; bg.lineWidth = 1.2; bg.beginPath(); bg.moveTo(x, top); bg.quadraticCurveTo(x + (rnd() - 0.5) * 16, top + len * 0.5, x, top + len); bg.stroke();
      bg.fillStyle = '#39405a'; bg.beginPath(); bg.ellipse(x, top + len + rx * 1.5, rx, rx * 1.7, (rnd() - 0.5) * 0.3, 0, TAU); bg.fill();
      bg.strokeStyle = 'rgba(10,12,24,0.55)'; bg.lineWidth = 1.4; for (let k = -2; k <= 2; k++) { bg.beginPath(); bg.moveTo(x - rx * 0.9, top + len + rx * 1.5 + k * rx * 0.55); bg.quadraticCurveTo(x, top + len + rx * 1.5 + k * rx * 0.55 + 4, x + rx * 0.9, top + len + rx * 1.5 + k * rx * 0.55); bg.stroke(); }
      if (rnd() < 0.4) art.glows.push({ x, y: top + len + rx * 1.5, r: 40, c: PAL.violet, a: 0.22, ph: rnd() * 9 });
    }
    if (room.id === 'R1') { // o tronco inclinado sob o qual você acorda
      bg.fillStyle = PAL.bark; bg.beginPath(); bg.moveTo(70, 14 * T + 6); bg.lineTo(140, 14 * T + 6); bg.lineTo(470, 14 * T - 250); bg.lineTo(520, 14 * T - 330); bg.lineTo(455, 14 * T - 300); bg.lineTo(410, 14 * T - 250); bg.closePath(); bg.fill();
      limb(bg, 330, 14 * T - 165, 430, 14 * T - 150, 7, 1, 10); limb(bg, 250, 14 * T - 110, 215, 14 * T - 190, 6, 1, -8);
      bg.strokeStyle = rgba(PAL.rim, 0.25); bg.lineWidth = 2; bg.beginPath(); bg.moveTo(72, 14 * T); bg.lineTo(455, 14 * T - 298); bg.stroke();
    }
    bg.globalCompositeOperation = 'source-atop'; // recuam na névoa
    const wg = bg.createLinearGradient(0, 0, 0, RH); wg.addColorStop(0, rgba(m.fog, 0.1)); wg.addColorStop(1, rgba(m.fog, 0.3)); bg.fillStyle = wg; bg.fillRect(0, 0, RW, RH);
  }
  art.back = back;

  // ---- o chão: carvão quase preto, com a borda de cinza pegando a luz ----
  const ter = mk(RW, RH), g = ter.getContext('2d');
  g.fillStyle = PAL.ink;
  for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) if (room.g[y * room.w + x] === 1) g.fillRect(x * T - 0.5, y * T - 0.5, T + 1, T + 1);
  g.save(); g.globalCompositeOperation = 'source-atop'; // manchas e veios dentro da massa escura
  for (let i = 0; i < (room.w * room.h) / 14; i++) { const x = rnd() * RW, y = rnd() * RH, r = lerp(40, 150, rnd()); const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(22,38,44,0.5)'); rg.addColorStop(1, 'rgba(22,38,44,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.lineCap = 'round';
  for (let i = 0; i < (room.w * room.h) / 22; i++) { let x = rnd() * RW, y = rnd() * RH; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = lerp(1, 2.5, rnd()); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.3) * 40; g.lineTo(x, y); } g.stroke(); }
  if (m.ember) for (let i = 0; i < room.w / 5; i++) { // brasas ainda vivas nas rachaduras
    const tx = Math.floor(rnd() * room.w), ty = Math.floor(rnd() * room.h);
    if (!isRock(room, tx, ty) || !isRock(room, tx, ty - 1) || isRock(room, tx, ty - 2)) continue;
    let x = tx * T + 20, y = ty * T + 6; g.strokeStyle = rgba(room.mood === 'limiar' || room.mood === 'heart' ? PAL.violet : PAL.emberHot, 0.5); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 22; y += lerp(5, 14, rnd()); g.lineTo(x, y); } g.stroke();
    art.glows.push({ x: tx * T + 20, y: ty * T + 18, r: 46, c: room.mood === 'limiar' || room.mood === 'heart' ? PAL.violet : PAL.emberHot, a: 0.16, ph: rnd() * 9 });
  }
  g.restore();

  for (let y = 1; y < room.h; y++) { // bordas de cima: montes de cinza, a linha de luz, capim morto
    let x = 0;
    while (x < room.w) {
      if (!(isRock(room, x, y) && !isRock(room, x, y - 1))) { x++; continue; }
      let x1 = x; while (x1 + 1 < room.w && isRock(room, x1 + 1, y) && !isRock(room, x1 + 1, y - 1)) x1++;
      const px0 = x * T, px1 = (x1 + 1) * T, py = y * T, pts = [];
      for (let px = px0; px <= px1; px += 9) pts.push([Math.min(px, px1), py - (px === px0 || px >= px1 ? 0 : rnd() * rnd() * 9)]);
      g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(px0, py + 3); for (const p of pts) g.lineTo(p[0], p[1]); g.lineTo(px1, py + 3); g.closePath(); g.fill();
      g.strokeStyle = rgba(PAL.rim, 0.1); g.lineWidth = 7; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 4) : g.moveTo(p[0], p[1] + 4)); g.stroke();
      g.strokeStyle = rgba(PAL.ash, 0.5); g.lineWidth = 1.6; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
      for (let px = px0 + 4; px < px1 - 4; px += lerp(5, 26, rnd())) { // capim morto e raminhos
        const h = lerp(5, 20, rnd() * rnd() + 0.15), bendx = (rnd() - 0.5) * 12;
        g.strokeStyle = rnd() < 0.3 ? rgba(PAL.rim, 0.28) : PAL.ink; g.lineWidth = lerp(1, 2, rnd());
        g.beginPath(); g.moveTo(px, py + 1); g.quadraticCurveTo(px + bendx * 0.3, py - h * 0.6, px + bendx, py - h); g.stroke();
      }
      for (let tx = x; tx <= x1; tx++) if (rnd() < 0.07 && room.g[(y - 1) * room.w + tx] === 0) { // brotinhos que brilham
        const sx = tx * T + lerp(8, 32, rnd()), sh = lerp(7, 13, rnd());
        g.strokeStyle = PAL.sproutDeep; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx, py); g.quadraticCurveTo(sx + 3, py - sh * 0.6, sx + 1, py - sh); g.stroke();
        g.fillStyle = PAL.sprout; g.beginPath(); g.ellipse(sx + 3, py - sh, 3.4, 1.8, -0.5, 0, TAU); g.fill();
        art.glows.push({ x: sx + 2, y: py - sh, r: 24, c: PAL.sprout, a: 0.5, ph: rnd() * 9 });
      }
      x = x1 + 1;
    }
  }
  for (let y = 0; y < room.h - 1; y++) for (let x = 0; x < room.w; x++) { // bordas de baixo e de lado
    if (room.g[y * room.w + x] !== 1) continue;
    if (!isRock(room, x, y + 1) && room.g[(y + 1) * room.w + x] !== 2) for (let i = 0; i < 2; i++) if (rnd() < 0.7) { // raízes penduradas
      const px = x * T + rnd() * T, len = lerp(8, 52, rnd() * rnd() + 0.1); g.strokeStyle = PAL.ink; g.lineWidth = lerp(1.2, 3.2, rnd());
      g.beginPath(); g.moveTo(px, (y + 1) * T - 1); g.quadraticCurveTo(px + (rnd() - 0.5) * 14, (y + 1) * T + len * 0.6, px + (rnd() - 0.5) * 18, (y + 1) * T + len); g.stroke();
    }
    g.strokeStyle = rgba(PAL.rim, 0.16); g.lineWidth = 1.5;
    if (!isRock(room, x - 1, y) && x > 0) { g.beginPath(); g.moveTo(x * T, y * T); g.lineTo(x * T, (y + 1) * T); g.stroke(); }
    if (!isRock(room, x + 1, y) && x < room.w - 1) { g.beginPath(); g.moveTo((x + 1) * T, y * T); g.lineTo((x + 1) * T, (y + 1) * T); g.stroke(); }
  }
  for (let y = 0; y < room.h; y++) { // galhos que seguram por cima
    let x = 0;
    while (x < room.w) {
      if (room.g[y * room.w + x] !== 2) { x++; continue; }
      let x1 = x; while (x1 + 1 < room.w && room.g[y * room.w + x1 + 1] === 2) x1++;
      const a = x * T - 6, b = (x1 + 1) * T + 6, py = y * T, fromLeft = isRock(room, x - 1, y) || !isRock(room, x1 + 1, y);
      g.fillStyle = PAL.ink2;
      g.beginPath(); g.moveTo(a, py + 1); g.quadraticCurveTo((a + b) / 2, py - 3, b, py + 1); g.lineTo(b, py + (fromLeft ? 7 : 15)); g.quadraticCurveTo((a + b) / 2, py + 13, a, py + (fromLeft ? 15 : 7)); g.closePath(); g.fill();
      g.strokeStyle = rgba(PAL.ash, 0.5); g.lineWidth = 1.5; g.beginPath(); g.moveTo(a, py + 1); g.quadraticCurveTo((a + b) / 2, py - 3, b, py + 1); g.stroke();
      for (let px = a + 10; px < b - 6; px += lerp(14, 40, rnd())) { g.strokeStyle = PAL.ink2; g.lineWidth = lerp(1, 2.4, rnd()); const up = rnd() < 0.5; g.beginPath(); g.moveTo(px, py + (up ? 0 : 10)); g.lineTo(px + (rnd() - 0.5) * 16, py + (up ? -lerp(6, 18, rnd()) : lerp(14, 34, rnd()))); g.stroke(); }
      x = x1 + 1;
    }
  }
  for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) if (room.g[y * room.w + x] === 3) { // espinhos de ponta violeta
    for (let i = 0; i < 6; i++) {
      const px = x * T + i * 7 + rnd() * 5, h = lerp(18, 36, rnd()), bx = (rnd() - 0.5) * 12, by = (y + 1) * T;
      const sg2 = g.createLinearGradient(0, by, 0, by - h); sg2.addColorStop(0, PAL.ink); sg2.addColorStop(0.7, '#1a1230'); sg2.addColorStop(1, PAL.violet);
      g.fillStyle = sg2; g.beginPath(); g.moveTo(px - 4, by); g.quadraticCurveTo(px + bx * 0.3, by - h * 0.6, px + bx, by - h); g.quadraticCurveTo(px + bx * 0.5 + 2, by - h * 0.5, px + 4, by); g.closePath(); g.fill();
    }
    if (x % 2 === 0) art.glows.push({ x: x * T + 20, y: (y + 1) * T - 22, r: 60, c: PAL.violet, a: 0.22, ph: rnd() * 9 });
  }
  if (room.id === 'R1') { // o tronco caído: os anéis do corte
    const lx = 16 * T, ly = 12 * T; g.fillStyle = PAL.ink2; g.beginPath(); g.ellipse(lx + 4, ly + 40, 20, 40, 0, 0, TAU); g.fill();
    g.strokeStyle = rgba(PAL.ash, 0.35); g.lineWidth = 1.2; for (let i = 1; i <= 3; i++) { g.beginPath(); g.ellipse(lx + 4, ly + 40, 5 * i, 11 * i, 0, 0, TAU); g.stroke(); }
    g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(19 * T, ly + 40, 16, 40, 0, -Math.PI / 2, Math.PI / 2); g.fill();
  }
  art.terrain = ter;

  // ---- primeiro plano desfocado: capim e galhos nas bordas da tela ----
  if (room.mood !== 'hollow') {
    const par = 1.3, fw = W + (RW - W) * par, fore = mk(fw, H), fg = fore.getContext('2d');
    fg.filter = 'blur(3px)'; fg.fillStyle = '#020506'; fg.strokeStyle = '#020506'; fg.lineCap = 'round';
    for (let x = -20; x < fw + 20; x += lerp(8, 30, rnd())) {
      if (rnd() < 0.25) { x += lerp(60, 260, rnd()); continue; }
      const h = lerp(18, 74, rnd() * rnd() + 0.1), b = (rnd() - 0.5) * 40; fg.lineWidth = lerp(2, 6, rnd());
      fg.beginPath(); fg.moveTo(x, H + 6); fg.quadraticCurveTo(x + b * 0.3, H - h * 0.6, x + b, H - h); fg.stroke();
    }
    for (let x = rnd() * 500; x < fw; x += lerp(520, 1200, rnd())) { // galhos mortos descendo do alto
      const len = lerp(140, 330, rnd()), s = rnd() < 0.5 ? -1 : 1;
      limb(fg, x, -20, x + s * len, lerp(60, 150, rnd()), 16, 2, 30); limb(fg, x + s * len * 0.5, 50, x + s * len * 0.7, 150, 6, 1, -10); limb(fg, x + s * len * 0.75, 90, x + s * (len + 60), 96, 4, 1, 8);
    }
    art.fore = { c: fore, par };
  }
  if (room.canopy) { // a copa que esconde o segredo
    const cw = (room.canopy.x1 - room.canopy.x0 + 1) * T + 160, ch = 8.6 * T, cv = mk(cw, ch), cg = cv.getContext('2d');
    cg.fillStyle = '#040809';
    for (let i = 0; i < 90; i++) { const x = rnd() * cw, y = rnd() * rnd() * ch * 0.92, r = lerp(30, 86, rnd()) * (1 - y / ch * 0.55); cg.beginPath(); cg.ellipse(x, y, r, r * 0.7, rnd() * 3, 0, TAU); cg.fill(); }
    cg.strokeStyle = '#040809'; cg.lineCap = 'round';
    for (let i = 0; i < 46; i++) { const x = rnd() * cw, y = ch * lerp(0.5, 0.86, rnd()); cg.lineWidth = lerp(1.5, 4, rnd()); cg.beginPath(); cg.moveTo(x, y - 30); cg.quadraticCurveTo(x + (rnd() - 0.5) * 30, y, x + (rnd() - 0.5) * 44, y + lerp(10, 50, rnd())); cg.stroke(); }
    cg.globalCompositeOperation = 'source-atop'; cg.strokeStyle = rgba(PAL.rim, 0.13); cg.lineWidth = 2;
    for (let i = 0; i < 60; i++) { const x = rnd() * cw, y = rnd() * ch; cg.beginPath(); cg.arc(x, y, lerp(20, 60, rnd()), Math.PI * 1.1, Math.PI * 1.6); cg.stroke(); }
    art.canopy = { c: cv, x: room.canopy.x0 * T - 80, y: 0 };
  }
  return art;
}

// ================= O que cai e flutua =================
const ASH = [];
for (let i = 0; i < 260; i++) ASH.push({ x: vr() * 1400, y: vr() * 800, z: lerp(0.35, 1.9, vr() * vr() + 0.02 + vr() * 0.3), sp: lerp(16, 52, vr()), f: lerp(0.4, 1.3, vr()), ph: vr() * 9, sz: lerp(1, 3.2, vr()) });
function drawAsh(g, t, cx, cy, near, mood) {
  const n = Math.min(ASH.length, Math.round(tune.ash_amount * (CHEAP ? 0.6 : 1)));
  const vio = mood === 'limiar' || mood === 'heart';
  for (let i = 0; i < n; i++) {
    const p = ASH[i]; if ((p.z >= 1) !== near) continue;
    const x = (((p.x + Math.sin(t * p.f + p.ph) * 22 * p.z - t * 9 * p.z - cx * p.z) % 1360) + 1360) % 1360 - 40;
    const y = (((p.y + t * p.sp * p.z - cy * p.z) % 800) + 800) % 800 - 40;
    const s = p.sz * p.z;
    g.fillStyle = vio && i % 4 === 0 ? `rgba(200,170,255,${near ? 0.5 : 0.34})` : `rgba(206,218,214,${near ? (p.z > 1.5 ? 0.3 : 0.6) : 0.3})`;
    g.beginPath(); g.ellipse(x, y, s, s * 0.55, t * p.f + p.ph, 0, TAU); g.fill();
  }
}
function drawEmbers(g, t, cx, cy, hex) {
  for (let i = 0; i < 16; i++) {
    const p = ASH[i * 7 + 3], life = ((t * 0.09 * p.f + p.ph) % 1 + 1) % 1;
    const x = (((p.x * 1.7 + Math.sin(t * 1.3 + p.ph) * 30 - cx * 0.9) % 1360) + 1360) % 1360 - 40, y = H + 20 - life * (H * 0.9) - ((cy * 0.4) % 60);
    glow(g, x, y, 5 + p.sz * 2, hex, (1 - life) * (0.5 + 0.5 * Math.sin(t * 9 + p.ph)));
  }
}
let fogSprite = null;
function drawFog(g, t, cx, mood, a) {
  if (!fogSprite) { fogSprite = mk(512, 192); const fg = fogSprite.getContext('2d'); fg.translate(256, 96); fg.scale(1, 0.375); const rg = fg.createRadialGradient(0, 0, 0, 0, 0, 256); rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.3)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); fg.fillStyle = rg; fg.fillRect(-256, -256, 512, 512); }
  const pa = g.globalAlpha, pc = g.globalCompositeOperation; g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 6; i++) {
    const p = ASH[i * 11 + 5], w = 700 + p.sz * 220, x = (((p.x * 2 + t * (8 + i * 3) - cx * (0.5 + i * 0.12)) % (W + w)) + (W + w)) % (W + w) - w;
    g.globalAlpha = pa * a * (0.5 + 0.5 * Math.sin(t * 0.2 + p.ph)); g.drawImage(fogSprite, x, H * (0.42 + i * 0.09) - 60, w, 220);
  }
  g.globalAlpha = pa; g.globalCompositeOperation = pc;
}
let vignette = null;
function drawVignette(g) {
  if (!vignette) { vignette = mk(W, H); const vg = vignette.getContext('2d'); const rg = vg.createRadialGradient(W / 2, H * 0.52, H * 0.34, W / 2, H * 0.52, H * 0.98); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,2,4,0.8)'); vg.fillStyle = rg; vg.fillRect(0, 0, W, H); }
  g.drawImage(vignette, 0, 0);
}

// ================= As figuras =================
// A figura: pequena, redonda e frágil. Manto branco-osso, capuz de ponta caída, uma brasa no peito.
function drawPlayer(g, x, y, o) {
  g.save(); g.translate(x, y);
  if (o.curl > 0) { g.translate(-8 * o.curl, 0); g.rotate(-1.38 * ease(o.curl)); }
  g.scale(o.face, 1);
  const run = o.ground && Math.abs(o.vx) > 40, air = !o.ground;
  const bob = run ? Math.abs(Math.sin(o.t * 17)) * 2.2 : Math.sin(o.t * 2.1) * 0.9;
  const sway = clamp(Math.abs(o.vx) / 300, 0, 1.6), lift = air ? clamp(-o.vy / 500, -1, 1) : 0;
  if (o.dash) { g.scale(1.45, 0.78); }
  if (o.land > 0) { const k = o.land / 0.14; g.scale(1 + 0.22 * k, 1 - 0.24 * k); }
  if (o.heal > 0) g.scale(1, 1 - 0.14 * Math.min(1, o.heal * 4));
  // pernas
  g.strokeStyle = '#11181b'; g.lineWidth = 3; g.lineCap = 'round';
  const sw = run ? Math.sin(o.t * 17) * 6 : 0;
  g.beginPath(); g.moveTo(-3, -11); g.lineTo(-3 + sw, air ? -4 : 0); g.moveTo(3, -11); g.lineTo(3 - sw, air ? -2 : 0); g.stroke();
  g.translate(0, -bob);
  // lâmina de galho queimado, com fio de brasa
  if (!(o.atk >= 0)) {
    g.save(); g.translate(-5, -20); g.rotate(2.2 + Math.sin(o.t * 2.1) * 0.04 - sway * 0.25);
    g.fillStyle = '#12191c'; g.beginPath(); g.moveTo(0, -2.5); g.lineTo(27, -1); g.lineTo(30, 0); g.lineTo(27, 1.4); g.lineTo(0, 2.5); g.closePath(); g.fill();
    g.strokeStyle = o.strong ? PAL.ember : rgba(PAL.ember, 0.55); g.lineWidth = o.strong ? 1.6 : 1; g.beginPath(); g.moveTo(5, -2.2); g.lineTo(28, -0.8); g.stroke();
    g.restore();
  }
  // manto
  const hem = -7 + lift * 4, back = -sway * 7 - (air ? 2 : 0);
  const cg = g.createLinearGradient(0, -40, 0, -4); cg.addColorStop(0, PAL.bone); cg.addColorStop(0.55, '#d6d3c6'); cg.addColorStop(1, PAL.boneShade);
  g.fillStyle = cg;
  g.beginPath(); g.moveTo(-6, -33); g.quadraticCurveTo(-13 + back * 0.4, -22, -13 + back, hem);
  g.lineTo(-9 + back * 0.8, hem + 4); g.lineTo(-5 + back * 0.6, hem - 1); g.lineTo(-1 + back * 0.4, hem + 4); g.lineTo(3 + back * 0.2, hem - 1); g.lineTo(7, hem + 4); g.lineTo(11, hem);
  g.quadraticCurveTo(11, -22, 6, -33); g.closePath(); g.fill();
  g.fillStyle = 'rgba(70,90,96,0.35)'; g.beginPath(); g.moveTo(-6, -33); g.quadraticCurveTo(-13 + back * 0.4, -22, -13 + back, hem); g.lineTo(-7 + back * 0.6, hem); g.quadraticCurveTo(-7, -20, -3, -33); g.closePath(); g.fill();
  // capuz com a ponta caída para trás
  g.fillStyle = PAL.bone;
  g.beginPath(); g.moveTo(-7, -44); g.quadraticCurveTo(-17 - sway * 6, -47 + lift * 3, -21 - sway * 9, -38 + lift * 6 + Math.sin(o.t * 3) * 1.5); g.quadraticCurveTo(-13 - sway * 3, -39, -8, -36); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(0.5, -39, 9.6, 9.2, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(70,90,96,0.3)'; g.beginPath(); g.ellipse(-3.5, -38, 5.5, 8, 0.2, 0, TAU); g.fill();
  // o rosto: um vão escuro com dois olhos de brasa
  g.fillStyle = '#080c0f'; g.beginPath(); g.ellipse(3.6, -38, 5.6, 6.2, 0.12, 0, TAU); g.fill();
  g.fillStyle = o.hurt ? '#fff' : PAL.ember; const blink = (o.t % 4.3) > 4.18 ? 0.25 : 1;
  g.beginPath(); g.ellipse(2.2, -38.4, 1.25, 1.5 * blink, 0, 0, TAU); g.ellipse(6.2, -38.4, 1.25, 1.5 * blink, 0, 0, TAU); g.fill();
  g.restore();
  // a brasa no peito
  const fx = x + (o.curl > 0 ? -18 * o.curl : 0), fy = y - 22 * (1 - 0.6 * (o.curl || 0));
  glow(g, fx, fy, 15 + Math.sin(o.t * 7) * 1.5, PAL.ember, 0.6 * (o.emberA === undefined ? 1 : o.emberA));
}
// O arco do golpe.
function drawSlash(g, x, y, face, p, dir, strong) { // dir: 0 para o lado · 1 para cima · 2 para baixo
  g.save(); g.translate(x, y); if (dir === 1) g.rotate(-Math.PI / 2 * face); else if (dir === 2) g.rotate(Math.PI / 2 * face); g.scale(face, 1);
  const a0 = -1.15 + p * 0.5, a1 = 0.95 + p * 0.25, R = tune.attack_range - 6, alpha = 1 - p;
  const gr = g.createRadialGradient(0, 0, R * 0.35, 0, 0, R); gr.addColorStop(0, rgba(strong ? PAL.ember : '#ffffff', 0)); gr.addColorStop(0.75, rgba(strong ? '#ffd9a0' : '#ffffff', 0.85 * alpha)); gr.addColorStop(1, rgba(PAL.ember, 0.5 * alpha));
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, a0, a1); g.arc(-R * 0.34, 0, R * (0.92 + p * 0.2), a1 * 0.72, a0 * 0.72, true); g.closePath(); g.fill();
  g.restore();
}

// Carcaça: um corpo de madeira carbonizada, corcunda, com um braço-porrete pesado.
function drawCarcaca(g, x, y, o) {
  g.save(); g.translate(x, y); g.scale(o.face, 1);
  const r = ease(clamp(o.rise, 0, 1)), h = 24 + 50 * r, sh = o.st === 'walk' ? Math.sin(o.t * 5) * 2 : 0, lit = o.flash ? '#e8ddff' : PAL.enemy;
  g.fillStyle = lit;
  if (r > 0.3) { limb(g, -9, -h * 0.3, -13 + sh, 0, 8, 6, -2); limb(g, 8, -h * 0.3, 11 - sh, 0, 8, 6, 2); }
  smooth(g, [[-22, 0], [-27, -h * 0.4], [-19, -h * 0.86], [-4, -h * 1.02], [12, -h * 0.93], [22, -h * 0.55], [20, -h * 0.1], [14, 0]]); g.fill();
  g.strokeStyle = rgba(PAL.ash, 0.4); g.lineWidth = 1.6; g.lineCap = 'round'; // a borda que pega a luz
  g.beginPath(); g.moveTo(-25, -h * 0.4); g.quadraticCurveTo(-20, -h * 0.9, -4, -h * 1.02); g.stroke();
  const hot = o.st === 'windup' ? 0.5 + o.p * 0.5 : o.st === 'sleep' ? 0.12 * r : 0.4;
  g.strokeStyle = rgba(PAL.violet, hot); g.lineWidth = 1.8; // rachaduras
  g.beginPath(); g.moveTo(-12, -h * 0.75); g.lineTo(-6, -h * 0.55); g.lineTo(-11, -h * 0.38); g.moveTo(6, -h * 0.7); g.lineTo(2, -h * 0.5); g.lineTo(8, -h * 0.3); g.lineTo(4, -h * 0.14); g.stroke();
  // cabeça: um toco quebrado, com um olho oco
  const hx = 13 * r + 4, hy = -h * 0.98 + (1 - r) * 8;
  g.fillStyle = lit; g.beginPath(); g.moveTo(hx - 10, hy + 8); g.lineTo(hx - 11, hy - 8); g.lineTo(hx - 6, hy - 15); g.lineTo(hx - 2, hy - 9); g.lineTo(hx + 3, hy - 17); g.lineTo(hx + 7, hy - 8); g.lineTo(hx + 11, hy - 11); g.lineTo(hx + 12, hy + 6); g.closePath(); g.fill();
  g.fillStyle = '#020304'; g.beginPath(); g.ellipse(hx + 4, hy - 2, 3.6, 4.4, 0, 0, TAU); g.fill();
  // o braço-porrete
  let a = 1.3;
  if (o.st === 'windup') a = lerp(1.3, -2.1, ease(o.p)); else if (o.st === 'slam') a = lerp(-2.1, 0.75, Math.min(1, o.p * 3)); else if (o.st === 'recover') a = lerp(0.75, 1.3, ease(o.p)); else if (o.st === 'walk') a = 1.3 + Math.sin(o.t * 5) * 0.08;
  g.save(); g.translate(9, -h * 0.74); g.rotate(a); g.fillStyle = o.flash ? '#e8ddff' : '#10171a';
  limb(g, 0, 0, 34 * r + 8, 0, 6, 5, 3); smooth(g, [[30 * r + 6, -6], [48 * r + 10, -10], [60 * r + 12, -4], [58 * r + 12, 8], [44 * r + 8, 11], [30 * r + 6, 6]]); g.fill();
  g.strokeStyle = rgba(PAL.ash, 0.35); g.lineWidth = 1.4; g.beginPath(); g.moveTo(32 * r + 6, -7); g.lineTo(56 * r + 12, -7); g.stroke();
  g.restore(); g.restore();
  glow(g, x + o.face * (13 * r + 8), y - h * 0.98 + (1 - r) * 8 - 2, 13 + hot * 14, PAL.violet, hot * 1.1);
}
// Mariposa de fuligem: asas rasgadas, um olho só.
function drawMariposa(g, x, y, o) {
  g.save(); g.translate(x + (o.st === 'tele' ? Math.sin(o.t * 70) * 2.5 : 0), y); g.rotate(o.tilt || 0);
  const f = Math.cos(o.t * (o.st === 'dive' ? 34 : 19)), col = o.flash ? '#e8ddff' : '#1c2428';
  for (const s of [-1, 1]) {
    g.save(); g.scale(s, 0.3 + 0.7 * Math.abs(f)); g.fillStyle = col;
    g.beginPath(); g.moveTo(1, -3); g.quadraticCurveTo(10, -22, 24, -17); g.lineTo(20, -10); g.lineTo(27, -5); g.lineTo(20, -1); g.lineTo(23, 6); g.lineTo(15, 5); g.lineTo(13, 12); g.quadraticCurveTo(5, 9, 1, 3); g.closePath(); g.fill();
    g.strokeStyle = rgba(PAL.ash, 0.45); g.lineWidth = 1.2; g.beginPath(); g.moveTo(3, -6); g.quadraticCurveTo(11, -20, 24, -17); g.stroke();
    g.restore();
  }
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 1, 4.2, 9, 0, 0, TAU); g.fill();
  g.strokeStyle = col; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-1.5, -7); g.quadraticCurveTo(-5, -14, -8, -13); g.moveTo(1.5, -7); g.quadraticCurveTo(5, -14, 8, -13); g.stroke();
  g.restore();
  glow(g, x, y - 4, o.st === 'tele' ? 16 : 9, PAL.violet, o.st === 'tele' ? 1 : 0.75);
}
// Espinheiro: uma cúpula baixa de sarça que anda e eriça.
function drawEspinheiro(g, x, y, o) {
  g.save(); g.translate(x, y); g.scale(o.face, 1);
  const br = o.st === 'bristle' ? ease(o.p) : o.st === 'fire' ? 1 - o.p : 0, col = o.flash ? '#e8ddff' : '#151c1f';
  g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const lx = -17 + i * 8.5, s = Math.sin(o.t * 9 + i * 1.7) * (o.st === 'walk' ? 2.5 : 0); g.beginPath(); g.moveTo(lx, -5); g.lineTo(lx + s - 2, 0); g.stroke(); }
  for (let i = 0; i < 8; i++) { // espinhos
    const a = Math.PI * (1.06 + (i / 7) * 0.88), len = 9 + (i % 2) * 4 + br * 15, bx = Math.cos(a) * 19, by = -5 + Math.sin(a) * 15;
    const sg2 = g.createLinearGradient(bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len); sg2.addColorStop(0, col); sg2.addColorStop(1, br > 0.2 ? PAL.violetPale : PAL.violet);
    g.fillStyle = sg2; const nx = -Math.sin(a) * 3.2, ny = Math.cos(a) * 3.2;
    g.beginPath(); g.moveTo(bx + nx, by + ny); g.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len); g.lineTo(bx - nx, by - ny); g.closePath(); g.fill();
  }
  g.fillStyle = col; g.beginPath(); g.moveTo(-23, -3); g.quadraticCurveTo(-22, -24, 0, -24); g.quadraticCurveTo(22, -24, 23, -3); g.quadraticCurveTo(0, 1, -23, -3); g.closePath(); g.fill();
  g.strokeStyle = rgba(PAL.ash, 0.35); g.lineWidth = 1.4; g.beginPath(); g.moveTo(-21, -10); g.quadraticCurveTo(-18, -23, 0, -24); g.stroke();
  g.fillStyle = PAL.ash; g.beginPath(); g.ellipse(13, -8, 1.6, 2, 0, 0, TAU); g.ellipse(18, -7, 1.4, 1.8, 0, 0, TAU); g.fill();
  g.restore();
  if (br > 0) glow(g, x, y - 14, 34, PAL.violet, br * 0.7);
}
// O Vigia Oco: um tronco oco de pé, máscara de osso, galhadas mortas.
function drawVigia(g, x, y, o) {
  g.save(); g.translate(x, y); g.scale(o.face, 1);
  const col = o.flash ? '#e8ddff' : '#131a1d', dark = o.flash ? '#e8ddff' : '#0d1316', st = Math.sin(o.t * (o.st === 'charge' ? 22 : 3)) * (o.st === 'charge' ? 7 : 1.5);
  const crouch = o.crouch || 0;
  g.fillStyle = dark; // pernas de raiz
  limb(g, -13, -46 + crouch * 14, -24 + st, 0, 10, 7, -5); limb(g, 12, -46 + crouch * 14, 20 - st, 0, 10, 7, 5);
  for (const s of [-24 + st, 20 - st]) { limb(g, s, -3, s - 13, 0, 4, 1.5, 0); limb(g, s, -3, s + 14, 0, 4, 1.5, 0); }
  g.translate(0, -44 + crouch * 14); g.rotate(o.tilt || 0);
  // braço de trás
  g.fillStyle = dark; g.save(); g.translate(-18, -44); g.rotate((o.arm2 === undefined ? 0.5 : o.arm2)); limb(g, 0, 0, 6, 40, 6, 5, -4); limb(g, 6, 40, 16, 70, 5, 3, 3); g.restore();
  // o tronco
  g.fillStyle = col; smooth(g, [[-22, 2], [-27, -24], [-30, -50], [-20, -58], [4, -60], [26, -54], [28, -26], [22, 2], [0, 6]]); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const lx = -22 + i * 9; g.beginPath(); g.moveTo(lx, -52 + (i % 2) * 6); g.quadraticCurveTo(lx + 3, -30, lx - 1, -4 - (i % 3) * 5); g.stroke(); }
  g.strokeStyle = rgba(PAL.ash, 0.4); g.lineWidth = 1.8; g.beginPath(); g.moveTo(-26, -24); g.quadraticCurveTo(-30, -52, -19, -58); g.stroke();
  g.fillStyle = '#010203'; g.beginPath(); g.ellipse(3, -28, 12, 17, 0.08, 0, TAU); g.fill(); // o oco
  // cabeça: máscara de osso, voltada para a frente
  g.save(); g.translate(8, -60); g.rotate(o.head || 0);
  g.fillStyle = dark; limb(g, -2, 4, 6, -8, 8, 7, 0);
  g.strokeStyle = dark; g.lineCap = 'round'; // galhadas
  const ant = (bx, by, s) => { g.lineWidth = 5; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 4 * s, by - 20, bx - 14 * s, by - 36); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 3 * s, by - 14); g.lineTo(bx + 10 * s, by - 26); g.moveTo(bx - 9 * s, by - 28); g.lineTo(bx - 1 * s, by - 44); g.moveTo(bx - 14 * s, by - 36); g.lineTo(bx - 26 * s, by - 44); g.moveTo(bx - 14 * s, by - 36); g.lineTo(bx - 12 * s, by - 52); g.stroke(); };
  ant(2, -12, 1); ant(12, -12, -0.8);
  g.fillStyle = o.flash ? '#fff' : '#a3aeab'; smooth(g, [[-4, -14], [12, -16], [28, -9], [36, 0], [30, 7], [14, 4], [2, 2], [-5, -4]]); g.fill();
  g.fillStyle = 'rgba(40,52,56,0.5)'; smooth(g, [[2, 0], [14, 2], [30, 6], [14, 5]]); g.fill();
  g.fillStyle = '#020304'; g.beginPath(); g.ellipse(11, -7, 4.6, 3.6, 0.3, 0, TAU); g.fill(); g.beginPath(); g.ellipse(31, 0, 1.6, 2.4, 0, 0, TAU); g.fill();
  g.restore();
  // braço da frente, com garra de galho
  g.fillStyle = col; g.save(); g.translate(20, -46); g.rotate(o.arm === undefined ? 0.35 : o.arm);
  limb(g, 0, 0, 4, 42, 7, 6, 5); limb(g, 4, 42, 0, 78, 6, 4, -4);
  for (const k of [-0.5, 0, 0.5]) limb(g, 0, 78, Math.sin(k) * 20, 78 + Math.cos(k) * 20, 2.6, 0.6, 0);
  g.restore(); g.restore();
  const hot = o.rage || o.st === 'tele' || o.st === 'crouch' || o.st === 'swipeup' ? 1 : 0.6, hx = x + o.face * 3, hy = y - 72 + crouch * 14;
  if (o.rage) for (let i = 0; i < 4; i++) glow(g, x + o.face * (-6 + i * 12), y - 150 + crouch * 14 + Math.sin(o.t * 9 + i * 1.7) * 6, 16, PAL.violet, 0.7); // as galhadas em chamas
  glow(g, hx, hy, 26 + Math.sin(o.t * 8) * 3 + hot * 10, PAL.violet, hot);
  glow(g, x + o.face * (19 + Math.sin(o.tilt || 0) * 40), y - 110 + crouch * 14 + Math.abs(Math.sin(o.tilt || 0)) * 22, 12, PAL.violet, hot);
}
// A Enlutada: alta, velada, flutuando; guarda uma chama violeta entre as mãos.
function drawEnlutada(g, x, y, o) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0.01) return;
  glow(g, x, y - 66, o.rage ? 230 : 150, o.rage ? PAL.violet : PAL.violetDeep, (o.rage ? 0.6 : 0.5) * a);
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(o.face, 1); g.rotate(o.tilt || 0);
  const w = k => Math.sin(o.t * 2.2 + k) * 4, col = o.flash ? '#f0e6ff' : '#1f1730';
  // o corpo: um manto longo que se desfaz em farrapos
  const bgd = g.createLinearGradient(0, -120, 0, 6); bgd.addColorStop(0, col); bgd.addColorStop(0.7, o.flash ? '#f0e6ff' : '#130e20'); bgd.addColorStop(1, 'rgba(12,8,22,0)');
  g.fillStyle = bgd;
  g.beginPath(); g.moveTo(-8, -112); g.quadraticCurveTo(-24, -98, -22, -70); g.quadraticCurveTo(-30 + w(0), -36, -34 + w(1), -6);
  g.lineTo(-26 + w(2), 4); g.lineTo(-20 + w(1), -8); g.lineTo(-12 + w(3), 8); g.lineTo(-5 + w(2), -6); g.lineTo(2 + w(4), 10); g.lineTo(9 + w(3), -6); g.lineTo(17 + w(5), 6); g.lineTo(23 + w(4), -8); g.lineTo(31 + w(5), 2);
  g.quadraticCurveTo(30 + w(1), -40, 22, -70); g.quadraticCurveTo(24, -98, 8, -112); g.closePath(); g.fill();
  // braços finos
  g.fillStyle = o.flash ? '#fff' : '#8d82ab';
  const up = o.arms || 0; // 0 mãos juntas no peito · 1 braços abertos para o alto
  for (const s of [-1, 1]) { const ex = s * lerp(15, 38, up), ey = lerp(-72, -118, up), hx2 = s * lerp(4, 52, up), hy2 = lerp(-64, -150, up); limb(g, s * 17, -98, ex, ey, 3.4, 2.6, s * 4); limb(g, ex, ey, hx2, hy2, 2.6, 1.8, -s * 3); }
  // cabeça baixa sob o véu, com coroa de gravetos queimados
  g.fillStyle = '#0a0812'; g.beginPath(); g.ellipse(2, -116, 11, 13, 0.15, 0, TAU); g.fill();
  g.strokeStyle = '#0b0a12'; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const ax = -9 + i * 3.4; g.beginPath(); g.moveTo(ax, -126); g.lineTo(ax + (i - 3) * 2.2, -140 - (i % 2) * 7 - (i === 3 ? 6 : 0)); g.stroke(); }
  g.fillStyle = rgba('#7c6aa6', o.flash ? 0.9 : 0.5); // o véu
  g.beginPath(); g.moveTo(-10, -128); g.quadraticCurveTo(4, -134, 14, -126); g.quadraticCurveTo(22, -100, 18 + w(2), -70); g.quadraticCurveTo(8, -64, -2 + w(1), -58); g.quadraticCurveTo(-16, -66, -20 + w(3), -76); g.quadraticCurveTo(-18, -104, -10, -128); g.closePath(); g.fill();
  g.strokeStyle = rgba('#c9b8ee', 0.3); g.lineWidth = 1.2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-6 + i * 6, -126); g.quadraticCurveTo(-8 + i * 7, -96, -12 + i * 8 + w(i), -66); g.stroke(); }
  g.strokeStyle = PAL.violetPale; g.lineWidth = 1.8; // duas lágrimas de luz
  g.beginPath(); g.moveTo(1, -117); g.lineTo(1, -108); g.moveTo(8, -117); g.lineTo(8, -109); g.stroke();
  g.restore();
  const fy = y - lerp(64, 150, o.arms || 0);
  if ((o.arms || 0) < 0.5) glow(g, x + o.face * 3, fy, 20 + Math.sin(o.t * 9) * 3, PAL.violet, a); else for (const s of [-1, 1]) glow(g, x + s * 52, fy, 22, PAL.violet, a);
  glow(g, x + o.face * 4, y - 113, 12, PAL.violetPale, 0.7 * a);
}
// A Rainha de Fuligem: uma mariposa enorme, com um olho em cada asa.
function drawRainha(g, x, y, o) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0.01) return;
  glow(g, x, y, 180, PAL.violetDeep, 0.34 * a * (o.rage ? 1.6 : 1));
  g.save(); g.globalAlpha *= a; g.translate(x + (o.st === 'tele' ? Math.sin(o.t * 60) * 3 : 0), y); g.rotate(o.tilt || 0);
  const f = o.st === 'stuck' ? 0.3 : Math.cos(o.t * (o.st === 'dive' ? 30 : o.st === 'gust' ? 16 : 8)), col = o.flash ? '#efe6ff' : '#161c20';
  for (const s of [-1, 1]) {
    g.save(); g.scale(s, 0.32 + 0.68 * Math.abs(f)); g.fillStyle = col;
    g.beginPath(); g.moveTo(4, 6); g.quadraticCurveTo(40, 18, 74, 44); g.lineTo(62, 46); g.lineTo(66, 60); g.lineTo(50, 54); g.lineTo(46, 70); g.lineTo(34, 56); g.quadraticCurveTo(14, 44, 4, 14); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(4, -8); g.quadraticCurveTo(40, -74, 112, -66); g.lineTo(98, -50); g.lineTo(118, -38); g.lineTo(98, -26); g.lineTo(110, -8); g.lineTo(88, -8); g.lineTo(86, 12); g.quadraticCurveTo(40, 20, 4, 8); g.closePath(); g.fill();
    g.strokeStyle = rgba(PAL.ash, 0.5); g.lineWidth = 1.6; g.beginPath(); g.moveTo(8, -12); g.quadraticCurveTo(42, -70, 110, -65); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1.4; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(6, -4); g.quadraticCurveTo(40, -40 + i * 10, 96 - i * 4, -52 + i * 13); g.stroke(); }
    g.fillStyle = '#05070a'; g.beginPath(); g.ellipse(70, -36, 15, 13, 0, 0, TAU); g.fill();
    g.fillStyle = o.flash ? '#fff' : (o.rage ? PAL.violetPale : PAL.violet); g.beginPath(); g.ellipse(70, -36, 8, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#05070a'; g.beginPath(); g.ellipse(70, -36, 3, 3, 0, 0, TAU); g.fill();
    g.restore();
  }
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 22, 11, 30, 0, 0, TAU); g.fill();
  g.strokeStyle = rgba(PAL.ash, 0.25); g.lineWidth = 1.2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-10 + i, 10 + i * 10); g.lineTo(10 - i, 10 + i * 10); g.stroke(); }
  g.fillStyle = o.flash ? '#fff' : '#9aa7a6'; // gola de penugem
  for (let i = 0; i < 9; i++) { const an = Math.PI * (1.05 + i * 0.11); g.beginPath(); g.ellipse(Math.cos(an) * 14, 4 + Math.sin(an) * 10, 7, 4, an, 0, TAU); g.fill(); }
  g.fillStyle = col; g.beginPath(); g.ellipse(0, -12, 10, 9, 0, 0, TAU); g.fill();
  g.strokeStyle = col; g.lineWidth = 2; g.lineCap = 'round'; // antenas plumosas
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(s * 4, -19); g.quadraticCurveTo(s * 14, -44, s * 30, -50); g.stroke();
    for (let i = 1; i < 6; i++) { const k = i / 6, px = s * (4 + 26 * k * k + 10 * k * (1 - k)), py = -19 - 31 * k - 12 * k * (1 - k); g.beginPath(); g.moveTo(px, py); g.lineTo(px + s * 5, py + 7); g.stroke(); }
  }
  g.restore();
  glow(g, x - 4, y - 13, 9, PAL.violetPale, a); glow(g, x + 4, y - 13, 9, PAL.violetPale, a);
  for (const s of [-1, 1]) glow(g, x + s * 70 * (0.32 + 0.68 * Math.abs(f)) * 0 + s * 70, y - 36 * (0.32 + 0.68 * Math.abs(f)), 30, PAL.violet, 0.5 * a);
}
// Eco: um resto de voz; chegar perto faz a frase aparecer.
function drawEco(g, x, y, found, t) {
  const by = y - 48 + Math.sin(t * 1.3 + x) * 5, a = found ? 0.4 : 1;
  glow(g, x, by, 70, '#bfe9e2', 0.28 * a); glow(g, x, by, 15, '#ffffff', 0.85 * a);
  g.strokeStyle = rgba('#dff5f0', 0.55 * a); g.lineWidth = 1.3; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const r = 10 + i * 7 + Math.sin(t * 2 + i) * 2, a0 = t * (0.6 + i * 0.2) + i * 2; g.beginPath(); g.arc(x, by, r, a0, a0 + 1.6); g.stroke(); }
}
// O lago de fuligem: água preta, uma linha de luz na superfície, reflexos lentos.
function drawLake(g, r, t, cx, vw) {
  const L = r.lake, x0 = Math.max(L.x0 * T, cx - 20), x1 = Math.min((L.x1 + 1) * T, cx + vw + 20), y = L.y * T + 8, h = r.h * T - y;
  if (x1 <= x0) return;
  const lg = g.createLinearGradient(0, y, 0, y + h); lg.addColorStop(0, '#2b6a70'); lg.addColorStop(0.12, '#12343c'); lg.addColorStop(0.5, '#07141a'); lg.addColorStop(1, '#020507'); g.fillStyle = lg; g.fillRect(x0, y, x1 - x0, h);
  const W2 = (L.x1 + 1 - L.x0) * T;
  for (let i = 0; i < 14; i++) { // o brilho do fundo, espelhado em faixas verticais
    const p = ASH[i * 9 + 4], rx = L.x0 * T + (((p.x * 7.3) % W2) + W2) % W2, w = 30 + p.sz * 26; if (rx < x0 - 80 || rx > x1 + 80) continue;
    const sg = g.createLinearGradient(0, y, 0, y + h * 0.8); sg.addColorStop(0, rgba('#a9dcd5', 0.16 + 0.06 * Math.sin(t * 0.7 + p.ph))); sg.addColorStop(1, rgba('#a9dcd5', 0)); g.fillStyle = sg; g.fillRect(rx - w / 2 + Math.sin(t * 0.9 + p.ph) * 4, y, w, h * 0.8);
  }
  g.lineCap = 'round';
  for (let i = 0; i < 46; i++) { // ondulações lentas
    const p = ASH[i * 5 + 2], rx = L.x0 * T + (((p.x * 3.7 + t * 5 * p.f) % W2) + W2) % W2, k = (p.y % 100) / 100, ry = y + 6 + k * k * Math.max(8, h - 14); if (rx < x0 - 40 || rx > x1 + 40) continue;
    g.strokeStyle = rgba(i % 5 ? '#bfe6df' : PAL.violetPale, (0.3 - 0.2 * k) * (0.6 + 0.4 * Math.sin(t * p.f + p.ph))); g.lineWidth = 1.3; g.beginPath(); g.moveTo(rx - 24 * p.z, ry); g.lineTo(rx + 24 * p.z, ry); g.stroke();
  }
  g.strokeStyle = rgba('#d6f2ec', 0.75); g.lineWidth = 1.8; g.beginPath(); // a linha da superfície
  for (let x = Math.floor(x0 / 16) * 16; x <= x1 + 16; x += 16) { const yy = y + Math.sin(x * 0.021 + t * 0.9) * 1.8; if (x <= x0) g.moveTo(x, yy); else g.lineTo(x, yy); }
  g.stroke();
  for (let i = 0; i < 8; i++) { const p = ASH[i * 13 + 1], rx = L.x0 * T + (((p.x * 5.1) % W2) + W2) % W2, k = ((t * 0.12 * p.f + p.ph) % 1 + 1) % 1; if (rx < x0 || rx > x1) continue; glow(g, rx, y + 4 - k * 46, 7 + k * 10, PAL.violet, (1 - k) * 0.5); } // a fuligem sobe em fios violeta: perigo
}
// Broto de save: apagado até você tocar.
function drawBroto(g, x, y, lit, t) {
  const p = lit ? 0.7 + 0.3 * Math.sin(t * 2.4) : 0;
  if (!lit) glow(g, x, y - 26, 46, PAL.sprout, 0.16 + 0.12 * Math.sin(t * 1.7));
  if (lit) { glow(g, x, y - 26, 120, PAL.sproutDeep, 0.35 * p); glow(g, x, y - 28, 34, PAL.sprout, 0.9 * p); }
  g.save(); g.translate(x, y); const sw = Math.sin(t * 1.4) * 1.5;
  g.strokeStyle = lit ? PAL.sproutDeep : '#4d6f70'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-5, -14, sw, -27); g.stroke();
  g.fillStyle = lit ? PAL.sprout : '#6f9895';
  g.beginPath(); g.moveTo(sw, -27); g.quadraticCurveTo(-13 + sw, -37, -17 + sw, -27); g.quadraticCurveTo(-9 + sw, -24, sw, -27); g.fill();
  g.beginPath(); g.moveTo(sw, -27); g.quadraticCurveTo(10 + sw, -42, 18 + sw, -32); g.quadraticCurveTo(10 + sw, -27, sw, -27); g.fill();
  g.beginPath(); g.ellipse(sw, -30, 3, 4.5, 0, 0, TAU); g.fill();
  g.restore();
  if (lit) for (let i = 0; i < 5; i++) { const k = ((t * 0.22 + i * 0.2) % 1); glow(g, x + Math.sin(i * 2.4 + t) * 22, y - 20 - k * 70, 5, PAL.sprout, (1 - k) * 0.8); }
}
// O grande broto do fim.
function drawGreatSprout(g, x, y, grow, t) {
  const k = ease(clamp(grow, 0, 1)); if (k <= 0) return;
  glow(g, x, y - 90 * k, 260 * k, PAL.sproutDeep, 0.4 * k); glow(g, x, y - 100 * k, 70 * k, PAL.sprout, 0.9);
  g.save(); g.translate(x, y); g.strokeStyle = PAL.sproutDeep; g.lineWidth = 6 * k + 1; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-18 * k, -40 * k, 14 * k, -70 * k, Math.sin(t) * 3, -108 * k); g.stroke();
  g.fillStyle = PAL.sprout;
  for (const [sx, sy, lx, ly] of [[-1, 0.55, -46, -16], [1, 0.72, 50, -20], [-1, 0.95, -30, -30], [1, 1, 34, -32]]) {
    const bx = sx * 3, by = -108 * k * sy; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + lx * k * 0.5, by + ly * k * 1.4, bx + lx * k, by + ly * k * 0.4); g.quadraticCurveTo(bx + lx * k * 0.5, by + 6, bx, by); g.fill();
  }
  g.restore();
}
// Coisas para pegar.
function drawItem(g, x, y, id, t) {
  const by = y - 30 + Math.sin(t * 2) * 4, c = id === 'impeto' || id === 'asas' ? PAL.violetPale : PAL.ember;
  glow(g, x, by, 70, c, 0.4); glow(g, x, by, 22, '#ffffff', 0.7);
  g.save(); g.translate(x, by);
  if (id === 'lamina') { g.rotate(-0.8); g.fillStyle = '#12191c'; g.beginPath(); g.moveTo(-16, -3); g.lineTo(14, -1.5); g.lineTo(19, 0); g.lineTo(14, 2); g.lineTo(-16, 3); g.closePath(); g.fill(); g.strokeStyle = PAL.ember; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -2.6); g.lineTo(17, -0.4); g.stroke(); }
  else if (id === 'fragmento') { g.fillStyle = PAL.ember; g.beginPath(); g.moveTo(0, -13); g.quadraticCurveTo(10, -2, 6, 8); g.quadraticCurveTo(0, 13, -6, 8); g.quadraticCurveTo(-10, -2, 0, -13); g.fill(); g.fillStyle = '#fff3d6'; g.beginPath(); g.ellipse(0, 3, 2.6, 5, 0, 0, TAU); g.fill(); }
  else if (id === 'asas') { g.fillStyle = '#e9e2f5'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, 4); g.quadraticCurveTo(s * 12, -18, s * 26, -14); g.lineTo(s * 20, -6); g.lineTo(s * 26, 0); g.lineTo(s * 17, 3); g.lineTo(s * 19, 11); g.quadraticCurveTo(s * 8, 9, 0, 4); g.fill(); } g.fillStyle = '#1a1230'; g.beginPath(); g.ellipse(0, 2, 2.6, 8, 0, 0, TAU); g.fill(); }
  else { g.fillStyle = PAL.violetPale; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(s * 10, -6, s * 22, -12); g.quadraticCurveTo(s * 14, 0, s * 16, 6); g.quadraticCurveTo(s * 8, 2, 0, 6); g.fill(); } g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 2, 3, 6, 0, 0, TAU); g.fill(); }
  g.restore();
}
// Projéteis e perigos dos inimigos.
function drawShot(g, s, t) {
  if (s.k === 'dart') { g.save(); g.translate(s.x, s.y); g.scale(Math.sign(s.vx) || 1, 1); const dg = g.createLinearGradient(-26, 0, 20, 0); dg.addColorStop(0, rgba(PAL.violet, 0)); dg.addColorStop(0.6, '#1a1230'); dg.addColorStop(1, PAL.violetPale); g.fillStyle = dg; g.beginPath(); g.moveTo(-26, -1.5); g.lineTo(4, -5); g.lineTo(20, 0); g.lineTo(4, 5); g.lineTo(-26, 1.5); g.closePath(); g.fill(); g.restore(); glow(g, s.x, s.y, 22, PAL.violet, 0.8); }
  else if (s.k === 'thorn') { g.save(); g.translate(s.x, s.y); g.rotate(Math.atan2(s.vy, s.vx)); const sg2 = g.createLinearGradient(-12, 0, 12, 0); sg2.addColorStop(0, '#151c1f'); sg2.addColorStop(1, PAL.violetPale); g.fillStyle = sg2; g.beginPath(); g.moveTo(-12, -3.4); g.lineTo(13, 0); g.lineTo(-12, 3.4); g.closePath(); g.fill(); g.restore(); glow(g, s.x, s.y, 14, PAL.violet, 0.7); }
  else if (s.k === 'shock') { const d = Math.sign(s.vx); g.save(); g.translate(s.x, s.y); g.scale(d, 1); g.fillStyle = '#0e1417'; g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-10, -30, 10, -46); g.quadraticCurveTo(22, -40, 14, -26); g.quadraticCurveTo(24, -20, 18, 0); g.closePath(); g.fill(); g.strokeStyle = rgba(PAL.violetPale, 0.8); g.lineWidth = 2; g.beginPath(); g.moveTo(-20, -6); g.quadraticCurveTo(-6, -30, 10, -44); g.stroke(); g.restore(); glow(g, s.x, s.y - 22, 44, PAL.violet, 0.6); }
  else if (s.k === 'wisp') { glow(g, s.x, s.y, 30, PAL.violet, 0.9); g.fillStyle = '#0c0816'; g.beginPath(); g.ellipse(s.x, s.y, 5, 6.5, 0, 0, TAU); g.fill(); g.fillStyle = PAL.violetPale; g.beginPath(); g.moveTo(s.x - 6, s.y - 3); g.quadraticCurveTo(s.x - s.vx * 0.05, s.y - 20 - Math.sin(t * 14 + s.x) * 4, s.x + 6, s.y - 3); g.quadraticCurveTo(s.x, s.y + 2, s.x - 6, s.y - 3); g.fill(); }
  else if (s.k === 'pillar') {
    const gy = s.y;
    if (s.t < s.warn) { const p = s.t / s.warn, hw = s.w / 2 * (0.35 + 0.65 * p);
      const lg = g.createLinearGradient(0, gy - 520, 0, gy); lg.addColorStop(0, rgba('#0a0616', 0)); lg.addColorStop(1, rgba('#0a0616', 0.5 + 0.25 * p)); g.fillStyle = lg; g.fillRect(s.x - hw, gy - 520, hw * 2, 520);
      g.fillStyle = rgba(PAL.violetPale, 0.25 + 0.6 * p); g.fillRect(s.x - hw, gy - 520 * p, 1.5, 520 * p); g.fillRect(s.x + hw - 1.5, gy - 520 * p, 1.5, 520 * p);
      glow(g, s.x, gy - 4, 34 + p * 26, PAL.violet, 0.4 + p * 0.6); g.fillStyle = rgba('#ffffff', 0.35 + 0.6 * p); g.fillRect(s.x - s.w / 2, gy - 3, s.w, 3); }
    else { const p = (s.t - s.warn) / s.live, a = 1 - p * p; const lg = g.createLinearGradient(s.x - s.w / 2, 0, s.x + s.w / 2, 0); lg.addColorStop(0, rgba(PAL.violet, 0)); lg.addColorStop(0.3, rgba(PAL.violet, 0.75 * a)); lg.addColorStop(0.5, rgba('#ffffff', 0.9 * a)); lg.addColorStop(0.7, rgba(PAL.violet, 0.75 * a)); lg.addColorStop(1, rgba(PAL.violet, 0)); g.fillStyle = lg; g.fillRect(s.x - s.w / 2, -10, s.w, gy + 10); glow(g, s.x, gy - 10, 80, PAL.violet, a); }
  }
}

// ================= O pesadelo: a tela se rasga num vórtice violeta =================
const VORTEX = [];
for (let i = 0; i < 44; i++) VORTEX.push({ a: vr() * TAU, r: lerp(120, 760, vr()), s: lerp(8, 44, vr()), k: Math.floor(vr() * 4), sp: lerp(0.5, 1.4, vr()), rot: vr() * TAU });
function drawVortex(g, p, t, snap, shards) {
  const cx = W / 2, cy = H * 0.46;
  g.fillStyle = '#07040f'; g.fillRect(0, 0, W, H);
  glow(g, cx, cy, 760, PAL.violetDeep, 0.85); glow(g, cx, cy, 430, PAL.violet, 0.55);
  g.save(); g.translate(cx, cy); g.lineCap = 'round'; // os braços da espiral
  g.scale(1, 0.82);
  for (let i = 0; i < 150; i++) {
    const q = VORTEX[i % VORTEX.length], a = q.a + i * 0.9 - t * (0.5 + 180 / (q.r + 80)) * q.sp, r = q.r * (0.12 + 1.05 * ((i * 37) % 100) / 100);
    g.strokeStyle = i % 4 === 0 ? rgba('#07040f', 0.5) : rgba(i % 3 ? PAL.violet : PAL.violetPale, 0.06 + 0.2 * (1 - r / 800));
    g.lineWidth = 2 + (r / 760) * (i % 4 === 0 ? 40 : 18); g.beginPath(); g.arc(0, 0, r, a, a + 0.7 + 260 / (r + 90)); g.stroke();
  }
  g.restore();
  if (snap) for (const s of shards) { // os pedaços do mundo, sugados
    const k = clamp(p * 1.25 - s.d * 0.3, 0, 1), e = k * k, ang = s.ang + e * (2.6 + s.sp), dist = s.dist * (1 - e), sc = 1 - e * 0.96;
    if (sc < 0.03) continue;
    g.save(); g.translate(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist * 0.8); g.rotate(e * s.rot); g.scale(sc, sc); g.globalAlpha = 1 - e * 0.5;
    g.drawImage(snap, s.sx * (snap.width / W), s.sy * (snap.height / H), s.sw * (snap.width / W), s.sh * (snap.height / H), -s.sw / 2, -s.sh / 2, s.sw, s.sh);
    g.strokeStyle = rgba(PAL.violetPale, 0.5 * e); g.lineWidth = 2; g.strokeRect(-s.sw / 2, -s.sh / 2, s.sw, s.sh); g.restore();
  }
  g.save(); g.translate(cx, cy); // escombros suspensos: degraus, tábuas, lascas
  for (const q of VORTEX) {
    const a = q.a - t * (0.35 + 150 / (q.r + 60)) * q.sp, r = q.r * (1 - 0.25 * p), x = Math.cos(a) * r, y = Math.sin(a) * r * 0.78, s = q.s * (0.4 + r / 700);
    g.save(); g.translate(x, y); g.rotate(q.rot + t * q.sp); g.fillStyle = '#0a0714';
    if (q.k === 0) { for (let i = 0; i < 4; i++) g.fillRect(-s + i * s * 0.5, s * 0.5 - i * s * 0.34, s * 0.5, s * 0.34 * (i + 1) * 0.5 + 3); }
    else if (q.k === 1) g.fillRect(-s, -s * 0.16, s * 2, s * 0.32);
    else if (q.k === 2) { g.beginPath(); g.moveTo(-s * 0.8, s * 0.4); g.lineTo(0, -s * 0.8); g.lineTo(s * 0.7, s * 0.5); g.closePath(); g.fill(); }
    else { g.fillRect(-s * 0.2, -s, s * 0.4, s * 2); g.fillRect(-s * 0.7, -s * 0.5, s * 1.4, s * 0.22); }
    g.restore();
  }
  g.restore();
  glow(g, cx, cy, 150 + Math.sin(t * 5) * 14, '#ffffff', 0.5 + 0.4 * p); glow(g, cx, cy, 60, '#ffffff', 0.9);
}

// ================= Texto =================
function textGlow(g, s, x, y, size, col, glowCol, a = 1, align = 'center', italic = false) {
  g.save(); g.globalAlpha *= a; g.font = `${italic ? 'italic ' : ''}${size}px ${FONT}`; g.textAlign = align; g.textBaseline = 'middle';
  g.shadowColor = glowCol; g.shadowBlur = size * 0.7; g.fillStyle = col; g.fillText(s, x, y); g.shadowBlur = 0; g.fillText(s, x, y); g.restore();
}
function wrapLines(g, s, size, maxW) {
  g.font = `italic ${size}px ${FONT}`; const words = s.split(' '), out = []; let line = '';
  for (const w of words) { const t2 = line ? line + ' ' + w : w; if (g.measureText(t2).width > maxW && line) { out.push(line); line = w; } else line = t2; }
  if (line) out.push(line); return out;
}
