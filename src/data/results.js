/**
 * Textos de resultado, tom de retrato psicologico (nao horoscopo, nao manual).
 * Metafora central por subtipo, cena concreta, ferida contada como historia.
 * SEM travessoes (—) por decisao editorial.
 *
 * FONTES: tipos 1, 8 e 9 redigidos a partir dos livros de subtipo enviados
 * (E1, E8, E9). Tipos 2 a 7 redigidos a partir do arcabouco teorico do
 * eneagrama (panorama de Character and Neurosis + estrutura dos subtipos da
 * protoanalise), pois os livros especificos de subtipo de 2 a 7 nao estao
 * disponiveis no momento. Prosa original em todos os casos.
 */

export const triades = {
  instintiva: {
    nome: 'Tríade instintiva / visceral',
    tipos: [8, 9, 1],
    emocao: 'raiva',
    pergunta: 'Meu espaço e minha vontade estão sendo respeitados?',
    texto:
      'Sua reatividade de fundo se organiza em torno da raiva e do corpo, do presente, do ' +
      'limite, da autonomia e do controle. Você tende a reagir a partir da ação antes de ' +
      'refletir, e o que dispara em você é a sensação de que seu território, físico, moral ou ' +
      'de vontade, foi tocado. É uma tríade avessa à introspecção: o movimento vai para fora, ' +
      'para o mundo concreto, não para dentro.',
  },
  emocional: {
    nome: 'Tríade emocional / coração',
    tipos: [2, 3, 4],
    emocao: 'vergonha',
    pergunta: 'Sou digno de amor e reconhecimento do jeito que sou, ou preciso de uma máscara?',
    texto:
      'Sua reatividade de fundo gravita em torno da imagem e da identidade, de como você é ' +
      'visto e amado. A emoção nuclear é a vergonha, e a pergunta silenciosa é sobre o próprio ' +
      'valor. A orientação é para a narrativa que você conta de si mesmo.',
  },
  mental: {
    nome: 'Tríade mental / cabeça',
    tipos: [5, 6, 7],
    emocao: 'medo',
    pergunta: 'Estou seguro? Tenho suporte e informação suficientes para o que vem?',
    texto:
      'Sua reatividade de fundo se organiza em torno da segurança e da orientação, do apoio e ' +
      'da antecipação. A emoção nuclear é o medo, e a atenção corre para o futuro, para a ' +
      'estratégia e para a ansiedade do que ainda não aconteceu.',
  },
};

