# -*- coding: utf-8 -*-
"""Gera o banco de perguntas proposto (questions.json) no mesmo esquema do original,
com as secoes novas fase2_cruzada e fase4."""
import json, sys

TRIADE = {8: 'instintiva', 9: 'instintiva', 1: 'instintiva',
          2: 'emocional', 3: 'emocional', 4: 'emocional',
          5: 'mental', 6: 'mental', 7: 'mental'}
LETRAS = 'abcdefghijklmnop'
NULA = {"id": "z", "texto": "Nenhuma dessas se parece comigo.", "nula": True,
        "mapa": {"triade": None, "tipo": None, "instinto": None},
        "eixo": "emocao", "peso": 0, "desejavel": False}


def alt(i, texto, tipo=None, instinto=None, eixo='emocao', peso=1.0, desejavel=False, nota=None):
    a = {"id": LETRAS[i], "texto": texto,
         "mapa": {"triade": TRIADE.get(tipo) if tipo else None, "tipo": tipo, "instinto": instinto},
         "eixo": eixo, "peso": peso, "desejavel": desejavel}
    if nota:
        a["subtipo_alvo"] = nota
    return a


def item(id_, fase, cenario, alts, dominio='geral', eixo='emocao', peso=1.0, gemeo=None,
         indireto=False, desej=False, separa=None, nula=True, tipo_alvo=None, desejavel_tipo=None,
         opcional=False):
    """alts: lista de (tipo|instinto, texto[, nota_subtipo]). Todas as alternativas do item
    recebem o MESMO eixo e o MESMO peso (nenhum tipo leva vantagem estrutural)."""
    out = []
    for i, a in enumerate(alts):
        chave, texto = a[0], a[1]
        nota = a[2] if len(a) > 2 else None
        if isinstance(chave, int):
            out.append(alt(i, texto, tipo=chave, eixo=eixo, peso=peso,
                           desejavel=(desejavel_tipo == chave and nota in (None, 'p')), nota=nota))
        else:
            out.append(alt(i, texto, instinto=chave, eixo=eixo, peso=peso, nota=nota))
    if nula:
        out.append(dict(NULA))
    it = {"id": id_, "fase": fase, "dominio": dominio, "par_gemeo_id": gemeo,
          "indireto": indireto, "flag_desejabilidade_social": desej, "cenario": cenario,
          "alternativas": out}
    if separa is not None:
        it["separa"] = separa
    if tipo_alvo is not None:
        it["tipo_alvo"] = tipo_alvo
    if opcional:
        it["opcional"] = True
    return it

# ===========================================================================
# FASE 1: triagem. 9 alternativas por item, UMA por tipo, mesmo eixo e peso.
# O enunciado fixa o COMPORTAMENTO; as alternativas variam a MOTIVACAO.
# ===========================================================================
F1 = []
F1.append(item('f1_01', 1, 'Quando você enfrenta alguém de frente, o que costuma estar por baixo dessa reação?', [
    (8, 'Fui contrariado e reagi na hora. Não preciso pensar muito antes, e depois não fico me culpando.'),
    (9, 'Quase nunca chego a isso. Quando acontece, é porque aguentei demais e a paciência estourou de uma vez.'),
    (1, 'A certeza de que aquilo estava errado e de que alguém precisava corrigir.'),
    (2, 'Mágoa. Depois de tudo o que fiz por aquela pessoa, não aceito ser tratado com descaso.'),
    (3, 'Não posso sair daquela situação por baixo, parecendo fraco ou incompetente.'),
    (4, 'A sensação de estar sendo tratado como menos do que eu mereço. Dói antes de virar raiva.'),
    (5, 'Raramente enfrento. Quando faço, é porque estão invadindo o meu espaço ou exigindo demais de mim.'),
    (6, 'Uma tensão que eu prefiro enfrentar a sentir. Não posso deixar que percebam fraqueza, nem baixar a guarda.'),
    (7, 'Alguém está atrapalhando algo que eu quero ou tentando me prender. Resolvo rápido e volto ao que me interessa.'),
], eixo='paixao'))
F1.append(item('f1_02', 1, 'Quando você se afasta de alguém ou de uma situação, qual costuma ser o motivo real?', [
    (5, 'Preciso recuperar energia e espaço. Estar com gente por muito tempo me esgota.'),
    (9, 'Para não criar conflito. Prefiro sumir um pouco a ter que brigar ou tomar partido.'),
    (4, 'Sinto que não me compreendem ou que não pertenço ali, e fico com aquilo por dentro.'),
    (6, 'Algo me deixou desconfiado. Prefiro manter distância até entender se posso confiar.'),
    (1, 'Para não perder o controle e acabar dizendo algo de que eu me arrependa.'),
    (2, 'Senti que não me valorizaram. Me afasto esperando que percebam a minha falta.'),
    (3, 'Para me recompor longe dos olhos dos outros e voltar bem.'),
    (7, 'A situação ficou pesada ou chata demais. Vou atrás de algo mais leve e interessante.'),
    (8, 'Quem me decepciona ou me trai perde o acesso a mim. Corto e sigo.'),
], eixo='paixao'))
F1.append(item('f1_03', 1, 'Algo importante que você vinha construindo começa a dar errado. O que acontece primeiro dentro de você?', [
    (8, 'Raiva e impulso de agir. Vou para cima do problema, ou de quem o causou, na hora.'),
    (9, 'Uma espécie de desligamento. Digo a mim mesmo que não é tão grave e sigo no automático.'),
    (1, 'Uma cobrança dura: onde foi que eu, ou alguém, deixou de fazer o que devia?'),
    (2, 'Digo que está tudo bem e continuo disponível para os outros, mas por dentro espero que alguém perceba e cuide de mim sem eu pedir.'),
    (3, 'Penso em como isso vai me fazer parecer e já começo a planejar como virar o jogo.'),
    (4, 'Uma dor funda, como se aquilo confirmasse que comigo as coisas nunca dão tão certo quanto dão para os outros.'),
    (5, 'Recuo para pensar sozinho e entender o que aconteceu antes de gastar energia com qualquer coisa.'),
    (6, 'Um alarme: o que mais pode dar errado, em quem posso confiar e como me proteger ou me antecipar.'),
    (7, 'Procuro rápido o lado bom e um plano B. Não gosto de ficar parado no que dói.'),
], eixo='paixao'))
F1.append(item('f1_04', 1, 'O que você sente que precisa proteger acima de tudo, mesmo sem dizer?', [
    (8, 'A minha força e a minha liberdade. Não posso ficar nas mãos de ninguém.'),
    (9, 'A minha tranquilidade. Não quero que nada me tire do meu lugar de paz.'),
    (1, 'A minha integridade. Preciso estar do lado do que é certo.'),
    (2, 'O lugar especial que tenho na vida das pessoas importantes para mim.'),
    (3, 'A imagem de alguém capaz, que funciona e dá resultado.'),
    (4, 'Aquilo que tenho de mais verdadeiro, mesmo que ninguém entenda ou valorize.'),
    (5, 'O meu espaço, o meu tempo e a minha energia, que se esgotam fácil.'),
    (6, 'A minha segurança e a certeza de com quem posso contar.'),
    (7, 'A minha liberdade de escolher e de ter coisas boas pela frente.'),
], eixo='fixacao', peso=1.2))
F1.append(item('f1_05', 1, 'Sendo muito honesto, qual destas sensações mais acompanha você no dia a dia?', [
    (8, 'Impaciência. Quero as coisas com intensidade, e quero agora.'),
    (9, 'Uma calma meio adormecida. Muitas vezes nem sei direito o que eu quero.'),
    (1, 'Uma tensão interna, um incômodo com o que não está como deveria.'),
    (2, 'Vontade de estar perto das pessoas e de ser importante para elas.'),
    (3, 'Pressa. Sempre há algo para fazer, alcançar ou mostrar.'),
    (4, 'A sensação de que me falta algo que os outros parecem ter. Às vezes vira tristeza, às vezes vira garra ou revolta.'),
    (5, 'Um certo cansaço do mundo e vontade de ter mais tempo só meu.'),
    (6, 'Um alerta de fundo. Mesmo quando pareço seguro, estou atento a riscos e a quem pode falhar comigo.'),
    (7, 'Uma inquietação boa. A minha cabeça está sempre em planos e possibilidades.'),
]))
F1.append(item('f1_06', 1, 'Quando alguém tenta mandar em você ou controlar o que você faz, o que pesa mais por dentro?', [
    (8, 'Simplesmente não aceito. Ninguém manda em mim, e deixo isso claro.'),
    (9, 'Por fora costumo concordar, mas vou fazendo do meu jeito e no meu ritmo, sem alarde.'),
    (1, 'Depende: se a pessoa estiver certa, aceito. Se estiver errada, não consigo engolir.'),
    (2, 'Fico ofendido por não reconhecerem o quanto eu já sei e faço.'),
    (3, 'Aceito se isso me ajudar a chegar onde quero. Se não, dou um jeito de contornar.'),
    (4, 'Sinto que não enxergam quem eu sou, e isso me machuca ou me revolta.'),
    (5, 'Me fecho e passo a entregar só o mínimo. A minha vida interna ninguém controla.'),
    (6, 'Fico dividido: uma parte quer obedecer para ficar seguro, outra quer desafiar para provar que não tenho medo.'),
    (7, 'Concordo na frente e sigo fazendo o que quero por trás, sem drama.'),
], eixo='fixacao', peso=1.2))
F1.append(item('f1_07', 1, 'Qual destas frases mais parece uma regra interna sua, mesmo que você nunca a tenha dito?', [
    (8, '“A vida é para ser vivida com intensidade, e eu vou atrás do que é meu.”'),
    (9, '“Não vale a pena se desgastar. No fim, tudo se ajeita.”'),
    (1, '“Se é para fazer, tem que ser do jeito certo.”'),
    (2, '“Se precisarem de mim, vão me amar.”'),
    (3, '“Eu sou o que eu consigo realizar.”'),
    (4, '“Nunca é suficiente. Sempre falta alguma coisa, em mim ou na minha vida.”'),
    (5, '“Quanto menos eu precisar dos outros, melhor.”'),
    (6, '“Não posso baixar a guarda. Nunca se sabe em quem dá para confiar.”'),
    (7, '“A vida é curta demais para ficar no que é pesado.”'),
], eixo='fixacao', peso=1.2))
F1.append(item('f1_08', 1, 'Em qual destas situações você se sentiria mais exposto ou ameaçado?', [
    (8, 'Ficar sem poder de reação, à mercê da vontade de outra pessoa.'),
    (9, 'Ser pressionado a tomar partido num conflito sério.'),
    (1, 'Ser pego fazendo algo errado ou malfeito.'),
    (2, 'Mostrar que eu preciso de alguém e não ser correspondido.'),
    (3, 'Fracassar publicamente e ver a minha imagem desmoronar.'),
    (4, 'Ser rejeitado justamente naquilo que sinto que sou de verdade.'),
    (5, 'Ser invadido, sem ter como me retirar, com pessoas exigindo de mim o tempo todo.'),
    (6, 'Confiar em alguém e ser traído, ou ficar sem apoio na hora que importa.'),
    (7, 'Ficar preso numa situação dolorosa ou limitada, sem saída.'),
], eixo='fixacao', peso=1.2))
F1.append(item('f1_09', 1, 'Em uma relação próxima, o que seria mais difícil de suportar com o tempo?', [
    (8, 'Ter que me conter o tempo todo e ceder à vontade do outro.'),
    (9, 'Brigas constantes, sem paz em casa.'),
    (1, 'Conviver com alguém que não se esforça para fazer as coisas direito.'),
    (2, 'Sentir que não faço falta e que a pessoa não precisa de mim.'),
    (3, 'Sentir que a pessoa não admira quem eu sou e o que eu faço.'),
    (4, 'Não ser compreendido de verdade, ou sentir que o outro tem com alguém uma ligação que não tem comigo.'),
    (5, 'Ter o meu espaço invadido e ser cobrado por mais presença do que consigo dar.'),
    (6, 'Não saber se posso contar com a pessoa e sentir que ela pode me faltar.'),
    (7, 'Uma rotina previsível, sem novidade e sem planos.'),
], dominio='romance'))
F1.append(item('f1_10', 1, 'Quando algo dá errado e você volta a pensar no assunto depois, o que acontece?', [
    (1, 'Me cobro com dureza: eu deveria ter feito melhor.'),
    (9, 'Prefiro nem voltar ao assunto. Remoer tira a minha paz.'),
    (3, 'Penso no impacto na minha imagem e em como me recuperar.'),
    (6, 'Repasso o que deixei de prever e fico tentando entender em quem ou em que eu errei ao confiar.'),
    (7, 'Viro a página rápido e foco no que ainda vem de bom.'),
    (8, 'Não fico remoendo. Se alguém me prejudicou, a conta fica guardada.'),
    (2, 'Fico pensando se as pessoas ainda gostam de mim e se reconhecem o quanto me dediquei.'),
    (4, 'Revivo a cena por dentro, e ela reforça a sensação de que comigo é sempre mais difícil, mesmo que por fora eu siga em frente.'),
    (5, 'Analiso tudo sozinho, com distância, até entender a lógica do que aconteceu.'),
], eixo='fixacao', peso=1.2))
F1.append(item('f1_11', 1, 'Um amigo procura você para desabafar sobre um problema pessoal. Qual é o seu impulso real?', [
    (2, 'Acolher e cuidar. Gosto de ser a pessoa a quem ele recorre.'),
    (8, 'Resolver na prática e, se for o caso, enfrentar quem o prejudicou.'),
    (5, 'Escuto, mas com certa distância. Me cansa ser absorvido pelas emoções dos outros.'),
    (4, 'Me identifico com a dor dele. Sei bem o que é sentir isso.'),
    (6, 'Penso nos riscos e no que ele deveria fazer para se proteger daqui para frente.'),
    (1, 'Ajudar a ver o que ele pode fazer de certo a partir de agora.'),
    (3, 'Dar uma solução eficiente e ajudar a pessoa a se reerguer logo.'),
    (7, 'Animar, mostrar o lado bom e tirar ele um pouco daquele peso.'),
    (9, 'Escutar com paciência, sem julgar, pelo tempo que ele precisar.'),
], dominio='amizade', desej=True, desejavel_tipo=2))
F1.append(item('f1_12', 1, 'O que faz você sentir que a sua vida está em paz e em ordem?', [
    (9, 'Ter harmonia ao redor, sem nada me puxando para lados diferentes.'),
    (8, 'Estar no comando da minha vida, com força e intensidade.'),
    (2, 'Estar cercado de pessoas que gostam de mim e contam comigo.'),
    (3, 'Estar avançando e vendo o resultado do meu esforço.'),
    (5, 'Ter um tempo só meu, sem cobranças, para pensar e recuperar energia.'),
    (1, 'Sentir que fiz o que devia e que as coisas estão no lugar certo.'),
    (4, 'Sentir que vivo algo verdadeiro e significativo, e não uma vida qualquer.'),
    (6, 'Saber com quem posso contar e ter o futuro minimamente garantido.'),
    (7, 'Ter várias coisas boas acontecendo e outras tantas pela frente.'),
]))
F1.append(item('f1_13', 1, 'Todo mundo tem algum comportamento alheio que acha difícil de aguentar. Qual destes mais irrita você?', [
    (1, 'Gente relapsa, que faz as coisas de qualquer jeito.'),
    (8, 'Gente que se faz de coitada ou que não fala as coisas na cara.'),
    (9, 'Gente que cria tensão e briga por qualquer coisa.'),
    (2, 'Gente ingrata, que recebe muito e nem percebe.'),
    (3, 'Gente lenta e ineficiente, que atrasa os resultados.'),
    (4, 'Gente superficial, que finge sentimentos que não tem.'),
    (5, 'Gente invasiva, que exige atenção e intimidade o tempo todo.'),
    (6, 'Gente desleal, ou que usa uma posição de poder para abusar dos outros.'),
    (7, 'Gente pessimista e pesada, que derruba o clima.'),
], eixo='fixacao', peso=1.2, indireto=True))
F1.append(item('f1_14', 1, 'Quando você pensa na sua infância, qual destas sensações parece mais familiar?', [
    (8, 'Aprendi cedo a me defender sozinho. Ser ingênuo ou frágil era perigoso.'),
    (9, 'Ninguém percebia muito o que eu queria, então me adaptei e procurei não dar trabalho.'),
    (1, 'Havia muita exigência. Eu precisava ser correto e responsável antes do tempo.'),
    (2, 'Eu era querido por ajudar, agradar ou alegrar os adultos.'),
    (3, 'Eu era valorizado pelo que conseguia fazer e mostrar.'),
    (4, 'Eu sentia que os outros recebiam algo, como atenção, carinho ou reconhecimento, que eu não recebia.'),
    (5, 'Eu me sentia invadido ou esquecido e me refugiava no meu próprio mundo.'),
    (6, 'Havia um clima de insegurança. Eu vivia atento às reações dos adultos, com medo de punição, e às vezes enfrentava para não mostrar medo.'),
    (7, 'Quando algo doía, eu logo encontrava um jeito de me distrair e me divertir.'),
], dominio='familia'))

