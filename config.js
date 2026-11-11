// PROTOTYPE - NOT FOR PRODUCTION
// Question: o silêncio e o luto chegam de verdade em quem joga, e a luta punitiva dá vontade de tentar de novo?
// Date: 2026-11-10
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
window.CONFIG = {
  seed: 1, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address)
  volume: { value: 0.6, min: 0, max: 1, step: 0.05 },

  // ---- A figura: movimento (px e segundos; um bloco do mapa tem 40 px) ----
  run_speed: { value: 290, min: 180, max: 420, step: 10 },          // px/s
  jump_height: { value: 132, min: 80, max: 200, step: 4 },          // px no pulo cheio (3,3 blocos)
  jump_apex_time: { value: 0.36, min: 0.2, max: 0.6, step: 0.02 },  // s até o topo do pulo
  fall_gravity: { value: 1.5, min: 1, max: 2.5, step: 0.1 },        // cai mais rápido do que sobe (x)
  jump_cut: { value: 0.45, min: 0.2, max: 1, step: 0.05 },          // soltar o pulo cedo corta a subida (x)
  coyote_time: { value: 0.1, min: 0, max: 0.25, step: 0.01 },       // s de pulo ainda válido depois da borda
  jump_buffer: { value: 0.12, min: 0, max: 0.25, step: 0.01 },      // s de pulo guardado antes de tocar o chão
  max_fall: { value: 900, min: 500, max: 1400, step: 50 },          // px/s
  dash_speed: { value: 880, min: 500, max: 1300, step: 20 },        // px/s
  dash_time: { value: 0.2, min: 0.1, max: 0.4, step: 0.01 },        // s (distância = velocidade x tempo)
  dash_cooldown: { value: 0.45, min: 0.1, max: 1.2, step: 0.05 },   // s

  // ---- A figura: luta e vida ----
  player_life: { value: 4, min: 2, max: 8, step: 1 },               // brasas de vida no começo
  hurt_invuln: { value: 1.1, min: 0.3, max: 2, step: 0.1 },         // s sem levar dano depois de um golpe
  attack_cooldown: { value: 0.36, min: 0.15, max: 0.8, step: 0.02 },// s entre golpes
  attack_range: { value: 80, min: 40, max: 140, step: 4 },          // px à frente
  blade_damage: { value: 2, min: 1, max: 6, step: 1 },              // dano da lâmina
  blade_damage_strong: { value: 3, min: 1, max: 8, step: 1 },       // dano da lâmina reforçada
  hit_recoil: { value: 150, min: 0, max: 400, step: 10 },           // px/s que você recua ao acertar
  calor_max: { value: 9, min: 3, max: 15, step: 1 },                // calor guardado (cada golpe certo dá 1)
  heal_cost: { value: 3, min: 1, max: 9, step: 1 },                 // calor gasto por cura
  heal_time: { value: 0.95, min: 0.3, max: 2, step: 0.05 },         // s parado e exposto para curar 1 vida
  level_2_brasas: { value: 8, min: 2, max: 40, step: 1 },           // brasas para a brasa interior crescer (+1 vida)
  level_3_brasas: { value: 24, min: 4, max: 80, step: 1 },          // brasas para crescer de novo (+1 vida)

  pogo_height: { value: 104, min: 40, max: 180, step: 4 },             // px que você sobe ao acertar um golpe para baixo
  double_jump_height: { value: 112, min: 60, max: 180, step: 4 },      // px do segundo pulo (asas de cinza)
  boss_hitstop: { value: 0.07, min: 0, max: 0.2, step: 0.01 },         // s de pausa ao acertar um guardião
  hit_hitstop: { value: 0.05, min: 0, max: 0.2, step: 0.01 },          // s de pausa ao acertar um inimigo comum

  // ---- O que lembra de você ----
  speak_from_death: { value: 2, min: 1, max: 6, step: 1 },          // a partir de qual morte o inimigo fala

  adapt_from_death: { value: 4, min: 2, max: 12, step: 1 },         // a partir de qual morte o inimigo muda o jeito de lutar

  // ---- Segunda fase dos guardiões ----
  phase2_at: { value: 0.5, min: 0.2, max: 0.8, step: 0.05 },        // fração da vida em que o guardião enfurece
  phase2_speed: { value: 0.78, min: 0.5, max: 1, step: 0.02 },      // os avisos ficam mais curtos (x)

  // ---- Carcaça: lenta, bate forte ----
  carcaca_life: { value: 10, min: 2, max: 30, step: 1 },
  carcaca_speed: { value: 58, min: 20, max: 160, step: 2 },         // px/s
  carcaca_windup: { value: 0.7, min: 0.3, max: 1.5, step: 0.05 },   // s de aviso antes do golpe
  carcaca_damage: { value: 2, min: 1, max: 4, step: 1 },            // dois golpes bastam
  carcaca_recover: { value: 1.0, min: 0.3, max: 2, step: 0.05 },    // s de janela depois do golpe

  // ---- Mariposa de fuligem: mergulha ----
  mariposa_life: { value: 4, min: 1, max: 12, step: 1 },
  mariposa_telegraph: { value: 0.5, min: 0.2, max: 1.2, step: 0.05 },// s tremendo antes do mergulho
  mariposa_dive: { value: 520, min: 250, max: 900, step: 10 },      // px/s
  mariposa_recover: { value: 1.3, min: 0.4, max: 3, step: 0.1 },    // s

  // ---- Espinheiro: atira espinhos ----
  espinheiro_life: { value: 6, min: 1, max: 20, step: 1 },
  espinheiro_speed: { value: 44, min: 10, max: 140, step: 2 },      // px/s
  espinheiro_interval: { value: 2.6, min: 1, max: 6, step: 0.1 },   // s entre rajadas
  espinheiro_bristle: { value: 0.55, min: 0.2, max: 1.2, step: 0.05 },// s de aviso
  thorn_speed: { value: 380, min: 150, max: 700, step: 10 },        // px/s

  // ---- O Vigia Oco (guardião do meio) ----
  vigia_life: { value: 44, min: 10, max: 120, step: 2 },
  vigia_telegraph: { value: 0.75, min: 0.3, max: 1.5, step: 0.05 }, // s de aviso da investida
  vigia_charge: { value: 620, min: 300, max: 1000, step: 20 },      // px/s
  vigia_stun: { value: 1.4, min: 0.4, max: 3, step: 0.1 },          // s atordoado na parede
  vigia_shock: { value: 400, min: 200, max: 800, step: 20 },        // px/s da onda no chão

  // ---- A Enlutada (guardiã final) ----
  enlutada_life: { value: 80, min: 20, max: 200, step: 5 },
  enlutada_rain_warn: { value: 0.95, min: 0.4, max: 2, step: 0.05 },// s de aviso da chuva
  enlutada_rain_gap: { value: 170, min: 90, max: 320, step: 10 },   // px do vão seguro
  enlutada_swoop_warn: { value: 0.7, min: 0.3, max: 1.5, step: 0.05 },// s de aviso do rasante
  enlutada_tired: { value: 2.1, min: 0.6, max: 4, step: 0.1 },      // s cansada no chão

  // ---- A Rainha de Fuligem (guardiã do ninho) ----
  rainha_life: { value: 60, min: 20, max: 160, step: 5 },
  rainha_warn: { value: 0.75, min: 0.3, max: 1.5, step: 0.05 },     // s de aviso do mergulho
  rainha_dive: { value: 660, min: 350, max: 1100, step: 10 },       // px/s
  rainha_stuck: { value: 1.4, min: 0.4, max: 3, step: 0.1 },        // s presa no chão depois do mergulho
  rainha_dart: { value: 430, min: 200, max: 800, step: 10 },        // px/s dos dardos
  rainha_wind: { value: 110, min: 0, max: 260, step: 10 },          // px/s que o vento das asas te empurra

  // ---- Celular ----
  mobile_zoom: { value: 1.3, min: 1, max: 1.8, step: 0.05 },        // aproximação da câmera no toque (a figura fica maior)
  mobile_zoom_fight: { value: 1.05, min: 1, max: 1.5, step: 0.05 }, // nas lutas de guardião a câmera abre
  vibration: { value: 1, min: 0, max: 1, step: 1 },                 // 1 vibra ao levar dano, 0 não

  // ---- Clima ----
  ash_amount: { value: 110, min: 0, max: 260, step: 10 },           // flocos de cinza na tela
  music_volume: { value: 0.7, min: 0, max: 1, step: 0.05 },         // notas e vento, dentro do volume geral
};
