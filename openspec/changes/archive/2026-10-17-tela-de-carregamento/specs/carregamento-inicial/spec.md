# Spec Delta

## Purpose

Garante que quem abre uma página montada no navegador (principalmente o link da declaração) nunca veja uma tela branca enquanto o app carrega, e sim a identidade do Falamor desde o primeiro instante.

## ADDED Requirements

### Requirement: Tela de carregamento no HTML inicial
Toda página entregue sem renderização no servidor SHALL trazer, no próprio HTML da primeira resposta, uma tela de carregamento visível que ocupa a tela inteira, sem depender de JavaScript para aparecer.

#### Scenario: Link da declaração em rede lenta
- **WHEN** alguém abre `/d/demo` num celular em 3G e o JavaScript ainda não terminou de baixar
- **THEN** a tela mostra o fundo blush com o coração no centro, nunca uma tela branca vazia

#### Scenario: JavaScript desativado ou bloqueado
- **WHEN** a página `/criar` é aberta com JavaScript desativado
- **THEN** a tela de carregamento continua visível

#### Scenario: Rotas em inglês
- **WHEN** alguém abre `/en/d/demo-en`
- **THEN** a mesma tela de carregamento aparece

### Requirement: Landing não é afetada
As páginas pré-renderizadas com conteúdo pronto (`/` e `/en`) MUST NOT exibir a tela de carregamento.

#### Scenario: Abrir a landing
- **WHEN** alguém abre `/`
- **THEN** o conteúdo da landing aparece direto, sem tela de carregamento por cima

### Requirement: Aparência da tela de carregamento
A tela SHALL usar o fundo blush da marca, no mesmo tom do envelope da declaração, e um único coração rosa da marca no centro. Não SHALL ter texto visível nem depender de fonte, imagem ou outro recurso externo.

#### Scenario: Sem recursos externos
- **WHEN** o HTML da página é recebido e nenhum outro arquivo da tela de carregamento é baixado
- **THEN** o fundo e o coração aparecem completos

#### Scenario: Sem texto
- **WHEN** a tela de carregamento é exibida em qualquer idioma
- **THEN** não há palavras visíveis, só o fundo e o coração

### Requirement: Coração pulsando com respeito a "reduzir movimento"
O coração SHALL pulsar devagar enquanto a tela estiver visível. Quando o sistema pede menos movimento, o coração MUST ficar parado.

#### Scenario: Movimento padrão
- **WHEN** a tela de carregamento é exibida num aparelho sem preferência de movimento
- **THEN** o coração pulsa num ritmo lento e contínuo

#### Scenario: Reduzir movimento ativado
- **WHEN** a tela é exibida num aparelho com "reduzir movimento" ativado
- **THEN** o coração aparece parado

### Requirement: Saída quando o app está pronto
A tela de carregamento SHALL sumir só quando a página estiver pronta para mostrar o próprio conteúdo, incluindo os dados que ela espera antes de aparecer, e a troca MUST NOT passar por uma tela branca.

#### Scenario: Declaração carregada
- **WHEN** o app termina de montar em `/d/demo` e a declaração foi recebida
- **THEN** a tela de carregamento some e o envelope aparece em seguida, sem piscar branco

#### Scenario: Declaração expirada
- **WHEN** o app termina de montar em `/d/demo-expirada`
- **THEN** a tela de carregamento some e aparece o aviso de declaração expirada

#### Scenario: Declaração inexistente
- **WHEN** o app termina de montar em `/d/nao-existe`
- **THEN** a tela de carregamento some e aparece a página de erro 404

### Requirement: Acessível para leitores de tela
A tela de carregamento SHALL ser anunciada como estado de carregamento por leitores de tela, com um rótulo que funcione em qualquer idioma. O coração MUST ser decorativo.

#### Scenario: Leitor de tela durante o carregamento
- **WHEN** um leitor de tela percorre a página enquanto a tela de carregamento está visível
- **THEN** ele anuncia um único rótulo de carregamento neutro quanto ao idioma e não lê o desenho do coração