F1_DES = [
    item('f1d_ie', 1, 'Quando você fica com raiva de alguém, o que costuma vir antes?', [
        ('I', 'Um incômodo no corpo, como tensão, calor ou peso, antes de eu pensar em como estou sendo visto. Às vezes solto, às vezes engulo.'),
        ('E', 'Uma dor ligada a como fui visto: me senti desvalorizado, rejeitado ou diminuído.'),
    ], eixo='fixacao', peso=1.3, separa=['instintiva', 'emocional']),
    item('f1d_im', 1, 'Diante de uma incerteza real, o que acontece dentro de você?', [
        ('I', 'Sigo o impulso ou o meu jeito de sempre. A incerteza não ocupa muito a minha cabeça.'),
        ('M', 'A cabeça acelera: analiso, antecipo cenários, e mesmo quando ajo rápido é para me livrar da tensão de não saber.'),
    ], eixo='fixacao', peso=1.3, separa=['instintiva', 'mental']),
    item('f1d_em', 1, 'Quando você sofre, com o que esse sofrimento mais se parece?', [
        ('E', 'Uma ferida no meu valor, ligada a ser ou não amado, visto e reconhecido.'),
        ('M', 'Uma inquietação com a falta de garantias, de espaço ou de saídas.'),
    ], eixo='fixacao', peso=1.3, separa=['emocional', 'mental']),
]
# desempate de triade mapeia so a triade
_TRI = {'I': 'instintiva', 'E': 'emocional', 'M': 'mental'}
for it, pares in zip(F1_DES, [['I', 'E'], ['I', 'M'], ['E', 'M']]):
    for a, k in zip([x for x in it['alternativas'] if not x.get('nula')], pares):
        a['mapa'] = {"triade": _TRI[k], "tipo": None, "instinto": None}

# ===========================================================================
# FASE 2 por triade: 2 alternativas por tipo (expressao prototipica + expressao
# de outro subtipo, em especial o contratipo), mesmo eixo e peso.
# ===========================================================================

def f2(id_, cen, pares, **kw):
    """pares: lista de (tipo, texto_prototipico, texto_outro_subtipo)"""
    alts = []
    for t, p, c in pares:
        alts.append((t, p, 'p'))
        alts.append((t, c, 'c'))
    return item(id_, 2, cen, alts, **kw)

FIX = dict(eixo='fixacao', peso=1.5)
EMO = dict(eixo='emocao', peso=1.0)
PAI = dict(eixo='paixao', peso=1.0)

