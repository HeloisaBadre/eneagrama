# -*- coding: utf-8 -*-
"""Banco v3: cenas concretas em vez de perguntas introspectivas.

Regras de escrita (alem das de equilibrio da v2):
  - Todo item e uma SITUACAO, nao uma auto-avaliacao. Nada de "como voce e",
    "qual imagem voce passa", "o que voce sente quando esta sozinho".
  - A pessoa responde com uma lembranca ou uma reacao, nao com uma teoria
    sobre si mesma. Isso importa para quem tem pouco acesso ao proprio mundo
    interno (E9 acima de tudo, mas tambem E3 e E7).
  - Itens de infancia e de crenca formada, na linha de Caracter e neurose:
    a cena familiar concreta e a conclusao que a crianca tirou dela.
  - Nada de alternativa que comece com "depende": cada opcao e uma resposta
    inteira para aquela situacao.
"""
import json, sys
from collections import Counter

TRIADE = {8: 'instintiva', 9: 'instintiva', 1: 'instintiva',
          2: 'emocional', 3: 'emocional', 4: 'emocional',
          5: 'mental', 6: 'mental', 7: 'mental'}
LETRAS = 'abcdefghijklmnop'
NULA = {"id": "z", "texto": "Nenhuma dessas se parece comigo.", "nula": True,
        "mapa": {"triade": None, "tipo": None, "instinto": None},
        "eixo": "emocao", "peso": 0, "desejavel": False}
SP, SO, SX = 'autopreservacao', 'social', 'sexual'


def item(id_, fase, cenario, alts, dominio='geral', eixo='emocao', peso=1.0, gemeo=None,
         indireto=False, desej=False, separa=None, nula=True, tipo_alvo=None,
         desejavel_tipo=None, opcional=False):
    out = []
    for i, a in enumerate(alts):
        chave, texto = a[0], a[1]
        nota = a[2] if len(a) > 2 else None
        mapa = {"triade": TRIADE.get(chave) if isinstance(chave, int) else None,
                "tipo": chave if isinstance(chave, int) else None,
                "instinto": chave if isinstance(chave, str) else None}
        alt = {"id": LETRAS[i], "texto": texto, "mapa": mapa, "eixo": eixo, "peso": peso,
               "desejavel": bool(desejavel_tipo == chave and nota in (None, 'p'))}
        if nota:
            alt["subtipo_alvo"] = nota
        out.append(alt)
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


def i9(id_, cenario, mapa_textos, **kw):
    """Item de Fase 1: exatamente uma alternativa por tipo, na ordem dada."""
    return item(id_, 1, cenario, [(t, mapa_textos[t]) for t in mapa_textos], **kw)


# ===========================================================================
# FASE 1 — infancia (6 itens) + cenas do presente (8 itens)
# ===========================================================================
F1 = []

F1.append(i9('f1_01', 'Quando você era criança e chorava ou ficava com medo, o que mais acontecia na sua casa?', {
    8: 'Aprendi rápido que chorar não resolvia e podia até piorar. Fui ficando duro.',
    9: 'Não era um problema para ninguém. Eu me acalmava sozinho, no meu canto.',
    1: 'Me mandavam parar, dizendo que era manha ou que eu tinha que dar exemplo.',
    2: 'Me davam colo e carinho, e eu aprendi que sendo dócil e gracinha eu conseguia isso.',
    3: 'Não tinha muito espaço para isso. O que contava era eu estar bem e dar conta.',
    4: 'Eu tinha a impressão de que com meus irmãos era diferente, que eles recebiam mais.',
    5: 'Eu ia para o meu quarto e resolvia por dentro. Ninguém ia perguntar mesmo.',
    6: 'Dependia do humor do adulto naquele dia, e isso me deixava ainda mais assustado.',
    7: 'Alguém me distraía, ou eu mesmo achava um jeito de virar a página rápido.',
}, dominio='familia', eixo='fixacao', peso=1.2))

F1.append(i9('f1_02', 'Quando criança, como você conseguia que prestassem atenção em você?', {
    2: 'Sendo carinhoso, engraçadinho e prestativo com os adultos.',
    3: 'Indo bem: notas, esportes, prêmios, sendo motivo de orgulho.',
    4: 'Eu não conseguia. A atenção parecia ir sempre para outra pessoa.',
    1: 'Sendo o responsável, o certinho, o que fazia tudo direito.',
    8: 'Fazendo bagunça, batendo de frente, não levando desaforo para casa.',
    9: 'Eu nem tentava. Era a criança que não dava trabalho.',
    5: 'Eu me afastava. Preferia meu canto e meus assuntos a disputar espaço.',
    6: 'Ficando perto de quem me protegia e sendo útil para essa pessoa.',
    7: 'Fazendo graça e animando o ambiente. Eu era a diversão da casa.',
}, dominio='familia', eixo='fixacao', peso=1.2))

F1.append(i9('f1_03', 'Quando você pedia alguma coisa em casa (um brinquedo, ir a um lugar), o que geralmente acontecia?', {
    2: 'Eu conseguia quase sempre, principalmente com quem gostava mais de mim.',
    7: 'Se diziam não, eu dava um jeito de conseguir por outro caminho.',
    8: 'Eu insistia até conseguir, ou simplesmente pegava e depois eu via.',
    1: 'Eu nem pedia muito. Tinha que ser merecido e na hora certa.',
    4: 'Vinha uma explicação de que não dava, e eu ficava com a sensação de que para outros dava.',
    5: 'Eu quase não pedia. Pedir já me parecia um incômodo.',
    6: 'Eu pedia com medo, sem saber se ia ouvir um sim, um não ou uma bronca.',
    9: 'Eu quase não sabia o que queria. Ia no embalo do que os adultos decidiam.',
    3: 'Eu mostrava que merecia: boas notas, tarefas feitas, algo em troca.',
}, dominio='familia', eixo='fixacao', peso=1.2))

F1.append(i9('f1_04', 'Quando os adultos da casa discutiam, ou o clima pesava, o que você costumava fazer?', {
    9: 'Eu sumia e esperava passar. Fazia de conta que não estava acontecendo.',
    6: 'Eu ficava atento a cada barulho, tentando prever o que ia acontecer.',
    2: 'Eu tentava consolar alguém, geralmente o que estava pior.',
    1: 'Eu ficava com raiva de quem estava errado e queria pôr ordem naquilo.',
    8: 'Eu me metia no meio, principalmente se alguém estivesse sendo injustiçado.',
    4: 'Eu sentia tudo muito fundo e me trancava com aquilo.',
    5: 'Eu ia para o meu quarto e me desligava com um livro, um jogo, qualquer coisa.',
    3: 'Eu tocava a minha vida e cuidava do que era prático: lição, comida, o que precisasse.',
    7: 'Eu ia brincar, sair, inventar alguma coisa. Não ficava ali.',
}, dominio='familia'))

F1.append(i9('f1_05', 'Pensando na sua família, qual papel acabou sobrando para você?', {
    1: 'O responsável, o que tinha que ser exemplo e não dar motivo de crítica.',
    2: 'O querido, aquele que alegrava e cuidava dos outros.',
    3: 'O que dava certo, o orgulho da família.',
    4: 'O diferente, aquele que não se encaixava bem ali.',
    5: 'O quietinho, que ficava no canto dele.',
    6: 'O leal, que segurava as pontas e não podia decepcionar.',
    7: 'O animado, que aliviava o clima.',
    8: 'O forte, que resolvia e protegia os outros.',
    9: 'O de boa, que não dava trabalho e concordava com tudo.',
}, dominio='familia', eixo='fixacao', peso=1.2))

F1.append(i9('f1_06', 'Qual destas conclusões você tirou cedo, sem que ninguém precisasse ensinar?', {
    8: '“Se eu não for forte, passam por cima de mim.”',
    9: '“Se eu não incomodar, fica tudo em paz.”',
    1: '“Se eu errar, vem crítica. Tem que ser do jeito certo.”',
    2: '“Se eu for útil e querido, não me deixam de lado.”',
    3: '“Se eu não me destacar, não valho grande coisa.”',
    4: '“Tem alguma coisa em mim que faltou, e nos outros não faltou.”',
    5: '“Se eu depender de alguém, me invadem ou me decepcionam.”',
    6: '“Não dá para baixar a guarda. A qualquer hora vem problema.”',
    7: '“Se eu não me virar para ficar bem, ninguém vai fazer isso por mim.”',
}, eixo='fixacao', peso=1.2))

# ---- cenas do presente ----------------------------------------------------
F1.append(i9('f1_07', 'Seu chefe chama você para uma conversa e não diz o assunto. O que passa na sua cabeça no caminho até a sala?', {
    6: '“O que será que aconteceu?” Já imagino três cenários, quase todos ruins.',
    1: 'Reviso o que pode ter saído errado e se a culpa é minha.',
    3: 'Penso em como me sair bem na conversa e reverter se for crítica.',
    8: 'Se for encrenca, eu encaro. Já entro pronto para não levar desaforo.',
    9: 'Procuro não pensar até chegar lá. Depois eu vejo.',
    4: 'Já sinto que é comigo, que vão apontar algo em mim.',
    2: 'Penso em tudo o que já fiz por essa equipe. Seria injusto reclamarem de mim.',
    5: 'Me incomoda ser pego de surpresa, sem tempo de me preparar.',
    7: 'Provavelmente não é nada. Já estou pensando no que faço depois do expediente.',
}, dominio='trabalho', eixo='paixao'))

F1.append(i9('f1_08', 'Você está em uma fila e alguém passa na sua frente, de propósito, e olha para você. O que você faz?', {
    8: 'Falo na hora. Não vou fingir que não vi.',
    1: 'Falo, ou fico indignado por dentro, porque aquilo é falta de educação.',
    9: 'Deixo passar. Não vale a briga.',
    6: 'Fico tenso. Ou engulo, avaliando se a pessoa vai reagir mal, ou enfrento para não parecer que tive medo.',
    3: 'Deixo quieto para não fazer cena, mas fico irritado.',
    2: 'Fico indignado que façam isso comigo, logo eu, que sempre sou educado.',
    4: 'Sinto como desfeita pessoal, como se eu não valesse o suficiente para ser respeitado.',
    5: 'Não falo nada. Não vou gastar a minha energia com um estranho.',
    7: 'Faço um comentário irônico ou levo na brincadeira e sigo.',
}, eixo='paixao'))

