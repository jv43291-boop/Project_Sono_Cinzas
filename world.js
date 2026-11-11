// PROTOTYPE - NOT FOR PRODUCTION
// Question: o silêncio e o luto chegam de verdade em quem joga, e a luta punitiva dá vontade de tentar de novo?
// Date: 2026-11-10
'use strict';
// O mundo: oito salas ligadas, em blocos de 40 px. Só dados; a lógica está em index.html.

const T = 40;
// Códigos de bloco: 0 vazio · 1 sólido · 2 galho (só segura por cima) · 3 espinhos
// 4 parede rachada (quebra com golpes) · 5 treliça de raízes (abre por baixo) · 6 portão de arena
// 7 fuligem (o lago: fere e devolve ao chão firme)
const ROOMS = {};

function makeRoom(id, name, w, h, mood, mapX, mapY, mapW, mapH) {
  const r = { id, name, w, h, mood, g: new Uint8Array(w * h), ents: [], exits: [], brotos: [], items: [], ecos: [],
    map: { x: mapX, y: mapY, w: mapW, h: mapH } };
  ROOMS[id] = r; return r;
}
function box(r, x0, y0, x1, y1, v = 1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < r.w && y < r.h) r.g[y * r.w + x] = v;
}
const ground = (r, x0, x1, top) => box(r, x0, top, x1, r.h - 1);
const branch = (r, x0, x1, y) => box(r, x0, y, x1, y, 2);