INST = [
    f2('f2i_01', 'Alguém passa dos seus limites repetidas vezes. O que costuma acontecer?', [
        (8, 'Você confronta a pessoa na hora e deixa claro que não vai aceitar aquilo.',
            'Você avisa uma vez só. Na segunda, a pessoa perde o acesso a você e sente o peso disso.'),
        (9, 'Você evita o confronto, mas acumula uma irritação que acaba escapando mais tarde, quase sem querer.',
            'Você resmunga, fica teimoso e emburrado, mas não chega a ter a conversa de verdade.'),
        (1, 'Você pensa em qual seria a forma certa e justa de lidar com aquilo e só age quando tem certeza do que é correto.',
            'Você corrige a pessoa com firmeza e indignação, porque aquilo é inaceitável e alguém precisa dizer.'),
    ], **PAI),
    f2('f2i_02', 'Quando você fica irritado com alguém, qual destes pensamentos é mais parecido com o seu?', [
        (8, '“Fizeram isso comigo, então é justo que sintam as consequências.”', '“Mexeu com os meus, mexeu comigo.”'),
        (9, '“Não vale o desgaste. É melhor deixar para lá do que criar um problema entre nós.”', '“Provavelmente não foi por mal. Logo passa.”'),
        (1, '“Eu nunca faria isso. Existe um jeito certo de agir, e essa pessoa não seguiu.”', '“Isso está errado, e eu não vou fingir que está tudo bem.”'),
    ], **FIX),
    f2('f2i_03', 'Um projeto seu esbarra em uma regra ou em uma autoridade que você considera injusta. Como você reage?', [
        (8, 'Você passa por cima da regra e arca com as consequências. Se ela atrapalha o que você quer, não tem poder sobre você.',
            'Você enfrenta a autoridade diretamente, sobretudo se ela estiver prejudicando alguém do seu lado.'),
        (9, 'Você se incomoda, mas acaba se acomodando para não criar atrito. Manter a paz pesa mais.',
            'Você não discute, mas também não cumpre direito. Vai fazendo do seu jeito, devagar, até a regra ser esquecida.'),
        (1, 'Você contesta pelos canais adequados, com base nos seus princípios, e luta por uma forma mais justa.',
            'Você denuncia a injustiça com veemência, porque se sente no dever de corrigir aquilo.'),
    ], dominio='trabalho', **FIX),
    f2('f2i_04', 'Como é a sua relação com a própria raiva?', [
        (8, 'Ela vem e passa rápido. Você põe para fora, resolve na hora e não fica remoendo.',
            'Ela é combustível. Você gosta de sentir a própria força e não vê motivo para escondê-la.'),
        (9, 'Ela quase não aparece. Muitas vezes você nem percebe que estava com raiva.',
            'Ela fica guardada por muito tempo e, quando sai, sai de repente, teimosa ou explosiva, e depois some.'),
        (1, 'Ela vira tensão e cobrança, e você não se permite colocá-la para fora.',
            'Ela aparece em ironias e críticas afiadas, ou numa indignação aberta quando você tem certeza de que tem razão.'),
    ], **PAI),
    f2('f2i_05', 'Qual destas frases poderia ser um lema seu, mesmo que você nunca a tenha dito em voz alta?', [
        (8, '“A vida é uma disputa. Quem não vai atrás do que é seu fica sem nada.”', '“Quem está comigo está protegido. Quem está contra, que se cuide.”'),
        (9, '“Não vale a pena bater de frente. É melhor não mexer no que está quieto.”', '“Cada um na sua. Eu não me meto, e não gosto que se metam comigo.”'),
        (1, '“Existe um jeito certo de fazer as coisas, e cabe a mim chegar até ele.”', '“Se ninguém corrige o que está errado, eu corrijo.”'),
    ], **FIX),
    f2('f2i_06', 'Em uma discussão familiar acalorada, o que você costuma fazer?', [
        (8, 'Aumentar o tom e tomar a frente da discussão, porque quem é mais firme conduz.',
            'Defender com força quem está sendo atacado, mesmo que isso piore o clima.'),
        (9, 'Recuar, concordar com todos e me desligar da discussão para o clima não piorar.',
            'Tentar mediar, acalmar os ânimos e reconciliar as pessoas.'),
        (1, 'Manter o controle e apontar, com certa frieza, quem tem razão e quem está errado.',
            'Me exaltar para defender o que é certo, mesmo que depois me culpe por ter perdido a compostura.'),
    ], dominio='familia', gemeo='gemeo_conflito_intensidade', **EMO),
    f2('f2i_12', 'Em um conflito tenso no trabalho, com outras pessoas observando, o que você costuma fazer?', [
        (8, 'Tomar a frente e enfrentar diretamente, impondo a minha posição diante de todos.',
            'Proteger a minha equipe e deixar claro que quem mexer com ela vai ter que lidar comigo.'),
        (9, 'Amenizar, ceder e buscar um consenso para desfazer o atrito, sem me posicionar muito.',
            'Ficar quieto na hora e seguir fazendo do meu jeito depois, sem abrir mão de verdade.'),
        (1, 'Manter a compostura e defender, com rigor, o procedimento correto.',
            'Segurar a irritação na hora e só deixá-la aparecer depois, em particular.'),
    ], dominio='trabalho', gemeo='gemeo_conflito_intensidade', **EMO),
    f2('f2i_07', 'Sendo honesto consigo mesmo, o que mais desagrada você na sua forma de ser?', [
        (8, 'Às vezes sou duro ou exagerado e magoo as pessoas antes de perceber.',
            'Tenho dificuldade de mostrar fragilidade, mesmo para quem eu amo.'),
        (9, 'Eu me acomodo, adio as coisas e deixo de lado o que eu quero para não incomodar ninguém.',
            'Eu me perco no que os outros querem e acabo me esquecendo de mim.'),
        (1, 'Sou crítico e exigente demais, comigo e com os outros, e raramente acho algo bom o suficiente.',
            'Às vezes me exalto e fico intolerante quando as pessoas não fazem o que é certo.'),
    ], desej=True, desejavel_tipo=1, eixo='fixacao', peso=1.3),
    f2('f2i_13', 'Depois de tratar alguém mal, o que você costuma sentir?', [
        (8, 'Viro a página rápido. Não fico me culpando por isso.',
            'Se a pessoa mereceu, não sinto muita coisa. Foi ela quem provocou.'),
        (9, 'Fico incomodado por ter criado um mal-estar e quero que a paz volte logo.',
            'Faço de conta que não aconteceu e sigo como se nada fosse.'),
        (1, 'Sinto uma culpa pesada, porque deveria ter agido melhor.',
            'Digo a mim mesmo que eu tinha razão, mas por dentro me cobro por ter perdido o controle.'),
    ], **FIX),
    f2('f2i_08', 'Quando você se lembra de uma injustiça que sofreu no passado, o que sente?', [
        (8, 'Uma conta a acertar. De algum modo, você quer dar o troco.',
            'Uma lição: aquilo te ensinou a nunca mais ficar vulnerável daquele jeito.'),
        (9, 'Certa indiferença. Já faz tempo, e você prefere não mexer nisso.',
            'Resignação. Você diz a si mesmo que, no fim das contas, não foi tão grave assim.'),
        (1, 'Indignação. Aquilo foi errado, e você precisa que isso seja reconhecido.',
            'Um ressentimento silencioso que você nunca expressou, porque não seria correto.'),
    ], **FIX),
    f2('f2i_09', 'Como as pessoas próximas costumam descrever você?', [
        (8, 'Intenso e protetor, alguém bom de ter por perto nas horas difíceis.',
            'Direto e sem filtro, alguém que não aceita ser desrespeitado.'),
        (9, 'Tranquilo e de fácil convivência, sem grandes exigências.',
            'Teimoso, do tipo que concorda, mas faz do próprio jeito.'),
        (1, 'Confiável e correto, alguém que faz as coisas direito.',
            'Exigente e intenso, alguém que briga pelo que acredita ser o certo.'),
    ], dominio='amizade', **EMO),
    f2('f2i_10', 'Quando algo mexe muito com você, qual costuma ser a sua tendência?', [
        (8, 'Reagir com ainda mais intensidade, agir e causar impacto.',
            'Buscar mais estímulo, como sair, comer, beber, trabalhar ou brigar mais, porque o excesso me faz sentir vivo.'),
        (9, 'Amortecer, buscar conforto e distração e diminuir a intensidade até quase não sentir.',
            'Manter a rotina de sempre, como se nada tivesse acontecido.'),
        (1, 'Conter o impulso e transformá-lo em algo produtivo e correto.',
            'Canalizar aquilo para uma causa ou para corrigir algo que está errado.'),
    ], **PAI),
    f2('f2i_11', 'Nos relacionamentos amorosos, qual costuma ser o seu ponto cego?', [
        (8, 'Confundir controle com cuidado. Para você, proteger e mandar parecem a mesma coisa.',
            'Querer a pessoa inteira para mim e ter dificuldade de me entregar de verdade.'),
        (9, 'Adaptar-me tanto à vontade do outro a ponto de perder de vista o que eu quero.',
            'Evitar as conversas difíceis e deixar as coisas se arrastarem para não brigar.'),
        (1, 'Querer melhorar o outro e transformar a relação em um projeto de aperfeiçoamento.',
            'Cobrar do outro, com intensidade, uma conduta à altura do que eu acho certo.'),
    ], dominio='romance', **FIX),
    f2('f2i_14', 'Qual é a sua relação com prazer e excesso?', [
        (8, 'Gosto de viver no máximo. Limite é para quem não aguenta.',
            'Quero o que é bom, e quero já. Esperar me irrita.'),
        (9, 'Me acomodo em pequenos confortos, como comer, ver séries ou dormir, que me anestesiam sem eu perceber.',
            'Deixo para depois o que eu mesmo quero, mas não abro mão da minha rotina confortável.'),
        (1, 'Me controlo. Prazer só depois de cumprir o dever, e às vezes nem assim.',
            'Sinto que prazer demais é meio errado e fico desconfortável quando exagero.'),
    ], **PAI),
]