F1.append(i9('f1_09', 'Um amigo desmarca em cima da hora pela terceira vez seguida. O que acontece?', {
    2: 'Fico magoado. Eu sempre estou lá quando ele precisa.',
    8: 'Falo na cara dele, ou simplesmente paro de chamar.',
    1: 'Acho um desrespeito com o tempo dos outros, mesmo que eu não diga.',
    9: 'Fico chateado um pouco e deixo passar. Ele deve ter os motivos dele.',
    4: 'Penso que talvez ele prefira a companhia de outras pessoas.',
    6: 'Fico pensando se ele está me evitando, ou se aconteceu alguma coisa.',
    5: 'Sinceramente, dá até um alívio. Ganhei a noite de volta.',
    3: 'Já preencho o horário com outra coisa útil.',
    7: 'Chamo outra pessoa ou invento outro programa.',
}, dominio='amizade', eixo='paixao'))

F1.append(i9('f1_10', 'É sábado à noite, você está em casa e não recebeu nenhum convite. Como é isso para você?', {
    5: 'Ótimo. É quando eu recupero a energia.',
    9: 'Tranquilo. Ponho uma série, como alguma coisa e a noite passa.',
    7: 'Começo a procurar o que fazer. Ficar parado me incomoda.',
    2: 'Me pego olhando o celular, esperando alguém lembrar de mim.',
    4: 'Bate aquela sensação de que a vida acontece mais para os outros.',
    6: 'Fico bem, mas se ninguém chamou, começo a me perguntar por quê.',
    3: 'Aproveito para adiantar alguma coisa. Sábado à toa é tempo perdido.',
    1: 'Uso para organizar o que está pendente em casa.',
    8: 'Se eu quiser companhia, eu chamo. Não fico esperando.',
}, eixo='paixao'))

F1.append(i9('f1_11', 'Numa reunião, alguém critica seu trabalho na frente dos outros. O que acontece primeiro dentro de você?', {
    3: 'Penso em como recuperar a imagem ali mesmo.',
    8: 'Sobe uma quentura e vontade de responder na hora.',
    1: 'Checo se a crítica é justa, e se não for, me indigno.',
    4: 'Sinto vergonha e aquilo dói mais do que deveria.',
    6: 'Desconfio da intenção da pessoa e de quem mais está do lado dela.',
    2: 'Me magoo por não reconhecerem tudo o que eu faço.',
    9: 'Fico meio anestesiado. Só percebo depois o quanto me incomodou.',
    5: 'Me fecho e respondo o mínimo. Depois penso sozinho.',
    7: 'Levo na leveza, faço uma piada e sigo.',
}, dominio='trabalho', eixo='paixao'))

F1.append(i9('f1_12', 'Você chega a uma festa onde conhece pouca gente. O que você faz nos primeiros vinte minutos?', {
    7: 'Circulo, converso com todo mundo e já estou animando alguém.',
    2: 'Procuro alguém para conversar e logo estou cuidando de alguma pessoa.',
    5: 'Fico em um canto, observando, com bebida na mão.',
    9: 'Acompanho quem me levou e vou no ritmo do grupo.',
    3: 'Procuro as pessoas que valem a pena conhecer e me apresento bem.',
    6: 'Demoro a relaxar, leio o ambiente antes de me soltar.',
    8: 'Chego junto, puxo assunto e o clima me segue.',
    4: 'Fico meio à margem, com a sensação de não pertencer àquilo.',
    1: 'Reparo em como as coisas estão organizadas e demoro a entrar no clima.',
}, dominio='amizade'))

F1.append(i9('f1_13', 'Alguém importante para você some por uma semana, sem explicação. O que se passa?', {
    4: 'Já penso que fiz algo errado ou que a pessoa se cansou de mim.',
    6: 'Fico remoendo o que pode ter acontecido e se ainda posso confiar.',
    2: 'Fico magoado e espero que a pessoa perceba a falta que eu faço.',
    8: 'Cobro direto quando aparecer. Ou corto, se me sentir desrespeitado.',
    9: 'Levo numa boa. Cada um tem o seu tempo.',
    1: 'Acho falta de consideração, mesmo entendendo que pode ter motivo.',
    5: 'Não estranho. Eu mesmo sumo às vezes.',
    3: 'Me ocupo e sigo. Quando voltar, a gente resolve.',
    7: 'Sigo minha vida, que está cheia de coisas boas.',
}, dominio='romance', eixo='paixao'))

F1.append(i9('f1_14', 'Você recebe um dinheiro inesperado, o suficiente para um mês de despesas. O que você faz com ele?', {
    5: 'Guardo quase tudo. Dinheiro parado é liberdade.',
    6: 'Coloco na reserva de emergência. É para isso que serve.',
    7: 'Já penso numa viagem ou em algo que eu queria há tempos.',
    2: 'Uso boa parte com as pessoas de quem gosto, dando presentes ou pagando algo.',
    3: 'Invisto em algo que me faça crescer: curso, aparência, equipamento.',
    1: 'Pago o que está pendente e faço o mais correto com o resto.',
    8: 'Gasto com o que eu quero, e quero agora.',
    9: 'Deixo na conta e vou usando no conforto do dia a dia, sem plano.',
    4: 'Compro algo bonito e com significado, que tenha a minha cara.',
}))

F1_DES = [
    item('f1d_ie', 1, 'Você acabou de brigar com alguém. Vinte minutos depois, o que ainda está vivo em você?', [
        ('I', 'O corpo: tensão, calor, vontade de resolver ou de sair andando.'),
        ('E', 'A cena: o que a pessoa pensou de mim, como eu apareci ali.'),
    ], eixo='fixacao', peso=1.3, separa=['instintiva', 'emocional']),
    item('f1d_im', 1, 'Você precisa decidir hoje algo importante e não tem toda a informação. O que você faz?', [
        ('I', 'Decido com o que tenho e lido com as consequências depois.'),
        ('M', 'Adio o quanto der, procurando mais informação ou alguém que confirme.'),
    ], eixo='fixacao', peso=1.3, separa=['instintiva', 'mental']),
    item('f1d_em', 1, 'Numa noite ruim, o que costuma tirar seu sono?', [
        ('E', 'Uma conversa, um olhar, alguém que me magoou ou me desvalorizou.'),
        ('M', 'Uma pendência, um risco, algo que pode dar errado amanhã.'),
    ], eixo='fixacao', peso=1.3, separa=['emocional', 'mental']),
]
_TRI = {'I': 'instintiva', 'E': 'emocional', 'M': 'mental'}
for it, pares in zip(F1_DES, [['I', 'E'], ['I', 'M'], ['E', 'M']]):
    for a, k in zip([x for x in it['alternativas'] if not x.get('nula')], pares):
        a['mapa'] = {"triade": _TRI[k], "tipo": None, "instinto": None}


# ===========================================================================
# FASE 2 — cenas dentro da triade, 2 alternativas por tipo
# ===========================================================================
def f2(id_, cen, pares, **kw):
    alts = []
    for t, p, c in pares:
        alts.append((t, p, 'p'))
        alts.append((t, c, 'c'))
    return item(id_, 2, cen, alts, **kw)


FIX = dict(eixo='fixacao', peso=1.5)
EMO = dict(eixo='emocao', peso=1.0)
PAI = dict(eixo='paixao', peso=1.0)

