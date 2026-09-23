/**
 * Textos da interface, nos dois idiomas.
 *
 * O portugues e o padrao. O ingles existe porque o teste tambem vai ser aplicado
 * em quem nao le portugues, e traduzir so as perguntas deixaria metade da tela
 * numa lingua e metade na outra.
 *
 * O conteudo do relatorio (descricoes de tipo e subtipo) NAO mora aqui: ele esta
 * em src/data/results.js e results.en.js, porque e texto longo e de outra
 * natureza. Aqui ficam so os rotulos, os avisos e as frases da propria interface.
 *
 * Quando um texto depende de um valor, a entrada e uma funcao.
 */

export const IDIOMAS = [
  { chave: 'pt', rotulo: 'Português', curto: 'PT' },
  { chave: 'en', rotulo: 'English', curto: 'EN' },
];

export const PADRAO = 'pt';

const pt = {
  titulo: 'Teste de Eneagrama',
  trocarIdioma: 'Trocar idioma',

  landing: {
    comoFunciona: 'Como funciona',
    p1: 'Este teste ajuda você a descobrir o seu tipo no eneagrama.',
    p2:
      'Responda com honestidade: em cada pergunta, escolha a alternativa que soa mais verdadeira ' +
      'para você, sem tentar calcular ou adivinhar a resposta “certa”. Leva alguns minutos.',
    comecar: 'Começar',
  },

  quiz: {
    andamento: 'Em andamento. Responda com honestidade, sem calcular.',
    cabecalhoCenario: 'Cenário',
    cabecalhoEscala: 'Sobre você',
    instrucao: 'Escolha a alternativa mais verdadeira para você, mesmo que não seja perfeita, e clique em Avançar:',
    instrucaoEscala: 'O quanto esta frase combina com você? Responda pelo que é, não pelo que gostaria que fosse:',
    voltar: 'Voltar',
    avancar: 'Avançar',
    dominio: {
      trabalho: 'No trabalho',
      familia: 'Na família',
      amizade: 'Entre amigos',
      romance: 'No amor',
      geral: '',
    },
  },

  relatorio: {
    titulo: 'Resultado',
    refazer: 'Refazer',
    ressalva:
      'Lembrete: os pesos e limiares deste instrumento são heurísticas transparentes, não valores ' +
      'validados por amostra. Trate o resultado como um espelho para reflexão, não como um veredito.',

    s1: 'Centro dominante (tríade)',
    emocaoDeFundo: (emocao, pergunta) => (
      <>
        A emoção reativa de fundo aqui é <strong>{emocao}</strong>. A pergunta silenciosa que
        organiza suas reações: <em>“{pergunta}”</em>
      </>
    ),
    semTriade:
      'Suas respostas não apontaram um centro dominante. Isso acontece quando quase nenhuma ' +
      'alternativa pareceu com você.',
    triagemOutroCentro: 'A triagem inicial apontou outro centro',
    triagemOutroCentroTexto: (centro) => (
      <>
        Nas primeiras perguntas, o centro que mais apareceu foi <strong>{centro}</strong>. Mas o tipo
        é decidido comparando os candidatos só nas perguntas em que os dois apareciam juntos
      </>
    ),
    triagemOutroCentroFim:
      '. Isso é comum em quem tem um comportamento parecido com o de outro centro (por exemplo, um ' +
      '6 sexual ou um 4 sexual que se comportam como 8). O centro exibido acima é o do tipo encontrado.',
    confrontoDecisivo: (venc, rival, ev, er) => (
      <>
        , e nelas o <strong>Tipo {venc}</strong> ficou à frente do <strong>Tipo {rival}</strong> ({ev}{' '}
        {ev === 1 ? 'escolha' : 'escolhas'} contra {er})
      </>
    ),
    comoTriagemPontuou: 'Como a triagem inicial pontuou os centros',

    s2: 'Eneatipo',
    dorPorTras: 'A dor por trás: ',
    ficha: (paixao, fixacao) => `Ficha técnica (linguagem de análise): paixão, ${paixao}; fixação, ${fixacao}.`,
    semTipo:
      'Não foi possível identificar o seu tipo, porque você não se reconheceu nas alternativas das ' +
      'perguntas que distinguem os tipos. Refazer o teste escolhendo a opção mais próxima, mesmo ' +
      'quando nenhuma for perfeita, costuma resolver.',
    naoReconheceuSubtipo: 'Você não se reconheceu nas variantes deste tipo',
    naoReconheceuSubtipoTexto: (tipo, nulas, total) =>
      `Nas perguntas de subtipo do Tipo ${tipo}, você marcou “nenhuma dessas” em ${nulas} de ${total}. ` +
      'Quando a pessoa não se reconhece nas três variantes do tipo encontrado, é comum o tipo ser ' +
      'outro. Leia com atenção a descrição do segundo candidato, na seção 5.',
    comoTipoInferido: (centro) => `Como este tipo foi inferido dentro do centro ${centro}`,
    comoComparados: 'Como os candidatos de centros diferentes foram comparados',
    comoComparadosTexto:
      'Cada centro testado tem um vencedor. Entre eles, a decisão usa só as perguntas em que os dois ' +
      'tipos eram opção ao mesmo tempo, para nenhum tipo levar vantagem por ter sido medido em ' +
      'perguntas mais fáceis para ele.',
    confrontoLinha: (c) =>
      `Tipo ${c.a} × Tipo ${c.b}: ${c.escolhasA} × ${c.escolhasB} ` +
      `${c.escolhasA + c.escolhasB === 1 ? 'escolha' : 'escolhas'} em ${c.itens} ` +
      `${c.itens === 1 ? 'pergunta' : 'perguntas'}` +
      `${c.cruzados ? ` (${c.cruzados} feitas só para comparar os dois)` : ''}.`,

    confirmouTroca: 'O seu reconhecimento mudou o resultado',
    confirmouTrocaTexto: (de, para) =>
      `As perguntas de situação tinham apontado o ${de}, mas nas afirmações finais você se reconheceu ` +
      `bem mais no ${para}. O resultado seguiu o seu reconhecimento. O ${de} continua como segundo ` +
      'candidato, na seção 5.',
    confirmacaoResumo: 'O que você respondeu nas afirmações finais',
    confirmacaoTexto:
      'Estas foram as únicas perguntas em que você falou de si diretamente. Elas vêm por último, de ' +
      'propósito: até ali você respondeu sem saber o que cada alternativa media. Elas confirmam o ' +
      'tipo, ou o corrigem quando a diferença é grande.',
    confirmacaoGrau: (v) =>
      v >= 0.8
        ? 'se reconheceu por completo'
        : v >= 0.4
          ? 'se reconheceu'
          : v > 0
            ? 'se reconheceu um pouco'
            : v === 0
              ? 'ficou neutro'
              : v > -0.75
                ? 'não se reconheceu'
                : 'não se reconheceu nada',
    confirmacaoLinha: (nome, grau) => `${nome} — você ${grau}`,

    s3: 'Instinto dominante (subtipo)',
    subtipoSemTipo:
      'O texto do subtipo depende do tipo, que não pôde ser identificado. O instinto dominante está ' +
      'indicado acima.',
    semInstinto: 'Suas respostas não apontaram um instinto dominante.',
    comoInstintoInferido: 'Como este instinto foi inferido',

    s4: 'Índice de confiabilidade do autorrelato',
    confianca: (nivel) => `Confiança ${nivel}`,
    nulasRotulo: '“Nenhuma dessas”:',
    nulasTexto: (marcadas, total, nivel) => `${marcadas} de ${total} perguntas (nível ${nivel}).`,
    naoMedido: 'não medido.',
    desejabilidadeRotulo: 'Desejabilidade social:',
    desejabilidadeTexto: (marcadas, total, nivel) =>
      `${marcadas} de ${total} itens elogiáveis marcados (nível ${nivel}).`,
    deliberacaoRotulo: 'Deliberação em itens viscerais:',
    deliberacaoTexto: (nivel, extra) => `nível ${nivel}${extra}.`,
    gemeosRotulo: 'Consistência entre itens gêmeos:',
    gemeosSem: 'sem divergências registradas.',
    gemeosCom: (n) => `${n} divergência(s), ver abaixo.`,
    divergenciasTitulo: 'Divergências entre cenários quase-idênticos',
    divergenciasTexto:
      'A mesma tensão produziu escolhas diferentes conforme o contexto, sinal de onde sua defesa ' +
      'relaxa e onde a persona fica mais vigiada.',
    dominioCurto: { trabalho: 'Trabalho', familia: 'Família', amizade: 'Amizade', romance: 'Amor', geral: 'Geral' },

    s5: 'O que fazer com este resultado',
    passo1: 'Um teste escrito não substitui o reconhecimento. Naranjo tratava a leitura das descrições como o instrumento de diagnóstico: o tipo certo é aquele em que a pessoa se reconhece por inteiro, não o que soma mais pontos. Então o primeiro passo é ler a descrição acima',
    passo1ComSegundo: ' e a do segundo candidato, e ver qual delas incomoda mais.',
    passo1SemSegundo: ' com calma, e ver o quanto ela incomoda.',
    segundoCandidato: (nome, diferenca) => (
      <>
        O segundo candidato nas suas respostas foi o <strong>{nome}</strong>. A diferença central
        entre os dois: {diferenca}
      </>
    ),
    lerDescricao: (nome) => `Ler a descrição do ${nome}`,
    passo2:
      'O passo seguinte que ele recomendava é escrever uma autobiografia focada na paixão e na ' +
      'fixação encontradas: começar pelas cenas concretas da infância, sobretudo as dolorosas, e ' +
      'acompanhar como o caráter foi se formando como defesa diante delas. Sem pressa e sem ' +
      'abstração: o som, a imagem, o que foi dito, o que você concluiu ali.',

    s6: 'Contribuir com a validação do teste (opcional)',
    contribuirP1:
      'Este teste ainda está sendo validado. Para ajudar, baixe um arquivo com as suas respostas e ' +
      'entregue a quem indicou o teste. O arquivo não tem nome nem dados pessoais, só as ' +
      'alternativas escolhidas, o tempo de cada resposta e o resultado. Nada é enviado pela internet.',
    contribuirP2:
      'Se você já conhece o seu tipo por outro caminho, indique abaixo. É isso que permite medir se ' +
      'o teste acerta.',
    meuTipo: 'Meu tipo, se já sei:',
    meuInstinto: 'Meu instinto, se já sei:',
    comoSei: 'Como sei:',
    naoSei: 'Não sei',
    tipoN: (n) => `Tipo ${n}`,
    prefiroNaoDizer: 'Prefiro não dizer',
    fonteEntrevista: 'Entrevista com alguém que conhece o modelo',
    fonteOutroTeste: 'Outro teste',
    fonteAutoObservacao: 'Observação de mim mesmo',
    baixar: 'Baixar minhas respostas',
    baixado: 'Arquivo gerado.',

    resultadoInconclusivo: 'Resultado inconclusivo',
    ambiguidadeTitulo: 'Ambiguidade não resolvida entre dois tipos',
    ambiguidadeTexto: (a, b, diferenca) => (
      <>
        Suas respostas ficaram tecnicamente próximas entre <strong>{a}</strong> e <strong>{b}</strong>.
        Em vez de forçar uma resposta única: {diferenca}
      </>
    ),
    respostaDecisiva: 'Resposta mais decisiva:',
    respostaDecisivaTexto: (cenario, escolha) => (
      <>
        no cenário “{cenario}”, sua escolha “{escolha}” pesou mais para essa inferência.
      </>
    ),
    margemEstreita: (nome) =>
      `Margem estreita em relação à segunda hipótese (${nome}), por isso foram aplicadas perguntas de desempate.`,
    rotuloTipo: (k) => `Tipo ${k}`,
    notas: {
      subtipoNaoReconhecido: (d) =>
        `Nas perguntas de subtipo do tipo ${d.tipo}, você marcou "nenhuma dessas" em ${d.nulas} de ` +
        `${d.total}. Quando a pessoa não se reconhece nas variantes do tipo encontrado, o tipo pode ser ` +
        'outro: leia com atenção a descrição do segundo candidato.',
      confirmacaoTrocou: (d) =>
        `As perguntas de situação apontaram o tipo ${d.de}, mas nas afirmações finais você se reconheceu ` +
        `bem mais no tipo ${d.para}. O resultado seguiu o seu reconhecimento, e o tipo ${d.de} ficou como ` +
        'segundo candidato.',
      confirmacaoNaoReconheceu: (d) =>
        `Você não se reconheceu nas afirmações do tipo ${d.tipo}, que foi o apurado pelas situações. ` +
        'Leia também a descrição do segundo candidato antes de concluir.',
      confirmacaoAmbos: (d) =>
        `Você se reconheceu tanto nas afirmações do tipo ${d.a} quanto nas do tipo ${d.b}. As situações ` +
        'desempataram a favor do primeiro, mas vale ler os dois.',
    },
  },
};