EMOC = [
    f2('f2e_01', 'Quando você quer se sentir valioso, o que costuma buscar?', [
        (2, 'Ser necessário para alguém, a ponto de a pessoa não conseguir abrir mão de mim.',
            'Ser tratado como alguém especial e mimado por quem gosta de mim.'),
        (3, 'Conquistar coisas, apresentar resultados e me sair bem no que os outros valorizam.',
            'Ser a pessoa eficiente e confiável que resolve tudo, sem precisar me exibir.'),
        (4, 'Ser fiel ao que me diferencia e não me confundir com a maioria.',
            'Aguentar o que for preciso e dar conta sozinho, para provar que mereço ter valor.'),
    ], **FIX),
    f2('f2e_02', 'Qual destas frases doeria mais ouvir de alguém importante para você?', [
        (2, '“Eu não preciso de você.”', '“Você não é tão importante para mim quanto pensa.”'),
        (3, '“Você fracassou e decepcionou todo mundo.”', '“Não dá para contar com você.”'),
        (4, '“Você é comum, igual a qualquer um.”', '“Eu prefiro outra pessoa a você.”'),
    ], **EMO),
    f2('f2e_03', 'O que você costuma fazer com as suas emoções mais difíceis?', [
        (2, 'Deixo as minhas de lado e cuido das emoções dos outros. As minhas necessidades quase não aparecem.',
            'Faço charme ou birra para que alguém perceba e cuide de mim, sem eu precisar pedir.'),
        (3, 'Deixo para depois. Não posso permitir que atrapalhem o que preciso entregar.',
            'Mantenho tudo sob controle e sigo funcionando, como se nada estivesse acontecendo.'),
        (4, 'Eu me aprofundo nelas, às vezes demais, porque sinto que dizem muito sobre quem eu sou.',
            'Engulo e aguento firme. Reclamar seria fraqueza, e eu dou conta sozinho.'),
    ], **FIX),
    f2('f2e_04', 'Qual destas imagens você mais faz questão de passar?', [
        (2, 'A de alguém generoso e caloroso, de quem as pessoas gostam de se aproximar.',
            'A de alguém encantador, difícil de esquecer.'),
        (3, 'A de alguém bem-sucedido e competente no que faz.',
            'A de alguém responsável e sem vaidade, que simplesmente resolve.'),
        (4, 'A de alguém profundo e sensível, que não é raso como a maioria.',
            'A de alguém forte e digno, que aguenta o que vier sem se queixar.'),
    ], **EMO),
    f2('f2e_05', 'Quando você não corresponde ao que esperavam, o que sente primeiro?', [
        (2, 'Medo de que deixem de gostar de você e de que você deixe de fazer falta.',
            'Indignação: depois de tudo o que você faz, ainda cobram mais?'),
        (3, 'Urgência em recuperar a imagem e mostrar que ainda dá conta.',
            'Vontade de trabalhar o dobro, em silêncio, para que ninguém possa dizer nada.'),
        (4, 'Uma confirmação amarga de que você nunca foi bom o bastante.',
            'Revolta: sente que foi julgado injustamente e que ninguém reconhece o que você passou.'),
    ], dominio='trabalho', **EMO),
    f2('f2e_06', 'Qual destas frases você teria menos vergonha de assinar em público?', [
        (2, '“Eu me realizo cuidando dos outros.”', '“Eu mereço ser bem tratado, porque dou muito de mim.”'),
        (3, '“Eu me realizo vencendo e sendo reconhecido.”', '“Eu me realizo sendo útil e fazendo tudo bem feito.”'),
        (4, '“Eu me realizo sendo fiel à minha diferença, mesmo que doa.”', '“Eu me realizo superando o que a vida me negou.”'),
    ], desej=True, desejavel_tipo=2, eixo='fixacao', peso=1.3),
    f2('f2e_07', 'Ao observar outras pessoas, o que mais mexe com você?', [
        (2, 'Ver alguém recebendo cuidado e apoio de um jeito que você também gostaria de receber, mas não pede.',
            'Ver alguém ocupando um lugar especial na vida de quem você quer conquistar.'),
        (3, 'Ver alguém conquistando o reconhecimento e o sucesso que você busca.',
            'Ver alguém menos competente sendo mais valorizado do que você.'),
        (4, 'Ver alguém que parece inteiro e em paz consigo, algo que você sente que sempre lhe faltou.',
            'Ver alguém recebendo com facilidade aquilo pelo qual você teve que lutar muito.'),
    ], indireto=True, **FIX),
    f2('f2e_12', 'O que faz você se sentir realmente querido por alguém?', [
        (2, 'Perceber que faço falta, que a pessoa precisa de mim e me procura.',
            'Sentir que sou a pessoa preferida, acima de todas as outras.'),
        (3, 'Ser admirado, sentir que a pessoa se orgulha de estar comigo.',
            'Ver que a pessoa reconhece tudo o que eu faço e o quanto sou confiável.'),
        (4, 'Ser escolhido pelo que tenho de único e compreendido como ninguém mais me compreende.',
            'Ser cuidado sem precisar pedir, algo que quase nunca aconteceu comigo.'),
    ], dominio='romance', **FIX),
    f2('f2e_08', 'Sendo sincero, qual é a sua maior necessidade no amor?', [
        (2, 'Ser insubstituível, o grande amor sem o qual a outra pessoa não ficaria bem.',
            'Ser paparicado e protegido, como alguém precioso.'),
        (3, 'Ser admirado e formar um casal que os outros vejam com aprovação.',
            'Ser o parceiro ideal, atraente e à altura do que o outro deseja.'),
        (4, 'Ser compreendido no que tenho de mais profundo e único.',
            'Viver uma intensidade que confirme que a relação é rara, e não perder esse lugar para ninguém.'),
    ], dominio='romance', **EMO),
    f2('f2e_09', 'Nos relacionamentos próximos, qual costuma ser o seu ponto cego?', [
        (2, 'Dar muito e esperar, em silêncio, ser retribuído na mesma medida, e ficar magoado quando isso não acontece.',
            'Seduzir e conquistar, e depois cobrar do outro uma dedicação total.'),
        (3, 'Sacrificar a intimidade real pela imagem do relacionamento perfeito.',
            'Virar o que o outro deseja, a ponto de não saber mais o que eu mesmo sinto.'),
        (4, 'Desvalorizar o que está perto e disponível e sempre desejar o que falta.',
            'Transformar a relação numa disputa, oscilando entre amor e raiva.'),
    ], dominio='romance', **FIX),
    f2('f2e_10', 'Quando você está sozinho, qual sentimento costuma estar presente?', [
        (2, 'Uma agitação carinhosa, sempre voltada para alguém ou para algum vínculo.',
            'A sensação de que ninguém lembrou de mim, mesmo depois de tudo o que eu faço.'),
        (3, 'Uma inquietação produtiva, pensando em tudo o que ainda falta fazer e conquistar.',
            'Um vazio que eu preencho arrumando, resolvendo e planejando.'),
        (4, 'Uma melancolia constante, uma saudade de algo que você nem sabe nomear.',
            'O cansaço de quem carrega muita coisa sozinho, mas segue em frente.'),
    ], **EMO),
    f2('f2e_11', 'Qual destes elogios mais emocionaria você?', [
        (2, '“Não sei o que seria de mim sem você.”', '“Você é a pessoa mais encantadora que eu conheço.”'),
        (3, '“Você é impressionante no que faz.”', '“Com você, tudo funciona.”'),
        (4, '“Nunca conheci ninguém como você.”', '“Admiro a sua força por ter passado por tudo o que passou.”'),
    ], **FIX),
    f2('f2e_13', 'Quando alguém próximo conquista algo que você também queria, o que acontece por dentro?', [
        (2, 'Fico feliz por fora e, por dentro, torço para que a pessoa continue precisando de mim.',
            'Sinto que eu também merecia aquilo, e espero que alguém perceba.'),
        (3, 'Isso me motiva a acelerar e mostrar que também consigo.',
            'Minimizo e sigo focado no meu trabalho, sem deixar transparecer nada.'),
        (4, 'Dói. Aquilo reforça a sensação de que, para os outros, as coisas são mais fáceis.',
            'Vira combustível para eu me esforçar muito mais, ou vontade de diminuir o valor daquilo.'),
    ], **PAI),
]