INST = [
    f2('f2i_01', 'Um colega quebra, pela segunda vez, um combinado que tinha com você. O que você faz?', [
        (8, 'Falo na hora e deixo claro que não vai ter uma terceira.',
            'Não discuto mais. A pessoa perde o acesso a mim e sente isso.'),
        (9, 'Deixo passar de novo, mas vai ficando um incômodo que uma hora escapa.',
            'Não falo nada e passo a fazer do meu jeito, sem avisar.'),
        (1, 'Explico qual era o combinado e por que aquilo não está certo.',
            'Falo na hora, com dureza, porque aquilo é inaceitável.'),
    ], dominio='trabalho', **PAI),
    f2('f2i_02', 'Alguém tratou você mal ontem. Hoje de manhã, qual pensamento aparece?', [
        (8, '“Ele vai me pagar de algum jeito.”', '“Comigo não. Já sabe o que vai acontecer se repetir.”'),
        (9, '“Já passou, não vou remoer isso.”', '“Ele deve estar passando por alguma coisa.”'),
        (1, '“Eu jamais trataria alguém assim.”', '“Isso está errado e eu não vou deixar barato.”'),
    ], **FIX),
    f2('f2i_03', 'Uma regra no trabalho está atrapalhando algo que você precisa entregar. O que você faz?', [
        (8, 'Passo por cima e assumo as consequências.',
            'Enfrento quem criou a regra, principalmente se ela estiver prejudicando a minha equipe.'),
        (9, 'Me acomodo e dou um jeito de conviver com ela.',
            'Não discuto, mas vou empurrando com a barriga até ninguém cobrar.'),
        (1, 'Contesto pelos canais certos e proponho uma regra melhor.',
            'Reclamo alto, porque uma regra injusta não deveria existir.'),
    ], dominio='trabalho', **FIX),
    f2('f2i_04', 'Você ficou muito bravo esta semana. Como foi?', [
        (8, 'Explodi, resolvi na hora e depois já tinha passado.',
            'Não explodi, mas deixei claríssimo quem mandava ali.'),
        (9, 'Nem lembro de ter ficado bravo. Deve ter passado sozinho.',
            'Engoli na hora e depois saiu de uma vez, meio desproporcional.'),
        (1, 'Segurei, fiquei tenso e virou crítica, ironia ou dor de cabeça.',
            'Falei o que tinha que falar, com indignação, porque eu tinha razão.'),
    ], **PAI),
    f2('f2i_05', 'Na sua casa, quando você era criança, como funcionava a autoridade?', [
        (8, 'Era dura, e cedo aprendi a revidar ou a me virar sozinho.',
            'Alguém precisava proteger os mais fracos da casa, e sobrou para mim.'),
        (9, 'Decidiam por mim, e era mais fácil concordar do que discutir.',
            'Cada um na sua. Eu fazia o meu e não me metia.'),
        (1, 'Muita exigência e crítica. Eu tinha que ser o certinho.',
            'Tinha regra para tudo, e eu era o primeiro a cobrar que cumprissem.'),
    ], dominio='familia', eixo='fixacao', peso=1.5),
    f2('f2i_06', 'Em uma discussão de família que esquenta, o que você faz?', [
        (8, 'Aumento o tom e tomo a frente.', 'Entro na frente de quem está sendo atacado.'),
        (9, 'Concordo com todos e me desligo até passar.', 'Tento acalmar e reconciliar os lados.'),
        (1, 'Mantenho a compostura e aponto quem está certo e quem está errado.',
            'Me exalto defendendo o que é certo, e depois me culpo por ter perdido a linha.'),
    ], dominio='familia', gemeo='gemeo_conflito_intensidade', **EMO),
    f2('f2i_12', 'Em um conflito no trabalho, com gente olhando, o que você faz?', [
        (8, 'Enfrento na frente de todos e imponho a minha posição.',
            'Defendo a minha equipe e deixo claro que quem mexer com ela lida comigo.'),
        (9, 'Cedo e busco um consenso para desfazer o atrito.',
            'Fico quieto ali e continuo fazendo do meu jeito depois.'),
        (1, 'Mantenho a compostura e defendo o procedimento correto.',
            'Aponto o erro na frente de todos, porque aquilo não pode passar.'),
    ], dominio='trabalho', gemeo='gemeo_conflito_intensidade', **EMO),
    f2('f2i_07', 'Alguém próximo comenta: “às vezes você é difícil.” Com o que você concorda?', [
        (8, 'Sou duro demais e magoo antes de perceber.', 'Não mostro fragilidade nem para quem eu amo.'),
        (9, 'Me acomodo e deixo de lado o que eu quero.', 'Sumo do que é chato até o prazo estourar.'),
        (1, 'Sou exigente demais, comigo e com os outros.', 'Fico intolerante quando as coisas não são feitas direito.'),
    ], desej=True, desejavel_tipo=1, eixo='fixacao', peso=1.3),
    f2('f2i_13', 'Você falou uma grosseria com alguém que não merecia. O que acontece depois?', [
        (8, 'Viro a página. Não fico me culpando.', 'Se a pessoa provocou, não sinto muita coisa.'),
        (9, 'Fico incomodado com o clima ruim e quero a paz de volta.', 'Ajo como se não tivesse acontecido.'),
        (1, 'Sinto culpa pesada, porque eu deveria ter me controlado.',
            'Acho que eu tinha razão, mas me cobro por ter perdido a linha.'),
    ], **FIX),
    f2('f2i_08', 'Uma injustiça que você sofreu há anos volta à sua cabeça. O que vem junto?', [
        (8, 'Vontade de acertar essa conta um dia.', 'A lição de nunca mais ficar vulnerável assim.'),
        (9, 'Quase nada. Já faz tempo e não quero mexer nisso.', 'Penso que, no fundo, não foi tão grave.'),
        (1, 'Indignação. Aquilo foi errado e alguém precisa reconhecer.',
            'Um ressentimento calado, que eu nunca falei para ninguém.'),
    ], **FIX),
    f2('f2i_09', 'Um amigo vai apresentar você a alguém que ainda não sabe nada a seu respeito. O que ele provavelmente diz?', [
        (8, 'Que sou intenso e bom de ter por perto na hora difícil.', 'Que sou direto e não aceito desrespeito.'),
        (9, 'Que sou tranquilo e fácil de conviver.', 'Que sou teimoso: concordo e faço do meu jeito.'),
        (1, 'Que sou confiável e faço as coisas direito.', 'Que sou exigente e brigo pelo que acredito.'),
    ], dominio='amizade', **EMO, opcional=True),
    f2('f2i_10', 'Você acabou de receber uma notícia que mexeu muito com você. O que você faz na hora seguinte?', [
        (8, 'Ajo. Ligo, resolvo, mexo em alguma coisa.', 'Saio, bebo, treino, trabalho dobrado. Preciso descarregar.'),
        (9, 'Como alguma coisa, ligo a TV, deixo o tempo passar.', 'Sigo a rotina como se nada tivesse acontecido.'),
        (1, 'Transformo em tarefa: organizo, resolvo o que dá.', 'Canalizo para algo útil ou para uma causa.'),
    ], **PAI),
    f2('f2i_11', 'Alguém que você ama diz que você o sufoca. Qual crítica chega mais perto?', [
        (8, 'Eu confundo proteger com mandar.', 'Eu quero a pessoa só para mim e me entrego pouco.'),
        (9, 'Eu me adapto tanto que some o que eu queria.', 'Eu fujo da conversa difícil e deixo arrastar.'),
        (1, 'Eu fico querendo melhorar o outro.', 'Eu cobro demais como a pessoa deveria se comportar.'),
    ], dominio='romance', **FIX),
    f2('f2i_14', 'Sobre prazer e exagero: qual cena é mais a sua?', [
        (8, 'Quando eu quero, eu vou com tudo, e não gosto que me segurem.', 'Odeio esperar pelo que eu quero.'),
        (9, 'Conforto pequeno todo dia: comida, sofá, série, e o tempo passa.',
            'Adio o que eu quero, mas a minha rotina ninguém tira.'),
        (1, 'Só depois que tudo estiver feito, e mesmo assim me policio.', 'Exagerei uma vez e fiquei com a sensação de ter feito algo errado.'),
    ], **PAI),

    # --- v4: clusters de Caráter e neurose que faltavam --------------------
    f2('f2i_15', 'Um grupo precisa decidir algo e ninguém decide. O que você faz?', [
        (8, 'Decido e toco. Depois a gente ajusta o que estiver errado.',
            'Distribuo as tarefas e digo quem faz o quê.'),
        (9, 'Espero alguém decidir e concordo com o que a maioria quiser.',
            'Vou levando. Uma hora a decisão se resolve sozinha.'),
        (1, 'Proponho o jeito certo de fazer e explico por que é o melhor.',
            'Assumo, porque sei que faço melhor do que sairia de outro jeito.'),
    ], dominio='trabalho', eixo='fixacao', peso=1.5),
    f2('f2i_16', 'Alguém chora na sua frente, numa situação difícil. O que acontece com você?', [
        (8, 'Fico incomodado com a fragilidade e quero que a pessoa reaja.',
            'Vou direto para o que resolve. Chorar não muda o problema.'),
        (9, 'Fico junto, sem saber bem o que dizer, esperando passar.',
            'Sinto a dor dela como se fosse minha e esqueço a minha.'),
        (1, 'Acolho, mas por dentro acho que ela precisa se recompor.',
            'Penso no que ela poderia ter feito para não chegar até ali.'),
    ], **EMO),
    f2('f2i_17', 'Como costuma ser o seu sábado?', [
        (8, 'Cada sábado é diferente, do jeito que der vontade. Odeio agenda no fim de semana.',
            'Puxo alguém para alguma coisa, e costuma ir longe.'),
        (9, 'Quase sempre igual, e eu gosto assim.',
            'Começo várias coisas e termino no sofá.'),
        (1, 'Tenho uma lista e cumpro.',
            'Aproveito para arrumar o que ficou torto durante a semana.'),
    ], **PAI),
]