export const tipos = {
  1: {
    nome: 'Eneatipo 1',
    paixao: 'Raiva (ira internalizada, ressentimento)',
    fixacao: 'Ressentimento / perfeccionismo',
    nucleo:
      'Você é a criança que precisou virar adulta cedo demais, que aprendeu que sentir era ' +
      'perigoso e que a única saída era acertar. Onde os outros veem o mundo, você vê primeiro ' +
      'o que está fora do lugar: a ruga na toalha, a palavra mal escolhida, o detalhe que mais ' +
      'ninguém notou. Há em você uma régua interna que nunca desliga, e ela mede tudo, ' +
      'inclusive, e principalmente, você mesmo. O que parece exigência de perfeição é, por ' +
      'baixo, uma raiva que não teve para onde ir: a raiva de quem não pôde reclamar, não pôde ' +
      'errar, não pôde ser só uma criança. Como não havia permissão para senti-la, ela virou ' +
      'correção, de si, dos outros, do mundo. Você não se enxerga como uma pessoa raivosa; se ' +
      'enxerga como alguém que quer o certo. Mas é a mesma força: a raiva engolida, refinada, ' +
      'transformada em dever.',
    dorDeFundo:
      'Por baixo do esforço de ser bom e correto mora uma criança que concluiu, muito cedo, que ' +
      'só seria amada se merecesse, que havia nela algo de errado a ser consertado antes de ' +
      'valer o amor. O rigor com que você se cobra é essa mesma criança se policiando, com medo ' +
      'de que, se afrouxar, apareça o monstro que ela acha que esconde. A ternura que você se ' +
      'recusa em nome do dever é justamente o que ficou trancado lá dentro. E o cansaço que ' +
      'ninguém vê é o de carregar sozinho, sem descanso, o peso de manter tudo, e a si próprio, ' +
      'impecável.',
  },
  2: {
    nome: 'Eneatipo 2',
    paixao: 'Orgulho',
    fixacao: 'Falsa generosidade / autoimagem de quem só transborda',
    nucleo:
      'Você aprendeu cedo a ser amado dando, e virou especialista em ser indispensável. Tem uma ' +
      'antena finíssima para o que o outro precisa, às vezes antes de a própria pessoa perceber, ' +
      'e se oferece com um calor que encanta. Por baixo disso mora uma convicção silenciosa: ' +
      '“sem mim, isso aqui não anda”. O orgulho aqui não é se achar melhor de forma fria; é se ' +
      'sentir especial, escolhido, alguém cuja presença faz falta. Você se vê como quem ' +
      'transborda e cuida, quase nunca como quem precisa. E é aí que está o nó: você dá para ' +
      'receber, embora nem admita para si mesmo que espera algo em troca. Quando o carinho não ' +
      'vem na medida que você sente merecer, o encanto pode virar mágoa, ou uma pequena ' +
      'tempestade.',
    dorDeFundo:
      'Por trás da pessoa cheia de amor para dar existe uma criança que concluiu que ser amada ' +
      'por quem é, simplesmente, não bastava; que era preciso conquistar o afeto sendo útil, ' +
      'encantadora, necessária. Reconhecer a própria carência parece a coisa mais proibida do ' +
      'mundo, porque contraria a imagem de quem só transborda. A dor é a suspeita, quase nunca ' +
      'dita, de que se você parasse de dar, de agradar, de ser especial, descobriria que não ' +
      'seria escolhido. O caminho de volta começa por deixar que alguém cuide de você sem que ' +
      'você tenha feito nada para merecer.',
  },
  3: {
    nome: 'Eneatipo 3',
    paixao: 'Vaidade',
    fixacao: 'Autoengano de imagem',
    nucleo:
      'Você aprendeu que valia pelo que entregava, e virou motor. Desde cedo entendeu que amor e ' +
      'aplauso vinham do sucesso, da eficiência, de brilhar aos olhos dos outros, então se ' +
      'tornou aquilo que o mundo valoriza. É rápido, capaz, sabe se apresentar, sabe vencer. O ' +
      'problema é que, de tanto se identificar com a boa imagem, você perdeu o rastro de onde ' +
      'ela termina e você começa. As emoções que atrapalham o desempenho ficam de lado, adiadas ' +
      'para um “depois” que raramente chega. Você é a pessoa que não pode ter problemas, que ' +
      'precisa dar conta, que sente, no fundo, que sem esse desempenho todo não sobraria lugar ' +
      'para ela. E há uma pergunta que você evita: seria amado por quem é, se não estivesse ' +
      'sempre provando o próprio valor?',
    dorDeFundo:
      'Por trás do vencedor que faz tudo parecer fácil mora uma criança que sentiu que só era ' +
      'vista quando se destacava; que aprendeu que ser, simplesmente, não chamava atenção, mas ' +
      'fazer, conquistar, agradar, sim. A vaidade não é um defeito de caráter, é uma fome antiga ' +
      'de existir aos olhos de alguém. A dor mais funda é a suspeita de que, se parasse de ' +
      'correr, de produzir, de manter a fachada impecável, encontraria um vazio no lugar onde ' +
      'deveria haver um “eu”. O caminho de volta é o mais estranho para você: parar, e descobrir ' +
      'que ainda existe alguém ali quando ninguém está avaliando.',
  },
  4: {
    nome: 'Eneatipo 4',
    paixao: 'Inveja',
    fixacao: 'Melancolia / comparação',
    nucleo:
      'Você carrega a sensação de que falta em você algo que os outros parecem ter naturalmente, ' +
      'e a vida vira uma comparação silenciosa em que você quase sempre sai perdendo. Sente as ' +
      'coisas fundo, intensamente, e há beleza nisso, mas também uma tendência a namorar a ' +
      'própria dor, a se demorar no que dói, a achar que sofrer bastante confere uma nobreza ' +
      'secreta. O que está presente raramente encanta; o desejável está sempre no que falta, no ' +
      'que já foi, no que o outro tem. Você não quer ser comum, quer ser especial, e ' +
      'paradoxalmente se sente o mais defeituoso de todos. Essa inveja não é mesquinha: é a fome ' +
      'de uma criança que ficou com a impressão de ter sido preterida, e que passou a se sentir ' +
      'eternamente do lado de fora.',
    dorDeFundo:
      'No fundo há uma perda antiga, real ou pressentida, um momento em que você concluiu que ' +
      'não era querido como deveria, e desde então algo em você fica de luto por um amor que ' +
      'parece ter existido e sumido. A dor é ao mesmo tempo verdadeira e um refúgio: enquanto ' +
      'sofre, você sente que existe, e teme que, sem o sofrimento, sobraria só o vazio. O ' +
      'caminho de volta não passa por conquistar o que falta, e sim por uma revolução ' +
      'silenciosa: perceber que o que você tanto procura fora, e inveja no outro, é a capacidade ' +
      'de valorizar o que já é seu, ordinário e presente.',
  },
  5: {
    nome: 'Eneatipo 5',
    paixao: 'Avareza',
    fixacao: 'Retenção / desapego defensivo',
    nucleo:
      'Você aprendeu cedo que precisar dos outros dá em decepção, então escolheu precisar de ' +
      'pouco. Recolheu-se para dentro, para um espaço só seu, e ali guarda com cuidado o que ' +
      'tem: seu tempo, sua energia, suas informações, sua vida interior. Doar parece perigoso, ' +
      'como se cada gota que sai não fosse voltar e você acabasse na míngua. Prefere observar a ' +
      'participar, entender a se envolver, saber a sentir. Há uma riqueza real nesse mundo ' +
      'interno, mas ela custa caro: para não se sentir invadido nem drenado, você se afasta, e ' +
      'no afastamento perde o calor que, no fundo, também deseja. Não é frieza por maldade; é a ' +
      'economia de quem concluiu que sobreviveria melhor sozinho, com a ponte levantada.',
    dorDeFundo:
      'Por trás do desapego mora uma criança que sentiu o mundo ou invasivo demais ou vazio ' +
      'demais, e que decidiu se proteger fechando as comportas do próprio coração. A avareza não ' +
      'é só com dinheiro ou com coisas: é com a própria entrega, com a necessidade que você não ' +
      'se permite sentir. A dor é a solidão que você mesmo constrói ao tentar se blindar contra ' +
      'a decepção, o vazio que se aprofunda justamente na tentativa de não depender de ninguém. ' +
      'O caminho de volta não é receber mais, é descobrir que a sua maior riqueza aparece quando ' +
      'você se arrisca a dar, a sair da torre e habitar o mundo com o corpo, não só com a mente.',
  },
  6: {
    nome: 'Eneatipo 6',
    paixao: 'Medo',
    fixacao: 'Dúvida / desconfiança',
    nucleo:
      'Você vive com uma antena ligada para o que pode dar errado, uma vigilância que raramente ' +
      'descansa. Não é covardia, é uma mente que confere, questiona, procura garantias, porque ' +
      'em algum momento aprendeu que o chão pode ceder e que confiar cegamente é arriscado. Isso ' +
      'te faz leal, responsável, atento, alguém em quem se pode contar, e ao mesmo tempo preso ' +
      'na dúvida: você duvida dos outros, mas também de si, das próprias percepções e decisões. ' +
      'Busca uma referência segura, uma autoridade, uma regra, um grupo, um sistema em que se ' +
      'apoiar, e ao mesmo tempo desconfia dela. Ora obedece, ora se rebela; ora se encolhe ' +
      'diante do que teme, ora avança contra o medo para não senti-lo. No centro de tudo há uma ' +
      'pergunta que não cala: em quem, e em quê, é seguro confiar?',
    dorDeFundo:
      'Por trás da vigilância mora uma criança que não teve um chão firme o bastante, que ' +
      'aprendeu que o apoio pode faltar e que é preciso se precaver para não ser pego ' +
      'desprevenido. A dúvida constante é uma tentativa de controlar um perigo que, no fundo, é ' +
      'o próprio desamparo. A dor é o cansaço de nunca poder descansar por inteiro, de ' +
      'transformar cada afeto num teste e cada apoio numa suspeita. O caminho de volta é uma ' +
      'coragem quieta: descobrir que a segurança que você procura tanto do lado de fora, em ' +
      'garantias e autoridades, só se firma quando começa a brotar de dentro, de uma confiança ' +
      'na própria capacidade de lidar com o que vier.',
  },
  7: {
    nome: 'Eneatipo 7',
    paixao: 'Gula',
    fixacao: 'Planejamento / racionalização',
    nucleo:
      'Você tem uma mente que corre para frente, para a próxima ideia, o próximo plano, a ' +
      'próxima possibilidade brilhante. A dor te parece algo a se contornar, e você aprendeu a ' +
      'fazer isso com charme, otimismo e uma capacidade impressionante de encontrar o lado bom, ' +
      'a saída, a alternativa mais agradável. Gosta de variedade, de novidade, de manter as ' +
      'portas abertas, porque se comprometer com uma só coisa é fechar todas as outras, e isso ' +
      'aperta. É encantador, ágil, cheio de projetos, e sabe convencer, inclusive a si mesmo, de ' +
      'que tudo vai dar certo. O nó é que, de tanto antecipar o prazer que vem, você raramente ' +
      'pousa no que já está aqui; a fome nunca sacia porque o gostoso está sempre no próximo ' +
      'prato, não no que está no seu.',
    dorDeFundo:
      'Por baixo do entusiasmo mora uma criança que, em algum ponto, achou o mundo doloroso ou ' +
      'frustrante demais e decidiu se refugiar na imaginação, no que poderia ser, num futuro ' +
      'sempre mais luminoso que o presente. O otimismo é real, mas também é um jeito de não ' +
      'olhar para a dor, a sua e a dos outros. A dor mais funda é o vazio que aparece quando as ' +
      'opções acabam e não há mais para onde correr, a suspeita de que tanta abundância planejada ' +
      'esconde uma falta que nenhum plano preenche. O caminho de volta é o mais difícil para ' +
      'você: ficar, sentir o que está aqui, inclusive o que dói, e descobrir que a profundidade ' +
      'que você procura não está no próximo lugar, e sim neste.',
  },
  8: {
    nome: 'Eneatipo 8',
    paixao: 'Luxúria (excesso, intensidade)',
    fixacao: 'Vingança',
    nucleo:
      'Você aprendeu cedo que o mundo é um lugar onde se toma ou se é tomado, e escolheu tomar. ' +
      'Por baixo da casca dura que todos veem existe um núcleo ainda de criança, terno, que um ' +
      'dia foi machucado e jurou nunca mais ficar à mercê de ninguém. Então você fez de si uma ' +
      'fortaleza: intensidade, uma franqueza que às vezes fere, uma presença que ocupa o espaço ' +
      'sem pedir licença. Vai com tudo, no presente, no impacto, porque sentir demais, precisar ' +
      'demais, depender demais parece perigoso, quase como voltar a ser aquela criança sem ' +
      'defesa. O que os outros chamam de raiva é, no fundo, uma vigília: o medo de ser ' +
      'controlado, enganado ou traído, transformado em força. E a conta que você tenta acertar ' +
      'com a vida é antiga: já que uma vez foi obrigado a engolir, agora ninguém mais te passa a ' +
      'perna.',
    dorDeFundo:
      'A dureza guarda o que há de mais frágil em você: a ternura e a capacidade de receber, ' +
      'trancadas cedo demais para não doer. Você desconfia do amor justamente porque o deseja ' +
      'tanto, porque amar é se entregar, e se entregar é arriscar-se a ficar de novo à mercê de ' +
      'alguém. Por isso empurra contra o mundo o tempo todo: para não escutar o silêncio lá ' +
      'dentro, para não perceber que a armadura, de tão pesada, isola você exatamente daquilo ' +
      'que mais queria. O caminho de volta não é ficar mais forte, é deixar alguém chegar perto ' +
      'sem que isso signifique perder.',
  },
  9: {
    nome: 'Eneatipo 9',
    paixao: 'Preguiça psicológica (acídia)',
    fixacao: 'Autoesquecimento / acomodação',
    nucleo:
      'Existe em você uma neblina interna, um jeito macio de não estar totalmente ali. Você ' +
      'aprendeu cedo, sem escolher, a se apagar: a criança que teve de se adaptar rápido demais, ' +
      'engolir a própria vontade e ir levando para não incomodar. Com o tempo, o próprio querer ' +
      'ficou distante, quase como se fosse de outra pessoa. Você se descreve como alguém de boa, ' +
      'que não tem preferência forte, que se adapta a tudo, e é verdade, mas por baixo dessa ' +
      'facilidade mora um esquecimento: o de si mesmo. Para manter a paz do lado de fora, você ' +
      'adormeceu uma parte de dentro. E a raiva que seria natural não explode nem corrige: ela ' +
      'some antes de você perceber, dissolvida na mesma neblina que faz tudo parecer, no fim, ' +
      'não tão grave assim.',
    dorDeFundo:
      'No lugar onde deveria estar o seu próprio desejo há um vazio antigo, de quando faltou o ' +
      'amor que teria despertado em você o gosto por existir. Em vez de olhar para dentro e ' +
      'buscar ali, você aprendeu a se encher pelo outro, pelas vontades, pela vida, pelas causas ' +
      'dos outros. A abnegação parece generosidade, e em parte é, mas carrega um pedido ' +
      'silencioso: que alguém, enfim, note que você esteve ali o tempo todo. O caminho de volta ' +
      'começa por um gesto que parece pequeno e é enorme: perceber que você também quer alguma ' +
      'coisa, e que isso não vai quebrar a paz do mundo.',
  },
};