MENT = [
    f2('f2m_01', 'Diante de uma insegurança que não passa, o que você costuma fazer?', [
        (5, 'Fico recolhido, preciso de menos e poupo energia. Sozinho, eu me protejo melhor.',
            'Guardo para mim. Só com aquela pessoa rara em quem confio totalmente eu me abro.'),
        (6, 'Procuro uma referência confiável e busco garantias, mas continuo em dúvida mesmo assim.',
            'Enfrento de frente o que me ameaça, até para provar a mim mesmo que não me intimida.'),
        (7, 'Mantenho várias opções abertas e me concentro no que parece mais leve e promissor.',
            'Me ocupo ajudando os outros ou uma causa, e deixo a minha própria insegurança para depois.'),
    ], **FIX),
    f2('f2m_02', 'O que mais cansa você em um relacionamento ou em um compromisso?', [
        (5, 'Sentir que o meu espaço e a minha energia estão sendo consumidos, a ponto de precisar me afastar.',
            'Descobrir que a pessoa não é tão confiável e transparente quanto eu imaginava.'),
        (6, 'Não saber se posso mesmo contar com a outra pessoa e ter que pôr a confiança à prova o tempo todo.',
            'Sentir que estão tentando me controlar ou me deixar numa posição fraca.'),
        (7, 'A sensação de estar preso, sem liberdade, vendo as outras possibilidades se fecharem.',
            'Perceber que estou me doando muito, sem ninguém notar, e continuar sorrindo.'),
    ], **EMO),
    f2('f2m_03', 'Qual destas frases descreve melhor a sua relação com os próprios desejos?', [
        (5, 'Prefiro querer pouco. Assim não fico dependente nem à mercê de ninguém.',
            'Os meus desejos são intensos, mas ficam guardados. Poucos sabem o que eu realmente quero.'),
        (6, 'Desconfio dos meus próprios impulsos. Antes de ir em frente, pergunto a mim mesmo se é seguro.',
            'Às vezes vou com tudo, justamente para não deixar a dúvida me paralisar.'),
        (7, 'Quero experimentar tudo. Adiar o prazer me parece desperdício.',
            'Seguro os meus desejos em nome de algo maior, mas sinto que deveria estar aproveitando mais.'),
    ], **FIX),
    f2('f2m_04', 'Como costuma ser a sua relação com quem tem autoridade sobre você?', [
        (5, 'Mantenho distância, faço o necessário e preservo o meu espaço.',
            'Respeito quem realmente sabe. O resto, ignoro em silêncio.'),
        (6, 'Oscilo entre confiar e desconfiar, entre obedecer e me rebelar.',
            'Testo e desafio. Se a autoridade não for coerente, eu enfrento.'),
        (7, 'Não levo essa pessoa muito a sério. Uso o meu charme e continuo fazendo o que quero.',
            'Sou prestativo e agradável, mas por dentro não aceito que ninguém esteja acima de mim.'),
    ], dominio='trabalho', **EMO),
    f2('f2m_05', 'Qual destas frases poderia ser um lema seu, mesmo que você nunca a tenha dito em voz alta?', [
        (5, '“Quanto menos eu precisar, mais livre eu sou.”', '“É melhor entender tudo antes de me envolver.”'),
        (6, '“É melhor prevenir. Nunca se sabe em quem dá para confiar.”', '“Não posso baixar a guarda nem mostrar medo.”'),
        (7, '“Sempre há um jeito e uma saída melhor.”', '“Se cada um fizer a sua parte, o mundo pode ser muito melhor.”'),
    ], **FIX),
    f2('f2m_06', 'Qual destas frases você assinaria com mais orgulho em público?', [
        (5, '“Eu me basto e quase nunca peço nada a ninguém.”', '“Eu penso por conta própria e não sigo a manada.”'),
        (6, '“Eu sou leal e responsável, e cumpro o que prometo.”', '“Eu não me intimido com ninguém.”'),
        (7, '“Eu aproveito a vida e vejo o lado bom de tudo.”', '“Eu me dedico a causas e a pessoas sem esperar nada em troca.”'),
    ], desej=True, desejavel_tipo=6, eixo='fixacao', peso=1.3),
    f2('f2m_07', 'Quando você sente dor ou angústia, o que costuma fazer?', [
        (5, 'Guardo para mim e tento entender o que sinto com certo distanciamento.',
            'Me retiro e só volto quando já processei tudo sozinho.'),
        (6, 'Fico pensando nos perigos e no que fazer para não ser pego desprevenido.',
            'Endureço e sigo em frente, sem deixar ninguém ver que fui afetado.'),
        (7, 'Mudo logo o foco para algo mais agradável. Não gosto de me demorar no que dói.',
            'Me ocupo cuidando dos outros para não pensar na minha dor.'),
    ], **FIX),
    f2('f2m_12', 'Quando algo não faz sentido para você, o que você faz?', [
        (5, 'Eu me recolho para entender sozinho, no meu tempo, até tudo se encaixar.',
            'Estudo a fundo até dominar o assunto melhor do que a maioria.'),
        (6, 'Procuro uma fonte confiável que me ajude a saber em qual versão acreditar.',
            'Questiono e confronto até alguém me dar uma explicação que se sustente.'),
        (7, 'Encontro rapidamente uma explicação que me deixe otimista e livre para seguir em frente.',
            'Ligo aquilo a uma ideia maior e mais bonita, que dê sentido ao que aconteceu.'),
    ], **FIX),
    f2('f2m_08', 'Como as pessoas próximas costumam descrever você?', [
        (5, 'Reservado e independente, difícil de conhecer por completo.',
            'Discreto, mas intenso com as pouquíssimas pessoas em quem confia.'),
        (6, 'Leal e atento, alguém que se preocupa e leva as coisas a sério.',
            'Firme e desafiador, alguém que não baixa a guarda.'),
        (7, 'Animado e cheio de ideias, alguém que deixa o ambiente mais leve.',
            'Prestativo e idealista, sempre disposto a ajudar em alguma causa.'),
    ], dominio='amizade', **EMO),
    f2('f2m_09', 'Nos relacionamentos amorosos, qual costuma ser o seu ponto cego?', [
        (5, 'Recuar quando o outro se aproxima demais e manter um espaço onde ninguém entra.',
            'Exigir uma confiança total e me fechar de vez quando ela é quebrada.'),
        (6, 'Testar a lealdade da pessoa e procurar sinais de que não posso confiar nela.',
            'Não baixar a guarda nem com quem eu amo, e separar desejo de entrega.'),
        (7, 'Fugir para uma novidade quando a relação pede mais profundidade e constância.',
            'Me encantar com a ideia do que a relação pode ser e me frustrar com o dia a dia.'),
    ], dominio='romance', **FIX),
    f2('f2m_10', 'O que mais traz paz para você?', [
        (5, 'Ter um tempo só meu, sem cobranças e sem ninguém me solicitando.',
            'Ter poucos compromissos e ninguém dependendo de mim.'),
        (6, 'Saber exatamente onde estou pisando, com quem posso contar e o que esperar.',
            'Sentir que sou forte o bastante para enfrentar o que vier.'),
        (7, 'Ter opções em aberto e alguma coisa boa pela frente.',
            'Sentir que estou fazendo o bem e que as pessoas ao meu redor estão bem.'),
    ], **EMO),
    f2('f2m_11', 'Qual destes elogios mais emocionaria você?', [
        (5, '“Você enxerga coisas que ninguém mais enxerga.”', '“Você tem uma mente brilhante.”'),
        (6, '“Você é a pessoa mais confiável que eu conheço.”', '“Você é corajoso, não tem medo de nada.”'),
        (7, '“Do seu lado a vida fica mais leve e divertida.”', '“Você é uma pessoa boa, que pensa no coletivo.”'),
    ], **FIX),
    f2('f2m_13', 'Quando você sente medo de verdade, o que costuma fazer com ele?', [
        (5, 'Me afasto e observo de longe até entender.',
            'Diminuo as minhas necessidades para ficar menos exposto.'),
        (6, 'Fico em alerta, confiro tudo e procuro apoio ou garantias.',
            'Vou para cima do que me assusta. Prefiro atacar a ficar à mercê.'),
        (7, 'Mudo de assunto por dentro e penso em algo empolgante.',
            'Racionalizo e me convenço de que, no fim, tudo vai dar certo.'),
    ], **PAI),
]

# Desempates intra-triade (mantidos, com ajustes de texto)
DES_INST = [
    item('f2id_89', 2, 'Um conhecido diz sobre outra pessoa: “Ela nunca se posiciona e desaparece quando a conversa fica tensa.” O que você sente ao ouvir isso?', [
        (8, 'Um certo desprezo. Isso parece fraqueza, e você encararia a situação de frente.'),
        (9, 'Compreensão. Muitas vezes, se afastar e evitar o atrito é a atitude mais sensata.'),
    ], eixo='fixacao', peso=1.4, separa=[8, 9], indireto=True),
    item('f2id_91', 2, 'Quando você vê algo malfeito ao seu redor, o que costuma fazer?', [
        (9, 'Deixo para lá. Não é problema meu, e não vale a pena me desgastar.'),
        (1, 'Aquilo me incomoda até ser corrigido, porque existe um jeito certo e aquilo está fora do lugar.'),
    ], eixo='fixacao', peso=1.4, separa=[9, 1]),
    item('f2id_81', 2, 'Qual destas frases descreve melhor a sua relação com as regras?', [
        (8, 'Se uma regra atrapalha o que eu quero, passo por cima dela sem culpa.'),
        (1, 'Uma regra justa existe por um motivo. Quebrá-la me deixa desconfortável, mesmo quando ninguém vê.'),
    ], eixo='fixacao', peso=1.4, separa=[8, 1]),
]
DES_EMOC = [
    item('f2ed_23', 2, 'Qual destas frases descreve você melhor?', [
        (2, 'Eu me sinto valioso quando sou necessário ou especial para alguém.'),
        (3, 'Eu me sinto valioso quando sou bem-sucedido ou eficiente aos olhos dos outros.'),
    ], eixo='fixacao', peso=1.4, separa=[2, 3]),
    item('f2ed_34', 2, 'Qual frase descreve melhor a relação que você tem com a sua própria imagem?', [
        (3, 'Eu me identifico com a minha melhor versão e me esforço para mantê-la. No geral, me sinto bem comigo.'),
        (4, 'Eu me identifico mais com o que me falta. Sinto que preciso lutar ou sofrer muito para ter o valor que os outros parecem ter naturalmente.'),
    ], eixo='fixacao', peso=1.4, separa=[3, 4]),
    item('f2ed_24', 2, 'Quando você sente carência afetiva, o que costuma fazer?', [
        (2, 'Escondo o que sinto e me ocupo de cuidar dos outros, ou de encantá-los, para não parecer carente.'),
        (4, 'A carência fica muito presente dentro de mim, seja como tristeza, seja como uma dureza para não depender de ninguém.'),
    ], eixo='fixacao', peso=1.4, separa=[2, 4]),
]
DES_MENT = [
    item('f2md_56', 2, 'Qual destes impulsos é mais forte em você?', [
        (5, 'O de me recolher e preservar o que é meu.'),
        (6, 'O de buscar garantias, verificar se é seguro ou me antecipar ao perigo.'),
    ], eixo='fixacao', peso=1.4, separa=[5, 6]),
    item('f2md_67', 2, 'Quando sente medo, o que você tende a fazer?', [
        (6, 'Encaro o medo: verifico tudo, tomo precauções ou, às vezes, parto para o ataque.'),
        (7, 'Contorno o medo e desvio a atenção para algo mais leve e cheio de possibilidades.'),
    ], eixo='fixacao', peso=1.4, separa=[6, 7]),
    item('f2md_57', 2, 'Quando se trata de precisar dos outros, o que é mais parecido com você?', [
        (5, 'Reduzo as minhas necessidades ao mínimo para não depender de ninguém.'),
        (7, 'Busco várias fontes de prazer e de contato para nunca ficar sem.'),
    ], eixo='fixacao', peso=1.4, separa=[5, 7]),
]

# ===========================================================================
# FASE 2 CRUZADA: pares de tipos de triades diferentes que se confundem por
# comportamento. Cada alternativa descreve a MOTIVACAO comum aos 3 subtipos.
# ===========================================================================

def cz(id_, a, b, cen, ta, tb):
    return item(id_, 2, cen, [(a, ta), (b, tb)], eixo='fixacao', peso=1.4, separa=[a, b])