(function build() {
  let r;

  // ---- 1 · O Despertar: acordar, pular o tronco caído, o primeiro broto ----
  r = makeRoom('R1', 'O Despertar', 52, 18, 'surface', 0, 0, 1, 1);
  ground(r, 0, 51, 14); box(r, 0, 0, 1, 13);
  box(r, 16, 12, 18, 13);            // o tronco caído
  ground(r, 24, 35, 13);
  r.start = { x: 6, y: 14 };
  r.brotos.push({ id: 'b1', x: 30, y: 13 });
  r.ecos.push({ id: 'e1', x: 41, y: 14, text: 'Antes do fogo, aqui se ouvia água.' });
  r.exits.push({ side: 'right', to: 'R2', sx: 1, sy: 14 });

  // ---- 2 · A Ravina: larga demais para o pulo; algo brilha do outro lado ----
  r = makeRoom('R2', 'A Ravina', 64, 20, 'surface', 1, 0, 2, 1);
  ground(r, 0, 29, 14); ground(r, 26, 29, 13);
  box(r, 10, 14, 12, 19, 0); box(r, 10, 14, 12, 14, 5); // o poço do atalho, fechado por raízes
  ground(r, 38, 63, 15);
  r.lock = { x: 34, y: 14 };          // onde o mapa marca a trava
  r.beacon = { x: 43, y: 15 };        // o brilho do outro lado
  r.ecos.push({ id: 'e2', x: 20, y: 14, text: 'O sono veio primeiro. Violeta. Quem dormia não voltava igual.' });
  r.ents.push({ k: 'mariposa', x: 52, y: 10 });
  r.exits.push({ side: 'left', to: 'R1', sx: 50, sy: 14 });
  r.exits.push({ side: 'bottom', a: 30, b: 37, to: 'R3', sx: 44, sy: 0, map: true });
  r.exits.push({ side: 'bottom', a: 10, b: 12, to: 'R4', sx: 9, sy: 0, map: true });
  r.exits.push({ side: 'right', to: 'R6', sx: 1, sy: 15 });

  // ---- 3 · Raízes Baixas: a primeira carcaça; um segredo atrás da parede rachada ----
  r = makeRoom('R3', 'Raízes Baixas', 60, 18, 'deep', 2, 1, 1, 1);
  box(r, 0, 0, 59, 1); box(r, 44, 0, 51, 1, 0);
  ground(r, 0, 59, 14); box(r, 58, 0, 59, 17);
  box(r, 6, 2, 20, 6);
  ground(r, 22, 31, 13);
  box(r, 54, 2, 57, 10); box(r, 54, 11, 55, 13, 4);
  r.items.push({ id: 'lamina', x: 56.5, y: 14 });
  r.ecos.push({ id: 'e3', x: 27, y: 13, text: 'Ela nos pediu perdão antes de acender a primeira folha.' });
  r.ents.push({ k: 'carcaca', x: 36, y: 14, sleeping: true });
  r.ents.push({ k: 'espinheiro', x: 13, y: 14 });
  r.exits.push({ side: 'left', to: 'R4', sx: 30, sy: 40 });

  // ---- 4 · O Tronco Oco: subir por dentro; o vão do meio pede o ímpeto ----
  r = makeRoom('R4', 'O Tronco Oco', 32, 44, 'hollow', 1, 1, 1, 1);
  box(r, 0, 0, 1, 36); box(r, 30, 0, 31, 36);
  box(r, 0, 0, 31, 1); box(r, 9, 0, 11, 1, 0);
  ground(r, 0, 31, 40);
  box(r, 8, 38, 9, 39);               // degrau
  box(r, 2, 35, 7, 36);               // beira A
  box(r, 15, 35, 29, 36);             // beira B, depois do vão de 7 blocos
  branch(r, 20, 25, 32); branch(r, 14, 20, 29); branch(r, 8, 14, 26);
  box(r, 2, 23, 8, 24);
  branch(r, 8, 14, 20); branch(r, 14, 20, 17);
  box(r, 20, 14, 29, 15);
  branch(r, 14, 20, 11); branch(r, 8, 14, 8); branch(r, 8, 12, 5); branch(r, 8, 12, 2);
  r.brotos.push({ id: 'b2', x: 18, y: 40 });
  r.ecos.push({ id: 'e4', x: 5, y: 23, text: 'O Vigia jurou ficar acordado. Ficou tanto que se esvaziou.' });
  r.ents.push({ k: 'mariposa', x: 23, y: 27 });
  r.ents.push({ k: 'mariposa', x: 9, y: 16 });
  r.ents.push({ k: 'espinheiro', x: 25, y: 14 });
  r.exits.push({ side: 'right', to: 'R3', sx: 1, sy: 14 });
  r.exits.push({ side: 'left', to: 'R5', sx: 38, sy: 14 });
  r.exits.push({ side: 'top', a: 9, b: 11, to: 'R2', sx: 14, sy: 14, flag: 'atalho' });

  // ---- 5 · A Clareira do Vigia: o guardião do meio ----
  r = makeRoom('R5', 'A Clareira do Vigia', 40, 18, 'arena', 0, 1, 1, 1);
  box(r, 0, 0, 39, 1); box(r, 0, 0, 1, 17); ground(r, 0, 39, 14);
  box(r, 38, 2, 39, 10); box(r, 37, 11, 37, 13, 6);
  r.boss = { k: 'vigia', x: 11, y: 14, trigger: 32 };
  r.exits.push({ side: 'right', to: 'R4', sx: 1, sy: 40 });

  // ---- 6 · Copas Mortas: espinhos, vãos, e um segredo no alto ----
  r = makeRoom('R6', 'Copas Mortas', 72, 20, 'surface', 3, 0, 2, 1);
  ground(r, 0, 9, 15);
  ground(r, 10, 16, 18); box(r, 10, 17, 16, 17, 3);
  ground(r, 17, 27, 15);
  ground(r, 28, 33, 12);
  ground(r, 34, 42, 18); box(r, 34, 17, 42, 17, 3);
  branch(r, 37, 39, 12);
  ground(r, 43, 55, 12);
  ground(r, 56, 71, 15);
  box(r, 66, 15, 68, 19, 0);          // a garganta: uma queda para o lago
  r.hole = { x: 67, y: 15 };
  r.ecos.push({ id: 'e5', x: 20, y: 15, text: 'Queimar a floresta foi o jeito de o sono não passar daqui.' });
  branch(r, 50, 52, 9); box(r, 44, 6, 48, 7);
  r.items.push({ id: 'fragmento', x: 45.5, y: 6 });
  r.canopy = { x0: 40, x1: 54 };      // copa escura que esconde o segredo
  r.ents.push({ k: 'espinheiro', x: 22, y: 15 });
  r.ents.push({ k: 'mariposa', x: 30, y: 7 });
  r.ents.push({ k: 'carcaca', x: 49, y: 12 });
  r.ents.push({ k: 'espinheiro', x: 63, y: 15 });
  r.ents.push({ k: 'mariposa', x: 60, y: 9 });
  r.exits.push({ side: 'left', to: 'R2', sx: 62, sy: 15 });
  r.exits.push({ side: 'right', to: 'R7', sx: 1, sy: 14 });
  r.exits.push({ side: 'bottom', a: 66, b: 68, to: 'R9', sx: 14, sy: 0, map: true });

  // ---- 7 · O Limiar: silêncio, e o último broto ----
  r = makeRoom('R7', 'O Limiar', 34, 18, 'limiar', 5, 0, 1, 1);
  ground(r, 0, 33, 14);
  ground(r, 26, 33, 10);              // o muro: alto demais sem as asas de cinza
  r.lock = { x: 26, y: 14 };
  r.brotos.push({ id: 'b3', x: 14, y: 14 });
  r.ecos.push({ id: 'e7', x: 21, y: 14, text: 'Uma brasa só ela não deixou apagar. Guardou no peito de uma criança.' });
  r.exits.push({ side: 'left', to: 'R6', sx: 70, sy: 15 });
  r.exits.push({ side: 'right', to: 'R8', sx: 4, sy: 14 });

  // ---- 8 · O Coração Queimado: a guardiã final ----
  r = makeRoom('R8', 'O Coração Queimado', 44, 18, 'heart', 6, 0, 1, 1);
  ground(r, 0, 43, 14); box(r, 0, 0, 1, 10); box(r, 42, 0, 43, 17);
  box(r, 2, 11, 2, 13, 6);
  r.boss = { k: 'enlutada', x: 30, y: 14, trigger: 9, dir: 1 };
  r.exits.push({ side: 'left', to: 'R7', sx: 32, sy: 10 });

  // ---- 9 · A Garganta: cai-se por ela; só as asas de cinza sobem de volta ----
  r = makeRoom('R9', 'A Garganta', 32, 40, 'deep', 4, 1, 1, 1);
  box(r, 0, 0, 31, 1); box(r, 14, 0, 16, 1, 0);
  box(r, 0, 0, 1, 39); box(r, 30, 0, 31, 32);
  ground(r, 0, 31, 36);
  box(r, 2, 32, 13, 33); box(r, 18, 28, 29, 29); box(r, 2, 24, 13, 25); box(r, 18, 20, 29, 21);
  box(r, 2, 16, 13, 17); box(r, 18, 12, 29, 13); box(r, 2, 8, 13, 9);
  branch(r, 18, 20, 4);               // cada beira fica 4 blocos acima da outra: um pulo só não alcança
  r.ents.push({ k: 'mariposa', x: 23, y: 33 });
  r.exits.push({ side: 'top', a: 14, b: 16, to: 'R6', sx: 64, sy: 15 });
  r.exits.push({ side: 'right', to: 'R10', sx: 1, sy: 15 });

  // ---- 10 · O Lago de Fuligem: ilhas e troncos sobre a água preta ----
  r = makeRoom('R10', 'O Lago de Fuligem', 84, 20, 'lake', 5, 1, 2, 1);
  ground(r, 0, 13, 15);
  box(r, 14, 16, 69, 19, 7);
  r.lake = { x0: 14, x1: 69, y: 16 };
  ground(r, 20, 24, 15);
  branch(r, 28, 31, 13);
  ground(r, 36, 41, 14);
  branch(r, 45, 47, 12); branch(r, 51, 53, 14);
  ground(r, 57, 62, 15);
  ground(r, 70, 83, 15);
  r.brotos.push({ id: 'b4', x: 60, y: 15 });
  r.ecos.push({ id: 'e6', x: 22, y: 15, text: 'No lago ela lavou as mãos. A água nunca mais ficou clara.' });
  r.ents.push({ k: 'mariposa', x: 30, y: 8 });
  r.ents.push({ k: 'espinheiro', x: 39, y: 14 });
  r.ents.push({ k: 'mariposa', x: 49, y: 7 });
  r.ents.push({ k: 'mariposa', x: 66, y: 9 });
  r.exits.push({ side: 'left', to: 'R9', sx: 30, sy: 36 });
  r.exits.push({ side: 'right', to: 'R11', sx: 4, sy: 17 });

  // ---- 11 · O Ninho: a Rainha de Fuligem, que guarda as asas de cinza ----
  r = makeRoom('R11', 'O Ninho', 44, 22, 'nest', 7, 1, 1, 1);
  box(r, 0, 0, 43, 1); box(r, 38, 0, 40, 1, 0);
  box(r, 0, 0, 1, 13); box(r, 42, 0, 43, 21);
  ground(r, 0, 43, 17);
  box(r, 2, 14, 2, 16, 6);
  branch(r, 30, 33, 13); box(r, 36, 9, 41, 10); branch(r, 38, 40, 6); branch(r, 38, 40, 3);
  r.boss = { k: 'rainha', x: 26, y: 17, trigger: 8, dir: 1 };
  r.exits.push({ side: 'left', to: 'R10', sx: 82, sy: 15 });
  r.exits.push({ side: 'top', a: 38, b: 40, to: 'R7', sx: 5, sy: 14 });
})();

