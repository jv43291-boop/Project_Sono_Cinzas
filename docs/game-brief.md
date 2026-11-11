# Game Brief: Sono de Cinza *(guessed)*

## In your words

quero um jogo com o mesmo estilo de hollow knight com graficos bonitos e um clima pesado que cause a mesma coisa que o jogo causa em quem conhece o jogo

1. Mundo: C. A floresta de cinzas. Uma figura pequena atravessa uma floresta queimada onde quase nada vive, com poucos inimigos e muitos segredos. Morrer faz você acordar com se tivesse tido um pesadelo a algumas áreas que terão saves automáticos  . Troncos negros, cinza caindo, brotos que brilham. Sensação: silêncio e luto.
2. Crescimento: escala progressiva derrotando inimigos e bosses assim ganhando novas habilidades e itens mais fortes.
3. Visual: duas imagens coladas (vórtice violeta com escombros flutuando; duas figuras pequenas em névoa azul fria).
4. Dificuldade: punitivo e quero que os após morrer varias vezes para um inimigo ou boss ele falo alguma frase demonstrando que sabe que já te matou outras vezes
5. Objetivo: a definir.
6. Fatia: uma fatia do jogo assim eu tenho uma noção de como o caminho sera tomado
7. Plataforma: o jogo dever ser construido tanto para rodar no navegador quanto no android seguindo isso pode construir

After play: eu joguei ficou muito bom bem melhor do que eu imaginei mais quero que melhore se tiver ideias
After play: melhorias escolhidas: Peso da luta, Os que lembram, Mais mundo, Celular. Melhor momento: O visual e o clima. Pior momento: Nada incomodou.
After play: pensei na ia se adaptando no jogo tipo mudando inimigos e mapas inesperadamente falando coisas em momentos não calculados
After play: diretor sem modelo, rodando offline: pode fazer

**Pitch:** Uma figura pequena atravessa uma floresta queimada e silenciosa, onde cada morte é um pesadelo do qual você acorda e os poucos que restam lembram de já ter te matado.

**Genre:** metroidvania com lutas de soulslike

**Controls:** teclado: setas (ou A/D) andam, Z (ou Espaço) pula e, com as asas, pula de novo no ar, X golpeia (com seta para cima, para cima; no ar com seta para baixo, para baixo, e quica), C dá o dash depois de ganho, segurar S (ou seta para baixo) parado cura *(guessed)*. Um controle Bluetooth também funciona. Android: botões de toque na tela, direcional à esquerda e pular, golpear, dash e curar à direita *(guessed)*.

**Question:** o silêncio e o luto chegam de verdade em quem joga, e a luta punitiva dá vontade de tentar de novo?

**Hooks:** a morte é um pesadelo do qual você acorda; inimigos e bosses falam sabendo que já te mataram.

**Intent:** payoff builds *(you said)*: as frases só aparecem depois de várias mortes para o mesmo inimigo.

## Look and references
- Look: floresta queimada pintada em camadas com profundidade (2D luminoso pintado à mão). Clima de silêncio e luto, com o jogador minúsculo diante de troncos enormes. Formas: troncos e galhos angulosos e quebrados; a figura do jogador é redonda e frágil. Valores: o jogador é o ponto mais claro da tela; o fundo fica numa faixa escura e estreita, com vultos gigantes desfocados na névoa. Paleta com papéis: carvão quase preto (chão e troncos), névoa azul-esverdeada fria (profundidade), branco-osso com um núcleo de brasa âmbar (jogador), violeta (ameaça, pesadelo e bosses), verde-água luminoso (brotos, vida e saves). Sombras mais frias, luzes mais quentes. Detalhe nos rostos, nas bordas e nos brotos; nada de detalhe atrás da ação. Uma só regra de contorno e de sombreamento. Assinatura: ao morrer, a tela se rasga num vórtice violeta com pedaços do mundo flutuando, e você acorda arfando; a cinza cai o tempo todo. Toda figura é desenhada: sem emoji, sem círculos simples.
- References: Hollow Knight (2D luminoso pintado à mão, o peso do clima, o herói pequeno num mundo caído). references/ref-vortice-violeta.jpg (o vórtice violeta, os escombros suspensos, a escala da silhueta). references/ref-figuras-nevoa.jpg (figuras pequenas e vulneráveis, névoa azul fria, formas gigantes ao fundo, um único acento de cor).
- View: 2D · Camera: lateral, segue o jogador, antecipa a direção, para nas bordas de cada sala.

## First minute
Você acorda encolhido sob um tronco queimado, com cinza caindo e nenhum texto. Anda para a direita, pula um tronco caído e encosta no primeiro broto: ele acende, e é ali que você passa a acordar. Logo depois há uma ravina larga demais para o seu pulo, com algo brilhando do outro lado. No caminho de baixo, uma carcaça carbonizada se levanta devagar e bate forte; dois golpes dela bastam. Você morre, a tela se rasga no vórtice violeta, e você acorda no broto.