CRUZ = [
    # 8 x 6 (6 sexual / contrafobico)
    cz('fx_86a', 8, 6, 'Depois de enfrentar alguém de forma dura, o que costuma acontecer dentro de você?',
       'Pouca coisa. Fiz o que tinha que fazer e sigo em frente, sem culpa e sem dúvida.',
       'Fico repassando a cena: se exagerei, se vão revidar, se eu tinha mesmo razão.'),
    cz('fx_86b', 8, 6, 'O que está mais perto da sua experiência de coragem?',
       'Não sinto que preciso ser corajoso. Simplesmente vou, porque quero e posso.',
       'Coragem, para mim, é enfrentar uma tensão que existe por dentro, mesmo quando ninguém percebe.'),
    cz('fx_86c', 8, 6, 'Quando alguém prejudica você de verdade, o que costuma acontecer?',
       'Eu devolvo, de verdade. Não fica só na vontade.',
       'Imagino muitas vezes como eu revidaria, mas na maioria das vezes isso fica na cabeça ou vira estratégia.'),
    cz('fx_86d', 8, 6, 'Diante de uma autoridade nova, qual é a sua atitude interna?',
       'Ela só tem valor para mim se eu a respeitar. Se não, ignoro ou enfrento.',
       'Eu a testo: observo se é coerente e confiável antes de decidir se obedeço ou me rebelo.'),
    # 8 x 4 (4 sexual e 4 autopreservacao)
    cz('fx_84a', 8, 4, 'Quando você briga por algo que sente que é seu, o que mais move você?',
       'Querer e poder. Se eu quero, vou buscar, e não fico me comparando com ninguém.',
       'A sensação de injustiça por ter recebido menos do que mereço, e a dor de não ser reconhecido.'),
    cz('fx_84b', 8, 4, 'Depois de uma explosão sua com alguém próximo, o que costuma vir?',
       'Considero que a pessoa provocou e não fico me torturando.',
       'Oscilo entre a raiva e o arrependimento, e muitas vezes termino me sentindo o monstro da história.'),
    cz('fx_84c', 8, 4, 'Quando a vida aperta, você costuma aguentar firme sem pedir ajuda. Por quê?',
       'Porque sou forte e não gosto de depender de ninguém.',
       'Porque aprendi que ninguém ia me dar mesmo, e aguentar sem reclamar é o meu jeito de provar que tenho valor.'),
    cz('fx_84d', 8, 4, 'Quando você vê alguém que tem algo que você queria, o que acontece?',
       'Se eu quiser, vou atrás. Não gasto energia olhando para o outro.',
       'Aquilo mexe comigo por dentro, como tristeza, como vontade de superar ou como vontade de desvalorizar a pessoa.'),
    # 8 x 2 (2 sexual)
    cz('fx_82a', 8, 2, 'Quando você protege ou ajuda alguém, o que está por trás?',
       'Proteger os meus faz parte de ser forte. Não espero agradecimento.',
       'Gosto de ser a pessoa indispensável, e me magoa quando isso não é reconhecido.'),
    cz('fx_82b', 8, 2, 'Quando você quer muito uma pessoa, como costuma agir?',
       'Vou direto, tomo a iniciativa e não faço rodeios.',
       'Encanto, me faço especial e presente até a pessoa não conseguir ficar sem mim.'),
    # 8 x 7 (7 autopreservacao)
    cz('fx_87a', 8, 7, 'Qual é a sua relação com o que é pesado e doloroso?',
       'Encaro de frente. A dor não me assusta, a fraqueza sim.',
       'Encaro se precisar, mas o meu impulso natural é buscar algo prazeroso e manter o bom humor.'),
    cz('fx_87b', 8, 7, 'Quando você vai com tudo em alguma coisa, o que move você?',
       'A intensidade e o controle da situação.',
       'A novidade e as possibilidades. Quando fica repetitivo, perco o interesse.'),
    # 8 x 3 (3 social)
    cz('fx_83a', 8, 3, 'Quando você compete, o que está em jogo para você?',
       'O poder e não perder o que é meu. Pouco me importa o que vão pensar.',
       'Ser visto como o melhor. O reconhecimento é parte essencial da vitória.'),
    cz('fx_83b', 8, 3, 'Se tivesse que escolher, o que você preferiria?',
       'Ser respeitado, mesmo que não gostem de mim.',
       'Ser admirado e bem visto, ajustando a minha postura para isso.'),
    # 1 x 3 (3 autopreservacao)
    cz('fx_13a', 1, 3, 'Quando você faz algo com todo o cuidado, por que faz?',
       'Porque é o certo. Mesmo que ninguém visse, eu veria.',
       'Porque o resultado vai ser avaliado, e quero que ele fale bem de mim.'),
    cz('fx_13b', 1, 3, 'Quando o seu trabalho recebe um elogio, o que acontece?',
       'Fico bem, mas logo vejo o que ainda poderia ser melhor.',
       'É um alívio e um combustível. É para isso que eu me esforço tanto.'),
    # 1 x 6 (6 social)
    cz('fx_16a', 1, 6, 'Por que você segue regras?',
       'Porque acredito no que é correto, e me incomoda o que está fora do lugar.',
       'Porque elas me dão segurança e evitam problemas ou punições.'),
    cz('fx_16b', 1, 6, 'Quando você critica alguém, o que costuma estar por trás?',
       'A certeza de que aquilo está errado e precisa ser corrigido.',
       'A desconfiança da intenção ou da competência da pessoa.'),
    # 1 x 4 (4 autopreservacao)
    cz('fx_14a', 1, 4, 'Quando você se cobra demais, qual é o motivo mais profundo?',
       'Existe um padrão certo, e eu preciso cumpri-lo.',
       'Sinto que, sem um esforço extra, eu não teria valor suficiente.'),
    cz('fx_14b', 1, 4, 'O que dói mais quando você falha?',
       'Ter feito algo errado.',
       'Confirmar que não sou tão bom quanto os outros.'),
    # 1 x 7 (7 social)
    cz('fx_17a', 1, 7, 'Quando você se sacrifica por uma causa ou por outras pessoas, o que move você?',
       'É o certo a fazer, e me irrita quem não faz a sua parte.',
       'Me faz sentir bem comigo e com os outros, e prefiro nem pensar no que isso me custa.'),
    cz('fx_17b', 1, 7, 'Qual é a sua relação com o prazer?',
       'Primeiro o dever. O prazer vem depois, se vier.',
       'Até me contenho, mas sinto que mereço aproveitar e gosto de ter algo bom planejado.'),
    # 9 x 6 (6 autopreservacao)
    cz('fx_96a', 9, 6, 'Quando você evita um conflito, qual é o motivo mais verdadeiro?',
       'O atrito me tira a paz. Prefiro deixar para lá e me acomodar.',
       'Tenho medo das consequências e de perder o apoio de quem importa.'),
    cz('fx_96b', 9, 6, 'Diante de uma decisão importante, por que você às vezes adia?',
       'Porque é difícil saber o que eu mesmo quero.',
       'Porque fico pesando riscos e buscando garantias ou alguém de confiança.'),
    # 9 x 2 (9 social / 2)
    cz('fx_92a', 9, 2, 'Quando você se dedica muito aos outros, o que acontece por dentro?',
       'É meio automático. Me adapto ao que o outro precisa e me esqueço de mim sem perceber.',
       'Sinto satisfação por ser importante para eles e, no fundo, espero algum reconhecimento.'),
    cz('fx_92b', 9, 2, 'Se alguém não agradece o que você fez, o que você sente?',
       'Quase nada. Logo esqueço.',
       'Fico magoado, mesmo que não demonstre.'),
    # 9 x 5 (5 autopreservacao / 9 autopreservacao)
    cz('fx_95a', 9, 5, 'Quando você se recolhe, para que é?',
       'Para descansar e ficar no conforto, sem pensar em nada muito sério.',
       'Para ter espaço mental. É ali que eu penso e me reorganizo.'),
    cz('fx_95b', 9, 5, 'Como você costuma estar com as pessoas?',
       'Me misturo fácil e me adapto ao grupo, mesmo que eu mesmo desapareça.',
       'Observo de fora e mantenho uma distância que me protege.'),
    # 9 x 4 (9 sexual)
    cz('fx_94a', 9, 4, 'Quando você sofre numa relação, o que fica mais presente?',
       'Sinto mais a dor do outro do que a minha e tento não incomodar.',
       'Sinto a minha dor com intensidade, e ela diz muito sobre quem eu sou.'),
    cz('fx_94b', 9, 4, 'Sobre o que falta na sua vida, o que é mais verdadeiro?',
       'Me conformo. Poderia ser pior.',
       'Aquilo que falta ocupa muito espaço dentro de mim.'),
    # 9 x 3 (9 social / 3 autopreservacao)
    cz('fx_93a', 9, 3, 'Quando você trabalha muito por um grupo, o que busca?',
       'Participar e pertencer. Não faço questão de aparecer.',
       'Que o resultado seja visto e ligado ao meu nome, mesmo que de forma discreta.'),
    cz('fx_93b', 9, 3, 'Sobre o que você quer da vida, o que é mais verdadeiro?',
       'Às vezes nem sei ao certo. Vou seguindo.',
       'Tenho metas claras e fico inquieto quando não estou avançando.'),
    # 2 x 7
    cz('fx_27a', 2, 7, 'Quando você está em um grupo, o que mais gosta de ser?',
       'A pessoa querida, que cuida e que todos procuram.',
       'A pessoa que anima, traz ideias e faz o momento render.'),
    cz('fx_27b', 2, 7, 'Quando alguém precisa muito de você por muito tempo, o que acontece?',
       'Me sinto importante, mesmo cansado.',
       'Começo a me sentir preso e busco um respiro.'),
    # 2 x 4
    cz('fx_24a', 2, 4, 'Quando você está carente, o que costuma fazer?',
       'Escondo e cuido dos outros, para não parecer necessitado.',
       'Sinto isso fundo, e de algum jeito isso aparece ou endurece em mim.'),
    cz('fx_24b', 2, 4, 'Como você se vê, lá no fundo?',
       'Como alguém com muito a oferecer.',
       'Como alguém a quem falta algo que os outros têm.'),
    # 2 x 6 (6 autopreservacao)
    cz('fx_26a', 2, 6, 'Quando você é carinhoso com alguém, o que também está em jogo?',
       'Ser especial e importante para aquela pessoa.',
       'Sentir que estou seguro e protegido naquela relação.'),
    cz('fx_26b', 2, 6, 'Quando uma relação esfria, o que você sente primeiro?',
       'Que não estão me dando o valor que eu mereço.',
       'Medo de ficar sozinho e sem apoio.'),
    # 3 x 7 (3 social)
    cz('fx_37a', 3, 7, 'Quando você se ocupa com muitos projetos, por que faz isso?',
       'Para chegar lá e ser reconhecido. Cada meta tem um propósito.',
       'Porque tudo me interessa, e não quero perder nenhuma possibilidade.'),
    cz('fx_37b', 3, 7, 'Se um projeto seu fracassa, o que acontece?',
       'Dói na imagem, e já penso em como compensar.',
       'Vejo como aprendizado e parto para outra ideia.'),
    # 4 x 5 (5 sexual)
    cz('fx_45a', 4, 5, 'Quando você fica sozinho por um bom tempo, o que sente?',
       'A falta de conexão, com intensidade.',
       'Alívio. Tenho comigo o que preciso.'),
    cz('fx_45b', 4, 5, 'O que você faz com as suas emoções mais fortes?',
       'Elas ocupam o centro da minha vida e eu as vivo por inteiro.',
       'Mesmo quando são intensas, eu as guardo e só abro para alguém raro em quem confio totalmente.'),
    # 4 x 6
    cz('fx_46a', 4, 6, 'Quando você desconfia do carinho de alguém, por que é?',
       'Porque sinto que não mereço, ou que vão me deixar como sempre.',
       'Porque não sei quais são as reais intenções da pessoa.'),
    cz('fx_46b', 4, 6, 'Em torno de que a sua inquietação costuma girar?',
       'De não ser especial ou suficiente.',
       'De perigos, perdas e de em quem confiar.'),
    # 4 x 9 ja coberto em 9x4; 3 x 6
    cz('fx_36a', 3, 6, 'Quando você trabalha além da conta, o que move você?',
       'Mostrar resultado e ser visto como alguém que dá conta.',
       'Garantir que nada vai dar errado e que ninguém vai poder me culpar.'),
    # 5 x 1 (1 social)
    cz('fx_15a', 1, 5, 'Quando você se distancia das pessoas, o que costuma estar por trás?',
       'Um incômodo com o jeito errado como as coisas são feitas.',
       'A necessidade de preservar o meu espaço e a minha energia.'),
]