EMOC = [
    f2('f2e_01', 'Um dia você se sente bem consigo mesmo. O que costuma ter acontecido?', [
        (2, 'Alguém me procurou porque precisava de mim.', 'Alguém me tratou como especial, me paparicou.'),
        (3, 'Entreguei algo bem feito e reconheceram.', 'Resolvi tudo sozinho, sem precisar de ninguém.'),
        (4, 'Vivi algo verdadeiro, meu, que ninguém mais viveria igual.', 'Aguentei um dia pesado sem reclamar e dei conta.'),
    ], **FIX),
    f2('f2e_02', 'Qual destas frases, dita por alguém importante, mais estragaria o seu dia?', [
        (2, '“Eu não preciso de você.”', '“Você não é tão importante para mim quanto pensa.”'),
        (3, '“Você fracassou e decepcionou todo mundo.”', '“Não dá para contar com você.”'),
        (4, '“Você é comum, igual a todo mundo.”', '“Eu prefiro outra pessoa a você.”'),
    ], **EMO, opcional=True),
    f2('f2e_03', 'Você está muito triste e alguém toca no assunto. O que você faz?', [
        (2, 'Viro a conversa para a pessoa e acabo cuidando dela.', 'Deixo escapar um pouco, esperando que insistam e cuidem de mim.'),
        (3, 'Digo que está tudo bem e sigo funcionando.', 'Desconverso e volto para o trabalho.'),
        (4, 'Falo e vai fundo. Choro, se for o caso.', 'Corto o assunto. Reclamar é fraqueza, eu aguento.'),
    ], **FIX),
    f2('f2e_04', 'Você vai encontrar pessoas que ainda não conhecem você. O que você faz antes de sair de casa?', [
        (2, 'Penso em como vou recebê-las, o que levar, como deixá-las à vontade.',
            'Escolho algo que me deixe encantador, do jeito que costuma funcionar.'),
        (3, 'Cuido para estar apresentável e penso no que vou dizer sobre o que eu faço.',
            'Não me produzo muito. Prefiro que notem que sou competente, não que sou vaidoso.'),
        (4, 'Escolho algo com a minha cara, mesmo que destoe dos outros.',
            'Não penso muito nisso, e ainda acho meio fútil quem pensa.'),
    ], **EMO),
    f2('f2e_05', 'Você entregou um trabalho e não era o que esperavam. O que vem primeiro?', [
        (2, 'Medo de que gostem menos de mim.', 'Indignação: depois de tudo que eu faço, ainda cobram?'),
        (3, 'Pressa de consertar e mostrar que dou conta.', 'Vontade de trabalhar o dobro, calado, até ninguém ter o que dizer.'),
        (4, 'A confirmação amarga de que eu nunca sou suficiente.', 'Revolta: ninguém viu o quanto aquilo me custou.'),
    ], dominio='trabalho', **EMO),
    f2('f2e_06', 'Você passou a noite ajudando um amigo com um problema. Ele agradece de leve e muda de assunto. O que fica?', [
        (2, 'Uma mágoa. Eu teria feito muito mais por ele.', 'Fico esperando a retribuição, sem nunca cobrar em voz alta.'),
        (3, 'Nada demais. Eu resolvi, e isso já vale.', 'Fico satisfeito por ter sido útil, mesmo sem aplauso.'),
        (4, 'Uma sensação de que com os outros ele seria mais caloroso.', 'Nada. Eu não ajudo esperando retorno, e me orgulho disso.'),
    ], dominio='amizade', desej=True, desejavel_tipo=3, eixo='fixacao', peso=1.3),
    f2('f2e_07', 'Você está numa roda e alguém conta uma conquista grande. O que mexe com você?', [
        (2, 'O carinho que a pessoa recebe, que eu também queria e não peço.', 'Ela ocupar o lugar de destaque que costuma ser meu.'),
        (3, 'O reconhecimento. É o que eu busco também.', 'Ver alguém menos competente sendo mais valorizado.'),
        (4, 'A pessoa parecer inteira e em paz, coisa que eu nunca senti.', 'Ela ter conseguido fácil o que a mim custou muito.'),
    ], indireto=True, **FIX),
    f2('f2e_12', 'Qual gesto de alguém faz você se sentir realmente querido?', [
        (2, 'Me procurar quando precisa. Ver que faço falta.', 'Me tratar como a pessoa preferida, acima das outras.'),
        (3, 'Ter orgulho de mim na frente dos outros.', 'Reconhecer tudo o que eu faço e o quanto dá para contar comigo.'),
        (4, 'Me entender de um jeito que ninguém mais entende.', 'Cuidar de mim sem eu precisar pedir.'),
    ], dominio='romance', **FIX),
    f2('f2e_08', 'Em um relacionamento, o que você mais tem medo que aconteça?', [
        (2, 'A pessoa descobrir que consegue viver bem sem mim.', 'Deixar de ser a prioridade dela.'),
        (3, 'A pessoa deixar de me admirar.', 'A pessoa ver que eu não sou tão seguro quanto pareço.'),
        (4, 'A pessoa nunca chegar a me conhecer de verdade.', 'Ela se interessar por outra pessoa mais do que por mim.'),
    ], dominio='romance', **EMO),
    f2('f2e_09', 'Uma relação sua acabou mal. Olhando para trás, qual foi a sua parte?', [
        (2, 'Dei demais e esperei retribuição sem nunca pedir.', 'Conquistei e depois exigi dedicação total.'),
        (3, 'Cuidei mais da imagem do casal do que da relação.', 'Virei o que o outro queria e me perdi no caminho.'),
        (4, 'Desvalorizei o que estava ali e quis o que faltava.', 'Transformei a relação em disputa, entre amor e raiva.'),
    ], dominio='romance', **FIX),
    f2('f2e_10', 'Você acorda no domingo sem nada marcado e sem ninguém por perto. Como é a primeira hora?', [
        (2, 'Já estou mandando mensagem para alguém.', 'Me incomoda que ninguém tenha lembrado de mim.'),
        (3, 'Faço uma lista e começo a adiantar coisas.', 'Arrumo a casa, resolvo pendências, não consigo ficar parado.'),
        (4, 'Bate uma melancolia e fico nela um tempo.', 'Levanto e vou trabalhar em algo, porque parar dói mais.'),
    ], **EMO),
    f2('f2e_11', 'Qual destes elogios você lembraria anos depois?', [
        (2, '“Não sei o que seria de mim sem você.”', '“Você é a pessoa mais encantadora que eu conheço.”'),
        (3, '“Você é impressionante no que faz.”', '“Com você tudo funciona.”'),
        (4, '“Nunca conheci ninguém como você.”', '“Admiro sua força por tudo o que você passou.”'),
    ], **FIX, opcional=True),
    f2('f2e_13', 'Uma pessoa próxima conseguiu exatamente o que você queria. O que acontece por dentro?', [
        (2, 'Fico feliz e, no fundo, torço para que ela continue precisando de mim.',
            'Sinto que eu também merecia, e espero que alguém note.'),
        (3, 'Acelero para mostrar que eu também consigo.', 'Minimizo e sigo no meu trabalho, sem deixar transparecer.'),
        (4, 'Dói, porque parece que para os outros é mais fácil.',
            'Vira gás para eu me esforçar mais, ou vontade de diminuir a conquista dela.'),
    ], **PAI),
    f2('f2e_14', 'Na sua casa, quando criança, o que fazia um adulto olhar para você com orgulho?', [
        (2, 'Eu ser carinhoso, prestativo, o queridinho.', 'Eu ser encantador com as visitas.'),
        (3, 'Eu ir bem: nota, prêmio, resultado.', 'Eu resolver as coisas sozinho, sem dar trabalho.'),
        (4, 'Quase nada. Eu sentia que outro filho recebia esse olhar.', 'Eu aguentar firme e ajudar, mesmo criança.'),
    ], dominio='familia', eixo='fixacao', peso=1.5),

    # --- v4 ----------------------------------------------------------------
    f2('f2e_15', 'Numa conversa, alguém pergunta sobre um assunto que você domina pouco. O que você faz?', [
        (2, 'Puxo para uma história minha e a mesa vai junto.',
            'Digo que não sei, mas encanto de outro jeito.'),
        (3, 'Falo com segurança mesmo assim. Depois eu corro atrás.',
            'Desvio para a parte que eu domino, e ninguém percebe.'),
        (4, 'Admito, mas me incomoda que os outros saibam mais do que eu.',
            'Deixo claro que aquele assunto é raso e não me interessa.'),
    ], **FIX),
    f2('f2e_16', 'Alguém pergunta como você está se sentindo de verdade. O que acontece?', [
        (2, 'Falo do que eu sinto pelos outros antes de falar de mim.',
            'Já me emociono, e a conversa toda vira isso.'),
        (3, 'Respondo que estou bem quase no automático, e depois levo um tempo para saber o que eu sinto.',
            'Falo do que estou fazendo, não do que estou sentindo.'),
        (4, 'Falo, e vai fundo. Isso importa mais do que o resto.',
            'Mudo de assunto. Falar disso me expõe demais.'),
    ], **FIX),
    f2('f2e_17', 'Você contou uma história para um grupo ontem. Como foi?', [
        (2, 'Coloquei emoção e gesto, e a mesa acompanhou.',
            'Exagerei um pouco para a história ficar melhor.'),
        (3, 'Contei do jeito que funciona. Já sei o efeito que faz.',
            'Fui direto ao ponto, sem floreio.'),
        (4, 'Contei o que aquilo significou para mim.',
            'Quase não falei. Achei que ninguém fosse se interessar.'),
    ], dominio='amizade', **EMO),
]