const en = {
  titulo: 'Enneagram Test',
  trocarIdioma: 'Change language',

  landing: {
    comoFunciona: 'How it works',
    p1: 'This test helps you find your enneagram type.',
    p2:
      'Answer honestly: for each question, choose the option that sounds truest to you, without ' +
      'trying to work out or guess the “right” answer. It takes a few minutes.',
    comecar: 'Start',
  },

  quiz: {
    andamento: 'In progress. Answer honestly, without calculating.',
    cabecalhoCenario: 'Situation',
    cabecalhoEscala: 'About you',
    instrucao: 'Choose the option that is truest for you, even if it is not perfect, then click Next:',
    instrucaoEscala: 'How much does this sentence match you? Answer for what is, not for what you would like it to be:',
    voltar: 'Back',
    avancar: 'Next',
    dominio: {
      trabalho: 'At work',
      familia: 'In the family',
      amizade: 'Among friends',
      romance: 'In love',
      geral: '',
    },
  },

  relatorio: {
    titulo: 'Result',
    refazer: 'Start again',
    ressalva:
      'A reminder: the weights and thresholds in this instrument are transparent heuristics, not ' +
      'values validated on a sample. Treat the result as a mirror for reflection, not as a verdict.',

    s1: 'Dominant centre',
    emocaoDeFundo: (emocao, pergunta) => (
      <>
        The background reactive emotion here is <strong>{emocao}</strong>. The silent question that
        organises your reactions: <em>“{pergunta}”</em>
      </>
    ),
    semTriade:
      'Your answers did not point to a dominant centre. That happens when almost none of the options ' +
      'sounded like you.',
    triagemOutroCentro: 'The initial screening pointed to another centre',
    triagemOutroCentroTexto: (centro) => (
      <>
        In the first questions, the centre that came up most was <strong>{centro}</strong>. But the
        type is decided by comparing the candidates only in the questions where both appeared together
      </>
    ),
    triagemOutroCentroFim:
      '. This is common in people whose behaviour resembles another centre (a sexual 6 or a sexual 4 ' +
      'who behave like an 8, for instance). The centre shown above is the one of the type found.',
    confrontoDecisivo: (venc, rival, ev, er) => (
      <>
        , and in those <strong>Type {venc}</strong> came out ahead of <strong>Type {rival}</strong> ({ev}{' '}
        {ev === 1 ? 'choice' : 'choices'} to {er})
      </>
    ),
    comoTriagemPontuou: 'How the initial screening scored the centres',

    s2: 'Enneatype',
    dorPorTras: 'The pain underneath: ',
    ficha: (paixao, fixacao) => `Technical note (analytic language): passion, ${paixao}; fixation, ${fixacao}.`,
    semTipo:
      'It was not possible to identify your type, because you did not recognise yourself in the ' +
      'options of the questions that distinguish the types. Taking the test again and choosing the ' +
      'nearest option, even when none is perfect, usually solves it.',
    naoReconheceuSubtipo: 'You did not recognise yourself in the variants of this type',
    naoReconheceuSubtipoTexto: (tipo, nulas, total) =>
      `In the subtype questions for Type ${tipo}, you marked “none of these” in ${nulas} of ${total}. ` +
      'When someone does not recognise themselves in the three variants of the type found, the type ' +
      'is often another one. Read the description of the second candidate in section 5 carefully.',
    comoTipoInferido: (centro) => `How this type was inferred inside the ${centro}`,
    comoComparados: 'How candidates from different centres were compared',
    comoComparadosTexto:
      'Each centre tested has a winner. Between them, the decision uses only the questions where both ' +
      'types were options at the same time, so that no type gains an advantage from having been ' +
      'measured on questions that were easier for it.',
    confrontoLinha: (c) =>
      `Type ${c.a} × Type ${c.b}: ${c.escolhasA} × ${c.escolhasB} ` +
      `${c.escolhasA + c.escolhasB === 1 ? 'choice' : 'choices'} across ${c.itens} ` +
      `${c.itens === 1 ? 'question' : 'questions'}` +
      `${c.cruzados ? ` (${c.cruzados} asked only to compare the two)` : ''}.`,

    confirmouTroca: 'Your recognition changed the result',
    confirmouTrocaTexto: (de, para) =>
      `The situation questions had pointed to ${de}, but in the final statements you recognised ` +
      `yourself far more in ${para}. The result followed your recognition. ${de} remains as the ` +
      'second candidate, in section 5.',
    confirmacaoResumo: 'What you answered in the final statements',
    confirmacaoTexto:
      'These were the only questions where you spoke about yourself directly. They come last on ' +
      'purpose: until then you answered without knowing what each option measured. They confirm the ' +
      'type, or correct it when the difference is wide.',
    confirmacaoGrau: (v) =>
      v >= 0.8
        ? 'recognised yourself completely'
        : v >= 0.4
          ? 'recognised yourself'
          : v > 0
            ? 'recognised yourself a little'
            : v === 0
              ? 'were neutral'
              : v > -0.75
                ? 'did not recognise yourself'
                : 'did not recognise yourself at all',
    confirmacaoLinha: (nome, grau) => `${nome} — you ${grau}`,

    s3: 'Dominant instinct (subtype)',
    subtipoSemTipo:
      'The subtype text depends on the type, which could not be identified. The dominant instinct is ' +
      'shown above.',
    semInstinto: 'Your answers did not point to a dominant instinct.',
    comoInstintoInferido: 'How this instinct was inferred',

    s4: 'Self-report reliability index',
    confianca: (nivel) => `Confidence ${nivel}`,
    nulasRotulo: '“None of these”:',
    nulasTexto: (marcadas, total, nivel) => `${marcadas} of ${total} questions (${nivel} level).`,
    naoMedido: 'not measured.',
    desejabilidadeRotulo: 'Social desirability:',
    desejabilidadeTexto: (marcadas, total, nivel) =>
      `${marcadas} of ${total} flattering items marked (${nivel} level).`,
    deliberacaoRotulo: 'Deliberation on gut items:',
    deliberacaoTexto: (nivel, extra) => `${nivel} level${extra}.`,
    gemeosRotulo: 'Consistency between twin items:',
    gemeosSem: 'no divergences recorded.',
    gemeosCom: (n) => `${n} divergence(s), see below.`,
    divergenciasTitulo: 'Divergences between almost identical scenes',
    divergenciasTexto:
      'The same tension produced different choices depending on the context, a sign of where your ' +
      'defence relaxes and where the persona is more closely watched.',
    dominioCurto: { trabalho: 'Work', familia: 'Family', amizade: 'Friendship', romance: 'Love', geral: 'General' },

    s5: 'What to do with this result',
    passo1: 'A written test does not replace recognition. Naranjo treated reading the descriptions as the diagnostic instrument: the right type is the one the person recognises themselves in completely, not the one with the most points. So the first step is to read the description above',
    passo1ComSegundo: ' and the one for the second candidate, and see which of them is more uncomfortable.',
    passo1SemSegundo: ' slowly, and see how uncomfortable it is.',
    segundoCandidato: (nome, diferenca) => (
      <>
        The second candidate in your answers was <strong>{nome}</strong>. The central difference
        between the two: {diferenca}
      </>
    ),
    lerDescricao: (nome) => `Read the description of ${nome}`,
    passo2:
      'The next step he recommended is to write an autobiography focused on the passion and the ' +
      'fixation found: to start from the concrete scenes of childhood, above all the painful ones, ' +
      'and to follow how the character was formed as a defence against them. Without hurry and ' +
      'without abstraction: the sound, the image, what was said, what you concluded there.',

    s6: 'Contribute to validating the test (optional)',
    contribuirP1:
      'This test is still being validated. To help, download a file with your answers and hand it to ' +
      'whoever pointed you to the test. The file has no name and no personal data, only the options ' +
      'chosen, the time taken on each answer and the result. Nothing is sent over the internet.',
    contribuirP2:
      'If you already know your type by another route, say so below. That is what makes it possible ' +
      'to measure whether the test gets it right.',
    meuTipo: 'My type, if I know it:',
    meuInstinto: 'My instinct, if I know it:',
    comoSei: 'How I know:',
    naoSei: 'I do not know',
    tipoN: (n) => `Type ${n}`,
    prefiroNaoDizer: 'I would rather not say',
    fonteEntrevista: 'An interview with someone who knows the model',
    fonteOutroTeste: 'Another test',
    fonteAutoObservacao: 'Observing myself',
    baixar: 'Download my answers',
    baixado: 'File created.',

    resultadoInconclusivo: 'Inconclusive result',
    ambiguidadeTitulo: 'Unresolved ambiguity between two types',
    ambiguidadeTexto: (a, b, diferenca) => (
      <>
        Your answers came out technically close between <strong>{a}</strong> and <strong>{b}</strong>.
        Rather than forcing a single answer: {diferenca}
      </>
    ),
    respostaDecisiva: 'Most decisive answer:',
    respostaDecisivaTexto: (cenario, escolha) => (
      <>
        in the scene “{cenario}”, your choice “{escolha}” weighed most for this inference.
      </>
    ),
    margemEstreita: (nome) =>
      `Narrow margin against the second hypothesis (${nome}), which is why tie-break questions were asked.`,
    rotuloTipo: (k) => `Type ${k}`,
    notas: {
      subtipoNaoReconhecido: (d) =>
        `In the subtype questions for type ${d.tipo}, you marked "none of these" in ${d.nulas} of ` +
        `${d.total}. When someone does not recognise themselves in the variants of the type found, the ` +
        'type may be another one: read the description of the second candidate carefully.',
      confirmacaoTrocou: (d) =>
        `The situation questions pointed to type ${d.de}, but in the final statements you recognised ` +
        `yourself far more in type ${d.para}. The result followed your recognition, and type ${d.de} is ` +
        'now the second candidate.',
      confirmacaoNaoReconheceu: (d) =>
        `You did not recognise yourself in the statements for type ${d.tipo}, which is what the ` +
        'situations found. Read the description of the second candidate as well before concluding.',
      confirmacaoAmbos: (d) =>
        `You recognised yourself both in the statements for type ${d.a} and in those for type ${d.b}. ` +
        'The situations broke the tie in favour of the first, but both are worth reading.',
    },
  },
};

export const TEXTOS = { pt, en };
