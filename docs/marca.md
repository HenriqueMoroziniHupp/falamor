# Marca

## Nome

**Falamor**: "fala" + "amor". O amor que se ouve. Na interface, a marca aparece como *falamor* em itálico minúsculo, com um coraçãozinho.

## Personalidade

Romântica sem ser brega. Delicada, calorosa, simples. Fala como uma amiga que ajuda a fazer a surpresa, não como um app de tecnologia.

## Tom de voz

| Faça | Evite |
| --- | --- |
| Frases curtas e afetivas: "Tudo pronto, Rafael!" | Jargão técnico: "processando", "renderizando", "TTS" |
| Verbos que dizem o que acontece: "Ver prévia", "Abrir" | Botões genéricos: "Enviar", "OK", "Submeter" |
| Explicar o que fazer quando algo falha | Pedir desculpas ou ser vago: "Ops! Algo deu errado :(" |
| "Quem você ama" (neutro) | Supor o gênero do par ("sua namorada") |
| Emoji raro e com propósito (❤️ 💌 no OG) | Emoji em todo texto |

**Nunca mostrar ao usuário:** nome da voz, prompt de estilo, modelo de IA, configuração técnica. A escolha é só "voz feminina / masculina" e uma de 4 trilhas.

## Visual

| Token | Cor | Uso |
| --- | --- | --- |
| paper | `#FFF7F8` | Fundo (papel blush) |
| petal | `#FBE3E9` | Superfícies suaves, seleção |
| rose | `#C8385E` | Ação principal |
| rose-deep | `#9E2447` | Títulos de destaque, hover |
| ink | `#3B1E2A` | Texto |
| ink-soft | `#7A5866` | Texto secundário |
| night | `#1D0E16` | Fundo do player |

Fonte da verdade: `app/assets/css/main.css`.

- **Tipografia:**
  - **Bodoni Moda** (serifada de alto contraste) para títulos, nomes e o texto da declaração, em itálico para o que é "carta";
  - **Nunito** (arredondada) para a interface.
- **Momento memorável:** o envelope com lacre de cera que a pessoa toca para abrir. É o único ponto "ousado"; o resto fica calmo.
- **Movimento:** corações subindo devagar ao fundo; zoom lento nas fotos. Respeitar "reduzir movimento".

## Textos-chave (PT)

| Onde | Texto |
| --- | --- |
| Título da landing | Declare seu amor em voz alta |
| Subtítulo da landing | Suas fotos e palavras viram uma lembrança falada, pronta em minutos, para emocionar quem você ama. |
| Botão principal | Criar minha declaração |
| Capa do player | {Autor} preparou uma surpresa / para você, {Parceiro} |
| Preview do WhatsApp (título) | Oi, {Parceiro}. Fiz essa declaração para você ❤️ |
| Preview do WhatsApp (descrição) | Aumente o som, aperte o play e venha reviver a nossa história comigo. Com amor, {Autor} 💌 |
| Final | Juntos há … / Hoje, amanhã e sempre. |
| Expirada | Essa declaração já cumpriu sua missão 💗 |

Todos os textos da interface ficam em `i18n/locales/{pt-BR,en}.json`. Mudou lá, atualize aqui se for um texto-chave.

## Briefing rápido para peças de marketing

> Falamor: declarações de amor faladas, com as fotos do casal e música, entregues por link. Público: casais brasileiros de 18 a 40 anos, compra pelo celular perto de datas especiais. Tom: romântico e delicado, sem breguice. Cores: blush (#FFF7F8), rosa (#C8385E), ameixa (#3B1E2A). Fontes: Bodoni Moda (títulos em itálico) e Nunito. Mostrar a emoção de quem **recebe**, não a tecnologia.