MENT = [
    f2('f2m_01', 'Você está inseguro com uma decisão importante e ela não sai da sua cabeça. O que você faz?', [
        (5, 'Me recolho e resolvo sozinho, no meu tempo.', 'Falo com aquela única pessoa em quem confio de verdade.'),
        (6, 'Peço opinião de alguém confiável e mesmo assim continuo em dúvida.',
            'Tomo a decisão na marra, para não ficar refém da dúvida.'),
        (7, 'Deixo as opções em aberto e vou tocando o que é mais leve.',
            'Me ocupo ajudando outra pessoa e adio a minha decisão.'),
    ], **FIX),
    f2('f2m_02', 'O que faz você querer cancelar um compromisso que já assumiu?', [
        (5, 'Saber que vai consumir a minha energia e o meu tempo.', 'Sentir que vão exigir uma intimidade que eu não quero dar.'),
        (6, 'Não saber direito com quem estarei nem o que vai acontecer.', 'Sentir que alguém ali quer me testar ou me controlar.'),
        (7, 'Aparecer algo mais interessante.', 'Perceber que era eu me doando de novo e ninguém notando.'),
    ], **EMO, opcional=True),
    f2('f2m_03', 'Você quer muito uma coisa (viajar, mudar de emprego, se declarar). O que acontece?', [
        (5, 'Convenço-me de que posso viver sem.', 'Fico desejando em silêncio, e quase ninguém fica sabendo.'),
        (6, 'Fico pesando riscos e adiando.', 'Às vezes vou com tudo de uma vez, para não me deixar paralisar.'),
        (7, 'Vou atrás. Adiar prazer é desperdício.', 'Seguro em nome de algo maior e fico com a sensação de estar perdendo a vida.'),
    ], **FIX),
    f2('f2m_04', 'Seu chefe novo ainda não é alguém que você conhece. Como você age nos primeiros meses?', [
        (5, 'Mantenho distância, entrego o combinado e preservo o meu espaço.', 'Só respeito de verdade se ele souber mais do que eu.'),
        (6, 'Fico oscilando entre confiar e desconfiar dele.', 'Testo os limites dele desde cedo.'),
        (7, 'Não levo tão a sério e sigo fazendo do meu jeito.', 'Sou prestativo e agradável, mas não aceito ninguém acima de mim.'),
    ], dominio='trabalho', **EMO),
    f2('f2m_05', 'Na sua casa, quando criança, o que dava segurança (ou o que faltava)?', [
        (5, 'Eu tinha pouco espaço só meu, e sumir era a minha saída.', 'Eu preferia entender as pessoas de longe a lidar com elas.'),
        (6, 'O clima mudava conforme o humor de alguém, e eu vivia atento.', 'Eu sentia que precisava ser forte, porque não dava para contar com ninguém.'),
        (7, 'Faltou coisa, e eu aprendi cedo a me virar e a me divertir com pouco.',
            'Eu era o que animava todo mundo quando a coisa apertava.'),
    ], dominio='familia', eixo='fixacao', peso=1.5),
    f2('f2m_06', 'Um amigo antigo faz um brinde a você e fala de uma qualidade sua. Qual destas faria você pensar que ele conhece você de verdade?', [
        (5, 'Que você precisa de pouquíssimo e nunca pede nada a ninguém.', 'Que você pensa por conta própria e não segue a manada.'),
        (6, 'Que você é leal e sempre cumpre o que promete.', 'Que você não se intimida com ninguém.'),
        (7, 'Que você aproveita a vida e vê o lado bom de tudo.', 'Que você se dedica aos outros sem esperar nada em troca.'),
    ], desej=True, desejavel_tipo=6, eixo='fixacao', peso=1.3),
    f2('f2m_07', 'Você recebeu uma notícia ruim de saúde na família. Como fica a sua semana?', [
        (5, 'Fico quieto, resolvo o prático e processo sozinho.', 'Me afasto um pouco de todo mundo até dar conta daquilo.'),
        (6, 'Já penso em todos os cenários e no que fazer em cada um.', 'Endureço, assumo o comando e não deixo ninguém ver que me abalou.'),
        (7, 'Puxo o lado bom, faço piada, mantenho o clima leve.', 'Me ocupo cuidando de todo mundo e não paro para sentir.'),
    ], dominio='familia', **FIX),
    f2('f2m_12', 'Alguém conta a você uma versão de uma história que não fecha. O que você faz?', [
        (5, 'Guardo a dúvida e vou juntando informação sozinho.', 'Estudo o assunto até entender melhor do que a maioria.'),
        (6, 'Procuro alguém confiável para saber em qual versão acreditar.', 'Confronto a pessoa até a explicação se sustentar.'),
        (7, 'Fico com a versão mais leve e sigo em frente.', 'Encaixo aquilo numa ideia maior que faça sentido.'),
    ], **FIX),
    f2('f2m_08', 'Um amigo vai apresentar você a alguém que ainda não sabe nada a seu respeito. O que ele diz?', [
        (5, 'Que sou reservado e difícil de conhecer por completo.', 'Que sou fechado, mas intenso com quem entra.'),
        (6, 'Que sou leal e levo tudo a sério.', 'Que sou firme e não baixo a guarda.'),
        (7, 'Que sou animado e cheio de ideias.', 'Que sou prestativo e idealista.'),
    ], dominio='amizade', **EMO, opcional=True),
    f2('f2m_09', 'A pessoa com quem você está quer mais proximidade do que você. O que você faz?', [
        (5, 'Recuo e guardo um espaço onde ninguém entra.', 'Exijo transparência total e me fecho se ela quebrar isso.'),
        (6, 'Testo a lealdade dela e procuro sinais de que vou me machucar.', 'Mantenho a guarda alta mesmo gostando muito.'),
        (7, 'Busco novidade quando a coisa fica pesada.', 'Me apaixono pela ideia da relação e me frustro com o dia a dia.'),
    ], dominio='romance', **FIX),
    f2('f2m_10', 'Qual cena descreve melhor um dia tranquilo para você?', [
        (5, 'Ninguém me cobrando nada e tempo de sobra.', 'Poucos compromissos e ninguém dependendo de mim.'),
        (6, 'Tudo previsto, contas em dia, nada pendente.', 'Sentir que estou preparado para o que vier.'),
        (7, 'Coisas boas marcadas para a semana.', 'Ver que as pessoas ao meu redor estão bem por algo que eu fiz.'),
    ], **EMO, opcional=True),
    f2('f2m_11', 'Qual destes elogios você lembraria anos depois?', [
        (5, '“Você enxerga o que ninguém enxerga.”', '“Você tem uma mente brilhante.”'),
        (6, '“Você é a pessoa mais confiável que eu conheço.”', '“Você é corajoso, não tem medo de nada.”'),
        (7, '“Do seu lado a vida fica mais leve.”', '“Você é uma pessoa boa, que pensa no coletivo.”'),
    ], **FIX, opcional=True),
    f2('f2m_13', 'Você está sozinho em casa à noite e ouve um barulho estranho. O que faz?', [
        (5, 'Fico parado, escutando, avaliando antes de qualquer coisa.', 'Tranco tudo e volto para o meu canto.'),
        (6, 'Já imagino o pior e checo porta, janela, tudo.', 'Pego algo na mão e vou olhar de frente.'),
        (7, 'Deve ser o vento. Volto para o que eu estava fazendo.', 'Racionalizo rápido e me convenço de que não é nada.'),
    ], **PAI),

    # --- v4 ----------------------------------------------------------------
    f2('f2m_14', 'Alguém cobra uma coisa que você não entregou. O que acontece?', [
        (5, 'Por fora concordo, por dentro resisto a estar sendo cobrado.',
            'Fico com uma culpa que não mostro para ninguém.'),
        (6, 'Me acuso primeiro, e logo depois acho que do outro lado também houve falha.',
            'Explico os motivos ponto a ponto e me defendo.'),
        (7, 'Prometo para já e dou um jeito de sair bem da situação.',
            'Minimizo. No fundo não era tão importante assim.'),
    ], dominio='trabalho', **FIX),
    f2('f2m_15', 'Você ficou duas horas sozinho, sem obrigação nenhuma. Para onde foi a sua cabeça?', [
        (5, 'Para um assunto que eu quero entender a fundo.',
            'Para organizar o que eu já sei, sem precisar contar a ninguém.'),
        (6, 'Para uma teoria sobre como as coisas realmente funcionam.',
            'Para um problema que eu preciso resolver antes que vire problema.'),
        (7, 'Para planos: viagem, projeto, possibilidades.',
            'Para uma ideia nova que eu já quero contar para alguém.'),
    ], **FIX),
    f2('f2m_16', 'Um conhecido pede um favor grande, que vai tomar o seu fim de semana. O que você faz?', [
        (5, 'Invento uma desculpa. O meu tempo é meu.',
            'Faço, mas contando os minutos, e não me ofereço de novo.'),
        (6, 'Faço, porque eu disse que faria e não volto atrás.',
            'Faço, mas fico pensando no que ele vai querer depois.'),
        (7, 'Faço se for divertido. Se não, empurro para outra pessoa.',
            'Prometo na hora e depois vejo como sair disso.'),
    ], **EMO),
]

DES_INST = [
    item('f2id_89', 2, 'Um conhecido diz de outra pessoa: “ela some quando a conversa fica tensa”. O que você pensa?', [
        (8, 'Que é fraqueza. Eu encararia.'),
        (9, 'Que às vezes sair de perto é o mais sensato.'),
    ], eixo='fixacao', peso=1.4, separa=[8, 9], indireto=True),
    item('f2id_91', 2, 'Você vê um serviço malfeito na sua rua (um buraco, uma pintura torta). O que acontece?', [
        (9, 'Reparo e sigo. Não é problema meu.'),
        (1, 'Fico incomodado até alguém consertar. Aquilo está errado.'),
    ], eixo='fixacao', peso=1.4, separa=[9, 1]),
    item('f2id_81', 2, 'Você está com pressa e a placa diz para não estacionar ali. O que você faz?', [
        (8, 'Estaciono. Se der multa, eu pago.'),
        (1, 'Não estaciono, mesmo sem ninguém vendo. Ficaria mal comigo.'),
    ], eixo='fixacao', peso=1.4, separa=[8, 1]),
]
DES_EMOC = [
    item('f2ed_23', 2, 'Você fez algo muito bem feito e ninguém percebeu. O que incomoda mais?', [
        (2, 'Ninguém ter visto o quanto eu me dediquei àquelas pessoas.'),
        (3, 'O resultado não ter sido reconhecido como meu.'),
    ], eixo='fixacao', peso=1.4, separa=[2, 3]),
    item('f2ed_34', 2, 'Você se olha no espelho num dia comum. O que costuma vir?', [
        (3, 'Em geral, gosto do que vejo, e o que não está bom eu ajeito.'),
        (4, 'Vejo primeiro o que falta, e isso parece mais fundo do que aparência.'),
    ], eixo='fixacao', peso=1.4, separa=[3, 4]),
    item('f2ed_24', 2, 'Você está carente e alguém pergunta se está tudo bem. O que você faz?', [
        (2, 'Digo que sim e desvio cuidando da pessoa.'),
        (4, 'Ou falo e vai fundo, ou endureço e digo que não preciso de nada.'),
    ], eixo='fixacao', peso=1.4, separa=[2, 4]),
]
DES_MENT = [
    item('f2md_56', 2, 'Chegou uma conta alta e inesperada. Qual é o seu primeiro movimento?', [
        (5, 'Corto gastos e passo a precisar de menos.'),
        (6, 'Checo tudo, ligo, confirmo, procuro garantia.'),
    ], eixo='fixacao', peso=1.4, separa=[5, 6]),
    item('f2md_67', 2, 'Você vai fazer algo de que tem medo (falar em público, uma consulta, uma conversa dura). O que faz?', [
        (6, 'Me preparo demais, checo tudo, ou parto para cima antes que o medo cresça.'),
        (7, 'Penso em outra coisa até a hora e levo na leveza.'),
    ], eixo='fixacao', peso=1.4, separa=[6, 7]),
    item('f2md_57', 2, 'Você está mal e precisaria de companhia. O que acontece?', [
        (5, 'Não chamo ninguém. Resolvo sozinho.'),
        (7, 'Chamo várias pessoas, ou saio, para não ficar naquilo.'),
    ], eixo='fixacao', peso=1.4, separa=[5, 7]),
]


# ===========================================================================
# FASE 2 CRUZADA — pares de tipos de triades diferentes
# ===========================================================================
def cz(id_, a, b, cen, ta, tb, **kw):
    return item(id_, 2, cen, [(a, ta), (b, tb)], eixo='fixacao', peso=1.4, separa=[a, b], **kw)