# ===========================================================================
# FASE 3: instinto (neutro em relacao ao tipo). 3 alternativas, 1 por instinto.
# ===========================================================================
SP, SO, SX = 'autopreservacao', 'social', 'sexual'

def f3(id_, cen, sp, so, sx, **kw):
    return item(id_, 3, cen, [(SP, sp), (SO, so), (SX, sx)], **kw)

F3 = [
    f3('f3_01', 'Quando a vida fica difícil, para onde a sua atenção vai primeiro?',
       'Para garantir o básico: sustento, casa, saúde e segurança.',
       'Para as pessoas do meu meio: se ainda faço parte, qual é o meu papel ali.',
       'Para uma pessoa específica, a quem me ligo por inteiro e em quem busco força.', eixo='paixao'),
    f3('f3_02', 'Em que você gasta mais energia mental, muitas vezes sem perceber?',
       'Prevendo o que pode faltar e cuidando das reservas, do conforto e do futuro.',
       'Observando as relações no grupo, quem está próximo de quem e onde eu me encaixo.',
       'Pensando em uma pessoa em particular e na química e intensidade dessa ligação.', eixo='fixacao', peso=1.3),
    f3('f3_03', 'O que você teria mais dificuldade em perder?',
       'A minha estabilidade e a minha segurança material.',
       'O meu lugar entre as pessoas do meu convívio e a sensação de pertencer.',
       'Aquela conexão única e intensa com a pessoa que mais mexe comigo.'),
    f3('f3_04', 'Em um encontro com muitas pessoas, o que você costuma fazer?',
       'Procurar um lugar confortável, poupar energia e ficar à vontade.',
       'Circular, sentir o clima e perceber como os grupos estão formados.',
       'Criar uma conexão forte com uma ou duas pessoas e esquecer o resto do ambiente.', dominio='amizade'),
    f3('f3_05', 'Um amigo diz que você exagera em alguma área da vida. Qual crítica parece mais familiar?',
       '“Você se preocupa demais com conforto e segurança, em ter tudo garantido.”',
       '“Você se envolve demais com grupos, causas e com o que acontece no seu meio.”',
       '“Você se entrega com intensidade demais a uma pessoa de cada vez.”', eixo='fixacao', peso=1.3, indireto=True),
    f3('f3_06', 'No início de um relacionamento amoroso, o que mais pesa para você?',
       'Se a relação é estável e cabe na minha vida sem ameaçar a minha segurança.',
       'Se a pessoa se encaixa no meu mundo, com meus amigos, minha família e meus grupos.',
       'A intensidade da atração e da entrega, sentir que estamos completamente envolvidos.', dominio='romance'),
    f3('f3_07', 'Depois de um período difícil, qual é a sua forma preferida de recuperar as energias?',
       'Ficar mais recolhido, cuidar do corpo, comer bem e ter uma rotina aconchegante.',
       'Estar com o meu grupo, participar e sentir que faço parte de algo maior.',
       'Estar intensamente envolvido com alguém ou com algo que me desperte por completo.'),
    f3('f3_08', 'Qual destes exageros em outras pessoas você consegue entender com mais facilidade?',
       'O de quem organiza a vida inteira em torno da segurança e de não deixar faltar nada.',
       'O de quem vive para o grupo ou para uma causa, e precisa sentir que pertence.',
       'O de quem se entrega completamente a uma única pessoa, numa relação que ocupa todo o resto.', eixo='fixacao', peso=1.3, indireto=True),
    f3('f3_09', 'Quando você chega a um lugar novo, o que percebe primeiro?',
       'Se é confortável e seguro: onde sentar, se está frio, se tem o que comer.',
       'Quem é quem, como as pessoas se organizam e qual é o clima do grupo.',
       'Quem me atrai ou desperta curiosidade, com quem sinto química.', eixo='paixao'),
    f3('f3_10', 'Quando está bem, para onde a sua energia sobra?',
       'Para cuidar da casa, do dinheiro, da saúde e do meu canto.',
       'Para projetos coletivos, grupos, causas e conexões.',
       'Para uma relação ou uma paixão que me absorve.'),
    f3('f3_11', 'O que desperta mais ansiedade em você?',
       'O básico faltar: dinheiro, saúde, casa.',
       'Ficar de fora, sem lugar ou sem papel no meu meio.',
       'Perder a pessoa, ou a paixão, que me dá vida, ou nunca encontrar essa conexão.', eixo='fixacao', peso=1.3),
    f3('f3_12', 'Numa viagem com amigos, o que mais importa para você?',
       'Conforto, organização, comida boa e dormir bem.',
       'Que o grupo esteja integrado e que todos participem.',
       'Os momentos intensos com uma ou duas pessoas especiais.', dominio='amizade'),
]
F3_DES = [
    item('f3d_as', 3, 'Se tivesse que escolher, o que traria mais paz para você?', [
        (SP, 'Ter a vida material segura e a rotina sob controle, mesmo que um pouco isolado.'),
        (SO, 'Ter um lugar sólido em um grupo ou comunidade, mesmo com menos conforto pessoal.'),
    ], eixo='fixacao', peso=1.4, separa=[SP, SO]),
    item('f3d_sx', 3, 'Do que seria mais difícil abrir mão?', [
        (SO, 'Do meu lugar no grupo e do papel que tenho entre as pessoas próximas.'),
        (SX, 'Daquela conexão única e intensa com uma pessoa, que me faz sentir vivo.'),
    ], eixo='fixacao', peso=1.4, separa=[SO, SX]),
    item('f3d_ax', 3, 'Em um momento de estresse extremo, onde você busca apoio?', [
        (SP, 'No que é concreto e seguro. Eu me volto para o que garante o meu sustento e o meu conforto.'),
        (SX, 'Em uma pessoa específica, a mais importante para mim. Fico o mais perto possível dela.'),
    ], eixo='fixacao', peso=1.4, separa=[SP, SX]),
]

# ===========================================================================
# FASE 4: confirmacao do subtipo DENTRO do tipo encontrado (Naranjo).
# ===========================================================================
def f4(tipo, n, cen, sp, so, sx):
    return item(f'f4_{tipo}{n}', 4, cen, [(SP, sp), (SO, so), (SX, sx)], eixo='fixacao', peso=1.4, tipo_alvo=tipo)

