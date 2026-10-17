# O projeto (saas) é um gerador de declarações romanticas onde o usuário pagará para publicar as declarações
- O projeto esta sendo criado para me dar uma renda extra, o intuito é conseguir uma dinheiro muito bom, uns 5 mil reais no mês ou ate mais, pois o sistema deverá ser capaz de rodar internacional, ser internacionalizado, com a LLM gerando, deve falar em ingles, portugues (meu pais é o Brasil), etc. Inicialmente será lançado no brasil.


## Piloto
- Inicialmente sera apenas local, sem banco de dados, mas deve ter estrutura pensada para que tenha login social com google para a pessoa criar sua declarações e fazer pagamento para publicar a sua declaração para o mundo, a declaração firará dispinível por 7 dias (para não sobrecarregar o banco de dados e bucket)

## Requisitos funcionais:
- O usuário deve informar o seu nome e o nome do seu parceiro e pode informar a data de inicio do namoro, para que seja exibido um contador de tempo juntos.
- O usuário deve inserir fotos (no máximo 10) com ordenação arrasta e solta.
- O usuário deve escrever sua declaração ou selecionar alguma das 3 pré existentes como essa: "Desde que você entrou na minha vida, cada dia ganhou uma cor diferente e um sentido muito mais bonito. Olhar para essas fotos é reviver a certeza de que o meu lugar favorito no mundo é dentro do seu abraço. Obrigado por cada risada compartilhada, por cada sonho que construímos juntos e por ser a minha paz em meio à correria do mundo. Que o nosso tempo juntos continue crescendo, segundo após segundo, porque amar você é a melhor parte da minha história. Eu te amo infinitamente!"
- A declaração deve ser no formato igual do Google Fotos quando exibe as recordações, as fotos vão passando.
- O sistema deve recitar a declaração do usuario usando o modelo de LLM `gemini-3.8-flash-lite-tts`
- Quando for gerado o audio da declaração, ele deve ficar em cachê para não gerar novamente, só será regerado novamente se o usuário alterar o texto da declaração.
- As declarações de exemplo devem ter os audios salvos no projeto como assets para que não seja gasto credito  para gerar os audios das declarações pré existentes.
- O sistema deve ter musicas de fundos sem direito autorais, inicialmente deve usar Web Audio API para gerar as melodias de fundo que ficará a tocar enquanto as imagens passam e a declaração é recitada. Se basear em <audioEngine>.
- O sistema deve usar o chave de api do google ia studio, veja: `https://aistudio.google.com/docs/speech-generation?codelanguage=javascript`.
- A descrição da voz eu coloquei pra testar no google ia studio e ficou bem legal: `voz romantica apaixonada em forma de declaração`, ajuste se achar necessário.
- O usuário pode seelcionar para a declaração ser falada por maculino ou feminino. 
- O usuario pode ver um preview antes de publicar e copiar o link da sua declaração (publicação firará para uma futura implementação, agora no piloto só sera local com o preview. Sem banco de dados e login social por agora)
- O sistema deverá ter proteção contra print e gravação de tela para impedir que o usuário grave o preview ao invez de publicar.
- (para o futuro): O usuário compará créditos, ex: 3 declaracões por 5 reais. Na proxima fase quando sairmos do piloto, iremos decidir se usaremos stripe ou outra plataforma de pagamento.
- Quando compartilhado o link no whatasapp por exemplo, deve aparecer o preview com a primeira foto e o texto nesse sentido: "Oi, Fulana. Fiz essa declaração para você ❤️", pense em uma mensagem bonita que caiba no og preview.


<audioEngine> 
```js
class RomanticAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.style = 'piano_warm';
        this.userVolume = 0.24;
        this.isDucked = false;
        this.loopTimer = null;
        this.step = 0;

        this.progressions = {
            piano_warm: [
                [174.61, 220.00, 261.63, 349.23, 440.00], // F maj7
                [130.81, 196.00, 246.94, 329.63, 392.00], // C maj7
                [146.83, 220.00, 261.63, 349.23, 523.25], // Dm7
                [116.54, 174.61, 220.00, 293.66, 440.00]  // Bb maj7
            ],
            cinema_strings: [
                [130.81, 196.00, 261.63, 329.63, 493.88], // Cmaj7
                [164.81, 246.94, 329.63, 392.00, 587.33], // Em7
                [174.61, 220.00, 261.63, 349.23, 523.25], // Fmaj9
                [196.00, 246.94, 293.66, 392.00, 587.33]  // G6
            ],
            starlight_box: [
                [261.63, 329.63, 392.00, 523.25, 659.25],
                [220.00, 261.63, 329.63, 440.00, 659.25],
                [174.61, 261.63, 349.23, 440.00, 523.25],
                [196.00, 293.66, 392.00, 493.88, 587.33]
            ],
            serenade_pad: [
                [110.00, 164.81, 220.00, 277.18, 329.63], // A maj
                [123.47, 185.00, 246.94, 329.63, 369.99], // B sus
                [146.83, 220.00, 277.18, 369.99, 440.00], // D maj7
                [164.83, 246.94, 329.63, 415.30, 493.88]  // E maj
            ]
        };
    }
```
</audioEngine>

## Requsitos técnicos
- Para o piloto, não teremos backend, as keys devem ficar na env.
- Para o frontend, deverá ser SSR para ter o og-preview, fique livre para você escolher entre Nuxt (eu sou dev vue) e Next, já que é o você Antigravity que irá escrever todo o projeto.
- As imagens e declaracao geradas deverão ser salvas no Cloudflare R2 (apenas na fase pós piloto, pois na fase piloto ficará tudo em cachê para mim testar o produto por enquanto). Quando expirar o tempo de 7 dias (configuravel pela env) as fotos e audios devem serem deletadas do bucket para liberar o espaço.
- O frontend deve ser lindo, clean, amigável para pessoas leigas usarem, interface super limpa e intuitiva par não gerar carga cognitiva, tons claros com rosas para dar enfase de romance, animações de corações leves passando pelo fundo vagarosamente. 
- Inteface não deve exibir informaçoes desnecessárias como estilo de voz, nome da voz, etc. Apenas os campos necessários para criar a declaração.

## Extras
- Acredito que seja isso, depois iremos melhorar mais.
- Lembre-se, inicialmente sem backend, banco de dados,bucket, apenas local para testarmos interface e geração da apresentação + declaração.
- Salve esse prompt inicial meu em `falamor-init-prompt.md`
- Me questione caso tiver dúvidas.