CRUZ = [
    cz('fx_86a', 8, 6, 'Você acabou de bater de frente com alguém, em voz alta. Cinco minutos depois:',
       'Já passou. Fiz o que tinha que fazer e sigo, sem culpa.',
       'Fico repassando: se exagerei, se vão revidar, se eu tinha mesmo razão.'),
    cz('fx_86b', 8, 6, 'Antes de encarar uma situação difícil, o que acontece no seu corpo?',
       'Nada de especial. Eu vou, porque quero e posso.',
       'Tem uma tensão antes, que eu não mostro para ninguém, e é contra ela que eu vou.'),
    cz('fx_86c', 8, 6, 'Alguém prejudicou você de verdade. Seis meses depois, o que você fez a respeito?',
       'Devolvi de algum jeito. Não ficou só na vontade.',
       'Imaginei várias vezes como revidar, mas na prática ficou na cabeça.'),
    cz('fx_86d', 8, 6, 'Chega um chefe novo, com fama de durão. Como você age na primeira semana?',
       'Testo na prática: faço do meu jeito e vejo se ele vem.',
       'Observo tudo: se ele é coerente, se cumpre o que diz, de quem ele é amigo.'),
    cz('fx_84a', 8, 4, 'Você está brigando por algo que considera seu por direito. O que move a briga?',
       'Eu quero, então vou buscar. Não fico me comparando com ninguém.',
       'A injustiça de ter recebido menos, e a dor de não ser reconhecido.'),
    cz('fx_84b', 8, 4, 'Você explodiu com alguém que ama. Como você está no dia seguinte?',
       'Normal. A pessoa provocou, não fico me torturando.',
       'Oscilando entre a raiva e a culpa, me sentindo o monstro da história.'),
    cz('fx_84c', 8, 4, 'Você está sobrecarregado e não pede ajuda. Por quê?',
       'Porque eu dou conta e não gosto de dever nada a ninguém.',
       'Porque ninguém ia dar mesmo, e aguentar calado é a prova de que eu valho.'),
    cz('fx_84d', 8, 4, 'Alguém do seu meio conquistou algo que você também queria. E aí?',
       'Se eu quiser, vou atrás. Não gasto energia olhando para ele.',
       'Mexe comigo: dá tristeza, vontade de superar, ou vontade de diminuir a conquista.'),
    cz('fx_82a', 8, 2, 'Você ajudou muito alguém e essa pessoa não reconheceu. O que fica?',
       'Nada. Eu protejo os meus, não faço por agradecimento.',
       'Mágoa. Eu queria ser insubstituível para ela.'),
    cz('fx_82b', 8, 2, 'Você quer muito uma pessoa. Como você age?',
       'Vou direto e digo o que quero.',
       'Encanto, fico presente e útil, até ela não conseguir ficar sem mim.'),
    cz('fx_87a', 8, 7, 'Chegou uma notícia pesada. Qual é o seu primeiro movimento?',
       'Encaro de frente. Dor não me assusta.',
       'Encaro se precisar, mas meu impulso é aliviar o clima e pensar em outra coisa.'),
    cz('fx_87b', 8, 7, 'Você está muito empolgado com um projeto. O que nele mais empolga você?',
       'A intensidade e estar no comando.',
       'A novidade. Quando vira rotina, eu perco o interesse.'),
    cz('fx_83a', 8, 3, 'Você está competindo por uma vaga. O que está em jogo?',
       'O poder e não perder o que considero meu. Pouco importa o que vão achar.',
       'Ser visto como o melhor. O reconhecimento é metade da vitória.'),
    cz('fx_83b', 8, 3, 'Você precisa escolher: respeitado ou querido. Qual você escolhe?',
       'Respeitado, mesmo que não gostem de mim.',
       'Bem visto, e ajusto o que for preciso para isso.'),
    cz('fx_13a', 1, 3, 'Você caprichou num trabalho que ninguém vai ver. Por que caprichou?',
       'Porque é o certo. Mesmo sem ninguém ver, eu veria.',
       'Se ninguém vai ver, eu faço o suficiente e uso o tempo no que aparece.'),
    cz('fx_13b', 1, 3, 'Seu trabalho recebeu um elogio público. O que acontece?',
       'Fico bem, mas já vejo o que ainda poderia melhorar.',
       'É alívio e combustível. É para isso que eu me esforço.'),
    cz('fx_16a', 1, 6, 'Você segue uma regra mesmo quando ninguém está vendo. Por quê?',
       'Porque é o certo, e o errado me incomoda.',
       'Porque evita problema e eu não quero correr risco.'),
    cz('fx_16b', 1, 6, 'Você criticou alguém na semana passada. O que estava por trás?',
       'A pessoa fez errado e alguém precisava dizer.',
       'Desconfiança: achei que ela não era confiável ou não dava conta.'),
    cz('fx_14a', 1, 4, 'Você está se cobrando muito. O que a cobrança diz, em palavras?',
       '“Tem um jeito certo e eu preciso cumprir.”',
       '“Sem esforço extra, eu não valho nada.”'),
    cz('fx_14b', 1, 4, 'Você errou feio em algo. O que dói mais?',
       'Ter feito errado.',
       'Ter confirmado que eu não sou tão bom quanto os outros.'),
    cz('fx_17a', 1, 7, 'Você se voluntariou para uma tarefa chata que ninguém queria. Por quê?',
       'Porque é o certo, e me irrita quem não faz a parte dele.',
       'Porque fico bem com os outros e comigo, e nem penso no que isso me custa.'),
    cz('fx_17b', 1, 7, 'Fim de semana livre e tarefa pendente. O que você faz?',
       'Resolvo a tarefa primeiro. Prazer depois, se sobrar.',
       'Aproveito primeiro. Mereço, e depois eu corro atrás.'),
    cz('fx_96a', 9, 6, 'Você evitou uma conversa difícil esta semana. Por quê?',
       'Porque atrito me tira a paz e eu prefiro deixar quieto.',
       'Porque temi a reação da pessoa e as consequências.'),
    cz('fx_96b', 9, 6, 'Uma decisão importante está parada com você. O que trava?',
       'Não sei direito o que eu quero.',
       'Fico pesando riscos e procurando garantia ou alguém que confirme.'),
    cz('fx_92a', 9, 2, 'Alguém próximo pediu ajuda, e você acabou passando o fim de semana resolvendo o problema dessa pessoa. Como foi?',
       'Nem percebi. Fui levando o que apareceu e esqueci de mim.',
       'Gostei de ser necessário, e no fundo esperava um reconhecimento.'),
    cz('fx_92b', 9, 2, 'Você ajudou alguém numa coisa grande, e ninguém agradeceu. O que fica?',
       'Quase nada. Já esqueci.',
       'Uma mágoa que eu não falo.'),
    cz('fx_95a', 9, 5, 'Você passou a noite sozinho em casa. O que fez?',
       'Comi algo, vi TV, deixei o tempo passar.',
       'Li, estudei, pensei. É ali que eu me reorganizo.'),
    cz('fx_95b', 9, 5, 'Num grupo grande de pessoas, como você fica?',
       'Me misturo e acompanho o clima, mesmo sem aparecer.',
       'Fico à margem, observando, e vou embora antes.'),
    cz('fx_94a', 9, 4, 'Alguém próximo está sofrendo. O que acontece com você?',
       'Sinto a dor dele mais do que a minha e tento não atrapalhar.',
       'A dor dele acende a minha, e eu sinto as duas com força.'),
    cz('fx_94b', 9, 4, 'Falta algo importante na sua vida hoje. Como você lida?',
       'Me conformo. Poderia ser pior.',
       'Essa falta ocupa muito espaço em mim.'),
    cz('fx_93a', 9, 3, 'Você trabalhou muito por um grupo e o resultado foi bom. O que você quer?',
       'Ver o grupo bem. Não faço questão de aparecer.',
       'Que saibam que boa parte daquilo foi minha.'),
    cz('fx_93b', 9, 3, 'Alguém pergunta onde você quer estar daqui a cinco anos. O que você responde?',
       'Não sei bem. Vou levando.',
       'Tenho metas claras e fico inquieto se não avanço.'),
    cz('fx_27a', 2, 7, 'Numa mesa de dez pessoas, qual costuma ser o seu lugar?',
       'Cuidando de alguém, puxando quem está de fora.',
       'Contando história, animando, fazendo rir.'),
    cz('fx_27b', 2, 7, 'Alguém depende muito de você há meses. Como você está?',
       'Cansado, mas me sinto importante nisso.',
       'Começando a me sentir preso e querendo espaço.'),
    cz('fx_24a', 2, 4, 'Você está precisando de carinho. O que você faz?',
       'Escondo e vou cuidar de alguém.',
       'Fica evidente, ou eu endureço para não depender de ninguém.'),
    cz('fx_24b', 2, 4, 'Em uma frase, como você se vê?',
       'Como alguém com muito a oferecer.',
       'Como alguém a quem falta algo que os outros têm.'),
    cz('fx_26a', 2, 6, 'Você é muito carinhoso com uma pessoa específica. O que isso traz para você?',
       'Um lugar especial na vida dela.',
       'Segurança. Com ela por perto eu fico mais protegido.'),
    cz('fx_26b', 2, 6, 'Uma relação sua esfriou. Qual é o primeiro sentimento?',
       'Que não estão me dando o valor que eu mereço.',
       'Medo de ficar sem apoio.'),
    cz('fx_37a', 3, 7, 'Você tem cinco projetos ao mesmo tempo. Por quê?',
       'Cada um me leva a algum lugar. Tudo tem propósito.',
       'Porque tudo me interessa e eu não quero perder nada.'),
    cz('fx_37b', 3, 7, 'Um deles fracassou publicamente. E aí?',
       'Dói na imagem e já penso em como compensar.',
       'Vejo como aprendizado e já estou em outra ideia.'),
    cz('fx_45a', 4, 5, 'Você passou três dias sem falar com ninguém. Como foi?',
       'Senti a falta de conexão com força.',
       'Foi ótimo. Não senti falta.'),
    cz('fx_45b', 4, 5, 'Você está sentindo algo muito forte. O que faz com isso?',
       'Vivo por inteiro, e transborda de algum jeito.',
       'Guardo. No máximo abro para uma pessoa em quem confio totalmente.'),
    cz('fx_46a', 4, 6, 'Alguém está sendo muito carinhoso com você. O que passa na sua cabeça?',
       'Que não mereço, ou que vai acabar como sempre acaba.',
       'O que será que a pessoa quer de mim?'),
    cz('fx_46b', 4, 6, 'De madrugada, sem sono, o que costuma estar na sua cabeça?',
       'Alguma coisa em mim que não presta, ou algo que me falta.',
       'Algo que pode dar errado, ou alguém em quem eu não deveria ter confiado.'),
    cz('fx_36a', 3, 6, 'Você está trabalhando muito além da conta. Por quê?',
       'Para mostrar resultado e ser visto como quem dá conta.',
       'Para garantir que nada dê errado e ninguém possa me culpar.'),
    cz('fx_15a', 1, 5, 'Você se afastou de um grupo recentemente. Por quê?',
       'Porque o jeito como as coisas eram feitas ali me incomodava.',
       'Porque estava consumindo a minha energia e o meu tempo.'),

    # --- v4: pares do apêndice de diagnóstico diferencial que faltavam -----
    cz('fx_35a', 3, 5, 'Um projeto prático precisa sair do papel esta semana. Como você se sai?',
       'Eu resolvo: ligo, corro atrás, entrego.',
       'Eu entendo o problema melhor que a maioria, mas colocar de pé é outra história.'),
    cz('fx_35b', 3, 5, 'Você precisa falar de um trabalho seu na frente de gente que não conhece. E aí?',
       'Eu me apresento bem. Sei como me vender.',
       'Evito. Se der para mandar por escrito, melhor.'),
    cz('fx_47a', 4, 7, 'O fim de semana foi ruim. Na segunda de manhã, como você está?',
       'Ainda pesado. Carrego aquilo comigo por uns dias.',
       'Já virei a página e estou pensando no que vem de bom.'),
    cz('fx_47b', 4, 7, 'Você se irritou com alguém esta semana. O que aconteceu?',
       'Falei, ou fechei a cara. Em mim a raiva aparece.',
       'Engoli e continuei simpático. Quase nunca deixo a raiva aparecer.'),
    cz('fx_79a', 7, 9, 'Você ficou uma hora sem nada para fazer. O que passou na sua cabeça?',
       'Mil ideias e planos, um atrás do outro.',
       'Quase nada. O tempo passou.'),
    cz('fx_79b', 7, 9, 'Você quer muito uma coisa que não pode ter agora. O que acontece?',
       'Dou um jeito, invento um caminho, consigo de outro modo.',
       'Deixo para lá. Adiar o que eu quero é fácil para mim.'),
    # --- v4: discriminadores do apêndice que o banco não usava -------------
    cz('fx_16c', 1, 6, 'Você precisa tomar uma decisão que afeta outras pessoas. Como é?',
       'Decido e assumo. Demorar demais também é erro.',
       'Fico girando entre as opções, com medo de escolher errado.'),
    cz('fx_36b', 3, 6, 'Quando bate ansiedade, em torno do que ela gira?',
       'De me expor, de ser deixado de lado, de perder o que conquistei.',
       'De errar, ou de não saber qual é o caminho certo.'),
    cz('fx_92c', 9, 2, 'Alguém demora a fazer o que combinou com você. Como você fica?',
       'Tenho paciência. Espero o tempo da pessoa.',
       'Fico impaciente e acabo cobrando, nem que seja de forma indireta.'),
    cz('fx_95c', 9, 5, 'Um amigo pede ajuda num domingo de manhã. O que você faz?',
       'Vou. Nem penso muito, e acabo ficando o dia inteiro.',
       'Ajudo no que der por mensagem. O meu domingo eu preservo.'),
]