// ---- O que eles dizem: a frase depende de quantas vezes aquele inimigo já te matou ----
// kill: dita no pesadelo, logo depois de te matar · greet: dita quando te vê de novo
const LINES = {
  carcaca: {
    name: 'Carcaça',
    kill: { 2: 'De novo você.', 3: 'Já te quebrei antes. Lembro do som.', 5: 'Cinco vezes você acordou. Cinco vezes eu estava aqui.',
      8: 'Você sonha comigo, pequena brasa. Eu não sonho com mais nada.' },
    greet: { 2: 'Eu conheço você.', 3: 'Voltou para o mesmo lugar onde caiu.', 5: 'Ainda guardo a sua forma na cinza.', 8: 'Venha. Nós dois sabemos como isso termina.' },
    how: { golpe: ['O mesmo golpe. O mesmo lugar.', 'Eu levanto o braço e você espera. Sempre.'], corpo: ['Você anda para dentro de mim.', 'Nem preciso bater.'] },
    end: 'Enfim… você.',
  },
  mariposa: {
    name: 'Mariposa de Fuligem',
    kill: { 2: '…a mesma luz…', 3: 'Ela volta. Sempre volta.', 5: 'Apague de vez. Dói menos.', 8: 'Quantas vezes uma brasa pode morrer?' },
    greet: { 2: '…você de novo…', 3: 'Já provamos essa luz.', 5: 'Ela ainda não aprendeu.', 8: 'Deixe a gente te apagar devagar.' },
    how: { mergulho: ['Ela nunca olha para cima.', 'A mesma queda, a mesma luz.'] },
    end: '…apagou a gente…',
  },
  espinheiro: {
    name: 'Espinheiro',
    kill: { 2: 'Conheço essa pele.', 3: 'Meus espinhos guardam o seu gosto.', 5: 'Quantas vezes ainda?', 8: 'Já é costume.' },
    greet: { 2: 'Você. Outra vez.', 3: 'Ainda tem espinho meu em você.', 5: 'Não cansa?', 8: 'Chegue mais perto, como das outras vezes.' },
    how: { espinho: ['Você pula para dentro deles.', 'Meus espinhos não precisam mirar.'] },
    end: 'Desta vez… não.',
  },
  vigia: {
    name: 'O Vigia Oco',
    kill: { 2: 'Eu já vi você cair aqui.', 3: 'Três vezes guardei este lugar contra você.', 5: 'Você não se cansa de morrer, criança?',
      8: 'Já decorei o peso do seu corpo no chão.' },
    greet: { 2: 'Você de novo. Eu me lembro.', 3: 'Posso guardar este lugar para sempre. Você pode morrer para sempre?', 5: 'Conto as suas quedas nos meus anéis.',
      8: 'Entre. O chão já tem a sua marca.' },
    fall: 'Enfim… alguém acorda de mim.',
    rage: 'Chega de te ver levantar.',
    how: { investida: ['Sempre a investida. Você nunca sai do caminho.', 'Eu só preciso correr. Você faz o resto.'], onda: ['O chão te derruba antes de mim.', 'Você esquece de pular. Toda vez.'],
      garra: ['Perto demais, de novo.', 'Você conhece o alcance da minha garra e entra nele.'] },
  },
  enlutada: {
    name: 'A Enlutada',
    kill: { 2: 'Eu te embalei até o fim uma vez. Por que voltou?', 3: 'Toda vez que você acorda, eu perco você de novo.',
      5: 'Durma, minha brasa. Já te enterrei tantas vezes.', 8: 'Conto as suas mortes como contava as folhas.' },
    greet: { 2: 'De novo esse rosto pequeno.', 3: 'Você volta, e eu preciso te perder outra vez.', 5: 'Não me faça te enterrar de novo.',
      8: 'Fique. Aqui, pelo menos, você não acorda sozinha.' },
    fall: 'Então acorde. E leve o que restou da floresta.',
    rage: 'Então eu te enterro com as minhas mãos.',
    how: { chuva: ['Você corre sempre para o lado errado da chuva.', 'O vão estava logo ali, minha brasa.'], rasante: ['Você fica parada onde eu vou passar.', 'Eu aviso onde vou cair. Você nunca acredita.'],
      chama: ['Minhas chamas te acham sempre.', 'Você não apaga as pequenas. Elas apagam você.'] },
  },
  rainha: {
    name: 'A Rainha de Fuligem',
    kill: { 2: 'Outra brasa para o meu ninho.', 3: 'Você volta como elas voltam à luz.', 5: 'Minhas filhas já conhecem o seu cheiro.', 8: 'Tantas vezes você caiu aqui que o chão já é seu.' },
    greet: { 2: 'A mesma luz pequena.', 3: 'Você de novo debaixo das minhas asas.', 5: 'Entre. O ninho guardou o seu lugar.', 8: 'Nem as minhas filhas voltam tanto quanto você.' },
    fall: 'Leve as asas. Eu já não saio daqui.',
    rage: 'Minhas asas ainda queimam.',
    how: { mergulho: ['Você olha para cima e não sai do lugar.', 'Eu caio sempre onde você está.'], dardo: ['Você pula na hora errada.', 'Meus dardos conhecem a sua altura.'] },
  },
  floresta: {
    name: 'A Floresta',
    kill: { 2: 'Os espinhos já conhecem você.', 3: 'A mesma queda. O mesmo susto.', 5: 'Até o chão se lembra.', 8: 'Você conhece esse caminho melhor morta do que viva.' },
    greet: {},
    how: { fuligem: ['A água preta já sabe o seu peso.', 'O lago guarda cada vez que você afundou.'] },
  },
};
// A frase para n mortes: a do maior degrau que n já alcançou.
function lineFor(table, n) {
  let best = null;
  for (const k of Object.keys(table)) if (n >= Number(k)) best = table[k];
  return best;
}