## Challenge
O primeiro perigo real vem entre 1 e 2 minutos, na segunda sala: inimigos lentos de ler, que matam em 2 ou 3 golpes *(guessed)*. Um guardião no meio (por volta de 4 a 6 minutos) guarda o dash. O guardião final exige o dash e leitura dos golpes. Morrer custa o caminho de volta desde o último despertar, e os inimigos comuns voltam; nada do que você ganhou se perde *(guessed)*. A partir da segunda morte para o mesmo inimigo, ele fala.

## Core loop
- Explorar a sala: achar o caminho, a trava ou o segredo.
- Lutar lendo o inimigo: ele abre uma janela depois de atacar; curar leva um instante e te deixa exposto.
- Ganhar: brasas dos inimigos, uma habilidade de cada guardião, um item mais forte.
- Morrer: acordar no último broto, com o inimigo lembrando de você, e tentar de novo.
- Voltar com a habilidade nova ao lugar que estava bloqueado.

Leads: metroidvania conduz o mapa, as travas, os controles e a câmera · soulslike conduz as lutas e a ameaça · morte e saves, e crescimento: as suas palavras.

## Goal & fail state
- Objetivo: derrotar o guardião no fim da área *(provisional)*.
- Falha: a vida acaba e você acorda no último save automático.

## Features
- [x] Uma área conectada de cerca de 8 salas, com 3 brotos de save automático e um mapa que se preenche (thin stand-in)
- [x] Movimento e luta: pulo tolerante, golpe rápido com recuo, cura que te deixa exposto
- [x] Morte como pesadelo: vórtice violeta e despertar no último broto
- [x] Inimigos que lembram: frases que mudam conforme quantas vezes aquele inimigo já te matou
- [x] 3 tipos de inimigo, cada um atacando de um jeito, mais o guardião do meio e o guardião final
- [x] Trava antes da chave: a ravina vista no começo só abre com o dash ganho do guardião do meio
- [x] Item mais forte: uma lâmina reforçada (thin stand-in)
- [x] 2 segredos escondidos
- [ ] Clima: camadas com profundidade, cinza caindo, luz, e som ambiente gerado por código
- [ ] Roda no navegador do computador e no navegador do Android, com botões de toque na tela
- [x] Golpe para baixo que quica em inimigos e espinhos, e mais impacto em cada acerto
- [x] Segunda fase dos guardiões: com metade da vida, enfurecem
- [x] Inimigos que mudam o jeito de lutar depois de te matar 4 vezes, comentam como você morreu, e um registro das mortes na pausa
- [x] Área nova: A Garganta, O Lago de Fuligem e O Ninho, com a Rainha de Fuligem e as asas de cinza (segundo pulo)
- [x] Sete ecos espalhados que contam o que queimou a floresta
- [ ] No toque, câmera mais perto (figura maior), vibração ao levar dano e controle Bluetooth
- [x] O Sono, um diretor offline: acompanha onde você morre, por onde passa, quanto demora e que golpe usa mais; ao trocar de sala ou entre uma morte e outra muda inimigos e caminhos; sussurra frases montadas na hora

## Your systems
- acordar como se tivesse tido um pesadelo, em áreas com saves automáticos · in the slice
- inimigo ou boss fala demonstrando que sabe que já te matou · in the slice
- novas habilidades derrotando bosses · in the slice
- itens mais fortes · thin stand-in *(guessed)*
- escala progressiva derrotando inimigos · thin stand-in *(guessed)*
- inimigos que se adaptam a como você joga · in the slice
- uma história contada pelos lugares (ecos) · in the slice
- ia se adaptando no jogo, mudando inimigos e mapas, falando em momentos não calculados · thin stand-in (um diretor por regras, sem modelo: as falas saem de um repertório escrito e as mudanças de chão de um conjunto conferido)

## Keep
- o visual e o clima *(you said)*

## Avoid
- O nome, a arte, os personagens e a interface de Hollow Knight
- Os personagens das imagens de referência (a cabeça de saco de papel, a capa de chuva amarela)

## Out of scope
- Um mapa grande, com muitas áreas e muitos movimentos: grow it
- Um boss guardando cada novo movimento: change it after play
- Viagem rápida entre saves: change it after play
- Amuletos que mudam seus movimentos: add it as a feature
- Armas, armaduras e builds: add it as a feature
- O objetivo final da história: grow it
- IA com um modelo de linguagem de verdade dentro do jogo (pede um servidor pequeno que guarde a chave, e internet): add it as a feature
- Um app Android instalável (APK na loja): não é construído aqui; no lugar, o jogo roda no navegador do Android com controles de toque, que nenhuma checagem automática joga

## Build order
1. A fatia: a área inteira, do despertar ao guardião final, com a morte-pesadelo e os inimigos que lembram.
2. Ajustes depois que você jogar.
3. Crescer: mais áreas, mais guardiões, o objetivo final.

---
**Kill condition:** se depois de duas rodadas de ajuste a luta ainda parecer injusta em vez de difícil, ou o clima não pesar. *(guessed)*

**Who it's for / what they feel:** quem conhece Hollow Knight e quer sentir de novo solidão, luto e a vitória suada. *(inferred (strong))*

**Games you love / don't:** Love Hollow Knight (o estilo e o que ele causa).