# ===========================================================================
# FASE 3 — instinto (cenas concretas, neutras quanto ao tipo)
# ===========================================================================
def f3(id_, cen, sp, so, sx, **kw):
    return item(id_, 3, cen, [(SP, sp), (SO, so), (SX, sx)], **kw)


F3 = [
    f3('f3_01', 'Você recebeu hoje uma notícia muito boa. Qual é o seu primeiro impulso?',
       'Garantir alguma coisa com ela: guardar, resolver uma pendência, cuidar da casa.',
       'Contar para o meu grupo e pensar no que muda no meu lugar ali.',
       'Correr para contar para a pessoa mais importante para mim.', eixo='paixao'),
    f3('f3_02', 'Em que a sua cabeça fica quando você está no chuveiro, sem querer pensar em nada?',
       'No que falta em casa, em dinheiro, em saúde, no que preciso resolver.',
       'Numa conversa do grupo, em quem falou o quê, no meu lugar ali.',
       'Numa pessoa específica, no que ela disse, no que eu vou dizer.', eixo='fixacao', peso=1.3),
    f3('f3_03', 'Você tem uma noite livre e energia. Onde ela vai?',
       'Arrumo a casa, cozinho, cuido de mim, durmo cedo.',
       'Chamo o grupo, vou a um encontro, respondo o que está parado.',
       'Chamo aquela pessoa, ou mergulho em algo que me absorve por completo.'),
    f3('f3_04', 'Numa festa com muita gente, onde você acaba?',
       'Num canto confortável, perto da comida, poupando energia.',
       'Circulando, sentindo quem é quem e onde eu me encaixo.',
       'Numa conversa longa com uma pessoa só, esquecendo o resto.', dominio='amizade', opcional=True),
    f3('f3_05', 'Um amigo íntimo diz que você exagera em alguma área. Qual crítica você já ouviu?',
       '“Você se preocupa demais com dinheiro, comida, conforto e saúde.”',
       '“Você se importa demais com o grupo e com o seu lugar nele.”',
       '“Você se joga inteiro em uma pessoa de cada vez.”', eixo='fixacao', peso=1.3, indireto=True),
    f3('f3_06', 'Você começou a namorar. O que você checa primeiro, mesmo sem perceber?',
       'Se a relação cabe na minha vida sem bagunçar minha rotina e meu bolso.',
       'Como essa pessoa se encaixa com meus amigos e minha família.',
       'Se tem química de verdade e se ela se entrega tanto quanto eu.', dominio='romance', opcional=True),
    f3('f3_07', 'Você passou por semanas difíceis e finalmente tem um fim de semana. O que mais ajuda você a se recuperar?',
       'Casa, comida boa, sono, corpo em ordem.',
       'Estar com o meu grupo, sentir que faço parte.',
       'Estar grudado em alguém, ou mergulhado em algo que me acende.', opcional=True),
    f3('f3_08', 'Qual exagero dos outros você entende mais facilmente?',
       'Quem organiza a vida toda em torno de não faltar nada: casa, comida, dinheiro, saúde.',
       'Quem vive para o grupo ou para uma causa.',
       'Quem se entrega inteiro a uma pessoa só.', eixo='fixacao', peso=1.3, indireto=True, opcional=True),
    f3('f3_09', 'Você chega a um lugar novo. O que você repara primeiro, sem querer?',
       'Se é confortável: onde sentar, se está frio ou calor, se tem o que comer.',
       'Quem é quem, quem manda, qual é o clima entre as pessoas.',
       'Quem me chamou a atenção ali.', eixo='paixao'),
    f3('f3_10', 'Você tem um dinheiro guardado que dá para uma escolha só. Qual você faz?',
       'Reformo algo da casa ou reforço a reserva.',
       'Financio uma viagem ou um evento com o meu grupo.',
       'Uso com a pessoa que mais importa para mim, ou com o que me apaixona.', opcional=True),
    f3('f3_11', 'Numa semana difícil, qual preocupação volta mais vezes à sua cabeça?',
       'Dinheiro, saúde, casa, o básico faltando.',
       'Ter ficado de fora, ter perdido meu lugar ou meu papel.',
       'Uma pessoa. A relação, a distância, o que ela sente por mim.', eixo='fixacao', peso=1.3),
    f3('f3_12', 'Numa viagem com amigos, o que faria a viagem dar errado para você?',
       'Dormir mal, comer mal, ficar sem dinheiro no meio.',
       'O grupo rachar ou eu ficar de fora das decisões.',
       'Não ter nenhum momento intenso com ninguém, tudo morno.', dominio='amizade', opcional=True),
]
F3_DES = [
    item('f3d_as', 3, 'Você tem que escolher entre duas ofertas de emprego. Qual argumento pesa mais?', [
        (SP, 'Estabilidade, salário garantido e previsibilidade.'),
        (SO, 'O time, o ambiente e o lugar que eu ocupo no grupo.'),
    ], eixo='fixacao', peso=1.4, separa=[SP, SO]),
    item('f3d_sx', 3, 'Você só pode manter uma coisa: o seu grupo de amigos ou a sua relação mais intensa. Qual?', [
        (SO, 'O grupo. Sem eles eu fico sem chão.'),
        (SX, 'A relação. Sem ela nada tem graça.'),
    ], eixo='fixacao', peso=1.4, separa=[SO, SX]),
    item('f3d_ax', 3, 'Você está em crise. Para onde você corre?', [
        (SP, 'Para o concreto: dinheiro, casa, o que me sustenta.'),
        (SX, 'Para a pessoa mais importante para mim. Quero ficar perto dela.'),
    ], eixo='fixacao', peso=1.4, separa=[SP, SX]),
]


# ===========================================================================
# FASE 4 — subtipo dentro do tipo, em cenas
# ===========================================================================
def f4(tipo, n, cen, sp, so, sx):
    return item(f'f4_{tipo}{n}', 4, cen, [(SP, sp), (SO, so), (SX, sx)], eixo='fixacao', peso=1.4, tipo_alvo=tipo)