F4 = {
 1: [f4(1, 'a', 'A sua exigência de fazer o certo se volta principalmente para:',
        'Mim mesmo. Me corrijo, me preocupo e antecipo problemas para que nada saia errado.',
        'O ambiente e as pessoas em geral. Vejo o que está errado no mundo e sinto que tenho algo a ensinar.',
        'Quem está perto de mim. Quero muito que o outro melhore, e cobro isso com intensidade.'),
     f4(1, 'b', 'Como a sua raiva costuma aparecer?',
        'Quase não aparece. Vira preocupação, pressa e autocrítica.',
        'Aparece fria, como superioridade, crítica educada ou distância.',
        'Aparece aberta e com força, porque sinto que tenho razão.'),
     f4(1, 'c', 'Qual imagem você mais preserva?',
        'A de alguém bom, prestativo e responsável.',
        'A de alguém correto e exemplar, que sabe como as coisas devem ser.',
        'A de alguém apaixonado pelo que é justo, que não tolera erro de quem ama.')],
 2: [f4(2, 'a', 'O que você mais espera de quem você ama?',
        'Ser mimado e ter um lugar de privilégio, como alguém especial.',
        'Ser reconhecido como uma pessoa de referência, importante na vida de muitos.',
        'Ser desejado e insubstituível para aquela pessoa.'),
     f4(2, 'b', 'Como você costuma conquistar as pessoas?',
        'Com doçura, leveza e um jeito meio de criança que desperta cuidado.',
        'Com contatos, conselhos, influência e ajudas que abrem portas.',
        'Com charme, intensidade e atenção total à pessoa.'),
     f4(2, 'c', 'Quando não recebe o que esperava, o que acontece?',
        'Me queixo, faço birra ou me sinto injustiçado depois de tudo o que fiz.',
        'Me imponho a partir da minha posição e posso ser duro ou irônico.',
        'Insisto, pressiono ou explodo, porque não aceito bem um não.')],
 3: [f4(3, 'a', 'Como você quer ser visto?',
        'Como alguém confiável e eficiente, sem parecer vaidoso.',
        'Como alguém de sucesso e prestígio, que tem destaque.',
        'Como alguém atraente e desejável, que agrada a quem ama.'),
     f4(3, 'b', 'Onde você investe mais energia?',
        'No trabalho e em deixar tudo resolvido e garantido.',
        'Em crescer, aparecer e ser reconhecido no meu meio.',
        'Na aparência e na relação, em ser o parceiro ideal.'),
     f4(3, 'c', 'Qual é a sua relação com a vaidade?',
        'Não gosto de me exibir. Prefiro que o reconhecimento venha sem eu pedir.',
        'Gosto de mostrar o que conquistei. Para mim é natural.',
        'Cuido muito da imagem, mas é mais para ser amado do que para ser admirado por muitos.')],
 4: [f4(4, 'a', 'O que você faz com a sensação de falta?',
        'Transformo em esforço: aguento, trabalho e não peço nada.',
        'Sinto vergonha e tristeza, e me comparo muito com os outros.',
        'Transformo em reivindicação: cobro, compito e às vezes ataco.'),
     f4(4, 'b', 'Como você lida com o próprio sofrimento?',
        'Aguento calado. Reclamar seria fraqueza.',
        'Ele aparece: choro, lamento, espero que alguém perceba.',
        'Vira raiva e drama. Faço o outro sentir o que eu sinto.'),
     f4(4, 'c', 'Nas relações, o que é mais verdadeiro?',
        'Cuido muito dos outros, mas tenho dificuldade de me deixar cuidar.',
        'Tenho medo de não ser suficiente e acabo me escondendo.',
        'Quero ser o preferido e compito por esse lugar.')],
 5: [f4(5, 'a', 'Onde você se sente mais seguro?',
        'No meu canto, com os meus recursos, longe de exigências.',
        'No conhecimento, em saber mais sobre o que realmente importa.',
        'Com aquela pessoa rara em quem confio totalmente.'),
     f4(5, 'b', 'O que você mais protege?',
        'O meu espaço físico, o meu tempo e as minhas coisas.',
        'O meu lugar como alguém que sabe e entende.',
        'A intimidade de uma ligação profunda e reservada.'),
     f4(5, 'c', 'Qual é a sua maior idealização?',
        'Precisar de pouquíssimo e ser autossuficiente.',
        'Um saber, um mestre ou um ideal elevado.',
        'Um amor ou uma amizade absolutamente transparente e confiável.')],
 6: [f4(6, 'a', 'Como você costuma lidar com o medo?',
        'Busco alguém forte e caloroso a quem me ligar, e evito conflitos.',
        'Me apoio em regras, deveres e referências claras.',
        'Enfrento e mostro força, para não parecer que tenho medo.'),
     f4(6, 'b', 'Como é a sua relação com a autoridade?',
        'Me apego a quem pode me proteger, mas tenho medo de ser rejeitado.',
        'Respeito a autoridade das normas e sou rigoroso com quem não cumpre.',
        'Desafio, testo e às vezes intimido.'),
     f4(6, 'c', 'Nas relações, o que é mais verdadeiro?',
        'Sou afetuoso e evito brigas a quase qualquer custo.',
        'Sou leal e responsável, às vezes rígido.',
        'Protejo os meus e mantenho a guarda alta, sem me entregar totalmente.')],
 7: [f4(7, 'a', 'O que você mais busca?',
        'Garantir bons prazeres e boas oportunidades para mim e para os meus.',
        'Contribuir para algo maior e ser visto como alguém bom e generoso.',
        'Viver encantado, com ideias e paixões que me empolguem.'),
     f4(7, 'b', 'Qual é o seu jeito de ver o mundo?',
        'Realista e esperto. Sei me virar.',
        'Idealista. Acredito num mundo melhor e me dedico a ele.',
        'Sonhador. Tudo parece possível e fascinante.'),
     f4(7, 'c', 'Quando algo dói, o que você faz?',
        'Busco um prazer concreto e me cerco do meu grupo.',
        'Me ocupo servindo aos outros e adio o que eu quero.',
        'Mergulho numa nova fantasia ou numa nova paixão.')],
 8: [f4(8, 'a', 'Onde a sua força mais aparece?',
        'Em garantir o que eu preciso, sem depender de ninguém.',
        'Em proteger os meus amigos e o meu grupo.',
        'Em ter o controle da relação e da pessoa que eu quero.'),
     f4(8, 'b', 'O que mais enfurece você?',
        'Alguém atrapalhando o meu sustento, o meu território ou as minhas coisas.',
        'Alguém traindo ou machucando quem é dos meus.',
        'Alguém tentando tirar de mim quem é meu, ou não se entregando.'),
     f4(8, 'c', 'O que é prazer para você?',
        'Conforto e satisfação concreta: comer bem, ter o que é meu.',
        'Estar com a turma, na cumplicidade.',
        'Intensidade e entrega total com alguém.')],
 9: [f4(9, 'a', 'Como você costuma se esquecer de si?',
        'Me distraio com conforto, comida, séries e rotina.',
        'Me ocupo com o grupo e com o que é preciso fazer pelos outros.',
        'Me fundo com a pessoa que amo, e os desejos dela viram os meus.'),
     f4(9, 'b', 'Onde você se sente em casa?',
        'Na minha rotina e nas minhas coisas.',
        'Participando, fazendo parte de algo.',
        'Bem perto de alguém especial.'),
     f4(9, 'c', 'Como são os seus devaneios?',
        'Práticos e concretos.',
        'Giram em torno de pertencer e de ser útil.',
        'Românticos e cheios de detalhes.')],
}

banco = {
    "_meta": {
        "descricao": "Banco de perguntas do teste de eneagrama (versão proposta). Cenários indiretos de múltipla escolha.",
        "principio_cobertura": "REGRA DE OURO (revisada): (1) na Fase 1, cada item tem EXATAMENTE uma alternativa por tipo, com o mesmo eixo e o mesmo peso, para que nenhum tipo tenha vantagem estrutural; (2) nas Fases 2 e 4, cada tipo tem o mesmo número de alternativas por item, e pelo menos uma delas descreve o subtipo menos parecido com o estereótipo do tipo (contratipo); (3) o enunciado fixa o comportamento e as alternativas variam a motivação, porque é a motivação que diferencia tipos de comportamento parecido; (4) toda pergunta oferece 'Nenhuma dessas se parece comigo', que não pontua e entra no índice de confiabilidade.",
        "eixos": {"fixacao": "distorção cognitiva, peso maior", "paixao": "reação passional, sensível ao tempo", "emocao": "emoção reativa de base"},
        "triades": {"instintiva": [8, 9, 1], "emocional": [2, 3, 4], "mental": [5, 6, 7]},
        "instintos": ["autopreservacao", "social", "sexual"],
        "fluxo": "Fase 1 pontua tríade E tipo. Fase 2 aplica os itens da tríade vencedora (e da segunda, se a margem for pequena) mais itens cruzados para os tipos de outras tríades que ficaram entre os 3 primeiros. Fase 3 pontua o instinto. Fase 4 confirma o subtipo com itens específicos do tipo encontrado.",
        "nota_calibracao": "Pesos e limiares são heurísticas ajustáveis, não validadas por amostra. Sem travessões.",
    },
    "fase1": F1,
    "fase1_desempate": F1_DES,
    "fase2": {"instintiva": INST, "emocional": EMOC, "mental": MENT},
    "fase2_desempate": {"instintiva": DES_INST, "emocional": DES_EMOC, "mental": DES_MENT},
    "fase2_cruzada": CRUZ,
    "fase3": F3,
    "fase3_desempate": F3_DES,
    "fase4": {str(k): v for k, v in F4.items()},
}

# ---- validacoes ----------------------------------------------------------
todos = []
def coleta(x):
    if isinstance(x, list):
        for i in x: coleta(i)
    elif isinstance(x, dict) and 'alternativas' in x:
        todos.append(x)
    elif isinstance(x, dict):
        for v in x.values(): coleta(v)
coleta(banco)
ids = [i['id'] for i in todos]
assert len(ids) == len(set(ids)), 'ids repetidos'
for it in todos:
    txt = it['cenario'] + ''.join(a['texto'] for a in it['alternativas'])
    assert '—' not in txt and '–' not in txt, ('travessao', it['id'])
    ativos = [a for a in it['alternativas'] if not a.get('nula')]
    assert len({(a['eixo'], a['peso']) for a in ativos}) == 1, ('eixo/peso desigual', it['id'])
for it in F1:
    ts = sorted(a['mapa']['tipo'] for a in it['alternativas'] if not a.get('nula'))
    assert ts == list(range(1, 10)), it['id']
from collections import Counter
for tri, lst in banco['fase2'].items():
    for it in lst:
        c = Counter(a['mapa']['tipo'] for a in it['alternativas'] if not a.get('nula'))
        assert len(set(c.values())) == 1 and len(c) == 3, it['id']

OPCIONAIS = ['f1_05', 'f1_09', 'f2e_02', 'f2e_04', 'f2e_10', 'f2e_11', 'f2i_08', 'f2i_09', 'f2i_10', 'f2i_13', 'f2m_02', 'f2m_08', 'f2m_10', 'f2m_11', 'f3_04', 'f3_06', 'f3_07', 'f3_08', 'f3_10', 'f3_12']
for it in todos:
    if it['id'] in OPCIONAIS:
        it['opcional'] = True
banco['_meta']['itens_opcionais'] = (
    'Itens marcados com "opcional": true sao os primeiros a sair quando o fluxo esta no modo curto '
    '(FLUXO.itensFase1 / maxItensTriadePrincipal / maxItensSegundaTriade / maxCruzadosTotal / itensFase3). '
    'Eles continuam no banco e voltam a ser usados se os limites forem afrouxados.'
)

out = sys.argv[1] if len(sys.argv) > 1 else 'questions.json'
json.dump(banco, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok', out, 'itens:', len(todos),
      '| f1', len(F1), '| f2', sum(len(v) for v in banco['fase2'].values()),
      '| cruz', len(CRUZ), '| f3', len(F3), '| f4', sum(len(v) for v in F4.values()))