export const instintos = {
  autopreservacao: {
    nome: 'Autopreservação',
    resumo: 'Foco em segurança física, recursos, conforto, rotina e corpo.',
  },
  social: {
    nome: 'Social',
    resumo: 'Foco no grupo, pertencimento, hierarquia e papel dentro da comunidade.',
  },
  sexual: {
    nome: 'Sexual (um-para-um)',
    resumo: 'Foco em intensidade, fusão e conexão com uma pessoa, magnetismo.',
  },
};

/**
 * Subtipos: como o instinto dominante modula a expressão do tipo.
 * Chave: `${tipo}-${instinto}`. As 27 combinações estão preenchidas.
 */
export const subtipos = {
  // ----- Tipo 1 -----
  '1-autopreservacao': {
    titulo: 'Tipo 1 · Autopreservação: a ruga que não se deixa alisar',
    texto:
      'Este é o 1 que quase nunca parece bravo, parece preocupado. A raiva não sai: vira uma ' +
      'checagem mental sem fim de tudo o que pode dar errado, como se antecipar cada falha fosse ' +
      'um jeito de segurar um controle que, no fundo, você nunca teve. É o filho do estofador ' +
      'para quem uma ruga é inaceitável: você refaz, revisa, acrescenta “mais um detalhe”, alisa ' +
      'a mesma dobra invisível até tarde da noite, e ainda assim algo pede melhora. Cuida da ' +
      'casa, da saúde, das contas, dos outros, e faz questão de não precisar de ninguém, porque ' +
      'pedir ajuda seria admitir uma falha. A raiva aqui não explode; escorre como impaciência, ' +
      'ironia, um comentário afiado, e sobretudo se volta contra você mesmo, num juiz interno ' +
      'que não dá trégua. Você é a criança que ouviu, direta ou indiretamente, que não era boa o ' +
      'bastante, e passou a vida tentando provar o contrário, sem nunca parar para perguntar se ' +
      'um dia foi, simplesmente, suficiente.',
  },
  '1-social': {
    titulo: 'Tipo 1 · Social: a régua apontada para o mundo',
    texto:
      'Este é o 1 que carrega uma régua para tudo e mede o mundo por ela, e o mundo quase nunca ' +
      'passa. A raiva vira uma espécie de superioridade fria, elegante: você não grita, você ' +
      'corrige; não se rebaixa a brigar, aponta de cima o que não funciona. Há em você um ' +
      'professor que ninguém pediu, um reformador que sente, em silêncio, “estou irritado porque ' +
      'tenho de viver num mundo imperfeito e cabe a mim melhorá-lo”. Você preza as aparências, ' +
      'os bons modos, o procedimento certo, e se sente o mais íntegro da sala, o que, sem querer, ' +
      'faz os outros se sentirem menores. É o subtipo que mais se afasta: a distância de quem é ' +
      'correto demais para pertencer, que admira o poder ao mesmo tempo em que disputa por ele, ' +
      'e que, de tanto zelar pelo que deveria ser, acaba ficando de fora do que simplesmente é.',
  },
  '1-sexual': {
    titulo: 'Tipo 1 · Sexual: o reformador apaixonado',
    texto:
      'Este é o 1 mais quente, o único que se permite a raiva quase aberta, a ponto de, à ' +
      'primeira vista, ser confundido com um 8. Aqui a exigência de perfeição se volta para uma ' +
      'pessoa: você ama corrigindo, reforma quem ama, e faz isso com fervor, como quem de fato ' +
      'acredita estar entregando um presente. Fica genuinamente irritado quando o outro “não ' +
      'entende a mensagem” e não se aperfeiçoa. É possessivo, zeloso, intenso; toma o que quer ' +
      'com a certeza de que é seu direito e depois justifica com um ar de causa nobre. A energia ' +
      'é vital, entusiasmada, quase contagiante, e a ferida por baixo é a mesma dos outros dois: ' +
      'a de quem transformou o próprio calor em cruzada, porque amar sem corrigir pareceria ' +
      'perigoso demais, quase como não ter controle nenhum.',
  },

  // ----- Tipo 2 -----
  '2-autopreservacao': {
    titulo: 'Tipo 2 · Autopreservação: a criança que espera ser mimada',
    texto:
      'Este é o 2 que conserva um jeito de criança querida, aquele que, sem perceber, espera ser ' +
      'cuidado, poupado, tratado como exceção. Você conquista o afeto menos pela sedução ' +
      'escancarada e mais por uma doçura que desarma, uma vulnerabilidade encantadora que faz os ' +
      'outros quererem te proteger. Tem dificuldade de pedir diretamente, então pede pelo charme, ' +
      'pelo biquinho, pela birra fofa. Espera privilégios sem admitir que espera, e se ressente, ' +
      'meio magoado, quando o mundo não te trata com o cuidado especial que você sente que lhe é ' +
      'devido. Por baixo do jeito leve há um medo antigo de não ser suficientemente amado se ' +
      'tiver que se virar sozinho, como todo mundo.',
  },
  '2-social': {
    titulo: 'Tipo 2 · Social: a pessoa por trás das pessoas importantes',
    texto:
      'Este é o 2 mais adulto e estratégico, cujo orgulho se realiza em ser importante para ' +
      'muita gente, estar perto de quem tem poder, ser a peça sem a qual o grupo não funciona. ' +
      'Você é o conector, o anfitrião, aquele que conhece todo mundo e a quem todo mundo recorre. ' +
      'Gosta de influência, mas prefere exercê-la de bastidor, como conselheiro, braço direito, ' +
      'alma da causa, a ocupar o palco sozinho. Ser indispensável a muitos é a sua forma de se ' +
      'sentir valioso. E a ferida aparece quando você percebe que ajudou a erguer os outros e ' +
      'ninguém se lembrou de erguer você, quando o reconhecimento que você tanto distribui não ' +
      'volta na sua direção.',
  },
  '2-sexual': {
    titulo: 'Tipo 2 · Sexual: preciso ser a pessoa mais importante para você',
    texto:
      'Este é o 2 mais intenso e conquistador, aquele que precisa ser o grande amor, a pessoa ' +
      'mais importante na vida de quem escolheu. Você seduz com uma dedicação total, se molda ao ' +
      'desejo do outro, faz de si mesmo exatamente o que aquela pessoa parece querer, e espera, ' +
      'em troca, ser eleito acima de tudo e de todos. Não é o afeto morno que te satisfaz, é a ' +
      'certeza de ser insubstituível para alguém. Pode ficar possessivo, ciumento, disposto a ' +
      'grandes gestos e a grandes cobranças. Por baixo da conquista mora o medo de que, sem ser ' +
      'o preferido absoluto, você seja apenas mais um, e essa possibilidade é insuportável.',
  },

  // ----- Tipo 3 -----
  '3-autopreservacao': {
    titulo: 'Tipo 3 · Autopreservação: a vaidade de não ter vaidade',
    texto:
      'Este é o 3 que quase não parece vaidoso, porque sua imagem ideal é justamente a de quem ' +
      'não se importa com imagem: eficiente, autossuficiente, produtivo, confiável. Você ' +
      'trabalha sem parar, cuida de tudo, resolve, e tira o valor da própria capacidade de dar ' +
      'conta sozinho. Vender-se com brilho lhe parece vulgar; o seu orgulho está em ser um bom ' +
      'modelo, alguém que faz a coisa certa e não precisa de ninguém. Mas a corrida é a mesma ' +
      'dos outros três: você se identifica com o fazer a ponto de esquecer que existe também ' +
      'quando não está produzindo. E há uma ansiedade fina por baixo da eficiência, o medo de ' +
      'que, se parasse, tudo desandaria, e você junto.',
  },
  '3-social': {
    titulo: 'Tipo 3 · Social: o pódio e a imagem que vende',
    texto:
      'Este é o 3 mais reconhecível, aquele que persegue status, posição, os símbolos visíveis ' +
      'do sucesso. Você sabe ler o que é valorizado num ambiente e se torna exatamente isso, com ' +
      'um talento raro para se apresentar, convencer e vencer. Gosta de ser visto no lugar ' +
      'certo, com as pessoas certas, colecionando conquistas que os outros admiram. Não é ' +
      'fingimento consciente; você acredita na própria imagem enquanto a vende. O nó é que o ' +
      'prestígio nunca sacia: cada degrau alcançado logo vira o chão de onde se olha o próximo. ' +
      'E a ferida aparece nos momentos em que o aplauso cessa e você fica a sós com a pergunta de ' +
      'quem seria sem a plateia.',
  },
  '3-sexual': {
    titulo: 'Tipo 3 · Sexual: a imagem esculpida para ser desejada',
    texto:
      'Este é o 3 cuja vaidade se dirige ao encantamento de uma pessoa, ou de um par de olhos de ' +
      'cada vez. Em vez do troféu social, você busca ser irresistível, o parceiro ideal, a ' +
      'figura atraente que desperta desejo e admiração no outro. Investe em ser desejável, molda ' +
      'a própria imagem para caber no que a pessoa amada valoriza, e sente que existe quando é ' +
      'escolhido, querido, aprovado por ela. Pode se perder tanto em ser o que o outro quer que ' +
      'já não sabe o que você mesmo quer. A ferida é a intuição de que a imagem que seduz não é ' +
      'bem você, e o medo de que, se ela caísse, o desejo do outro cairia junto.',
  },

  // ----- Tipo 4 -----
  '4-autopreservacao': {
    titulo: 'Tipo 4 · Autopreservação: aguentar sem se queixar',
    texto:
      'Este é o 4 que sofre por dentro mas não faz alarde, o abnegado que morde a dor e segue, ' +
      'sustentando um esforço que os outros nem imaginam. Em vez de dramatizar a queixa, você a ' +
      'engole, e tira daí uma espécie de orgulho estoico: aguento o que ninguém aguentaria. É ' +
      'tenaz, sofrido, autoexigente, capaz de se privar e de trabalhar duro para provar, ' +
      'sobretudo a si mesmo, que dá conta. Costuma parecer alegre ou animado por fora, quase ' +
      'para compensar o que pesa por dentro. A ferida é a solidão de quem carrega muito calado, ' +
      'e a fantasia de que um dia, por tanto ter aguentado sem cobrar nada, alguém finalmente vai ' +
      'notar e retribuir o cuidado que você nunca pediu em voz alta.',
  },
  '4-social': {
    titulo: 'Tipo 4 · Social: sempre um pouco de fora',
    texto:
      'Este é o 4 que vive a inveja como comparação com o grupo, medindo-se o tempo todo com os ' +
      'outros e se achando, quase sempre, aquém. Onde os demais parecem pertencer com ' +
      'naturalidade, você se sente marginal, deslocado, um pouco de fora, e essa sensação de ' +
      'inadequação dói como uma vergonha surda. Pode cultivar uma identidade de diferente, de ' +
      'incompreendido, e ao mesmo tempo ansiar por ser aceito e reconhecido. Às vezes exibe o ' +
      'próprio sofrimento ou a própria sensibilidade como um jeito de ter um lugar. A ferida é a ' +
      'certeza antiga de não ser bom o bastante para pertencer, e o cansaço de estar sempre ' +
      'comparando o seu avesso com a fachada dos outros.',
  },
  '4-sexual': {
    titulo: 'Tipo 4 · Sexual: a inveja que vira competição',
    texto:
      'Este é o 4 mais intenso e exigente, cuja inveja não se contenta em lamentar: ela compete. ' +
      'Você quer ser o mais, o melhor, o mais especial, e sente uma raiva ardida quando outra ' +
      'pessoa ocupa o lugar que você desejava. É apaixonado, demandante, capaz de grandes ' +
      'arroubos e de grandes cobranças no amor, com uma intensidade que atrai e assusta. O ódio ' +
      'aqui não é frieza, é a inveja em brasa, uma forma de intensidade que faz você se sentir ' +
      'vivo. Você exige do outro uma dedicação à altura da sua, e se fere quando ela falta. Por ' +
      'baixo da competição mora o medo de que, se não for o preferido absoluto, você não seja ' +
      'nada, e essa carência disfarçada de exigência é a sua ferida mais funda.',
  },

  // ----- Tipo 5 -----
  '5-autopreservacao': {
    titulo: 'Tipo 5 · Autopreservação: o castelo de ponte levantada',
    texto:
      'Este é o 5 mais recolhido, aquele que precisa de um refúgio, um canto, quatro paredes onde ' +
      'ninguém entra sem convite. Você se organiza em torno de reduzir necessidades e guardar ' +
      'recursos: quanto menos precisa, mais livre se sente, e menos exposto ao risco de ' +
      'depender. Protege o próprio espaço e o próprio tempo com um zelo quase físico, e sente as ' +
      'demandas dos outros como uma invasão que suga o pouco que você tem para dar. Costuma ser ' +
      'prático na sua economia, discreto, autossuficiente. A ferida é que a muralha que garante ' +
      'sua paz também te deixa do lado de dentro, sozinho, aquecendo com pouca lenha um fogo que ' +
      'pede mais companhia do que você se permite admitir.',
  },
  '5-social': {
    titulo: 'Tipo 5 · Social: pertencer por saber',
    texto:
      'Este é o 5 que encontra um lugar no mundo através do conhecimento, dos ideais, do domínio ' +
      'de algo que poucos dominam. Você se liga às pessoas menos pelo calor do dia a dia e mais ' +
      'por interesses elevados, por um saber compartilhado, por pertencer a um círculo de quem ' +
      'entende. Há um certo orgulho discreto em ser o especialista, o que tem a referência rara, ' +
      'o que enxerga mais fundo, e isso pode virar uma superioridade silenciosa. Você troca ' +
      'intimidade por admiração, presença por competência. A ferida é a distância que o saber ' +
      'cria: você é reconhecido pelo que sabe, e continua sozinho com o que sente, sem que o ' +
      'pertencimento chegue de fato a te aquecer.',
  },
  '5-sexual': {
    titulo: 'Tipo 5 · Sexual: a busca pelo confidente absoluto',
    texto:
      'Este é o 5 mais romântico e paradoxal, aquele que, por baixo da aparente indiferença, ' +
      'procura uma pessoa só, um confidente absoluto com quem valha a pena baixar todas as ' +
      'guardas. Você guarda distância de quase todo mundo, mas sonha com aquela conexão total, ' +
      'intensa e secreta, em que finalmente poderia se entregar sem se sentir invadido. Idealiza ' +
      'esse encontro, e por isso quase ninguém passa no teste altíssimo que você impõe sem ' +
      'dizer. Quando se apega, é fundo e exclusivo, embora continue tendo dificuldade de mostrar ' +
      'isso. A ferida é o abismo entre o desejo enorme de fusão e o medo enorme de depender, que ' +
      'faz você buscar a alma gêmea e, ao mesmo tempo, sabotar a aproximação que tanto quer.',
  },

  // ----- Tipo 6 -----
  '6-autopreservacao': {
    titulo: 'Tipo 6 · Autopreservação: o afeto que constrói segurança',
    texto:
      'Este é o 6 mais caloroso e afável, aquele que lida com o medo se aproximando, criando ' +
      'vínculos, sendo querido. Você busca segurança menos no confronto e mais na aliança: se as ' +
      'pessoas gostam de você, se você é gentil e prestativo, então há menos chance de ser ' +
      'atacado ou abandonado. Costuma ser amigável, hesitante, avesso a criar atrito, e evita se ' +
      'posicionar de forma dura para não perder a proteção dos laços. Por baixo da doçura há uma ' +
      'insegurança que pede constante reasseguramento, uma dúvida sobre se você dá conta ' +
      'sozinho. A ferida é o medo de que, sem a aprovação e o amparo dos outros, você fique ' +
      'exposto num mundo que aprendeu a achar ameaçador.',
  },
  '6-social': {
    titulo: 'Tipo 6 · Social: a segurança das regras e do dever',
    texto:
      'Este é o 6 que encontra chão firme no sistema, na regra, na referência clara do que é ' +
      'certo. Você lida com a incerteza se ancorando numa autoridade, numa doutrina, num método, ' +
      'num dever bem definido, e cumpre com uma lealdade e uma precisão que os outros respeitam. ' +
      'Precisa saber onde pisa, detesta a ambiguidade, e se sente mais seguro quando há um ' +
      'enquadramento que diz o que fazer. Pode ser rígido, cumpridor, um pouco solene, e ' +
      'desconfia por igual de quem foge das regras. A ferida é que a mesma estrutura que te ' +
      'protege também te aprisiona: você terceiriza para o sistema a confiança que teme depositar ' +
      'em si mesmo, e vive vigiando se ainda está do lado certo.',
  },
  '6-sexual': {
    titulo: 'Tipo 6 · Sexual: partir para cima do que assusta',
    texto:
      'Este é o 6 contrafóbico, aquele que, em vez de recuar diante do medo, avança contra ele. ' +
      'A melhor defesa te parece o ataque: você se arma de força, intensidade e uma certa ' +
      'provocação, enfrenta o que assusta, desafia a autoridade, para não sentir a fragilidade ' +
      'que existe por baixo. Pode ser rebelde, impetuoso, às vezes confundido com um tipo mais ' +
      'agressivo, mas a raiz é o medo, não a raiva pela raiva. Busca segurança demonstrando, aos ' +
      'outros e a si, que não tem medo de ninguém. A ferida é o cansaço de nunca poder baixar a ' +
      'guarda, de transformar cada vulnerabilidade numa batalha, quando o que você mais queria, ' +
      'no fundo, era um lugar onde não precisasse provar a própria coragem o tempo todo.',
  },

  // ----- Tipo 7 -----
  '7-autopreservacao': {
    titulo: 'Tipo 7 · Autopreservação: a rede que garante o bom proveito',
    texto:
      'Este é o 7 mais prático e articulado, aquele que faz da vida uma boa rede de ' +
      'oportunidades, contatos e vantagens. Você tem um faro para o bom negócio, para a aliança ' +
      'que compensa, para juntar gente boa em torno de si e garantir que não vá faltar o prazer ' +
      'nem o conforto. É caloroso, hábil, sabe se cercar de pessoas úteis e agradáveis, e ' +
      'transforma o interesse próprio em algo simpático, quase familiar. A gula aqui é apetite ' +
      'por experiências e por segurança ao mesmo tempo: você quer aproveitar, mas com o chão ' +
      'garantido. A ferida está na inquietação por baixo da esperteza, o medo de ficar sem, que ' +
      'faz você acumular opções e movimento para não encarar o vazio quando tudo para.',
  },
  '7-social': {
    titulo: 'Tipo 7 · Social: adiar o próprio prazer por um ideal',
    texto:
      'Este é o 7 que, ao contrário da fama do tipo, se contém, aquele que sacrifica o próprio ' +
      'gozo em nome de uma causa, um ideal, uma imagem de pessoa boa e dedicada. Você quer ser ' +
      'visto como alguém que não é só aproveitador, então se doa a projetos maiores, adia o ' +
      'prazer, veste a camisa de algo nobre. A gula não some, ela se disfarça de virtude: o ' +
      'apetite fica na fantasia do futuro melhor que você ajuda a construir. É idealista, ' +
      'entusiasta das ideias, bom de mobilizar os outros em torno de um sonho. A ferida é a ' +
      'tensão entre o desejo que você reprime e a imagem que cultiva, e o cansaço de servir a um ' +
      'ideal para não ter que sentir a própria fome.',
  },
  '7-sexual': {
    titulo: 'Tipo 7 · Sexual: encantado com o que poderia ser',
    texto:
      'Este é o 7 mais sonhador e apaixonado, aquele que vê o mundo, e as pessoas, e o amor, ' +
      'através de um brilho de possibilidade que os torna mais lindos do que são. Você se ' +
      'entusiasma facilmente, se encanta, projeta no outro e nas situações uma promessa ' +
      'deslumbrante, e vive um pouco embriagado por essa visão idealizada. Tem um dom de ' +
      'contagiar, de fazer tudo parecer mágico, e uma dificuldade correspondente de aterrissar ' +
      'quando o encanto passa e a realidade, comum, aparece. A gula aqui é por experiência ' +
      'intensa e por fusão com um ideal ou uma pessoa idealizada. A ferida é a decepção que vem ' +
      'depois do encantamento, e a fuga para o próximo deslumbre, porque encarar o que é, sem a ' +
      'aura do que poderia ser, parece pobre demais.',
  },

  // ----- Tipo 8 -----
  '8-autopreservacao': {
    titulo: 'Tipo 8 · Autopreservação: o sobrevivente na fortaleza',
    texto:
      'Este é o 8 que quase nunca parece bravo, parece apenas indiferente, prático, direto ao ' +
      'ponto. Seu poder mora no concreto: o território, a comida, o tempo, o dinheiro são ' +
      'extensões da sua autonomia, e quem mexe nisso descobre rápido que não era para mexer. É o ' +
      'mais pé no chão dos três, um sobrevivente que constrói o próprio bunker e não gosta de ' +
      'dever nada a ninguém. Cuida dos seus do seu jeito, mas confunde cuidar com controlar o ' +
      'que está ao redor, e tem pouca paciência com quem parece frágil ou incapaz de se virar ' +
      'sozinho. Busca prazer e conforto com um apetite que não conhece limite, a ponto de nem ' +
      'sentir onde o corpo pede parada. Por baixo da casca de eficiência há uma criança que ' +
      'decidiu, faz muito tempo, que se não garantisse o próprio sustento, ninguém garantiria por ' +
      'ela.',
  },
  '8-social': {
    titulo: 'Tipo 8 · Social: o chefe que protege os seus',
    texto:
      'Este é o 8 que vira líder, protetor, referência, aquele que se sente chamado a defender os ' +
      'seus com uma mistura de carisma e vigilância. Você lê as relações de poder, fareja ' +
      'lealdades e traições, e se coloca como a autoridade que ninguém mais submete. Faz gestos ' +
      'grandes de proteção, abraça uma causa de justiça, mas espera lealdade absoluta em troca, e ' +
      'quando ela falta, a lembrança vira arma. A força vira responsabilidade, e a ' +
      'responsabilidade, às vezes, vira controle: você se convence de que sabe o que é melhor ' +
      'para todos, mesmo quando passa por cima da vontade deles. Por baixo do comando há um medo ' +
      'que você mal admite: o de virar irrelevante, de não ter valor para o grupo, de descobrir ' +
      'que, sem o posto, ninguém ficaria.',
  },
  '8-sexual': {
    titulo: 'Tipo 8 · Sexual: “preciso de você, mas estou de olho”',
    texto:
      'Este é o 8 mais intenso, o que joga toda a força visceral dentro de uma relação. Aqui o ' +
      'poder é erótico e emocional: você quer fusão total e, ao mesmo tempo, vigia. É o vaivém ' +
      'de “preciso de você, mas estou te observando”, a paixão usada como teste de lealdade. Pode ' +
      'se tornar possessivo, ciumento, sufocante, não porque não ame, mas porque entregar-se sem ' +
      'controle parece perigoso demais. Às vezes provoca, tensiona, empurra o outro até o limite ' +
      'só para ver se ele resiste, e, quando resiste, recompensa com um calor arrebatador. Por ' +
      'trás da intensidade mora o medo antigo de ser traído ou de ficar à mercê de alguém; e a ' +
      'exigência de exclusividade absoluta é, no fundo, a única prova de amor que você aprendeu a ' +
      'aceitar.',
  },

  // ----- Tipo 9 -----
  '9-autopreservacao': {
    titulo: 'Tipo 9 · Autopreservação: o apetite que preenche o vazio',
    texto:
      'Este é o 9 que preenche o buraco com o concreto: comida, conforto, rotina, a série de ' +
      'sempre, pequenos prazeres que dão a sensação de estar satisfeito. Não é só fome de comida, ' +
      'é fome de estímulos, de experiências mornas e objetos que distraem e fazem parecer que ' +
      'está tudo bem. Você tem aquele ar de pessoa tranquila e contente, mas é uma satisfação ' +
      'meio desconectada: o gorducho feliz é uma casca simpática que evita o contato com o que ' +
      'dói por dentro. É o subtipo que às vezes parece não estar ali, e, curiosamente, o mais ' +
      'teimoso dos três quando alguém tenta tirá-lo do lugar. A raiva aqui vaza mais que nos ' +
      'outros, na forma de uma obstinação silenciosa: você não briga, mas também não arreda o ' +
      'pé.',
  },
  '9-social': {
    titulo: 'Tipo 9 · Social: “se eu não participo, eu não existo”',
    texto:
      'Este é o 9 que parece o menos apagado dos três, porque se joga no grupo, nas tarefas, na ' +
      'causa. Você trabalha contra a própria inércia sendo incansável, jovial, sempre disposto a ' +
      'garantir o seu lugar entre as pessoas. Mas essa energia toda é também uma fuga elegante do ' +
      'vazio de dentro: você participa como um jeito de existir, mesmo quando as atividades não ' +
      'têm muito a ver com o que você de fato quer. Não busca aplauso nem mérito, busca ' +
      'pertencer, porque pertencer é a prova de que você está aqui. O lema silencioso é “se eu ' +
      'não participo, eu não sou”. E o bom humor constante, que faz todo mundo gostar de ter você ' +
      'por perto, é também a maneira mais educada de não pesar sobre ninguém, inclusive sobre ' +
      'você mesmo.',
  },
  '9-sexual': {
    titulo: 'Tipo 9 · Sexual: a fusão que apaga os contornos',
    texto:
      'Este é o 9 que se preenche virando um só com outra pessoa. Mais tímido e discreto que os ' +
      'outros dois, você passa despercebido, e é justamente na fusão com alguém que encontra a ' +
      'sensação de existir. Não é uma união entre dois diferentes; é uma simbiose, um ' +
      'dissolver-se: as vontades, as opiniões, os interesses, até as escolhas de vida passam a ' +
      'ser os do outro, quase sem você notar onde termina você e começa ele. Você aprende a ' +
      'sentir o que é esperado de você e a se moldar a isso, a ponto de viver sem, no fundo, ' +
      'existir. A ferida por baixo é a mesma dos outros nove: um vazio de si que a fusão promete ' +
      'preencher, e o caminho de volta é descobrir que existe um você aí dentro, com contornos ' +
      'próprios, esperando para ser habitado.',
  },
};

/** Rótulos legíveis para categorias. */
export const rotulos = {
  triade: {
    instintiva: 'Tríade instintiva (8/9/1)',
    emocional: 'Tríade emocional (2/3/4)',
    mental: 'Tríade mental (5/6/7)',
  },
  instinto: {
    autopreservacao: 'Autopreservação',
    social: 'Social',
    sexual: 'Sexual (um-para-um)',
  },
  confianca: {
    alto: 'Alta',
    medio: 'Média',
    baixo: 'Baixa',
  },
};