F4 = {
 1: [f4(1, 'a', 'Quando alguma coisa está errada, para onde vai a sua correção?',
        'Para mim. Eu me cobro, me preocupo e tento prevenir tudo.',
        'Para o mundo. Vejo o que está errado na sociedade e sinto que tenho o que ensinar.',
        'Para quem está perto. Quero que a pessoa melhore, e cobro com intensidade.'),
     f4(1, 'b', 'Alguém vê você irritado. O que essa pessoa vê?',
        'Quase nada. Vira preocupação, pressa e cara fechada.',
        'Frieza, distância e um comentário cortante.',
        'Voz alta e indignação aberta.'),
     f4(1, 'c', 'O que você não suportaria que dissessem de você?',
        'Que você é irresponsável e não cuidou do que era seu.',
        'Que você é vulgar, sem princípios ou mal-educado.',
        'Que você é omisso e deixou passar o que era errado.')],
 2: [f4(2, 'a', 'Do que você mais sente falta quando está sozinho?',
        'De alguém que cuide de mim e me mime.',
        'Do movimento: gente me procurando, eventos, meu telefone tocando.',
        'Daquela pessoa específica, do desejo dela por mim.'),
     f4(2, 'b', 'Como você conquista alguém de quem gosta?',
        'Com doçura e um jeito meio de criança que desperta cuidado.',
        'Com contatos, conselhos e ajudas que abrem portas.',
        'Com charme, presença e atenção total.'),
     f4(2, 'c', 'Você pediu algo e a pessoa disse não. O que você faz?',
        'Fico emburrado ou faço birra. Depois de tudo que eu fiz, era o mínimo.',
        'Uso a minha posição para conseguir de outro jeito.',
        'Insisto, pressiono ou explodo. Não aceito bem um não.')],
 3: [f4(3, 'a', 'Você vai a um evento importante da sua área. Qual é o seu objetivo ali?',
        'Resolver o que precisa e sair com tudo encaminhado.',
        'Ser visto pelas pessoas certas.',
        'Estar impecável e causar boa impressão em quem me interessa.'),
     f4(3, 'b', 'Onde você gasta mais energia hoje?',
        'No trabalho e em deixar tudo garantido.',
        'Em crescer, aparecer e subir no meu meio.',
        'Na minha aparência e na minha relação.'),
     f4(3, 'c', 'Alguém chama você de vaidoso. Qual é a sua reação?',
        'Acho injusto. Eu nem ligo para aparecer.',
        'Acho natural. Eu gosto de mostrar o que conquistei.',
        'Me pega. Eu cuido muito da imagem, mas para ser amado, não para me exibir.')],
 4: [f4(4, 'a', 'Você está com aquela sensação de falta. O que você faz com ela?',
        'Trabalho mais, aguento e não peço nada.',
        'Me comparo, sinto vergonha e me recolho.',
        'Cobro do outro, compito ou ataco.'),
     f4(4, 'b', 'Quando você está sofrendo, o que as pessoas ao redor veem?',
        'Nada. Eu aguento calado e sigo funcionando.',
        'Tudo. Meu rosto, meu choro, o clima.',
        'Raiva. Sobra para quem estiver perto.'),
     f4(4, 'c', 'No amor, qual destas cenas é mais a sua?',
        'Eu cuidando de tudo e não deixando ninguém cuidar de mim.',
        'Eu com medo de não ser suficiente e me escondendo.',
        'Eu disputando o lugar de preferido, com ciúme e cobrança.')],
 5: [f4(5, 'a', 'Você teve um dia muito exigente. O que faz você voltar ao normal?',
        'Meu canto, minhas coisas, ninguém me pedindo nada.',
        'Ler, estudar, entender algo que me interessa.',
        'Conversar longamente com a única pessoa em quem confio.'),
     f4(5, 'b', 'O que você menos empresta a alguém?',
        'Minhas coisas, meu espaço, meu tempo.',
        'O que eu sei e levei anos para juntar.',
        'A minha intimidade, o que eu só conto para uma pessoa.'),
     f4(5, 'c', 'Alguém quebra a sua confiança. O que acontece?',
        'Me fecho e diminuo o contato até quase sumir.',
        'Perco o respeito intelectual por essa pessoa.',
        'Desabo por dentro. Era justamente a pessoa em quem eu confiava.')],
 6: [f4(6, 'a', 'Você está com medo de verdade. O que faz?',
        'Procuro alguém forte e caloroso para ficar perto.',
        'Sigo regra, protocolo, o que está previsto.',
        'Enfrento primeiro, para ninguém ver o medo.'),
     f4(6, 'b', 'Seu chefe cometeu um erro claro. O que você faz?',
        'Não falo nada. Preciso da boa relação com ele.',
        'Aponto o procedimento correto, sem atacar a pessoa.',
        'Falo na cara, mesmo sabendo que vai dar problema.'),
     f4(6, 'c', 'Como as pessoas costumam ver você?',
        'Como alguém doce, que evita briga.',
        'Como alguém sério, correto e às vezes rígido.',
        'Como alguém forte, que não se intimida.')],
 7: [f4(7, 'a', 'Sobrou um dinheiro e você vai usar com prazer. Em quê?',
        'Em algo concreto e bom para mim e para os meus: comida, casa, um agrado.',
        'Em algo que envolva um grupo, uma causa, gente junto.',
        'Em uma experiência nova que eu venho sonhando.'),
     f4(7, 'b', 'Como as pessoas descreveriam você?',
        'Esperto, prático, bom de se ter por perto.',
        'Generoso, idealista, preocupado com os outros.',
        'Sonhador, entusiasmado, cheio de planos.'),
     f4(7, 'c', 'Alguma coisa frustrou você hoje. Para onde você vai?',
        'Para um prazer concreto e para o meu círculo.',
        'Para o serviço aos outros. Adio o que eu queria.',
        'Para uma fantasia ou paixão nova.')],
 8: [f4(8, 'a', 'Um problema sério cai no seu colo. Como você lida com ele?',
        'Resolvo sozinho, do meu jeito, sem pedir ajuda e sem muita conversa.',
        'Assumo o comando. As pessoas olham para mim, e eu protejo quem está do meu lado.',
        'Quero a pessoa que é minha inteira do meu lado, e fico de olho em tudo.'),
     f4(8, 'b', 'O que deixa você fora de si?',
        'Mexerem no meu sustento, no meu espaço, nas minhas coisas.',
        'Alguém do meu grupo ser desleal, ou alguém machucar um dos meus.',
        'Tentarem tirar de mim quem é meu, ou a pessoa não se entregar por inteiro.'),
     f4(8, 'c', 'Sexta à noite, depois de um dia difícil. O que é prazer para você?',
        'Comida boa, a minha casa, as minhas coisas, ninguém me pedindo nada.',
        'Reunir a minha turma, gente de confiança, e ser quem comanda a noite.',
        'Intensidade com alguém, a noite inteira, sem limite.')],
 9: [f4(9, 'a', 'Você tem duas horas livres e nada pendente. Como elas passam?',
        'Comida boa, descanso e o meu canto do jeito que eu gosto.',
        'Acabo resolvendo algo para alguém ou indo a algum encontro.',
        'Com uma pessoa, perto ou conversando por mensagem, sem ver a hora passar.'),
     f4(9, 'b', 'Onde você se sente em casa?',
        'Na minha rotina e nas minhas coisas.',
        'Fazendo parte de algo, com gente ao redor.',
        'Junto de uma pessoa específica, quase como se eu fosse parte dela.'),
     f4(9, 'c', 'Quando você sonha acordado, com o que sonha?',
        'Com coisas práticas: a casa, uma viagem, um conserto.',
        'Com o grupo, um projeto coletivo, ser útil.',
        'Com uma pessoa, uma cena romântica, detalhe por detalhe.')],
}

banco = {
    "_meta": {
        "descricao": "Banco de perguntas do teste de eneagrama (v3, cenas concretas).",
        "principio_cobertura": "REGRA DE OURO: (1) todo item e uma SITUACAO concreta, nao uma auto-avaliacao: a pessoa responde com uma lembranca ou uma reacao, nao com uma teoria sobre si mesma; (2) o enunciado fixa a situacao e as alternativas variam a motivacao; (3) na Fase 1 cada item tem exatamente uma alternativa por tipo, com o mesmo eixo e o mesmo peso; nas Fases 2 e 4 cada tipo tem o mesmo numero de alternativas, e uma delas e sempre do subtipo menos parecido com o estereotipo; (4) nenhuma alternativa pode ser respondida com 'depende': cada uma e uma resposta inteira; (5) toda pergunta oferece 'Nenhuma dessas se parece comigo', que nao pontua e entra no indice de confiabilidade.",
        "infancia": "Os itens de infancia e de crenca formada seguem os capitulos de infancia dos livros de subtipos de Naranjo e a etiologia descrita em Caracter e neurose: a cena familiar concreta primeiro, a conclusao que a crianca tirou dela depois.",
        "eixos": {"fixacao": "distorcao cognitiva, peso maior", "paixao": "reacao passional, sensivel ao tempo", "emocao": "emocao reativa de base"},
        "triades": {"instintiva": [8, 9, 1], "emocional": [2, 3, 4], "mental": [5, 6, 7]},
        "instintos": [SP, SO, SX],
        "fluxo": "Fase 1 pontua triade E tipo. Fase 2 aplica os itens da triade vencedora (e das triades dos tipos fortes) mais itens cruzados. Fase 3 pontua o instinto. Fase 4 confirma o subtipo dentro do tipo encontrado.",
        "itens_opcionais": "Itens marcados com 'opcional': true saem primeiro no modo curto (limites em FLUXO). Continuam no banco.",
        "nota_calibracao": "Pesos e limiares sao heuristicas ajustaveis, nao validadas por amostra. Sem travessoes.",
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
assert len(ids) == len(set(ids)), [k for k, v in Counter(ids).items() if v > 1]
for it in todos:
    txt = it['cenario'] + ''.join(a['texto'] for a in it['alternativas'])
    assert '—' not in txt and '–' not in txt, ('travessao', it['id'])
    ativos = [a for a in it['alternativas'] if not a.get('nula')]
    assert len({(a['eixo'], a['peso']) for a in ativos}) == 1, ('eixo/peso desigual', it['id'])
    assert not any(a['texto'].lower().startswith('depende') for a in ativos), ('depende', it['id'])
for it in F1:
    ts = sorted(a['mapa']['tipo'] for a in it['alternativas'] if not a.get('nula'))
    assert ts == list(range(1, 10)), it['id']
for tri, lst in banco['fase2'].items():
    for it in lst:
        c = Counter(a['mapa']['tipo'] for a in it['alternativas'] if not a.get('nula'))
        assert len(set(c.values())) == 1 and len(c) == 3, it['id']
for t, lst in F4.items():
    for it in lst:
        ins = sorted(a['mapa']['instinto'] for a in it['alternativas'] if not a.get('nula'))
        assert ins == [SP, SX, SO], it['id']

out = sys.argv[1] if len(sys.argv) > 1 else 'questions.json'
json.dump(banco, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok', out, 'itens:', len(todos), '| f1', len(F1), '| f2',
      sum(len(v) for v in banco['fase2'].values()), '| cruz', len(CRUZ),
      '| f3', len(F3), '| f4', sum(len(v) for v in F4.values()))
